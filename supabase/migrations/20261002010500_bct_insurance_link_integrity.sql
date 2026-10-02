-- BCT Insurance Portal final authorization/link integrity hardening.
create or replace function public.bct_admin_link_insurance_claim_to_project(p_claim_id uuid,p_project_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_partner_claims;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if p_project_id is null then raise exception 'BCT project is required'; end if;
 select * into c from public.bct_insurance_partner_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if c.project_id is not null then raise exception 'Insurance claim is already linked to a BCT project'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized') then raise exception 'Claim is not eligible for project linking'; end if;
 if not exists(select 1 from public.bct_projects p where p.id=p_project_id) then raise exception 'BCT project not found'; end if;
 if exists(select 1 from public.bct_insurance_partner_claims x where x.project_id=p_project_id and x.id<>c.id) then raise exception 'BCT project is already linked to another insurance claim'; end if;
 update public.bct_insurance_partner_claims set project_id=p_project_id,updated_at=now() where id=c.id;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(c.id,auth.uid(),'status_note','bct_only','BCT Admin linked insurance claim to existing BCT project',jsonb_build_object('project_id',p_project_id));
end $$;

create or replace function public.bct_admin_unlink_insurance_claim_project(p_claim_id uuid,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_partner_claims;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if nullif(btrim(coalesce(p_reason,'')),'') is null then raise exception 'Unlink reason is required'; end if;
 select * into c from public.bct_insurance_partner_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if c.project_id is null then raise exception 'Insurance claim is not linked to a BCT project'; end if;
 if c.status in('construction','completed','closed') then raise exception 'Active or completed construction links cannot be removed through this correction action'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(c.id,auth.uid(),'status_note','bct_only','BCT Admin corrected insurance project link: '||btrim(p_reason),jsonb_build_object('previous_project_id',c.project_id));
 update public.bct_insurance_partner_claims set project_id=null,updated_at=now() where id=c.id;
end $$;
revoke all on function public.bct_admin_unlink_insurance_claim_project(uuid,text) from public,anon;
grant execute on function public.bct_admin_unlink_insurance_claim_project(uuid,text) to authenticated;
