-- V46 controlled trade-to-trade scope handoff. Development only.
-- Extends canonical work packages/dependencies; BCT retains control.

create or replace function public.bct_admin_offer_trade_handoff(p_package_id uuid,p_notes text default null)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare p public.bct_work_packages%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into p from public.bct_work_packages where id=p_package_id for update;
 if p.id is null then raise exception 'Work package not found'; end if;
 if lower(coalesce(p.status,'')) not in ('complete','completed','ready_for_handoff','handoff_ready') then raise exception 'Predecessor work package is not ready for handoff'; end if;
 update public.bct_work_packages set handoff_offered_at=now(),handoff_offered_by=auth.uid(),handoff_notes=coalesce(p_notes,handoff_notes),updated_at=now() where id=p_package_id;
 return p_package_id;
end $$;
revoke all on function public.bct_admin_offer_trade_handoff(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_offer_trade_handoff(uuid,text) to authenticated;

create or replace function public.bct_admin_acknowledge_trade_handoff(p_package_id uuid,p_notes text default null)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare p public.bct_work_packages%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into p from public.bct_work_packages where id=p_package_id for update;
 if p.id is null or p.handoff_offered_at is null then raise exception 'Handoff must be offered first'; end if;
 update public.bct_work_packages set handoff_acknowledged_at=now(),handoff_acknowledged_by=auth.uid(),handoff_notes=coalesce(p_notes,handoff_notes),updated_at=now() where id=p_package_id;
 update public.bct_project_dependencies set status='cleared',notes=concat_ws(E'\n',notes,'BCT trade handoff acknowledged '||now()::text)
 where project_id=p.project_id and predecessor_type='work_package' and predecessor_id=p.id and lower(coalesce(status,'')) not in ('cleared','complete','completed','cancelled');
 return p_package_id;
end $$;
revoke all on function public.bct_admin_acknowledge_trade_handoff(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_acknowledge_trade_handoff(uuid,text) to authenticated;

create or replace function public.bct_refresh_trade_handoff_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select w.project_id,'trade_handoff_stalled',concat('Trade handoff awaiting acknowledgment: ',coalesce(w.title,w.trade,'work package')),w.handoff_offered_at+interval '24 hours',
 case when w.handoff_offered_at<now()-interval '48 hours' then 'critical' else 'high' end,'open',now()
 from public.bct_work_packages w
 where w.handoff_offered_at is not null and w.handoff_acknowledged_at is null and w.handoff_offered_at<now()-interval '24 hours'
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=w.project_id and ai.action_type='trade_handoff_stalled' and ai.status='open' and ai.title=concat('Trade handoff awaiting acknowledgment: ',coalesce(w.title,w.trade,'work package')));
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_trade_handoff_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_trade_handoff_attention() to authenticated;
