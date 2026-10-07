/* Agent BCT — V46 role orchestrator adapter
   SAFE ISOLATED WORKSTREAM: adapter only.
   It consumes existing V46 events/globals when present and never creates a second source of truth.
*/
(function(){
  'use strict';
  const CONTRACT=window.BCT_AGENT_14_ROLE_INTEGRATION;
  const BRIDGE=window.BCT_AGENT_V46_INTEGRATION;
  if(!CONTRACT||!BRIDGE) throw new Error('Agent BCT role contract and integration bridge must load first.');

  const VERSION='Agent-BCT-V46-Role-Orchestrator-2026.10.07-2';
  const listeners=[];
  const stats=Object.fromEntries(CONTRACT.ROLE_IDS.map(id=>[id,{received:0,forwarded:0,escalated:0}]));

  function existing(name){ return typeof window[name]==='function'; }

  function safeSnapshot(){
    const base=BRIDGE.snapshot();
    return Object.freeze({...base,version:VERSION,adapterOnly:true,existingV46Hooks:{
      estimatorSystem:!!window.BCT_ESTIMATOR_SYSTEM,
      supabaseClient:!!window.supabaseClient,
      adminControlBoard:existing('setVisibleView')||!!document.querySelector('[data-admin-page-panel]')
    }});
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
    const result=dispatch(source,'escalation_human_review','human_review',Object.assign({reason},payload||{}));
    if(result.ok) stats[source].escalated++;
    return result;
  }

  function routeChain(source,type,payload){
    const targets=CONTRACT.handoffsFrom(source);
    const results=targets.map(target=>dispatch(source,target,type,payload));
    return {source,type,results,ok:results.every(r=>r.ok)};
  }

  function routeProjectLifecycle(payload){
    const p=payload||{}, results=[];
    results.push(...routeChain('job_coordinator','job_lifecycle',p).results);
    results.push(...routeChain('project_manager','project_lifecycle',p).results);
    return {ok:results.every(r=>r.ok),results};
  }

  function routeChangeOrder(payload){
    const p=payload||{};
    if(CONTRACT.requiresHuman(p.action||'change_order_approval')){
      return escalate('change_order_manager',p.action||'change_order_approval',p);
    }
    return routeChain('change_order_manager','change_order',p);
  }

  function routeMaterials(payload){ return routeChain('materials_logistics','materials_logistics',payload||{}); }
  function routeCommunication(payload){ return routeChain('communication_translation','communication',payload||{}); }

  function routeFinance(payload){
    const p=payload||{};
    if(CONTRACT.requiresHuman(p.action||'')) return escalate('finance_payment',p.action,p);
    return routeChain('finance_payment','finance_payment',p);
  }

  function routeClaim(payload){ return routeChain('claims_assistant','claims_evidence',payload||{}); }
  function routeAnalytics(payload){ return routeChain('analytics_reporting','analytics',payload||{}); }

  const EVENT_SOURCES=Object.freeze({
    'bct:job-created':'job_coordinator',
    'bct:job-updated':'job_coordinator',
    'bct:assignment-updated':'job_coordinator',
    'bct:credential-updated':'credential_compliance',
    'bct:estimate-updated':'estimator',
    'bct:change-order-updated':'change_order_manager',
    'bct:payment-updated':'finance_payment',
    'bct:project-photo-updated':'safety_quality',
    'bct:safety-alert':'safety_quality',
    'bct:message-sent':'communication_translation',
    'bct:material-updated':'materials_logistics',
    'bct:claim-evidence-updated':'claims_assistant'
  });

  function ingest(event){
    const detail=event?.detail||{};
    const source=String(detail.source||detail.role||EVENT_SOURCES[event?.type]||'').trim();
    const target=String(detail.target||'').trim();
    if(!CONTRACT.getRole(source)) return;
    stats[source].received++;
    if(detail.requiresHuman||CONTRACT.requiresHuman(detail.action)){
      escalate(source,detail.action||'human_review_required',detail);
      return;
    }
    if(target&&CONTRACT.getRole(target)){
      dispatch(source,target,detail.type||'handoff',detail.payload||detail);
      return;
    }
    routeChain(source,detail.type||'handoff',detail.payload||detail);
  }

  function attach(){
    if(listeners.length) return;
    const names=[
      'bct:job-created','bct:job-updated','bct:assignment-updated',
      'bct:credential-updated','bct:estimate-updated','bct:change-order-updated',
      'bct:payment-updated','bct:project-photo-updated','bct:safety-alert',
      'bct:message-sent','bct:material-updated','bct:claim-evidence-updated'
    ];
    for(const name of names){ window.addEventListener(name,ingest); listeners.push([name,ingest]); }
    const photoComplete=e=>{
      const payload=e?.detail||{};
      dispatch('safety_quality','claims_assistant','photo_evidence_ready',payload);
      dispatch('safety_quality','analytics_reporting','photo_evidence_observed',payload);
    };
    const photoRequest=e=>dispatch('safety_quality','claims_assistant','photo_review_requested',e?.detail||{});
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
    return {version:VERSION,roleCount:CONTRACT.ROLES.length,totalEventsObserved:total,stats,attached:listeners.length>0,productionChanged:false,eventSources:Object.keys(EVENT_SOURCES).length};
  }

  window.BCT_AGENT_V46_ROLE_ORCHESTRATOR=Object.freeze({
    VERSION,dispatch,escalate,routeChain,routeProjectLifecycle,routeChangeOrder,
    routeMaterials,routeCommunication,routeFinance,routeClaim,routeAnalytics,
    EVENT_SOURCES,attach,detach,health,snapshot:safeSnapshot
  });
  attach();
})();
