-- V46 financial protection control layer. Development branch only.
-- Reuses canonical BCT financial tables and the existing action inbox.

create or replace function public.bct_refresh_financial_protection_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_created integer:=0; v_total integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;

 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select bl.project_id,'job_cost_variance',concat('Budget overrun: ',coalesce(bl.description,'budget line')),'high','open',now()
 from public.bct_budget_lines bl
 where coalesce(bl.actual_amount,0)>coalesce(bl.budget_amount,0)
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=bl.project_id and ai.action_type='job_cost_variance' and ai.status='open' and ai.title=concat('Budget overrun: ',coalesce(bl.description,'budget line')));
 get diagnostics v_created=row_count; v_total:=v_total+v_created;

 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select a.project_id,'allowance_overage',concat('Allowance over budget: ',coalesce(a.name,'allowance')),'high','open',now()
 from public.bct_allowances a where coalesce(a.selected_amount,0)>coalesce(a.budget_amount,0)
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=a.project_id and ai.action_type='allowance_overage' and ai.status='open' and ai.title=concat('Allowance over budget: ',coalesce(a.name,'allowance')));
 get diagnostics v_created=row_count; v_total:=v_total+v_created;

 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select u.project_id,'unbudgeted_cost',concat('Unbudgeted cost requires review: $',coalesce(u.amount,0)::text),'high','open',now()
 from public.bct_unbudgeted_cost_alerts u where lower(coalesce(u.status,'')) not in ('resolved','closed','approved')
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=u.project_id and ai.action_type='unbudgeted_cost' and ai.status='open' and ai.title=concat('Unbudgeted cost requires review: $',coalesce(u.amount,0)::text));
 get diagnostics v_created=row_count; v_total:=v_total+v_created;

 return jsonb_build_object('created',v_total,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_financial_protection_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_financial_protection_attention() to authenticated;

create or replace function public.bct_financial_closeout_blockers(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(x),'[]'::jsonb) into v from (
  select jsonb_build_object('type','lien_waiver','message','Lien waiver remains incomplete') x from public.bct_lien_waivers lw where lw.project_id=p_project_id and (lw.signed_at is null or lower(coalesce(lw.status,'')) not in ('complete','completed','signed','approved')) limit 1
  union all
  select jsonb_build_object('type','retainage','message','Retainage remains unreleased') from public.bct_retainage r where r.project_id=p_project_id and coalesce(r.held_amount,0)>coalesce(r.released_amount,0) limit 1
  union all
  select jsonb_build_object('type','refund_credit','message','Refund or credit remains unresolved') from public.bct_refunds_credits rc where rc.project_id=p_project_id and lower(coalesce(rc.status,'')) not in ('complete','completed','closed','paid') limit 1
  union all
  select jsonb_build_object('type','back_charge','message','Back charge remains unresolved') from public.bct_back_charges bc where bc.project_id=p_project_id and lower(coalesce(bc.status,'')) not in ('complete','completed','closed','resolved') limit 1
  union all
  select jsonb_build_object('type','unbudgeted_cost','message','Unbudgeted cost remains unresolved') from public.bct_unbudgeted_cost_alerts uc where uc.project_id=p_project_id and lower(coalesce(uc.status,'')) not in ('resolved','closed','approved') limit 1
 ) q;
 return v;
end $$;
revoke all on function public.bct_financial_closeout_blockers(uuid) from public,anon,authenticated;
grant execute on function public.bct_financial_closeout_blockers(uuid) to authenticated;
