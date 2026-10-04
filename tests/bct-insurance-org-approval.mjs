import fs from 'node:fs';
import assert from 'node:assert/strict';
// V46 partner-claims isolation contract.

const s = fs.readFileSync(
  'supabase/migrations/20261001235500_bct_insurance_org_approval_guard.sql',
  'utf8'
);

for (const x of [
  'bct_insurance_org_active',
  'bct_admin_set_insurance_org_status',
  'Insurance organization is not active',
  'bct_insurance_partner_claims',
  'revoke insert,update,delete on public.bct_insurance_partner_claims'
]) {
  assert.ok(s.includes(x), x + ' missing');
}

assert.ok(
  s.includes('public.is_bct_admin()'),
  'carrier activation must remain BCT-controlled'
);

console.log('BCT Insurance Portal organization approval checks passed');
