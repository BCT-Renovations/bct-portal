-- V46: optimize selected RLS policies so auth.uid() is evaluated once per statement.
-- Access semantics and role boundaries are intentionally unchanged.

alter policy bct_hoa_profiles_access
on public.bct_hoa_profiles
to authenticated
using (
  is_bct_admin()
  or exists (
    select 1
    from public.bct_projects p
    join public.bct_customers c on c.id = p.customer_id
    where p.id = bct_hoa_profiles.project_id
      and c.auth_user_id = (select auth.uid())
  )
)
with check (
  is_bct_admin()
  or exists (
    select 1
    from public.bct_projects p
    join public.bct_customers c on c.id = p.customer_id
    where p.id = bct_hoa_profiles.project_id
      and c.auth_user_id = (select auth.uid())
  )
);

alter policy bct_hoa_authorizations_access
on public.bct_hoa_authorizations
to authenticated
using (
  is_bct_admin()
  or homeowner_user_id = (select auth.uid())
);

alter policy bct_hoa_authorizations_homeowner_insert
on public.bct_hoa_authorizations
to authenticated
with check (
  homeowner_user_id = (select auth.uid())
  and exists (
    select 1
    from public.bct_projects p
    join public.bct_customers c on c.id = p.customer_id
    where p.id = bct_hoa_authorizations.project_id
      and c.auth_user_id = (select auth.uid())
  )
);

alter policy bct_hoa_authorizations_homeowner_update
on public.bct_hoa_authorizations
to authenticated
using (
  is_bct_admin()
  or homeowner_user_id = (select auth.uid())
)
with check (
  is_bct_admin()
  or homeowner_user_id = (select auth.uid())
);

alter policy bct_share_access_log_admin_owner
on public.bct_share_access_log
to authenticated
using (
  is_bct_admin()
  or exists (
    select 1
    from public.bct_privacy_shares s
    where s.id = bct_share_access_log.share_id
      and s.owner_user_id = (select auth.uid())
  )
);

alter policy bct_privacy_shares_owner_admin_select
on public.bct_privacy_shares
to authenticated
using (
  is_bct_admin()
  or owner_user_id = (select auth.uid())
);

alter policy bct_privacy_shares_owner_insert
on public.bct_privacy_shares
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and exists (
    select 1
    from public.bct_projects p
    join public.bct_customers c on c.id = p.customer_id
    where p.id = bct_privacy_shares.project_id
      and c.auth_user_id = (select auth.uid())
  )
);

alter policy bct_privacy_shares_owner_update
on public.bct_privacy_shares
to authenticated
using (
  is_bct_admin()
  or owner_user_id = (select auth.uid())
)
with check (
  is_bct_admin()
  or owner_user_id = (select auth.uid())
);
