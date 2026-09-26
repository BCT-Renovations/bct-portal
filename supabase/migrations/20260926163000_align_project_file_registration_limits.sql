-- Keep metadata registration aligned with private bucket enforcement.
create or replace function public.bct_register_project_file(p_project_id uuid,p_storage_path text,p_original_filename text default null,p_mime_type text default null,p_file_size bigint default null)
returns public.bct_project_files language plpgsql security invoker set search_path=public,auth,storage as $$
declare v_uid uuid:=auth.uid();v_row public.bct_project_files;v_existing public.bct_project_files;v_obj storage.objects;
begin
 if v_uid is null then raise exception 'Authentication required';end if;
 if not exists(select 1 from public.bct_projects p join public.bct_customers c on c.id=p.customer_id where p.id=p_project_id and c.auth_user_id=v_uid) then raise exception 'Project not owned by current user';end if;
 if p_storage_path is null or btrim(p_storage_path)='' or split_part(p_storage_path,'/',1)<>v_uid::text then raise exception 'Storage path must be inside current user folder';end if;
 if split_part(p_storage_path,'/',2)<>p_project_id::text then raise exception 'Storage path must be inside the current BCT project folder';end if;
 if p_file_size is not null and (p_file_size<0 or p_file_size>26214400) then raise exception 'File size exceeds BCT 25 MB project-file limit';end if;
 if p_mime_type is not null and p_mime_type not in ('image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf','video/mp4','video/quicktime') then raise exception 'Unsupported project file type';end if;
 select * into v_obj from storage.objects o where o.bucket_id='bct-project-files' and o.name=btrim(p_storage_path);
 if v_obj.id is null then raise exception 'Project file must be uploaded to BCT private storage before metadata is registered';end if;
 if p_file_size is not null and v_obj.metadata ? 'size' and (v_obj.metadata->>'size')::bigint<>p_file_size then raise exception 'Uploaded file size does not match registration metadata';end if;
 select * into v_existing from public.bct_project_files where storage_path=btrim(p_storage_path) limit 1;
 if v_existing.id is not null then if v_existing.project_id<>p_project_id or v_existing.uploaded_by is distinct from v_uid then raise exception 'Storage object is already registered to another BCT project or user';end if;return v_existing;end if;
 insert into public.bct_project_files(project_id,storage_path,original_filename,mime_type,file_size,uploaded_by) values(p_project_id,btrim(p_storage_path),nullif(btrim(p_original_filename),''),p_mime_type,p_file_size,v_uid) returning * into v_row;return v_row;
end $$;
revoke all on function public.bct_register_project_file(uuid,text,text,text,bigint) from public,anon;
grant execute on function public.bct_register_project_file(uuid,text,text,text,bigint) to authenticated;
