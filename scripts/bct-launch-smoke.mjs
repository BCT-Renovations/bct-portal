import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const securitySql = fs.readFileSync(new URL('./bct-supabase-security-smoke.sql', import.meta.url), 'utf8');
const operationalReadinessSql = fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql', import.meta.url), 'utf8');
const weatherReadiness = fs.readFileSync(new URL('../WEATHER_PROVIDER_READINESS.md', import.meta.url), 'utf8');
const backupPlan = fs.readFileSync(new URL('../PRE_PRO_BACKUP_EXPORT_PLAN.md', import.meta.url), 'utf8');
const auditReadiness = fs.readFileSync(new URL('../AUDIT_NOTIFICATION_READINESS.md', import.meta.url), 'utf8');
const contractorOnboardingSmoke = fs.readFileSync(new URL('./bct-contractor-onboarding-smoke.mjs', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function count(pattern) {
  return [...html.matchAll(pattern)].length;
}

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
scripts.forEach((script, index) => {
  try {
    new Function(script);
  } catch (error) {
    throw new Error(`Inline script ${index + 1} failed to parse: ${error.message}`);
  }
});

const requiredMarkers = [
  ['homeowner portal sign in', 'bctHomeLoginBtn'],
  ['contractor portal sign in', 'bctContractorLoginBtn'],
  ['contractor screening test', 'contractorScreeningTest'],
  ['contractor screening pass score', 'BCT_SCREENING_PASS_SCORE'],
  ['contractor screening lockout', 'locked for 14 days'],
  ['contractor launch rules acknowledgment', 'contractorRulesAck'],
  ['contractor reference #5 field', 'Professional Reference #5'],
  ['contractor reference #5 contact field', 'Reference #5 Contact'],
  ['contractor access lock message', 'Contractor access locked'],
  ['admin screening controls', 'bctAdminScreeningAction'],
  ['admin protected dashboard', 'BCT Admin Dashboard'],
  ['forgot-password request form', 'passwordRequestForm'],
  ['two-box password reset form', 'passwordResetNew'],
  ['two-box password reset confirmation', 'passwordResetConfirm'],
  ['password recovery event handler', 'PASSWORD_RECOVERY'],
  ['expired reset link landing guard', 'Checking your secure reset link'],
  ['duplicate submit lock helper', 'clearAndLockSubmission'],
  ['homeowner duplicate submit guard', "f.dataset.submitted==='true'||f.dataset.pending==='true'"],
  ['contractor duplicate submit guard', "f.dataset.submitted==='true'||f.dataset.pending==='true'"],
  ['homeowner private uploads', 'bctUploadHomeFiles'],
  ['contractor private uploads', 'bctContractorUploadDocs'],
  ['upload limit constants', 'BCT_UPLOAD_LIMITS'],
  ['upload validation helper', 'validateUploadFiles'],
  ['upload blocked wording', 'Upload blocked:'],
  ['upload size/count wording', 'Up to 10 files, 25 MB each'],
  ['inline contractor bid form', 'bctSubmitRealBid'],
  ['admin action status banner', 'adminActionStatus'],
  ['admin in-page confirmation helper', 'adminConfirmRun'],
  ['admin activity audit panel', 'adminActivityAuditPanel'],
  ['admin activity audit logger', 'adminAuditEvent'],
  ['admin activity clear control', 'clearAdminActivityAuditBtn'],
  ['admin bid award executor', 'executeAdminBidAward'],
  ['job health dashboard', 'jobHealthDashboard'],
  ['manual weather tracking label', 'Manual Weather Log'],
  ['automatic weather provider caveat', 'Automatic weather-provider pulls are not enabled yet'],
  ['launch owner action checklist', 'Owner Action Checklist'],
  ['weather API owner action', 'Weather API provider/key'],
  ['e-sign provider owner action', 'E-sign provider'],
  ['job financing workflow', 'jobFinanceForm'],
  ['job escrow workflow', 'jobEscrowForm'],
  ['change order workflow', 'jobChangeOrderForm'],
  ['service call workflow', 'serviceCallForm'],
  ['launch control center', 'bctLaunchControlCenter'],
  ['operational readiness center', 'bctOperationalReadinessCenter'],
  ['operational readiness RPC loader', 'bct_admin_operational_readiness'],
  ['operational readiness renderer', 'renderOperationalReadiness'],
  ['translation bootstrap', 'BCT_STATIC_FORMS'],
  ['public bootstrap RPC', 'bct_frontend_public_bootstrap'],
  ['admin state RPC', 'bct_frontend_admin_state']
];

for (const [label, marker] of requiredMarkers) {
  assert(html.includes(marker), `Missing ${label}: ${marker}`);
}

assert(count(/type="file"[^>]*multiple|multiple[^>]*type="file"/gi) >= 5, 'Expected at least five multi-file upload inputs.');
assert(count(/class="file-upload-ui"/g) >= 5, 'Expected custom file upload UI wrappers for phone-friendly uploads.');
assert(count(/Choose Files|Choose Documents|Choose Photos/gi) >= 4, 'Expected clean file chooser labels.');
assert(html.includes("maxFiles:10"), 'Uploads must enforce a 10-file limit.');
assert(html.includes("maxFileSizeBytes:25*1024*1024"), 'Uploads must enforce a 25 MB per-file limit.');
assert(html.includes("projectAllowedExtensions:['jpg','jpeg','png','webp','heic','heif','pdf','mov','mp4']"), 'Project uploads must enforce launch-approved file types.');
assert(!/service_role|SUPABASE_SERVICE_ROLE|sb_secret_/i.test(html), 'Public HTML must not expose Supabase service-role or secret keys.');
assert(/sb_publishable_/.test(html), 'Frontend should use a Supabase publishable key.');
assert(!/Enter your subcontractor bid amount/i.test(html), 'Contractor bidding must not use the old prompt-based bid entry.');
assert(html.includes('screening_result:screeningResult'), 'Contractor application payload must include screening results.');
assert(html.includes('contractor_rules_acknowledged'), 'Contractor application payload must include rules acknowledgment.');
assert(html.includes("refs.length!==5"), 'Contractor application payload must require exactly five professional references.');
assert(html.includes('contractorAccessMessage(app)'), 'Contractor jobs and bids must be gated by screening/admin approval.');
assert(securitySql.includes('no_public_execute_on_admin_rpcs'), 'Supabase security smoke SQL must check public admin RPC execution.');
assert(securitySql.includes('unexpected_security_definer_count_zero'), 'Supabase security smoke SQL must check unexpected SECURITY DEFINER functions.');
assert(operationalReadinessSql.includes('bct_admin_operational_readiness'), 'Operational readiness migration must create the admin readiness RPC.');
assert(operationalReadinessSql.includes('bct_completion_certificates'), 'Operational readiness must track completion sign-off coverage.');
assert(operationalReadinessSql.includes('bct_cases'), 'Operational readiness must track dispute-management coverage.');
assert(operationalReadinessSql.includes('requires_dashboard_verification'), 'Operational readiness must expose backup/security external verification gates.');
assert(weatherReadiness.includes('BCT_WEATHER_PROVIDER'), 'Weather readiness must document provider configuration.');
assert(weatherReadiness.includes('Automatic weather-provider pulls are not enabled yet'), 'Weather readiness must avoid mislabeling manual weather as automatic.');
assert(backupPlan.includes('Supabase Pro backups and PITR are not claimed active'), 'Pre-Pro backup plan must avoid claiming Pro backups are active.');
assert(auditReadiness.includes('Contractor approval/screening'), 'Audit readiness must cover contractor approval.');
assert(auditReadiness.includes('Notifications'), 'Audit readiness must cover notification readiness.');
assert(contractorOnboardingSmoke.includes('exact five-reference UI'), 'Dedicated contractor onboarding smoke must cover exact five-reference enforcement.');

console.log(`BCT launch smoke passed: ${scripts.length} inline scripts parsed and ${requiredMarkers.length} launch markers verified.`);
