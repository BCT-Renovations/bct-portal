-- Optimize Phase 1 property-management and communication lookup paths.
-- These indexes satisfy Supabase FK-index advisors for the commercial/multifamily and BCT-mediated communication tables.
create index if not exists bct_property_accounts_auth_user_id_idx on public.bct_property_accounts(auth_user_id);
create index if not exists bct_managed_properties_property_account_id_idx on public.bct_managed_properties(property_account_id);
create index if not exists bct_projects_managed_property_id_idx on public.bct_projects(managed_property_id);
create index if not exists bct_job_communication_sessions_project_id_idx on public.bct_job_communication_sessions(project_id);
create index if not exists bct_job_communication_sessions_job_id_idx on public.bct_job_communication_sessions(job_id);
create index if not exists bct_job_communication_events_session_id_idx on public.bct_job_communication_events(session_id);
create index if not exists bct_job_communication_events_project_id_idx on public.bct_job_communication_events(project_id);
create index if not exists bct_job_communication_events_job_id_idx on public.bct_job_communication_events(job_id);

-- Recreate the new property-management policies with initplan-friendly auth calls.
drop policy if exists "Property accounts owner or admin read" on public.bct_property_accounts;
create policy "Property accounts owner or admin read" on public.bct_property_accounts
for select to authenticated
using(auth_user_id=(select auth.uid()) or public.is_bct_admin());

drop policy if exists "Property accounts owner insert" on public.bct_property_accounts;
create policy "Property accounts owner insert" on public.bct_property_accounts
for insert to authenticated
with check(auth_user_id=(select auth.uid()) or public.is_bct_admin());

drop policy if exists "Property accounts owner or admin update" on public.bct_property_accounts;
create policy "Property accounts owner or admin update" on public.bct_property_accounts
for update to authenticated
using(auth_user_id=(select auth.uid()) or public.is_bct_admin())
with check(auth_user_id=(select auth.uid()) or public.is_bct_admin());

drop policy if exists "Managed properties owner or admin read" on public.bct_managed_properties;
create policy "Managed properties owner or admin read" on public.bct_managed_properties
for select to authenticated
using(
  public.is_bct_admin()
  or exists(
    select 1 from public.bct_property_accounts a
    where a.id=property_account_id and a.auth_user_id=(select auth.uid())
  )
);

drop policy if exists "Managed properties owner or admin insert" on public.bct_managed_properties;
create policy "Managed properties owner or admin insert" on public.bct_managed_properties
for insert to authenticated
with check(
  public.is_bct_admin()
  or exists(
    select 1 from public.bct_property_accounts a
    where a.id=property_account_id and a.auth_user_id=(select auth.uid())
  )
);

drop policy if exists "Managed properties owner or admin update" on public.bct_managed_properties;
create policy "Managed properties owner or admin update" on public.bct_managed_properties
for update to authenticated
using(
  public.is_bct_admin()
  or exists(
    select 1 from public.bct_property_accounts a
    where a.id=property_account_id and a.auth_user_id=(select auth.uid())
  )
)
with check(
  public.is_bct_admin()
  or exists(
    select 1 from public.bct_property_accounts a
    where a.id=property_account_id and a.auth_user_id=(select auth.uid())
  )
);

drop policy if exists "BCT projects property manager select" on public.bct_projects;
create policy "BCT projects property manager select" on public.bct_projects
for select to authenticated
using(
  managed_property_id is not null
  and exists(
    select 1
    from public.bct_managed_properties mp
    join public.bct_property_accounts pa on pa.id=mp.property_account_id
    where mp.id=bct_projects.managed_property_id
      and pa.auth_user_id=(select auth.uid())
      and pa.active and mp.active
  )
);

drop policy if exists "BCT projects property manager insert" on public.bct_projects;
create policy "BCT projects property manager insert" on public.bct_projects
for insert to authenticated
with check(
  project_market='multifamily'
  and managed_property_id is not null
  and exists(
    select 1
    from public.bct_managed_properties mp
    join public.bct_property_accounts pa on pa.id=mp.property_account_id
    where mp.id=bct_projects.managed_property_id
      and pa.auth_user_id=(select auth.uid())
      and pa.active and mp.active
  )
);

drop policy if exists "BCT projects property manager update" on public.bct_projects;
create policy "BCT projects property manager update" on public.bct_projects
for update to authenticated
using(
  managed_property_id is not null
  and exists(
    select 1
    from public.bct_managed_properties mp
    join public.bct_property_accounts pa on pa.id=mp.property_account_id
    where mp.id=bct_projects.managed_property_id
      and pa.auth_user_id=(select auth.uid())
      and pa.active and mp.active
  )
)
with check(
  project_market='multifamily'
  and managed_property_id is not null
  and exists(
    select 1
    from public.bct_managed_properties mp
    join public.bct_property_accounts pa on pa.id=mp.property_account_id
    where mp.id=bct_projects.managed_property_id
      and pa.auth_user_id=(select auth.uid())
      and pa.active and mp.active
  )
);
