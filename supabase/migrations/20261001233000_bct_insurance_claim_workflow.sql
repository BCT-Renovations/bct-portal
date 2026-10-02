-- BCT Insurance Portal controlled carrier-facing workflow
-- Additive to the foundation; all mutation remains RPC-constrained.

create table if not exists public.bct_insurance_claim_events (
 id uuid primary key default gen_random_uuid(),
 claim_id uuid not null references public.bct_insurance_claims(id) on delete cascade,
 actor_user_id uuid references auth.users(id),
 event_type text not null check(event_type in('message','supplement_submitted','supplement_response','authorization','status_note','document_note')),
 visibility text not null default 'insurance_and_bct' check(visibility in('insurance_and_bct','bct_only')),
 body text,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists bct_insurance_claim_events_claim_idx on public.bct_insurance_claim_events(claim_id,created_at);
alter table public.bct_insurance_claim_events enable row level security;

drop policy if exists "insurance claim event authorized read" on public.bct_insurance_claim_events;
create policy "insurance claim event authorized read" on public.bct_insurance_claim_events
for select to authenticated using (
 public.is_bct_admin() or (
  visibility='insurance_and_bct' and exists(
   select 1 from public.bct_insurance_claims c
   where c.id=claim_id and public.bct_insurance_member_of(c.organization_id)
  )
 )
);

create or replace function public.bct_insurance_add_claim_message(p_claim_id uuid,p_body text)
returns uuid language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims; v_id uuid;
begin
 select * into c from public.bct_insurance_claims where id=p_claim_id;
 if c.id is null or not public.bct_insurance_member_of(c.organization_id) then raise exception 'Claim access denied' using errcode='42501'; end if;
 if nullif(btrim(coalesce(p_body,'')),'') is null then raise exception 'Message is required'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,body)
 values(c.id,auth.uid(),'message',btrim(p_body)) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_add_claim_message(uuid,text) from public,anon;
grant execute on function public.bct_insurance_add_claim_message(uuid,text) to authenticated;

create or replace function public.bct_insurance_submit_supplement(p_claim_id uuid,p_payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims; v_id uuid;
begin
 select * into c from public.bct_insurance_claims where id=p_claim_id for update;
 if c.id is null or not public.bct_insurance_member_of(c.organization_id) then raise exception 'Claim access denied' using errcode='42501'; end if;
 if c.status not in('accepted','estimate_in_progress','carrier_review','supplement','authorized','construction') then raise exception 'Claim is not eligible for a supplement'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,payload)
 values(c.id,auth.uid(),'supplement_submitted',coalesce(p_payload,'{}'::jsonb)) returning id into v_id;
 update public.bct_insurance_claims set status='supplement',updated_at=now() where id=c.id;
 return v_id;
end $$;
revoke all on function public.bct_insurance_submit_supplement(uuid,jsonb) from public,anon;
grant execute on function public.bct_insurance_submit_supplement(uuid,jsonb) to authenticated;

create or replace function public.bct_admin_set_insurance_authorization(p_claim_id uuid,p_authorization jsonb)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 update public.bct_insurance_claims set authorization_data=coalesce(p_authorization,'{}'::jsonb),status='authorized',updated_at=now()
 where id=p_claim_id and status in('accepted','estimate_in_progress','carrier_review','supplement');
 if not found then raise exception 'Claim is not eligible for authorization'; end if;
 insert into public.bct_insurance_claim_events(claim_id,actor_user_id,event_type,payload)
 values(p_claim_id,auth.uid(),'authorization',coalesce(p_authorization,'{}'::jsonb));
end $$;
revoke all on function public.bct_admin_set_insurance_authorization(uuid,jsonb) from public,anon;
grant execute on function public.bct_admin_set_insurance_authorization(uuid,jsonb) to authenticated;

-- Deliberately no project creation/link RPC yet. That integration is added only after the
-- existing project/job contract is inspected and tested, preventing duplicate project systems.
