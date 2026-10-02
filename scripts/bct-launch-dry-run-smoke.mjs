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
const aiEstimatingSmoke = fs.readFileSync(new URL('./bct-ai-estimating-smoke.mjs', import.meta.url), 'utf8');
const readinessSql = fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql', import.meta.url), 'utf8');
const homeownerEstimateSafetySql = fs.readFileSync(new URL('../supabase/migrations/20260926104500_homeowner_safe_estimate_summary.sql', import.meta.url), 'utf8');
const contractorJobSafetySql = fs.readFileSync(new URL('../supabase/migrations/20260926110500_contractor_safe_available_jobs.sql', import.meta.url), 'utf8');
const safetyTrainingSmoke = fs.readFileSync(new URL('./bct-safety-training-smoke.mjs', import.meta.url), 'utf8');
const contractorSafetyUiSmoke = fs.readFileSync(new URL('./bct-contractor-safety-ui-smoke.mjs', import.meta.url), 'utf8');
const contractorOnboardingSmoke = fs.readFileSync(new URL('./bct-contractor-onboarding-smoke.mjs', import.meta.url), 'utf8');
const contractorIdentitySmoke = fs.readFileSync(new URL('./bct-contractor-identity-smoke.mjs', import.meta.url), 'utf8');
assert(contractorIdentitySmoke.includes('BCT contractor identity/trade-lead smoke passed.'), 'Launch dry run must include the contractor identity/trade-lead regression suite.');
assert(contractorIdentitySmoke.includes('government IDs must never share homeowner storage access'), 'Launch dry run must retain the homeowner/government-ID privacy guard.');
assert(contractorIdentitySmoke.includes('identity work must retain the existing credential-current gate.'), 'Launch dry run must include identity/credential cross-system regression.');
assert(contractorIdentitySmoke.includes('performing-contractor assignment must retain estimator separation.'), 'Launch dry run must include identity/estimator assignment separation regression.');

