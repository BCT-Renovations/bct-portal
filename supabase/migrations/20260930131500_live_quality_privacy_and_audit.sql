-- BCT V46 live quality-check follow-up: contractor privacy acknowledgment + Admin audit reader.

create or replace function public.bct_live_quality_check_audit()
returns trigger
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
declare
  v_role text;
  v_event text;
begin
  if public.is_bct_admin() then
    v_role := 'admin';
  elsif exists(select 1 from public.bct_contractors c where c.auth_user_id=auth.uid()) then
    v_role := 'contractor';
  elsif exists(select 1 from public.bct_customers c where c.auth_user_id=auth.uid()) then
    v_role := 'homeowner';
  else
    v_role := 'authenticated_user';
  end if;
  if tg_op='INSERT' then
    insert into public.bct_live_quality_check_events(quality_check_id,actor_user_id,actor_role,event_type,new_status)
    values(new.id,auth.uid(),v_role,'created',new.status);
    return new;
  end if;
  v_event := case when old.status is distinct from new.status then 'status_changed' else 'updated' end;
  insert into public.bct_live_quality_check_events(quality_check_id,actor_user_id,actor_role,event_type,old_status,new_status)
  values(new.id,auth.uid(),v_role,v_event,old.status,new.status);
  return new;
end
$$;

create or replace function public.bct_contractor_ack_live_quality_privacy(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
begin
  if not exists(
    select 1
    from public.bct_live_quality_checks q
    join public.bct_contractors c on c.id=q.contractor_id and c.auth_user_id=auth.uid()
    where q.id=p_id
      and exists(select 1 from public.bct_assignments a where a.job_id=q.job_id and a.contractor_id=c.id and a.status not in ('cancelled','completed'))
  ) then
    raise exception 'Assigned quality check not found' using errcode='42501';
  end if;
  update public.bct_live_quality_checks
  set privacy_notice_acknowledged_at=now(),privacy_notice_acknowledged_by=auth.uid(),updated_at=now()
  where id=p_id;
  return p_id;
end
$$;

create or replace function public.bct_admin_live_quality_check_events(p_check_id uuid)
returns jsonb
language sql
stable
security definer
set search_path='public','auth','pg_temp'
as $$
  select case when public.is_bct_admin() then coalesce(jsonb_agg(jsonb_build_object(
    'id',e.id,'quality_check_id',e.quality_check_id,'actor_user_id',e.actor_user_id,'actor_role',e.actor_role,
    'event_type',e.event_type,'old_status',e.old_status,'new_status',e.new_status,'note',e.note,'created_at',e.created_at
  ) order by e.created_at desc),'[]'::jsonb) else '[]'::jsonb end
  from public.bct_live_quality_check_events e
  where e.quality_check_id=p_check_id
$$;

revoke all on function public.bct_contractor_ack_live_quality_privacy(uuid) from public,anon;
revoke all on function public.bct_admin_live_quality_check_events(uuid) from public,anon;
grant execute on function public.bct_contractor_ack_live_quality_privacy(uuid) to authenticated;
grant execute on function public.bct_admin_live_quality_check_events(uuid) to authenticated;
