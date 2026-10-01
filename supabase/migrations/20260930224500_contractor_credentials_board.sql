-- BCT V46 Contractor Credentials Board foundation.
-- Additive only: preserves Big Dog 3 and existing production behavior until applied.

create table if not exists public.bct_contractor_credentials (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.bct_contractors(id) on delete cascade,
  credential_type text not null check (credential_type in ('general_liability','bond','license_registration','workers_comp','workers_comp_exemption')),
  trade text,
  jurisdiction text,
  credential_number text,
  issued_at date,
  expires_at date,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  verified_at timestamptz,
  verified_by uuid,
  document_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bct_contractor_credentials_unique_scope
on public.bct_contractor_credentials(contractor_id,credential_type,coalesce(trade,''),coalesce(jurisdiction,''));

alter table public.bct_contractor_credentials enable row level security;
revoke all on public.bct_contractor_credentials from anon,authenticated;

create or replace function public.bct_credential_health(p_expires_at date,p_verification_status text)
returns text language sql stable as $$
 select case
  when coalesce(p_verification_status,'pending')<>'verified' then 'red'
  when p_expires_at is not null and p_expires_at<current_date then 'red'
  when p_expires_at is not null and p_expires_at<=current_date+30 then 'yellow'
  else 'green' end
$$;

create or replace function public.bct_admin_contractor_credentials_board()
returns table(
 id uuid, contractor_id uuid, contractor_name text, credential_type text, trade text,
 jurisdiction text, credential_number text, expires_at date, verification_status text,
 health text, days_to_expiration integer, alert_window text
)
language sql stable security definer set search_path=public,auth as $$
 select cr.id,cr.contractor_id,coalesce(c.business_name,c.legal_name,'Contractor'),
 cr.credential_type,cr.trade,cr.jurisdiction,cr.credential_number,cr.expires_at,cr.verification_status,
 public.bct_credential_health(cr.expires_at,cr.verification_status),
 case when cr.expires_at is null then null else cr.expires_at-current_date end,
 case when cr.verification_status<>'verified' then 'action_required'
      when cr.expires_at=current_date then 'expiration_day'
      when cr.expires_at<=current_date+7 then '7_day'
      when cr.expires_at<=current_date+14 then '14_day'
      when cr.expires_at<=current_date+30 then '30_day'
      else null end
 from public.bct_contractor_credentials cr join public.bct_contractors c on c.id=cr.contractor_id
 where public.is_bct_admin()
 order by case public.bct_credential_health(cr.expires_at,cr.verification_status) when 'red' then 0 when 'yellow' then 1 else 2 end,
 cr.expires_at nulls last;
$$;
revoke execute on function public.bct_admin_contractor_credentials_board() from public;
grant execute on function public.bct_admin_contractor_credentials_board() to authenticated;

create or replace function public.bct_contractor_required_credentials_current(p_contractor_id uuid,p_trade text,p_jurisdiction text)
returns boolean language sql stable security definer set search_path=public,auth as $$
 select
   exists(select 1 from public.bct_contractor_credentials x where x.contractor_id=p_contractor_id and x.credential_type='general_liability' and public.bct_credential_health(x.expires_at,x.verification_status)='green')
   and exists(select 1 from public.bct_contractor_credentials x where x.contractor_id=p_contractor_id and x.credential_type='bond' and public.bct_credential_health(x.expires_at,x.verification_status)='green' and (x.jurisdiction is null or lower(x.jurisdiction)=lower(p_jurisdiction)))
   and exists(select 1 from public.bct_contractor_credentials x where x.contractor_id=p_contractor_id and x.credential_type='license_registration' and public.bct_credential_health(x.expires_at,x.verification_status)='green' and (x.trade is null or lower(x.trade)=lower(p_trade)) and (x.jurisdiction is null or lower(x.jurisdiction)=lower(p_jurisdiction)))
   and exists(select 1 from public.bct_contractor_credentials x where x.contractor_id=p_contractor_id and x.credential_type in ('workers_comp','workers_comp_exemption') and public.bct_credential_health(x.expires_at,x.verification_status)='green');
$$;
revoke execute on function public.bct_contractor_required_credentials_current(uuid,text,text) from public;
grant execute on function public.bct_contractor_required_credentials_current(uuid,text,text) to authenticated;