const safetyCoreSql = fs.readFileSync(new URL('../supabase/migrations/20260926114500_contractor_safety_training_automation.sql', import.meta.url), 'utf8');
const safetyAdminSql = fs.readFileSync(new URL('../supabase/migrations/20260926115500_safety_training_admin_automation.sql', import.meta.url), 'utf8');
const automation100Sql = fs.readFileSync(new URL('../supabase/migrations/20260926122000_launch_automation_engine_100.sql', import.meta.url), 'utf8');
const automation200Sql = fs.readFileSync(new URL('../supabase/migrations/20260926123500_200_launch_required_controls.sql', import.meta.url), 'utf8');
const validation500Sql = fs.readFileSync(new URL('../supabase/migrations/20260926125000_500_nonduplicate_launch_validations.sql', import.meta.url), 'utf8');
const requirements1000Sql = fs.readFileSync(new URL('../supabase/migrations/20260926131000_1000_unique_launch_requirements.sql', import.meta.url), 'utf8');
const automationHealthSql = fs.readFileSync(new URL('../supabase/migrations/20260926135500_admin_automation_health.sql', import.meta.url), 'utf8');
const launchRunnerBoundarySql = fs.readFileSync(new URL('../supabase/migrations/20260926134500_launch_runner_execution_boundary.sql', import.meta.url), 'utf8');
const closeoutCreationSql = fs.readFileSync(new URL('../supabase/migrations/20260926150000_harden_inspection_warranty_closeout_creation.sql', import.meta.url), 'utf8');
const closeoutGuardSql = fs.readFileSync(new URL('../supabase/migrations/20260926151500_attach_closeout_validation_guards.sql', import.meta.url), 'utf8');
const signatureImmutabilitySql = fs.readFileSync(new URL('../supabase/migrations/20260926161500_contract_signature_immutability.sql', import.meta.url), 'utf8');
const gallerySql = fs.readFileSync(new URL('../supabase/migrations/20261001220000_bct_photo_build_gallery.sql', import.meta.url), 'utf8');
const homeGalleryJs = fs.readFileSync(new URL('../bct-home-gallery.js', import.meta.url), 'utf8');
const liveVerificationJs = fs.readFileSync(new URL('../bct-live-project-verification.js', import.meta.url), 'utf8');
const contractSigningJs = fs.readFileSync(new URL('../bct-contract-signing.js', import.meta.url), 'utf8');
const signatureTriggerHardeningSql = fs.readFileSync(new URL('../supabase/migrations/20261002100000_restrict_contract_signature_trigger_execute.sql', import.meta.url), 'utf8');
const adminMfaEnforcementSql = fs.readFileSync(new URL('../supabase/migrations/20261002103000_enforce_admin_mfa_in_is_bct_admin.sql', import.meta.url), 'utf8');

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
  ['homeowner project message feed', 'bct_my_project_messages'],
  ['homeowner project message send', 'bct_send_homeowner_message'],
  ['homeowner notification feed', 'bct_my_notifications'],
  ['homeowner notification read action', 'bct_mark_notification_read'],
  ['homeowner completion certificate feed', 'bct_my_completion_certificates'],
  ['homeowner completion signature action', 'bct_homeowner_sign_completion_certificate'],
  ['homeowner punch-list backend', 'bct_my_punch_list'],
  ['homeowner warranty backend', 'bct_my_warranties'],
  ['homeowner warranty closeout UI', 'Warranty Information'],
  ['completion rating opportunities backend', 'bct_rating_opportunities'],
  ['completion rating submit backend', 'bct_submit_completion_rating'],
  ['homeowner messages live container', 'bctHomeownerMessages'],
  ['homeowner completion live container', 'bctHomeownerCompletion'],
  ['homeowner duplicate lock', "f.dataset.submitted==='true'||f.dataset.pending==='true'"],
  ['contractor login flow', 'bctContractorLoginBtn'],
  ['contractor application RPC', 'bct_submit_contractor_application'],
  ['contractor bid RPC', 'bct_submit_bid'],
  ['contractor project message feed', 'contractorState?.messages'],
  ['contractor project message send', 'bct_send_contractor_message'],
  ['contractor notification feed', 'contractorState?.notifications'],
  ['contractor notification read action', 'bctMarkContractorNotificationRead'],
  ['contractor communications live container', 'bctContractorCommunications'],
  ['contractor completion requests backend', 'bct_my_completion_requests'],
  ['contractor punch-list backend', 'bct_contractor_open_punch_items'],
  ['contractor rules acknowledgment', 'contractorRulesAck'],
  ['contractor exact five-reference validation', 'refs.length!==5'],
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
  ['automation health RPC', 'bct_frontend_admin_automation_health'],
  ['admin notification health RPC', 'bct_admin_notification_health'],
  ['admin notification delivery state', 'notification_delivery'],
  ['admin completion readiness backend', 'bct_admin_completion_readiness'],
  ['admin completion requests backend', 'bct_admin_completion_requests'],
  ['admin warranty backend', 'bct_admin_warranties'],
  ['admin rating summary backend', 'bct_admin_rating_summary'],
  ['admin closeout overview', 'bctAdminCloseoutOverview'],
  ['admin closeout control wording', 'BCT retains final approval over completion'],
  ['automation health dashboard', 'Automation Health'],
  ['local demo data disabled after overlay', "localStorage.removeItem('bctPortalDataV1')"]
];

for (const [label, marker] of dryRunMarkers) {
  assert(indexHtml.includes(marker), `Missing ${label}: ${marker}`);
}

assert(indexHtml.includes("audience controls") || indexHtml.includes("BCT-mediated project communication"), 'Homeowner messaging must remain BCT-mediated.');
assert(indexHtml.includes("This records your completion acknowledgment."), 'Completion signature UI must explicitly identify the acknowledgment action.');

