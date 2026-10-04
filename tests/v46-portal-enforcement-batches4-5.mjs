import fs from 'node:fs';

const b4=fs.readFileSync(new URL('../supabase/migrations/20261002093000_v46_portal_enforcement_batch4.sql',import.meta.url),'utf8').toLowerCase();
const b5=fs.readFileSync(new URL('../supabase/migrations/20261002100000_v46_portal_composition_batch5.sql',import.meta.url),'utf8').toLowerCase();

const must=[
 [b4,'alter table public.bct_site_assessments'],[b4,'observed_conditions_complete'],
 [b4,'homeowner_materials_review_complete'],[b4,'access_safety_complete'],[b4,'assessment_notes_complete'],
 [b4,'bct_submit_assessment_package'],
 [b5,'bct_project_readiness_blockers'],[b5,'bct_homeowner_project_snapshot'],
 [b5,'what_happens_next'],[b5,'my_decisions'],[b5,"'money'"],[b5,"'today'"],
 [b5,'bct_my_property_portfolio_priority'],[b5,"'critical'"],[b5,"'urgent'"],[b5,"'completed'"],[b5,"'active'"],[b5,"'waiting'"]
];
for(const [src,t] of must) if(!src.includes(t)) throw new Error('Missing '+t);

for(const t of ['create table public.bct_site_assessments','create table public.bct_insurance_claims','create table public.bct_project_readiness','create table public.bct_homeowner_portal','create table public.bct_property_manager_priority'])
 if((b4+'\n'+b5).includes(t)) throw new Error('Duplicate system detected: '+t);

if(b4.includes('alter table public.bct_insurance_claims') || b4.includes('bct_admin_confirm_insurance_intake')) throw new Error('Stale legacy insurance intake returned to Batch4');
if(!b5.includes("c.auth_user_id=auth.uid()")) throw new Error('Homeowner ownership check missing');
if((!b5.includes("mp.id=p.managed_property_id") && !b5.includes("p.managed_property_id=mp.id")) || ((!b5.includes("mp.property_account_id=pa.id")) && (!b5.includes("pa.id=mp.property_account_id"))) || !b5.includes("mp.active"))
 throw new Error('Property portfolio ownership scope missing');
if(!b5.includes("pa.auth_user_id=auth.uid()") || !b5.includes("pa.active"))
 throw new Error('Property account owner boundary missing');
if(b5.includes('resident_private_notes') || b5.includes('access_instructions') || b5.includes('access_code') || b5.includes('contractor_bid'))
 throw new Error('Private/internal data leaked into homeowner snapshot');
if(!b5.includes('security definer') || !b5.includes("if auth.uid() is null")) throw new Error('Homeowner RPC auth gate missing');
if(!b5.includes("if not public.is_bct_admin() and not exists")) throw new Error('Homeowner ownership/admin gate missing');
if(!b4.includes("a.estimator_user_id is distinct from auth.uid()")) throw new Error('Estimator assignment ownership gate missing');
if(!b4.includes("revoke all on function public.bct_submit_assessment_package")) throw new Error('Estimator RPC public revoke missing');

console.log('V46 portal enforcement batches 4-5 security regression checks passed');
