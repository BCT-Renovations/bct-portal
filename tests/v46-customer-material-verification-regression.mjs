import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002150000_v46_customer_material_verification.sql','utf8');
for(const x of ['bct_admin_verify_customer_material','bct_refresh_customer_material_attention','quantity_verified','verification_status','storage_location','additional_material_required','customer_material_issue','bct_customer_materials'])assert.ok(sql.includes(x),'customer material coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'customer material Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'customer material hardened search path missing');
assert.ok(sql.includes('quantity_verified<m.quantity_claimed'),'customer material shortage detection missing');
console.log('V46 homeowner material verification regression checks passed');