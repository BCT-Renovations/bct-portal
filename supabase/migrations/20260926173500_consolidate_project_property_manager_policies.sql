-- Consolidate bct_projects policies so homeowner/admin and property-manager access share one policy per action.
-- This preserves the same Phase 1 access boundaries while clearing Supabase multiple-permissive-policy warnings.
drop policy if exists "BCT projects insert" on public.bct_projects;
drop policy if exists "BCT projects property manager insert" on public.bct_projects;
create policy "BCT projects insert" on public.bct_projects
for insert to authenticated
with check(
  public.is_bct_admin()
  or exists(
    select 1
    from public.bct_customers c
    where c.id=bct_projects.customer_id
      and c.auth_user_id=(select auth.uid())
  )
  or (
    project_market='multifamily'
    and managed_property_id is not null
    and exists(
      select 1
      from public.bct_managed_properties mp
      join public.bct_property_accounts pa on pa.id=mp.property_account_id
      where mp.id=bct_projects.managed_property_id
        and pa.auth_user_id=(select auth.uid())
        and pa.active
        and mp.active
    )
  )
);

drop policy if exists "BCT projects select" on public.bct_projects;
drop policy if exists "BCT projects property manager select" on public.bct_projects;
create policy "BCT projects select" on public.bct_projects
for select to authenticated
using(
  public.is_bct_admin()
  or exists(
    select 1
    from public.bct_customers c
    where c.id=bct_projects.customer_id
      and c.auth_user_id=(select auth.uid())
  )
  or (
    managed_property_id is not null
    and exists(
      select 1
      from public.bct_managed_properties mp
      join public.bct_property_accounts pa on pa.id=mp.property_account_id
      where mp.id=bct_projects.managed_property_id
        and pa.auth_user_id=(select auth.uid())
        and pa.active
        and mp.active
    )
  )
);

drop policy if exists "BCT projects update" on public.bct_projects;
drop policy if exists "BCT projects property manager update" on public.bct_projects;
create policy "BCT projects update" on public.bct_projects
for update to authenticated
using(
  public.is_bct_admin()
  or exists(
    select 1
    from public.bct_customers c
    where c.id=bct_projects.customer_id
      and c.auth_user_id=(select auth.uid())
  )
  or (
    managed_property_id is not null
    and exists(
      select 1
      from public.bct_managed_properties mp
      join public.bct_property_accounts pa on pa.id=mp.property_account_id
      where mp.id=bct_projects.managed_property_id
        and pa.auth_user_id=(select auth.uid())
        and pa.active
        and mp.active
    )
  )
)
with check(
  public.is_bct_admin()
  or exists(
    select 1
    from public.bct_customers c
    where c.id=bct_projects.customer_id
      and c.auth_user_id=(select auth.uid())
  )
  or (
    project_market='multifamily'
    and managed_property_id is not null
    and exists(
      select 1
      from public.bct_managed_properties mp
      join public.bct_property_accounts pa on pa.id=mp.property_account_id
      where mp.id=bct_projects.managed_property_id
        and pa.auth_user_id=(select auth.uid())
        and pa.active
        and mp.active
    )
  )
);
