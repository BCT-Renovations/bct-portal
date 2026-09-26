-- Phase 1 commercial/property-management foundation.
alter table public.bct_projects add column if not exists project_market text not null default 'residential';
alter table public.bct_projects add column if not exists property_name text;
alter table public.bct_projects add column if not exists building_number text;
alter table public.bct_projects add column if not exists unit_number text;
alter table public.bct_projects add column if not exists occupancy_status text;
alter table public.bct_projects add column if not exists resident_name text;
alter table public.bct_projects add column if not exists resident_phone text;
alter table public.bct_projects add column if not exists access_instructions text;
alter table public.bct_projects drop constraint if exists bct_projects_market_ck;
alter table public.bct_projects add constraint bct_projects_market_ck check(project_market in('residential','commercial','multifamily')) not valid;
alter table public.bct_projects validate constraint bct_projects_market_ck;
alter table public.bct_projects drop constraint if exists bct_projects_occupancy_ck;
alter table public.bct_projects add constraint bct_projects_occupancy_ck check(occupancy_status is null or occupancy_status in('vacant','occupied')) not valid;
alter table public.bct_projects validate constraint bct_projects_occupancy_ck;
create table if not exists public.bct_property_accounts(id uuid primary key default gen_random_uuid(),account_name text not null,auth_user_id uuid not null references auth.users(id) on delete cascade,account_type text not null default 'property_manager',phone text,email text,active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.bct_managed_properties(id uuid primary key default gen_random_uuid(),property_account_id uuid not null references public.bct_property_accounts(id) on delete cascade,property_name text not null,street_address text not null,city text not null,state text not null,zip_code text,active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.bct_projects add column if not exists managed_property_id uuid references public.bct_managed_properties(id);
alter table public.bct_property_accounts enable row level security;
alter table public.bct_managed_properties enable row level security;
drop policy if exists "Property accounts owner or admin read" on public.bct_property_accounts;
create policy "Property accounts owner or admin read" on public.bct_property_accounts for select to authenticated using(auth_user_id=auth.uid() or public.is_bct_admin());
drop policy if exists "Property accounts owner insert" on public.bct_property_accounts;
create policy "Property accounts owner insert" on public.bct_property_accounts for insert to authenticated with check(auth_user_id=auth.uid() or public.is_bct_admin());
drop policy if exists "Property accounts owner or admin update" on public.bct_property_accounts;
create policy "Property accounts owner or admin update" on public.bct_property_accounts for update to authenticated using(auth_user_id=auth.uid() or public.is_bct_admin()) with check(auth_user_id=auth.uid() or public.is_bct_admin());
drop policy if exists "Managed properties owner or admin read" on public.bct_managed_properties;
create policy "Managed properties owner or admin read" on public.bct_managed_properties for select to authenticated using(public.is_bct_admin() or exists(select 1 from public.bct_property_accounts a where a.id=property_account_id and a.auth_user_id=auth.uid()));
drop policy if exists "Managed properties owner or admin insert" on public.bct_managed_properties;
create policy "Managed properties owner or admin insert" on public.bct_managed_properties for insert to authenticated with check(public.is_bct_admin() or exists(select 1 from public.bct_property_accounts a where a.id=property_account_id and a.auth_user_id=auth.uid()));
drop policy if exists "Managed properties owner or admin update" on public.bct_managed_properties;
create policy "Managed properties owner or admin update" on public.bct_managed_properties for update to authenticated using(public.is_bct_admin() or exists(select 1 from public.bct_property_accounts a where a.id=property_account_id and a.auth_user_id=auth.uid())) with check(public.is_bct_admin() or exists(select 1 from public.bct_property_accounts a where a.id=property_account_id and a.auth_user_id=auth.uid()));
create or replace function public.bct_validate_project_resident_privacy() returns trigger language plpgsql security invoker set search_path=public,auth as $$
begin
 if new.project_market='multifamily' then
   if nullif(btrim(coalesce(new.property_name,'')),'') is null then raise exception 'Property/complex name is required';end if;
   if nullif(btrim(coalesce(new.building_number,'')),'') is null then raise exception 'Building number is required';end if;
   if nullif(btrim(coalesce(new.unit_number,'')),'') is null then raise exception 'Unit number is required';end if;
   if new.occupancy_status not in('vacant','occupied') then raise exception 'Vacant or occupied status is required';end if;
   if new.occupancy_status='occupied' and (nullif(btrim(coalesce(new.resident_name,'')),'') is null or nullif(btrim(coalesce(new.resident_phone,'')),'') is null) then raise exception 'Resident name and phone are required for occupied units';end if;
 end if; return new;
end $$;
drop trigger if exists bct_project_resident_privacy_guard on public.bct_projects;
create trigger bct_project_resident_privacy_guard before insert or update on public.bct_projects for each row execute function public.bct_validate_project_resident_privacy();
revoke all on function public.bct_validate_project_resident_privacy() from public,anon;
grant execute on function public.bct_validate_project_resident_privacy() to authenticated;
