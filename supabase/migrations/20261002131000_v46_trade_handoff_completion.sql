-- V46 trade handoff completion controls. Development only.
-- Prevent downstream package release while predecessor handoff is incomplete.

create or replace function public.bct_work_package_handoff_ready(p_package_id uuid)
returns boolean language sql stable security invoker set search_path=public,auth,pg_temp as $$
 select case
   when w.predecessor_package_id is null then true
   else exists(
     select 1 from public.bct_work_packages p
     where p.id=w.predecessor_package_id
       and p.project_id=w.project_id
       and p.handoff_offered_at is not null
       and p.handoff_acknowledged_at is not null
   )
 end
 from public.bct_work_packages w where w.id=p_package_id
$$;
revoke all on function public.bct_work_package_handoff_ready(uuid) from public,anon;
grant execute on function public.bct_work_package_handoff_ready(uuid) to authenticated;

create or replace function public.bct_guard_work_package_handoff_start()
returns trigger language plpgsql set search_path=public,auth,pg_temp as $$
begin
 if new.predecessor_package_id is not null
    and lower(coalesce(new.status,'')) in ('active','in_progress','started','released')
    and (old.status is distinct from new.status)
    and not public.bct_work_package_handoff_ready(new.id)
 then
   raise exception 'Downstream work package cannot start until predecessor handoff is acknowledged by BCT';
 end if;
 return new;
end $$;

drop trigger if exists trg_bct_guard_work_package_handoff_start on public.bct_work_packages;
create trigger trg_bct_guard_work_package_handoff_start
before update of status on public.bct_work_packages
for each row execute function public.bct_guard_work_package_handoff_start();

create or replace function public.bct_admin_trade_handoff_status(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'package_id',w.id,'title',w.title,'trade',w.trade,'status',w.status,
   'predecessor_package_id',w.predecessor_package_id,
   'handoff_offered_at',w.handoff_offered_at,
   'handoff_acknowledged_at',w.handoff_acknowledged_at,
   'handoff_notes',w.handoff_notes,
   'ready_to_start',public.bct_work_package_handoff_ready(w.id)
 ) order by w.sequence_no nulls last,w.created_at),'[]'::jsonb)
 into v from public.bct_work_packages w where w.project_id=p_project_id;
 return v;
end $$;
revoke all on function public.bct_admin_trade_handoff_status(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_trade_handoff_status(uuid) to authenticated;
