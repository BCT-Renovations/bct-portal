import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261002003500_bct_insurance_admin_member_controls.sql','utf8');
for(const x of ['public.is_bct_admin()','bct_admin_set_insurance_member_status','bct_insurance_org_admin_assign_claim','bct_insurance_org_admin_of','bct_insurance_org_active'])assert.ok(s.includes(x),x+' missing');
assert.ok(s.includes("m.status='active'"),'claim reassignment must target active member');
console.log('BCT Insurance Admin/member control checks passed');