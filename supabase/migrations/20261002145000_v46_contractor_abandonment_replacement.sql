-- V46 contractor abandonment / replacement hardening. Development only.
-- Extends canonical bct_assignments and reuses existing assignment status controls.

alter table public.bct_assignments
  add column if not exists abandonment_reported_at timestamptz,
  add column if not exists abandonment_reported_by uuid,
  add column if not exists abandonment_reason text,
  add column if not exists replacement_required boolean not null default false,
  add column if not exists replacement_assignment_id uuid references public.bct_assignments(id),
  add column if not exists replacement_resolved_at timestamptz,
  add column if not exists replacement_resolved_by uuid;

create or replace function public.bct_admin_mark_contractor_abandonment(
 p_assignment_id uuid,p_reason text
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_assignments%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if nullif(btrim(coalesce(p_reason,'')),'') is null then raise exception 'Abandonment reason required'; end if;
 select * into v from public.bct_assignments where id=p_assignment_id for update;
 if v.id is null then raise exception 'Assignment not found'; end if;
 if lower(coalesce(v.status,'')) in ('completed','cancelled') then raise exception 'Assignment is already closed'; end if;

 update public.bct_assignments
 set abandonment_reported_at=now(),abandonment_reported_by=auth.uid(),
     abandonment_reason=btrim(p_reason),replacement_required=true
 where id=p_assignment_id;

 perform public.bct_admin_set_assignment_status(p_assignment_id,'cancelled');

 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select v.project_id,'contractor_replacement_required',
        'Contractor replacement required','critical','open',now()
 where not exists(
  select 1 from public.bct_action_inbox ai
  where ai.project_id=v.project_id and ai.action_type='contractor_replacement_required'
    and ai.status='open'
 );

 return p_assignment_id;
end $$;
revoke all on function public.bct_admin_mark_contractor_abandonment(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_mark_contractor_abandonment(uuid,text) to authenticated;

create or replace function public.bct_admin_resolve_contractor_replacement(
 p_abandoned_assignment_id uuid,p_replacement_assignment_id uuid
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare old_a public.bct_assignments%rowtype; new_a public.bct_assignments%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_abandoned_assignment_id=p_replacement_assignment_id then raise exception 'Replacement assignment must be different'; end if;

 select * into old_a from public.bct_assignments where id=p_abandoned_assignment_id for update;
 if old_a.id is null or not coalesce(old_a.replacement_required,false) then raise exception 'Replacement-required assignment not found'; end if;

 select * into new_a from public.bct_assignments where id=p_replacement_assignment_id;
 if new_a.id is null then raise exception 'Replacement assignment not found'; end if;
 if new_a.project_id<>old_a.project_id then raise exception 'Replacement assignment must belong to the same project'; end if;
 if lower(coalesce(new_a.status,'')) not in ('assigned','scheduled','accepted','active','in_progress','quality_review') then raise exception 'Replacement assignment is not active'; end if;

 update public.bct_assignments
 set replacement_assignment_id=p_replacement_assignment_id,
     replacement_required=false,
     replacement_resolved_at=now(),
     replacement_resolved_by=auth.uid()
 where id=p_abandoned_assignment_id;

 update public.bct_action_inbox
 set status='closed'
 where project_id=old_a.project_id and action_type='contractor_replacement_required' and status='open';

 return p_abandoned_assignment_id;
end $$;
revoke all on function public.bct_admin_resolve_contractor_replacement(uuid,uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_resolve_contractor_replacement(uuid,uuid) to authenticated;
