-- V46 isolated Handyman operations integration. Uses existing BCT worker, work-package, job, and background-check systems.
alter table public.bct_handyman_applications
 add column if not exists background_check_consent_at timestamptz,
 add column if not exists worker_profile_id uuid,
 add column if not exists background_check_adverse_action_status text not null default 'not_started' check(background_check_adverse_action_status in('not_started','none','review_required','closed'));

alter table public.bct_worker_profiles drop constraint if exists bct_worker_profiles_worker_type_check;
alter table public.bct_worker_profiles add constraint bct_worker_profiles_worker_type_check check(worker_type = any(array['bct_employee','independent_1099','subcontractor_company','subcontractor_crew_member','vendor_supplier','handyman']));

alter table public.bct_background_checks alter column application_id drop not null;
alter table public.bct_background_checks add column if not exists handyman_application_id uuid references public.bct_handyman_applications(id) on delete cascade;
create index if not exists bct_background_checks_handyman_idx on public.bct_background_checks(handyman_application_id);
alter table public.bct_handyman_applications add constraint bct_handyman_applications_worker_profile_fk foreign key(worker_profile_id) references public.bct_worker_profiles(id) on delete set null;

create table if not exists public.bct_handyman_assignment_links(
 id uuid primary key default gen_random_uuid(),
 handyman_application_id uuid not null references public.bct_handyman_applications(id) on delete cascade,
 job_id uuid not null references public.bct_jobs(id) on delete restrict,
 work_package_id uuid references public.bct_work_packages(id) on delete restrict,
 worker_assignment_id uuid not null references public.bct_worker_assignments(id) on delete cascade,
 customer_code text,
 created_at timestamptz not null default now(),
 unique(handyman_application_id,worker_assignment_id)
);
create index if not exists bct_handyman_assignment_links_job_idx on public.bct_handyman_assignment_links(job_id);
alter table public.bct_handyman_assignment_links enable row level security;
revoke all on public.bct_handyman_assignment_links from anon,authenticated;

create or replace function public.bct_admin_handyman_credentials()
returns setof public.bct_handyman_credentials language sql stable security definer set search_path=public,auth as $$
 select c.* from public.bct_handyman_credentials c join public.bct_handyman_applications h on h.id=c.handyman_application_id where public.is_bct_admin() order by c.created_at desc
$$;
revoke execute on function public.bct_admin_handyman_credentials() from public,anon; grant execute on function public.bct_admin_handyman_credentials() to authenticated;

create or replace function public.bct_admin_review_handyman_credential(p_credential_id uuid,p_status text,p_notes text)
returns void language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_status not in('pending','verified','expiring','expired','rejected') then raise exception 'Invalid credential status'; end if;
 update public.bct_handyman_credentials set status=p_status,notes=nullif(trim(coalesce(p_notes,'')),''),verified_at=case when p_status='verified' then now() else verified_at end,verified_by=case when p_status='verified' then auth.uid() else verified_by end,updated_at=now() where id=p_credential_id;
 if not found then raise exception 'Handyman credential not found'; end if;
end $$;
revoke execute on function public.bct_admin_review_handyman_credential(uuid,text,text) from public,anon; grant execute on function public.bct_admin_review_handyman_credential(uuid,text,text) to authenticated;

create or replace function public.bct_admin_create_handyman_assignment(
 p_handyman_application_id uuid,p_job_id uuid,p_work_package_id uuid,p_customer_code text,p_assignment_role text
) returns uuid language plpgsql security definer set search_path=public,auth as $$
declare v_worker uuid; v_assignment uuid;
begin
 if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if not exists(select 1 from public.bct_handyman_applications where id=p_handyman_application_id and approval_status='approved' and background_check_status='clear' and application_status='approved') then raise exception 'Handyman must be BCT approved with a clear background check'; end if;
 select worker_profile_id into v_worker from public.bct_handyman_applications where id=p_handyman_application_id;
 if v_worker is null then
   insert into public.bct_worker_profiles(worker_type,display_name,company_name,active,available_for_assignment)
   select 'handyman',legal_name,nullif(business_name,''),true,true from public.bct_handyman_applications where id=p_handyman_application_id returning id into v_worker;
   update public.bct_handyman_applications set worker_profile_id=v_worker where id=p_handyman_application_id;
 end if;
 insert into public.bct_worker_assignments(project_id,work_package_id,worker_profile_id,assignment_role,status,assigned_by)
 select j.project_id,p_work_package_id,v_worker,coalesce(nullif(trim(p_assignment_role),''),'Handyman'),'assigned',auth.uid() from public.bct_jobs j where j.id=p_job_id returning id into v_assignment;
 if v_assignment is null then raise exception 'BCT job not found'; end if;
 insert into public.bct_handyman_assignment_links(handyman_application_id,job_id,work_package_id,worker_assignment_id,customer_code)
 values(p_handyman_application_id,p_job_id,p_work_package_id,v_assignment,nullif(trim(p_customer_code),''));
 return v_assignment;
end $$;
revoke execute on function public.bct_admin_create_handyman_assignment(uuid,uuid,uuid,text,text) from public,anon; grant execute on function public.bct_admin_create_handyman_assignment(uuid,uuid,uuid,text,text) to authenticated;

create or replace function public.bct_handyman_assignments_for_app(p_application_code text,p_email text)
returns table(id uuid,job_id uuid,job_number text,job_title text,trade text,assignment_status text,customer_code text,assigned_at timestamptz)
language sql stable security definer set search_path=public,auth as $$
 select l.worker_assignment_id,j.id,j.job_number,j.title,j.trade,wa.status,l.customer_code,wa.assigned_at
 from public.bct_handyman_assignment_links l
 join public.bct_handyman_applications h on h.id=l.handyman_application_id
 join public.bct_jobs j on j.id=l.job_id
 join public.bct_worker_assignments wa on wa.id=l.worker_assignment_id
 where upper(h.application_code)=upper(trim(p_application_code)) and lower(h.email)=lower(trim(p_email)) and h.approval_status='approved'
 order by wa.assigned_at desc
$$;
revoke execute on function public.bct_handyman_assignments_for_app(text,text) from public,authenticated; grant execute on function public.bct_handyman_assignments_for_app(text,text) to anon;