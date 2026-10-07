/* Agent BCT — V46 role orchestration adapter
   SAFE ISOLATED WORKSTREAM: adapter only.
   It consumes existing V46 events/globals when present and never creates a second source of truth.
*/
(function(){
  'use strict';
  const CONTRACT=window.BCT_AGENT_14_ROLE_INTEGRATION;
  const BRIDGE=window.BCT_AGENT_V46_INTEGRATION;
  if(!CONTRACT||!BRIDGE) throw new Error('Agent BCT role contract and integration bridge must load first.');

  const VERSION='Agent-BCT-V46-Role-Orchestrator-2026.10.07-1';
  const listeners=[];
  const stats=Object.fromEntries(CONTRACT.ROLE_IDS.map(id=>[id,{received:0,forwarded:0,escalated:0}]));

  function existing(name){
    return typeof window[name]==='function';
  }

  function safeSnapshot(){
    const base=BRIDGE.snapshot();
    return Object.freeze({
      ...base,
      version:VERSION,
      adapterOnly:true,
      existingV46Hooks:{
        estimatorSystem:!!window.BCT_ESTIMATOR_SYSTEM,
        supabaseClient:!!window.supabaseClient,
        adminControlBoard:existing('setVisibleView')||!!document.querySelector('[data-admin-page-panel]')
      }
    });
  }

  function dispatch(source,target,type,payload){
    if(!CONTRACT.getRole(source)||!CONTRACT.getRole(target)) return {ok:false,reason:'unknown_role'};
    const item=BRIDGE.handoff(source,target,type,payload);
    if(!item.allowed) return {ok:false,reason:'handoff_not_allowed',item};
    stats[source].forwarded++;
    const detail={...item,adapterVersion:VERSION};
    window.dispatchEvent(new CustomEvent('bct:agent-role-dispatch',{detail}));
    return {ok:true,item:detail};
  }

  function escalate(source,reason,payload){
    if(!CONTRACT.getRole(source)) return {ok:false,reason:'unknown_role'};
    stats[source].escalated++;
    return dispatch(source,'escalation_human_review','human_review',Object.assign({reason},payload||{}));
  }

  function ingest(event){
    const detail=event?.detail||{};
    const source=String(detail.source||detail.role||'').trim();
    const target=String(detail.target||'').trim();
    if(!CONTRACT.getRole(source)) return;
    stats[source].received++;
    if(detail.requiresHuman||CONTRACT.requiresHuman(detail.action)){
      escalate(source,detail.action||'human_review_required',detail);
      return;
    }
    if(target&&CONTRACT.getRole(target)){
      dispatch(source,target,detail.type||'handoff',detail.payload||detail);
    }
  }

  function attach(){
    if(listeners.length) return;
    const names=['bct:job-created','bct:job-updated','bct:assignment-updated','bct:credential-updated','bct:estimate-updated','bct:change-order-updated','bct:payment-updated','bct:project-photo-updated','bct:safety-alert','bct:message-sent'];
    for(const name of names){
      const fn=ingest;
      window.addEventListener(name,fn);
      listeners.push([name,fn]);
    }
    const photoComplete=e=>{
      const payload=e?.detail||{};
      dispatch('safety_quality','claims_assistant','photo_evidence_ready',payload);
      dispatch('safety_quality','analytics_reporting','photo_evidence_observed',payload);
    };
    const photoRequest=e=>{
      const payload=e?.detail||{};
      dispatch('safety_quality','claims_assistant','photo_review_requested',payload);
    };
    window.addEventListener('bct-agent-photo-upload-complete',photoComplete);
    window.addEventListener('bct-agent-photo-request',photoRequest);
    listeners.push(['bct-agent-photo-upload-complete',photoComplete],['bct-agent-photo-request',photoRequest]);
  }

  function detach(){
    for(const [name,fn] of listeners) window.removeEventListener(name,fn);
    listeners.length=0;
  }

  function health(){
    const total=Object.values(stats).reduce((n,x)=>n+x.received,0);
    return {version:VERSION,roleCount:CONTRACT.ROLES.length,totalEventsObserved:total,stats,attached:listeners.length>0,productionChanged:false};
  }

  window.BCT_AGENT_V46_ROLE_ORCHESTRATOR=Object.freeze({
    VERSION,dispatch,escalate,attach,detach,health,snapshot:safeSnapshot
  });
  attach();
})();