-- Keep the public Roofing launch flag synchronized with the active service catalog.
create or replace function public.bct_frontend_public_bootstrap()
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
select jsonb_build_object(
 'services',coalesce((select jsonb_agg(to_jsonb(s) order by s.sort_order) from public.bct_active_services() s),'[]'::jsonb),
 'languages',coalesce((select jsonb_agg(to_jsonb(l) order by l.name) from public.bct_active_languages() l),'[]'::jsonb),
 'config',public.bct_platform_config(),
 'feature_flags',public.bct_frontend_feature_flags(),
 'homeowner_form',public.bct_homeowner_form_schema(),
 'contractor_form',public.bct_contractor_form_schema(),
 'form_rules',jsonb_build_object(
   'project_number_placeholder','BCT-YYYY-######',
   'application_number_placeholder','APP-YYYY-######',
   'job_number_placeholder','JOB-YYYY-######',
   'service_call_number_placeholder','SC-YYYY-######',
   'roofing_enabled',exists(select 1 from public.bct_service_catalog where code='roofing' and is_active),
   'minimum_contractor_references',5,
   'maximum_contractor_references',5,
   'supported_language_codes',(select coalesce(jsonb_agg(code order by code),'[]'::jsonb) from public.supported_languages where is_active),
   'service_codes',(select coalesce(jsonb_agg(code order by sort_order),'[]'::jsonb) from public.bct_service_catalog where is_active)
 )
);
$function$;
