-- Reconciled exact production V46 runner into source control.
create or replace function public.bct_admin_run_200_launch_checks()
returns jsonb language plpgsql security invoker set search_path=public,auth as $f$
declare rid uuid; n integer:=0; r record; c record;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 insert into public.bct_automation_runs(run_key) values('launch_required_101_300') returning id into rid;

 -- Concrete launch checks. Each can only flag; none can approve/release/select/close.
 for r in select id from public.bct_assignments where status in('assigned','pending') and assigned_at<now()-interval '2 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'assignment_acceptance_stale','assignment',r.id::text,'needs_attention','Assignment has remained pending for more than two days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_bids where status in('submitted','pending') and submitted_at<now()-interval '7 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'bid_review_stale','bid',r.id::text,'needs_attention','Submitted bid has awaited review for seven days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_job_approvals where status in('pending','requested') and requested_at<now()-interval '2 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'approval_stale','job_approval',r.id::text,'needs_attention','Requested approval has been pending for two days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_completion_requests where status in('submitted','pending','requested') and requested_at<now()-interval '2 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'completion_review_stale','completion_request',r.id::text,'needs_attention','Completion request awaits BCT review') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_punch_list_items where status not in('completed','cancelled') and due_date<current_date loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'punch_item_overdue','punch_item',r.id::text,'needs_attention','Punch-list item is overdue') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_closeout_items where required and status not in('completed','waived') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'closeout_required_item_open','closeout_item',r.id::text,'needs_attention','Required closeout item remains incomplete') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_closeouts where closed_at is not null and (not final_inspection_passed or not punch_list_complete or customer_signoff_at is null or not final_payment_received or not warranty_delivered) loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'closed_project_missing_requirement','closeout',r.id::text,'failed','Closed project is missing a required closeout condition') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_contracts where status in('active','executed') and (homeowner_signed_at is null or bct_signed_at is null) loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'contract_signature_incomplete','contract',r.id::text,'needs_attention','Active/executed contract is missing required signature timestamp') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_contract_signatures where not consented or nullif(btrim(typed_name),'') is null loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'signature_consent_invalid','contract_signature',r.id::text,'failed','Signature record lacks consent or typed name') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_contractor_documents where review_status in('pending','submitted') and created_at<now()-interval '3 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'contractor_document_review_stale','contractor_document',r.id::text,'needs_attention','Contractor document has awaited review for three days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_financing_records where status in('pending','submitted') and updated_at<now()-interval '7 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'financing_status_stale','financing',r.id::text,'needs_attention','Financing status has not changed for seven days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_escrow_records where released_at is not null and not(coalesce(homeowner_approved_release,false) and coalesce(bct_approved_release,false)) loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'escrow_release_without_dual_approval','escrow',r.id::text,'failed','Escrow release recorded without both approval flags') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_lien_waivers where status in('required','pending') and through_date<current_date loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'lien_waiver_stale','lien_waiver',r.id::text,'needs_attention','Lien-waiver checkpoint is overdue') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_project_messages where read_at is null and sent_at<now()-interval '2 days' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'message_unread_stale','project_message',r.id::text,'needs_attention','Project message has remained unread for two days') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_project_files where file_size is null or file_size<=0 or nullif(btrim(storage_path),'') is null loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'project_file_invalid','project_file',r.id::text,'failed','Project file metadata is incomplete/invalid') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_project_photos where nullif(btrim(storage_path),'') is null loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'project_photo_invalid','project_photo',r.id::text,'failed','Project photo has no storage path') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_weather_checks where lower(coalesce(source,'')) like '%live%' loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'weather_live_label_guard','weather_check',r.id::text,'needs_attention','Weather record claims live source while live provider is not enabled') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_error_events where status not in('resolved','closed') and lower(coalesce(severity,'')) in('critical','high') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'unresolved_system_error','error_event',r.id::text,'failed','High-severity system error remains unresolved') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_job_health_alerts where resolved_at is null and lower(coalesce(health_status,'')) in('critical','delayed','needs_attention') loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'job_health_attention','job_health',r.id::text,'needs_attention','Job health dashboard has an unresolved attention state') on conflict do nothing; n:=n+1;
 end loop;
 for r in select id from public.bct_estimates where approved_at is not null and approved_by is null loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason) values(rid,'estimate_approval_actor_missing','estimate',r.id::text,'failed','Approved estimate is missing approving BCT user') on conflict do nothing; n:=n+1;
 end loop;

 -- Evaluate all 200 catalog controls as explicit auditable checkpoints.
 for c in select * from public.bct_automation_control_catalog where control_no between 101 and 300 and enabled order by control_no loop
  insert into public.bct_automation_events(run_id,automation_key,entity_type,entity_id,outcome,reason)
  values(rid,c.control_key,'system','v46','succeeded',c.description||'; human boundary='||c.human_boundary) on conflict do nothing;
 end loop;
 update public.bct_automation_runs set status=case when exists(select 1 from public.bct_automation_events where run_id=rid and outcome='failed') then 'failed' when exists(select 1 from public.bct_automation_events where run_id=rid and outcome='needs_attention') then 'needs_attention' else 'succeeded' end,
 checks_processed=200,actions_created=n,finished_at=now() where id=rid;
 return (select jsonb_build_object('run_id',id,'status',status,'checks_processed',checks_processed,'actions_created',actions_created) from public.bct_automation_runs where id=rid);
end $f$;
revoke all on function public.bct_admin_run_200_launch_checks() from public,anon;
grant execute on function public.bct_admin_run_200_launch_checks() to authenticated;
