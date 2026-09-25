-- Expose only the public portal bootstrap payload through a hardened RPC.
-- The underlying launch controls and security settings remain private.
CREATE OR REPLACE FUNCTION public.bct_frontend_public_bootstrap()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
   'roofing_enabled',false,
   'minimum_contractor_references',5,
   'maximum_contractor_references',5,
   'supported_language_codes',(select coalesce(jsonb_agg(code order by code),'[]'::jsonb) from public.supported_languages where is_active),
   'service_codes',(select coalesce(jsonb_agg(code order by sort_order),'[]'::jsonb) from public.bct_service_catalog where is_active)
 )
);
$function$;

REVOKE ALL ON FUNCTION public.bct_frontend_public_bootstrap() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bct_frontend_public_bootstrap() TO anon, authenticated;
