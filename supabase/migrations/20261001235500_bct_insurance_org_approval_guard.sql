-- BCT Insurance Portal organization approval and mutation hardening.
-- Insurance users may submit only through constrained RPCs; BCT Admin controls carrier activation.

create or replace function public.bct_insurance_org_active(p_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.bct_insurance_organizations o where o.id=p_org and o.status='active');
$$;
revoke all on function public.bct_insurance_org_active(uuid) from public,anon;
grant execute on function public.bct_insurance_org_active(uuid) to authenticated;

create or replace function public.bct_admin_set_insurance_org_status(p_org uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if p_status not in('pending','active','suspended','inactive') then raise exception 'Unsupported insurance organization status'; end if;
 update public.bct_insurance_organizations set status=p_status,updated_at=now() where id=p_org;
 if not found then raise exception 'Insurance organization not found'; end if;
end $$;
revoke all on function public.bct_admin_set_insurance_org_status(uuid,text) from public,anon;
grant execute on function public.bct_admin_set_insurance_org_status(uuid,text) to authenticated;

create or replace function public.bct_insurance_submit_claim(
 p_organization_id uuid,p_claim_number text,p_policyholder_name text,p_property_address jsonb,
 p_loss_type text,p_date_of_loss date,p_carrier_scope jsonb default '{}'::jsonb,
 p_carrier_estimate jsonb default '{}'::jsonb,p_documents jsonb default '[]'::jsonb,p_photos jsonb default '[]'::jsonb
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.bct_insurance_member_of(p_organization_id) then raise exception 'Insurance organization access denied' using errcode='42501'; end if;
 if not public.bct_insurance_org_active(p_organization_id) then raise exception 'Insurance organization is not active' using errcode='42501'; end if;
 if nullif(btrim(coalesce(p_claim_number,'')),'') is null then raise exception 'Claim number is required'; end if;
 if nullif(btrim(coalesce(p_policyholder_name,'')),'') is null then raise exception 'Policyholder name is required'; end if;
 if nullif(btrim(coalesce(p_loss_type,'')),'') is null then raise exception 'Loss type is required'; end if;
 insert into public.bct_insurance_partner_claims(organization_id,submitted_by,assigned_adjuster_user_id,claim_number,policyholder_name,property_address,loss_type,date_of_loss,carrier_scope,carrier_estimate,insurance_documents,insurance_photos,status)
 values(p_organization_id,auth.uid(),auth.uid(),btrim(p_claim_number),btrim(p_policyholder_name),coalesce(p_property_address,'{}'::jsonb),btrim(p_loss_type),p_date_of_loss,coalesce(p_carrier_scope,'{}'::jsonb),coalesce(p_carrier_estimate,'{}'::jsonb),coalesce(p_documents,'[]'::jsonb),coalesce(p_photos,'[]'::jsonb),'bct_review')
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_submit_claim(uuid,text,text,jsonb,text,date,jsonb,jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.bct_insurance_submit_claim(uuid,text,text,jsonb,text,date,jsonb,jsonb,jsonb,jsonb) to authenticated;

-- Explicitly deny browser table mutations. Authorized writes are RPC-only.
revoke insert,update,delete on public.bct_insurance_organizations from authenticated;
revoke insert,update,delete on public.bct_insurance_members from authenticated;
revoke insert,update,delete on public.bct_insurance_partner_claims from authenticated;
revoke insert,update,delete on public.bct_insurance_claim_events from authenticated;
