-- BCT Insurance Portal private internal claim notes.
create or replace function public.bct_admin_add_insurance_internal_note(p_claim_id uuid,p_body text,p_payload jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if not exists(select 1 from public.bct_insurance_partner_claims where id=p_claim_id) then raise exception 'Insurance claim not found'; end if;
 if nullif(btrim(coalesce(p_body,'')),'') is null then raise exception 'Internal note is required'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,visibility,body,payload)
 values(p_claim_id,auth.uid(),'status_note','bct_only',btrim(p_body),coalesce(p_payload,'{}'::jsonb))
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.bct_admin_add_insurance_internal_note(uuid,text,jsonb) from public,anon;
grant execute on function public.bct_admin_add_insurance_internal_note(uuid,text,jsonb) to authenticated;

drop policy if exists bct_insurance_claim_events_read on public.bct_insurance_claim_events;
create policy bct_insurance_claim_events_read on public.bct_insurance_claim_events
for select to authenticated using (
 public.is_bct_admin()
 or (
   visibility='insurance_and_bct'
   and public.bct_insurance_can_read_claim(claim_id)
 )
);
comment on policy bct_insurance_claim_events_read on public.bct_insurance_claim_events is
'BCT Admin sees all claim events. Insurance users see only insurance_and_bct events for claims they are authorized to access; bct_only events never cross the carrier boundary.';
