import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const aiHtml = fs.readFileSync(new URL('../ai-estimating.html', import.meta.url), 'utf8');
const dryRunChecklist = fs.readFileSync(new URL('../LAUNCH_DRY_RUN_CHECKLIST.md', import.meta.url), 'utf8');
const paidServicesChecklist = fs.readFileSync(new URL('../PAID_SERVICES_CHECKLIST.md', import.meta.url), 'utf8');
const aiCoreSql = fs.readFileSync(new URL('../supabase/migrations/20260925202000_ai_estimating_core.sql', import.meta.url), 'utf8');
const readinessSql = fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql', import.meta.url), 'utf8');

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
assert(readinessSql.includes('bct_admin_notification_delivery_queue'), 'Operational readiness must inspect notification delivery coverage.');

assert(aiHtml.includes('AI creates drafts only'), 'AI estimating page must state draft-only generation.');
assert(aiHtml.includes('review_required'), 'AI estimating page must expose BCT review-required state.');
assert(aiHtml.includes('Manual Approval Gate'), 'AI estimating page must expose manual approval gate.');
assert(aiHtml.includes('AI cannot approve or release this estimate'), 'AI estimating page must prevent AI auto-approval.');
assert(aiHtml.includes('approve_customer'), 'AI estimating page must use explicit customer-release action only after admin approval.');
assert(aiCoreSql.includes("status text not null default 'draft'"), 'AI estimate records must default to draft.');
assert(aiCoreSql.includes("status in ('draft','pending_bct_review','approved','rejected')"), 'AI estimate status constraint must keep review states explicit.');

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
  'AI never approves estimates'
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
  'Financing provider',
  'Escrow provider'
];
for (const marker of paidServicesMarkers) {
  assert(paidServicesChecklist.includes(marker), `Paid-services checklist must include: ${marker}`);
}

console.log(`BCT launch dry-run smoke passed: ${dryRunMarkers.length} production flow markers and AI/manual approval gates verified.`);
