-- BCT Admin-only read model for safety cadence and training-module configuration.
create or replace function public.bct_admin_safety_configuration_state()
returns jsonb language plpgsql security invoker set search_path=public,auth as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 return jsonb_build_object(
  'settings',coalesce((select to_jsonb(s) from public.bct_safety_training_settings s where s.singleton),'{}'::jsonb),
  'modules',coalesce((select jsonb_agg(to_jsonb(m) order by m.active desc,m.module_type,m.title) from public.bct_safety_training_modules m),'[]'::jsonb)
 );
end $$;
revoke all on function public.bct_admin_safety_configuration_state() from public,anon;
grant execute on function public.bct_admin_safety_configuration_state() to authenticated;
