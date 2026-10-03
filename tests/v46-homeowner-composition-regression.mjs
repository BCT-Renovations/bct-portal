import fs from 'node:fs';import assert from 'node:assert/strict';
const ui=fs.readFileSync('bct-homeowner-pages.js','utf8');
const shell=fs.readFileSync('index.html','utf8');
const sql=fs.readFileSync('supabase/migrations/20261002100000_v46_portal_composition_batch5.sql','utf8');
const actions=fs.readFileSync('supabase/migrations/20261002113000_v46_homeowner_portal_actions.sql','utf8');
for(const x of ['bct_homeowner_project_snapshot','what_happens_next','my_decisions','money','today','open_concerns'])assert.ok(sql.includes(x),'snapshot contract missing '+x);
for(const x of ['Today at My Home','What Happens Next','My Decisions','Money & Project Summary','bctLoadHomeownerProjectSnapshot'])assert.ok(ui.includes(x),'homeowner composition missing '+x);
assert.ok(shell.includes('/bct-homeowner-pages.js?v=20261002-1'),'homeowner page module is not loaded by V46 shell');
assert.ok(shell.includes('bctLoadHomeownerProjectSnapshot'),'project lookup does not hydrate homeowner composition');
for(const forbidden of ['contractor_bids','bct_internal_notes','site_access_code','lockbox_code'])assert.ok(!sql.includes(forbidden),'homeowner snapshot exposes forbidden '+forbidden);
console.log('V46 homeowner composition regression checks passed');
for(const x of ['bct_homeowner_report_problem','bct_homeowner_daily_feedback','bct_homeowner_home_record'])assert.ok(actions.includes(x),'homeowner action missing '+x);
for(const x of ['Report a Problem','Optional Daily Feedback','Your Home Record','Warranties & Products','Closeout Documents','Punch List'])assert.ok(ui.includes(x),'homeowner UI missing '+x);
assert.ok(actions.includes('c.auth_user_id=auth.uid()'),'homeowner action ownership guard missing');

for(const x of ["'customer_concern'","'customer_feedback'","'critical'","'high'"])assert.ok(actions.includes(x),'attention routing missing '+x);
assert.ok(actions.includes("c.homeowner_visible"),'Home Record closeout privacy gate missing');
assert.ok(actions.includes('security definer set search_path=public,auth,pg_temp'),'homeowner RPC hardened search path missing');
