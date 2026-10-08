-- BCT V46 isolated Handyman Portal foundation. Additive only; do not apply to production from this branch.
create table if not exists public.bct_handyman_applications (
 id uuid primary key default gen_random_uuid(),
 application_code text not null unique default ('H-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
 legal_name text not null,
 business_name text,
 phone text not null,
 email text not null,
 city text not null,
 state text not null,
 years_experience integer not null check (years_experience>=0),
 service_area text not null,
 services text not null,
 background_check_authorized boolean not null default false,
 background_check_status text not null default 'pending' check (background_check_status in ('pending','scheduled','clear','consider','failed')),
 background_check_provider text,
 background_check_reference text,
 approval_status text not null default 'pending_bct_review' check (approval_status in ('pending_bct_review','approved','rejected','suspended')),
 application_status text not null default 'pending_bct_review' check (application_status in ('pending_bct_review','background_check_pending','bct_review','approved','rejected','suspended')),
 terms_agreed boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists bct_handyman_applications_email_idx on public.bct_handyman_applications(lower(email));
create index if not exists bct_handyman_applications_status_idx on public.bct_handyman_applications(application_status,background_check_status,approval_status);
alter table public.bct_handyman_applications enable row level security;
revoke all on public.bct_handyman_applications from anon,authenticated;

create or replace function public.bct_submit_handyman_application(
 p_legal_name text,p_business_name text,p_phone text,p_email text,p_city text,p_state text,
 p_years_experience integer,p_service_area text,p_services text,p_background_check_authorized boolean,p_terms_agreed boolean
) returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare v_id uuid; v_code text;
begin
 if not coalesce(p_background_check_authorized,false) then raise exception 'Background check authorization is required'; end if;
 if not coalesce(p_terms_agreed,false) then raise exception 'BCT Handyman Terms must be accepted'; end if;
 insert into public.bct_handyman_applications(legal_name,business_name,phone,email,city,state,years_experience,service_area,services,background_check_authorized,terms_agreed)
 values(trim(p_legal_name),nullif(trim(p_business_name),''),trim(p_phone),lower(trim(p_email)),trim(p_city),upper(trim(p_state)),p_years_experience,trim(p_service_area),trim(p_services),true,true)
 returning id,application_code into v_id,v_code;
 return jsonb_build_object('id',v_id,'application_id',v_code,'application_status','pending_bct_review','background_check_status','pending');
end $$;
revoke execute on function public.bct_submit_handyman_application(text,text,text,text,text,text,integer,text,text,boolean,boolean) from public,authenticated;
grant execute on function public.bct_submit_handyman_application(text,text,text,text,text,text,integer,text,text,boolean,boolean) to anon;

create or replace function public.bct_handyman_application_status(p_application_id text,p_email text)
returns table(application_id text,legal_name text,application_status text,background_check_status text,approval_status text)
language sql stable security definer set search_path=public,auth as $$
 select h.application_code,h.legal_name,h.application_status,h.background_check_status,h.approval_status
 from public.bct_handyman_applications h
 where upper(h.application_code)=upper(trim(p_application_id)) and lower(h.email)=lower(trim(p_email));
$$;
revoke execute on function public.bct_handyman_application_status(text,text) from public,authenticated;
grant execute on function public.bct_handyman_application_status(text,text) to anon;

create or replace function public.bct_admin_handyman_applications()
returns setof public.bct_handyman_applications
language sql stable security definer set search_path=public,auth as $$
 select h.* from public.bct_handyman_applications h where public.is_bct_admin() order by h.created_at desc;
$$;
revoke execute on function public.bct_admin_handyman_applications() from public,anon;
grant execute on function public.bct_admin_handyman_applications() to authenticated;

create or replace function public.bct_admin_review_handyman_application(p_application_id uuid,p_application_status text,p_background_check_status text,p_approval_status text)
returns void language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_application_status not in ('pending_bct_review','background_check_pending','bct_review','approved','rejected','suspended') then raise exception 'Invalid application status'; end if;
 if p_background_check_status not in ('pending','scheduled','clear','consider','failed') then raise exception 'Invalid background check status'; end if;
 if p_approval_status not in ('pending_bct_review','approved','rejected','suspended') then raise exception 'Invalid approval status'; end if;
 if p_approval_status='approved' and p_background_check_status<>'clear' then raise exception 'Handyman cannot be approved until the background check is clear'; end if;
 update public.bct_handyman_applications set application_status=p_application_status,background_check_status=p_background_check_status,approval_status=p_approval_status,updated_at=now() where id=p_application_id;
 if not found then raise exception 'Handyman application not found'; end if;
end $$;
revoke execute on function public.bct_admin_review_handyman_application(uuid,text,text,text) from public,anon;
grant execute on function public.bct_admin_review_handyman_application(uuid,text,text,text) to authenticated;