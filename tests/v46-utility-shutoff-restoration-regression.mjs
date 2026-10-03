import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002153000_v46_utility_shutoff_restoration.sql','utf8');
for(const x of ['bct_admin_authorize_utility_interruption','bct_admin_record_utility_shutoff','bct_admin_restore_utility','bct_refresh_utility_restoration_attention','authorized_by','actual_shutoff_at','safe_restoration_confirmed','utility_not_restored'])assert.ok(sql.includes(x),'utility lifecycle coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'utility lifecycle Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'utility lifecycle hardened search path missing');
assert.ok(sql.includes('Safe restoration confirmation required'),'utility safe-restoration guard missing');
console.log('V46 utility shutoff/restoration regression checks passed');