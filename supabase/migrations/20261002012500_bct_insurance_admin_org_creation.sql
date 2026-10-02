-- BCT Admin controlled insurance organization creation.
create or replace function public.bct_admin_create_insurance_organization(p_legal_name text,p_carrier_code text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if nullif(btrim(coalesce(p_legal_name,'')),'') is null then raise exception 'Insurance organization legal name is required'; end if;
 insert into public.bct_insurance_organizations(legal_name,carrier_code,status)
 values(btrim(p_legal_name),nullif(btrim(coalesce(p_carrier_code,'')),''),'pending') returning id into v_id;
 return v_id;
end $$;
revoke all on function public.bct_admin_create_insurance_organization(text,text) from public,anon;
grant execute on function public.bct_admin_create_insurance_organization(text,text) to authenticated;
