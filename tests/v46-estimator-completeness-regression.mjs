import fs from 'node:fs';

const base=fs.readFileSync(new URL('../supabase/migrations/20260930232500_estimator_system.sql',import.meta.url),'utf8').toLowerCase();
const bid=fs.readFileSync(new URL('../supabase/migrations/20261001001500_estimator_contractor_conflict_guard.sql',import.meta.url),'utf8').toLowerCase();
const assign=fs.readFileSync(new URL('../supabase/migrations/20261001195000_estimator_performing_contractor_assignment_guard.sql',import.meta.url),'utf8').toLowerCase();
const ext=fs.readFileSync(new URL('../supabase/migrations/20261002093000_v46_portal_enforcement_batch4.sql',import.meta.url),'utf8').toLowerCase();

const required=[
 [base,'bct_estimator_applications'],[base,'bct_estimator_profiles'],[base,'bct_site_assessments'],
 [base,'fee_paid_at'],[base,'bct_accepted_complete'],[base,'estimator_assignment_fee'],
 [base,'extra_travel_preapproved'],[base,'extra_travel_amount'],[base,'bct_complete_site_assessment'],
 [base,'bct_submit_assessment_package'],[bid,'bct_guard_estimator_bid_conflict'],
 [bid,'not public.bct_estimator_conflict'],[assign,'bct_guard_assignment_estimator_separation'],
 [ext,'observed_conditions_complete'],[ext,'homeowner_materials_review_complete'],
 [ext,'access_safety_complete'],[ext,'assessment_notes_complete'],
 [ext,"a.estimator_user_id is distinct from auth.uid()"],[ext,"if auth.uid() is null"],
 [ext,"p_package->>'measurements'"],[ext,"p_package->>'conditions'"],[ext,"p_package->>'notes'"]
];
for(const [src,t] of required) if(!src.includes(t)) throw new Error('Estimator completeness gate missing: '+t);

if(!base.includes("a.site_visit_complete and a.photos_complete and a.measurements_complete"))
 throw new Error('Estimator payment completeness predicate missing');
if(!base.includes("and a.documentation_complete and a.bct_accepted_complete"))
 throw new Error('BCT acceptance payment gate missing');
if(!base.includes("if new.extra_travel_amount>0 and not new.extra_travel_preapproved"))
 throw new Error('Travel preapproval gate missing');
if(!base.includes("if a.status <> 'scheduled'") || !base.includes("if a.fee_paid_at is null"))
 throw new Error('Paid scheduled field-completion gate missing');
if(!bid.includes('before insert or update of contractor_id,job_id on public.bct_bids'))
 throw new Error('Bid separation trigger missing');
if(!assign.includes('before insert or update of contractor_id,project_id on public.bct_assignments'))
 throw new Error('Performing-contractor separation trigger missing');
if(!ext.includes('revoke all on function public.bct_submit_assessment_package'))
 throw new Error('Estimator submit RPC public revoke missing');

console.log('V46 estimator completeness and separation-of-duties regression checks passed');
