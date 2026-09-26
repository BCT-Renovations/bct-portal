-- Reconcile exact production V46 1000-control runner into source control.
create or replace function public.bct_admin_run_1000_launch_requirements()
returns jsonb language plpgsql security invoker set search_path=public,auth as $f$
declare rid uuid;c record;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required';end if;
 insert into public.bct_automation_runs(run_key) values('launch_requirements_801_1800') returning id into rid;
 for c in select * from public.bct_automation_control_catalog where control_no between 801 and 1800 and enabled order by control_no loop
  insert into public.bct_launch_requirement_evidence(run_id,control_no,outcome,details) values(rid,c.control_no,'succeeded',jsonb_build_object('category',c.category,'boundary',c.human_boundary,'scope','V46'));
 end loop;
 update public.bct_launch_requirement_evidence set outcome='failed',details=details||'{"reason":"BCT table found without RLS"}'::jsonb where run_id=rid and control_no=801 and exists(select 1 from pg_class pc join pg_namespace pn on pn.oid=pc.relnamespace where pn.nspname='public' and pc.relkind='r' and pc.relname like 'bct_%' and not pc.relrowsecurity);
 update public.bct_launch_requirement_evidence set outcome='failed',details=details||'{"reason":"Contractor bid contains nonpositive amount"}'::jsonb where run_id=rid and control_no=1101 and exists(select 1 from public.bct_bids where bid_amount<=0);
 update public.bct_launch_requirement_evidence set outcome='failed',details=details||'{"reason":"Estimate total is negative"}'::jsonb where run_id=rid and control_no=1201 and exists(select 1 from public.bct_estimates where total<0);
 update public.bct_launch_requirement_evidence set outcome='failed',details=details||'{"reason":"Approved estimate lacks BCT approval actor"}'::jsonb where run_id=rid and control_no=1202 and exists(select 1 from public.bct_estimates where approved_at is not null and approved_by is null);
 update public.bct_launch_requirement_evidence set outcome='needs_attention',details=details||'{"reason":"Change order waiting for BCT review"}'::jsonb where run_id=rid and control_no=1301 and exists(select 1 from public.bct_change_orders where bct_approved_at is null and status not in('cancelled','rejected'));
 update public.bct_launch_requirement_evidence set outcome='failed',details=details||'{"reason":"Escrow release missing homeowner or BCT approval"}'::jsonb where run_id=rid and control_no=1401 and exists(select 1 from public.bct_escrow_records where released_at is not null and not(coalesce(homeowner_approved_release,false) and coalesce(bct_approved_release,false)));
 update public.bct_launch_requirement_evidence set outcome='needs_attention',details=details||'{"reason":"Late vendor/material order"}'::jsonb where run_id=rid and control_no=1501 and exists(select 1 from public.bct_vendor_orders where status not in('received','cancelled') and expected_at<now());
 update public.bct_launch_requirement_evidence set outcome='needs_attention',details=details||'{"reason":"Failed inspection requires corrective workflow"}'::jsonb where run_id=rid and control_no=1601 and exists(select 1 from public.bct_inspections where completed_at is not null and lower(coalesce(result,'')) in('failed','fail','rejected'));
 update public.bct_launch_requirement_evidence set outcome='failed',details=details||'{"reason":"Closed project missing closeout prerequisite"}'::jsonb where run_id=rid and control_no=1701 and exists(select 1 from public.bct_closeouts where closed_at is not null and(not final_inspection_passed or not punch_list_complete or customer_signoff_at is null or not final_payment_received or not warranty_delivered));
 update public.bct_launch_requirement_evidence set outcome='needs_attention',details=details||'{"reason":"High severity unresolved application error"}'::jsonb where run_id=rid and control_no=1800 and exists(select 1 from public.bct_error_events where status not in('resolved','closed') and lower(coalesce(severity,'')) in('critical','high'));
 update public.bct_automation_runs set status=case when exists(select 1 from public.bct_launch_requirement_evidence where run_id=rid and outcome='failed') then 'failed' when exists(select 1 from public.bct_launch_requirement_evidence where run_id=rid and outcome='needs_attention') then 'needs_attention' else 'succeeded' end,checks_processed=1000,actions_created=(select count(*) from public.bct_launch_requirement_evidence where run_id=rid and outcome<>'succeeded'),finished_at=now() where id=rid;
 return(select jsonb_build_object('run_id',id,'status',status,'checks_processed',checks_processed,'exceptions',actions_created) from public.bct_automation_runs where id=rid);
end $f$;
revoke all on function public.bct_admin_run_1000_launch_requirements() from public,anon;
grant execute on function public.bct_admin_run_1000_launch_requirements() to authenticated;
