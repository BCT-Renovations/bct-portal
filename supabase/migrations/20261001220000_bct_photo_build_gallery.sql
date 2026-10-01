-- BCT PHOTO BUILD: secure gallery library and public published-photo contract.
-- Repository migration only until deployment gate approves live application.
create table if not exists public.bct_gallery_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  thumbnail_path text,
  caption text not null default '',
  alt_text text not null default '',
  category text not null default 'Other',
  project_work_date date not null,
  is_published boolean not null default false,
  show_on_home boolean not null default false,
  home_order smallint,
  gallery_order integer not null default 0,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bct_gallery_home_order_range check (home_order is null or home_order between 1 and 30),
  constraint bct_gallery_home_requires_publish check (not show_on_home or is_published),
  constraint bct_gallery_home_requires_order check ((show_on_home and home_order is not null) or (not show_on_home and home_order is null)),
  constraint bct_gallery_category_nonempty check (length(btrim(category)) > 0)
);
create unique index if not exists bct_gallery_unique_home_order
  on public.bct_gallery_photos(home_order) where show_on_home and is_published;
create index if not exists bct_gallery_public_page_idx
  on public.bct_gallery_photos(is_published, category, gallery_order, project_work_date desc);
create index if not exists bct_gallery_home_idx
  on public.bct_gallery_photos(show_on_home, is_published, home_order)
  where show_on_home and is_published;

alter table public.bct_gallery_photos enable row level security;
revoke all on table public.bct_gallery_photos from anon, authenticated;
grant select on table public.bct_gallery_photos to anon, authenticated;
grant insert, update, delete on table public.bct_gallery_photos to authenticated;

drop policy if exists "Public reads published BCT gallery photos" on public.bct_gallery_photos;
create policy "Public reads published BCT gallery photos"
on public.bct_gallery_photos for select to anon, authenticated
using (is_published = true);

drop policy if exists "BCT admins manage gallery photos" on public.bct_gallery_photos;
create policy "BCT admins manage gallery photos"
on public.bct_gallery_photos for all to authenticated
using ((select public.is_bct_admin()))
with check ((select public.is_bct_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('bct-gallery','bct-gallery',false,15728640,array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Public reads BCT gallery objects" on storage.objects;
create policy "Public reads BCT gallery objects"
on storage.objects for select to public
using (
  bucket_id='bct-gallery'
  and exists (
    select 1 from public.bct_gallery_photos p
    where p.is_published
      and (p.storage_path=storage.objects.name or p.thumbnail_path=storage.objects.name)
  )
);

drop policy if exists "BCT admins manage gallery objects" on storage.objects;
create policy "BCT admins manage gallery objects"
on storage.objects for all to authenticated
using (bucket_id='bct-gallery' and (select public.is_bct_admin()))
with check (bucket_id='bct-gallery' and (select public.is_bct_admin()));

create or replace function public.bct_gallery_enforce_limits()
returns trigger language plpgsql set search_path=public as $
begin
  -- Serialize limit checks so concurrent Admin uploads cannot race past the 1,000/30 caps.
  perform pg_advisory_xact_lock(hashtextextended('bct_gallery_limits',0));
  if tg_op='INSERT' and (select count(*) from public.bct_gallery_photos) >= 1000 then
    raise exception 'BCT gallery library is limited to 1,000 photos';
  end if;
  if new.show_on_home and new.is_published then
    if (select count(*) from public.bct_gallery_photos
        where show_on_home and is_published and id <> new.id) >= 30 then
      raise exception 'BCT front-page gallery is limited to 30 published photos';
    end if;
  end if;
  new.updated_at=now();
  return new;
end $$;
revoke execute on function public.bct_gallery_enforce_limits() from public, anon, authenticated;

drop trigger if exists bct_gallery_enforce_home_limit_trigger on public.bct_gallery_photos;
create trigger bct_gallery_enforce_home_limit_trigger
before insert or update on public.bct_gallery_photos
for each row execute function public.bct_gallery_enforce_limits();
