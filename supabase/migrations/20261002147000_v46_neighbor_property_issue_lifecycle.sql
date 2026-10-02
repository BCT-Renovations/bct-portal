-- V46 neighbor / adjacent property issue lifecycle. Development only.
-- Extends canonical bct_neighbor_property_conditions and reuses action inbox.

alter table public.bct_neighbor_property_conditions
  add column if not exists resolution_notes text,
  add column if not exists resolved_by uuid;

create or replace function public.bct_refresh_neighbor_property_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select n.project_id,'neighbor_property_issue',
        concat('Neighbor/adjacent property issue: ',coalesce(n.neighbor_side,'unspecified side')),
        'high','open',now()
 from public.bct_neighbor_property_conditions n
 where n.complaint_received_at is not null
   and n.resolved_at is null
   and lower(coalesce(n.bct_review_status,'')) not in ('resolved','closed')
   and not exists(
    select 1 from public.bct_action_inbox ai
    where ai.project_id=n.project_id and ai.action_type='neighbor_property_issue'
      and ai.status='open'
      and ai.title=concat('Neighbor/adjacent property issue: ',coalesce(n.neighbor_side,'unspecified side'))
   );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_neighbor_property_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_neighbor_property_attention() to authenticated;

create or replace function public.bct_admin_resolve_neighbor_property_issue(
 p_condition_id uuid,p_resolution_notes text
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_neighbor_property_conditions%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if nullif(btrim(coalesce(p_resolution_notes,'')),'') is null then raise exception 'Resolution notes required'; end if;
 select * into v from public.bct_neighbor_property_conditions where id=p_condition_id for update;
 if v.id is null then raise exception 'Neighbor property condition not found'; end if;

 update public.bct_neighbor_property_conditions
 set bct_review_status='resolved',resolved_at=now(),resolved_by=auth.uid(),resolution_notes=btrim(p_resolution_notes)
 where id=p_condition_id;

 update public.bct_action_inbox
 set status='closed'
 where project_id=v.project_id and action_type='neighbor_property_issue' and status='open'
   and title=concat('Neighbor/adjacent property issue: ',coalesce(v.neighbor_side,'unspecified side'));

 return p_condition_id;
end $$;
revoke all on function public.bct_admin_resolve_neighbor_property_issue(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_resolve_neighbor_property_issue(uuid,text) to authenticated;
