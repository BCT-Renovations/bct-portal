import fs from'node:fs';import assert from'node:assert/strict';const s=fs.readFileSync('bct-insurance-admin.js','utf8');
for(const x of ['Link Existing BCT Project','Correct Project Link','bct_admin_link_insurance_claim_to_project','bct_admin_unlink_insurance_claim_project','Existing canonical BCT Project ID'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes("from('bct_projects').insert"),'Insurance Admin must not directly create projects');
console.log('Insurance Admin project-link UI checks passed');