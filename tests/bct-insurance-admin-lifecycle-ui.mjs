import fs from 'node:fs';import assert from 'node:assert/strict';const s=fs.readFileSync('bct-insurance-admin.js','utf8');
for(const x of ['Move to Construction','Mark Insurance Work Complete','bct_admin_activate_insurance_construction','bct_admin_complete_insurance_claim'])assert.ok(s.includes(x),x+' missing');
console.log('BCT Insurance Admin lifecycle UI checks passed');