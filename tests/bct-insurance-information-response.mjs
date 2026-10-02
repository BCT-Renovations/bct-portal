import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261002000500_bct_insurance_information_response.sql','utf8');
for(const x of ['bct_insurance_respond_to_information_request',"c.status<>'needs_information'","status='bct_review'",'bct_insurance_can_read_claim'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes("status='accepted'"),'carrier response must not accept a claim');
assert.ok(!s.includes("status='authorized'"),'carrier response must not authorize construction');
console.log('BCT Insurance information-response checks passed');