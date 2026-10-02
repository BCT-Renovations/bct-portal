-- BCT Insurance Portal per-claim mutation authorization hardening.
create or replace function public.bct_insurance_add_claim_message(p_claim_id uuid,p_body text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.bct_insurance_can_read_claim(p_claim_id) then raise exception 'Claim access denied' using errcode='42501'; end if;
 if nullif(btrim(coalesce(p_body,'')),'') is null then raise exception 'Message is required'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body)
 values(p_claim_id,auth.uid(),'message','insurance_and_bct',btrim(p_body)) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_add_claim_message(uuid,text) from public,anon;
grant execute on function public.bct_insurance_add_claim_message(uuid,text) to authenticated;

create or replace function public.bct_insurance_submit_supplement(p_claim_id uuid,p_payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims; v_id uuid;
begin
 select * into c from public.bct_insurance_claims where id=p_claim_id for update;
 if c.id is null or not public.bct_insurance_can_read_claim(c.id) then raise exception 'Claim access denied' using errcode='42501'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized','construction') then raise exception 'Supplement is not allowed in the current claim state'; end if;
 if coalesce(p_payload,'{}'::jsonb)='{}'::jsonb then raise exception 'Supplement information is required'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,payload)
 values(c.id,auth.uid(),'supplement_submitted','insurance_and_bct',p_payload) returning id into v_id;
 update public.bct_insurance_claims set supplement_data=p_payload,status='supplement',updated_at=now() where id=c.id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_submit_supplement(uuid,jsonb) from public,anon;
grant execute on function public.bct_insurance_submit_supplement(uuid,jsonb) to authenticated;
