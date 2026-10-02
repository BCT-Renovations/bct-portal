-- V46 homeowner-supplied material verification lifecycle. Development only.
-- Reuses canonical bct_customer_materials and action inbox.

create or replace function public.bct_admin_verify_customer_material(
 p_customer_material_id uuid,p_quantity_verified numeric,p_condition text,
 p_storage_location text default null,p_verification_status text default 'verified',
 p_additional_material_required boolean default false,p_verification_notes text default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_customer_materials%rowtype; s text:=lower(coalesce(nullif(btrim(p_verification_status),''),'verified'));
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if p_quantity_verified is not null and p_quantity_verified<0 then raise exception 'Verified quantity cannot be negative'; end if;
 if s not in ('pending','verified','accepted','short','damaged','rejected','not_required','waived','cancelled') then raise exception 'Invalid material verification status'; end if;
 select * into v from public.bct_customer_materials where id=p_customer_material_id for update;
 if v.id is null then raise exception 'Homeowner-supplied material not found'; end if;

 update public.bct_customer_materials
 set quantity_verified=p_quantity_verified,
     condition=nullif(btrim(coalesce(p_condition,'')),''),
     verification_status=s,
     storage_location=nullif(btrim(coalesce(p_storage_location,'')),''),
     additional_material_required=coalesce(p_additional_material_required,false),
     verification_notes=nullif(btrim(coalesce(p_verification_notes,'')),''),
     received_by=coalesce(received_by,auth.uid()),
     received_at=coalesce(received_at,now()),
     delivery_status=case when s in ('verified','accepted') then 'received_verified' else coalesce(delivery_status,'received') end
 where id=p_customer_material_id;

 if s in ('verified','accepted','not_required','waived','cancelled')
    and not coalesce(p_additional_material_required,false)
    and (v.quantity_claimed is null or p_quantity_verified is null or p_quantity_verified>=v.quantity_claimed) then
   update public.bct_action_inbox
   set status='closed'
   where project_id=v.project_id and action_type='customer_material_issue' and status in ('open','overdue');
 end if;

 return p_customer_material_id;
end $$;
revoke all on function public.bct_admin_verify_customer_material(uuid,numeric,text,text,text,boolean,text) from public,anon,authenticated;
grant execute on function public.bct_admin_verify_customer_material(uuid,numeric,text,text,text,boolean,text) to authenticated;

create or replace function public.bct_refresh_customer_material_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select m.project_id,'customer_material_issue',
        concat('Homeowner material issue: ',left(m.item_description,120)),
        case when lower(coalesce(m.verification_status,'')) in ('damaged','rejected') then 'critical' else 'high' end,
        'open',now()
 from public.bct_customer_materials m
 where (
   coalesce(m.additional_material_required,false)
   or (m.quantity_claimed is not null and m.quantity_verified is not null and m.quantity_verified<m.quantity_claimed)
   or lower(coalesce(m.verification_status,'')) in ('short','damaged','rejected')
 )
 and lower(coalesce(m.verification_status,'')) not in ('not_required','waived','cancelled')
 and not exists(
   select 1 from public.bct_action_inbox ai
   where ai.project_id=m.project_id and ai.action_type='customer_material_issue'
     and ai.status='open' and ai.title=concat('Homeowner material issue: ',left(m.item_description,120))
 );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_customer_material_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_customer_material_attention() to authenticated;
