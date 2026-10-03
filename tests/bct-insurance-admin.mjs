import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('bct-insurance-admin.js','utf8');
for(const x of ['BCT Insurance Portal','Insurance Claims','bct_admin_review_insurance_claim','accepted','needs_information','declined'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('contractor_bids'),'insurance admin view must not introduce contractor bid exposure');
assert.ok(s.includes('does not create a construction job'),'review UI must preserve the project-creation boundary');
console.log('BCT Insurance Admin review checks passed');