import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../supabase/migrations/20261002050000_contractor_identity_trade_leads.sql',import.meta.url),'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};

[
 'contractorProfilePhoto','governmentIdFront','governmentIdBack','governmentIdHasBack',
 'contractorTradeLicense','profile_photo','government_id_front','government_id_back',
 'contractor_trade_license',"One clear contractor profile photo is required.",
 "Government ID front is required.","Government ID back is required when your ID has information on the back."
].forEach(x=>assert(html.includes(x),'Missing contractor identity UI marker: '+x));

[
 'bct_contractor_identity_profiles','bct_project_trade_leads',
 'bct_admin_review_contractor_profile_photo','bct_admin_set_project_trade_lead',
 'bct_homeowner_project_trade_leads',"d.document_type='profile_photo'",
 "ip.profile_photo_status='approved'","l.homeowner_visible",
 "p.homeowner_id=auth.uid()"
].forEach(x=>assert(sql.includes(x),'Missing contractor identity security marker: '+x));

assert(!/government_id_(front|back).*bct_homeowner_project_trade_leads/s.test(sql),
 'Homeowner trade-lead function must never expose government ID document types.');
console.log('BCT contractor identity/trade-lead smoke passed.');
