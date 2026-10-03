-- V46 crew arrival recovery / alert lifecycle. Development only.
-- Keeps late/no-show alerts truthful after an authorized crew eventually checks in.

create or replace function public.bct_sync_crew_arrival_attention_on_checkin()
returns trigger language plpgsql security definer set search_path=public,auth,pg_temp as $$
begin
 if old.checked_in_at is null and new.checked_in_at is not null then
   update public.bct_action_inbox
      set status='closed'
    where project_id=new.project_id
      and action_type in ('crew_late_arrival','crew_no_show')
      and status='open'
      and title in (
        concat('Crew late: ',coalesce(new.crew_name,new.crew_type,'assigned crew')),
        concat('Crew no-show: ',coalesce(new.crew_name,new.crew_type,'assigned crew'))
      );
 end if;
 return new;
end $$;

drop trigger if exists trg_bct_sync_crew_arrival_attention_on_checkin on public.bct_project_crews;
create trigger trg_bct_sync_crew_arrival_attention_on_checkin
after update of checked_in_at on public.bct_project_crews
for each row execute function public.bct_sync_crew_arrival_attention_on_checkin();

create or replace function public.bct_admin_resolve_crew_arrival_exception(
 p_project_crew_id uuid,
 p_resolution text
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare pc public.bct_project_crews%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if nullif(btrim(coalesce(p_resolution,'')),'') is null then raise exception 'Resolution note required'; end if;
 select * into pc from public.bct_project_crews where id=p_project_crew_id;
 if pc.id is null then raise exception 'Crew record not found'; end if;
 update public.bct_action_inbox set status='closed'
 where project_id=pc.project_id and action_type in ('crew_late_arrival','crew_no_show') and status='open'
 and title in (
   concat('Crew late: ',coalesce(pc.crew_name,pc.crew_type,'assigned crew')),
   concat('Crew no-show: ',coalesce(pc.crew_name,pc.crew_type,'assigned crew'))
 );
 return pc.id;
end $$;
revoke all on function public.bct_admin_resolve_crew_arrival_exception(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_resolve_crew_arrival_exception(uuid,text) to authenticated;
