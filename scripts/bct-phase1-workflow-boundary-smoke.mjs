import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const launchStatus = fs.readFileSync(new URL('../LAUNCH_STATUS.md', import.meta.url), 'utf8');
const closeoutSql = fs.readFileSync(new URL('../supabase/migrations/20260926150000_harden_inspection_warranty_closeout_creation.sql', import.meta.url), 'utf8');
const closeoutGuardSql = fs.readFileSync(new URL('../supabase/migrations/20260926151500_attach_closeout_validation_guards.sql', import.meta.url), 'utf8');
const changeOrderSql = fs.readFileSync(new URL('../supabase/migrations/20260926162000_change_order_approval_evidence_constraints.sql', import.meta.url), 'utf8');
const escrowSql = fs.readFileSync(new URL('../supabase/migrations/20260926144500_harden_homeowner_escrow_release_rpc.sql', import.meta.url), 'utf8');
const contractSql = fs.readFileSync(new URL('../supabase/migrations/20260926161500_contract_signature_immutability.sql', import.meta.url), 'utf8');
const bidSql = fs.readFileSync(new URL('../supabase/migrations/20260926152500_canonicalize_bid_assignment_role_guards.sql', import.meta.url), 'utf8');
const fileTypeSql = fs.readFileSync(new URL('../supabase/migrations/20260926164000_enforce_project_file_type_size_constraints.sql', import.meta.url), 'utf8');
const videoSql = fs.readFileSync(new URL('../supabase/migrations/20260926163500_enable_100mb_private_project_videos.sql', import.meta.url), 'utf8');
const videoLimitSql = fs.readFileSync(new URL('../supabase/migrations/20260926163500_project_video_100mb_limits.sql', import.meta.url), 'utf8');
const readinessSql = fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql', import.meta.url), 'utf8');
const automation100Sql = fs.readFileSync(new URL('../supabase/migrations/20260926155200_reconcile_100_launch_runner.sql', import.meta.url), 'utf8');
const automation200Sql = fs.readFileSync(new URL('../supabase/migrations/20260926155500_reconcile_200_launch_runner.sql', import.meta.url), 'utf8');
const automation500Sql = fs.readFileSync(new URL('../supabase/migrations/20260926154500_reconcile_500_launch_runner.sql', import.meta.url), 'utf8');
const automation1000Sql = fs.readFileSync(new URL('../supabase/migrations/20260926155000_reconcile_1000_launch_runner.sql', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [label, marker] of [
  ['admin customer verification controls', 'bctAdminVerifyCustomer'],
  ['admin workflow controls', 'bctAdminWorkflow'],
  ['admin bid award controls', 'bctAdminAwardBid'],
  ['second active job override confirmation', 'Approve the BCT second-job override'],
  ['job status control', 'jobStatusForm'],
  ['job financing workflow', 'jobFinanceForm'],
  ['job escrow workflow', 'jobEscrowForm'],
  ['change-order workflow', 'jobChangeOrderForm'],
  ['change-order homeowner review step', 'Send for Homeowner Review'],
  ['change-order BCT approval step', 'Record BCT Approval'],
  ['manual weather workflow', 'jobWeatherForm'],
  ['service-call workflow', 'serviceCallForm'],
  ['job health dashboard', 'jobHealthDashboard'],
  ['operational readiness dashboard', 'bctOperationalReadinessCenter'],
  ['admin activity audit panel', 'adminActivityAuditPanel'],
  ['admin activity durable caveat', 'Local session audit for operator traceability'],
  ['property access note', 'released only by BCT to the approved assigned contractor'],
  ['resident privacy copy', 'Resident names and personal phone numbers stay BCT-only']
]) {
  assert(html.includes(marker), `Missing Phase 1 admin workflow marker: ${label}`);
}

for (const [label, marker] of [
  ['inspection admin gate', 'if not public.is_bct_admin() then raise exception'],
  ['inspection project/job relationship guard', 'Job does not belong to project'],
  ['warranty date guard', 'Warranty expiration cannot be before start date'],
  ['closeout item required type list', "p_item_type not in ('final_inspection','punch_list','photos','warranty','manuals','payment','lien_waiver','customer_signoff','cleanup','other')"],
  ['closeout updated-at trigger', 'bct_closeouts_updated_at'],
  ['closeout validation guard preserved', 'Production already has bct_closeout_guard'],
  ['closeout audit guard preserved', 'bct_closeout_audit']
]) {
  assert((closeoutSql + closeoutGuardSql).includes(marker), `Missing closeout/inspection/warranty guard: ${label}`);
}

for (const [label, marker] of [
  ['change order homeowner and BCT evidence', 'homeowner_approved_at is not null and bct_approved_at is not null'],
  ['job approval response evidence', 'responded_by is not null and responded_at is not null'],
  ['homeowner escrow ownership guard', 'public.bct_user_owns_project(e.project_id)'],
  ['homeowner escrow policy acceptance guard', 'bct_has_required_policy_acceptance'],
  ['eligible escrow statuses only', "e.status in ('funded','hold','release_pending')"],
  ['contract signature immutability', 'Contract signature evidence is immutable'],
  ['assignment admin-only transition guard', 'Only BCT admin may change assignment status'],
  ['assignment transition validity guard', 'Invalid assignment status transition'],
  ['contractor bid ownership guard', 'Contractor bid ownership required'],
  ['contractor bid ownership-field lock', 'Contractor cannot change bid ownership fields'],
  ['bid workflow admin-only guard', 'Only BCT admin may change bid workflow status'],
  ['admin override tracked', 'p_admin_override_second_job']
]) {
  assert((html + changeOrderSql + escrowSql + contractSql + bidSql).includes(marker), `Missing approval/payment/assignment guard: ${label}`);
}

for (const [label, marker] of [
  ['project file MIME allowlist', "'image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf','video/mp4','video/quicktime'"],
  ['project photo/PDF size enforcement', '26214400'],
  ['private project video storage', 'job-site mp4/mov videos may be up to 100 mb'],
  ['project video size enforcement', '104857600'],
  ['video mime support', 'video/mp4']
]) {
  assert((fileTypeSql + videoSql + videoLimitSql).toLowerCase().includes(marker.toLowerCase()), `Missing upload/file guard: ${label}`);
}

for (const [label, marker] of [
  ['operational completion signoff readiness', 'completion_signoff'],
  ['operational documents readiness', 'project_documents'],
  ['operational dispute readiness', 'dispute_management'],
  ['operational audit readiness', 'audit_log'],
  ['external PITR gate', 'Supabase backups/PITR verified'],
  ['external leaked-password gate', 'Leaked-password protection enabled'],
  ['manual human approval boundary', 'Human approvals remain manual'],
  ['automation closeout item alert', 'closeout_required_item_open'],
  ['automation invalid closed-project alert', 'closed_project_missing_requirement'],
  ['500-control closeout failure', 'Closed project violates closeout prerequisites'],
  ['1000-control closeout prerequisite failure', 'Closed project missing closeout prerequisite']
]) {
  assert((readinessSql + automation100Sql + automation200Sql + automation500Sql + automation1000Sql).includes(marker), `Missing readiness/automation workflow marker: ${label}`);
}

for (const marker of [
  'Full local `.mjs` smoke suite passes',
  'Resident names and personal phone numbers stay BCT-only',
  'only the approved assigned contractor may receive job-specific access instructions',
  'AI estimating now shows admin-side cost controls',
  'Contractor pre-applications now require explicit acknowledgment'
]) {
  assert(launchStatus.includes(marker), `Launch status must keep implemented/tested record current: ${marker}`);
}

console.log('BCT Phase 1 workflow-boundary smoke passed: admin controls, assignments, closeout, payments, uploads, readiness, and privacy gates verified.');
