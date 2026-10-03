-- V46 damage responsibility review. Development only.
-- Reuses canonical incidents, condition evidence, assignments and action inbox.

alter table public.bct_incidents
 add column if not exists responsibility_status text,
 add column if not exists responsibility_party_type text,
 add column if not exists responsibility_party_id uuid,
 add column if not exists responsibility_notes text,
 add column if not exists responsibility_reviewed_at timestamptz,
 add column if not exists responsibility_reviewed_by uuid,
 add column if not exists related_change_order_id uuid;

create or replace function public.bct_admin_review_damage_responsibility(
 p_incident_id uuid,p_party_type text,p_party_id uuid,p_notes text,p_related_change_order_id uuid default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare i public.bct_incidents%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if nullif(btrim(coalesce(p_notes,'')),'') is null then raise exception 'Responsibility review notes required'; end if;
 select * into i from public.bct_incidents where id=p_incident_id for update;
 if i.id is null then raise exception 'Incident not found'; end if;
 if p_related_change_order_id is not null and not exists(select 1 from public.bct_change_orders co where co.id=p_related_change_order_id and co.project_id=i.project_id) then raise exception 'Change order does not belong to incident project'; end if;
 update public.bct_incidents set
 responsibility_status='reviewed',responsibility_party_type=nullif(btrim(p_party_type),''),
 responsibility_party_id=p_party_id,responsibility_notes=p_notes,
 responsibility_reviewed_at=now(),responsibility_reviewed_by=auth.uid(),
 related_change_order_id=p_related_change_order_id,updated_at=now()
 where id=p_incident_id;
 update public.bct_action_inbox set status='closed'
 where project_id=i.project_id and action_type='damage_responsibility_review' and status='open'
 and title=concat('Damage responsibility review: ',coalesce(i.incident_type,'incident'));
 return p_incident_id;
end $$;
revoke all on function public.bct_admin_review_damage_responsibility(uuid,text,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_review_damage_responsibility(uuid,text,uuid,text,uuid) to authenticated;

create or replace function public.bct_refresh_damage_responsibility_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select i.project_id,'damage_responsibility_review',concat('Damage responsibility review: ',coalesce(i.incident_type,'incident')),
 case when lower(coalesce(i.severity,'')) in ('critical','severe','high') then 'critical' else 'high' end,'open',now()
 from public.bct_incidents i
 where lower(coalesce(i.incident_type,'')) in ('damage','property_damage','customer_property_damage','neighbor_damage')
 and i.resolved_at is null and coalesce(i.responsibility_status,'')<>'reviewed'
 and not exists(select 1 from public.bct_action_inbox ai where ai.project_id=i.project_id and ai.action_type='damage_responsibility_review' and ai.status='open' and ai.title=concat('Damage responsibility review: ',coalesce(i.incident_type,'incident')));
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_damage_responsibility_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_damage_responsibility_attention() to authenticated;
