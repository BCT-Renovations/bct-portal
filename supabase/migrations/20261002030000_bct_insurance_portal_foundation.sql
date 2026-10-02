-- BCT Insurance Portal foundation
-- Additive/isolation-first schema. Does not alter contractor bids, estimator separation, or existing project visibility.

create table if not exists public.bct_insurance_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  carrier_name text,
  organization_type text not null default 'carrier' check (organization_type in ('carrier','tpa','independent_adjusting_firm','other')),
  phone text,
  email text,
  status text not null default 'pending' check (status in ('pending','approved','hold','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bct_insurance_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.bct_insurance_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'adjuster' check (member_role in ('organization_admin','adjuster','claims_representative')),
  display_name text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id,user_id)
);

create table if not exists public.bct_insurance_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.bct_insurance_organizations(id),
  assigned_member_id uuid references public.bct_insurance_members(id),
  project_id uuid,
  claim_number text not null,
  policyholder_name text not null,
  property_address text not null,
  property_city text not null,
  property_state text not null,
  property_zip text,
  loss_type text not null,
  loss_date date,
  carrier_scope jsonb not null default '{}'::jsonb,
  carrier_estimate jsonb not null default '{}'::jsonb,
  intake_documents jsonb not null default '[]'::jsonb,
  status text not null default 'submitted' check (status in (
    'submitted','bct_review','needs_information','accepted','declined',
    'assessment_required','estimating','supplement_pending','authorized',
    'in_progress','completion_review','completed','closed'
  )),
  authorization_status text not null default 'pending' check (authorization_status in ('pending','authorized','partially_authorized','denied')),
  bct_internal_notes jsonb not null default '[]'::jsonb,
  submitted_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id,claim_number)
);

alter table public.bct_insurance_organizations enable row level security;
alter table public.bct_insurance_members enable row level security;
alter table public.bct_insurance_claims enable row level security;

create or replace function public.bct_insurance_member_of(p_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.bct_insurance_members m
    where m.organization_id=p_org and m.user_id=auth.uid() and m.active=true
  );
$$;
revoke all on function public.bct_insurance_member_of(uuid) from public,anon;
grant execute on function public.bct_insurance_member_of(uuid) to authenticated;

drop policy if exists "insurance organization member read" on public.bct_insurance_organizations;
create policy "insurance organization member read" on public.bct_insurance_organizations
for select to authenticated using (public.is_bct_admin() or public.bct_insurance_member_of(id));

drop policy if exists "insurance member same organization read" on public.bct_insurance_members;
create policy "insurance member same organization read" on public.bct_insurance_members
for select to authenticated using (public.is_bct_admin() or public.bct_insurance_member_of(organization_id));

-- Claims are visible only to BCT Admin or an active member of the owning insurance organization.
drop policy if exists "insurance claim organization read" on public.bct_insurance_claims;
create policy "insurance claim organization read" on public.bct_insurance_claims
for select to authenticated using (public.is_bct_admin() or public.bct_insurance_member_of(organization_id));

-- An authenticated insurance member can submit a claim only for their own approved organization.
-- The project link and BCT-controlled statuses cannot be self-approved by this insert policy.
drop policy if exists "insurance claim member submit" on public.bct_insurance_claims;
create policy "insurance claim member submit" on public.bct_insurance_claims
for insert to authenticated with check (
  public.bct_insurance_member_of(organization_id)
  and submitted_by=auth.uid()
  and project_id is null
  and status='submitted'
  and authorization_status='pending'
  and bct_internal_notes='[]'::jsonb
  and exists(select 1 from public.bct_insurance_organizations o where o.id=organization_id and o.status='approved')
);

-- No direct insurance-member UPDATE/DELETE policy is granted.
-- Future constrained RPCs will handle carrier-facing supplements/messages without exposing
-- BCT internal notes, contractor bids, margins, contractor selection, or unrelated homeowner data.

comment on table public.bct_insurance_claims is
'BCT Insurance Portal claim intake. Submission enters BCT Review; it does not automatically create or activate a construction project.';
