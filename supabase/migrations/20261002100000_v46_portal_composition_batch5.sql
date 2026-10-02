-- V46 field controls batch 5: composed readiness + homeowner-safe portal views.
-- DEVELOPMENT BRANCH ONLY. No new readiness table/system is created.
-- Uses existing holds, contracts, assignments, payments, access rules, inspections, materials, decisions and action inbox.

create or replace function public.bct_project_readiness_blockers(p_project_id uuid)
returns jsonb
language sql stable security invoker set search_path=public,auth,pg_temp
as $$
with blockers as (
  select 'project_hold' kind, coalesce(h.reason,h.hold_type,'Project hold') detail
    from public.bct_project_holds h
   where h.project_id=p_project_id and lower(coalesce(h.status,'')) not in ('released','resolved','closed')
  union all
  select 'contract','Required contract signatures are incomplete'
   where exists(select 1 from public.bct_contracts c where c.project_id=p_project_id
     and (c.homeowner_signed_at is null or c.bct_signed_at is null))
  union all
  select 'assignment','Performing contractor assignment is not active'
   where not exists(select 1 from public.bct_assignments a where a.project_id=p_project_id
     and lower(coalesce(a.status,'')) in ('assigned','accepted','active','in_progress'))
  union all
  select 'payment','Required project payment is past due'
   where exists(select 1 from public.bct_payments p where p.project_id=p_project_id
     and p.due_date<current_date and lower(coalesce(p.status,'')) not in ('paid','waived','cancelled'))
  union all
  select 'access','Required site access information is not active'
   where exists(select 1 from public.bct_site_access_rules ar where ar.project_id=p_project_id and not ar.active)
  union all
  select 'inspection','Required inspection/hold point is not cleared'
   where exists(select 1 from public.bct_quality_hold_points hp
     where hp.project_id=p_project_id and coalesce(hp.required_before_cover,true) and lower(coalesce(hp.status,'')) not in ('passed','approved','clear','cleared','complete','completed'))
  union all
  select 'material','Project material is unavailable'
   where exists(select 1 from public.bct_job_materials jm where jm.project_id=p_project_id
     and lower(coalesce(jm.status,'')) in ('short','shortage','backordered','unavailable'))
  union all
  select 'decision','Homeowner decision is overdue'
   where exists(select 1 from public.bct_customer_decisions d where d.project_id=p_project_id
     and d.due_at<now() and lower(coalesce(d.status,'')) not in ('answered','resolved','closed'))
)
select coalesce(jsonb_agg(jsonb_build_object('kind',kind,'detail',detail)),'[]'::jsonb) from blockers;
$$;
grant execute on function public.bct_project_readiness_blockers(uuid) to authenticated;
revoke execute on function public.bct_project_readiness_blockers(uuid) from anon;

-- Homeowner-safe composition; no private resident notes, access codes, bids or internal notes.
create or replace function public.bct_homeowner_project_snapshot(p_project_id uuid)
returns jsonb
language plpgsql stable security definer set search_path=public,auth,pg_temp
as $$
declare
  v_customer_id uuid;
  v_result jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select p.customer_id into v_customer_id from public.bct_projects p where p.id=p_project_id;
  if v_customer_id is null then raise exception 'Project not found'; end if;
  if not public.is_bct_admin() and not exists(
    select 1 from public.bct_customers c where c.id=v_customer_id and c.auth_user_id=auth.uid()
  ) then raise exception 'Project access denied'; end if;

  select jsonb_build_object(
    'project',jsonb_build_object(
      'id',p.id,'project_number',p.project_number,'workflow_status',p.workflow_status,
      'property_name',p.property_name,'city',p.city,'state',p.state
    ),
    'what_happens_next',(
      select coalesce(jsonb_agg(jsonb_build_object('title',m.title,'status',m.status,'due_date',m.due_date)
        order by m.due_date nulls last),'[]'::jsonb)
      from public.bct_project_milestones m where m.project_id=p.id
        and lower(coalesce(m.status,'')) not in ('complete','completed','closed')
    ),
    'my_decisions',(
      select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'type',d.decision_type,'question',d.question,
        'due_at',d.due_at,'status',d.status,'schedule_impact',d.schedule_impact) order by d.due_at nulls last),'[]'::jsonb)
      from public.bct_customer_decisions d where d.project_id=p.id
    ),
    'money',jsonb_build_object(
      'contract_amount',(select max(c.contract_amount) from public.bct_contracts c where c.project_id=p.id),
      'paid',(select coalesce(sum(py.amount),0) from public.bct_payments py where py.project_id=p.id and lower(coalesce(py.status,''))='paid'),
      'open_change_orders',(select coalesce(sum(co.amount_change),0) from public.bct_change_orders co where co.project_id=p.id and lower(coalesce(co.status,'')) not in ('rejected','cancelled','void'))
    ),
    'today',(
      select coalesce(jsonb_agg(jsonb_build_object('title',s.title,'starts_at',s.starts_at,'ends_at',s.ends_at,'status',s.status)
        order by s.starts_at),'[]'::jsonb)
      from public.bct_schedule_events s where s.project_id=p.id and s.starts_at::date=current_date
    ),
    'open_concerns',(
      select count(*) from public.bct_customer_concerns cc where cc.project_id=p.id
        and lower(coalesce(cc.status,'')) not in ('resolved','closed')
    )
  ) into v_result
  from public.bct_projects p where p.id=p_project_id;

  return v_result;
end $$;
revoke all on function public.bct_homeowner_project_snapshot(uuid) from public,anon;
grant execute on function public.bct_homeowner_project_snapshot(uuid) to authenticated;

-- Property manager/commercial priority view composed from existing property/project/attention records.
create or replace function public.bct_my_property_portfolio_priority()
returns table(project_id uuid,project_number text,property_name text,building_number text,unit_number text,
              workflow_status text,priority text,requires_manager_action boolean,open_attention bigint)
language sql stable security invoker set search_path=public,auth,pg_temp
as $$
  select p.id,p.project_number,p.property_name,p.building_number,p.unit_number,p.workflow_status,
    case
      when exists(select 1 from public.bct_action_inbox ai where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='critical') then 'critical'
      when exists(select 1 from public.bct_action_inbox ai where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='high') then 'urgent'
      when lower(coalesce(p.workflow_status,'')) in ('completed','closed') then 'completed'
      when lower(coalesce(p.workflow_status,'')) in ('active','in_progress') then 'active'
      else 'waiting'
    end,
    exists(select 1 from public.bct_customer_decisions d where d.project_id=p.id and lower(coalesce(d.status,'')) not in ('answered','resolved','closed')),
    (select count(*) from public.bct_action_inbox ai where ai.project_id=p.id and ai.status in ('open','overdue'))
  from public.bct_projects p
  where p.managed_property_id is not null
    and exists(
      select 1
      from public.bct_property_accounts pa
      where pa.auth_user_id=auth.uid() and pa.active and exists (select 1 from public.bct_managed_properties mp where mp.id=p.managed_property_id and mp.property_account_id=pa.id and mp.active)
    )
  order by
    case when exists(select 1 from public.bct_action_inbox ai where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='critical') then 0
         when exists(select 1 from public.bct_action_inbox ai where ai.project_id=p.id and ai.status in ('open','overdue') and ai.priority='high') then 1 else 2 end,
    p.updated_at desc;
$$;
grant execute on function public.bct_my_property_portfolio_priority() to authenticated;
revoke execute on function public.bct_my_property_portfolio_priority() from anon;
