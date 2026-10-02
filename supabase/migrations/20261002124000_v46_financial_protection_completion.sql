-- V46 financial protection completion controls. Development only.
-- Reuses payment, milestone, rental, warranty and financial-closeout records.

create or replace function public.bct_financial_protection_snapshot(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select jsonb_build_object(
 'payments',jsonb_build_object(
   'due',coalesce((select sum(amount) from public.bct_payments where project_id=p_project_id and due_date<=current_date),0),
   'paid',coalesce((select sum(amount) from public.bct_payments where project_id=p_project_id and lower(coalesce(status,''))='paid'),0),
   'past_due_count',(select count(*) from public.bct_payments where project_id=p_project_id and due_date<current_date and lower(coalesce(status,''))<>'paid')),
 'milestones',jsonb_build_object(
   'open',(select count(*) from public.bct_project_milestones where project_id=p_project_id and lower(coalesce(status,'')) not in ('complete','completed','closed')),
   'overdue',(select count(*) from public.bct_project_milestones where project_id=p_project_id and due_date<current_date and completed_at is null)),
 'rentals',jsonb_build_object(
   'open_exposure',coalesce((select sum(coalesce(late_fee_exposure,0)) from public.bct_equipment_usage where project_id=p_project_id and return_deadline is not null and returned_at is null),0),
   'overdue',(select count(*) from public.bct_equipment_usage where project_id=p_project_id and return_deadline<now() and returned_at is null)),
 'warranties',jsonb_build_object(
   'without_responsibility',(select count(*) from public.bct_warranties w where w.project_id=p_project_id and not exists(select 1 from public.bct_warranty_responsibility wr where wr.warranty_id=w.id and lower(coalesce(wr.status,'')) not in ('inactive','cancelled')))),
 'closeout',(select to_jsonb(fc) from public.bct_financial_closeouts fc where fc.project_id=p_project_id order by fc.closed_at desc nulls first limit 1)
 ) into v;
 return v;
end $$;
revoke all on function public.bct_financial_protection_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.bct_financial_protection_snapshot(uuid) to authenticated;

create or replace function public.bct_refresh_payment_milestone_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0; x integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select p.project_id,'payment_past_due',concat('Payment past due: ',coalesce(p.payment_number,p.payment_type,'payment')),p.due_date::timestamptz,'critical','open',now()
 from public.bct_payments p where p.due_date<current_date and lower(coalesce(p.status,''))<>'paid'
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=p.project_id and ai.action_type='payment_past_due' and ai.status='open' and ai.title=concat('Payment past due: ',coalesce(p.payment_number,p.payment_type,'payment')));
 get diagnostics x=row_count;n:=n+x;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select m.project_id,'milestone_overdue',concat('Milestone overdue: ',coalesce(m.title,'project milestone')),m.due_date::timestamptz,'high','open',now()
 from public.bct_project_milestones m where m.due_date<current_date and m.completed_at is null
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=m.project_id and ai.action_type='milestone_overdue' and ai.status='open' and ai.title=concat('Milestone overdue: ',coalesce(m.title,'project milestone')));
 get diagnostics x=row_count;n:=n+x;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_payment_milestone_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_payment_milestone_attention() to authenticated;
