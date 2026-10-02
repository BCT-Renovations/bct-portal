-- BCT V46 Admin MFA enforcement boundary.
-- Source-only until protected integration approval.
-- Once admin_mfa_enforced=true, the canonical Admin predicate requires an AAL2 session.

create or replace function public.is_bct_admin()
returns boolean
language sql
stable
set search_path='public','auth','pg_temp'
as $$
  select
    (
      coalesce((auth.jwt()->'app_metadata'->>'role') in ('admin','bct_admin','owner'),false)
      or lower(coalesce(auth.jwt()->>'email',''))=lower('myproject@bctrenovations.com')
    )
    and
    (
      not coalesce((select admin_mfa_enforced from public.bct_security_settings where singleton),false)
      or coalesce(auth.jwt()->>'aal','aal1')='aal2'
    );
$$;

comment on function public.is_bct_admin() is
'Canonical BCT Admin authorization predicate. When Admin MFA enforcement is enabled, Admin authorization additionally requires an AAL2 session.';
