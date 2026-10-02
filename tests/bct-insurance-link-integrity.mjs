import fs from 'node:fs';import assert from 'node:assert/strict';const s=fs.readFileSync('supabase/migrations/20261002010500_bct_insurance_link_integrity.sql','utf8');
for(const x of ['bct_admin_link_insurance_claim_to_project','bct_admin_unlink_insurance_claim_project','Unlink reason is required',"c.status in('construction','completed','closed')",'previous_project_id'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('insert into public.bct_projects'),'link integrity migration must never create a project');
console.log('BCT Insurance project-link integrity checks passed');