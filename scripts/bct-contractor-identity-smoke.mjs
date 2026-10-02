import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../supabase/migrations/20261002050000_contractor_identity_trade_leads.sql',import.meta.url),'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};

[
 'contractorProfilePhoto','governmentIdFront','governmentIdBack','governmentIdHasBack',
 'contractorTradeLicense','profile_photo','government_id_front','government_id_back',
 'contractor_trade_license',"One clear contractor profile photo is required.",
 "Government ID front is required.","Government ID back is required when your ID has information on the back.",
 'Who’s Coming','Profile Photo','Government ID — Front','Contractor / Trade License'
].forEach(x=>assert(html.includes(x),'Missing contractor identity UI marker: '+x));

[
 'bct_contractor_identity_profiles','bct_project_trade_leads',
 'bct_admin_review_contractor_profile_photo','bct_admin_set_project_trade_lead',
 'bct_homeowner_project_trade_leads','bct_homeowner_contractor_profile_photo_path',
 'bct_contractor_identity_required_documents_ready','trg_bct_assignment_trade_lead_visibility',
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
console.log('BCT contractor identity/trade-lead smoke passed.');
