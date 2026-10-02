-- Development-only additive extension for V46 field controls.
-- Do not apply to production without explicit approval.
-- Reuses existing V46 incident, stop-work, access, materials, daily log, equipment,
-- inspections, decisions, Job Health, action inbox, notifications, photos/files,
-- approvals and change-order architecture.

alter table public.bct_incidents
  add column if not exists immediate_safety_response text,
  add column if not exists bct_alerted_at timestamptz,
  add column if not exists assessment_notes text,
  add column if not exists follow_up_required boolean not null default false,
  add column if not exists follow_up_notes text,
  add column if not exists closed_at timestamptz,
  add column if not exists closed_by uuid;

alter table public.bct_stop_work_orders
  add column if not exists affected_scope text,
  add column if not exists corrective_requirements text,
  add column if not exists evidence_notes text;

alter table public.bct_site_keys
  add column if not exists access_type text,
  add column if not exists access_purpose text,
  add column if not exists issued_by uuid,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid;

alter table public.bct_customer_materials
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists size_spec text,
  add column if not exists receipt_path text,
  add column if not exists photo_path text,
  add column if not exists storage_location text,
  add column if not exists delivery_status text,
  add column if not exists additional_material_required boolean not null default false,
  add column if not exists verification_notes text;

alter table public.bct_delivery_receipts
  add column if not exists quantity_expected numeric,
  add column if not exists quantity_received numeric,
  add column if not exists delivery_ticket_path text,
  add column if not exists secured_location text,
  add column if not exists transferred_to uuid,
  add column if not exists transferred_at timestamptz,
  add column if not exists returned_at timestamptz;

alter table public.bct_daily_logs
  add column if not exists crew_present jsonb not null default '[]'::jsonb,
  add column if not exists issue_summary text,
  add column if not exists next_steps text,
  add column if not exists photo_refs jsonb not null default '[]'::jsonb;

alter table public.bct_equipment_usage
  add column if not exists rental_company text,
  add column if not exists responsible_party uuid,
  add column if not exists issued_condition text,
  add column if not exists return_deadline timestamptz,
  add column if not exists returned_at timestamptz,
  add column if not exists returned_condition text,
  add column if not exists late_fee_exposure numeric,
  add column if not exists extension_status text,
  add column if not exists resolution_notes text;

alter table public.bct_customer_decisions
  add column if not exists reminder_count integer not null default 0,
  add column if not exists last_reminded_at timestamptz,
  add column if not exists schedule_impact text;

alter table public.bct_utility_interruptions
  add column if not exists authorized_by uuid,
  add column if not exists actual_shutoff_at timestamptz,
  add column if not exists shutoff_by uuid,
  add column if not exists restored_at timestamptz,
  add column if not exists restored_by uuid,
  add column if not exists safe_restoration_confirmed boolean not null default false;

alter table public.bct_code_corrections
  add column if not exists clearance_status text,
  add column if not exists clearance_notes text,
  add column if not exists cleared_at timestamptz,
  add column if not exists cleared_by uuid;

alter table public.bct_special_orders
  add column if not exists measurement_verified boolean not null default false,
  add column if not exists selection_approved boolean not null default false,
  add column if not exists price_approved boolean not null default false,
  add column if not exists responsible_party uuid,
  add column if not exists approval_reference uuid;

-- Rental deadline attention is integrated with the existing action inbox.
create or replace function public.bct_refresh_equipment_return_attention()
returns jsonb
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_now timestamptz := now();
  v_created integer := 0;
begin
  if not public.is_bct_admin() then
    raise exception 'BCT Admin access required';
  end if;

  insert into public.bct_action_inbox(project_id,action_type,title,due_at,assigned_to,priority,status,created_at)
  select
    eu.project_id,
    'equipment_return',
    concat('Rental return: ',eu.equipment_name,
      case when eu.rental_company is not null then ' — '||eu.rental_company else '' end,
      case when eu.late_fee_exposure is not null then ' — late-fee exposure $'||eu.late_fee_exposure::text else '' end),
    eu.return_deadline,
    eu.responsible_party,
    case
      when eu.return_deadline < v_now then 'critical'
      when eu.return_deadline <= v_now + interval '12 hours' then 'critical'
      when eu.return_deadline <= v_now + interval '24 hours' then 'high'
      when eu.return_deadline <= v_now + interval '72 hours' then 'medium'
      else 'low'
    end,
    case when eu.return_deadline < v_now then 'overdue' else 'open' end,
    v_now
  from public.bct_equipment_usage eu
  where eu.return_deadline is not null
    and eu.returned_at is null
    and coalesce(eu.extension_status,'') <> 'extended'
    and eu.return_deadline <= v_now + interval '7 days'
    and not exists (
      select 1 from public.bct_action_inbox ai
      where ai.project_id=eu.project_id
        and ai.action_type='equipment_return'
        and ai.status in ('open','overdue')
        and ai.title like concat('Rental return: ',eu.equipment_name,'%')
    );
  get diagnostics v_created = row_count;

  return jsonb_build_object('created',v_created,'refreshed_at',v_now);
end $$;

revoke execute on function public.bct_refresh_equipment_return_attention() from public,anon;
grant execute on function public.bct_refresh_equipment_return_attention() to authenticated;

-- Stop-work release remains BCT-only; contractors can report but cannot release.
create or replace function public.bct_admin_release_stop_work(
  p_stop_work_id uuid,
  p_release_reason text
) returns public.bct_stop_work_orders
language plpgsql
security definer
set search_path=public,auth
as $$
declare v_row public.bct_stop_work_orders;
begin
  if not public.is_bct_admin() then
    raise exception 'BCT Admin access required';
  end if;
  update public.bct_stop_work_orders
     set status='released',
         released_at=now(),
         released_by=auth.uid(),
         release_reason=nullif(btrim(p_release_reason),'')
   where id=p_stop_work_id
     and status<>'released'
  returning * into v_row;
  if v_row.id is null then raise exception 'Active stop-work order not found'; end if;
  return v_row;
end $$;

revoke execute on function public.bct_admin_release_stop_work(uuid,text) from public,anon;
grant execute on function public.bct_admin_release_stop_work(uuid,text) to authenticated;
