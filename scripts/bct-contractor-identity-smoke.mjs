import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../supabase/migrations/20261002050000_contractor_identity_trade_leads.sql',import.meta.url),'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};

[
 'contractorProfilePhoto','governmentIdFront','governmentIdBack','governmentIdHasBack',
 'contractorTradeLicense','government_id_has_back','profile_photo','government_id_front','government_id_back',
 'contractor_trade_license',"One clear contractor profile photo is required.",
 "Government ID front is required.","Government ID back is required when your ID has information on the back.",
 'Who’s Coming','Choose exactly one file for this identity document type.','Profile Photo','Government ID — Front','Contractor / Trade License'
].forEach(x=>assert(html.includes(x),'Missing contractor identity UI marker: '+x));

[
 'bct_admin_retire_contractor_identity_document','bct_contractor_identity_review_revocation_guard','trg_bct_identity_review_revocation','bct_contractor_identity_doc_singleton','bct_contractor_identity_profiles','bct_project_trade_leads',
 'bct_admin_review_contractor_profile_photo','bct_admin_set_project_trade_lead',
 'bct_homeowner_project_trade_leads','bct_homeowner_contractor_profile_photo_path',
 'bct_contractor_identity_required_documents_ready','bct_application_identity_required_documents_ready','trg_bct_contractor_application_identity_approval_guard','trg_bct_assignment_trade_lead_visibility',
 'bct_project_trade_leads_one_primary_contact',"d.document_type='profile_photo'",
 "ip.profile_photo_status='approved'","d.review_status='approved'","l.homeowner_visible",
 'cu.auth_user_id=auth.uid()',"'assigned','scheduled','in_progress','quality_review'",
 'set is_primary_contact=false,updated_at=now()',
 'Profile photo document review must be approved before identity approval'
].forEach(x=>assert(sql.includes(x),'Missing contractor identity security marker: '+x));

const homeownerFn=sql.slice(sql.indexOf('create or replace function public.bct_homeowner_project_trade_leads'),sql.indexOf('-- Resolve one homeowner-authorized profile-photo path'));
assert(homeownerFn && !/government_id_(front|back)|contractor_trade_license|certificate_of_insurance|\bw9\b/i.test(homeownerFn),
 'Homeowner trade-lead function must never expose private contractor verification document types.');
assert(!sql.includes('p.homeowner_id=auth.uid()'),'Legacy direct homeowner ownership check must not return.');
assert(sql.includes('cu.auth_user_id=auth.uid()'),'Homeowner ownership must follow project -> customer -> auth user.');
assert(sql.includes("a.status in ('assigned','scheduled','in_progress','quality_review')"),'Homeowner trade leads must require an active assignment lifecycle state.');
assert(!sql.includes('bct_contractor_documents(contractor_id,document_type)'),'Identity document singleton must use canonical application_id relationship.');
assert(sql.includes("d.application_id=(select c.application_id from public.bct_contractors c where c.id=p_contractor_id)"),'Contractor identity lookups must resolve documents through the contractor application.');
assert(sql.includes("new.status='approved'"),'Contractor approval must be guarded by reviewed identity completeness.');
assert(html.includes("bct_homeowner_contractor_profile_photo_path"),'Who’s Coming must re-authorize each contractor photo path.');
assert(html.includes("storage.from('bct-contractor-documents').createSignedUrl(authorizedPath,900)"),'Who’s Coming must use short-lived signed profile-photo delivery.');
assert(html.includes('bct-whos-coming-photo'),'Who’s Coming must render the approved contractor photo.');
assert(!html.includes("/storage/v1/object/public/bct-contractor-documents/"),'Private contractor documents must never use a public object URL.');
assert(sql.includes("c.application_id=a.id"),'Contractor identity readiness must use the canonical application row, not latest auth-user application.');
assert(sql.includes("document_type='government_id_front' and d.review_status='approved'"),'Government ID front must pass BCT review before identity readiness.');
assert(sql.includes("document_type='government_id_back' and d.review_status='approved'"),'Required government ID back must pass BCT review before identity readiness.');
assert(sql.includes("delete from public.bct_contractor_documents where id=v_doc.id"),'Identity replacement must explicitly retire the old singleton document.');
assert(sql.includes("new.status in ('completed','cancelled')"),'Completed/cancelled assignments must revoke homeowner trade-lead visibility.');
assert(sql.includes("set homeowner_visible=false"),'Visibility revocation must explicitly hide the released trade lead.');
assert(sql.includes("is_primary_contact=false"),'Visibility revocation must clear primary-contact status.');
assert(sql.includes("profile_photo_status='pending'"),'Revoked profile-photo review must reset public identity approval.');
assert(sql.includes("old.review_status='approved' and new.review_status is distinct from 'approved'"),'Profile-photo review withdrawal must trigger revocation.');
assert(sql.includes("and c.active"),'Homeowner trade leads must exclude inactive contractors.');
assert(sql.includes("p_project_id,p_contractor_id,lower(btrim(p_trade))"),'Trade-lead keys must be normalized before persistence.');
['insurance','license_registration','background_check_authorization'].forEach(x=>assert(sql.includes("'"+x+"'"),'Identity migration must preserve legacy contractor document type: '+x));
assert(sql.includes("d.application_id=c.application_id"),'Homeowner profile-photo reads must bind the photo to the contractor’s canonical application.');
assert(!/storage\.objects|create policy[\s\S]{0,100}bct-contractor-documents/i.test(sql),'Identity migration must not broaden private storage access.');
console.log('BCT contractor identity/trade-lead smoke passed.');
