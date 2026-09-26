-- Reconcile production Admin Job Health dashboard with contractor safety compliance.
-- Safety restriction = needs attention; explicit BCT Admin hold = critical.
create or replace function public.bct_admin_job_health_dashboard()
returns jsonb language plpgsql security invoker set search_path=public,auth as $f$
declare v_jobs jsonb; v_summary jsonb;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 with base as (
   select j.id job_id,j.project_id,j.job_number,j.title,j.trade,j.status job_status,j.desired_start_date,
          p.project_number,p.workflow_status project_status,p.completion_deadline,
          btrim(concat_ws(' ',cu.first_name,cu.last_name)) customer_name,cu.phone customer_phone,cu.email customer_email,
          coalesce(nullif(ac.business_name,''),ac.legal_name,'Unassigned') contractor_name,ac.id contractor_id,
          coalesce(wh.safety_restricted,false) safety_restricted,coalesce(wh.admin_hold,false) admin_hold,wh.admin_hold_reason,
          se.starts_at next_schedule_start,se.ends_at next_schedule_end,se.title next_schedule_title,se.status next_schedule_status,
          coalesce(ms.total,0) milestone_total,coalesce(ms.completed,0) milestone_completed,
          coalesce(w.delay_count,0) weather_delay_count,w.latest_delay_date,w.latest_condition weather_condition,w.latest_impact weather_impact,
          coalesce(mat.total,0) materials_total,coalesce(mat.pending,0) materials_pending,coalesce(mat.return_attention,0) material_returns_attention,
          coalesce(co.total,0) change_orders_total,coalesce(co.pending,0) change_orders_pending,
          coalesce(ap.total,0) approvals_total,coalesce(ap.pending,0) approvals_pending,
          fin.status financing_status,fin.approved_amount financing_approved_amount,
          esc.status escrow_status,esc.amount escrow_amount,esc.homeowner_approved_release,esc.bct_approved_release,
          coalesce(msg.total,0) messages_total,coalesce(msg.unread,0) messages_unread,
          coalesce(risk.critical_open,0) critical_risks,coalesce(inc.critical_open,0) critical_incidents,
          coalesce(q.critical_open,0) critical_quality,coalesce(task.blocked_or_urgent,0) urgent_tasks
   from public.bct_jobs j join public.bct_projects p on p.id=j.project_id
   left join public.bct_customers cu on cu.id=p.customer_id
   left join lateral (select c.* from public.bct_assignments a join public.bct_contractors c on c.id=a.contractor_id where a.job_id=j.id and a.status<>'cancelled' order by a.assigned_at desc limit 1) ac on true
   left join public.bct_contractor_workforce_holds wh on wh.contractor_id=ac.id
   left join lateral (select s.starts_at,s.ends_at,s.title,s.status from public.bct_schedule_events s where s.job_id=j.id and s.status not in('completed','cancelled') order by case when s.starts_at>=now() then 0 else 1 end,s.starts_at asc limit 1) se on true
   left join lateral (select count(*) filter(where status<>'cancelled')::numeric total,count(*) filter(where status='completed')::numeric completed from public.bct_project_milestones m where m.job_id=j.id) ms on true
   left join lateral (select count(*) filter(where work_impact in('delay','reschedule')) delay_count,max(check_date) filter(where work_impact in('delay','reschedule')) latest_delay_date,(array_agg(condition_summary order by check_date desc) filter(where work_impact in('delay','reschedule')))[1] latest_condition,(array_agg(work_impact order by check_date desc) filter(where work_impact in('delay','reschedule')))[1] latest_impact from public.bct_weather_checks w where w.job_id=j.id) w on true
   left join lateral (select count(*) total,count(*) filter(where status not in('installed','returned','cancelled')) pending,count(*) filter(where return_status in('needed','pending')) return_attention from public.bct_job_materials m where m.job_id=j.id) mat on true
   left join lateral (select count(*) total,count(*) filter(where status in('draft','sent')) pending from public.bct_change_orders x where x.job_id=j.id) co on true
   left join lateral (select count(*) total,count(*) filter(where status='pending') pending from public.bct_job_approvals a where a.job_id=j.id) ap on true
   left join lateral (select f.* from public.bct_financing_records f where f.project_id=p.id order by f.created_at desc limit 1) fin on true
   left join lateral (select e.* from public.bct_escrow_records e where e.project_id=p.id order by e.created_at desc limit 1) esc on true
   left join lateral (select count(*) total,count(*) filter(where m.audience in('bct','all') and not exists(select 1 from public.bct_project_message_reads r where r.message_id=m.id and r.user_id=auth.uid())) unread from public.bct_project_messages m where m.project_id=p.id) msg on true
   left join lateral (select count(*) filter(where status in('open','mitigating') and impact='critical') critical_open from public.bct_project_risks r where r.job_id=j.id) risk on true
   left join lateral (select count(*) filter(where resolved_at is null and severity='critical') critical_open from public.bct_incidents i where i.job_id=j.id) inc on true
   left join lateral (select count(*) filter(where status in('open','correcting') and severity='critical') critical_open from public.bct_quality_observations q where q.job_id=j.id) q on true
   left join lateral (select count(*) filter(where status='blocked' or(priority='urgent' and status not in('completed','cancelled'))or(due_at<now() and status not in('completed','cancelled'))) blocked_or_urgent from public.bct_tasks t where t.job_id=j.id) task on true
   where j.status not in('completed','closed')
 ), health as (
 select *,case when milestone_total>0 then round(100.0*milestone_completed/milestone_total)::int when job_status='in_progress' then 50 when job_status='scheduled' then 35 when job_status='awarded' then 25 when job_status='bid_review' then 15 when job_status='open_for_bids' then 10 when job_status='draft' then 5 else 0 end completion_percent,
 case when milestone_total>0 then 'milestones' else 'job_status' end completion_source,
 case when admin_hold or critical_incidents>0 or critical_risks>0 or critical_quality>0 or(completion_deadline is not null and completion_deadline<current_date)or(coalesce(financing_status,'not_started') in('declined','cancelled') and job_status in('awarded','scheduled','in_progress')) then 'critical'
      when job_status='on_hold' or weather_delay_count>0 or next_schedule_status='rescheduled' or(next_schedule_start is not null and next_schedule_start<now() and next_schedule_status in('scheduled','confirmed')) then 'delayed'
      when safety_restricted or(job_status in('awarded','scheduled','in_progress') and contractor_id is null)or approvals_pending>0 or change_orders_pending>0 or material_returns_attention>0 or urgent_tasks>0 or messages_unread>0 or coalesce(financing_status,'not_started') in('applied','pending') or coalesce(escrow_status,'not_started') in('pending','hold','release_pending') then 'needs_attention' else 'on_track' end health_status,
 array_remove(array[
   case when admin_hold then 'Assigned contractor has BCT Admin hold: '||coalesce(nullif(admin_hold_reason,''),'Review required') end,
   case when safety_restricted then 'Assigned contractor is safety restricted from new BCT work' end,
   case when critical_incidents>0 then critical_incidents||' unresolved critical incident(s)' end,
   case when critical_risks>0 then critical_risks||' critical project risk(s)' end,
   case when critical_quality>0 then critical_quality||' critical quality item(s)' end,
   case when completion_deadline is not null and completion_deadline<current_date then 'Project completion deadline is overdue' end,
   case when job_status='on_hold' then 'Job is on hold' end,
   case when job_status in('awarded','scheduled','in_progress') and contractor_id is null then 'No contractor assigned' end,
   case when weather_delay_count>0 then weather_delay_count||' weather delay/reschedule record(s)' end,
   case when materials_pending>0 then materials_pending||' material item(s) not installed/closed' end,
   case when change_orders_pending>0 then change_orders_pending||' change order(s) awaiting resolution' end,
   case when approvals_pending>0 then approvals_pending||' approval(s) pending' end,
   case when urgent_tasks>0 then urgent_tasks||' urgent/blocked task(s)' end,
   case when messages_unread>0 then messages_unread||' unread project message(s)' end
 ]::text[],null) attention_items from base)
 select coalesce(jsonb_agg(jsonb_build_object('job_id',job_id,'project_id',project_id,'job_number',job_number,'title',title,'trade',trade,'job_status',job_status,'project_number',project_number,'project_status',project_status,'customer',jsonb_build_object('name',customer_name,'phone',customer_phone,'email',customer_email),'contractor',jsonb_build_object('id',contractor_id,'name',contractor_name,'safety_restricted',safety_restricted,'admin_hold',admin_hold,'admin_hold_reason',admin_hold_reason),'schedule',jsonb_build_object('desired_start_date',desired_start_date,'next_start',next_schedule_start,'next_end',next_schedule_end,'next_title',next_schedule_title,'next_status',next_schedule_status,'completion_deadline',completion_deadline),'completion_percent',completion_percent,'completion_source',completion_source,'weather',jsonb_build_object('delay_count',weather_delay_count,'latest_delay_date',latest_delay_date,'condition',weather_condition,'impact',weather_impact),'materials',jsonb_build_object('total',materials_total,'pending',materials_pending,'returns_need_attention',material_returns_attention),'change_orders',jsonb_build_object('total',change_orders_total,'pending',change_orders_pending),'approvals',jsonb_build_object('total',approvals_total,'pending',approvals_pending),'financing',jsonb_build_object('status',coalesce(financing_status,'not_started'),'approved_amount',financing_approved_amount),'escrow',jsonb_build_object('status',coalesce(escrow_status,'not_started'),'amount',escrow_amount,'homeowner_release_approved',coalesce(homeowner_approved_release,false),'bct_release_approved',coalesce(bct_approved_release,false)),'messages',jsonb_build_object('total',messages_total,'unread',messages_unread),'health_status',health_status,'attention_items',to_jsonb(attention_items)) order by case health_status when 'critical' then 1 when 'delayed' then 2 when 'needs_attention' then 3 else 4 end,job_number),'[]'::jsonb) into v_jobs from health;
 select jsonb_build_object('active_jobs',jsonb_array_length(v_jobs),'on_track',(select count(*) from jsonb_array_elements(v_jobs)x where x->>'health_status'='on_track'),'needs_attention',(select count(*) from jsonb_array_elements(v_jobs)x where x->>'health_status'='needs_attention'),'delayed',(select count(*) from jsonb_array_elements(v_jobs)x where x->>'health_status'='delayed'),'critical',(select count(*) from jsonb_array_elements(v_jobs)x where x->>'health_status'='critical')) into v_summary;
 return jsonb_build_object('summary',v_summary,'jobs',v_jobs,'generated_at',now());
end $f$;
revoke all on function public.bct_admin_job_health_dashboard() from public,anon;
grant execute on function public.bct_admin_job_health_dashboard() to authenticated;
