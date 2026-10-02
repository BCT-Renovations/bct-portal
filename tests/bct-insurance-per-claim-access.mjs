import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261001234500_bct_insurance_per_claim_access.sql','utf8');
for(const x of ['bct_insurance_org_admin_of','bct_insurance_can_read_claim','assigned_adjuster_user_id=auth.uid()','submitted_by=auth.uid()','insurance_claim_authorized_read'])assert.ok(s.includes(x),x+' missing');
assert.ok(!s.includes('using (public.bct_insurance_member_of(organization_id));'),'broad organization-wide adjuster claim read must not remain');
console.log('BCT Insurance Portal per-claim access checks passed');