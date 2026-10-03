import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002148000_v46_daily_field_report_completion.sql','utf8');
for(const x of ['bct_complete_daily_field_report','bct_admin_daily_log_summary','crew_present','issue_summary','next_steps','photo_refs','bct_user_assigned_to_project'])assert.ok(sql.includes(x),'daily field report coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'daily report Admin path missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'daily field report hardened search path missing');
assert.ok(sql.includes("jsonb_typeof(coalesce(p_crew_present,'[]'::jsonb))<>'array'"),'crew array validation missing');
console.log('V46 daily field report regression checks passed');