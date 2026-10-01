-- BCT V46 Estimator System
-- Additive schema only. Existing Big Dog 3 / contractor / homeowner structures are not replaced.

create table if not exists public.bct_estimator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  legal_name text not null,
  business_name text,
  phone text not null,
  email text not null,
  experience text not null,
  trades text[] not null default '{}',
  service_jurisdictions text[] not null default '{}',
  references_data jsonb not null default '[]'::jsonb,
  credentials jsonb not null default '[]'::jsonb,
  background_status text not null default 'pending',
  approval_status text not null default 'pending' check (approval_status in ('pending','background_screening','approved','denied','hold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bct_estimator_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  approval_status text not null default 'pending' check (approval_status in ('pending','background_screening','approved','denied','hold')),
  contact jsonb not null default '{}'::jsonb,
  experience text,
  trades text[] not null default '{}',
  service_jurisdictions text[] not null default '{}',
  references_data jsonb not null default '[]'::jsonb,
  credentials jsonb not null default '[]'::jsonb,
  background_status text not null default 'pending',
  available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bct_site_assessments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  estimator_user_id uuid references auth.users(id),
  status text not null default 'assessment_required' check (status in (
    'assessment_required','payment_pending','paid','estimator_assigned','scheduled',
    'site_assessment_completed','assessment_submitted','bct_review','bct_approved',
    'contractor_bidding','credited_to_project'
  )),
  homeowner_fee numeric(12,2) not null default 0 check (homeowner_fee >= 0),
  fee_paid_at timestamptz,
  assessment_completed_at timestamptz,
  bct_approved_at timestamptz,
  project_credit_amount numeric(12,2) not null default 0 check (project_credit_amount >= 0),
  site_visit_complete boolean not null default false,
  photos_complete boolean not null default false,
  measurements_complete boolean not null default false,
  documentation_complete boolean not null default false,
  assessment_package jsonb not null default '{}'::jsonb,
  bct_accepted_complete boolean not null default false,
  estimator_assignment_fee numeric(12,2) not null default 0 check (estimator_assignment_fee >= 0),
  extra_travel_preapproved boolean not null default false,
  extra_travel_amount numeric(12,2) not null default 0 check (extra_travel_amount >= 0),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bct_estimator_applications enable row level security;
alter table public.bct_estimator_profiles enable row level security;
alter table public.bct_site_assessments enable row level security;

create or replace function public.bct_estimator_payment_eligible(a public.bct_site_assessments)
returns boolean language sql immutable as $$
  select a.site_visit_complete and a.photos_complete and a.measurements_complete
    and a.documentation_complete and a.bct_accepted_complete;
$$;

create or replace function public.bct_estimator_conflict(p_project_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.bct_site_assessments
    where project_id=p_project_id and estimator_user_id=p_user_id
  );
$$;

create or replace function public.bct_assert_no_estimator_project_conflict(p_project_id uuid,p_user_id uuid)
returns void language plpgsql stable security definer set search_path=public as $$
begin
  if public.bct_estimator_conflict(p_project_id,p_user_id) then
    raise exception 'BCT separation of duties: project estimator cannot bid on or perform the same project';
  end if;
end $$;

-- Estimator intake is public-insert only; applicants cannot read the application table.
drop policy if exists "estimator_application_public_insert" on public.bct_estimator_applications;
create policy "estimator_application_public_insert" on public.bct_estimator_applications
for insert to anon, authenticated with check (
  approval_status='pending' and background_status='pending'
);

-- Estimators may read their own approved profile only.
drop policy if exists "estimator_profile_self_read" on public.bct_estimator_profiles;
create policy "estimator_profile_self_read" on public.bct_estimator_profiles
for select to authenticated using (user_id=auth.uid());

-- Assigned estimators may read their own assessments and update field-package data only while assigned.
drop policy if exists "estimator_assessment_self_read" on public.bct_site_assessments;
create policy "estimator_assessment_self_read" on public.bct_site_assessments
for select to authenticated using (estimator_user_id=auth.uid());

drop policy if exists "estimator_assessment_self_update" on public.bct_site_assessments;
create policy "estimator_assessment_self_update" on public.bct_site_assessments
for update to authenticated using (estimator_user_id=auth.uid())
with check (estimator_user_id=auth.uid());

-- No estimator-side INSERT/DELETE policies are granted. BCT creates assignments and controls review/payment state.

comment on table public.bct_site_assessments is
'BCT V46 paid professional site assessments. Remote estimate remains free first. Completed assessment fee is credited in full if homeowner proceeds; otherwise completed assessment fee remains earned/nonrefundable.';

comment on function public.bct_assert_no_estimator_project_conflict(uuid,uuid) is
'Mandatory server-side guard to be called by bid/assignment mutations so a project estimator cannot bid or become performing contractor on the same project.';
