-- Keep the admin job-management controls and the database transition rules aligned.
-- Scheduled is an intentional operational state between award and active work.

create or replace function public.bct_admin_set_job_status(p_job_id uuid, p_status text)
returns public.bct_jobs
language plpgsql
set search_path = public
as $$
declare
  v_row public.bct_jobs;
begin
  if not public.is_bct_admin() then
    raise exception 'BCT admin required';
  end if;

  if p_status not in (
    'draft', 'open_for_bids', 'bid_review', 'awarded', 'scheduled',
    'in_progress', 'completed', 'on_hold', 'closed'
  ) then
    raise exception 'Invalid job status';
  end if;

  update public.bct_jobs
  set status = p_status,
      updated_at = now()
  where id = p_job_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Job not found';
  end if;

  return v_row;
end;
$$;

create or replace function public.bct_admin_job_health_dashboard()
returns jsonb
language plpgsql
set search_path = public, auth, pg_temp
as $$
declare
  v_jobs jsonb;
  v_summary jsonb;
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;

  with health as (
    select
      j.id as job_id,
      j.project_id,
      j.job_number,
      j.title,
      j.trade,
      j.status as job_status,
      j.desired_start_date,
      p.project_number,
      p.workflow_status as project_status,
      p.completion_deadline,
      btrim(concat_ws(' ',cu.first_name,cu.last_name)) as customer_name,
      cu.phone as customer_phone,
      cu.email as customer_email,
      coalesce(nullif(ac.business_name,''),ac.legal_name,'Unassigned') as contractor_name,
      ac.id as contractor_id,
      se.starts_at as next_schedule_start,
      se.ends_at as next_schedule_end,
      se.title as next_schedule_title,
      se.status as next_schedule_status,
      coalesce(ms.total,0) as milestone_total,
      coalesce(ms.completed,0) as milestone_completed,
      case
        when coalesce(ms.total,0)>0 then round(100.0*ms.completed/ms.total)::int
        when j.status in ('completed','closed') then 100
        when j.status='in_progress' then 50
        when j.status='scheduled' then 35
        when j.status='awarded' then 25
        when j.status='bid_review' then 15
        when j.status='open_for_bids' then 10
        when j.status='draft' then 5
        else 0
      end as completion_percent,
      case when coalesce(ms.total,0)>0 then 'milestones' else 'job_status' end as completion_source,
      coalesce(w.delay_count,0) as weather_delay_count,
      w.latest_delay_date,
      w.latest_condition as weather_condition,
      w.latest_impact as weather_impact,
      coalesce(mat.total,0) as materials_total,
      coalesce(mat.pending,0) as materials_pending,
      coalesce(mat.return_attention,0) as material_returns_attention,
      coalesce(co.total,0) as change_orders_total,
      coalesce(co.pending,0) as change_orders_pending,
      coalesce(ap.total,0) as approvals_total,
      coalesce(ap.pending,0) as approvals_pending,
      fin.status as financing_status,
      fin.approved_amount as financing_approved_amount,
      esc.status as escrow_status,
      esc.amount as escrow_amount,
      esc.homeowner_approved_release,
      esc.bct_approved_release,
      coalesce(msg.total,0) as messages_total,
      coalesce(msg.unread,0) as messages_unread,
      coalesce(risk.critical_open,0) as critical_risks,
      coalesce(inc.critical_open,0) as critical_incidents,
      coalesce(q.critical_open,0) as critical_quality,
      coalesce(task.blocked_or_urgent,0) as urgent_tasks,
      case
        when coalesce(inc.critical_open,0)>0 or coalesce(risk.critical_open,0)>0 or coalesce(q.critical_open,0)>0
             or (p.completion_deadline is not null and p.completion_deadline < current_date and j.status not in ('completed','closed'))
             or (coalesce(fin.status,'not_started') in ('declined','cancelled') and j.status in ('awarded','scheduled','in_progress'))
          then 'critical'
        when j.status='on_hold'
             or coalesce(w.delay_count,0)>0
             or se.status='rescheduled'
             or (se.starts_at is not null and se.starts_at < now() and se.status in ('scheduled','confirmed'))
          then 'delayed'
        when (j.status in ('awarded','scheduled','in_progress') and ac.id is null)
             or coalesce(ap.pending,0)>0
             or coalesce(co.pending,0)>0
             or coalesce(mat.return_attention,0)>0
             or coalesce(task.blocked_or_urgent,0)>0
             or coalesce(msg.unread,0)>0
             or coalesce(fin.status,'not_started') in ('applied','pending')
             or coalesce(esc.status,'not_started') in ('pending','hold','release_pending')
          then 'needs_attention'
        else 'on_track'
      end as health_status,
      array_remove(array[
        case when coalesce(inc.critical_open,0)>0 then coalesce(inc.critical_open,0)||' unresolved critical incident(s)' end,
        case when coalesce(risk.critical_open,0)>0 then coalesce(risk.critical_open,0)||' critical project risk(s)' end,
        case when coalesce(q.critical_open,0)>0 then coalesce(q.critical_open,0)||' critical quality item(s)' end,
        case when p.completion_deadline is not null and p.completion_deadline < current_date and j.status not in ('completed','closed') then 'Project completion deadline is overdue' end,
        case when j.status='on_hold' then 'Job is on hold' end,
        case when j.status in ('awarded','scheduled','in_progress') and ac.id is null then 'No contractor assigned' end,
        case when coalesce(w.delay_count,0)>0 then coalesce(w.delay_count,0)||' weather delay/reschedule record(s)' end,
        case when se.status='rescheduled' then 'Next schedule event was rescheduled' end,
        case when se.starts_at is not null and se.starts_at < now() and se.status in ('scheduled','confirmed') then 'Scheduled event is overdue' end,
        case when coalesce(mat.pending,0)>0 then coalesce(mat.pending,0)||' material item(s) not installed/closed' end,
        case when coalesce(mat.return_attention,0)>0 then coalesce(mat.return_attention,0)||' material return(s) need attention' end,
        case when coalesce(co.pending,0)>0 then coalesce(co.pending,0)||' change order(s) awaiting resolution' end,
        case when coalesce(ap.pending,0)>0 then coalesce(ap.pending,0)||' approval(s) pending' end,
        case when coalesce(task.blocked_or_urgent,0)>0 then coalesce(task.blocked_or_urgent,0)||' urgent/blocked task(s)' end,
        case when coalesce(msg.unread,0)>0 then coalesce(msg.unread,0)||' unread project message(s)' end,
        case when coalesce(fin.status,'not_started') in ('applied','pending') then 'Financing is '||replace(fin.status,'_',' ') end,
        case when coalesce(fin.status,'not_started') in ('declined','cancelled') then 'Financing is '||replace(fin.status,'_',' ') end,
        case when coalesce(esc.status,'not_started') in ('pending','hold','release_pending') then 'Escrow is '||replace(esc.status,'_',' ') end
      ]::text[],null) as attention_items
    from public.bct_jobs j
    join public.bct_projects p on p.id=j.project_id
    left join public.bct_customers cu on cu.id=p.customer_id
    left join lateral (
      select c.* from public.bct_assignments a join public.bct_contractors c on c.id=a.contractor_id
      where a.job_id=j.id and a.status<>'cancelled' order by a.assigned_at desc limit 1
    ) ac on true
    left join lateral (
      select s.starts_at,s.ends_at,s.title,s.status from public.bct_schedule_events s
      where s.job_id=j.id and s.status not in ('completed','cancelled')
      order by case when s.starts_at>=now() then 0 else 1 end,s.starts_at asc limit 1
    ) se on true
    left join lateral (
      select count(*) filter(where status<>'cancelled')::numeric as total,
             count(*) filter(where status='completed')::numeric as completed
      from public.bct_project_milestones m where m.job_id=j.id
    ) ms on true
    left join lateral (
      select count(*) filter(where work_impact in ('delay','reschedule')) as delay_count,
             max(check_date) filter(where work_impact in ('delay','reschedule')) as latest_delay_date,
             (array_agg(condition_summary order by check_date desc) filter(where work_impact in ('delay','reschedule')))[1] as latest_condition,
             (array_agg(work_impact order by check_date desc) filter(where work_impact in ('delay','reschedule')))[1] as latest_impact
      from public.bct_weather_checks w where w.job_id=j.id
    ) w on true
    left join lateral (
      select count(*) as total,
             count(*) filter(where status not in ('installed','returned','cancelled')) as pending,
             count(*) filter(where return_status in ('needed','pending')) as return_attention
      from public.bct_job_materials m where m.job_id=j.id
    ) mat on true
    left join lateral (
      select count(*) as total,count(*) filter(where status in ('draft','sent')) as pending
      from public.bct_change_orders x where x.job_id=j.id
    ) co on true
    left join lateral (
      select count(*) as total,count(*) filter(where status='pending') as pending
      from public.bct_job_approvals a where a.job_id=j.id
    ) ap on true
    left join lateral (select f.* from public.bct_financing_records f where f.project_id=p.id order by f.created_at desc limit 1) fin on true
    left join lateral (select e.* from public.bct_escrow_records e where e.project_id=p.id order by e.created_at desc limit 1) esc on true
    left join lateral (
      select count(*) as total,count(*) filter(where m.audience in ('bct','all') and not exists(select 1 from public.bct_project_message_reads r where r.message_id=m.id and r.user_id=auth.uid())) as unread
      from public.bct_project_messages m where m.project_id=p.id
    ) msg on true
    left join lateral (select count(*) filter(where status in ('open','mitigating') and impact='critical') as critical_open from public.bct_project_risks r where r.job_id=j.id) risk on true
    left join lateral (select count(*) filter(where resolved_at is null and severity='critical') as critical_open from public.bct_incidents i where i.job_id=j.id) inc on true
    left join lateral (select count(*) filter(where status in ('open','correcting') and severity='critical') as critical_open from public.bct_quality_observations q where q.job_id=j.id) q on true
    left join lateral (select count(*) filter(where status='blocked' or (priority='urgent' and status not in ('completed','cancelled')) or (due_at<now() and status not in ('completed','cancelled'))) as blocked_or_urgent from public.bct_tasks t where t.job_id=j.id) task on true
    where j.status not in ('completed','closed')
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'job_id',job_id,'project_id',project_id,'job_number',job_number,'title',title,'trade',trade,
    'job_status',job_status,'project_number',project_number,'project_status',project_status,
    'customer',jsonb_build_object('name',customer_name,'phone',customer_phone,'email',customer_email),
    'contractor',jsonb_build_object('id',contractor_id,'name',contractor_name),
    'schedule',jsonb_build_object('desired_start_date',desired_start_date,'next_start',next_schedule_start,'next_end',next_schedule_end,'next_title',next_schedule_title,'next_status',next_schedule_status,'completion_deadline',completion_deadline),
    'completion_percent',completion_percent,'completion_source',completion_source,
    'weather',jsonb_build_object('delay_count',weather_delay_count,'latest_delay_date',latest_delay_date,'condition',weather_condition,'impact',weather_impact),
    'materials',jsonb_build_object('total',materials_total,'pending',materials_pending,'returns_need_attention',material_returns_attention),
    'change_orders',jsonb_build_object('total',change_orders_total,'pending',change_orders_pending),
    'approvals',jsonb_build_object('total',approvals_total,'pending',approvals_pending),
    'financing',jsonb_build_object('status',coalesce(financing_status,'not_started'),'approved_amount',financing_approved_amount),
    'escrow',jsonb_build_object('status',coalesce(escrow_status,'not_started'),'amount',escrow_amount,'homeowner_release_approved',coalesce(homeowner_approved_release,false),'bct_release_approved',coalesce(bct_approved_release,false)),
    'messages',jsonb_build_object('total',messages_total,'unread',messages_unread),
    'health_status',health_status,'attention_items',to_jsonb(attention_items)
  ) order by case health_status when 'critical' then 1 when 'delayed' then 2 when 'needs_attention' then 3 else 4 end,job_number),'[]'::jsonb)
  into v_jobs from health;

  select jsonb_build_object(
    'active_jobs',jsonb_array_length(v_jobs),
    'on_track',(select count(*) from jsonb_array_elements(v_jobs) x where x->>'health_status'='on_track'),
    'needs_attention',(select count(*) from jsonb_array_elements(v_jobs) x where x->>'health_status'='needs_attention'),
    'delayed',(select count(*) from jsonb_array_elements(v_jobs) x where x->>'health_status'='delayed'),
    'critical',(select count(*) from jsonb_array_elements(v_jobs) x where x->>'health_status'='critical')
  ) into v_summary;

  return jsonb_build_object('summary',v_summary,'jobs',v_jobs,'generated_at',now());
end;
$$;
