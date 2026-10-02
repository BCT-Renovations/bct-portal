-- BCT Insurance Portal needs-information response loop.
create or replace function public.bct_insurance_respond_to_information_request(p_claim_id uuid,p_response jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims;
begin
 select * into c from public.bct_insurance_claims where id=p_claim_id for update;
 if c.id is null or not public.bct_insurance_can_read_claim(c.id) then raise exception 'Claim access denied' using errcode='42501'; end if;
 if c.status<>'needs_information' then raise exception 'Claim is not awaiting additional information'; end if;
 if coalesce(p_response,'{}'::jsonb)='{}'::jsonb then raise exception 'Additional information is required'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,payload)
 values(c.id,auth.uid(),'document_note','insurance_and_bct',p_response);
 update public.bct_insurance_claims set status='bct_review',updated_at=now() where id=c.id;
end $$;
revoke all on function public.bct_insurance_respond_to_information_request(uuid,jsonb) from public,anon;
grant execute on function public.bct_insurance_respond_to_information_request(uuid,jsonb) to authenticated;
comment on function public.bct_insurance_respond_to_information_request(uuid,jsonb) is
'Authorized carrier-side response to a BCT needs-information request; returns claim to BCT Review without allowing carrier acceptance or authorization.';
