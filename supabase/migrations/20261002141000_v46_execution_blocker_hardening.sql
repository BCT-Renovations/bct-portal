-- V46 decision / hidden-condition / material-substitution lifecycle hardening. Development only.

create or replace function public.bct_refresh_execution_blocker_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;x integer;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;

 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select d.project_id,'homeowner_decision_overdue',concat('Homeowner decision overdue: ',left(coalesce(d.question,d.decision_type,'decision'),120)),d.due_at,'high','open',now()
 from public.bct_customer_decisions d
 where d.due_at<now() and d.decided_at is null and lower(coalesce(d.status,'')) not in ('cancelled','closed','decided')
 and not exists(select 1 from public.bct_action_inbox a where a.project_id=d.project_id and a.action_type='homeowner_decision_overdue' and a.status='open' and a.title=concat('Homeowner decision overdue: ',left(coalesce(d.question,d.decision_type,'decision'),120)));
 get diagnostics x=row_count;n:=n+x;

 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select h.project_id,'hidden_condition_unresolved',concat('Hidden condition unresolved: ',left(coalesce(h.area,h.condition_description,'condition'),120)),'critical','open',now()
 from public.bct_hidden_conditions h
 where h.resolved_at is null and coalesce(h.work_stopped,false)
 and not exists(select 1 from public.bct_action_inbox a where a.project_id=h.project_id and a.action_type='hidden_condition_unresolved' and a.status='open' and a.title=concat('Hidden condition unresolved: ',left(coalesce(h.area,h.condition_description,'condition'),120)));
 get diagnostics x=row_count;n:=n+x;

 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select m.project_id,'material_substitution_approval',concat('Material substitution approval required: ',left(coalesce(m.proposed_material,'substitution'),120)),'high','open',now()
 from public.bct_material_substitutions m
 where coalesce(m.customer_approval_required,false) and m.approved_at is null
 and lower(coalesce(m.status,'')) not in ('rejected','cancelled','closed')
 and not exists(select 1 from public.bct_action_inbox a where a.project_id=m.project_id and a.action_type='material_substitution_approval' and a.status='open' and a.title=concat('Material substitution approval required: ',left(coalesce(m.proposed_material,'substitution'),120)));
 get diagnostics x=row_count;n:=n+x;

 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_execution_blocker_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_execution_blocker_attention() to authenticated;

create or replace function public.bct_execution_blockers(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(x),'[]'::jsonb) into v from (
  select jsonb_build_object('type','homeowner_decision','id',d.id,'due_at',d.due_at) x from public.bct_customer_decisions d
   where d.project_id=p_project_id and d.due_at<now() and d.decided_at is null and lower(coalesce(d.status,'')) not in ('cancelled','closed','decided')
  union all
  select jsonb_build_object('type','hidden_condition','id',h.id,'area',h.area) from public.bct_hidden_conditions h
   where h.project_id=p_project_id and h.resolved_at is null and coalesce(h.work_stopped,false)
  union all
  select jsonb_build_object('type','material_substitution','id',m.id,'material',m.proposed_material) from public.bct_material_substitutions m
   where m.project_id=p_project_id and coalesce(m.customer_approval_required,false) and m.approved_at is null and lower(coalesce(m.status,'')) not in ('rejected','cancelled','closed')
 ) s;
 return v;
end $$;
revoke all on function public.bct_execution_blockers(uuid) from public,anon,authenticated;
grant execute on function public.bct_execution_blockers(uuid) to authenticated;
