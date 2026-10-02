import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261002004500_bct_insurance_project_handoff_boundary.sql','utf8');
for(const x of ['bct_admin_prepare_insurance_project_handoff','bct_admin_link_insurance_claim_to_project','public.is_bct_admin()','public.bct_projects','bct_insurance_claims_project_unique','already linked to another insurance claim'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('insert into public.bct_projects'),'insurance handoff must never create a parallel project');
assert.ok(!s.includes('bct_submit_homeowner_project'),'insurance handoff must not impersonate homeowner submission');
console.log('BCT Insurance project-handoff boundary checks passed');