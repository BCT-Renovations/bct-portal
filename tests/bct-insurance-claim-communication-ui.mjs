import fs from 'node:fs';import assert from 'node:assert/strict';const s=fs.readFileSync('bct-insurance-portal.js','utf8');
for(const x of ['Claim Communication','bct_insurance_add_claim_message','bct_insurance_respond_to_information_request',"claimStatus!=='needs_information'"])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('contractor_bids'),'adjuster UI must not expose contractor bids');
console.log('BCT Insurance claim communication UI checks passed');