assert(closeoutCreationSql.includes('bct_admin_create_warranty'), 'Closeout regression must retain admin warranty creation.');
assert(closeoutCreationSql.includes('bct_admin_add_closeout_item'), 'Closeout regression must retain required closeout items.');
assert(closeoutCreationSql.includes("'customer_signoff'"), 'Closeout regression must retain customer sign-off item support.');
assert(closeoutGuardSql.includes('bct_closeout_guard'), 'Closeout regression must retain the canonical closeout validation guard.');
assert(signatureImmutabilitySql.includes('bct_contract_signature_immutable'), 'Contract signature evidence must remain immutable.');
assert(signatureImmutabilitySql.includes('Create a new contract/version for corrections.'), 'Signed-contract corrections must require a new contract/version.');

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

const currentProductionMarkers = [
  [launchStatus, 'eede8f9b62df22064f4a714b6fbedecb33b65ae6', 'launch status verified page-suite GitHub commit'],
  [launchStatus, 'bct_secure_admin_v45_email_field_fixed', 'launch status current Vercel project'],
  [launchStatus, 'bctsecureadminv45emailfieldfixed.vercel.app', 'launch status current production URL'],
  [launchStatus, 'dpl_9Y5D7fz8Bjp6kb7bx84tBDzA96hR', 'launch status current Vercel deployment'],
  [launchStatus, 'Do not use `https://bct-portal.vercel.app` for V46 verification', 'launch status stale-project warning'],
  [dryRunChecklist, 'eede8f9b62df22064f4a714b6fbedecb33b65ae6', 'dry-run checklist verified page-suite GitHub commit'],
  [dryRunChecklist, 'bct_secure_admin_v45_email_field_fixed', 'dry-run checklist current Vercel project'],
  [dryRunChecklist, 'bctsecureadminv45emailfieldfixed.vercel.app', 'dry-run checklist current production URL'],
  [dryRunChecklist, 'Do not verify V46 against `https://bct-portal.vercel.app`', 'dry-run checklist stale-project warning']
];
for (const [source, marker, label] of currentProductionMarkers) {
  assert(source.includes(marker), `Current production pointer must include ${label}: ${marker}`);
}

assert(aiHtml.includes('AI creates drafts only'), 'AI estimating page must state draft-only generation.');
assert(aiHtml.includes('AI_PROJECT_DRAFT_LIMIT'), 'AI estimating page must define project-level cost limits.');
assert(aiHtml.includes('AI_DAILY_DRAFT_LIMIT'), 'AI estimating page must define daily cost limits.');
assert(aiHtml.includes('AI Cost Controls'), 'AI estimating page must display admin-side cost controls.');
assert(aiHtml.includes('enforceAiCostGuard'), 'AI estimating page must block over-limit draft generation before calling AI.');
assert(aiHtml.includes('review_required'), 'AI estimating page must expose BCT review-required state.');
assert(aiHtml.includes('Manual Approval Gate'), 'AI estimating page must expose manual approval gate.');
assert(aiHtml.includes('AI cannot approve or release this estimate'), 'AI estimating page must prevent AI auto-approval.');
assert(aiHtml.includes('approve_customer'), 'AI estimating page must use explicit customer-release action only after admin approval.');
assert(aiEstimatingSmoke.includes('admin-only edge action mapping'), 'AI estimating smoke must verify admin-only edge action mapping.');
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

for (const marker of ['bct_validate_password_not_recent','bct_record_password_history','last five']) {
  assert(indexHtml.includes(marker), `Password recovery must preserve: ${marker}`);
}

for (const marker of [
  'bct_admin_operational_readiness',
  'bct_admin_system_health',
  'bct_admin_frontend_cutover_readiness',
  'bct_admin_launch_readiness'
]) {
  assert(indexHtml.includes(marker) || readinessSql.includes(marker), `Admin launch boundary must preserve: ${marker}`);
}
assert(readinessSql.includes('customer_pilot_enabled') || launchStatus.includes('customer_pilot_enabled'), 'Customer pilot launch gate must remain explicit.');

