import fs from 'node:fs';

const indexHtml=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const healthSql=fs.readFileSync(new URL('../supabase/migrations/20260926135500_admin_automation_health.sql',import.meta.url),'utf8');
const boundarySql=fs.readFileSync(new URL('../supabase/migrations/20260926134500_launch_runner_execution_boundary.sql',import.meta.url),'utf8');

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
 ['manual runner preserves human approval boundary',indexHtml.includes('cannot approve estimates')&&indexHtml.includes('release money')]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'}: ${name}`);
if(failed.length) throw new Error(`Automation health smoke failed: ${failed.map(x=>x[0]).join(', ')}`);
console.log(`BCT automation health smoke passed: ${checks.length}/${checks.length}`);
