-- BCT V46 gallery translation fields
-- Adds language-aware metadata without replacing existing gallery columns.
alter table public.bct_gallery_photos
  add column if not exists image_text text not null default '',
  add column if not exists image_text_translations jsonb not null default '{}'::jsonb,
  add column if not exists caption_translations jsonb not null default '{}'::jsonb,
  add column if not exists alt_text_translations jsonb not null default '{}'::jsonb,
  add column if not exists category_translations jsonb not null default '{}'::jsonb;

comment on column public.bct_gallery_photos.image_text is 'Source text visible inside the uploaded image, when present.';
comment on column public.bct_gallery_photos.image_text_translations is 'Language-code map for translated text rendered over the image.';
comment on column public.bct_gallery_photos.caption_translations is 'Language-code map for translated gallery captions.';
comment on column public.bct_gallery_photos.alt_text_translations is 'Language-code map for translated accessibility alt text.';
comment on column public.bct_gallery_photos.category_translations is 'Language-code map for translated gallery category labels.';

-- Seed the current public gallery's Spanish metadata so existing published photos
-- become translated immediately when the language selector is set to Spanish.
update public.bct_gallery_photos
set caption_translations = case
  when caption = 'Some more of our work!' then jsonb_build_object('es','¡Más de nuestro trabajo!')
  when caption = 'Dirty' then jsonb_build_object('es','Sucio')
  when caption = 'Really dirty! Time for BCT to do our thing!❤️❤️❤️' then jsonb_build_object('es','¡Muy sucio! ¡Es hora de que BCT haga lo suyo! ❤️❤️❤️')
  else coalesce(caption_translations,'{}'::jsonb)
end
where caption in ('Some more of our work!','Dirty','Really dirty! Time for BCT to do our thing!❤️❤️❤️');

update public.bct_gallery_photos
set category_translations = case category
  when 'Kitchen' then jsonb_build_object('es','Cocina')
  when 'Bathroom' then jsonb_build_object('es','Baño')
  when 'Gutters' then jsonb_build_object('es','Canaletas')
  when 'Siding' then jsonb_build_object('es','Revestimiento')
  when 'Roofing' then jsonb_build_object('es','Techos')
  when 'Decks' then jsonb_build_object('es','Terrazas')
  when 'Doors / Windows' then jsonb_build_object('es','Puertas / Ventanas')
  when 'Concrete' then jsonb_build_object('es','Concreto')
  when 'Interior' then jsonb_build_object('es','Interior')
  when 'Exterior' then jsonb_build_object('es','Exterior')
  when 'Before' then jsonb_build_object('es','Antes')
  when 'After' then jsonb_build_object('es','Después')
  when 'Other' then jsonb_build_object('es','Otro')
  else coalesce(category_translations,'{}'::jsonb)
end
where category is not null;