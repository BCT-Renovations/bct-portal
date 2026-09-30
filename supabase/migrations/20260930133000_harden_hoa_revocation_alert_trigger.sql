-- V46: source-control and harden the internal HOA authorization revocation trigger.
-- This SECURITY DEFINER function is trigger-only; browser roles must never execute it directly.

create or replace function public.bct_hoa_revocation_alert()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if new.status = 'revoked' then
    update public.bct_hoa_alerts
       set is_active = false,
           acknowledged_at = coalesce(acknowledged_at, now())
     where project_id = new.project_id
       and alert_type = 'hoa_permission_revoked'
       and is_active;

    insert into public.bct_hoa_alerts(project_id, alert_type, severity, message)
    values (
      new.project_id,
      'hoa_permission_revoked',
      'critical',
      'STOP HOA COMMUNICATION — homeowner authorization revoked. HOA actions are locked.'
    );
  elsif new.status = 'granted' then
    update public.bct_hoa_alerts
       set is_active = false,
           acknowledged_at = coalesce(acknowledged_at, now())
     where project_id = new.project_id
       and alert_type = 'hoa_permission_revoked'
       and is_active;
  end if;

  return new;
end;
$$;

revoke all on function public.bct_hoa_revocation_alert() from public;
revoke all on function public.bct_hoa_revocation_alert() from anon;
revoke all on function public.bct_hoa_revocation_alert() from authenticated;
