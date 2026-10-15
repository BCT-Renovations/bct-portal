// Read-only source-derived capability inventory. No credentials or network calls.
import fs from 'node:fs';import {listAgentBctPositions} from '../api/agent-bct/_positions.js';import {AGENT_BCT_ROLE_GROUPS} from '../api/agent-bct/_role-access.js';import {listAgentBctTools} from '../api/agent-bct/_tool-registry.js';import {modelToolsForRole} from '../api/agent-bct/_tool-loop.js';
const workflows={
 project_manager:['Homeowner project/status/schedule reads; contractor dashboard through the separately authorized role pool.','No assignment, milestone, approval or project write tool.'],
 estimator:['Estimator portal is separate; Agent has estimating process policy and scope guidance.','No estimator profile, assessment, media or submission Agent tool.'],
 contractor_coordinator:['Contractor dashboard summary and process guidance.','No bid, onboarding, document upload, approval or assignment Agent write tool.'],
 assignment_scheduler:['Homeowner schedule/upcoming-schedule reads.','No live worker availability, assignment or schedule write tool.'],
 customer_support:['Service catalog, permitted notifications and process knowledge.','No account recovery/change tool; no unconfirmed live account actions.'],
 finance_escrow:['Homeowner financing/escrow/payment read endpoints exist at high risk.','Excluded from default medium-risk model schema pool; no money movement or release tool.'],
 insurance_claims:['Parked insurance portal has its own guarded RPCs; Agent provides claims process focus.','No claims-specific Agent tool; no parallel adjuster system or claim resolution authority.'],
 property_commercial:['Property/privacy process focus; ordinary authorized homeowner context only.','No property/building/unit/resident-specific Agent tool.'],
 documents_change_orders:['Safe homeowner file metadata, estimates and contract summary reads.','No document signing, binding change-order or contract amendment tool; storage paths omitted.'],
 quality_completion:['Authorized project summary can include punch-list/warranty counts.','No inspection, acceptance, signature, warranty decision or completion write tool.'],
 compliance_credentials:['Contractor dashboard includes readiness/safety summary fields.','No credential verification, renewal upload or hold-removal Agent tool.'],
 analytics_reporting:['Authorized summaries can be explained using the caller role pool.','No Admin analytics/reporting aggregate tool in the registry.'],
 admin_escalation:['Human-review policy and escalation receipt/preparation modules exist.','No registered durable escalation/approval/decision write tool; no delivery promise.'],
 photo_recommendation:['Existing gallery and separate Admin-only photo recommendation API/UI.','Not an Agent chat tool; no publication, consent inference or automatic image analysis in test mode.']
};
let report='# Agent BCT — fourteen-role capability map\n\nSource-derived mapping for checklist 82. This maps foundations and gaps; it does not certify fourteen operational roles. Selected position changes focus only. Authenticated backend role determines the shared read-only tool pool. No per-position database elevation exists.\n\nChat responses currently declare `liveToolLoopEnabled:false` in both protected preview and generation-preview paths. A separate guarded read endpoint is not proof that chat executed it. No provider/configuration was activated for this inventory.\n\n| Position | UI portals | Existing workflow/data foundation | Remaining operational gap |\n|---|---|---|---|\n';
for(const position of listAgentBctPositions()){
 const portals=Object.entries(AGENT_BCT_ROLE_GROUPS).filter(([,positions])=>positions.includes(position.key)).map(([portal])=>portal).join(', ');const row=workflows[position.key];if(!row)throw Error('Unmapped position '+position.key);report+=`| ${position.label} | ${portals} | ${row[0]} | ${row[1]} |\n`;
}
report+='\n## Exact authenticated-role pools\n\nThe model-schema lists below use the default medium risk ceiling; the registry includes high-risk read endpoints separately. Anonymous callers receive no private tools. Estimator/insurance positions do not create a new recognized backend role in this registry.\n';
for(const role of ['public','homeowner','contractor','admin']){report+=`\n### ${role}\n\nRegistry: ${listAgentBctTools(role).map(t=>'`'+t.name+'`').join(', ')||'none'}.\n\nDefault model schema pool: ${modelToolsForRole(role).map(t=>'`'+t.function.name+'`').join(', ')||'none'}.\n`;}
report+='\n## Registry implementation\n\n| Tool | Backend RPC | Verified role allowlist | Risk | Writes |\n|---|---|---|---|---|\n';for(const tool of listAgentBctTools()){if(tool.write!==false)throw Error('Unexpected write capability');report+=`| ${tool.name} | ${tool.rpc} | ${tool.roles.join(', ')} | ${tool.risk} | disabled |\n`;}
report+='\n## Acceptance limits\n\nFourteen UI routing fixtures and existing policy/security tests are local evidence. Checklist 83–96 still require the role-specific business guidance/context/authority scenarios stated in the register; they are not automatically closed by this mapping. Hosted tool ownership, real Auth/RLS, live data, provider behavior, escalation delivery and user acceptance remain pending.\n';
const path=new URL('../docs/agent-bct-capability-map-20261015.md',import.meta.url);
if(process.argv.includes('--write')){fs.writeFileSync(path,report);console.log('Wrote fourteen-role capability map.');}
else if(process.argv.includes('--check')){if(!fs.existsSync(path)||fs.readFileSync(path,'utf8')!==report)throw Error('Agent capability map is stale; review and regenerate it.');console.log('Fourteen-role capability map matches current source; all registry tools are read-only.');}
else process.stdout.write(report);
