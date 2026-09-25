-- Scheduled is a valid operational state after award and before active work.
create or replace function public.bct_guard_job_status_transition()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if new.status is not distinct from old.status then return new; end if;
  if current_user in ('postgres','service_role','supabase_admin') then return new; end if;
  if coalesce(auth.jwt()->'app_metadata'->>'role','')<>'admin' then
    raise exception 'Only BCT admin may change job status';
  end if;
  if not (
    (old.status='draft' and new.status in ('open_for_bids','on_hold','closed')) or
    (old.status='open_for_bids' and new.status in ('bid_review','awarded','on_hold','closed')) or
    (old.status='bid_review' and new.status in ('open_for_bids','awarded','on_hold','closed')) or
    (old.status='awarded' and new.status in ('scheduled','in_progress','on_hold','closed')) or
    (old.status='scheduled' and new.status in ('in_progress','on_hold','closed')) or
    (old.status='in_progress' and new.status in ('completed','on_hold')) or
    (old.status='completed' and new.status in ('in_progress','closed')) or
    (old.status='on_hold' and new.status in ('open_for_bids','bid_review','awarded','scheduled','in_progress','closed'))
  ) then
    raise exception 'Invalid job status transition: % to %',old.status,new.status;
  end if;
  return new;
end;
$$;
