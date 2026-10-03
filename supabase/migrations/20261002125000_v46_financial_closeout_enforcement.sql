-- V46 final financial-closeout enforcement. Development only.
create or replace function public.bct_admin_finalize_financial_closeout(p_project_id uuid)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_blockers jsonb; v_id uuid;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 v_blockers:=public.bct_financial_closeout_blockers(p_project_id);
 if jsonb_array_length(v_blockers)>0 then raise exception 'Financial closeout blocked: %',v_blockers::text; end if;
 if exists(select 1 from public.bct_payment_dispute_holds h where h.project_id=p_project_id and lower(coalesce(h.status,'')) not in ('released','resolved','closed')) then raise exception 'Financial closeout blocked: unresolved payment dispute hold'; end if;
 if exists(select 1 from public.bct_warranties w where w.project_id=p_project_id and not exists(select 1 from public.bct_warranty_responsibility wr where wr.warranty_id=w.id and lower(coalesce(wr.status,'')) not in ('inactive','cancelled'))) then raise exception 'Financial closeout blocked: warranty responsibility incomplete'; end if;
 update public.bct_financial_closeouts set status='closed',closed_at=now(),closed_by=auth.uid() where project_id=p_project_id returning id into v_id;
 if v_id is null then raise exception 'Financial closeout record required'; end if;
 return v_id;
end $$;
revoke all on function public.bct_admin_finalize_financial_closeout(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_finalize_financial_closeout(uuid) to authenticated;

create or replace function public.bct_refresh_financial_closeout_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;x integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select h.project_id,'payment_dispute_hold','Payment dispute hold requires resolution','critical','open',now()
 from public.bct_payment_dispute_holds h where lower(coalesce(h.status,'')) not in ('released','resolved','closed')
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=h.project_id and ai.action_type='payment_dispute_hold' and ai.status='open');
 get diagnostics x=row_count;n:=n+x;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select distinct w.project_id,'warranty_responsibility','Warranty responsibility must be assigned','high','open',now()
 from public.bct_warranties w where not exists(select 1 from public.bct_warranty_responsibility wr where wr.warranty_id=w.id and lower(coalesce(wr.status,'')) not in ('inactive','cancelled'))
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=w.project_id and ai.action_type='warranty_responsibility' and ai.status='open');
 get diagnostics x=row_count;n:=n+x;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_financial_closeout_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_financial_closeout_attention() to authenticated;
