// Agent BCT V46 expanded role workflow static smoke test
import fs from 'node:fs';

const contract=fs.readFileSync('agent-bct-14-role-integration.js','utf8');
const orchestrator=fs.readFileSync('agent-bct-v46-role-orchestrator.js','utf8');

for(const role of [
  'job_coordinator','project_manager','change_order_manager','materials_logistics',
  'safety_quality','homeowner_support','contractor_manager','communication_translation',
  'finance_payment','claims_assistant','analytics_reporting','escalation_human_review'
]){
  if(!contract.includes("id:'"+role+"'")) throw new Error('Missing role: '+role);
}
for(const fn of [
  'routeProjectLifecycle','routeChangeOrder','routeMaterials','routeCommunication',
  'routeFinance','routeClaim','routeAnalytics','routeChain'
]){
  if(!orchestrator.includes('function '+fn+'(')) throw new Error('Missing workflow route: '+fn);
}
for(const action of [
  'change_order_approval','payment_dispute_resolution','ai_estimate_approval',
  'credential_approval','contract_approval','escrow_release','claims_filing',
  'safety_hold_clearance','public_photo_or_gallery_publish'
]){
  if(!contract.includes("'"+action+"'")) throw new Error('Missing human-approval gate: '+action);
}
if(!orchestrator.includes('productionChanged:false')) throw new Error('Production guard missing');
console.log('PASS: Agent BCT expanded role workflow static smoke');
