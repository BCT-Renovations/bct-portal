/* Agent BCT — V46 14-role integration contract
   SAFE ISOLATED WORKSTREAM: this file defines orchestration contracts only.
   It does not create duplicate data stores, auth, credential boards, estimator systems,
   bidding systems, payment systems, messaging systems, or approval systems.
*/
(function(){
  'use strict';

  const VERSION='Agent-BCT-14-role-integration-V46-2026.10.07-1';

  const ROLES=[
    {id:'credential_compliance',name:'Credential & Compliance',authority:'recommend',systems:['contractor_credentials_board','contractor_bid_guard','safety_compliance'],outputs:['credential_status','expiration_alert','bid_eligibility'],escalate:['expired_required_credential','jurisdiction_uncertain','document_verification_failure']},
    {id:'job_coordinator',name:'Job Coordinator',authority:'coordinate',systems:['job_lifecycle','job_health','assignments','service_calls'],outputs:['next_action','assignment_readiness','job_attention'],escalate:['blocked_workflow','conflicting_assignment','manual_exception']},
    {id:'estimator',name:'Estimator',authority:'recommend',systems:['estimator_system','estimator_portal','ai_estimating'],outputs:['remote_estimate_path','assessment_required','assessment_readiness'],escalate:['insufficient_evidence','assessment_review','pricing_approval']},
    {id:'contractor_manager',name:'Contractor Manager',authority:'recommend',systems:['contractor_onboarding','credential_board','contractor_bids','safety_training'],outputs:['contractor_match','eligibility','performance_attention'],escalate:['credential_hold','safety_hold','trade_or_jurisdiction_mismatch']},
    {id:'homeowner_support',name:'Homeowner Support',authority:'assist',systems:['homeowner_portal','project_submission','safe_estimate_summary','messaging'],outputs:['customer_guidance','status_explanation','next_step'],escalate:['complaint','dispute','money_question','contract_question']},
    {id:'project_manager',name:'Project Manager',authority:'coordinate',systems:['job_health','milestones','assignments','closeout'],outputs:['project_status','milestone_attention','completion_readiness'],escalate:['schedule_risk','quality_risk','scope_conflict']},
    {id:'change_order_manager',name:'Change Order Manager',authority:'recommend',systems:['change_orders','approvals','escrow','job_documents'],outputs:['change_order_summary','evidence_check','approval_needed'],escalate:['price_dispute','scope_dispute','missing_approval']},
    {id:'claims_assistant',name:'Claims Assistant',authority:'prepare',systems:['project_photos','documents','job_history','live_project_verification'],outputs:['claim_evidence_package','missing_evidence','timeline_summary'],escalate:['coverage_question','legal_question','fraud_suspicion','filing_decision']},
    {id:'safety_quality',name:'Safety & Quality',authority:'recommend',systems:['safety_training','quality_audit','live_project_verification','photos'],outputs:['safety_attention','quality_attention','evidence_gap'],escalate:['immediate_hazard','serious_quality_failure','admin_hold']},
    {id:'materials_logistics',name:'Materials & Logistics',authority:'coordinate',systems:['materials','returns','job_milestones','weather_impact'],outputs:['material_status','delivery_attention','return_attention'],escalate:['material_shortage','unsafe_delivery','unapproved_cost']},
    {id:'finance_payment',name:'Finance & Payment',authority:'explain',systems:['financing','escrow','payments','estimate_summary'],outputs:['payment_status','financing_status','customer_safe_balance'],escalate:['payment_dispute','refund_request','escrow_release','pricing_authority']},
    {id:'communication_translation',name:'Communication & Translation',authority:'assist',systems:['messaging','notification_dispatch','locale_bundles','translation_fields'],outputs:['translated_message','notification_status','language_preference'],escalate:['consent_issue','sensitive_message','provider_failure']},
    {id:'analytics_reporting',name:'Analytics & Reporting',authority:'report',systems:['job_health','operational_readiness','audit','performance_history'],outputs:['trend','exception_report','readiness_summary'],escalate:['data_integrity_issue','security_signal','audit_gap']},
    {id:'escalation_human_review',name:'Escalation & Human Review',authority:'route',systems:['admin_control_board','approvals','audit','operational_readiness'],outputs:['admin_queue_item','approval_request','human_review_reason'],escalate:['pricing','contract','dispute','money','legal','safety','credential_override']}
  ];

  const ROLE_IDS=Object.freeze(ROLES.map(r=>r.id));

  const HANDOFFS=Object.freeze({
    credential_compliance:['contractor_manager','job_coordinator','safety_quality'],
    job_coordinator:['project_manager','contractor_manager','communication_translation'],
    estimator:['project_manager','contractor_manager','escalation_human_review'],
    contractor_manager:['credential_compliance','job_coordinator','safety_quality'],
    homeowner_support:['communication_translation','finance_payment','escalation_human_review'],
    project_manager:['change_order_manager','materials_logistics','safety_quality','communication_translation'],
    change_order_manager:['finance_payment','project_manager','escalation_human_review'],
    claims_assistant:['safety_quality','analytics_reporting','escalation_human_review'],
    safety_quality:['job_coordinator','contractor_manager','escalation_human_review'],
    materials_logistics:['project_manager','finance_payment','communication_translation'],
    finance_payment:['homeowner_support','change_order_manager','escalation_human_review'],
    communication_translation:['homeowner_support','contractor_manager','escalation_human_review'],
    analytics_reporting:['job_coordinator','project_manager','escalation_human_review'],
    escalation_human_review:[]
  });

  const NEVER_AUTO_DECIDE=Object.freeze([
    'customer_selects_contractor_by_bid',
    'credential_approval',
    'credential_override',
    'ai_estimate_approval',
    'customer_facing_price_release',
    'contract_approval',
    'change_order_approval',
    'escrow_release',
    'payment_dispute_resolution',
    'claims_filing',
    'legal_decision',
    'safety_hold_clearance',
    'public_photo_or_gallery_publish'
  ]);

  function getRole(id){return ROLES.find(r=>r.id===id)||null;}
  function handoffsFrom(id){return HANDOFFS[id]||[];}
  function canAct(roleId,action){
    const role=getRole(roleId); if(!role)return false;
    if(action==='recommend'||action==='assist'||action==='coordinate'||action==='prepare'||action==='explain'||action==='report'||action==='route')return true;
    return false;
  }
  function requiresHuman(action){
    return NEVER_AUTO_DECIDE.includes(String(action||''));
  }
  function integrationSnapshot(){
    return {
      version:VERSION,
      roleCount:ROLES.length,
      roleIds:ROLE_IDS.slice(),
      duplicateSystemsCreated:false,
      sharedSourceOfTruth:true,
      adminRemainsFinalAuthority:true,
      translationRequired:true,
      privateCustomerProjectPhotos:true,
      humanReviewActions:NEVER_AUTO_DECIDE.slice()
    };
  }

  function safeGlobal(name){try{return typeof window[name]!=='undefined'?window[name]:undefined}catch(_){return undefined}}
  function liveContext(){
    const estimator=safeGlobal('BCT_ESTIMATOR_SYSTEM');
    const managedJob=(()=>{try{return typeof activeManagedJob!=='undefined'?activeManagedJob:null}catch(_){return null}})();
    const credentialNodes=[...document.querySelectorAll('.bct-credential-green,.bct-credential-yellow,.bct-credential-red')];
    const credentialHealth=credentialNodes.reduce((out,node)=>{
      if(node.classList.contains('bct-credential-red'))out.red++;
      else if(node.classList.contains('bct-credential-yellow'))out.yellow++;
      else out.green++;
      return out;
    },{green:0,yellow:0,red:0});
    return {
      version:VERSION,
      existingSystems:{
        credentialBoard:credentialNodes.length>0,
        estimatorSystem:!!estimator,
        jobCoordinator:!!managedJob||!!document.getElementById('jobManagementPanel'),
        contractorWorkflow:!!document.getElementById('view-status')||!!document.getElementById('bctJobsAuthStatus')
      },
      credentialHealth,
      managedJobId:managedJob?.job_id||managedJob?.id||null,
      estimatorWorkflow:Array.isArray(estimator?.WORKFLOW)?estimator.WORKFLOW.slice():[],
      noDuplicateStores:true,
      adminFinalAuthority:true
    };
  }
  function emitHandoff(from,to,reason,data){
    const allowed=handoffsFrom(from).includes(to);
    const payload=Object.freeze({from,to,allowed,reason:String(reason||''),at:new Date().toISOString(),data:data||null});
    try{document.dispatchEvent(new CustomEvent('bct:agent-role-handoff',{detail:payload}))}catch(_){}
    return payload;
  }
  function installLiveHooks(){
    if(window.BCT_AGENT_14_ROLE_WIRING_HOOKS_INSTALLED)return;
    const wrap=(name,from,to)=>{
      const original=window[name];
      if(typeof original!=='function'||original.__bctAgentRoleWrapped)return;
      const wrapped=async function(){
        emitHandoff(from,to,name+' invoked');
        const result=await original.apply(this,arguments);
        emitHandoff(to,from,name+' completed');
        return result;
      };
      wrapped.__bctAgentRoleWrapped=true;
      window[name]=wrapped;
    };
    wrap('bctManageJob','job_coordinator','project_manager');
    wrap('bctSubmitRealBid','contractor_manager','job_coordinator');
    window.BCT_AGENT_14_ROLE_WIRING_HOOKS_INSTALLED=true;
  }
  function refresh(){
    installLiveHooks();
    const snapshot=liveContext();
    try{document.dispatchEvent(new CustomEvent('bct:agent-role-snapshot',{detail:snapshot}))}catch(_){}
    return snapshot;
  }
  window.BCT_AGENT_14_ROLE_WIRING=Object.freeze({
    VERSION,
    snapshot:liveContext,
    refresh,
    handoff:emitHandoff,
    roles:ROLE_IDS.slice(),
    sharedSystems:true,
    duplicateSystemsCreated:false
  });

  window.BCT_AGENT_14_ROLE_INTEGRATION=Object.freeze({
    VERSION,ROLES,ROLE_IDS,HANDOFFS,NEVER_AUTO_DECIDE,
    getRole,handoffsFrom,canAct,requiresHuman,integrationSnapshot
  });
})();