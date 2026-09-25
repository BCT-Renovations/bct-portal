-- A populated Roofing catalog is required, not an absence of Roofing rows.
-- Keep the source-cutover blocker version-neutral until the latest build is live.
create or replace function public.bct_admin_frontend_cutover_readiness()
returns jsonb
language plpgsql
stable
set search_path = public, auth
as $$
declare
  v_missing_rpc text[];
  v_roofing int;
  v_lang_gap int;
  v_project_bucket boolean;
  v_contractor_bucket boolean;
  v_bad_project_all_policy int;
  v_home_rules jsonb;
  v_contractor_rules jsonb;
  v_flags jsonb;
  v_source boolean;
  v_browser boolean;
  v_blockers jsonb:='[]'::jsonb;
  v_external jsonb:='[]'::jsonb;
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
  select array_agg(req.name order by req.name) into v_missing_rpc from (values
    ('bct_frontend_public_bootstrap'),('bct_frontend_homeowner_state'),('bct_frontend_contractor_state'),('bct_frontend_admin_state'),('bct_frontend_homeowner_project'),('bct_frontend_contractor_application'),('bct_frontend_admin_project'),('bct_submit_homeowner_project'),('bct_submit_contractor_application'),('bct_submit_bid'),('bct_admin_award_bid'),('bct_admin_create_job'),('bct_admin_job_health_dashboard'),('bct_admin_refresh_job_health_alerts'),('bct_admin_job_health_alerts'),('bct_admin_update_service_call'),('bct_homeowner_respond_job_approval'),('bct_homeowner_sign_completion_certificate'),('bct_contractor_update_material_progress'),('bct_admin_set_payment_status'),('bct_admin_set_payout_status'),('bct_admin_issue_project_identifier'),('bct_admin_notification_delivery_queue'),('bct_accept_policy'),('bct_admin_generate_ai_estimate')
  ) req(name) where not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=req.name);
  select count(*) into v_roofing from public.bct_service_catalog where is_active and lower(code)='roofing';
  select count(*) into v_lang_gap from (select l.code from public.supported_languages l left join public.ui_translations t on t.language_code=l.code where l.is_active group by l.code having count(t.translation_key)<30) q;
  v_home_rules:=public.bct_homeowner_upload_rules(); v_contractor_rules:=public.bct_contractor_upload_rules(); v_flags:=public.bct_frontend_feature_flags();
  v_project_bucket:=coalesce((v_home_rules->>'private')::boolean,false) and v_home_rules->>'bucket'='bct-project-files';
  v_contractor_bucket:=coalesce((v_contractor_rules->>'private')::boolean,false) and v_contractor_rules->>'bucket'='bct-contractor-documents';
  select count(*) into v_bad_project_all_policy from pg_policies where schemaname='storage' and tablename='objects' and policyname='Customers own BCT project files' and cmd='ALL';
  select coalesce(is_complete,false) into v_source from public.bct_launch_controls where control_key='source_cutover_complete';
  select coalesce(is_complete,false) into v_browser from public.bct_launch_controls where control_key='browser_e2e_complete';
  if not coalesce(v_source,false) then v_blockers:=v_blockers||jsonb_build_array('Deploy the latest committed BCT portal source and verify the live Vercel page includes Job Health Dashboard'); end if;
  if coalesce(v_source,false) and not coalesce(v_browser,false) then v_blockers:=v_blockers||jsonb_build_array('Run end-to-end browser tests for homeowner, contractor, BCT Admin, Job Health, and financial workflows'); end if;
  if not coalesce((v_flags->>'outbound_email_provider_configured')::boolean,false) then v_external:=v_external||jsonb_build_array('Verify bct-notification-dispatch end-to-end with Resend, then mark the provider launch control complete'); end if;
  if not coalesce((v_flags->>'outbound_sms_worker_enabled')::boolean,false) then v_external:=v_external||jsonb_build_array('Optional: outbound SMS delivery worker/provider'); end if;
  if not coalesce((v_flags->>'ai_estimating_external_engine_enabled')::boolean,false) then v_external:=v_external||jsonb_build_array('Optional: external AI photo-vision estimating engine; internal BCT AI estimating is already enabled'); end if;
  if not coalesce((v_flags->>'acorn_provider_automation_enabled')::boolean,false) then v_external:=v_external||jsonb_build_array('Optional: Acorn provider status automation; customer prequalification link is enabled'); end if;
  v_external:=v_external||jsonb_build_array('Optional: third-party escrow/payment provider automation; BCT tracking and approvals are enabled');
  return jsonb_build_object(
    'backend_cutover_ready',coalesce(cardinality(v_missing_rpc),0)=0 and v_roofing>0 and v_lang_gap=0 and v_project_bucket and v_contractor_bucket and v_bad_project_all_policy=0,
    'missing_required_rpcs',coalesce(to_jsonb(v_missing_rpc),'[]'::jsonb),'roofing_catalog_rows',v_roofing,'language_translation_gaps',v_lang_gap,
    'private_project_bucket_ready',v_project_bucket,'private_contractor_bucket_ready',v_contractor_bucket,'broad_homeowner_storage_all_policy_count',v_bad_project_all_policy,
    'job_health_backend_ready',coalesce((v_flags->>'job_health_dashboard_enabled')::boolean,false),'job_health_alerts_ready',coalesce((v_flags->>'job_health_alerts_enabled')::boolean,false),
    'live_weather_backend_ready',coalesce((v_flags->>'weather_external_provider_enabled')::boolean,false),'qr_renderer_backend_ready',coalesce((v_flags->>'qr_rendering_enabled')::boolean,false),'barcode_renderer_backend_ready',coalesce((v_flags->>'barcode_rendering_enabled')::boolean,false),
    'transactional_notifications_ready',coalesce((v_flags->>'transactional_notification_events_enabled')::boolean,false),'email_worker_deployed',coalesce((v_flags->>'outbound_email_worker_deployed')::boolean,false),'email_provider_configured',coalesce((v_flags->>'outbound_email_provider_configured')::boolean,false),'ai_internal_engine_ready',coalesce((v_flags->>'ai_estimating_internal_engine_enabled')::boolean,false),
    'source_cutover_required',not coalesce(v_source,false),'source_cutover_blockers',v_blockers,'external_integrations_pending',v_external
  );
end;
$$;
