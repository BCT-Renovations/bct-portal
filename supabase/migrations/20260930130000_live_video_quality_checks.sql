-- BCT V46: Live Video Quality Check / Live Project Verification
-- This is BCT quality-control workflow, not a municipal/code/permit inspection.

create table if not exists public.bct_live_quality_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.bct_projects(id) on delete cascade,
  job_id uuid not null references public.bct_jobs(id) on delete cascade,
  contractor_id uuid references public.bct_contractors(id) on delete set null,
  checkpoint_type text not null check (checkpoint_type in ('arrival_before_work','pre_cover_critical','progress','final')),
  status text not null default 'pending' check (status in ('pending','ready','in_progress','accepted','correction_required','recheck_required','cancelled')),
  instructions text,
  requested_for timestamptz,
  meeting_provider text,
  join_url text,
  contractor_notes text,
  admin_notes text,
  follow_up_requirements text,
  reviewer_name text,
  reviewer_user_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  recording_enabled boolean not null default false,
  recording_consent_note text,
  privacy_notice_acknowledged_at timestamptz,
  privacy_notice_acknowledged_by uuid,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bct_live_quality_checks_job_idx on public.bct_live_quality_checks(job_id, created_at desc);
create index if not exists bct_live_quality_checks_project_idx on public.bct_live_quality_checks(project_id, created_at desc);
create index if not exists bct_live_quality_checks_contractor_idx on public.bct_live_quality_checks(contractor_id, status, requested_for);

