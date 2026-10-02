import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002142000_v46_operational_closeout_hardening.sql','utf8');
for(const x of ['bct_operational_closeout_blockers','project_hold','punch_list','required_closeout','homeowner_concern','unreturned_site_key','bct_site_keys','public.is_bct_admin()'])assert.ok(sql.includes(x),'closeout coverage missing '+x);
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'closeout function search path not hardened');
console.log('V46 operational closeout regression checks passed');