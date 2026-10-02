import fs from 'node:fs';import assert from 'node:assert/strict';const s=fs.readFileSync('bct-insurance-admin.js','utf8');
for(const x of ['Prepare Project Handoff','bct_admin_prepare_insurance_project_handoff','canonical BCT project','project_id'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('bct_submit_homeowner_project'),'Admin UI must not fake homeowner project creation');
console.log('BCT Insurance Admin handoff UI checks passed');