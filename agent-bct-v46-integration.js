/* Agent BCT — V46 live integration bridge
   SAFE ISOLATED WORKSTREAM: connects the existing V46 systems to the 14-role contract.
   No new tables, queues, auth, credential stores, estimator stores, bidding stores, or approval paths.
*/
(function(){
  'use strict';

  const VERSION='Agent-BCT-V46-Live-Integration-Bridge-2026.10.07-1';
  const CONTRACT=window.BCT_AGENT_14_ROLE_INTEGRATION;
  if(!CONTRACT) throw new Error('Agent BCT 14-role contract must load before the V46 integration bridge.');

  const HANDOFFS=CONTRACT.HANDOFFS;
  const history=[];
  let wrappedEstimator=false;

  function record(source,target,type,payload){
    const allowed=(HANDOFFS[source]||[]).includes(target);
    const item={at:new Date().toISOString(),source,target,type:type||'handoff',allowed,payload:payload||null};
    history.unshift(item);
    if(history.length>100)history.length=100;
    window.dispatchEvent(new CustomEvent('bct:agent-role-handoff',{detail:item}));
    return item;
  }

  function handoff(source,target,type,payload){
    if(!CONTRACT.getRole(source)||!CONTRACT.getRole(target)) throw new Error('Unknown Agent BCT role.');
    return record(source,target,type,payload);
  }

  function roleOf(user){
    return String(user?.app_metadata?.role||user?.app_metadata?.bct_role||'').trim().toLowerCase();
  }

  async function credentialState(user){
    if(!window.supabaseClient?.rpc) return {available:false,reason:'Supabase client unavailable.'};
    const r=await window.supabaseClient.rpc('bct_my_contractor_credentials');
    if(r?.error) return {available:false,reason:r.error.message||'Credential lookup failed.'};
    const rows=Array.isArray(r?.data)?r.data:(r?.data?[r.data]:[]);
    const required=['general_liability','bond','license_registration'];
    const byType=Object.fromEntries(rows.map(x=>[String(x.credential_type||x.type||'').toLowerCase(),x]));
    const missing=required.filter(k=>!byType[k]);
    const workersCompSatisfied=!!(byType.workers_comp||byType.workers_comp_exemption);
    if(!workersCompSatisfied) missing.push('workers_comp_or_exemption');
    const blocked=rows.some(x=>['expired','rejected','unverified'].includes(String(x.status||'').toLowerCase()));
    const ready=!missing.length&&!blocked;
    const result={available:true,ready,missing,blocked,rows};
    record('credential_compliance','contractor_manager','credential_readiness',{
      ready,missing,blocked,userId:user?.id||null
    });
    return result;
  }

  async function evaluateCurrentUser(){
    const session=await window.supabaseClient?.auth?.getSession?.();
    const user=session?.data?.session?.user;
    const role=roleOf(user);
    if(role==='contractor') return {role,credentials:await credentialState(user)};
    if(role==='estimator'){
      const result={role,estimatorSystem:!!window.BCT_ESTIMATOR_SYSTEM,canAccess:!!window.BCT_ESTIMATOR_SYSTEM?.canEstimatorAccess?.(user)};
      record('estimator','job_coordinator','estimator_readiness',result);
      return result;
    }
    return {role:role||null};
  }

  function estimatorRemoteEstimate(project){
    const result=window.BCT_ESTIMATOR_SYSTEM?.remoteEstimateFirst?.(project);
    if(!result) return null;
    record('estimator',result.next==='assessment_required'?'escalation_human_review':'job_coordinator','estimate_path',result);
    return result;
  }

  function contractorBidGate(input){
    const result=window.BCT_ESTIMATOR_SYSTEM?.mayContractorBid?.(input);
    if(!result) return {allowed:false,reason:'Existing V46 estimator eligibility system is unavailable.'};
    record('contractor_manager',result.allowed?'job_coordinator':'escalation_human_review','bid_eligibility',result);
    return result;
  }

  function wrapEstimator(){
    if(wrappedEstimator||!window.BCT_ESTIMATOR_SYSTEM?.mayContractorBid)return;
    const original=window.BCT_ESTIMATOR_SYSTEM.mayContractorBid;
    window.BCT_ESTIMATOR_SYSTEM.mayContractorBid=function(input){
      const result=original(input);
      record('contractor_manager',result.allowed?'job_coordinator':'escalation_human_review','bid_eligibility',result);
      return result;
    };
    wrappedEstimator=true;
  }

  function snapshot(){
    return {
      version:VERSION,
      contractVersion:CONTRACT.VERSION,
      roleCount:CONTRACT.ROLES.length,
      connectedSystems:[
        'contractor_credentials_board',
        'contractor_bid_guard',
        'estimator_system',
        'estimator_portal',
        'estimator_admin',
        'admin_control_board'
      ],
      duplicateSystemsCreated:false,
      productionChanged:false,
      recentHandoffs:history.slice(0,20)
    };
  }

  function init(){
    wrapEstimator();
    window.addEventListener('bct:agent-role-handoff',()=>{});
    if(window.supabaseClient?.auth?.onAuthStateChange){
      window.supabaseClient.auth.onAuthStateChange(function(event,session){
        if(event==='SIGNED_IN'||event==='INITIAL_SESSION') setTimeout(()=>evaluateCurrentUser().catch(()=>{}),0);
      });
    }
  }

  window.BCT_AGENT_V46_INTEGRATION=Object.freeze({
    VERSION,handoff,evaluateCurrentUser,credentialState,estimatorRemoteEstimate,contractorBidGate,snapshot,init
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();