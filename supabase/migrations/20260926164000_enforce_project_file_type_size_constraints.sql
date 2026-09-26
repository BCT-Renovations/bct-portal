-- Database backstop for project upload type/size limits.
alter table public.bct_project_files drop constraint if exists bct_project_file_type_size_ck;
alter table public.bct_project_files add constraint bct_project_file_type_size_ck check (
 file_size is null or (
   file_size>=0 and (
     (mime_type in ('video/mp4','video/quicktime') and file_size<=104857600)
     or
     (coalesce(mime_type,'') not in ('video/mp4','video/quicktime') and file_size<=26214400)
   )
 )
) not valid;
alter table public.bct_project_files validate constraint bct_project_file_type_size_ck;
alter table public.bct_project_files drop constraint if exists bct_project_file_mime_ck;
alter table public.bct_project_files add constraint bct_project_file_mime_ck check (
 mime_type is null or mime_type in ('image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf','video/mp4','video/quicktime')
) not valid;
alter table public.bct_project_files validate constraint bct_project_file_mime_ck;
