-- Roofing is a supported BCT service and must be present in the live catalog.
insert into public.bct_service_catalog(code,display_name,category,is_active,sort_order)
values ('roofing','Roofing','exterior',true,15)
on conflict (code) do update set
  display_name=excluded.display_name,
  category=excluded.category,
  is_active=true,
  sort_order=excluded.sort_order,
  updated_at=now();

insert into public.bct_service_translations(service_code,language_code,display_name)
values
  ('roofing','en','Roofing'),
  ('roofing','es','Techos'),
  ('roofing','fr','Toiture'),
  ('roofing','ht','Twati'),
  ('roofing','pt','Cobertura'),
  ('roofing','vi','Mái nhà'),
  ('roofing','zh','屋顶'),
  ('roofing','ar','الأسقف'),
  ('roofing','ru','Кровля')
on conflict (service_code,language_code) do update set
  display_name=excluded.display_name;
