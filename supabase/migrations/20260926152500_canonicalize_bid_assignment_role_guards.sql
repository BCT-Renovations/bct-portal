-- Use canonical BCT authorization helpers for bid and assignment guards.
create or replace function public.bct_guard_assignment_status_transition()
returns trigger language plpgsql set search_path=public,auth as $f$
begin
 if new.status is not distinct from old.status then return new; end if;
 if current_user in ('postgres','service_role','supabase_admin') then return new; end if;
 if not public.is_bct_admin() then raise exception 'Only BCT admin may change assignment status'; end if;
 if not (
  (old.status='assigned' and new.status in ('scheduled','in_progress','cancelled')) or
  (old.status='scheduled' and new.status in ('assigned','in_progress','cancelled')) or
  (old.status='in_progress' and new.status in ('quality_review','cancelled')) or
  (old.status='quality_review' and new.status in ('in_progress','completed','cancelled')) or
  (old.status='completed' and new.status='quality_review') or
  (old.status='cancelled' and new.status='assigned')
 ) then raise exception 'Invalid assignment status transition: % to %',old.status,new.status; end if;
 return new;
end $f$;

create or replace function public.bct_guard_bid_sensitive_update()
returns trigger language plpgsql set search_path=public,auth as $f$
begin
 if current_user not in ('postgres','service_role','supabase_admin') and not public.is_bct_admin() then
  if auth.uid() is null or not exists(select 1 from public.bct_contractors c where c.id=old.contractor_id and c.auth_user_id=auth.uid()) then
   raise exception 'Contractor bid ownership required';
  end if;
  if new.job_id is distinct from old.job_id or new.contractor_id is distinct from old.contractor_id or new.submitted_at is distinct from old.submitted_at then
   raise exception 'Contractor cannot change bid ownership fields';
  end if;
  if new.status is distinct from old.status and not (old.status in ('submitted','under_review') and new.status='withdrawn') then
   raise exception 'Only BCT admin may change bid workflow status';
  end if;
 end if;
 return new;
end $f$;
