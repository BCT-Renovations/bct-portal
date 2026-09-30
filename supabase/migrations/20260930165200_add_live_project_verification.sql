alter table public.bct_inspections
  add column if not exists verification_mode text not null default 'standard',
  add column if not exists verification_checkpoint text,
  add column if not exists video_join_url text,
  add column if not exists started_at timestamptz;

alter table public.bct_inspections drop constraint if exists bct_inspection_result;
alter table public.bct_inspections add constraint bct_inspection_result
  check (result = any (array['pending'::text,'passed'::text,'failed'::text,'needs_correction'::text,'recheck_required'::text,'cancelled'::text]));

alter table public.bct_inspections drop constraint if exists bct_inspection_verification_mode;
alter table public.bct_inspections add constraint bct_inspection_verification_mode
  check (verification_mode in ('standard','live_video'));

alter table public.bct_inspections drop constraint if exists bct_inspection_verification_checkpoint;
alter table public.bct_inspections add constraint bct_inspection_verification_checkpoint
  check (verification_checkpoint is null or verification_checkpoint in ('arrival','pre_cover','progress','final'));

alter table public.bct_inspections drop constraint if exists bct_inspection_video_url_https;
alter table public.bct_inspections add constraint bct_inspection_video_url_https
  check (video_join_url is null or video_join_url ~* '^https://');

create or replace function public.bct_admin_create_live_verification(
  p_project_id uuid,
  p_job_id uuid,
  p_checkpoint text,
  p_scheduled_for timestamptz,
  p_video_join_url text,
  p_notes text
) returns uuid
language plpgsql
set search_path to 'public','auth','pg_temp'
as $$
declare v_id uuid;
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  if not exists(select 1 from public.bct_projects where id=p_project_id) then raise exception 'Project not found'; end if;
  if p_job_id is not null and not exists(select 1 from public.bct_jobs where id=p_job_id and project_id=p_project_id) then raise exception 'Job does not belong to project'; end if;
  if p_checkpoint not in ('arrival','pre_cover','progress','final') then raise exception 'Unsupported live verification checkpoint'; end if;
  if nullif(btrim(coalesce(p_video_join_url,'')),'') is not null and btrim(p_video_join_url) !~* '^https://' then raise exception 'Live video link must use https'; end if;

  insert into public.bct_inspections(
    project_id,job_id,inspection_type,scheduled_for,result,inspector_name,notes,
    verification_mode,verification_checkpoint,video_join_url
  ) values (
    p_project_id,p_job_id,'BCT Live Project Verification',p_scheduled_for,'pending','BCT Renovations',
    nullif(btrim(p_notes),''),'live_video',p_checkpoint,nullif(btrim(p_video_join_url),'')
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.bct_admin_update_live_verification(
  p_id uuid,
  p_result text,
  p_video_join_url text,
  p_notes text,
  p_mark_started boolean default false
) returns uuid
language plpgsql
set search_path to 'public','auth','pg_temp'
as $$
begin
  if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
  if p_result is not null and p_result not in ('pending','passed','failed','needs_correction','recheck_required','cancelled') then raise exception 'Unsupported verification result'; end if;
  if nullif(btrim(coalesce(p_video_join_url,'')),'') is not null and btrim(p_video_join_url) !~* '^https://' then raise exception 'Live video link must use https'; end if;

  update public.bct_inspections
     set result=coalesce(p_result,result),
         video_join_url=case when p_video_join_url is null then video_join_url else nullif(btrim(p_video_join_url),'') end,
         notes=case when p_notes is null then notes else nullif(btrim(p_notes),'') end,
         started_at=case when coalesce(p_mark_started,false) then coalesce(started_at,now()) else started_at end,
         completed_at=case when coalesce(p_result,result) in ('passed','failed','cancelled') then coalesce(completed_at,now()) else null end,
         updated_at=now()
   where id=p_id and verification_mode='live_video';
  if not found then raise exception 'Live verification not found'; end if;
  return p_id;
end;
$$;

revoke all on function public.bct_admin_create_live_verification(uuid,uuid,text,timestamptz,text,text) from public, anon;
grant execute on function public.bct_admin_create_live_verification(uuid,uuid,text,timestamptz,text,text) to authenticated;
revoke all on function public.bct_admin_update_live_verification(uuid,text,text,text,boolean) from public, anon;
grant execute on function public.bct_admin_update_live_verification(uuid,text,text,text,boolean) to authenticated;
