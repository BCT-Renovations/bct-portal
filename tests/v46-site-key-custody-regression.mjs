import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002149000_v46_site_key_custody_lifecycle.sql','utf8');
for(const x of ['bct_admin_issue_site_key','bct_admin_return_site_key','bct_refresh_site_key_custody_attention','checked_out_at','returned_at','access_purpose','issued_by','unreturned_site_key'])assert.ok(sql.includes(x),'site key custody coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'site key custody Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'site key custody hardened search path missing');
console.log('V46 site key custody regression checks passed');