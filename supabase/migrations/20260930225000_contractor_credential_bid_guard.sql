-- BCT V46: enforce credentials at the bid boundary as well as job discovery.
-- Jurisdiction uses the job's public_location until a canonical jurisdiction field is introduced.

create or replace function public.bct_guard_bid_credential_eligibility()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare v_trade text; v_jurisdiction text;
begin
 if current_user in ('postgres','service_role','supabase_admin') or public.is_bct_admin() then return new; end if;
 if auth.uid() is null or not exists(select 1 from public.bct_contractors c where c.id=new.contractor_id and c.auth_user_id=auth.uid() and c.active) then
   raise exception 'Active contractor account required';
 end if;
 select j.trade,j.public_location into v_trade,v_jurisdiction from public.bct_jobs j where j.id=new.job_id and j.status='open_for_bids' and (j.bid_deadline is null or j.bid_deadline>=now());
 if v_trade is null then raise exception 'Job is not available for bidding'; end if;
 if not public.bct_contractor_required_credentials_current(new.contractor_id,v_trade,v_jurisdiction) then
   raise exception 'Bidding paused: required BCT-verified contractor credentials are missing, expired, or not valid for this trade/jurisdiction';
 end if;
 return new;
end $$;

drop trigger if exists bct_bid_credential_eligibility on public.bct_bids;
create trigger bct_bid_credential_eligibility before insert on public.bct_bids
for each row execute function public.bct_guard_bid_credential_eligibility();

-- Replace safe discovery with credential-qualified discovery.
create or replace function public.bct_my_available_jobs_safe()
returns table(id uuid,job_number text,title text,trade text,public_location text,sanitized_scope text,desired_start_date date,bid_deadline timestamptz,status text,published_at timestamptz,required_language text)
language sql stable set search_path=public,auth as $$
 select j.id,j.job_number,j.title,j.trade,j.public_location,j.sanitized_scope,j.desired_start_date,j.bid_deadline,j.status,j.published_at,j.required_language
 from public.bct_jobs j
 where j.status='open_for_bids' and (j.bid_deadline is null or j.bid_deadline>=now())
 and exists(select 1 from public.bct_contractors c where c.auth_user_id=auth.uid() and c.active
   and j.trade=any(c.trade_capabilities) and j.required_language=any(c.spoken_languages)
   and public.bct_contractor_required_credentials_current(c.id,j.trade,j.public_location))
 order by j.published_at desc nulls last,j.created_at desc;
$$;
revoke execute on function public.bct_my_available_jobs_safe() from public;
grant execute on function public.bct_my_available_jobs_safe() to authenticated;