for (const marker of ['bct_homeowner_esign_contract','bct_contractor_esign_contract','bct_admin_esign_contract']) {
  assert(contractSigningJs.includes(marker), `Contract signing UI must preserve canonical RPC: ${marker}`);
}
assert(contractSigningJs.includes('p_consent:true'), 'Contract signing UI must send explicit electronic-signature consent.');
assert(contractSigningJs.includes('typedName'), 'Contract signing UI must require a typed signer name.');
assert(contractSigningJs.includes('electronic_signatures_enabled'), 'Contract signing UI must respect the electronic-signature feature gate.');
assert(indexHtml.includes('bct-contract-signing.js'), 'V46 must load the contract-signing module.');
assert(indexHtml.includes('window.supabaseClient=supabaseClient'), 'V46 must expose the shared Supabase client to isolated add-ons.');
assert(indexHtml.includes('window.SUPABASE_URL=SUPABASE_URL'), 'V46 must expose the public Supabase URL used by isolated add-ons.');
assert(indexHtml.includes('window.BCT_V46_BRIDGE'), 'V46 must expose the narrow shared bridge for private state/RPC operations.');
assert(indexHtml.includes('bctContractSigningBridge'), 'V46 must preserve the contract-signing bridge alias.');
assert(liveVerificationJs.includes('window.BCT_V46_BRIDGE'), 'Live verification must use the shared V46 bridge.');
assert(!liveVerificationJs.includes("typeof rpc!=='function'"), 'Live verification must not depend on the private rpc lexical binding.');
assert(!liveVerificationJs.includes("typeof activeManagedJob!=='undefined'"), 'Live verification must not depend on the private active-job lexical binding.');
assert(contractSigningJs.includes('bctContractSigningBridge'), 'Contract signing module must use the V46 signing bridge.');
assert(!contractSigningJs.includes('await rpc('), 'Contract signing module must not assume access to the private V46 rpc binding.');
assert(!contractSigningJs.includes('await loadHomeownerState()'), 'Contract signing module must not assume access to private homeowner loader.');
assert(!contractSigningJs.includes('await loadContractorState()'), 'Contract signing module must not assume access to private contractor loader.');
assert(!contractSigningJs.includes('await loadAdminState()'), 'Contract signing module must not assume access to private Admin loader.');
assert(indexHtml.includes('bctRenderHomeownerContracts'), 'Homeowner state load must render contract signatures.');
assert(indexHtml.includes('bctRenderContractorContracts'), 'Contractor state load must render contract acknowledgments.');
assert(indexHtml.includes('bctRenderAdminContracts'), 'Admin state load must render BCT contract signatures.');
assert(signatureImmutabilitySql.includes('bct_contract_signature_immutable'), 'Captured contract signature evidence must remain immutable.');
assert(signatureTriggerHardeningSql.includes('bct_prepare_contract_signature()'), 'Contract signature preparation trigger must be covered by execute hardening.');
assert(signatureTriggerHardeningSql.includes('bct_prevent_contract_signature_mutation()'), 'Contract signature immutability trigger must be covered by execute hardening.');
assert(signatureTriggerHardeningSql.includes('from public, anon, authenticated'), 'Contract signature trigger helpers must not remain browser-callable.');
assert(adminMfaEnforcementSql.includes('create or replace function public.is_bct_admin()'), 'Admin MFA must harden the canonical Admin predicate.');
assert(adminMfaEnforcementSql.includes('admin_mfa_enforced'), 'Canonical Admin predicate must honor the Admin MFA enforcement setting.');
assert(adminMfaEnforcementSql.includes("auth.jwt()->>'aal'"), 'Canonical Admin predicate must inspect the Supabase assurance level.');
assert(adminMfaEnforcementSql.includes("='aal2'"), 'Enforced Admin access must require AAL2.');
assert(adminMfaEnforcementSql.includes('BCT security settings admin select'), 'Admin MFA enforcement must include a non-recursive Admin SELECT policy for the singleton security setting.');
assert(adminMfaEnforcementSql.includes("in ('admin','bct_admin','owner')"), 'MFA security-setting visibility must use raw Admin identity claims, not recurse through is_bct_admin().');

