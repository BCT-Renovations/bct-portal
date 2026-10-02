-- BCT V46 contractor identity + homeowner trade-lead foundation.
-- Isolated feature migration. Do not apply to production before non-production validation.

alter table public.bct_contractor_documents
  drop constraint if exists bct_contractor_documents_document_type_check;

alter table public.bct_contractor_documents
  add constraint bct_contractor_documents_document_type_check check (
    document_type in (
      'profile_photo',
      'government_id_front',
      'government_id_back',
      'contractor_trade_license',
      'certificate_of_insurance',
      'w9',
      'work_photo',
      'supporting_document'
    )
  ) not valid;

alter table public.bct_contractor_documents validate constraint bct_contractor_documents_document_type_check;

-- A contractor profile photo is verification-controlled separately from private identity documents.
create table if not exists public.bct_contractor_identity_profiles (
  contractor_id uuid primary key references public.bct_contractors(id) on delete cascade,
  profile_photo_document_id uuid references public.bct_contractor_documents(id) on delete set null,
  profile_photo_status text not null default 'pending'
    check (profile_photo_status in ('pending','approved','rejected')),
  profile_photo_approved_at timestamptz,
  profile_photo_approved_by uuid,
  profile_photo_rejection_reason text,
  updated_at timestamptz not null default now()
);
alter table public.bct_contractor_identity_profiles enable row level security;
revoke all on public.bct_contractor_identity_profiles from anon,authenticated;

-- Internal assignment extension: unlimited contractor/trade assignments can exist;
-- homeowner visibility is an explicit BCT-controlled release, never automatic.
create table if not exists public.bct_project_trade_leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.bct_projects(id) on delete cascade,
  contractor_id uuid not null references public.bct_contractors(id) on delete cascade,
  trade text not null,
  role_label text,
  is_primary_contact boolean not null default false,
  homeowner_visible boolean not null default false,
  released_at timestamptz,
  released_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id,contractor_id,trade)
);
create unique index if not exists bct_project_trade_leads_one_visible_lead_per_trade
  on public.bct_project_trade_leads(project_id,lower(trade))
  where homeowner_visible;

create unique index if not exists bct_project_trade_leads_one_primary_contact
  on public.bct_project_trade_leads(project_id)
  where homeowner_visible and is_primary_contact;
alter table public.bct_project_trade_leads enable row level security;
revoke all on public.bct_project_trade_leads from anon,authenticated;

-- BCT Admin approves/rejects the public-facing profile photo. Private IDs are never released here.
create or replace function public.bct_admin_review_contractor_profile_photo(
  p_contractor_id uuid,
  p_document_id uuid,
  p_status text,
  p_reason text default null
) returns void
language plpgsql security definer set search_path=public,auth as $$
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
  if p_status not in ('pending','approved','rejected') then raise exception 'Invalid profile photo status'; end if;
  if not exists(
    select 1 from public.bct_contractor_documents d
    where d.id=p_document_id and d.contractor_id=p_contractor_id and d.document_type='profile_photo'
  ) then raise exception 'Profile photo document not found for contractor'; end if;

  if p_status='approved' and not exists(
    select 1 from public.bct_contractor_documents d
    where d.id=p_document_id
      and d.contractor_id=p_contractor_id
      and d.document_type='profile_photo'
      and d.review_status='approved'
  ) then
    raise exception 'Profile photo document review must be approved before identity approval';
  end if;

  insert into public.bct_contractor_identity_profiles(
    contractor_id,profile_photo_document_id,profile_photo_status,
    profile_photo_approved_at,profile_photo_approved_by,profile_photo_rejection_reason,updated_at
  ) values(
    p_contractor_id,p_document_id,p_status,
    case when p_status='approved' then now() else null end,
    case when p_status='approved' then auth.uid() else null end,
    case when p_status='rejected' then nullif(btrim(p_reason),'') else null end,now()
  )
  on conflict(contractor_id) do update set
    profile_photo_document_id=excluded.profile_photo_document_id,
    profile_photo_status=excluded.profile_photo_status,
    profile_photo_approved_at=excluded.profile_photo_approved_at,
    profile_photo_approved_by=excluded.profile_photo_approved_by,
    profile_photo_rejection_reason=excluded.profile_photo_rejection_reason,
    updated_at=now();
end $$;
revoke execute on function public.bct_admin_review_contractor_profile_photo(uuid,uuid,text,text) from public,anon;
grant execute on function public.bct_admin_review_contractor_profile_photo(uuid,uuid,text,text) to authenticated;

