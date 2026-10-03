import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002144000_v46_delivery_scheduling_hardening.sql','utf8');
for(const x of ['bct_admin_confirm_vendor_delivery','bct_refresh_delivery_schedule_attention','bct_sync_delivery_attention_on_receipt','delivery_window_end','delivery_confirmed_at','site_ready_confirmed_at','delivery_schedule','bct_vendor_orders','bct_action_inbox'])assert.ok(sql.includes(x),'delivery scheduling coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'delivery scheduling Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'delivery scheduling hardened search path missing');
assert.ok(sql.includes("after update of received_at"),'delivery attention recovery trigger missing');
console.log('V46 delivery scheduling regression checks passed');