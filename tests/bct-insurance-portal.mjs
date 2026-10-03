import fs from 'node:fs';import assert from 'node:assert/strict';
const portal=fs.readFileSync('bct-insurance-portal.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261001230000_bct_insurance_portal_foundation.sql','utf8');
for(const s of ['BCT INSURANCE PORTAL','Submit Claim Assignment to BCT','My Authorized Claims','bct_insurance_members','bct_insurance_partner_claims']) assert.ok(portal.includes(s),s+' missing');
assert.ok(portal.includes("bct_insurance_submit_claim"),'claim intake must use the constrained server RPC');
assert.ok(!portal.includes(".from('bct_insurance_claims').insert("),'browser must not directly insert insurance claims');
for(const s of ['enable row level security','bct_insurance_member_of','bct_insurance_submit_claim',"'bct_review'",'bct_admin_review_insurance_claim']) assert.ok(migration.includes(s),s+' security guard missing');
assert.ok(!migration.includes('contractor_bids'),'insurance foundation must not expose contractor bids');
console.log('BCT Insurance Portal secure foundation checks passed');