-- Source parity for production migration bct_admin_safety_state_rpc.
create or replace function public.bct_frontend_admin_safety_state()
returns jsonb language sql stable security invoker set search_path=public,auth as $f$
select case when public.is_bct_admin() then jsonb_build_object(
 'summary',public.bct_admin_safety_compliance_summary(),
 'contractors',coalesce((select jsonb_agg(to_jsonb(x) order by x.overdue_count desc,x.legal_name)
 from public.bct_admin_safety_training_dashboard() x),'[]'::jsonb)
) else null end
$f$;
revoke all on function public.bct_frontend_admin_safety_state() from public,anon,authenticated;
grant execute on function public.bct_frontend_admin_safety_state() to authenticated;
