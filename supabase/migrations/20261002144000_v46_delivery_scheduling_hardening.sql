-- V46 delivery scheduling hardening. Development only.
-- Reuses bct_vendor_orders.expected_at + existing action inbox.

alter table public.bct_vendor_orders
  add column if not exists delivery_window_end timestamptz,
  add column if not exists delivery_confirmed_at timestamptz,
  add column if not exists delivery_confirmed_by uuid,
  add column if not exists site_ready_confirmed_at timestamptz,
  add column if not exists site_ready_confirmed_by uuid;

create or replace function public.bct_admin_confirm_vendor_delivery(
 p_vendor_order_id uuid,p_expected_at timestamptz,p_delivery_window_end timestamptz default null,
 p_site_ready boolean default false
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_vendor_orders%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_expected_at is null then raise exception 'Expected delivery time required'; end if;
 if p_delivery_window_end is not null and p_delivery_window_end<p_expected_at then raise exception 'Delivery window end must follow expected delivery time'; end if;
 select * into v from public.bct_vendor_orders where id=p_vendor_order_id for update;
 if v.id is null then raise exception 'Vendor order not found'; end if;
 if v.received_at is not null then raise exception 'Vendor order already received'; end if;
 update public.bct_vendor_orders
 set expected_at=p_expected_at,
     delivery_window_end=p_delivery_window_end,
     delivery_confirmed_at=now(),
     delivery_confirmed_by=auth.uid(),
     site_ready_confirmed_at=case when p_site_ready then now() else null end,
     site_ready_confirmed_by=case when p_site_ready then auth.uid() else null end,
     updated_at=now()
 where id=p_vendor_order_id;
 return p_vendor_order_id;
end $$;
revoke all on function public.bct_admin_confirm_vendor_delivery(uuid,timestamptz,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.bct_admin_confirm_vendor_delivery(uuid,timestamptz,timestamptz,boolean) to authenticated;

create or replace function public.bct_refresh_delivery_schedule_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select vo.project_id,'delivery_schedule',
        concat('Delivery readiness: ',coalesce(vo.vendor,'vendor'),case when vo.order_number is not null then ' # '||vo.order_number else '' end),
        vo.expected_at,
        case when vo.expected_at<now() then 'critical' else 'high' end,
        case when vo.expected_at<now() then 'overdue' else 'open' end,
        now()
 from public.bct_vendor_orders vo
 where vo.received_at is null
   and vo.expected_at is not null
   and vo.expected_at<=now()+interval '48 hours'
   and (vo.delivery_confirmed_at is null or vo.site_ready_confirmed_at is null)
   and lower(coalesce(vo.status,'')) not in ('cancelled','void','closed')
   and not exists(
     select 1 from public.bct_action_inbox ai
     where ai.project_id=vo.project_id and ai.action_type='delivery_schedule'
       and ai.status in ('open','overdue')
       and ai.title=concat('Delivery readiness: ',coalesce(vo.vendor,'vendor'),case when vo.order_number is not null then ' # '||vo.order_number else '' end)
   );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_delivery_schedule_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_delivery_schedule_attention() to authenticated;

create or replace function public.bct_sync_delivery_attention_on_receipt()
returns trigger language plpgsql security definer set search_path=public,auth,pg_temp as $$
begin
 if new.received_at is not null and old.received_at is null then
   update public.bct_action_inbox
      set status='closed'
    where project_id=new.project_id and action_type='delivery_schedule' and status in ('open','overdue')
      and title=concat('Delivery readiness: ',coalesce(new.vendor,'vendor'),case when new.order_number is not null then ' # '||new.order_number else '' end);
 end if;
 return new;
end $$;
drop trigger if exists trg_bct_sync_delivery_attention_on_receipt on public.bct_vendor_orders;
create trigger trg_bct_sync_delivery_attention_on_receipt
after update of received_at on public.bct_vendor_orders
for each row execute function public.bct_sync_delivery_attention_on_receipt();
