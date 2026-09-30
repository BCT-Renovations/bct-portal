-- V46 safety gate: manual weather logging stays live, but the external
-- weather provider remains off until BCT approves provider configuration,
-- billing/limits, and failure handling. This matches WEATHER_PROVIDER_READINESS.md.
create or replace function public.bct_frontend_feature_flags()
returns jsonb
language sql
stable
set search_path to 'public'
as $function$
select jsonb_build_object(
 'frontend_api_version','2026.09.24-launch-14','roofing_enabled',false,'private_project_storage_enabled',true,'private_contractor_storage_enabled',true,'translation_enabled',true,'localized_service_catalog_enabled',true,
 'homeowner_portal_enabled',true,'contractor_portal_enabled',true,'admin_portal_enabled',true,'job_health_dashboard_enabled',true,'job_health_alerts_enabled',true,
 'completion_ratings_enabled',true,'mutual_customer_contractor_ratings_enabled',true,'case_management_enabled',true,'dispute_management_enabled',true,'document_expiration_alerts_enabled',true,'bookkeeping_exports_enabled',true,'accounting_summary_enabled',true,
 'electronic_signatures_enabled',true,'electronic_signature_audit_enabled',true,'contract_signature_hashing_enabled',true,'role_permissions_enabled',true,'tamper_evident_audit_hashing_enabled',true,'client_error_tracking_enabled',true,'config_backup_snapshots_enabled',true,
 'admin_mfa_supported',true,'admin_mfa_enforced',coalesce((select admin_mfa_enforced from public.bct_security_settings where singleton),false),'admin_mfa_ui_ready',coalesce((select admin_mfa_ui_ready from public.bct_security_settings where singleton),false),
 'financing_tracking_enabled',true,'acorn_customer_financing_link_enabled',true,'escrow_tracking_enabled',true,'service_call_tracking_enabled',true,'ai_estimating_enabled',true,'ai_estimating_internal_engine_enabled',true,'ai_estimating_external_engine_enabled',false,'ai_estimating_admin_review_required',true,
 'weather_external_provider_enabled',false,'weather_provider','Open-Meteo','weather_edge_function','bct-weather-refresh','barcode_rendering_enabled',true,'barcode_edge_function','bct-project-barcode','qr_rendering_enabled',true,'qr_edge_function','bct-project-qr',
 'outbound_email_worker_deployed',true,'outbound_email_worker','bct-notification-dispatch','outbound_email_provider_configured',coalesce((select is_complete from public.bct_launch_controls where control_key='outbound_email_provider_configured'),false),'outbound_sms_worker_enabled',false,
 'supported_language_count',(select count(*) from public.supported_languages where is_active),'active_service_count',(select count(*) from public.bct_service_catalog where is_active)
)
$function$;
