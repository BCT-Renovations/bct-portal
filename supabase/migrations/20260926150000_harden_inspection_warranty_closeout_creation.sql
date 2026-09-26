-- Harden project relationship and required-field checks for inspections, warranties and closeout.
create or replace function public.bct_admin_create_inspection(p_project_id uuid,p_job_id uuid,p_inspection_type text,p_scheduled_for timestamptz,p_inspector_name text,p_notes text)
returns uuid language plpgsql set search_path=public,pg_temp as $f$
declare v_id uuid;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 if not exists(select 1 from public.bct_projects where id=p_project_id) then raise exception 'Project not found'; end if;
 if p_job_id is not null and not exists(select 1 from public.bct_jobs where id=p_job_id and project_id=p_project_id) then raise exception 'Job does not belong to project'; end if;
 if nullif(btrim(p_inspection_type),'') is null then raise exception 'Inspection type is required'; end if;
 insert into public.bct_inspections(project_id,job_id,inspection_type,scheduled_for,inspector_name,notes)
 values(p_project_id,p_job_id,btrim(p_inspection_type),p_scheduled_for,nullif(btrim(p_inspector_name),''),nullif(btrim(p_notes),'')) returning id into v_id;
 return v_id;
end $f$;

create or replace function public.bct_admin_create_warranty(p_project_id uuid,p_job_id uuid,p_warranty_type text,p_provider text,p_starts_on date,p_expires_on date,p_terms text)
returns public.bct_warranties language plpgsql set search_path=public as $f$
declare v public.bct_warranties;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 if not exists(select 1 from public.bct_projects where id=p_project_id) then raise exception 'Project not found'; end if;
 if p_job_id is not null and not exists(select 1 from public.bct_jobs where id=p_job_id and project_id=p_project_id) then raise exception 'Job does not belong to project'; end if;
 if nullif(btrim(p_warranty_type),'') is null then raise exception 'Warranty type is required'; end if;
 if p_starts_on is null then raise exception 'Warranty start date is required'; end if;
 if p_expires_on is not null and p_expires_on<p_starts_on then raise exception 'Warranty expiration cannot be before start date'; end if;
 insert into public.bct_warranties(project_id,job_id,warranty_type,provider,starts_on,expires_on,terms,status)
 values(p_project_id,p_job_id,btrim(p_warranty_type),nullif(btrim(p_provider),''),p_starts_on,p_expires_on,nullif(btrim(p_terms),''),'active') returning * into v;
 return v;
end $f$;

create or replace function public.bct_admin_add_closeout_item(p_project_id uuid,p_item_type text,p_description text,p_required boolean default true,p_notes text default null)
returns public.bct_closeout_items language plpgsql set search_path=public as $f$
declare v public.bct_closeout_items;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 if not exists(select 1 from public.bct_projects where id=p_project_id) then raise exception 'Project not found'; end if;
 if p_item_type not in ('final_inspection','punch_list','photos','warranty','manuals','payment','lien_waiver','customer_signoff','cleanup','other') then raise exception 'Invalid closeout item type'; end if;
 if nullif(btrim(p_description),'') is null then raise exception 'Closeout description is required'; end if;
 insert into public.bct_closeout_items(project_id,item_type,description,required,notes)
 values(p_project_id,p_item_type,btrim(p_description),coalesce(p_required,true),nullif(btrim(p_notes),'')) returning * into v;
 return v;
end $f$;