create table if not exists public.bct_live_quality_check_events (
  id uuid primary key default gen_random_uuid(),
  quality_check_id uuid not null references public.bct_live_quality_checks(id) on delete cascade,
  actor_user_id uuid,
  actor_role text not null,
  event_type text not null,
  old_status text,
  new_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists bct_live_quality_check_events_check_idx on public.bct_live_quality_check_events(quality_check_id, created_at desc);

alter table public.bct_live_quality_checks enable row level security;
alter table public.bct_live_quality_check_events enable row level security;

revoke all on public.bct_live_quality_checks from anon;
revoke all on public.bct_live_quality_check_events from anon;

grant select,insert,update,delete on public.bct_live_quality_checks to authenticated;
grant select on public.bct_live_quality_check_events to authenticated;

create policy "BCT live quality checks admin select" on public.bct_live_quality_checks
  for select to authenticated using ((select public.is_bct_admin()));
create policy "BCT live quality checks admin insert" on public.bct_live_quality_checks
  for insert to authenticated with check ((select public.is_bct_admin()));
create policy "BCT live quality checks admin update" on public.bct_live_quality_checks
  for update to authenticated using ((select public.is_bct_admin())) with check ((select public.is_bct_admin()));
create policy "BCT live quality checks admin delete" on public.bct_live_quality_checks
  for delete to authenticated using ((select public.is_bct_admin()));
create policy "BCT live quality check events admin select" on public.bct_live_quality_check_events
  for select to authenticated using ((select public.is_bct_admin()));

create or replace function public.bct_live_quality_check_audit()
returns trigger
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
declare
  v_role text;
  v_event text;
begin
  v_role := case when public.is_bct_admin() then 'admin' else 'authenticated_user' end;
  if tg_op='INSERT' then
    v_event := 'created';
    insert into public.bct_live_quality_check_events(quality_check_id,actor_user_id,actor_role,event_type,new_status)
    values(new.id,auth.uid(),v_role,v_event,new.status);
    return new;
  end if;
  v_event := case when old.status is distinct from new.status then 'status_changed' else 'updated' end;
  insert into public.bct_live_quality_check_events(quality_check_id,actor_user_id,actor_role,event_type,old_status,new_status)
  values(new.id,auth.uid(),v_role,v_event,old.status,new.status);
  return new;
end
$$;

drop trigger if exists bct_live_quality_check_audit_trigger on public.bct_live_quality_checks;
create trigger bct_live_quality_check_audit_trigger
after insert or update on public.bct_live_quality_checks
for each row execute function public.bct_live_quality_check_audit();

create or replace function public.bct_admin_create_live_quality_check(
  p_project_id uuid,
  p_job_id uuid,
  p_contractor_id uuid,
  p_checkpoint_type text,
  p_requested_for timestamptz,
  p_instructions text,
  p_join_url text,
  p_meeting_provider text,
  p_admin_notes text
) returns uuid
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
declare
  v_id uuid;
  v_contractor uuid;
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  if p_checkpoint_type not in ('arrival_before_work','pre_cover_critical','progress','final') then raise exception 'Invalid checkpoint type'; end if;
  if not exists(select 1 from public.bct_jobs j where j.id=p_job_id and j.project_id=p_project_id) then raise exception 'Job does not belong to project'; end if;

  v_contractor := p_contractor_id;
  if v_contractor is null then
    select a.contractor_id into v_contractor
      from public.bct_assignments a
      where a.job_id=p_job_id and a.status not in ('cancelled','completed')
      order by a.assigned_at desc limit 1;
  end if;
  if v_contractor is not null and not exists(
    select 1 from public.bct_assignments a
    where a.job_id=p_job_id and a.contractor_id=v_contractor and a.status not in ('cancelled','completed')
  ) then raise exception 'Contractor is not actively assigned to this job'; end if;

  insert into public.bct_live_quality_checks(
    project_id,job_id,contractor_id,checkpoint_type,requested_for,instructions,join_url,meeting_provider,admin_notes,created_by
  ) values (
    p_project_id,p_job_id,v_contractor,p_checkpoint_type,p_requested_for,nullif(btrim(p_instructions),''),nullif(btrim(p_join_url),''),nullif(btrim(p_meeting_provider),''),nullif(btrim(p_admin_notes),''),auth.uid()
  ) returning id into v_id;
  return v_id;
end
$$;

create or replace function public.bct_admin_update_live_quality_check(
  p_id uuid,
  p_requested_for timestamptz,
  p_instructions text,
  p_join_url text,
  p_meeting_provider text,
  p_admin_notes text,
  p_follow_up_requirements text,
  p_recording_enabled boolean,
  p_recording_consent_note text
) returns uuid
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  update public.bct_live_quality_checks set
    requested_for=p_requested_for,
    instructions=nullif(btrim(p_instructions),''),
    join_url=nullif(btrim(p_join_url),''),
    meeting_provider=nullif(btrim(p_meeting_provider),''),
    admin_notes=nullif(btrim(p_admin_notes),''),
    follow_up_requirements=nullif(btrim(p_follow_up_requirements),''),
    recording_enabled=coalesce(p_recording_enabled,false),
    recording_consent_note=case when coalesce(p_recording_enabled,false) then nullif(btrim(p_recording_consent_note),'') else null end,
    updated_at=now()
  where id=p_id;
  if not found then raise exception 'Quality check not found'; end if;
  return p_id;
end
$$;

create or replace function public.bct_admin_set_live_quality_check_status(
  p_id uuid,
  p_status text,
  p_reviewer_name text,
  p_admin_notes text,
  p_follow_up_requirements text
) returns uuid
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  if p_status not in ('pending','ready','in_progress','accepted','correction_required','recheck_required','cancelled') then raise exception 'Invalid quality check status'; end if;
  update public.bct_live_quality_checks set
    status=p_status,
    reviewer_name=coalesce(nullif(btrim(p_reviewer_name),''),reviewer_name),
    reviewer_user_id=case when p_status in ('accepted','correction_required','recheck_required') then auth.uid() else reviewer_user_id end,
    admin_notes=coalesce(nullif(btrim(p_admin_notes),''),admin_notes),
    follow_up_requirements=coalesce(nullif(btrim(p_follow_up_requirements),''),follow_up_requirements),
    started_at=case when p_status='in_progress' then coalesce(started_at,now()) else started_at end,
    completed_at=case when p_status in ('accepted','correction_required','recheck_required') then now() when p_status in ('pending','ready','in_progress') then null else completed_at end,
    reviewed_at=case when p_status in ('accepted','correction_required','recheck_required') then now() else reviewed_at end,
    updated_at=now()
  where id=p_id;
  if not found then raise exception 'Quality check not found'; end if;
  return p_id;
end
$$;

create or replace function public.bct_admin_ack_live_quality_privacy(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  update public.bct_live_quality_checks set privacy_notice_acknowledged_at=now(),privacy_notice_acknowledged_by=auth.uid(),updated_at=now() where id=p_id;
  if not found then raise exception 'Quality check not found'; end if;
  return p_id;
end
$$;

create or replace function public.bct_admin_live_quality_checks(p_job_id uuid default null)
returns jsonb
language sql
stable
security definer
set search_path='public','auth','pg_temp'
as $$
  select case when public.is_bct_admin() then coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'project_id',q.project_id,'job_id',q.job_id,'job_number',j.job_number,'job_title',j.title,
    'contractor_id',q.contractor_id,'contractor_name',coalesce(nullif(c.business_name,''),c.legal_name,'Unassigned'),
    'checkpoint_type',q.checkpoint_type,'status',q.status,'instructions',q.instructions,'requested_for',q.requested_for,
    'meeting_provider',q.meeting_provider,'join_url',q.join_url,'contractor_notes',q.contractor_notes,'admin_notes',q.admin_notes,
    'follow_up_requirements',q.follow_up_requirements,'reviewer_name',q.reviewer_name,'started_at',q.started_at,
    'completed_at',q.completed_at,'reviewed_at',q.reviewed_at,'recording_enabled',q.recording_enabled,
    'recording_consent_note',q.recording_consent_note,'privacy_notice_acknowledged_at',q.privacy_notice_acknowledged_at,
    'created_at',q.created_at,'updated_at',q.updated_at
  ) order by q.created_at desc),'[]'::jsonb) else '[]'::jsonb end
  from public.bct_live_quality_checks q
  join public.bct_jobs j on j.id=q.job_id
  left join public.bct_contractors c on c.id=q.contractor_id
  where p_job_id is null or q.job_id=p_job_id
