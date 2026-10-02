-- Development-only additive extension for V46 field/workforce/material controls batch 2.
-- No production application without explicit approval.

-- Reuse canonical work packages/dependencies for trade handoff.
alter table public.bct_work_packages
  add column if not exists handoff_offered_at timestamptz,
  add column if not exists handoff_offered_by uuid,
  add column if not exists handoff_acknowledged_at timestamptz,
  add column if not exists handoff_acknowledged_by uuid,
  add column if not exists handoff_notes text;

-- Reuse project crews/worker assignments for physical presence.
alter table public.bct_project_crews
  add column if not exists expected_arrival_start timestamptz,
  add column if not exists expected_arrival_end timestamptz,
  add column if not exists arrival_status text,
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_out_at timestamptz,
  add column if not exists worker_profile_id uuid references public.bct_worker_profiles(id),
  add column if not exists substitute_for uuid references public.bct_worker_profiles(id),
  add column if not exists substitute_approval_status text,
  add column if not exists homeowner_notified_at timestamptz;

-- Reuse scope items for cannot-perform / field authority state.
alter table public.bct_scope_items
  add column if not exists field_execution_status text,
  add column if not exists cannot_perform_reason text,
  add column if not exists cannot_perform_reported_at timestamptz,
  add column if not exists cannot_perform_reported_by uuid;

-- Reuse field questions for Need BCT Decision instead of a new escalation table.
alter table public.bct_field_questions
  add column if not exists question_category text,
  add column if not exists blocks_work boolean not null default false,
  add column if not exists needed_by timestamptz,
  add column if not exists affected_scope_item_id uuid references public.bct_scope_items(id),
  add column if not exists bct_decision text,
  add column if not exists decided_at timestamptz,
  add column if not exists decided_by uuid;

-- Reuse hidden conditions and connect to existing change orders/holds.
alter table public.bct_hidden_conditions
  add column if not exists affected_scope_item_id uuid,
  add column if not exists evidence_photo_refs jsonb not null default '[]'::jsonb,
  add column if not exists change_order_id uuid,
  add column if not exists project_hold_id uuid;

-- Reuse baseline/neighbor records for evidence.
alter table public.bct_site_condition_baselines
  add column if not exists required_before_work boolean not null default false,
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by uuid,
  add column if not exists photo_refs jsonb not null default '[]'::jsonb;

alter table public.bct_neighbor_property_conditions
  add column if not exists issue_type text,
  add column if not exists complaint_received_at timestamptz,
  add column if not exists evidence_refs jsonb not null default '[]'::jsonb,
  add column if not exists bct_review_status text,
  add column if not exists resolved_at timestamptz;

-- Reuse inspections/quality hold points for phase gates.
alter table public.bct_quality_hold_points
  add column if not exists inspection_id uuid,
  add column if not exists clearance_required boolean not null default true,
  add column if not exists cleared_at timestamptz,
  add column if not exists cleared_by uuid;

-- Reuse material substitutions with existing approvals/change orders.
alter table public.bct_material_substitutions
  add column if not exists approval_id uuid,
  add column if not exists change_order_id uuid,
  add column if not exists installed_at timestamptz;

-- Reuse special orders for nonreturnable confirmation.
alter table public.bct_special_orders
  add column if not exists confirmation_complete boolean generated always as (
    measurement_verified and selection_approved and price_approved
  ) stored;

-- Prevent a special/nonreturnable order from being marked ordered without confirmations.
create or replace function public.bct_special_order_confirmation_guard()
returns trigger
language plpgsql
set search_path=public,auth
as $$
begin
  if new.nonreturnable
     and new.status in ('ordered','submitted','confirmed')
     and not (coalesce(new.measurement_verified,false)
              and coalesce(new.selection_approved,false)
              and coalesce(new.price_approved,false)) then
    raise exception 'Special/nonreturnable order requires verified measurement, approved selection, and approved price';
  end if;
  return new;
end $$;

drop trigger if exists trg_bct_special_order_confirmation_guard on public.bct_special_orders;
create trigger trg_bct_special_order_confirmation_guard
before insert or update on public.bct_special_orders
for each row execute function public.bct_special_order_confirmation_guard();

-- Permit/inspection hold point helper. Existing dependencies remain the gate.
create or replace function public.bct_hold_point_cleared(p_hold_point_id uuid)
returns boolean
language sql
stable
security invoker
set search_path=public,auth
as $$
  select exists(
    select 1
      from public.bct_quality_hold_points hp
      left join public.bct_inspections i on i.id=hp.inspection_id
     where hp.id=p_hold_point_id
       and (
         hp.clearance_required=false
         or hp.cleared_at is not null
         or lower(coalesce(i.result,'')) in ('passed','approved','clear','cleared')
       )
  );
$$;

grant execute on function public.bct_hold_point_cleared(uuid) to authenticated;
revoke execute on function public.bct_hold_point_cleared(uuid) from anon;

-- Crew check-in guard. Crew presence is tied to the canonical worker assignment.
create or replace function public.bct_check_in_project_crew(p_project_crew_id uuid)
returns public.bct_project_crews
language plpgsql
security definer
set search_path=public,auth,pg_temp
as $$
declare v_row public.bct_project_crews;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  update public.bct_project_crews pc
     set checked_in_at=now(), arrival_status='arrived'
   where pc.id=p_project_crew_id
     and pc.checked_in_at is null
     and pc.worker_profile_id is not null
     and exists(
       select 1
       from public.bct_worker_assignments wa
       join public.bct_worker_profiles wp on wp.id=wa.worker_profile_id
       where wa.project_id=pc.project_id
         and wa.worker_profile_id=pc.worker_profile_id
         and coalesce(wa.status,'') not in ('cancelled','removed','released')
         and wp.active
         and (wp.auth_user_id=auth.uid() or public.is_bct_admin())
     )
     and (pc.substitute_for is null or pc.substitute_approval_status='approved')
  returning pc.* into v_row;

  if v_row.id is null then raise exception 'Worker is not authorized to check in for this project'; end if;
  return v_row;
end $$;
revoke all on function public.bct_check_in_project_crew(uuid) from public,anon,authenticated;
grant execute on function public.bct_check_in_project_crew(uuid) to authenticated;

create or replace function public.bct_check_out_project_crew(p_project_crew_id uuid)
returns public.bct_project_crews
language plpgsql
security definer
set search_path=public,auth,pg_temp
as $$
declare v_row public.bct_project_crews;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  update public.bct_project_crews pc
     set checked_out_at=now()
   where pc.id=p_project_crew_id
     and pc.checked_in_at is not null
     and pc.checked_out_at is null
     and pc.worker_profile_id is not null
     and exists(
       select 1 from public.bct_worker_profiles wp
       where wp.id=pc.worker_profile_id and wp.active
         and (wp.auth_user_id=auth.uid() or public.is_bct_admin())
     )
  returning pc.* into v_row;
  if v_row.id is null then raise exception 'Active authorized crew check-in not found'; end if;
  return v_row;
end $$;
revoke all on function public.bct_check_out_project_crew(uuid) from public,anon,authenticated;
grant execute on function public.bct_check_out_project_crew(uuid) to authenticated;
