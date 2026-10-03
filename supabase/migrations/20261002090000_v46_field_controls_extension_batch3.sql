-- Development-only additive extension for V46 protection, logistics, closeout and financial controls batch 3.
-- No production application without explicit approval.

-- Reuse checklist engine for occupied-home, protection, orientation, end-of-day, final return.
alter table public.bct_project_checklists
  add column if not exists required_before_start boolean not null default false,
  add column if not exists blocks_closeout boolean not null default false,
  add column if not exists homeowner_visible boolean not null default false;

alter table public.bct_checklist_items
  add column if not exists evidence_required boolean not null default false,
  add column if not exists evidence_refs jsonb not null default '[]'::jsonb,
  add column if not exists responsible_party text,
  add column if not exists blocks_progress boolean not null default false;

-- Reuse dumpster/site logistics for disposal controls.
alter table public.bct_dumpster_permits
  add column if not exists prohibited_materials text,
  add column if not exists haul_off_count integer not null default 0,
  add column if not exists disposal_document_refs jsonb not null default '[]'::jsonb,
  add column if not exists excess_cost_responsibility text;

-- Reuse warranties/closeout for homeowner Home Record.
alter table public.bct_warranties
  add column if not exists trade text,
  add column if not exists manufacturer text,
  add column if not exists product_model text,
  add column if not exists serial_number text,
  add column if not exists care_maintenance text,
  add column if not exists document_refs jsonb not null default '[]'::jsonb;

alter table public.bct_closeout_items
  add column if not exists homeowner_record_category text,
  add column if not exists homeowner_visible boolean not null default false,
  add column if not exists document_refs jsonb not null default '[]'::jsonb;

-- Punch-list stays open until corrected and verified.
alter table public.bct_punch_list_items
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid,
  add column if not exists verification_notes text;

create or replace function public.bct_punch_list_verified_close_guard()
returns trigger
language plpgsql
set search_path=public,auth
as $$
begin
  if lower(coalesce(new.status,'')) in ('complete','completed','closed','verified')
     and new.verified_at is null then
    raise exception 'Punch-list item cannot close until correction is verified';
  end if;
  return new;
end $$;

drop trigger if exists trg_bct_punch_list_verified_close_guard on public.bct_punch_list_items;
create trigger trg_bct_punch_list_verified_close_guard
before insert or update on public.bct_punch_list_items
for each row execute function public.bct_punch_list_verified_close_guard();

-- Reuse financial controls for variance visibility.
alter table public.bct_financial_closeouts
  add column if not exists reconciled_at timestamptz,
  add column if not exists reconciliation_notes text;

alter table public.bct_job_costs
  add column if not exists variance_amount numeric,
  add column if not exists variance_status text;

-- Reuse customer concern/feedback architecture for homeowner Report a Problem and daily feedback.
alter table public.bct_customer_feedback
  add column if not exists feedback_type text,
  add column if not exists project_day date,
  add column if not exists severity text,
  add column if not exists routed_attention boolean not null default false;

-- Reuse action inbox for critical material shortage lookahead.
create or replace function public.bct_refresh_material_shortage_attention()
returns jsonb
language plpgsql
security definer
set search_path=public,auth
as $$
declare v_created integer := 0;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;

  insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
  select distinct
    jm.project_id,
    'material_shortage',
    concat('Material shortage risk: ',coalesce(jm.item_name,'project material')),
    se.starts_at,
    'high',
    'open',
    now()
  from public.bct_job_materials jm
  join public.bct_schedule_events se on se.project_id=jm.project_id
  where se.starts_at between now() and now()+interval '7 days'
    and (
      lower(coalesce(jm.status,'')) in ('short','shortage','backordered','unavailable')
    )
    and not exists(
      select 1 from public.bct_action_inbox ai
       where ai.project_id=jm.project_id
         and ai.action_type='material_shortage'
         and ai.status='open'
         and ai.title=concat('Material shortage risk: ',coalesce(jm.item_name,'project material'))
    );
  get diagnostics v_created=row_count;
  return jsonb_build_object('created',v_created,'refreshed_at',now());
end $$;

revoke execute on function public.bct_refresh_material_shortage_attention() from public,anon;
grant execute on function public.bct_refresh_material_shortage_attention() to authenticated;

-- Reuse customer concern severity and existing attention routing.
create or replace function public.bct_route_customer_concern_attention(p_concern_id uuid)
returns uuid
language plpgsql
security definer
set search_path=public,auth
as $$
declare v public.bct_customer_concerns; v_action uuid;
begin
  if not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
  select * into v from public.bct_customer_concerns where id=p_concern_id;
  if v.id is null then raise exception 'Concern not found'; end if;
  if lower(coalesce(v.severity,'')) not in ('urgent','critical','high') then return null; end if;

  insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
  values(v.project_id,'customer_concern',
         concat('Homeowner concern: ',coalesce(v.concern_type,'problem')),
         case when lower(coalesce(v.severity,''))='critical' then 'critical' else 'high' end,
         'open',now())
  returning id into v_action;
  return v_action;
end $$;

revoke execute on function public.bct_route_customer_concern_attention(uuid) from public,anon;
grant execute on function public.bct_route_customer_concern_attention(uuid) to authenticated;
