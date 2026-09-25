-- BCT launch security smoke checks.
-- Run in Supabase SQL Editor before opening the customer pilot.
-- Expected result: every row should return pass = true.

with checks as (
  select
    'no_public_execute_on_admin_rpcs' as check_name,
    not exists (
      select 1
      from information_schema.routine_privileges rp
      where rp.routine_schema = 'public'
        and rp.grantee = 'PUBLIC'
        and rp.privilege_type = 'EXECUTE'
        and (
          rp.routine_name like 'bct_admin_%'
          or rp.routine_name in (
            'bct_frontend_admin_state',
            'bct_frontend_admin_project',
            'bct_admin_job_health_dashboard',
            'bct_admin_frontend_cutover_readiness',
            'bct_admin_launch_readiness'
          )
        )
    ) as pass,
    'Admin RPCs should not be executable by PUBLIC.' as detail

  union all

  select
    'password_history_direct_access_denied',
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'bct_password_history'
        and policyname = 'Deny direct password history access'
        and cmd = 'ALL'
    ),
    'Password history should remain reachable only through self-scoped password RPCs.'

  union all

  select
    'no_broad_homeowner_storage_all_policy',
    not exists (
      select 1
      from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname = 'Customers own BCT project files'
        and cmd = 'ALL'
    ),
    'Homeowner project storage should use narrow insert/select/update policies instead of one broad ALL policy.'

  union all

  select
    'unexpected_security_definer_count_zero',
    not exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname like 'bct_%'
        and p.prosecdef
        and p.proname not in (
          'bct_frontend_public_bootstrap',
          'bct_log_detailed_audit_event',
          'bct_emit_notification',
          'bct_sync_public_launch_config',
          'bct_validate_password_not_recent',
          'bct_record_password_history'
        )
    ),
    'Only allow-listed internal BCT functions should be SECURITY DEFINER.'
)
select *
from checks
order by check_name;
