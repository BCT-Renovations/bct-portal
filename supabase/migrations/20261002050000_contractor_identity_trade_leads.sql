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
      'insurance',
      'w9',
      'license_registration',
      'work_photo',
      'supporting_document',
      'background_check_authorization'
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
    where d.id=p_document_id and d.application_id=(select c.application_id from public.bct_contractors c where c.id=p_contractor_id) and d.document_type='profile_photo'
  ) then raise exception 'Profile photo document not found for contractor'; end if;

  if p_status='approved' and not exists(
    select 1 from public.bct_contractor_documents d
    where d.id=p_document_id
      and d.application_id=(select c.application_id from public.bct_contractors c where c.id=p_contractor_id)
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
      and not (contractor_id=p_contractor_id and lower(trade)=lower(btrim(p_trade)));
  end if;

  if p_homeowner_visible then
    update public.bct_project_trade_leads
      set homeowner_visible=false,released_at=null,released_by=null,updated_at=now()
    where project_id=p_project_id and lower(trade)=lower(btrim(p_trade))
      and contractor_id<>p_contractor_id and homeowner_visible;
  end if;

  insert into public.bct_project_trade_leads(
    project_id,contractor_id,trade,role_label,is_primary_contact,homeowner_visible,released_at,released_by
  ) values(
    p_project_id,p_contractor_id,lower(btrim(p_trade)),nullif(btrim(p_role_label),''),
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
    and d.application_id=c.application_id
    and d.document_type='profile_photo'
    and d.review_status='approved'
  where l.project_id=p_project_id and l.homeowner_visible
    and exists(
      select 1 from public.bct_assignments a
      where a.project_id=l.project_id and a.contractor_id=l.contractor_id
        and a.status in ('assigned','scheduled','in_progress','quality_review')
    )
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
  join public.bct_contractors c on c.id=l.contractor_id and c.active
  join public.bct_contractor_documents d
    on d.id=ip.profile_photo_document_id
    and d.application_id=c.application_id
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


-- Persist whether the applicant's government ID requires a back image.
alter table public.bct_contractor_applications
  add column if not exists government_id_has_back boolean not null default false;

-- Identity document cardinality: one current profile photo and one current ID side per contractor.
create unique index if not exists bct_contractor_identity_doc_singleton
  on public.bct_contractor_documents(application_id,document_type)
  where document_type in ('profile_photo','government_id_front','government_id_back');

-- Application-level identity completeness plugs into the existing V46 approval-readiness path
-- without creating a parallel contractor approval system.
create or replace function public.bct_application_identity_required_documents_ready(p_application_id uuid)
returns boolean language sql stable security definer set search_path=public,auth as $
  select
    exists(select 1 from public.bct_contractor_documents d where d.application_id=p_application_id and d.document_type='profile_photo' and d.review_status='approved')
    and exists(select 1 from public.bct_contractor_documents d where d.application_id=p_application_id and d.document_type='government_id_front' and d.review_status='approved')
    and (
      not coalesce((select a.government_id_has_back from public.bct_contractor_applications a where a.id=p_application_id),false)
      or exists(select 1 from public.bct_contractor_documents d where d.application_id=p_application_id and d.document_type='government_id_back' and d.review_status='approved')
    );
$;
revoke execute on function public.bct_application_identity_required_documents_ready(uuid) from public,anon;
grant execute on function public.bct_application_identity_required_documents_ready(uuid) to authenticated;

-- Defense in depth: even if an approval caller bypasses the normal Admin RPC, an application
-- cannot transition to approved until the required identity documents have passed BCT review.
create or replace function public.bct_contractor_application_identity_approval_guard()
returns trigger language plpgsql set search_path=public,auth as $
begin
  if new.status='approved' and old.status is distinct from new.status
     and not public.bct_application_identity_required_documents_ready(new.id) then
    raise exception 'Required contractor identity documents must be BCT-approved before application approval';
  end if;
  return new;
end $;

drop trigger if exists trg_bct_contractor_application_identity_approval_guard on public.bct_contractor_applications;
create trigger trg_bct_contractor_application_identity_approval_guard
before update of status on public.bct_contractor_applications
for each row execute function public.bct_contractor_application_identity_approval_guard();

-- Central identity-completeness predicate for approval/workforce gates.
create or replace function public.bct_contractor_identity_required_documents_ready(p_contractor_id uuid)
returns boolean language sql stable security definer set search_path=public,auth as $$
  select
    exists(select 1 from public.bct_contractor_documents d where d.application_id=(select c.application_id from public.bct_contractors c where c.id=p_contractor_id) and d.document_type='profile_photo' and d.review_status='approved')
    and exists(select 1 from public.bct_contractor_documents d where d.application_id=(select c.application_id from public.bct_contractors c where c.id=p_contractor_id) and d.document_type='government_id_front' and d.review_status='approved')
    and (
      not coalesce((select a.government_id_has_back from public.bct_contractor_applications a join public.bct_contractors c on c.application_id=a.id where c.id=p_contractor_id limit 1),false)
      or exists(select 1 from public.bct_contractor_documents d where d.application_id=(select c.application_id from public.bct_contractors c where c.id=p_contractor_id) and d.document_type='government_id_back' and d.review_status='approved')
    );
$$;
revoke execute on function public.bct_contractor_identity_required_documents_ready(uuid) from public,anon;
grant execute on function public.bct_contractor_identity_required_documents_ready(uuid) to authenticated;


-- Replacing a singleton identity document is explicit: retire the prior row first so a stale
-- approved profile/ID cannot remain current beside a newly uploaded document.
create or replace function public.bct_admin_retire_contractor_identity_document(p_document_id uuid)
returns void language plpgsql security definer set search_path=public,auth as $
declare v_doc public.bct_contractor_documents%rowtype;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
  select * into v_doc from public.bct_contractor_documents where id=p_document_id for update;
  if not found or v_doc.document_type not in ('profile_photo','government_id_front','government_id_back') then
    raise exception 'Identity document not found';
  end if;
  if v_doc.document_type='profile_photo' then
    update public.bct_contractor_identity_profiles
       set profile_photo_status='pending',profile_photo_approved_at=null,profile_photo_approved_by=null,updated_at=now()
     where profile_photo_document_id=v_doc.id;
    update public.bct_project_trade_leads l
       set homeowner_visible=false,is_primary_contact=false,released_at=null,released_by=null,updated_at=now()
     where l.contractor_id=(select c.id from public.bct_contractors c where c.application_id=v_doc.application_id limit 1)
       and l.homeowner_visible;
  end if;
  delete from public.bct_contractor_documents where id=v_doc.id;
end $;
revoke execute on function public.bct_admin_retire_contractor_identity_document(uuid) from public,anon;
grant execute on function public.bct_admin_retire_contractor_identity_document(uuid) to authenticated;

-- Revoking/rejecting the selected profile-photo document immediately revokes homeowner release.
create or replace function public.bct_contractor_identity_review_revocation_guard()
returns trigger language plpgsql set search_path=public,auth as $$
begin
  if old.review_status='approved' and new.review_status is distinct from 'approved' then
    update public.bct_contractor_identity_profiles
       set profile_photo_status='pending',
           profile_photo_approved_at=null,
           profile_photo_approved_by=null,
           updated_at=now()
     where profile_photo_document_id=new.id;
    update public.bct_project_trade_leads l
       set homeowner_visible=false,
           is_primary_contact=false,
           released_at=null,
           released_by=null,
           updated_at=now()
     where l.contractor_id=(select c.id from public.bct_contractors c where c.application_id=new.application_id limit 1)
       and l.homeowner_visible
       and exists(select 1 from public.bct_contractor_identity_profiles ip where ip.contractor_id=l.contractor_id and ip.profile_photo_document_id=new.id);
  end if;
  return new;
end $$;

drop trigger if exists trg_bct_identity_review_revocation on public.bct_contractor_documents;
create trigger trg_bct_identity_review_revocation
after update of review_status on public.bct_contractor_documents
for each row
when (old.document_type='profile_photo')
execute function public.bct_contractor_identity_review_revocation_guard();


-- Identity integration extensions for the existing canonical contractor functions.
-- These preserve the existing application/document workflows and only add the identity fields/types.

create or replace function public.bct_register_contractor_document(
  p_document_type text,
  p_storage_path text,
  p_original_filename text default null::text
)
returns public.bct_contractor_documents
language plpgsql
set search_path to 'public','auth','storage'
as $function$
declare
  v_uid uuid := auth.uid();
  v_app_id uuid;
  v_row public.bct_contractor_documents;
  v_existing public.bct_contractor_documents;
  v_type text := lower(btrim(coalesce(p_document_type,'')));
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select id into v_app_id
    from public.bct_contractor_applications
   where auth_user_id=v_uid
   order by created_at desc limit 1;
  if v_app_id is null then raise exception 'Contractor application required'; end if;

  if v_type not in (
    'profile_photo','government_id_front','government_id_back','contractor_trade_license',
    'certificate_of_insurance','insurance','w9','license_registration','work_photo',
    'supporting_document','background_check_authorization'
  ) then raise exception 'Unsupported contractor document type'; end if;

  if p_storage_path is null or btrim(p_storage_path)='' or split_part(p_storage_path,'/',1)<>v_uid::text then
    raise exception 'Storage path must be inside current user folder';
  end if;
  if split_part(p_storage_path,'/',2)<>v_app_id::text then
    raise exception 'Storage path must be inside the current contractor application folder';
  end if;
  if not exists(
    select 1 from storage.objects o
     where o.bucket_id='bct-contractor-documents' and o.name=btrim(p_storage_path)
  ) then raise exception 'Contractor document must be uploaded to BCT private storage before metadata is registered'; end if;

  select * into v_existing
    from public.bct_contractor_documents
   where storage_path=btrim(p_storage_path) limit 1;
  if v_existing.id is not null then
    if v_existing.application_id<>v_app_id then
      raise exception 'Storage object is already registered to another contractor application';
    end if;
    return v_existing;
  end if;

  if v_type in ('profile_photo','government_id_front','government_id_back')
     and exists(
       select 1 from public.bct_contractor_documents d
        where d.application_id=v_app_id and d.document_type=v_type
     ) then
    raise exception 'Retire the current identity document before registering its replacement';
  end if;

  insert into public.bct_contractor_documents(application_id,document_type,storage_path,original_filename,review_status)
  values(v_app_id,v_type,btrim(p_storage_path),nullif(btrim(p_original_filename),''),'pending')
  returning * into v_row;
  return v_row;
end
$function$;

create or replace function public.bct_submit_contractor_application(p_payload jsonb)
returns public.bct_contractor_applications
language plpgsql
set search_path to 'public','auth'
as $function$
declare
  v_uid uuid := auth.uid();
  v_email text := coalesce(nullif(auth.jwt()->>'email',''), nullif(btrim(p_payload->>'email'),''));
  v_languages text[];
  v_primary text;
  v_caps text[];
  v_row public.bct_contractor_applications;
  v_ref jsonb;
  v_ref_no integer := 0;
  v_ref_count integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'Application payload required'; end if;
  if exists(select 1 from public.bct_contractor_applications where auth_user_id=v_uid and status <> 'rejected') then
    raise exception 'An active contractor application already exists for this account';
  end if;
  if nullif(btrim(p_payload->>'legal_name'),'') is null then raise exception 'Legal name required'; end if;
  if v_email is null then raise exception 'Email required'; end if;
  v_primary:=public.bct_resolve_service_code(p_payload->>'primary_trade');
  if v_primary is null then raise exception 'Primary trade must be an active BCT service'; end if;
  if v_primary='roofing' then raise exception 'Roofing is not an available BCT contractor trade'; end if;
  if coalesce((p_payload->>'information_certified')::boolean,false) is not true then raise exception 'Information certification required'; end if;
  if coalesce((p_payload->>'references_authorized')::boolean,false) is not true then raise exception 'Reference authorization required'; end if;
  if coalesce((p_payload->>'background_acknowledged')::boolean,false) is not true then raise exception 'Background screening acknowledgment required'; end if;

  if jsonb_typeof(p_payload->'references') <> 'array' then raise exception 'Exactly five professional references are required'; end if;
  if exists(
    select 1 from jsonb_array_elements(p_payload->'references') r(value)
    where (nullif(btrim(r.value->>'name'),'') is null) <> (nullif(btrim(r.value->>'contact'),'') is null)
  ) then raise exception 'Each professional reference must include both a name and contact information'; end if;
  v_ref_count := public.bct_valid_reference_count(p_payload->'references');
  if v_ref_count < 5 then raise exception 'Exactly five complete professional references are required'; end if;
  if v_ref_count > 5 then raise exception 'No more than five professional references may be submitted'; end if;

  select coalesce(array_agg(distinct lower(btrim(x))) filter (where nullif(btrim(x),'') is not null), array['en']::text[])
    into v_languages
  from jsonb_array_elements_text(coalesce(p_payload->'spoken_languages','["en"]'::jsonb)) as t(x);
  if exists(select 1 from unnest(v_languages) x where not exists(select 1 from public.supported_languages l where l.code=x and l.is_active=true)) then
    raise exception 'One or more spoken language codes are unsupported';
  end if;

  if p_payload ? 'trade_capabilities' then
    if jsonb_typeof(p_payload->'trade_capabilities')<>'array' then raise exception 'Trade capabilities must be an array'; end if;
    select coalesce(array_agg(distinct public.bct_resolve_service_code(x)) filter(where public.bct_resolve_service_code(x) is not null),array[]::text[])
      into v_caps from jsonb_array_elements_text(p_payload->'trade_capabilities') t(x);
    if (select count(*) from jsonb_array_elements_text(p_payload->'trade_capabilities')) <> cardinality(v_caps) then
      raise exception 'One or more trade capabilities are unsupported or duplicated';
    end if;
  else
    v_caps:=array[v_primary];
  end if;
  if cardinality(v_caps)=0 then v_caps:=array[v_primary]; end if;
  if not(v_primary=any(v_caps)) then v_caps:=array_append(v_caps,v_primary); end if;

  insert into public.bct_contractor_applications(
    auth_user_id,legal_name,business_name,email,phone,city_state,years_experience,primary_trade,
    crew_size,service_area,reliable_vehicle,other_trades,tools_equipment,recent_employer,
    dates_worked,reason_for_leaving,work_performed,additional_work_history,currently_insured,
    can_provide_coi,information_certified,photo_certified,references_authorized,
    background_acknowledged,spoken_languages,trade_capabilities,government_id_has_back,status
  ) values (
    v_uid,btrim(p_payload->>'legal_name'),nullif(btrim(p_payload->>'business_name'),''),lower(v_email),
    nullif(btrim(p_payload->>'phone'),''),nullif(btrim(p_payload->>'city_state'),''),
    nullif(p_payload->>'years_experience','')::integer,v_primary,
    nullif(p_payload->>'crew_size','')::integer,nullif(btrim(p_payload->>'service_area'),''),
    case when nullif(p_payload->>'reliable_vehicle','') is null then null else (p_payload->>'reliable_vehicle')::boolean end,
    nullif(btrim(p_payload->>'other_trades'),''),nullif(btrim(p_payload->>'tools_equipment'),''),
    nullif(btrim(p_payload->>'recent_employer'),''),nullif(btrim(p_payload->>'dates_worked'),''),
    nullif(btrim(p_payload->>'reason_for_leaving'),''),nullif(btrim(p_payload->>'work_performed'),''),
    nullif(btrim(p_payload->>'additional_work_history'),''),
    case when nullif(p_payload->>'currently_insured','') is null then null else (p_payload->>'currently_insured')::boolean end,
    case when nullif(p_payload->>'can_provide_coi','') is null then null else (p_payload->>'can_provide_coi')::boolean end,
    true,coalesce((p_payload->>'photo_certified')::boolean,false),true,true,v_languages,v_caps,
    coalesce((p_payload->>'government_id_has_back')::boolean,false),'pending_review'
  ) returning * into v_row;

  for v_ref in select value from jsonb_array_elements(p_payload->'references')
  loop
    exit when v_ref_no >= 5;
    if nullif(btrim(v_ref->>'name'),'') is not null and nullif(btrim(v_ref->>'contact'),'') is not null then
      v_ref_no := v_ref_no + 1;
      insert into public.bct_contractor_references(application_id,reference_number,reference_name,reference_contact)
      values(v_row.id,v_ref_no,btrim(v_ref->>'name'),btrim(v_ref->>'contact'));
    end if;
  end loop;
  return v_row;
end;
$function$;

create or replace function public.bct_update_my_contractor_application(p_payload jsonb)
returns public.bct_contractor_applications
language plpgsql
set search_path to 'public','auth'
as $function$
declare
  v_uid uuid:=auth.uid();
  v_old public.bct_contractor_applications;
  v_caps text[];
  v_langs text[];
  v_primary text;
  v_row public.bct_contractor_applications;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select * into v_old from public.bct_contractor_applications where auth_user_id=v_uid order by created_at desc limit 1;
  if v_old.id is null then raise exception 'Contractor application not found'; end if;
  if v_old.status not in ('pending_review','background_check','background_cleared_documents_needed') then raise exception 'Application can no longer be edited'; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'Application payload required'; end if;
  v_primary:=coalesce(public.bct_resolve_service_code(p_payload->>'primary_trade'),v_old.primary_trade);
  if p_payload ? 'spoken_languages' then
    select coalesce(array_agg(distinct lower(btrim(x))) filter(where nullif(btrim(x),'') is not null),array[]::text[])
      into v_langs from jsonb_array_elements_text(p_payload->'spoken_languages') t(x);
    if cardinality(v_langs)=0 or exists(select 1 from unnest(v_langs) x where not exists(select 1 from public.supported_languages l where l.code=x and l.is_active)) then
      raise exception 'Unsupported spoken language selection';
    end if;
  else v_langs:=v_old.spoken_languages; end if;
  if p_payload ? 'trade_capabilities' then
    select coalesce(array_agg(distinct public.bct_resolve_service_code(x)) filter(where public.bct_resolve_service_code(x) is not null),array[]::text[])
      into v_caps from jsonb_array_elements_text(p_payload->'trade_capabilities') t(x);
  else v_caps:=v_old.trade_capabilities; end if;
  if not(v_primary=any(v_caps)) then v_caps:=array_append(v_caps,v_primary); end if;

  update public.bct_contractor_applications set
    legal_name=case when p_payload ? 'legal_name' then btrim(p_payload->>'legal_name') else legal_name end,
    business_name=case when p_payload ? 'business_name' then nullif(btrim(p_payload->>'business_name'),'') else business_name end,
    phone=case when p_payload ? 'phone' then nullif(btrim(p_payload->>'phone'),'') else phone end,
    city_state=case when p_payload ? 'city_state' then nullif(btrim(p_payload->>'city_state'),'') else city_state end,
    years_experience=case when p_payload ? 'years_experience' then nullif(p_payload->>'years_experience','')::integer else years_experience end,
    primary_trade=v_primary, trade_capabilities=v_caps, spoken_languages=v_langs,
    crew_size=case when p_payload ? 'crew_size' then nullif(p_payload->>'crew_size','')::integer else crew_size end,
    service_area=case when p_payload ? 'service_area' then nullif(btrim(p_payload->>'service_area'),'') else service_area end,
    reliable_vehicle=case when p_payload ? 'reliable_vehicle' then (p_payload->>'reliable_vehicle')::boolean else reliable_vehicle end,
    other_trades=case when p_payload ? 'other_trades' then nullif(btrim(p_payload->>'other_trades'),'') else other_trades end,
    tools_equipment=case when p_payload ? 'tools_equipment' then nullif(btrim(p_payload->>'tools_equipment'),'') else tools_equipment end,
    recent_employer=case when p_payload ? 'recent_employer' then nullif(btrim(p_payload->>'recent_employer'),'') else recent_employer end,
    dates_worked=case when p_payload ? 'dates_worked' then nullif(btrim(p_payload->>'dates_worked'),'') else dates_worked end,
    reason_for_leaving=case when p_payload ? 'reason_for_leaving' then nullif(btrim(p_payload->>'reason_for_leaving'),'') else reason_for_leaving end,
    work_performed=case when p_payload ? 'work_performed' then nullif(btrim(p_payload->>'work_performed'),'') else work_performed end,
    additional_work_history=case when p_payload ? 'additional_work_history' then nullif(btrim(p_payload->>'additional_work_history'),'') else additional_work_history end,
    currently_insured=case when p_payload ? 'currently_insured' then (p_payload->>'currently_insured')::boolean else currently_insured end,
    can_provide_coi=case when p_payload ? 'can_provide_coi' then (p_payload->>'can_provide_coi')::boolean else can_provide_coi end,
    government_id_has_back=case when p_payload ? 'government_id_has_back' then coalesce((p_payload->>'government_id_has_back')::boolean,false) else government_id_has_back end,
    updated_at=now()
  where id=v_old.id returning * into v_row;
  if nullif(v_row.legal_name,'') is null then raise exception 'Legal name cannot be blank'; end if;
  return v_row;
end
$function$;
