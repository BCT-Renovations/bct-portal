-- BCT V46 claims + Agent foundation
-- Additive only. Not applied to Supabase by this change.
-- Insurance/claim records stay separate from bct_projects until BCT Admin explicitly links a claim to a project.

create table if not exists public.bct_insurance_partner_claims (
  id uuid primary key default gen_random_uuid(),
  claim_number text not null unique,
  submitted_by uuid not null default auth.uid(),
  claimant_name text,
  claimant_email text,
  claimant_phone text,
  property_address text,
  city text,
  state text,
  postal_code text,
  loss_date date,
  loss_type text,
  loss_description text not null,
  emergency_conditions text,
  photos jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  preferred_language text not null default 'en',
  status text not null default 'submitted',
  linked_project_id uuid references public.bct_projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bct_ins_claim_status_ck check(status in ('submitted','bct_review','agent_review','admin_approved','referred','closed')),
  constraint bct_ins_claim_language_ck check(preferred_language in ('en','es','fr','ht','pt','vi','zh','ar','ru'))
);
create unique index if not exists bct_insurance_partner_claims_project_unique
  on public.bct_insurance_partner_claims(linked_project_id)
  where linked_project_id is not null;

create table if not exists public.bct_insurance_claim_events (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.bct_insurance_partner_claims(id) on delete cascade,
  event_type text not null,
  visibility text not null default 'bct_only',
  language_code text not null default 'en',
  source_text text,
  translated_text text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  constraint bct_ins_claim_event_visibility_ck check(visibility in ('bct_only','partner','claimant')),
  constraint bct_ins_claim_event_language_ck check(language_code in ('en','es','fr','ht','pt','vi','zh','ar','ru'))
);

