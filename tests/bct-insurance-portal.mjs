import fs from 'node:fs';import assert from 'node:assert/strict';
const portal=fs.readFileSync('bct-insurance-portal.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261002030000_bct_insurance_portal_foundation.sql','utf8');
for(const s of ['BCT INSURANCE PORTAL','Submit Claim Assignment to BCT','My Authorized Claims','bct_insurance_members','bct_insurance_claims']) assert.ok(portal.includes(s),s+' missing');
assert.ok(portal.includes("status:'submitted'")&&portal.includes("authorization_status:'pending'"),'claim intake must enter BCT review without authorization');
for(const s of ['enable row level security','bct_insurance_member_of','project_id is null',"status='submitted'","authorization_status='pending'"]) assert.ok(migration.includes(s),s+' security guard missing');
assert.ok(!migration.includes('contractor_bids'),'insurance foundation must not expose contractor bids');
console.log('BCT Insurance Portal static foundation checks passed');