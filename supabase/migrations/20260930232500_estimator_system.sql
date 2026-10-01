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
  updated_at timestamptz not null default now(),
  unique (email)
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
  unique (project_id),
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

create or replace function public.bct_estimator_transition_allowed(p_from text,p_to text)
returns boolean language sql immutable as $
  select case p_from
    when 'assessment_required' then p_to='payment_pending'
    when 'payment_pending' then p_to='paid'
    when 'paid' then p_to='estimator_assigned'
    when 'estimator_assigned' then p_to='scheduled'
    when 'scheduled' then p_to='site_assessment_completed'
    when 'site_assessment_completed' then p_to='assessment_submitted'
    when 'assessment_submitted' then p_to='bct_review'
    when 'bct_review' then p_to='bct_approved'
    when 'bct_approved' then p_to='contractor_bidding'
    when 'contractor_bidding' then p_to='credited_to_project'
    else false end;
$;

create or replace function public.bct_enforce_estimator_assessment_transition()
returns trigger language plpgsql set search_path=public as $
begin
  if new.status is distinct from old.status and not public.bct_estimator_transition_allowed(old.status,new.status) then
    raise exception 'Invalid BCT site-assessment status transition: % -> %',old.status,new.status;
  end if;
  if new.status in ('scheduled','site_assessment_completed','assessment_submitted','bct_review','bct_approved','contractor_bidding','credited_to_project')
     and new.fee_paid_at is null then
    raise exception 'Assessment fee must be paid before scheduling or field work';
  end if;
  if new.status in ('bct_approved','contractor_bidding','credited_to_project')
     and not new.bct_accepted_complete then
    raise exception 'BCT must accept the complete assessment package before approval/bidding';
  end if;
  if new.extra_travel_amount>0 and not new.extra_travel_preapproved then
    raise exception 'Additional estimator travel compensation requires advance BCT approval';
  end if;
  return new;
end $;

drop trigger if exists bct_estimator_assessment_transition_guard on public.bct_site_assessments;
create trigger bct_estimator_assessment_transition_guard
before update on public.bct_site_assessments
for each row execute function public.bct_enforce_estimator_assessment_transition();

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

-- Direct estimator UPDATE is intentionally not granted. Field submission uses the constrained RPC below
-- so estimators cannot change fees, payment state, BCT approval, assignment ownership, or travel compensation.
create or replace function public.bct_submit_assessment_package(
  p_project_id uuid,p_package jsonb,p_site_visit_complete boolean,p_photos_complete boolean,
  p_measurements_complete boolean,p_documentation_complete boolean
) returns void language plpgsql security definer set search_path=public as $
declare a public.bct_site_assessments;
begin
  select * into a from public.bct_site_assessments where project_id=p_project_id for update;
  if a.id is null or a.estimator_user_id is distinct from auth.uid() then raise exception 'Assessment assignment not authorized'; end if;
  if a.status not in ('scheduled','site_assessment_completed') then raise exception 'Assessment is not ready for field submission'; end if;
  if a.fee_paid_at is null then raise exception 'Assessment fee payment is required'; end if;
  if not (p_site_visit_complete and p_photos_complete and p_measurements_complete and p_documentation_complete) then raise exception 'Complete assessment documentation is required'; end if;
  update public.bct_site_assessments set
    status='assessment_submitted',site_visit_complete=p_site_visit_complete,photos_complete=p_photos_complete,
    measurements_complete=p_measurements_complete,documentation_complete=p_documentation_complete,
    assessment_package=coalesce(p_package,'{}'::jsonb),assessment_completed_at=coalesce(assessment_completed_at,now()),updated_at=now()
  where id=a.id;
end $;

revoke all on function public.bct_submit_assessment_package(uuid,jsonb,boolean,boolean,boolean,boolean) from public,anon;
grant execute on function public.bct_submit_assessment_package(uuid,jsonb,boolean,boolean,boolean,boolean) to authenticated;

-- No estimator-side table INSERT/UPDATE/DELETE policies are granted. BCT creates assignments and controls review/payment state.

comment on table public.bct_site_assessments is
'BCT V46 paid professional site assessments. Remote estimate remains free first. Completed assessment fee is credited in full if homeowner proceeds; otherwise completed assessment fee remains earned/nonrefundable.';

comment on function public.bct_assert_no_estimator_project_conflict(uuid,uuid) is
'Mandatory server-side guard to be called by bid/assignment mutations so a project estimator cannot bid or become performing contractor on the same project.';
