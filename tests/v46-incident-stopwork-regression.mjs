import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002152000_v46_incident_stopwork_lifecycle.sql','utf8');
for(const x of ['bct_admin_assess_incident','bct_admin_resolve_incident','bct_refresh_stop_work_attention','immediate_safety_response','assessment_notes','follow_up_required','follow_up_notes','closed_at','closed_by','active_stop_work','incident_follow_up'])assert.ok(sql.includes(x),'incident/stop-work coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'incident/stop-work Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'incident/stop-work hardened search path missing');
assert.ok(sql.includes('Incident follow-up notes are required before closure'),'incident follow-up closure guard missing');
console.log('V46 incident and stop-work lifecycle regression checks passed');