create table if not exists public.bct_insurance_claim_agent_drafts (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.bct_insurance_partner_claims(id) on delete cascade,
  draft_type text not null,
  language_code text not null default 'en',
  source_summary text,
  recommended_next_steps jsonb not null default '[]'::jsonb,
  draft_body text,
  risk_flags jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_by uuid default auth.uid(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint bct_ins_agent_draft_type_ck check(draft_type in ('claim_summary','missing_documents','customer_message','partner_message','next_steps','escalation')),
  constraint bct_ins_agent_draft_status_ck check(status in ('draft','approved','rejected')),
  constraint bct_ins_agent_language_ck check(language_code in ('en','es','fr','ht','pt','vi','zh','ar','ru'))
);

create or replace function public.bct_insurance_can_read_claim(p_claim_id uuid)
returns boolean language sql stable security definer set search_path=public,auth as $$
  select public.is_bct_admin()
     or exists(
       select 1 from public.bct_insurance_partner_claims c
       where c.id=p_claim_id and c.submitted_by=auth.uid()
     );
$$;
revoke all on function public.bct_insurance_can_read_claim(uuid) from public,anon;
grant execute on function public.bct_insurance_can_read_claim(uuid) to authenticated;

alter table public.bct_insurance_partner_claims enable row level security;
alter table public.bct_insurance_claim_events enable row level security;
alter table public.bct_insurance_claim_agent_drafts enable row level security;
revoke all on public.bct_insurance_partner_claims from anon,authenticated;
revoke all on public.bct_insurance_claim_events from anon,authenticated;
revoke all on public.bct_insurance_claim_agent_drafts from anon,authenticated;

create or replace function public.bct_insurance_submit_claim(
  p_claim_number text,
  p_claimant_name text,
  p_claimant_email text,
  p_claimant_phone text,
  p_property_address text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_loss_date date,
  p_loss_type text,
  p_loss_description text,
  p_emergency_conditions text default null,
  p_preferred_language text default 'en'
) returns uuid
language plpgsql security invoker set search_path=public,auth as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if nullif(btrim(coalesce(p_claim_number,'')),'') is null then raise exception 'Claim number required'; end if;
  if nullif(btrim(coalesce(p_loss_description,'')),'') is null then raise exception 'Loss description required'; end if;
  if p_preferred_language not in ('en','es','fr','ht','pt','vi','zh','ar','ru') then p_preferred_language:='en'; end if;
  insert into public.bct_insurance_partner_claims(
    claim_number,submitted_by,claimant_name,claimant_email,claimant_phone,
    property_address,city,state,postal_code,loss_date,loss_type,loss_description,
    emergency_conditions,preferred_language,status
  ) values(
    btrim(p_claim_number),auth.uid(),nullif(btrim(p_claimant_name),''),nullif(btrim(p_claimant_email),''),
    nullif(btrim(p_claimant_phone),''),nullif(btrim(p_property_address),''),nullif(btrim(p_city),''),
    nullif(btrim(p_state),''),nullif(btrim(p_postal_code),''),p_loss_date,nullif(btrim(p_loss_type),''),
    btrim(p_loss_description),nullif(btrim(p_emergency_conditions),''),p_preferred_language,'submitted'
  ) returning id into v_id;
  insert into public.bct_insurance_claim_events(claim_id,event_type,visibility,language_code,source_text)
  values(v_id,'claim_submitted','bct_only',p_preferred_language,'Insurance claim submitted to BCT for review.');
  return v_id;
end $$;
revoke all on function public.bct_insurance_submit_claim(text,text,text,text,text,text,text,text,date,text,text,text,text) from public,anon;
grant execute on function public.bct_insurance_submit_claim(text,text,text,text,text,text,text,text,date,text,text,text,text) to authenticated;

create or replace function public.bct_admin_insurance_claim_board()
returns table(
  id uuid,claim_number text,claimant_name text,claimant_email text,property_address text,
  loss_date date,loss_type text,status text,preferred_language text,linked_project_id uuid,
  created_at timestamptz,agent_draft_count bigint,attention text
)
language sql stable security definer set search_path=public,auth as $$
  select c.id,c.claim_number,c.claimant_name,c.claimant_email,c.property_address,
         c.loss_date,c.loss_type,c.status,c.preferred_language,c.linked_project_id,c.created_at,
         (select count(*) from public.bct_insurance_claim_agent_drafts d where d.claim_id=c.id) as agent_draft_count,
         case when c.status in ('submitted','bct_review','agent_review') then 'needs_review' else 'normal' end
  from public.bct_insurance_partner_claims c
  where public.is_bct_admin()
  order by case when c.status in ('submitted','bct_review','agent_review') then 0 else 1 end,c.created_at desc;
$$;
revoke all on function public.bct_admin_insurance_claim_board() from public,anon;
grant execute on function public.bct_admin_insurance_claim_board() to authenticated;

create or replace function public.bct_admin_create_claim_agent_draft(
  p_claim_id uuid,p_draft_type text,p_language_code text,p_source_summary text,
  p_recommended_next_steps jsonb,p_draft_body text,p_risk_flags jsonb default '[]'::jsonb
) returns uuid
language plpgsql security definer set search_path=public,auth as $$
declare v_id uuid;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
  if not exists(select 1 from public.bct_insurance_partner_claims where id=p_claim_id) then raise exception 'Claim not found'; end if;
  if p_draft_type not in ('claim_summary','missing_documents','customer_message','partner_message','next_steps','escalation') then raise exception 'Invalid draft type'; end if;
  if p_language_code not in ('en','es','fr','ht','pt','vi','zh','ar','ru') then p_language_code:='en'; end if;
  insert into public.bct_insurance_claim_agent_drafts(
    claim_id,draft_type,language_code,source_summary,recommended_next_steps,draft_body,risk_flags,status,created_by
  ) values(p_claim_id,p_draft_type,p_language_code,p_source_summary,coalesce(p_recommended_next_steps,'[]'::jsonb),
           p_draft_body,coalesce(p_risk_flags,'[]'::jsonb),'draft',auth.uid())
  returning id into v_id;
  insert into public.bct_insurance_claim_events(claim_id,event_type,visibility,language_code,source_text)
  values(p_claim_id,'agent_draft_created','bct_only',p_language_code,'BCT Agent created a draft for Admin review. No message or claim filing was authorized.');
  return v_id;
end $$;
revoke all on function public.bct_admin_create_claim_agent_draft(uuid,text,text,text,jsonb,text,jsonb) from public,anon;
grant execute on function public.bct_admin_create_claim_agent_draft(uuid,text,text,text,jsonb,text,jsonb) to authenticated;

create or replace function public.bct_admin_review_claim_agent_draft(
  p_draft_id uuid,p_status text,p_review_note text default null
) returns void
language plpgsql security definer set search_path=public,auth as $$
declare v_claim uuid; v_lang text;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
  if p_status not in ('approved','rejected','draft') then raise exception 'Invalid draft status'; end if;
  update public.bct_insurance_claim_agent_drafts
  set status=p_status,reviewed_by=case when p_status='draft' then null else auth.uid() end,
      reviewed_at=case when p_status='draft' then null else now() end
  where id=p_draft_id
  returning claim_id,language_code into v_claim,v_lang;
  if not found then raise exception 'Agent draft not found'; end if;
  if p_review_note is not null then
    insert into public.bct_insurance_claim_events(claim_id,event_type,visibility,language_code,source_text)
    values(v_claim,'agent_draft_review','bct_only',coalesce(v_lang,'en'),p_review_note);
  end if;
end $$;
revoke all on function public.bct_admin_review_claim_agent_draft(uuid,text,text) from public,anon;
grant execute on function public.bct_admin_review_claim_agent_draft(uuid,text,text) to authenticated;
