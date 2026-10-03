import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002151000_v46_delivery_custody_completion.sql','utf8');
const lifecycle=fs.readFileSync('supabase/migrations/20261002140000_v46_field_control_lifecycle_hardening.sql','utf8');
for(const x of ['bct_admin_complete_delivery_custody','quantity_expected','quantity_received','secured_location','delivery_ticket_path','transferred_to','transferred_at'])assert.ok(sql.includes(x),'delivery custody coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'delivery custody Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'delivery custody hardened search path missing');
assert.ok(lifecycle.includes('d.quantity_received<d.quantity_expected'),'delivery quantity discrepancy attention missing');
console.log('V46 delivery custody regression checks passed');