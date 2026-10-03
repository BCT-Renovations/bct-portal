import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('bct-insurance-portal.js','utf8');
assert.ok(s.includes('Verified from your approved account'));
assert.ok(!s.includes('name="organization_id" required'),'manual organization UUID input must be removed');
assert.ok(s.includes('organization_id=member.organization_id'),'claim organization must come from signed-in membership');
assert.ok(s.includes("eq('status','active')"),'membership must be active');
console.log('BCT Insurance membership-bound intake checks passed');