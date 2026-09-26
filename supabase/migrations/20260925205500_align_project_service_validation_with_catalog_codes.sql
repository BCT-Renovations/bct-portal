create or replace function public.bct_block_disallowed_services()
returns trigger language plpgsql set search_path=public as $$
begin
 if exists (select 1 from unnest(coalesce(new.services,array[]::text[])) s where not exists (select 1 from public.bct_service_catalog c where c.is_active and (lower(c.code)=lower(trim(s)) or lower(c.display_name)=lower(trim(s))))) then raise exception 'Project contains an unsupported BCT service'; end if;
 return new;
end $$;
