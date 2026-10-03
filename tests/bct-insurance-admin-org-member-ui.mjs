import fs from'node:fs';import assert from'node:assert/strict';const s=fs.readFileSync('bct-insurance-admin.js','utf8');
for(const x of ['Insurance Organization Management','Insurance Member Management','bct_admin_create_insurance_organization','bct_admin_set_insurance_org_status','bct_admin_set_insurance_member_status'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes(".from('bct_insurance_members').insert"),'Admin UI must use controlled member RPC');
console.log('Insurance Admin organization/member UI checks passed');