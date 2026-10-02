import fs from 'node:fs';

const b4=fs.readFileSync(new URL('../supabase/migrations/20261002093000_v46_portal_enforcement_batch4.sql',import.meta.url),'utf8').toLowerCase();
const b5=fs.readFileSync(new URL('../supabase/migrations/20261002100000_v46_portal_composition_batch5.sql',import.meta.url),'utf8').toLowerCase();

const must=[
 [b4,'alter table public.bct_site_assessments'],
 [b4,'observed_conditions_complete'],
 [b4,'homeowner_materials_review_complete'],
 [b4,'access_safety_complete'],
 [b4,'assessment_notes_complete'],
 [b4,'bct_submit_assessment_package'],
 [b4,'alter table public.bct_insurance_claims'],
 [b4,'representative_authorized'],
 [b4,'bct_admin_confirm_insurance_intake'],
 [b5,'bct_project_readiness_blockers'],
 [b5,'bct_homeowner_project_snapshot'],
 [b5,'what_happens_next'],
 [b5,'my_decisions'],
 [b5,"'money'"],
 [b5,"'today'"],
 [b5,'bct_my_property_portfolio_priority'],
 [b5,"'critical'"],
 [b5,"'urgent'"],
 [b5,"'completed'"],
 [b5,"'active'"],
 [b5,"'waiting'"]
];
for(const [src,t] of must) if(!src.includes(t)) throw new Error('Missing '+t);

const forbidden=[
 'create table public.bct_site_assessments',
 'create table public.bct_insurance_claims',
 'create table public.bct_project_readiness',
 'create table public.bct_homeowner_portal',
 'create table public.bct_property_manager_priority'
];
for(const t of forbidden) if((b4+'\n'+b5).includes(t)) throw new Error('Duplicate system detected: '+t);

if(!b4.includes("if not public.is_bct_admin()")) throw new Error('Insurance intake admin boundary missing');
if(!b5.includes("c.auth_user_id=auth.uid()")) throw new Error('Homeowner ownership check missing');
if(!b5.includes("mp.id=p.managed_property_id") || !b5.includes("mp.property_account_id=pa.id")) throw new Error('Property portfolio ownership scope missing');
if(b5.includes('resident_private_notes') || b5.includes('access_instructions')) throw new Error('Private household/access data leaked into homeowner snapshot');
console.log('V46 portal enforcement batches 4-5 smoke checks passed');
