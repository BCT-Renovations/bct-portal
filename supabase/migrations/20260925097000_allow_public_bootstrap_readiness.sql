-- The public bootstrap RPC is intentionally SECURITY DEFINER and returns only
-- allow-listed public configuration. Keep it visible to the security advisor,
-- but do not misclassify it as an unexpected BCT admin definer.
create or replace function public.bct_admin_launch_readiness()
returns jsonb
language plpgsql
stable
set search_path = public, auth
as $$
declare
  v_current_profile_missing int;
  v_domain_profile_gaps int;
  v_roofing int;
  v_lang_gaps int;
  v_orphan_projects int;
  v_orphan_jobs int;
  v_unexpected_definers int;
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
  select case when exists(select 1 from public.user_profiles p where p.user_id=auth.uid()) then 0 else 1 end into v_current_profile_missing;
  select count(*) into v_domain_profile_gaps
  from (select c.auth_user_id uid from public.bct_customers c where c.auth_user_id is not null
        union select c.auth_user_id from public.bct_contractors c where c.auth_user_id is not null
        union select a.auth_user_id from public.bct_contractor_applications a where a.auth_user_id is not null) d
  left join public.user_profiles p on p.user_id=d.uid where p.user_id is null;
  select count(*) into v_roofing from public.bct_service_catalog where lower(code)='roofing' or lower(display_name)='roofing';
  select count(*) into v_lang_gaps from public.supported_languages l where l.is_active and (select count(*) from public.ui_translations t where t.language_code=l.code)<>30;
  select count(*) into v_orphan_projects from public.bct_projects p left join public.bct_customers c on c.id=p.customer_id where c.id is null;
  select count(*) into v_orphan_jobs from public.bct_jobs j left join public.bct_projects p on p.id=j.project_id where p.id is null;
  select count(*) into v_unexpected_definers
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'bct_%' and p.prosecdef
    and p.proname not in ('bct_frontend_public_bootstrap','bct_log_detailed_audit_event','bct_emit_notification','bct_sync_public_launch_config','bct_validate_password_not_recent','bct_record_password_history');
  return jsonb_build_object(
    'current_admin_profile_missing',v_current_profile_missing,
    'domain_user_profile_gaps',v_domain_profile_gaps,
    'roofing_catalog_rows',v_roofing,
    'language_translation_gaps',v_lang_gaps,
    'orphan_projects',v_orphan_projects,
    'orphan_jobs',v_orphan_jobs,
    'security_definer_bct_functions',v_unexpected_definers,
    'approved_internal_security_definer_count',(select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('bct_frontend_public_bootstrap','bct_log_detailed_audit_event','bct_emit_notification','bct_sync_public_launch_config','bct_validate_password_not_recent','bct_record_password_history') and p.prosecdef),
    'ready_for_frontend_integration',(v_current_profile_missing=0 and v_domain_profile_gaps=0 and v_roofing>0 and v_lang_gaps=0 and v_orphan_projects=0 and v_orphan_jobs=0 and v_unexpected_definers=0)
  );
end;
$$;
