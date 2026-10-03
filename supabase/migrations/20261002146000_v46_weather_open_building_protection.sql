-- V46 weather / open-building protection hardening. Development only.
-- Extends canonical weather checks and reuses existing temporary-protection checklist/action inbox.

alter table public.bct_weather_checks
  add column if not exists open_building_exposure boolean not null default false,
  add column if not exists protection_required boolean not null default false,
  add column if not exists protection_confirmed_at timestamptz,
  add column if not exists protection_confirmed_by uuid,
  add column if not exists protection_notes text;

create or replace function public.bct_admin_set_weather_protection(
 p_weather_check_id bigint,p_open_building_exposure boolean,p_protection_required boolean,p_protection_confirmed boolean default false,p_notes text default null
) returns bigint language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_weather_checks%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into v from public.bct_weather_checks where id=p_weather_check_id for update;
 if v.id is null then raise exception 'Weather check not found'; end if;
 if coalesce(p_protection_required,false) and not coalesce(p_open_building_exposure,false) then
   raise exception 'Protection-required weather check must identify open-building exposure';
 end if;

 update public.bct_weather_checks
 set open_building_exposure=coalesce(p_open_building_exposure,false),
     protection_required=coalesce(p_protection_required,false),
     protection_confirmed_at=case when p_protection_confirmed then now() else null end,
     protection_confirmed_by=case when p_protection_confirmed then auth.uid() else null end,
     protection_notes=nullif(btrim(coalesce(p_notes,'')),'')
 where id=p_weather_check_id;

 if p_protection_confirmed then
   update public.bct_action_inbox
   set status='closed'
   where project_id=v.project_id and action_type='weather_open_building_protection' and status in ('open','overdue');
 end if;

 return p_weather_check_id;
end $$;
revoke all on function public.bct_admin_set_weather_protection(bigint,boolean,boolean,boolean,text) from public,anon,authenticated;
grant execute on function public.bct_admin_set_weather_protection(bigint,boolean,boolean,boolean,text) to authenticated;

create or replace function public.bct_refresh_weather_protection_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select w.project_id,'weather_open_building_protection','Open-building weather protection requires confirmation',
        w.check_date::timestamptz,'critical',
        case when w.check_date<current_date then 'overdue' else 'open' end,now()
 from public.bct_weather_checks w
 where w.open_building_exposure and w.protection_required and w.protection_confirmed_at is null
 and not exists(
   select 1 from public.bct_action_inbox ai
   where ai.project_id=w.project_id and ai.action_type='weather_open_building_protection'
     and ai.status in ('open','overdue')
 );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_weather_protection_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_weather_protection_attention() to authenticated;
