import fs from 'node:fs';import assert from 'node:assert/strict';const s=fs.readFileSync('supabase/migrations/20261002005500_bct_insurance_linked_project_lifecycle.sql','utf8');
for(const x of ['bct_admin_activate_insurance_construction','bct_admin_complete_insurance_claim','canonical BCT project','public.bct_projects',"status='construction'","status='completed'"])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('insert into public.bct_projects'),'lifecycle guard must never create projects');
console.log('BCT Insurance linked-project lifecycle checks passed');