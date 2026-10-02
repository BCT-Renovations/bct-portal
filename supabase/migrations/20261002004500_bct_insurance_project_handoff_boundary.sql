-- BCT Insurance Portal project-handoff boundary and audit trail.
-- This does NOT create a project. It records BCT Admin intent and blocks unsafe/duplicate linking.
create or replace function public.bct_admin_prepare_insurance_project_handoff(p_claim_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims; v_event uuid;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 select * into c from public.bct_insurance_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if c.project_id is not null then raise exception 'Insurance claim is already linked to a BCT project'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized') then
   raise exception 'Claim is not eligible for project handoff';
 end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(c.id,auth.uid(),'status_note','bct_only','BCT Admin prepared claim for existing-project-system handoff',
        jsonb_build_object('handoff_state','prepared','claim_status',c.status))
 returning id into v_event;
 return v_event;
end $$;
revoke all on function public.bct_admin_prepare_insurance_project_handoff(uuid) from public,anon;
grant execute on function public.bct_admin_prepare_insurance_project_handoff(uuid) to authenticated;

create or replace function public.bct_admin_link_insurance_claim_to_project(p_claim_id uuid,p_project_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if p_project_id is null then raise exception 'BCT project is required'; end if;
 select * into c from public.bct_insurance_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if c.project_id is not null then raise exception 'Insurance claim is already linked to a BCT project'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized') then raise exception 'Claim is not eligible for project linking'; end if;
 if not exists(select 1 from public.bct_projects p where p.id=p_project_id) then raise exception 'BCT project not found'; end if;
 if exists(select 1 from public.bct_insurance_claims x where x.project_id=p_project_id and x.id<>c.id) then raise exception 'BCT project is already linked to another insurance claim'; end if;
 update public.bct_insurance_claims set project_id=p_project_id,updated_at=now() where id=c.id;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(c.id,auth.uid(),'status_note','bct_only','BCT Admin linked insurance claim to existing BCT project',
        jsonb_build_object('project_id',p_project_id));
end $$;
revoke all on function public.bct_admin_link_insurance_claim_to_project(uuid,uuid) from public,anon;
grant execute on function public.bct_admin_link_insurance_claim_to_project(uuid,uuid) to authenticated;

create unique index if not exists bct_insurance_claims_project_unique
on public.bct_insurance_claims(project_id) where project_id is not null;

comment on function public.bct_admin_link_insurance_claim_to_project(uuid,uuid) is
'Links a reviewed insurance claim to an already-created canonical BCT project. It never creates a project and therefore cannot bypass BCT project numbering or the canonical project creation workflow.';
