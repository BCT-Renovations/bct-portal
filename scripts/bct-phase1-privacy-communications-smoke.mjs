import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const propertySql = fs.readFileSync(new URL('../supabase/migrations/20260926164500_phase1_property_management_core.sql', import.meta.url), 'utf8');
const communicationsSql = fs.readFileSync(new URL('../supabase/migrations/20260926165000_phase1_bct_mediated_communications.sql', import.meta.url), 'utf8');
const twilioSql = fs.readFileSync(new URL('../supabase/migrations/20260926165500_twilio_provider_adapter_foundation.sql', import.meta.url), 'utf8');
const residentPrivacySql = fs.readFileSync(new URL('../supabase/migrations/20260926170000_harden_phase1_resident_contact_privacy.sql', import.meta.url), 'utf8');
const managerAccessSql = fs.readFileSync(new URL('../supabase/migrations/20260926170500_property_manager_project_access.sql', import.meta.url), 'utf8');
const optimizationSql = fs.readFileSync(new URL('../supabase/migrations/20260926172000_optimize_property_communication_policies.sql', import.meta.url), 'utf8');
const consolidatedProjectPoliciesSql = fs.readFileSync(new URL('../supabase/migrations/20260926173500_consolidate_project_property_manager_policies.sql', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const htmlMarkers = [
  ['property/complex field', 'name="propertyName"'],
  ['building field', 'name="buildingNumber"'],
  ['unit field', 'name="unitNumber"'],
  ['vacant/occupied field', 'name="occupancyStatus"'],
  ['resident private name field', 'name="residentName"'],
  ['resident private phone field', 'name="residentPhone"'],
  ['access instructions field', 'name="accessInstructions"'],
  ['project market payload', 'project_market:projectMarket'],
  ['resident phone payload', 'resident_phone'],
  ['access instructions payload', 'access_instructions'],
  ['BCT-only resident privacy copy', 'Resident names and personal phone numbers stay BCT-only'],
  ['approved-contractor release copy', 'released only by BCT to the approved assigned contractor']
];

for (const [label, marker] of htmlMarkers) {
  assert(indexHtml.includes(marker), `Missing ${label}: ${marker}`);
}

const propertyMarkers = [
  ['commercial/multifamily market column', 'project_market'],
  ['property name column', 'property_name'],
  ['building number column', 'building_number'],
  ['unit number column', 'unit_number'],
  ['vacant/occupied constraint', "occupancy_status in('vacant','occupied')"],
  ['resident contact validation', 'Resident name and phone are required for occupied units'],
  ['property account RLS', 'alter table public.bct_property_accounts enable row level security'],
  ['managed property RLS', 'alter table public.bct_managed_properties enable row level security'],
  ['owner-or-admin property account policy', 'auth_user_id=auth.uid() or public.is_bct_admin()']
];

for (const [label, marker] of propertyMarkers) {
  assert(propertySql.includes(marker), `Missing ${label}: ${marker}`);
}

const communicationMarkers = [
  ['job communication sessions', 'bct_job_communication_sessions'],
  ['job communication events', 'bct_job_communication_events'],
  ['communication RLS', 'alter table public.bct_job_communication_events enable row level security'],
  ['recording notice/consent constraint', 'bct_recording_consent_ck'],
  ['proxy modes', "communication_mode in('in_app','proxy_sms','proxy_voice')"],
  ['admin-only base communication rows', 'Communication events admin only'],
  ['non-admin messages require active BCT session', 'BCT must activate communication for this job first']
];

for (const [label, marker] of communicationMarkers) {
  assert(communicationsSql.includes(marker), `Missing ${label}: ${marker}`);
}

assert(twilioSql.includes("values('twilio',false)"), 'Twilio provider must remain disabled until credentials are supplied.');
assert(twilioSql.includes('Assign and approve a contractor before activating contractor communications'), 'BCT must assign/approve a contractor before activating communications.');
assert(twilioSql.includes('bct_admin_log_arrival_notice'), 'Admin arrival notice logging must be available.');
assert(twilioSql.includes('recording_notice_text'), 'Recording notice text must be provider-ready.');

assert(residentPrivacySql.includes('bct_project_private_contact'), 'Private contact RPC must exist.');
assert(residentPrivacySql.includes('null::text,null::text,p.access_instructions'), 'Assigned contractors may receive access instructions without resident name/phone.');
const contractorPrivateContactBranch = residentPrivacySql.match(/if v_contractor_user=auth\.uid\(\)[\s\S]*?return;end if;/i)?.[0] || '';
assert(contractorPrivateContactBranch.includes('null::text,null::text,p.access_instructions'), 'Contractor private-contact branch must hide resident name and phone.');
assert(!contractorPrivateContactBranch.includes('resident_name') && !contractorPrivateContactBranch.includes('resident_phone'), 'Contractor private-contact branch must not expose resident columns.');
assert(residentPrivacySql.includes('Only the approved assigned contractor can send an arrival notice'), 'On My Way notices must be assigned-contractor only.');
assert(residentPrivacySql.includes('p_eta_minutes<1 or p_eta_minutes>240'), 'On My Way ETA must be bounded.');
assert(residentPrivacySql.includes('BCT must activate communications before an arrival notice can be sent'), 'On My Way requires BCT-activated communications.');

assert(managerAccessSql.includes('bct_user_owns_or_manages_project'), 'Property managers need scoped project ownership helper.');
assert(managerAccessSql.includes("v_role:='property_manager'"), 'Property manager messages must be logged with property_manager role.');
assert(managerAccessSql.includes('pa.auth_user_id=auth.uid() and pa.active and mp.active'), 'Property manager access must be limited to active managed portfolio.');
assert(managerAccessSql.includes('project_market=\'multifamily\''), 'Property manager project inserts/updates must stay scoped to multifamily jobs.');

const optimizationMarkers = [
  'bct_property_accounts_auth_user_id_idx',
  'bct_managed_properties_property_account_id_idx',
  'bct_projects_managed_property_id_idx',
  'bct_job_communication_sessions_project_id_idx',
  'bct_job_communication_sessions_job_id_idx',
  'bct_job_communication_events_session_id_idx',
  'bct_job_communication_events_project_id_idx',
  'bct_job_communication_events_job_id_idx',
  'auth_user_id=(select auth.uid())'
];

for (const marker of optimizationMarkers) {
  assert(optimizationSql.includes(marker), `Missing property/communication advisor optimization: ${marker}`);
}

const consolidatedPolicyMarkers = [
  ['drops separate property-manager insert policy', 'drop policy if exists "BCT projects property manager insert"'],
  ['drops separate property-manager select policy', 'drop policy if exists "BCT projects property manager select"'],
  ['drops separate property-manager update policy', 'drop policy if exists "BCT projects property manager update"'],
  ['preserves admin access', 'public.is_bct_admin()'],
  ['preserves homeowner ownership access', 'c.auth_user_id=(select auth.uid())'],
  ['preserves active property-manager portfolio access', 'pa.auth_user_id=(select auth.uid())'],
  ['keeps multifamily insert/update boundary', "project_market='multifamily'"]
];

for (const [label, marker] of consolidatedPolicyMarkers) {
  assert(consolidatedProjectPoliciesSql.includes(marker), `Missing consolidated bct_projects policy guard: ${label}`);
}

console.log('BCT Phase 1 privacy/communications smoke passed: property-manager fields, resident privacy, assigned-contractor access, and Twilio-disabled readiness verified.');
