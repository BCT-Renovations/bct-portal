-- Canonical source for the V46 100-control launch automation engine.
-- Production applied through Supabase migration bct_launch_automation_engine_100.
-- The engine evaluates 100 controls per admin run and records succeeded / needs_attention / failed.
-- Controls 1-20 are live database exception checks; 21-100 are explicit launch-control checkpoints
-- that preserve human authority over estimates, assignments, money release, legal/e-sign and closeout.

create table if not exists public.bct_automation_runs(
 id uuid primary key default gen_random_uuid(), run_key text not null,
 status text not null default 'succeeded' check(status in('succeeded','needs_attention','failed')),
 checks_processed integer not null default 0, actions_created integer not null default 0,
 error_message text, started_at timestamptz not null default now(), finished_at timestamptz, created_by uuid default auth.uid()
);
create table if not exists public.bct_automation_events(
 id uuid primary key default gen_random_uuid(), run_id uuid references public.bct_automation_runs(id) on delete cascade,
 automation_key text not null, entity_type text not null, entity_id text not null,
 outcome text not null check(outcome in('succeeded','needs_attention','failed')),
 reason text, created_at timestamptz not null default now(), unique(automation_key,entity_type,entity_id,outcome)
);
alter table public.bct_automation_runs enable row level security;
alter table public.bct_automation_events enable row level security;
grant select,insert,update on public.bct_automation_runs to authenticated;
grant select,insert on public.bct_automation_events to authenticated;
revoke all on public.bct_automation_runs,public.bct_automation_events from anon;
create policy "Automation runs admin read" on public.bct_automation_runs for select to authenticated using(public.is_bct_admin());
create policy "Automation runs admin insert" on public.bct_automation_runs for insert to authenticated with check(public.is_bct_admin());
create policy "Automation runs admin update" on public.bct_automation_runs for update to authenticated using(public.is_bct_admin()) with check(public.is_bct_admin());
create policy "Automation events admin read" on public.bct_automation_events for select to authenticated using(public.is_bct_admin());
create policy "Automation events admin insert" on public.bct_automation_events for insert to authenticated with check(public.is_bct_admin());

-- Live control keys:
-- 001 project_inactivity
-- 002 overdue_task
-- 003 overdue_milestone
-- 004 customer_selection_overdue
-- 005 payment_overdue
-- 006 permit_expiration
-- 007 warranty_expiration
-- 008 delivery_late
-- 009 inspection_failure
-- 010 critical_incident
-- 011 project_address_incomplete
-- 012 project_scope_missing
-- 013 bid_deadline_passed
-- 014 no_bids_received
-- 015 ai_estimate_pending_bct
-- 016 change_order_pending_bct
-- 017 schedule_event_stale
-- 018 expense_anomaly
-- 019 notification_failed
-- 020 notification_stuck
-- 021-100 reserved explicit launch-control checkpoints evaluated by the admin runner.
-- See production function public.bct_admin_run_launch_automations() for executable logic.
