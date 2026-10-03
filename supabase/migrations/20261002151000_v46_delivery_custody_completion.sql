-- V46 delivery custody completion. Development only.
-- Extends canonical bct_delivery_receipts; no parallel material custody system.

create or replace function public.bct_admin_complete_delivery_custody(
 p_delivery_receipt_id uuid,p_quantity_expected numeric,p_quantity_received numeric,
 p_secured_location text,p_delivery_ticket_path text default null,p_transferred_to uuid default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_delivery_receipts%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_quantity_expected is not null and p_quantity_expected<0 then raise exception 'Expected quantity cannot be negative'; end if;
 if p_quantity_received is not null and p_quantity_received<0 then raise exception 'Received quantity cannot be negative'; end if;
 if nullif(btrim(coalesce(p_secured_location,'')),'') is null then raise exception 'Secured material location required'; end if;

 select * into v from public.bct_delivery_receipts where id=p_delivery_receipt_id for update;
 if v.id is null then raise exception 'Delivery receipt not found'; end if;

 update public.bct_delivery_receipts
 set quantity_expected=p_quantity_expected,
     quantity_received=p_quantity_received,
     delivery_ticket_path=nullif(btrim(coalesce(p_delivery_ticket_path,'')),''),
     secured_location=btrim(p_secured_location),
     transferred_to=p_transferred_to,
     transferred_at=case when p_transferred_to is not null then now() else transferred_at end,
     discrepancies=case
       when p_quantity_expected is not null and p_quantity_received is not null and p_quantity_received<p_quantity_expected
         then coalesce(nullif(btrim(discrepancies),''),'Quantity received is less than quantity expected')
       else discrepancies
     end
 where id=p_delivery_receipt_id;

 if (p_quantity_expected is null or p_quantity_received is null or p_quantity_received>=p_quantity_expected)
    and nullif(btrim(coalesce(v.discrepancies,'')),'') is null then
   update public.bct_action_inbox
   set status='closed'
   where project_id=v.project_id and action_type='delivery_discrepancy' and status in ('open','overdue');
 end if;

 return p_delivery_receipt_id;
end $$;
revoke all on function public.bct_admin_complete_delivery_custody(uuid,numeric,numeric,text,text,uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_complete_delivery_custody(uuid,numeric,numeric,text,text,uuid) to authenticated;
