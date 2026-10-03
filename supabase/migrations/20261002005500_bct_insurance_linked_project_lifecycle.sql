-- BCT Insurance Portal linked-project lifecycle guard.
-- Keeps insurance claim state consistent after BCT Admin links an existing canonical project.
create or replace function public.bct_admin_activate_insurance_construction(p_claim_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_partner_claims;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 select * into c from public.bct_insurance_partner_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if c.project_id is null then raise exception 'Insurance claim must be linked to a canonical BCT project first'; end if;
 if not exists(select 1 from public.bct_projects p where p.id=c.project_id) then raise exception 'Linked BCT project no longer exists'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized') then raise exception 'Claim cannot enter construction from the current status'; end if;
 update public.bct_insurance_partner_claims set status='construction',updated_at=now() where id=c.id;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(c.id,auth.uid(),'status_note','insurance_and_bct','BCT moved the approved claim into construction',
 jsonb_build_object('project_id',c.project_id,'status','construction'));
end $$;
revoke all on function public.bct_admin_activate_insurance_construction(uuid) from public,anon;
grant execute on function public.bct_admin_activate_insurance_construction(uuid) to authenticated;

create or replace function public.bct_admin_complete_insurance_claim(p_claim_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_partner_claims;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 select * into c from public.bct_insurance_partner_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if c.project_id is null then raise exception 'Insurance claim is not linked to a BCT project'; end if;
 if c.status<>'construction' then raise exception 'Only a construction-stage claim can be completed'; end if;
 update public.bct_insurance_partner_claims set status='completed',updated_at=now() where id=c.id;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(c.id,auth.uid(),'status_note','insurance_and_bct','BCT marked the insurance claim work complete',
 jsonb_build_object('project_id',c.project_id,'status','completed'));
end $$;
revoke all on function public.bct_admin_complete_insurance_claim(uuid) from public,anon;
grant execute on function public.bct_admin_complete_insurance_claim(uuid) to authenticated;
