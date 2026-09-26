import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const aiHtml = fs.readFileSync(new URL('../ai-estimating.html', import.meta.url), 'utf8');
const dryRunChecklist = fs.readFileSync(new URL('../LAUNCH_DRY_RUN_CHECKLIST.md', import.meta.url), 'utf8');
const paidServicesChecklist = fs.readFileSync(new URL('../PAID_SERVICES_CHECKLIST.md', import.meta.url), 'utf8');
const launchStatus = fs.readFileSync(new URL('../LAUNCH_STATUS.md', import.meta.url), 'utf8');
const weatherReadiness = fs.readFileSync(new URL('../WEATHER_PROVIDER_READINESS.md', import.meta.url), 'utf8');
const backupPlan = fs.readFileSync(new URL('../PRE_PRO_BACKUP_EXPORT_PLAN.md', import.meta.url), 'utf8');
const auditReadiness = fs.readFileSync(new URL('../AUDIT_NOTIFICATION_READINESS.md', import.meta.url), 'utf8');
const aiCoreSql = fs.readFileSync(new URL('../supabase/migrations/20260925202000_ai_estimating_core.sql', import.meta.url), 'utf8');
const readinessSql = fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql', import.meta.url), 'utf8');
const homeownerEstimateSafetySql = fs.readFileSync(new URL('../supabase/migrations/20260926104500_homeowner_safe_estimate_summary.sql', import.meta.url), 'utf8');
const contractorJobSafetySql = fs.readFileSync(new URL('../supabase/migrations/20260926110500_contractor_safe_available_jobs.sql', import.meta.url), 'utf8');
const safetyTrainingSmoke = fs.readFileSync(new URL('./bct-safety-training-smoke.mjs', import.meta.url), 'utf8');
const contractorSafetyUiSmoke = fs.readFileSync(new URL('./bct-contractor-safety-ui-smoke.mjs', import.meta.url), 'utf8');
const safetyCoreSql = fs.readFileSync(new URL('../supabase/migrations/20260926114500_contractor_safety_training_automation.sql', import.meta.url), 'utf8');
const safetyAdminSql = fs.readFileSync(new URL('../supabase/migrations/20260926115500_safety_training_admin_automation.sql', import.meta.url), 'utf8');
const automation100Sql = fs.readFileSync(new URL('../supabase/migrations/20260926122000_launch_automation_engine_100.sql', import.meta.url), 'utf8');
const automation200Sql = fs.readFileSync(new URL('../supabase/migrations/20260926123500_200_launch_required_controls.sql', import.meta.url), 'utf8');
const validation500Sql = fs.readFileSync(new URL('../supabase/migrations/20260926125000_500_nonduplicate_launch_validations.sql', import.meta.url), 'utf8');
const requirements1000Sql = fs.readFileSync(new URL('../supabase/migrations/20260926131000_1000_unique_launch_requirements.sql', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function lastIndexOfAll(source, needle) {
  let index = -1;
  let next = source.indexOf(needle);
  while (next !== -1) {
    index = next;
    next = source.indexOf(needle, next + needle.length);
  }
  return index;
}

function assertFinalHandler(formId, requiredMarker, legacyMarker) {
  const finalFormBinding = lastIndexOfAll(indexHtml, `const ${formId}`);
  const required = lastIndexOfAll(indexHtml, requiredMarker);
  const legacy = lastIndexOfAll(indexHtml, legacyMarker);
  assert(finalFormBinding !== -1, `Missing final ${formId} production handler.`);
  assert(required > finalFormBinding, `Final ${formId} handler must call ${requiredMarker}.`);
  assert(legacy === -1 || legacy < finalFormBinding, `Legacy ${legacyMarker} must not run after the final ${formId} handler.`);
}

const dryRunMarkers = [
  ['homeowner login flow', 'bctHomeLoginBtn'],
  ['homeowner state RPC', 'bct_frontend_homeowner_state'],
  ['homeowner project RPC', 'bct_submit_homeowner_project'],
  ['homeowner private upload button', 'bctUploadHomeFiles'],
  ['homeowner duplicate lock', "f.dataset.submitted==='true'||f.dataset.pending==='true'"],
  ['contractor login flow', 'bctContractorLoginBtn'],
  ['contractor application RPC', 'bct_submit_contractor_application'],
  ['contractor bid RPC', 'bct_submit_bid'],
  ['contractor rules acknowledgment', 'contractorRulesAck'],
  ['contractor access gate', 'contractorAccessMessage(app)'],
  ['contractor screening lockout', 'Screening failed twice. Retesting is locked for 14 days.'],
  ['admin state RPC', 'bct_frontend_admin_state'],
  ['admin project workflow RPC', 'bct_admin_set_project_workflow'],
  ['admin job creation RPC', 'bct_admin_create_job'],
  ['admin bid award RPC', 'bct_admin_award_bid'],
  ['job health RPC', 'bct_admin_job_health_dashboard'],
  ['job health refresh RPC', 'bct_admin_refresh_job_health_alerts'],
  ['financing RPC', 'bct_admin_set_financing'],
  ['escrow RPC', 'bct_admin_set_escrow'],
  ['change-order RPC', 'bct_admin_create_change_order'],
  ['change-order send RPC', 'bct_admin_send_change_order'],
  ['approval RPC', 'bct_admin_create_job_approval'],
  ['service-call RPC', 'bct_admin_create_service_call'],
  ['operational readiness RPC', 'bct_admin_operational_readiness'],
  ['local demo data disabled after overlay', "localStorage.removeItem('bctPortalDataV1')"]
];

for (const [label, marker] of dryRunMarkers) {
  assert(indexHtml.includes(marker), `Missing ${label}: ${marker}`);
}

assertFinalHandler('homeForm', 'bct_submit_homeowner_project', 'Project submitted successfully.');
assertFinalHandler('appForm', 'bct_submit_contractor_application', 'Basic Pre-Application Submitted');

assert(indexHtml.includes('renderAdminProjects()'), 'Admin dashboard must render homeowner project review.');
assert(indexHtml.includes('renderAdminBids()'), 'Admin dashboard must render bidding and assignment review.');
assert(indexHtml.includes('renderLaunchControls()'), 'Admin dashboard must render launch controls.');
assert(indexHtml.includes('renderOperationalReadiness()'), 'Admin dashboard must render operational readiness.');
assert(indexHtml.includes('loadJobHealth()'), 'Admin dashboard must load job health.');
assert(indexHtml.includes('Manual Weather Log'), 'Weather workflow must be labeled as manual until an automatic provider is enabled.');
assert(indexHtml.includes('Weather API provider/key'), 'Admin launch controls must show weather provider/key owner action.');
assert(indexHtml.includes('E-sign provider'), 'Admin launch controls must show e-sign provider owner action.');
assert(launchStatus.includes('PRE_PRO_BACKUP_EXPORT_PLAN.md'), 'Launch status must link the pre-Pro backup/export plan.');
assert(indexHtml.includes('validateUploadFiles'), 'Launch app must validate uploads before private storage upload.');
assert(readinessSql.includes('bct_admin_notification_delivery_queue'), 'Operational readiness must inspect notification delivery coverage.');

assert(aiHtml.includes('AI creates drafts only'), 'AI estimating page must state draft-only generation.');
assert(aiHtml.includes('AI_PROJECT_DRAFT_LIMIT'), 'AI estimating page must define project-level cost limits.');
assert(aiHtml.includes('AI_DAILY_DRAFT_LIMIT'), 'AI estimating page must define daily cost limits.');
assert(aiHtml.includes('AI Cost Controls'), 'AI estimating page must display admin-side cost controls.');
assert(aiHtml.includes('enforceAiCostGuard'), 'AI estimating page must block over-limit draft generation before calling AI.');
assert(aiHtml.includes('review_required'), 'AI estimating page must expose BCT review-required state.');
assert(aiHtml.includes('Manual Approval Gate'), 'AI estimating page must expose manual approval gate.');
assert(aiHtml.includes('AI cannot approve or release this estimate'), 'AI estimating page must prevent AI auto-approval.');
assert(aiHtml.includes('approve_customer'), 'AI estimating page must use explicit customer-release action only after admin approval.');
assert(aiCoreSql.includes("status text not null default 'draft'"), 'AI estimate records must default to draft.');
assert(aiCoreSql.includes("status in ('draft','pending_bct_review','approved','rejected')"), 'AI estimate status constraint must keep review states explicit.');
assert(homeownerEstimateSafetySql.includes('bct_my_estimates_safe'), 'Homeowner estimate summaries must use a safe customer-facing RPC.');
assert(homeownerEstimateSafetySql.includes('from public.bct_my_estimates_safe()'), 'Homeowner state must call the safe estimate summary RPC.');
for (const field of ['internal_cost_subtotal', 'markup_percent', 'markup_amount', 'internal_notes', 'approved_by', 'created_by', 'ai_run_id']) {
  const safeFunction = homeownerEstimateSafetySql.match(/create or replace function public\.bct_my_estimates_safe\(\)[\s\S]*?\$\$;/i)?.[0] || '';
  assert(!safeFunction.includes(field), `Homeowner-safe estimate summaries must not expose ${field}.`);
}
assert(contractorJobSafetySql.includes('bct_my_available_jobs_safe'), 'Contractor available jobs must use a safe contractor-facing RPC.');
assert(contractorJobSafetySql.includes('from public.bct_my_available_jobs_safe()'), 'Contractor state must call the safe available-jobs RPC.');
for (const field of ['target_subcontract_amount', 'project_id']) {
  const safeJobsFunction = contractorJobSafetySql.match(/create or replace function public\.bct_my_available_jobs_safe\(\)[\s\S]*?\$\$;/i)?.[0] || '';
  assert(!safeJobsFunction.includes(field), `Contractor-safe available jobs must not expose ${field}.`);
}

const externalGateMarkers = [
  'Supabase backups/PITR verified',
  'Leaked-password protection enabled',
  'Live email/password-reset delivery verified',
  'Policy/legal review complete'
];
for (const marker of externalGateMarkers) {
  assert(readinessSql.includes(marker), `Operational readiness must keep external gate visible: ${marker}`);
}

const dryRunChecklistMarkers = [
  'Homeowner Flow',
  'Admin Review And Estimating',
  'Job, Bid, And Assignment',
  'Job Operations',
  'Security And Launch Verification',
  'AI never approves estimates',
  'node scripts/bct-role-visibility-smoke.mjs'
];
for (const marker of dryRunChecklistMarkers) {
  assert(dryRunChecklist.includes(marker), `Dry-run checklist must include: ${marker}`);
}

const paidServicesMarkers = [
  'Supabase Pro',
  'Supabase leaked-password protection',
  'Supabase backups',
  'Supabase PITR',
  'Email sender',
  'AI/API billing',
  'Weather API provider',
  'E-sign provider',
  'Financing provider',
  'Escrow provider'
];
for (const marker of paidServicesMarkers) {
  assert(paidServicesChecklist.includes(marker), `Paid-services checklist must include: ${marker}`);
}

const readinessDocMarkers = [
  [weatherReadiness, 'BCT_WEATHER_PROVIDER', 'weather provider env var'],
  [weatherReadiness, 'Manual Weather Log', 'manual weather status'],
  [backupPlan, 'Auth users and role metadata', 'manual auth export coverage'],
  [backupPlan, 'Supabase Pro backups and PITR are not claimed active', 'backup/PITR accuracy'],
  [auditReadiness, 'Estimate creation/edit/review/approval', 'estimate audit coverage'],
  [auditReadiness, 'durable backend audit history', 'durable audit caveat']
];
for (const [source, marker, label] of readinessDocMarkers) {
  assert(source.includes(marker), `Readiness docs must include ${label}: ${marker}`);
}


const currentLaunchMarkers = [
  [safetyCoreSql, 'bct_safety_training_assignments', 'safety training assignments'],
  [safetyCoreSql, 'bct_contractor_workforce_eligible', 'contractor workforce eligibility'],
  [safetyAdminSql, 'bct_admin_process_safety_training_reminders', 'safety reminder routing'],
  [safetyAdminSql, 'bct_admin_set_contractor_hold', 'separate admin workforce hold'],
  [automation100Sql, 'bct_automation_runs', 'automation run history'],
  [automation200Sql, 'controls 101-300', '200-control source record'],
  [validation500Sql, 'controls 301-800', '500-validation source record'],
  [requirements1000Sql, 'controls 801-1800', '1000-requirement source record'],
  [safetyTrainingSmoke, 'PASS:', 'safety smoke assertions'],
  [contractorSafetyUiSmoke, 'bct_complete_my_safety_training', 'contractor safety-training UI completion flow'],
  [indexHtml, 'bctSafetyTrainingPanel', 'contractor safety-training panel'],
  [indexHtml, 'Existing assigned-job access remains available', 'workforce restriction boundary']
];
for (const [source, marker, label] of currentLaunchMarkers) {
  assert(source.includes(marker), `Current V46 launch source must include ${label}: ${marker}`);
}

console.log(`BCT launch dry-run smoke passed: ${dryRunMarkers.length} production flow markers and AI/manual approval gates verified.`);
