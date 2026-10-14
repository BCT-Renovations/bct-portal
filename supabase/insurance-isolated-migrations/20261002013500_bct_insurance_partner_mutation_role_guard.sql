-- TAKAI insurance staging only. Never apply to production without separate approval.
-- Final partner mutation authorization. Read permission alone does not grant write permission.
create or replace function public.bct_insurance_can_write_claim(p_claim uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(
  select 1 from public.bct_partner_claims c
  join public.bct_insurance_organizations o on o.id=c.organization_id and o.status='active'
  join public.bct_insurance_members m on m.organization_id=c.organization_id
    and m.user_id=auth.uid() and m.status='active'
    and m.member_role in ('organization_admin','adjuster','claims_representative')
  where c.id=p_claim and (
    m.member_role='organization_admin'
    or c.assigned_adjuster_user_id=auth.uid()
    or c.submitted_by=auth.uid()
  )
 );
$$;
revoke all on function public.bct_insurance_can_write_claim(uuid) from public,anon;
grant execute on function public.bct_insurance_can_write_claim(uuid) to authenticated;

create or replace function public.bct_insurance_add_claim_message(p_claim_id uuid,p_body text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.bct_insurance_can_write_claim(p_claim_id) then raise exception 'Claim write access denied' using errcode='42501'; end if;
 if nullif(btrim(coalesce(p_body,'')),'') is null then raise exception 'Message is required'; end if;
 insert into public.bct_partner_claim_events(claim_id,actor_user_id,event_type,visibility,body)
 values(p_claim_id,auth.uid(),'message','insurance_and_bct',btrim(p_body)) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_add_claim_message(uuid,text) from public,anon;
grant execute on function public.bct_insurance_add_claim_message(uuid,text) to authenticated;

create or replace function public.bct_insurance_respond_to_information_request(p_claim_id uuid,p_response jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_partner_claims;
begin
 select * into c from public.bct_partner_claims where id=p_claim_id for update;
 if c.id is null or not public.bct_insurance_can_write_claim(c.id) then raise exception 'Claim write access denied' using errcode='42501'; end if;
 if c.status<>'needs_information' then raise exception 'Claim is not awaiting additional information'; end if;
 if coalesce(p_response,'{}'::jsonb)='{}'::jsonb then raise exception 'Additional information is required'; end if;
 insert into public.bct_partner_claim_events(claim_id,actor_user_id,event_type,visibility,payload)
 values(c.id,auth.uid(),'document_note','insurance_and_bct',p_response);
 update public.bct_partner_claims set status='bct_review',updated_at=now() where id=c.id;
end $$;
revoke all on function public.bct_insurance_respond_to_information_request(uuid,jsonb) from public,anon;
grant execute on function public.bct_insurance_respond_to_information_request(uuid,jsonb) to authenticated;

create or replace function public.bct_insurance_submit_supplement(p_claim_id uuid,p_payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare c public.bct_partner_claims; v_id uuid;
begin
 select * into c from public.bct_partner_claims where id=p_claim_id for update;
 if c.id is null or not public.bct_insurance_can_write_claim(c.id) then raise exception 'Claim write access denied' using errcode='42501'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized','construction') then raise exception 'Supplement is not allowed in the current claim state'; end if;
 if coalesce(p_payload,'{}'::jsonb)='{}'::jsonb then raise exception 'Supplement information is required'; end if;
 insert into public.bct_partner_claim_events(claim_id,actor_user_id,event_type,visibility,payload)
 values(c.id,auth.uid(),'supplement_submitted','insurance_and_bct',p_payload) returning id into v_id;
 -- Do not roll an active construction claim back to supplement.
 update public.bct_partner_claims set supplement_data=p_payload,
 status=case when status='construction' then status else 'supplement' end,updated_at=now() where id=c.id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_submit_supplement(uuid,jsonb) from public,anon;
grant execute on function public.bct_insurance_submit_supplement(uuid,jsonb) to authenticated;
