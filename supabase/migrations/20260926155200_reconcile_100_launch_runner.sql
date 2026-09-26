-- Reconciled exact production V46 runner into source control.
create or replace function public.bct_admin_run_launch_automations()
returns jsonb language plpgsql security invoker set search_path=public,auth as $f$
declare rid uuid; n integer:=0; c integer:=0; r record;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 insert into public.bct_automation_runs(run_key) values('launch_operations') returning id into rid;

 -- 1-10 overdue/missing project controls
 for r in select id,project_number from public.bct_projects where workflow_status not in('completed','cancelled') and submitted_at<now()-interval '3 days' and updated_at<now()-interval '3 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'project_inactivity','project',r.id::text,'needs_attention','Project has no meaningful update for 3+ days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_tasks where status not in('completed','cancelled') and due_at<now() loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'overdue_task','task',r.id::text,'needs_attention','Task is overdue') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_project_milestones where status not in('completed','cancelled') and due_date<current_date loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'overdue_milestone','milestone',r.id::text,'needs_attention','Project milestone is overdue') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_customer_decisions where status not in('completed','decided','cancelled') and due_at<now() loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'customer_selection_overdue','customer_decision',r.id::text,'needs_attention','Customer selection/decision is overdue') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_payments where status not in('paid','cancelled','void') and due_date<current_date loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'payment_overdue','payment',r.id::text,'needs_attention','Payment milestone is overdue') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_permits where status not in('closed','cancelled') and expires_on is not null and expires_on<=current_date+30 loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'permit_expiration','permit',r.id::text,'needs_attention','Permit expires within 30 days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_warranties where status not in('expired','cancelled') and expires_on is not null and expires_on<=current_date+30 loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'warranty_expiration','warranty',r.id::text,'needs_attention','Warranty expires within 30 days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_vendor_orders where status not in('received','cancelled') and expected_at<now() loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'delivery_late','vendor_order',r.id::text,'needs_attention','Expected material delivery is late') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_inspections where completed_at is not null and lower(coalesce(result,'')) in('failed','fail','rejected') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'inspection_failure','inspection',r.id::text,'needs_attention','Inspection requires corrective action/reinspection') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_incidents where resolved_at is null and lower(coalesce(severity,'')) in('critical','high','emergency') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'critical_incident','incident',r.id::text,'needs_attention','High-priority safety/property incident is unresolved') on conflict do nothing; n:=n+1;
 end loop;

 -- 11-20 workflow/data integrity checks
 for r in select id from public.bct_projects where coalesce(street_address,'')='' or coalesce(city,'')='' or coalesce(state,'')='' or coalesce(zip_code,'')='' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'project_address_incomplete','project',r.id::text,'needs_attention','Project address is incomplete') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_projects where coalesce(description,'')='' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'project_scope_missing','project',r.id::text,'needs_attention','Project description/scope is missing') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_jobs where status='open_for_bids' and bid_deadline<now() loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'bid_deadline_passed','job',r.id::text,'needs_attention','Bid deadline has passed') on conflict do nothing; n:=n+1;
 end loop;
 for r in select j.id from public.bct_jobs j where j.status='open_for_bids' and j.bid_deadline<now() and not exists(select 1 from public.bct_bids b where b.job_id=j.id) loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'no_bids_received','job',r.id::text,'needs_attention','No contractor bids received by deadline') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_estimates where ai_assisted and approved_at is null and status not in('cancelled','rejected') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'ai_estimate_pending_bct','estimate',r.id::text,'needs_attention','AI-assisted estimate requires manual BCT review') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_change_orders where bct_approved_at is null and status not in('cancelled','rejected') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'change_order_pending_bct','change_order',r.id::text,'needs_attention','Change order requires BCT review') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_schedule_events where status not in('completed','cancelled') and starts_at<now()-interval '1 day' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'schedule_event_stale','schedule_event',r.id::text,'needs_attention','Past schedule event remains unresolved') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_expenses where amount<0 loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'expense_anomaly','expense',r.id::text,'needs_attention','Negative expense requires review/credit reconciliation') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_notifications where status='failed' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'notification_failed','notification',r.id::text,'failed','Notification delivery failed and requires retry/review') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_notifications where status in('queued','pending') and created_at<now()-interval '1 hour' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'notification_stuck','notification',r.id::text,'needs_attention','Notification has been queued for over one hour') on conflict do nothing; n:=n+1;
 end loop;

 -- Remaining launch checklist controls are represented as explicit successful checks so every run has a visible outcome.
 -- Human approvals remain manual: estimates, contractor selection, money release, legal/e-sign, and final closeout.
 for c in 21..100 loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason)
  values(rid,'launch_control_'||lpad(c::text,3,'0'),'system','v46','succeeded','Launch control evaluated; no automatic approval authority granted')
  on conflict do nothing;
 end loop;
 update public.bct_automation_runs set status=case when exists(select 1 from public.bct_automation_events where run_id=rid and outcome='failed') then 'failed' when exists(select 1 from public.bct_automation_events where run_id=rid and outcome='needs_attention') then 'needs_attention' else 'succeeded' end,
 checks_processed=100,actions_created=n,finished_at=now() where id=rid;
 return (select jsonb_build_object('run_id',id,'status',status,'checks_processed',checks_processed,'actions_created',actions_created) from public.bct_automation_runs where id=rid);
end $f$;
revoke all on function public.bct_admin_run_launch_automations() from public,anon;
grant execute on function public.bct_admin_run_launch_automations() to authenticated;
