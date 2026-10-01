-- BCT V46 Estimator/Contractor separation-of-duties enforcement.
-- Additive: extends the existing credential bid boundary; does not replace credential checks.

create or replace function public.bct_guard_estimator_bid_conflict()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare v_user_id uuid;
begin
  select c.auth_user_id into v_user_id
  from public.bct_contractors c
  where c.id=new.contractor_id and c.active;
  if v_user_id is null then raise exception 'Active contractor account required'; end if;
  perform public.bct_assert_no_estimator_project_conflict(new.job_id,v_user_id);
  return new;
end $$;

drop trigger if exists bct_bid_estimator_conflict on public.bct_bids;
create trigger bct_bid_estimator_conflict
before insert or update of contractor_id,job_id on public.bct_bids
for each row execute function public.bct_guard_estimator_bid_conflict();

-- Discovery also hides a project from the estimator who assessed it.
create or replace function public.bct_my_available_jobs_safe()
returns table(id uuid,job_number text,title text,trade text,public_location text,sanitized_scope text,desired_start_date date,bid_deadline timestamptz,status text,published_at timestamptz,required_language text)
language sql stable set search_path=public,auth as $$
 select j.id,j.job_number,j.title,j.trade,j.public_location,j.sanitized_scope,j.desired_start_date,j.bid_deadline,j.status,j.published_at,j.required_language
 from public.bct_jobs j
 where j.status='open_for_bids' and (j.bid_deadline is null or j.bid_deadline>=now())
 and exists(select 1 from public.bct_contractors c where c.auth_user_id=auth.uid() and c.active
   and j.trade=any(c.trade_capabilities) and j.required_language=any(c.spoken_languages)
   and public.bct_contractor_required_credentials_current(c.id,j.trade,j.public_location))
 and not public.bct_estimator_conflict(j.id,auth.uid())
 order by j.published_at desc nulls last,j.created_at desc;
$$;
revoke execute on function public.bct_my_available_jobs_safe() from public;
grant execute on function public.bct_my_available_jobs_safe() to authenticated;

comment on function public.bct_guard_estimator_bid_conflict() is
'Server-side BCT separation guard: the estimator who assessed a project cannot insert or retarget a bid to that same project.';
