-- BCT V46 Insurance Portal foundation
-- Additive and isolated: does not modify homeowner, contractor, estimator, or Photo Build flows.

create table if not exists public.bct_insurance_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  carrier_code text,
  status text not null default 'pending' check (status in ('pending','active','suspended','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bct_insurance_members (
  organization_id uuid not null references public.bct_insurance_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'adjuster' check (member_role in ('organization_admin','adjuster','claims_representative','read_only')),
  status text not null default 'active' check (status in ('active','suspended','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);

-- The legacy live schema already uses public.bct_insurance_partner_claims for BCT's internal project claim record.
-- Preserve it. Partner-submitted claim assignments use a distinct intake table and link to the legacy/internal record only through BCT Admin.
create table if not exists public.bct_insurance_partner_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.bct_insurance_organizations(id),
  submitted_by uuid not null references auth.users(id),
  assigned_adjuster_user_id uuid references auth.users(id),
  claim_number text not null,
  policyholder_name text not null,
  property_address jsonb not null default '{}'::jsonb,
  loss_type text not null,
  date_of_loss date,
  status text not null default 'bct_review' check (status in (
    'bct_review','needs_information','accepted','declined','estimate_in_progress',
    'carrier_review','supplement','authorized','construction','completed','closed'
  )),
  carrier_scope jsonb not null default '{}'::jsonb,
  carrier_estimate jsonb not null default '{}'::jsonb,
  insurance_documents jsonb not null default '[]'::jsonb,
  insurance_photos jsonb not null default '[]'::jsonb,
  bct_insurance_facing_scope jsonb not null default '{}'::jsonb,
  bct_insurance_facing_estimate jsonb not null default '{}'::jsonb,
  supplement_data jsonb not null default '[]'::jsonb,
  authorization_data jsonb not null default '{}'::jsonb,
  project_id uuid,
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id,claim_number)
);

create index if not exists bct_insurance_partner_claims_org_idx on public.bct_insurance_partner_claims(organization_id);
create index if not exists bct_insurance_partner_claims_adjuster_idx on public.bct_insurance_partner_claims(assigned_adjuster_user_id);
create index if not exists bct_insurance_partner_claims_project_idx on public.bct_insurance_partner_claims(project_id) where project_id is not null;

alter table public.bct_insurance_organizations enable row level security;
alter table public.bct_insurance_members enable row level security;
alter table public.bct_insurance_partner_claims enable row level security;

create or replace function public.bct_insurance_member_of(p_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.bct_insurance_members
    where organization_id=p_org and user_id=auth.uid() and status='active'
  );
$$;

revoke all on function public.bct_insurance_member_of(uuid) from public,anon;
grant execute on function public.bct_insurance_member_of(uuid) to authenticated;

drop policy if exists "insurance_org_member_read" on public.bct_insurance_organizations;
create policy "insurance_org_member_read" on public.bct_insurance_organizations
for select to authenticated using (public.bct_insurance_member_of(id));

drop policy if exists "insurance_member_same_org_read" on public.bct_insurance_members;
create policy "insurance_member_same_org_read" on public.bct_insurance_members
for select to authenticated using (public.bct_insurance_member_of(organization_id));

drop policy if exists "insurance_claim_member_read" on public.bct_insurance_partner_claims;
create policy "insurance_claim_member_read" on public.bct_insurance_partner_claims
for select to authenticated using (public.bct_insurance_member_of(organization_id));

-- Claim creation is constrained through an RPC so browser users cannot create claims for another carrier,
-- set a project_id, skip BCT Review, or pre-authorize construction.
create or replace function public.bct_insurance_submit_claim(
  p_organization_id uuid,
  p_claim_number text,
  p_policyholder_name text,
  p_property_address jsonb,
  p_loss_type text,
  p_date_of_loss date,
  p_carrier_scope jsonb default '{}'::jsonb,
  p_carrier_estimate jsonb default '{}'::jsonb,
  p_documents jsonb default '[]'::jsonb,
  p_photos jsonb default '[]'::jsonb
) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if not public.bct_insurance_member_of(p_organization_id) then
    raise exception 'Insurance organization access denied' using errcode='42501';
  end if;
  if nullif(btrim(coalesce(p_claim_number,'')),'') is null then raise exception 'Claim number is required'; end if;
  if nullif(btrim(coalesce(p_policyholder_name,'')),'') is null then raise exception 'Policyholder name is required'; end if;
  if nullif(btrim(coalesce(p_loss_type,'')),'') is null then raise exception 'Loss type is required'; end if;

  insert into public.bct_insurance_partner_claims(
    organization_id,submitted_by,assigned_adjuster_user_id,claim_number,policyholder_name,
    property_address,loss_type,date_of_loss,carrier_scope,carrier_estimate,insurance_documents,insurance_photos,status
  ) values (
    p_organization_id,auth.uid(),auth.uid(),btrim(p_claim_number),btrim(p_policyholder_name),
    coalesce(p_property_address,'{}'::jsonb),btrim(p_loss_type),p_date_of_loss,
    coalesce(p_carrier_scope,'{}'::jsonb),coalesce(p_carrier_estimate,'{}'::jsonb),
    coalesce(p_documents,'[]'::jsonb),coalesce(p_photos,'[]'::jsonb),'bct_review'
  ) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.bct_insurance_submit_claim(uuid,text,text,jsonb,text,date,jsonb,jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.bct_insurance_submit_claim(uuid,text,text,jsonb,text,date,jsonb,jsonb,jsonb,jsonb) to authenticated;

-- Only BCT Admin can accept/decline a submitted insurance assignment.
-- Accepting a claim does NOT itself create a construction job; project linkage is a later controlled step.
create or replace function public.bct_admin_review_insurance_claim(p_claim_id uuid,p_decision text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  if p_decision not in ('accepted','declined','needs_information') then raise exception 'Unsupported insurance review decision'; end if;
  update public.bct_insurance_partner_claims
     set status=p_decision,
         accepted_at=case when p_decision='accepted' then coalesce(accepted_at,now()) else accepted_at end,
         updated_at=now()
   where id=p_claim_id and status in ('bct_review','needs_information');
  if not found then raise exception 'Insurance claim is not awaiting BCT review'; end if;
end;
$$;

revoke all on function public.bct_admin_review_insurance_claim(uuid,text) from public,anon;
grant execute on function public.bct_admin_review_insurance_claim(uuid,text) to authenticated;

comment on table public.bct_insurance_partner_claims is
'BCT Insurance Portal claim assignments. Submission enters BCT Review; claim acceptance does not automatically create an active construction job.';
