-- BCT launch operational readiness: admin-only visibility for final pilot blockers.
-- This does not mark any gate complete; it reports whether required tables/RPCs exist.

create or replace function public.bct_admin_operational_readiness()
returns jsonb
language plpgsql
stable
set search_path = public, auth
as $$
declare
  v_capabilities jsonb;
  v_summary jsonb;
  v_external jsonb;
begin
  if not public.is_bct_admin() then
    raise exception 'BCT admin required';
  end if;

  with requirements(capability_key, label, required_table, required_rpc, launch_notes) as (
    values
      ('completion_signoff', 'Completion sign-off', 'bct_completion_signoffs', 'bct_homeowner_sign_completion_certificate', 'Homeowner completion approval must be recorded before closeout.'),
      ('project_documents', 'Project documents', 'bct_project_documents', 'bct_admin_record_project_document', 'Contracts, estimates, policies and closeout files need an admin-controlled document record.'),
      ('document_expiration_alerts', 'Document expiration alerts', 'bct_project_documents', 'bct_admin_document_expiration_summary', 'Insurance, licensing and required project documents must surface expiration risk.'),
      ('customer_ratings', 'Customer ratings', 'bct_project_ratings', 'bct_homeowner_submit_project_rating', 'Customer ratings should be tied to the project and job after completion.'),
      ('dispute_management', 'Dispute management', 'bct_disputes', 'bct_admin_open_dispute', 'Disputes need owner, status, severity, notes and resolution tracking.'),
      ('reporting_dashboard', 'Reporting dashboard', 'bct_reports', 'bct_admin_reporting_summary', 'Admin reporting needs workload, money, risk and launch-health summaries.'),
      ('audit_log', 'Audit log', 'bct_audit_events', 'bct_log_detailed_audit_event', 'Sensitive approval, pricing, assignment and closeout actions need a durable audit trail.'),
      ('project_messaging', 'Project messaging', 'bct_project_messages', 'bct_admin_create_project_message', 'Project messages need audience controls and unread tracking.'),
      ('notifications', 'Notifications', 'bct_notification_events', 'bct_admin_notification_delivery_queue', 'Transactional notification events and delivery status must be inspectable.'),
      ('security_readiness', 'Security readiness', null, 'bct_admin_launch_readiness', 'Security checks must remain admin-only and visible before pilot launch.')
  ),
  checked as (
    select
      capability_key,
      label,
      required_table,
      required_rpc,
      launch_notes,
      case
        when required_table is null then true
        else to_regclass('public.' || required_table) is not null
      end as table_ready,
      exists (
        select 1
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname = required_rpc
      ) as rpc_ready
    from requirements
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'capability_key', capability_key,
      'label', label,
      'required_table', required_table,
      'required_rpc', required_rpc,
      'table_ready', table_ready,
      'rpc_ready', rpc_ready,
      'is_ready', table_ready and rpc_ready,
      'launch_notes', launch_notes
    ) order by capability_key), '[]'::jsonb),
    jsonb_build_object(
      'required_count', count(*),
      'ready_count', count(*) filter (where table_ready and rpc_ready),
      'gap_count', count(*) filter (where not (table_ready and rpc_ready)),
      'ready_for_pilot_operations', bool_and(table_ready and rpc_ready)
    )
  into v_capabilities, v_summary
  from checked;

  v_external := jsonb_build_array(
    jsonb_build_object('label', 'Supabase backups/PITR verified', 'status', 'requires_dashboard_verification', 'notes', 'Confirm backups and point-in-time recovery in the Supabase project settings.'),
    jsonb_build_object('label', 'Leaked-password protection enabled', 'status', 'requires_dashboard_verification', 'notes', 'Confirm Supabase Auth leaked-password protection before public pilot.'),
    jsonb_build_object('label', 'Live email/password-reset delivery verified', 'status', 'requires_live_mailbox_test', 'notes', 'Use a real mailbox to verify confirmation, reset and transactional delivery.'),
    jsonb_build_object('label', 'Policy/legal review complete', 'status', 'requires_business_approval', 'notes', 'BCT must approve terms, privacy, escrow, financing and contractor language before launch.')
  );

  return jsonb_build_object(
    'summary', v_summary,
    'capabilities', v_capabilities,
    'external_gates', v_external,
    'generated_at', now()
  );
end;
$$;

revoke all on function public.bct_admin_operational_readiness() from public;
grant execute on function public.bct_admin_operational_readiness() to authenticated;