-- BCT controls which assigned trade lead is disclosed to a homeowner.
create or replace function public.bct_admin_set_project_trade_lead(
  p_project_id uuid,p_contractor_id uuid,p_trade text,p_role_label text default null,
  p_primary boolean default false,p_homeowner_visible boolean default false
) returns uuid
language plpgsql security definer set search_path=public,auth as $$
declare v_id uuid;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
  if nullif(btrim(p_trade),'') is null then raise exception 'Trade is required'; end if;
  if not exists(select 1 from public.bct_contractors c where c.id=p_contractor_id and c.active) then
    raise exception 'Active contractor required';
  end if;
  if p_homeowner_visible and not exists(
    select 1 from public.bct_contractor_identity_profiles ip
    join public.bct_contractor_documents pd on pd.id=ip.profile_photo_document_id
    where ip.contractor_id=p_contractor_id and ip.profile_photo_status='approved'
      and pd.document_type='profile_photo' and pd.review_status='approved'
  ) then raise exception 'Contractor profile photo must be BCT-approved before homeowner release'; end if;

  if p_homeowner_visible and not exists(
    select 1
    from public.bct_assignments a
    where a.project_id=p_project_id
      and a.contractor_id=p_contractor_id
      and a.status in ('assigned','scheduled','in_progress','quality_review')
  ) then
    raise exception 'Contractor must be assigned to this project before homeowner release';
  end if;

  if p_homeowner_visible and p_primary then
    update public.bct_project_trade_leads
      set is_primary_contact=false,updated_at=now()
    where project_id=p_project_id
      and is_primary_contact
      and homeowner_visible
      and not (contractor_id=p_contractor_id and lower(trade)=lower(p_trade));
  end if;

  if p_homeowner_visible then
    update public.bct_project_trade_leads
      set homeowner_visible=false,released_at=null,released_by=null,updated_at=now()
    where project_id=p_project_id and lower(trade)=lower(p_trade)
      and contractor_id<>p_contractor_id and homeowner_visible;
  end if;

  insert into public.bct_project_trade_leads(
    project_id,contractor_id,trade,role_label,is_primary_contact,homeowner_visible,released_at,released_by
  ) values(
    p_project_id,p_contractor_id,btrim(p_trade),nullif(btrim(p_role_label),''),
    p_primary,p_homeowner_visible,
    case when p_homeowner_visible then now() else null end,
    case when p_homeowner_visible then auth.uid() else null end
  )
  on conflict(project_id,contractor_id,trade) do update set
    role_label=excluded.role_label,is_primary_contact=excluded.is_primary_contact,
    homeowner_visible=excluded.homeowner_visible,
    released_at=case when excluded.homeowner_visible then now() else null end,
    released_by=case when excluded.homeowner_visible then auth.uid() else null end,
    updated_at=now()
  returning id into v_id;
  return v_id;
end $$;
revoke execute on function public.bct_admin_set_project_trade_lead(uuid,uuid,text,text,boolean,boolean) from public,anon;
grant execute on function public.bct_admin_set_project_trade_lead(uuid,uuid,text,text,boolean,boolean) to authenticated;

-- Homeowner-safe identity view: deliberately excludes government ID, license scans,
-- bids, internal notes, margins, and unassigned/unreleased contractors.
create or replace function public.bct_homeowner_project_trade_leads(p_project_id uuid)
returns table(
  contractor_id uuid,contractor_name text,trade text,role_label text,is_primary_contact boolean,
  profile_photo_storage_path text
)
language sql stable security definer set search_path=public,auth as $$
  select c.id,coalesce(c.business_name,c.legal_name,'BCT Contractor'),l.trade,
         coalesce(l.role_label,l.trade||' Lead'),l.is_primary_contact,d.storage_path
  from public.bct_project_trade_leads l
  join public.bct_contractors c on c.id=l.contractor_id and c.active
  join public.bct_contractor_identity_profiles ip on ip.contractor_id=c.id
    and ip.profile_photo_status='approved'
  join public.bct_contractor_documents d on d.id=ip.profile_photo_document_id
    and d.document_type='profile_photo'
    and d.review_status='approved'
  where l.project_id=p_project_id and l.homeowner_visible
    and exists(
      select 1 from public.bct_projects p
      join public.bct_customers cu on cu.id=p.customer_id
      where p.id=p_project_id and cu.auth_user_id=auth.uid()
    )
  order by l.is_primary_contact desc,l.trade,c.legal_name;
$$;
revoke execute on function public.bct_homeowner_project_trade_leads(uuid) from public,anon;
grant execute on function public.bct_homeowner_project_trade_leads(uuid) to authenticated;


-- Resolve one homeowner-authorized profile-photo path only after all identity,
-- document-review, assignment, release, and project-ownership gates pass.
create or replace function public.bct_homeowner_contractor_profile_photo_path(
  p_project_id uuid,p_contractor_id uuid
) returns text
language sql stable security definer set search_path=public,auth as $$
  select d.storage_path
  from public.bct_project_trade_leads l
  join public.bct_assignments a
    on a.project_id=l.project_id and a.contractor_id=l.contractor_id and a.status in ('assigned','scheduled','in_progress','quality_review')
  join public.bct_contractor_identity_profiles ip
    on ip.contractor_id=l.contractor_id and ip.profile_photo_status='approved'
  join public.bct_contractor_documents d
    on d.id=ip.profile_photo_document_id
    and d.document_type='profile_photo'
    and d.review_status='approved'
  join public.bct_projects p on p.id=l.project_id
  join public.bct_customers cu on cu.id=p.customer_id
  where l.project_id=p_project_id
    and l.contractor_id=p_contractor_id
    and l.homeowner_visible
    and cu.auth_user_id=auth.uid()
  limit 1;
$$;
revoke execute on function public.bct_homeowner_contractor_profile_photo_path(uuid,uuid) from public,anon;
grant execute on function public.bct_homeowner_contractor_profile_photo_path(uuid,uuid) to authenticated;


-- Keep homeowner identity display synchronized with the canonical V46 assignment lifecycle.
create or replace function public.bct_project_trade_leads_assignment_visibility_guard()
returns trigger language plpgsql set search_path=public,auth as $$
begin
  if new.status in ('completed','cancelled') and old.status is distinct from new.status then
    update public.bct_project_trade_leads
       set homeowner_visible=false,
           is_primary_contact=false,
           released_at=null,
           released_by=null,
           updated_at=now()
     where project_id=new.project_id
       and contractor_id=new.contractor_id
       and homeowner_visible;
  end if;
  return new;
end $$;

drop trigger if exists trg_bct_assignment_trade_lead_visibility on public.bct_assignments;
create trigger trg_bct_assignment_trade_lead_visibility
after update of status on public.bct_assignments
for each row execute function public.bct_project_trade_leads_assignment_visibility_guard();
