-- V46 no-show / late-arrival escalation. Development only.
-- Reuses canonical project crew arrival windows and BCT action inbox.

create or replace function public.bct_refresh_crew_arrival_attention(p_grace_minutes integer default 15)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;x integer:=0;v_now timestamptz:=now();
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_grace_minutes<0 or p_grace_minutes>180 then raise exception 'Grace minutes out of range'; end if;

 update public.bct_project_crews
 set arrival_status='late'
 where expected_arrival_start is not null and checked_in_at is null
   and lower(coalesce(status,'')) not in ('cancelled','released','complete','completed')
   and v_now>expected_arrival_start+make_interval(mins=>p_grace_minutes)
   and (expected_arrival_end is null or v_now<=expected_arrival_end+make_interval(mins=>p_grace_minutes))
   and lower(coalesce(arrival_status,'')) not in ('late','no_show','arrived','cancelled');

 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select pc.project_id,'crew_late_arrival',concat('Crew late: ',coalesce(pc.crew_name,pc.crew_type,'assigned crew')),pc.expected_arrival_start,'high','open',now()
 from public.bct_project_crews pc
 where pc.checked_in_at is null and lower(coalesce(pc.arrival_status,''))='late'
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=pc.project_id and ai.action_type='crew_late_arrival' and ai.status='open' and ai.title=concat('Crew late: ',coalesce(pc.crew_name,pc.crew_type,'assigned crew')));
 get diagnostics x=row_count;n:=n+x;

 update public.bct_project_crews
 set arrival_status='no_show'
 where expected_arrival_end is not null and checked_in_at is null
   and lower(coalesce(status,'')) not in ('cancelled','released','complete','completed')
   and v_now>expected_arrival_end+make_interval(mins=>p_grace_minutes)
   and lower(coalesce(arrival_status,'')) not in ('no_show','arrived','cancelled');

 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select pc.project_id,'crew_no_show',concat('Crew no-show: ',coalesce(pc.crew_name,pc.crew_type,'assigned crew')),pc.expected_arrival_end,'critical','open',now()
 from public.bct_project_crews pc
 where pc.checked_in_at is null and lower(coalesce(pc.arrival_status,''))='no_show'
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=pc.project_id and ai.action_type='crew_no_show' and ai.status='open' and ai.title=concat('Crew no-show: ',coalesce(pc.crew_name,pc.crew_type,'assigned crew')));
 get diagnostics x=row_count;n:=n+x;
 return jsonb_build_object('created',n,'checked_at',v_now);
end $$;
revoke all on function public.bct_refresh_crew_arrival_attention(integer) from public,anon,authenticated;
grant execute on function public.bct_refresh_crew_arrival_attention(integer) to authenticated;

create or replace function public.bct_admin_crew_arrival_status(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
 'crew_id',pc.id,'crew_name',pc.crew_name,'crew_type',pc.crew_type,
 'expected_start',pc.expected_arrival_start,'expected_end',pc.expected_arrival_end,
 'arrival_status',pc.arrival_status,'checked_in_at',pc.checked_in_at,'checked_out_at',pc.checked_out_at
 ) order by pc.expected_arrival_start nulls last),'[]'::jsonb)
 into v from public.bct_project_crews pc where pc.project_id=p_project_id;
 return v;
end $$;
revoke all on function public.bct_admin_crew_arrival_status(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_crew_arrival_status(uuid) to authenticated;
