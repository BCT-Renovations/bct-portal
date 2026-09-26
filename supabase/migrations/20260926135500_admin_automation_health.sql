-- Admin-only automation health summary used by the V46 launch dashboard.
create or replace function public.bct_frontend_admin_automation_health()
returns jsonb language sql stable security invoker set search_path=public,auth as $f$
select case when public.is_bct_admin() then jsonb_build_object(
 'runner_count',(select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in('bct_admin_run_launch_automations','bct_admin_run_200_launch_checks','bct_admin_run_500_launch_validations','bct_admin_run_1000_launch_requirements')),
 'catalog_total',(select count(*) from public.bct_automation_control_catalog),
 'catalog_enabled',(select count(*) from public.bct_automation_control_catalog where enabled),
 'runs_total',(select count(*) from public.bct_automation_runs),
 'runs_failed',(select count(*) from public.bct_automation_runs where status='failed'),
 'runs_running',(select count(*) from public.bct_automation_runs where status='running'),
 'last_run_at',(select max(started_at) from public.bct_automation_runs),
 'scheduler',case when exists(select 1 from pg_extension where extname='pg_cron') then 'database_scheduler_available' else 'not_configured' end
) else null end
$f$;
revoke all on function public.bct_frontend_admin_automation_health() from public,anon,authenticated;
grant execute on function public.bct_frontend_admin_automation_health() to authenticated;
