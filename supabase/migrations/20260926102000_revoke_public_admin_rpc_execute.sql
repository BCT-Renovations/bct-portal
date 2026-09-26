-- Revoke default PUBLIC execute access from admin-only RPCs.
-- Authenticated users keep explicit execute grants; each function still enforces
-- BCT admin authorization internally.

revoke execute on function public.bct_admin_accounting_summary(date,date) from public;
grant execute on function public.bct_admin_accounting_summary(date,date) to authenticated;

revoke execute on function public.bct_admin_ack_expiration_alert(uuid,boolean) from public;
grant execute on function public.bct_admin_ack_expiration_alert(uuid,boolean) to authenticated;

revoke execute on function public.bct_admin_backup_readiness() from public;
grant execute on function public.bct_admin_backup_readiness() to authenticated;

revoke execute on function public.bct_admin_bookkeeping_export(date,date) from public;
grant execute on function public.bct_admin_bookkeeping_export(date,date) to authenticated;

revoke execute on function public.bct_admin_bookkeeping_export_csv(date,date) from public;
grant execute on function public.bct_admin_bookkeeping_export_csv(date,date) to authenticated;

revoke execute on function public.bct_admin_case_dashboard() from public;
grant execute on function public.bct_admin_case_dashboard() to authenticated;

revoke execute on function public.bct_admin_create_config_backup_snapshot(text) from public;
grant execute on function public.bct_admin_create_config_backup_snapshot(text) to authenticated;

revoke execute on function public.bct_admin_enable_mfa_enforcement() from public;
grant execute on function public.bct_admin_enable_mfa_enforcement() to authenticated;

revoke execute on function public.bct_admin_error_dashboard() from public;
grant execute on function public.bct_admin_error_dashboard() to authenticated;

revoke execute on function public.bct_admin_esign_contract(uuid,text,boolean) from public;
grant execute on function public.bct_admin_esign_contract(uuid,text,boolean) to authenticated;

revoke execute on function public.bct_admin_expiration_alerts() from public;
grant execute on function public.bct_admin_expiration_alerts() to authenticated;

revoke execute on function public.bct_admin_mfa_status() from public;
grant execute on function public.bct_admin_mfa_status() to authenticated;

revoke execute on function public.bct_admin_rating_summary() from public;
grant execute on function public.bct_admin_rating_summary() to authenticated;

revoke execute on function public.bct_admin_refresh_expiration_alerts() from public;
grant execute on function public.bct_admin_refresh_expiration_alerts() to authenticated;

revoke execute on function public.bct_admin_set_error_status(uuid,text) from public;
grant execute on function public.bct_admin_set_error_status(uuid,text) to authenticated;

revoke execute on function public.bct_admin_set_mfa_ui_ready(boolean) from public;
grant execute on function public.bct_admin_set_mfa_ui_ready(boolean) to authenticated;

revoke execute on function public.bct_admin_update_case(uuid,text,uuid,text,timestamp with time zone) from public;
grant execute on function public.bct_admin_update_case(uuid,text,uuid,text,timestamp with time zone) to authenticated;
