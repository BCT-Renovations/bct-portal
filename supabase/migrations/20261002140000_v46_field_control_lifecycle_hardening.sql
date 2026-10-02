-- V46 multi-control lifecycle hardening. Development only.
-- Reuses canonical checklist, delivery, utility, correction, dumpster and action-inbox systems.

create or replace function public.bct_admin_field_control_blockers(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(x),'[]'::jsonb) into v from (
  select jsonb_build_object('type','required_checklist','id',pc.id,'title',pc.title) x
  from public.bct_project_checklists pc
  where pc.project_id=p_project_id and (coalesce(pc.required_before_start,false) or coalesce(pc.blocks_closeout,false))
    and lower(coalesce(pc.status,'')) not in ('complete','completed','closed')
  union all
  select jsonb_build_object('type','utility_not_restored','id',u.id,'title',coalesce(u.utility_type,'utility'))
  from public.bct_utility_interruptions u where u.project_id=p_project_id and u.actual_shutoff_at is not null
    and (u.restored_at is null or not coalesce(u.safe_restoration_confirmed,false))
  union all
  select jsonb_build_object('type','failed_inspection_correction','id',c.id,'title',coalesce(c.correction,c.code_reference,'correction'))
  from public.bct_code_corrections c where c.project_id=p_project_id
    and lower(coalesce(c.clearance_status,c.status,'')) not in ('cleared','closed','complete','completed')
 ) s;
 return v;
end $$;
revoke all on function public.bct_admin_field_control_blockers(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_field_control_blockers(uuid) to authenticated;

create or replace function public.bct_refresh_field_logistics_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;x integer;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select d.project_id,'delivery_discrepancy','Delivery discrepancy requires review',d.delivered_at,'high','open',now()
 from public.bct_delivery_receipts d where nullif(btrim(coalesce(d.discrepancies,'')),'') is not null
 and not exists(select 1 from public.bct_action_inbox a where a.project_id=d.project_id and a.action_type='delivery_discrepancy' and a.status='open');
 get diagnostics x=row_count;n:=n+x;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select dp.project_id,'dumpster_expiration','Dumpster/permit expiration requires attention',dp.expires_at::timestamptz,
 case when dp.expires_at<current_date then 'critical' else 'high' end,'open',now()
 from public.bct_dumpster_permits dp where dp.expires_at<=current_date+3 and lower(coalesce(dp.status,'')) not in ('closed','complete','completed','removed')
 and not exists(select 1 from public.bct_action_inbox a where a.project_id=dp.project_id and a.action_type='dumpster_expiration' and a.status='open');
 get diagnostics x=row_count;n:=n+x;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_field_logistics_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_field_logistics_attention() to authenticated;
