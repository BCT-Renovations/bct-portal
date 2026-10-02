-- V46 incident response + stop-work lifecycle hardening. Development only.
-- Extends canonical incidents and stop-work orders; reuses action inbox.

create or replace function public.bct_admin_assess_incident(
 p_incident_id uuid,p_immediate_safety_response text default null,
 p_assessment_notes text default null,p_follow_up_required boolean default false,
 p_follow_up_notes text default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_incidents%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into v from public.bct_incidents where id=p_incident_id for update;
 if v.id is null then raise exception 'Incident not found'; end if;

 update public.bct_incidents
 set immediate_safety_response=nullif(btrim(coalesce(p_immediate_safety_response,'')),''),
     assessment_notes=nullif(btrim(coalesce(p_assessment_notes,'')),''),
     follow_up_required=coalesce(p_follow_up_required,false),
     follow_up_notes=nullif(btrim(coalesce(p_follow_up_notes,'')),''),
     bct_alerted_at=coalesce(bct_alerted_at,now()),
     updated_at=now()
 where id=p_incident_id;

 if coalesce(p_follow_up_required,false) then
   insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
   select v.project_id,'incident_follow_up',concat('Incident follow-up: ',coalesce(v.incident_type,'incident')),
          case when lower(coalesce(v.severity,'')) in ('critical','severe','high') then 'critical' else 'high' end,
          'open',now()
   where not exists(
     select 1 from public.bct_action_inbox ai
     where ai.project_id=v.project_id and ai.action_type='incident_follow_up'
       and ai.status='open'
       and ai.title=concat('Incident follow-up: ',coalesce(v.incident_type,'incident'))
   );
 end if;
 return p_incident_id;
end $$;
revoke all on function public.bct_admin_assess_incident(uuid,text,text,boolean,text) from public,anon,authenticated;
grant execute on function public.bct_admin_assess_incident(uuid,text,text,boolean,text) to authenticated;

create or replace function public.bct_admin_resolve_incident(p_incident_id uuid,p_resolution text)
returns public.bct_incidents language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_incidents;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if nullif(btrim(coalesce(p_resolution,'')),'') is null then raise exception 'Resolution required'; end if;

 select * into v from public.bct_incidents where id=p_incident_id for update;
 if v.id is null then raise exception 'Incident not found'; end if;
 if coalesce(v.follow_up_required,false) and nullif(btrim(coalesce(v.follow_up_notes,'')),'') is null then
   raise exception 'Incident follow-up notes are required before closure';
 end if;

 update public.bct_incidents
 set resolution=btrim(p_resolution),resolved_at=coalesce(resolved_at,now()),
     closed_at=now(),closed_by=auth.uid(),updated_at=now()
 where id=p_incident_id returning * into v;

 update public.bct_action_inbox
 set status='closed'
 where project_id=v.project_id and action_type='incident_follow_up' and status in ('open','overdue');

 return v;
end $$;
revoke all on function public.bct_admin_resolve_incident(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_resolve_incident(uuid,text) to authenticated;

create or replace function public.bct_refresh_stop_work_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select s.project_id,'active_stop_work','Active stop-work order requires BCT control','critical','open',now()
 from public.bct_stop_work_orders s
 where lower(coalesce(s.status,'')) not in ('released','resolved','closed','cancelled')
 and not exists(
   select 1 from public.bct_action_inbox ai
   where ai.project_id=s.project_id and ai.action_type='active_stop_work' and ai.status='open'
 );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_stop_work_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_stop_work_attention() to authenticated;
