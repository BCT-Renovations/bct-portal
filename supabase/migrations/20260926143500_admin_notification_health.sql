-- Admin-only delivery health summary. This observes delivery state; it never sends or marks messages delivered.
create or replace function public.bct_admin_notification_health()
returns jsonb language plpgsql stable set search_path=public,auth as $f$
declare v jsonb;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 select jsonb_build_object(
  'queued',count(*) filter(where status='queued'),
  'failed',count(*) filter(where status='failed'),
  'stuck',count(*) filter(where status in('queued','pending') and created_at<now()-interval '1 hour'),
  'oldest_queued_at',min(created_at) filter(where status in('queued','pending')),
  'max_attempts_reached',count(*) filter(where status='failed' and delivery_attempt_count>=5)
 ) into v from public.bct_notifications;
 return v;
end $f$;
revoke all on function public.bct_admin_notification_health() from public,anon;
grant execute on function public.bct_admin_notification_health() to authenticated;
