-- BCT V46 Admin MFA enforcement boundary.
-- Source-only until protected integration approval.
-- Once admin_mfa_enforced=true, the canonical Admin predicate requires an AAL2 session.

-- Allow the canonical Admin predicate and MFA status RPCs to read only the singleton
-- security-settings row for a raw Admin identity. Do not call is_bct_admin() here,
-- because is_bct_admin() itself reads this setting.
drop policy if exists "BCT security settings admin select" on public.bct_security_settings;
create policy "BCT security settings admin select"
on public.bct_security_settings
for select to authenticated
using (
  coalesce(auth.jwt()->'app_metadata'->>'role','') in ('admin','bct_admin','owner')
  or lower(coalesce(auth.jwt()->>'email',''))=lower('myproject@bctrenovations.com')
);

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


-- Keep MFA-control writes aligned with every identity that the canonical BCT Admin
-- predicate recognizes, without depending on is_bct_admin() while enforcement is changing.
drop policy if exists "bct_security_settings_admin_update" on public.bct_security_settings;
create policy "bct_security_settings_admin_update"
on public.bct_security_settings
for update to authenticated
using (
  (
    coalesce(auth.jwt()->'app_metadata'->>'role','') in ('admin','bct_admin','owner')
    or lower(coalesce(auth.jwt()->>'email',''))=lower('myproject@bctrenovations.com')
  )
  and (
    not coalesce(admin_mfa_enforced,false)
    or coalesce(auth.jwt()->>'aal','aal1')='aal2'
  )
)
with check (
  (
    coalesce(auth.jwt()->'app_metadata'->>'role','') in ('admin','bct_admin','owner')
    or lower(coalesce(auth.jwt()->>'email',''))=lower('myproject@bctrenovations.com')
  )
  and (
    not coalesce(admin_mfa_ui_ready,false)
    or coalesce(auth.jwt()->>'aal','aal1')='aal2'
  )
  and (
    not coalesce(admin_mfa_enforced,false)
    or (
      coalesce(auth.jwt()->>'aal','aal1')='aal2'
      and coalesce(admin_mfa_ui_ready,false)
    )
  )
  and singleton is true
  and updated_by=auth.uid()
);

create or replace function public.bct_admin_set_mfa_ui_ready(p_ready boolean)
returns jsonb
language plpgsql
set search_path='public','auth','pg_temp'
as $$
begin
  if not (
    coalesce(auth.jwt()->'app_metadata'->>'role','') in ('admin','bct_admin','owner')
    or lower(coalesce(auth.jwt()->>'email',''))=lower('myproject@bctrenovations.com')
  ) then
    raise exception 'BCT admin role required' using errcode='42501';
  end if;
  if coalesce(p_ready,false) and coalesce(auth.jwt()->>'aal','aal1')<>'aal2' then
    raise exception 'Complete MFA verification before marking the Admin MFA UI ready' using errcode='42501';
  end if;
  update public.bct_security_settings
     set admin_mfa_ui_ready=coalesce(p_ready,false),updated_by=auth.uid(),updated_at=now()
   where singleton;
  return public.bct_admin_mfa_status();
end
$$;

create or replace function public.bct_admin_enable_mfa_enforcement()
returns jsonb
language plpgsql
set search_path='public','auth','pg_temp'
as $$
begin
  if not (
    coalesce(auth.jwt()->'app_metadata'->>'role','') in ('admin','bct_admin','owner')
    or lower(coalesce(auth.jwt()->>'email',''))=lower('myproject@bctrenovations.com')
  ) then
    raise exception 'BCT admin role required' using errcode='42501';
  end if;
  if coalesce(auth.jwt()->>'aal','aal1')<>'aal2' then
    raise exception 'Complete MFA first; an aal2 admin session is required to enable enforcement' using errcode='42501';
  end if;
  if not coalesce((select admin_mfa_ui_ready from public.bct_security_settings where singleton),false) then
    raise exception 'Admin MFA UI must be deployed and tested before enforcement';
  end if;
  update public.bct_security_settings
     set admin_mfa_enforced=true,updated_by=auth.uid(),updated_at=now()
   where singleton;
  return public.bct_admin_mfa_status();
end
$$;
