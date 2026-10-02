import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261002001500_bct_insurance_mutation_access_guard.sql','utf8');
for(const x of ['bct_insurance_add_claim_message','bct_insurance_submit_supplement','bct_insurance_can_read_claim'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('bct_insurance_member_of(c.organization_id)'),'same-org membership alone must not authorize claim mutation');
assert.ok(s.includes("c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized','construction')"),'supplement state guard missing');
console.log('BCT Insurance per-claim mutation checks passed');