assert(liveVerificationJs.includes('bct_admin_create_live_quality_check'), 'Live verification Admin creation must use the canonical quality-check workflow.');
assert(liveVerificationJs.includes('bct_admin_live_quality_checks'), 'Live verification Admin list must use the canonical quality-check workflow.');
assert(liveVerificationJs.includes('bct_contractor_live_quality_checks'), 'Contractor live verification must use the canonical scoped quality-check feed.');
assert(liveVerificationJs.includes('bct_contractor_ack_live_quality_privacy'), 'Contractor live verification must preserve privacy acknowledgment.');
assert(liveVerificationJs.includes('bct_contractor_update_live_quality_check'), 'Contractor live verification must preserve contractor-scoped status updates.');
assert(!liveVerificationJs.includes('bct_admin_create_live_verification'), 'Legacy inspection-backed live verification creation must stay retired from the current UI.');
assert(!liveVerificationJs.includes('bct_admin_update_live_verification'), 'Legacy inspection-backed live verification updates must stay retired from the current UI.');

assert(gallerySql.includes("values ('bct-gallery','bct-gallery',false"), 'Gallery storage bucket must remain private.');
assert(gallerySql.includes('using (is_published = true)'), 'Public gallery metadata must remain published-only.');
assert(gallerySql.includes("p.is_published"), 'Gallery object read policy must require a published gallery row.');
assert(gallerySql.includes('BCT admins manage gallery photos'), 'Gallery write management must remain BCT Admin-only.');
assert(gallerySql.includes('BCT gallery library is limited to 1,000 photos'), 'Gallery must preserve the 1,000-photo library cap.');
assert(gallerySql.includes('BCT front-page gallery is limited to 30 published photos'), 'Gallery must preserve the 30-photo homepage cap.');
assert(homeGalleryJs.includes("createSignedUrl"), 'Public gallery must use controlled signed object delivery.');
assert(homeGalleryJs.includes(".eq('is_published',true)"), 'Public gallery queries must remain published-only.');
assert(!homeGalleryJs.includes('/storage/v1/object/public/bct-gallery/'), 'Public gallery must not regress to unconditional public object URLs.');

assert(indexHtml.includes('Manual Weather Log'), 'Admin weather workflow must remain explicitly manual.');
assert(indexHtml.includes('Automatic weather-provider pulls are not enabled yet.'), 'Automatic weather must remain disabled in the current portal until approved.');
assert(!indexHtml.includes('bct-weather-refresh') && !indexHtml.includes('bct-weather'), 'Current V46 portal must not silently invoke automatic weather Edge Functions.');

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
  [aiEstimatingSmoke, 'customer-safe estimate fields protected', 'AI customer-safe field smoke coverage'],
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
  [automation200Sql, '101-300', '200-control source record'],
  [validation500Sql, '301-800', '500-validation source record'],
  [requirements1000Sql, 'controls 801-1800', '1000-requirement source record'],
  [safetyTrainingSmoke, 'PASS:', 'safety smoke assertions'],
  [contractorSafetyUiSmoke, 'bct_complete_my_safety_training', 'contractor safety-training UI completion flow'],
  [contractorOnboardingSmoke, 'exact five-reference UI', 'contractor exact five-reference onboarding smoke'],
  [indexHtml, 'bctSafetyTrainingPanel', 'contractor safety-training panel'],
  [indexHtml, 'Existing assigned-job access remains available', 'workforce restriction boundary'],
  [automationHealthSql, "'runs_failed'", 'automation failure visibility'],
  [automationHealthSql, "'scheduler'", 'automation scheduler truthfulness'],
  [launchRunnerBoundarySql, 'revoke all on function public.bct_admin_run_launch_automations() from public, anon', 'launch runner anonymous execution revocation'],
  [launchRunnerBoundarySql, 'grant execute on function public.bct_admin_run_1000_launch_requirements() to authenticated', 'launch runner authenticated execution boundary']
];
for (const [source, marker, label] of currentLaunchMarkers) {
  assert(source.includes(marker), `Current V46 launch source must include ${label}: ${marker}`);
}

console.log(`BCT launch dry-run smoke passed: ${dryRunMarkers.length} production flow markers and AI/manual approval gates verified.`);
