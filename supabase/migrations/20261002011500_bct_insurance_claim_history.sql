-- Insurance-facing event history RPC. RLS helper remains the source of claim authorization.
create or replace function public.bct_insurance_claim_history(p_claim_id uuid)
returns table(id uuid,event_type text,body text,payload jsonb,created_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
 if not public.bct_insurance_can_read_claim(p_claim_id) and not public.is_bct_admin() then
   raise exception 'Insurance claim access denied' using errcode='42501';
 end if;
 return query
 select e.id,e.event_type,e.body,e.payload,e.created_at
 from public.bct_insurance_claim_events e
 where e.claim_id=p_claim_id
   and (public.is_bct_admin() or e.visibility='insurance_and_bct')
 order by e.created_at asc,e.id asc;
end $$;
revoke all on function public.bct_insurance_claim_history(uuid) from public,anon;
grant execute on function public.bct_insurance_claim_history(uuid) to authenticated;
