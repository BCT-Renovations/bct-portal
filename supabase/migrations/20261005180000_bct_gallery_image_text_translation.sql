-- BCT V46 gallery image-text translation layer.
alter table public.bct_gallery_photos
  add column if not exists image_text text not null default '',
  add column if not exists image_text_translations jsonb not null default '{}'::jsonb;
comment on column public.bct_gallery_photos.image_text is 'Source text visibly represented in the photo artwork, when applicable.';
comment on column public.bct_gallery_photos.image_text_translations is 'Language-code to translated image-text map.';
