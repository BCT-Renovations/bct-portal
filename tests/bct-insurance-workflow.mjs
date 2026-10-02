import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261001233000_bct_insurance_claim_workflow.sql','utf8');
for(const x of ['bct_insurance_claim_events','bct_insurance_add_claim_message','bct_insurance_submit_supplement','bct_admin_set_insurance_authorization',"visibility='insurance_and_bct'"])assert.ok(s.includes(x),x+' missing');
assert.ok(s.includes('not public.bct_insurance_member_of'),'insurance mutation must enforce organization membership');
assert.ok(s.includes('not public.is_bct_admin()'),'authorization must remain BCT-admin controlled');
assert.ok(s.includes('no project creation/link RPC yet'),'project conversion must remain gated until existing project contract is inspected');
console.log('BCT Insurance Portal workflow security checks passed');