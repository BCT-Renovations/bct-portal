import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002147000_v46_neighbor_property_issue_lifecycle.sql','utf8');
for(const x of ['bct_refresh_neighbor_property_attention','bct_admin_resolve_neighbor_property_issue','neighbor_property_issue','resolution_notes','resolved_by','bct_neighbor_property_conditions','bct_action_inbox'])assert.ok(sql.includes(x),'neighbor issue lifecycle missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'neighbor issue Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'neighbor issue hardened search path missing');
assert.ok(sql.includes("set bct_review_status='resolved'"),'neighbor resolution state missing');
console.log('V46 neighbor property issue regression checks passed');