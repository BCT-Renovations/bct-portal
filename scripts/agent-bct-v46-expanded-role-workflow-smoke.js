// Agent BCT V46 expanded role workflow static smoke test
// Runs in Node/CI and validates the integration contract without booting the browser app.
'use strict';
const fs=require('node:fs');
function read(path){return fs.readFileSync(path,'utf8');}
function must(text,needle,label){if(!text.includes(needle)) throw new Error('Missing '+label+': '+needle);}
const contract=read('agent-bct-14-role-integration.js');
const bridge=read('agent-bct-v46-integration.js');
const orch=read('agent-bct-v46-role-orchestrator.js');
const index=read('index.html');
const roles=[
'credential_compliance','job_coordinator','estimator','contractor_manager','homeowner_support','project_manager',
'change_order_manager','claims_assistant','safety_quality','materials_logistics','finance_payment',
'communication_translation','analytics_reporting','escalation_human_review'
];
if((contract.match(/id:'/g)||[]).length<14) throw new Error('Expected 14 role definitions');
for(const role of roles) must(contract,`id:'${role}'`,`role ${role}`);
for(const token of [
  'duplicateSystemsCreated:false','sharedSourceOfTruth:true','adminRemainsFinalAuthority:true',
  'translationRequired:true','privateCustomerProjectPhotos:true','public_photo_or_gallery_publish',
  'escrow_release','payment_dispute_resolution','claims_filing','safety_hold_clearance'
]) must(contract,token,token);
for(const token of [
  'credential_compliance','job_coordinator','project_manager','change_order_manager','claims_assistant',
  'safety_quality','materials_logistics','finance_payment','communication_translation','analytics_reporting',
  'escalation_human_review'
]) must(orch,token,`orchestrator ${token}`);
for(const event of [
  'bct:job-created','bct:job-updated','bct:assignment-updated','bct:credential-updated','bct:estimate-updated',
  'bct:change-order-updated','bct:payment-updated','bct:project-photo-updated','bct:safety-alert',
  'bct:message-sent','bct:material-updated','bct:claim-evidence-updated',
  'bct-agent-photo-upload-complete','bct-agent-photo-request'
]) must(orch,event,`event ${event}`);
for(const token of ['/agent-bct-14-role-integration.js','/agent-bct-v46-integration.js','/agent-bct-v46-role-orchestrator.js']){
  must(index,token,`loader ${token}`);
}
must(bridge,'contractor_credentials_board','credential source');
must(bridge,'contractor_bid_guard','bid guard');
must(bridge,'estimator_system','estimator source');
must(bridge,'admin_control_board','admin source');
console.log('PASS: Agent BCT V46 expanded role integration static smoke');
must(orch,'INTERACTION_ADAPTERS','existing V46 interaction adapter map');
for(const token of ['jobStatusForm','jobScheduleForm','bctLiveVerificationForm','jobMilestoneForm','jobWeatherForm','jobMaterialForm','jobChangeOrderForm','jobApprovalForm','jobFinanceForm','jobEscrowForm']){
  must(orch,token,'interaction form '+token);
}
for(const token of ['bidSubmit-','bctUpdateManagedMilestone-','bctUpdateManagedMaterial-','bctSendManagedChangeOrder-','bctApproveManagedChangeOrder-','bctResolveManagedApproval-']){
  must(orch,token,'interaction selector '+token);
}

