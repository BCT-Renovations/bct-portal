-- Launch hardening: notification queue lookup and uploaded-file metadata integrity.
create index if not exists bct_notifications_recipient_unread_idx on public.bct_notifications(recipient_user_id,created_at desc) where read_at is null;
create index if not exists bct_notifications_delivery_queue_idx on public.bct_notifications(status,created_at) where status in ('queued','pending','failed');
create index if not exists bct_project_files_project_created_idx on public.bct_project_files(project_id,created_at desc);
create index if not exists bct_project_photos_project_created_idx on public.bct_project_photos(project_id,created_at desc);
alter table public.bct_project_files drop constraint if exists bct_project_files_file_size_positive;
alter table public.bct_project_files add constraint bct_project_files_file_size_positive check(file_size is null or file_size>0) not valid;
alter table public.bct_project_files validate constraint bct_project_files_file_size_positive;
alter table public.bct_project_files drop constraint if exists bct_project_files_storage_path_nonblank;
alter table public.bct_project_files add constraint bct_project_files_storage_path_nonblank check(nullif(btrim(storage_path),'') is not null) not valid;
alter table public.bct_project_files validate constraint bct_project_files_storage_path_nonblank;
alter table public.bct_project_photos drop constraint if exists bct_project_photos_storage_path_nonblank;
alter table public.bct_project_photos add constraint bct_project_photos_storage_path_nonblank check(nullif(btrim(storage_path),'') is not null) not valid;
alter table public.bct_project_photos validate constraint bct_project_photos_storage_path_nonblank;