$$;

create or replace function public.bct_admin_live_quality_health()
returns jsonb
language sql
stable
security definer
set search_path='public','auth','pg_temp'
as $$
  select case when public.is_bct_admin() then coalesce(jsonb_agg(to_jsonb(x) order by x.job_number),'[]'::jsonb) else '[]'::jsonb end
  from (
    select j.id job_id,j.job_number,
      count(q.id) filter(where q.status<>'cancelled') total_checks,
      count(q.id) filter(where q.status in ('pending','ready','in_progress')) open_checks,
      count(q.id) filter(where q.status in ('correction_required','recheck_required')) attention_checks,
      (array_agg(q.status order by q.created_at desc) filter(where q.id is not null))[1] latest_status,
      (array_agg(q.checkpoint_type order by q.created_at desc) filter(where q.id is not null))[1] latest_checkpoint
    from public.bct_jobs j
    left join public.bct_live_quality_checks q on q.job_id=j.id
    group by j.id,j.job_number
  ) x
$$;

create or replace function public.bct_contractor_live_quality_checks()
returns jsonb
language sql
stable
security definer
set search_path='public','auth','pg_temp'
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'job_id',q.job_id,'job_number',j.job_number,'job_title',j.title,'checkpoint_type',q.checkpoint_type,
    'status',q.status,'instructions',q.instructions,'requested_for',q.requested_for,'meeting_provider',q.meeting_provider,
    'join_url',q.join_url,'contractor_notes',q.contractor_notes,'follow_up_requirements',q.follow_up_requirements,
    'recording_enabled',q.recording_enabled,'privacy_notice_acknowledged_at',q.privacy_notice_acknowledged_at,'updated_at',q.updated_at
  ) order by q.requested_for nulls last,q.created_at desc),'[]'::jsonb)
  from public.bct_live_quality_checks q
  join public.bct_jobs j on j.id=q.job_id
  join public.bct_contractors c on c.id=q.contractor_id and c.auth_user_id=auth.uid()
  where exists(select 1 from public.bct_assignments a where a.job_id=q.job_id and a.contractor_id=c.id and a.status not in ('cancelled','completed'))
$$;

