-- V46 property manager portfolio safe composition.
-- DEVELOPMENT BRANCH ONLY. Extends existing property management; no parallel subsystem.

create or replace function public.bct_my_property_portfolio_summary()
returns table(managed_property_id uuid,property_name text,city text,state text,
              total_projects bigint,active_projects bigint,critical_projects bigint,
              urgent_projects bigint,open_attention bigint,manager_decisions bigint)
language plpgsql stable security definer set search_path=public,auth,pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  return query
  select mp.id,mp.property_name,mp.city,mp.state,
    count(distinct p.id),
    count(distinct p.id) filter(where lower(coalesce(p.workflow_status,'')) in ('active','in_progress')),
    count(distinct p.id) filter(where exists(
      select 1 from public.bct_action_inbox ai
      where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='critical')),
    count(distinct p.id) filter(where exists(
      select 1 from public.bct_action_inbox ai
      where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='high')),
    (select count(*) from public.bct_action_inbox ai
      join public.bct_projects px on px.id=ai.project_id
      where px.managed_property_id=mp.id and ai.status in ('open','overdue')),
    (select count(*) from public.bct_customer_decisions d
      join public.bct_projects px on px.id=d.project_id
      where px.managed_property_id=mp.id
        and lower(coalesce(d.status,'')) not in ('answered','resolved','closed'))
  from public.bct_managed_properties mp
  join public.bct_property_accounts pa on pa.id=mp.property_account_id
  left join public.bct_projects p on p.managed_property_id=mp.id
  where pa.auth_user_id=auth.uid() and pa.active and mp.active
  group by mp.id,mp.property_name,mp.city,mp.state
  order by
    count(distinct p.id) filter(where exists(
      select 1 from public.bct_action_inbox ai
      where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='critical')) desc,
    count(distinct p.id) filter(where exists(
      select 1 from public.bct_action_inbox ai
      where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='high')) desc,
    mp.property_name;
end $$;
revoke all on function public.bct_my_property_portfolio_summary() from public,anon,authenticated;
grant execute on function public.bct_my_property_portfolio_summary() to authenticated;

create or replace function public.bct_my_property_unit_project_summary(p_project_id uuid)
returns table(property_name text,building_number text,unit_number text,occupancy_status text)
language plpgsql stable security definer set search_path=public,auth,pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(
    select 1 from public.bct_projects p
    join public.bct_managed_properties mp on mp.id=p.managed_property_id
    join public.bct_property_accounts pa on pa.id=mp.property_account_id
    where p.id=p_project_id and pa.auth_user_id=auth.uid() and pa.active and mp.active
  ) then raise exception 'Project access denied'; end if;

  return query
  select mp.property_name,pu.building_number,pu.unit_number,pu.occupancy_status
  from public.bct_project_property_units ppu
  join public.bct_property_units pu on pu.id=ppu.property_unit_id
  join public.bct_managed_properties mp on mp.id=pu.property_id
  where ppu.project_id=p_project_id
    and exists(
      select 1 from public.bct_property_accounts pa
      where pa.id=mp.property_account_id and pa.auth_user_id=auth.uid() and pa.active
    );
end $$;
revoke all on function public.bct_my_property_unit_project_summary(uuid) from public,anon,authenticated;
grant execute on function public.bct_my_property_unit_project_summary(uuid) to authenticated;

comment on function public.bct_my_property_unit_project_summary(uuid) is
'Property-manager-safe unit summary. Deliberately excludes access_notes and resident_private_notes.';
