-- V46 daily field report completion. Development only.
-- Reuses bct_daily_logs and existing project-assignment authorization.

create or replace function public.bct_complete_daily_field_report(
 p_daily_log_id uuid,p_crew_present jsonb default '[]'::jsonb,
 p_issue_summary text default null,p_next_steps text default null,p_photo_refs jsonb default '[]'::jsonb
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_daily_logs%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(coalesce(p_crew_present,'[]'::jsonb))<>'array' then raise exception 'Crew present must be an array'; end if;
 if jsonb_typeof(coalesce(p_photo_refs,'[]'::jsonb))<>'array' then raise exception 'Photo references must be an array'; end if;
 select * into v from public.bct_daily_logs where id=p_daily_log_id for update;
 if v.id is null then raise exception 'Daily log not found'; end if;
 if not public.is_bct_admin() and not public.bct_user_assigned_to_project(v.project_id) then raise exception 'Assigned project required'; end if;

 update public.bct_daily_logs
 set crew_present=coalesce(p_crew_present,'[]'::jsonb),
     issue_summary=nullif(btrim(coalesce(p_issue_summary,'')),''),
     next_steps=nullif(btrim(coalesce(p_next_steps,'')),''),
     photo_refs=coalesce(p_photo_refs,'[]'::jsonb)
 where id=p_daily_log_id;
 return p_daily_log_id;
end $$;
revoke all on function public.bct_complete_daily_field_report(uuid,jsonb,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bct_complete_daily_field_report(uuid,jsonb,text,text,jsonb) to authenticated;

create or replace function public.bct_admin_daily_log_summary(p_project_id uuid)
returns jsonb language sql stable set search_path=public,pg_temp as $$
 select case when public.is_bct_admin() then jsonb_build_object(
   'log_days',count(*),
   'crew_total',coalesce(sum(crew_count),0),
   'hours_total',coalesce(sum(hours_worked),0),
   'latest_log_date',max(log_date),
   'reports_with_photos',count(*) filter(where jsonb_array_length(coalesce(photo_refs,'[]'::jsonb))>0),
   'reports_with_crew_detail',count(*) filter(where jsonb_array_length(coalesce(crew_present,'[]'::jsonb))>0),
   'reports_with_issues',count(*) filter(where nullif(btrim(coalesce(issue_summary,'')),'') is not null),
   'reports_with_next_steps',count(*) filter(where nullif(btrim(coalesce(next_steps,'')),'') is not null)
 ) else null end
 from public.bct_daily_logs where project_id=p_project_id;
$$;
