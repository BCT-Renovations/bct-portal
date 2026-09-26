import fs from 'node:fs';

const indexHtml=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const healthSql=fs.readFileSync(new URL('../supabase/migrations/20260926135500_admin_automation_health.sql',import.meta.url),'utf8');
const boundarySql=fs.readFileSync(new URL('../supabase/migrations/20260926134500_launch_runner_execution_boundary.sql',import.meta.url),'utf8');
const runner500Sql=fs.readFileSync(new URL('../supabase/migrations/20260926154500_reconcile_500_launch_runner.sql',import.meta.url),'utf8');
const runner1000Sql=fs.readFileSync(new URL('../supabase/migrations/20260926155000_reconcile_1000_launch_runner.sql',import.meta.url),'utf8');
const notificationSql=fs.readFileSync(new URL('../supabase/migrations/20260926143500_admin_notification_health.sql',import.meta.url),'utf8');
const safetyHistorySql=fs.readFileSync(new URL('../supabase/migrations/20260926153500_admin_permanent_safety_training_history.sql',import.meta.url),'utf8');

const checks=[
 ['admin automation health RPC',healthSql.includes('bct_frontend_admin_automation_health')],
 ['four launch runners counted',healthSql.includes("'runner_count'")&&healthSql.includes('bct_admin_run_1000_launch_requirements')],
 ['failed runs visible',healthSql.includes("'runs_failed'")],
 ['running runs visible',healthSql.includes("'runs_running'")],
 ['last run visible',healthSql.includes("'last_run_at'")],
 ['scheduler state truthful',healthSql.includes("'not_configured'")&&healthSql.includes('pg_cron')],
 ['admin authorization required',healthSql.includes('public.is_bct_admin()')],
 ['anonymous health access revoked',healthSql.includes('from public,anon,authenticated')],
 ['anonymous runner access revoked',boundarySql.includes('from public, anon')],
 ['authenticated runner execution retained',boundarySql.includes('to authenticated')],
 ['admin UI requests automation health',indexHtml.includes("rpc('bct_frontend_admin_automation_health')")],
 ['admin UI labels automation health',indexHtml.includes('Automation Health')],
 ['admin UI shows failed runs',indexHtml.includes("controlLine('Failed Runs'")],
 ['admin UI shows scheduler',indexHtml.includes("controlLine('Scheduler'")],
 ['admin UI avoids fake run time',indexHtml.includes('No recorded run yet')],
 ['manual launch checks button exists',indexHtml.includes('id="runLaunchChecksBtn"')],
 ['manual launch runner exists',indexHtml.includes('runAdminLaunchChecks')],
 ['100-control runner wired',indexHtml.includes("bct_admin_run_launch_automations")],
 ['200-control runner wired',indexHtml.includes("bct_admin_run_200_launch_checks")],
 ['500-control runner wired',indexHtml.includes("bct_admin_run_500_launch_validations")],
 ['1000-control runner wired',indexHtml.includes("bct_admin_run_1000_launch_requirements")],
 ['manual runner preserves human approval boundary',indexHtml.includes('cannot approve estimates')&&indexHtml.includes('release money')],
 ['500 runner exact source preserved',runner500Sql.includes('bct_admin_run_500_launch_validations')&&runner500Sql.includes('checks_processed=500')],
 ['1000 runner exact source preserved',runner1000Sql.includes('bct_admin_run_1000_launch_requirements')&&runner1000Sql.includes('checks_processed=1000')],
 ['500 runner checks RLS',runner500Sql.includes('RLS disabled on BCT public table')],
 ['500 runner checks anonymous sensitive grants',runner500Sql.includes('Anonymous privilege exists on sensitive BCT data')],
 ['500 runner checks estimate approval actor',runner500Sql.includes('Approved estimate missing BCT actor')],
 ['500 runner checks escrow dual approval',runner500Sql.includes('Released escrow missing dual approval')],
 ['500 runner checks critical job health',runner500Sql.includes('Unresolved critical job health')],
 ['500 runner checks closeout prerequisites',runner500Sql.includes('Closed project violates closeout prerequisites')],
 ['1000 runner checks positive bids',runner1000Sql.includes('Contractor bid contains nonpositive amount')],
 ['1000 runner checks estimate totals',runner1000Sql.includes('Estimate total is negative')],
 ['1000 runner checks change order review',runner1000Sql.includes('Change order waiting for BCT review')],
 ['1000 runner checks late materials',runner1000Sql.includes('Late vendor/material order')],
 ['1000 runner checks failed inspections',runner1000Sql.includes('Failed inspection requires corrective workflow')],
 ['notification health RPC preserved',notificationSql.includes('bct_admin_notification_health')],
 ['notification UI health wired',indexHtml.includes("rpc('bct_admin_notification_health')")&&indexHtml.includes('Notification Delivery Health')],
 ['permanent safety history source preserved',safetyHistorySql.includes('bct_admin_safety_training_history')],
 ['permanent safety history UI wired',indexHtml.includes('adminSafetyHistory')&&indexHtml.includes('Permanent Training Records')]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'}: ${name}`);
if(failed.length) throw new Error(`Automation health smoke failed: ${failed.map(x=>x[0]).join(', ')}`);
console.log(`BCT automation health smoke passed: ${checks.length}/${checks.length}`);