create or replace function public.bct_contractor_update_live_quality_check(p_id uuid,p_status text,p_contractor_notes text)
returns uuid
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
declare v_current text;
begin
  if p_status not in ('ready','in_progress') then raise exception 'Contractor may only mark a quality check Ready or In Progress'; end if;
  select q.status into v_current
  from public.bct_live_quality_checks q
  join public.bct_contractors c on c.id=q.contractor_id and c.auth_user_id=auth.uid()
  where q.id=p_id and exists(select 1 from public.bct_assignments a where a.job_id=q.job_id and a.contractor_id=c.id and a.status not in ('cancelled','completed'));
  if v_current is null then raise exception 'Assigned quality check not found' using errcode='42501'; end if;
  if v_current not in ('pending','ready','recheck_required','in_progress') then raise exception 'This quality check is not available for contractor status changes'; end if;
  update public.bct_live_quality_checks set
    status=p_status,
    contractor_notes=coalesce(nullif(btrim(p_contractor_notes),''),contractor_notes),
    started_at=case when p_status='in_progress' then coalesce(started_at,now()) else started_at end,
    updated_at=now()
  where id=p_id;
  return p_id;
end
$$;

create or replace function public.bct_homeowner_live_quality_checks(p_project_id uuid)
returns jsonb
language sql
stable
security definer
set search_path='public','auth','pg_temp'
as $$
  select case when public.bct_user_owns_project(p_project_id) then coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'project_id',q.project_id,'job_number',j.job_number,
    'label','BCT Live Project Verification',
    'checkpoint',case q.checkpoint_type when 'arrival_before_work' then 'Arrival / Before Work' when 'pre_cover_critical' then 'Pre-Cover / Critical Work' when 'progress' then 'Progress Check' when 'final' then 'Final BCT Quality Check' else 'BCT Quality Review' end,
    'status',case q.status when 'pending' then 'Scheduled' when 'ready' then 'Scheduled' when 'in_progress' then 'In Progress' when 'accepted' then case when q.checkpoint_type='final' then 'Final Review Complete' else 'Completed' end when 'correction_required' then 'Correction in Progress' when 'recheck_required' then 'Correction in Progress' when 'cancelled' then 'Cancelled' else 'Scheduled' end,
    'requested_for',q.requested_for,'updated_at',q.updated_at
  ) order by q.created_at desc),'[]'::jsonb) else '[]'::jsonb end
  from public.bct_live_quality_checks q
  join public.bct_jobs j on j.id=q.job_id
  where q.project_id=p_project_id and q.status<>'cancelled'
$$;

revoke all on function public.bct_admin_create_live_quality_check(uuid,uuid,uuid,text,timestamptz,text,text,text,text) from public,anon;
revoke all on function public.bct_admin_update_live_quality_check(uuid,timestamptz,text,text,text,text,text,boolean,text) from public,anon;
revoke all on function public.bct_admin_set_live_quality_check_status(uuid,text,text,text,text) from public,anon;
revoke all on function public.bct_admin_ack_live_quality_privacy(uuid) from public,anon;
revoke all on function public.bct_admin_live_quality_checks(uuid) from public,anon;
revoke all on function public.bct_admin_live_quality_health() from public,anon;
revoke all on function public.bct_contractor_live_quality_checks() from public,anon;
revoke all on function public.bct_contractor_update_live_quality_check(uuid,text,text) from public,anon;
revoke all on function public.bct_homeowner_live_quality_checks(uuid) from public,anon;

grant execute on function public.bct_admin_create_live_quality_check(uuid,uuid,uuid,text,timestamptz,text,text,text,text) to authenticated;
grant execute on function public.bct_admin_update_live_quality_check(uuid,timestamptz,text,text,text,text,text,boolean,text) to authenticated;
grant execute on function public.bct_admin_set_live_quality_check_status(uuid,text,text,text,text) to authenticated;
grant execute on function public.bct_admin_ack_live_quality_privacy(uuid) to authenticated;
grant execute on function public.bct_admin_live_quality_checks(uuid) to authenticated;
grant execute on function public.bct_admin_live_quality_health() to authenticated;
grant execute on function public.bct_contractor_live_quality_checks() to authenticated;
grant execute on function public.bct_contractor_update_live_quality_check(uuid,text,text) to authenticated;
grant execute on function public.bct_homeowner_live_quality_checks(uuid) to authenticated;

comment on table public.bct_live_quality_checks is 'BCT internal live video quality-control checkpoints. Not a municipal/code/permit inspection.';
