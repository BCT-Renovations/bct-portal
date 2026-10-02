-- V46 Who's Coming integration bridge.
-- DEVELOPMENT ONLY. Reuses canonical worker assignments/project crews and the approved trade-lead architecture.

alter table public.bct_project_crews
  add column if not exists contractor_id uuid references public.bct_contractors(id);

create or replace function public.bct_admin_approve_crew_substitute(
  p_project_crew_id uuid,p_approved boolean,p_homeowner_notify boolean default true
) returns public.bct_project_crews
language plpgsql security definer set search_path=public,auth,pg_temp
as $$
declare v_row public.bct_project_crews;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;

  update public.bct_project_crews pc
     set substitute_approval_status=case when p_approved then 'approved' else 'rejected' end,
         homeowner_notified_at=case when p_approved and p_homeowner_notify then now() else pc.homeowner_notified_at end
   where pc.id=p_project_crew_id
     and pc.substitute_for is not null
     and pc.worker_profile_id is not null
     and exists(
       select 1 from public.bct_worker_assignments wa
       where wa.project_id=pc.project_id and wa.worker_profile_id=pc.worker_profile_id
         and coalesce(wa.status,'') not in ('cancelled','removed','released')
     )
  returning pc.* into v_row;

  if v_row.id is null then raise exception 'Active substitute crew assignment not found'; end if;
  return v_row;
end $$;
revoke all on function public.bct_admin_approve_crew_substitute(uuid,boolean,boolean) from public,anon,authenticated;
grant execute on function public.bct_admin_approve_crew_substitute(uuid,boolean,boolean) to authenticated;

-- Homeowner-safe attendance summary. It never turns every crew member into a public identity.
-- Named public identity remains controlled by bct_project_trade_leads on the identity branch.
create or replace function public.bct_homeowner_project_crew_status(p_project_id uuid)
returns table(crew_type text,arrival_status text,expected_arrival_start timestamptz,
              expected_arrival_end timestamptz,checked_in boolean,substitution_approved boolean,
              homeowner_notified boolean)
language plpgsql stable security definer set search_path=public,auth,pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(
    select 1 from public.bct_projects p
    join public.bct_customers c on c.id=p.customer_id
    where p.id=p_project_id and c.auth_user_id=auth.uid()
  ) then raise exception 'Project access denied'; end if;

  return query
  select pc.crew_type,pc.arrival_status,pc.expected_arrival_start,pc.expected_arrival_end,
         pc.checked_in_at is not null and pc.checked_out_at is null,
         pc.substitute_for is null or pc.substitute_approval_status='approved',
         pc.homeowner_notified_at is not null
  from public.bct_project_crews pc
  where pc.project_id=p_project_id
    and lower(coalesce(pc.status,'')) not in ('cancelled','removed')
    and (pc.substitute_for is null or pc.substitute_approval_status='approved')
  order by pc.expected_arrival_start nulls last,pc.crew_type;
end $$;
revoke all on function public.bct_homeowner_project_crew_status(uuid) from public,anon,authenticated;
grant execute on function public.bct_homeowner_project_crew_status(uuid) to authenticated;

comment on function public.bct_homeowner_project_crew_status(uuid) is
'Homeowner-safe attendance/status only. Named contractor/trade-lead identity remains BCT-approved through the existing trade-lead release architecture.';
