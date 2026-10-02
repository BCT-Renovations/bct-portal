-- V46 damage responsibility completion. Development only.
-- Reuses incidents + existing pre-work/neighbor evidence.

create or replace function public.bct_admin_damage_review_snapshot(p_incident_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare i public.bct_incidents%rowtype; v_baseline jsonb; v_neighbor jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into i from public.bct_incidents where id=p_incident_id;
 if i.id is null then raise exception 'Incident not found'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'area',b.area,'condition_notes',b.condition_notes,'recorded_at',b.recorded_at,'photo_refs',b.photo_refs) order by b.recorded_at),'[]'::jsonb)
 into v_baseline from public.bct_site_condition_baselines b where b.project_id=i.project_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',n.id,'neighbor_side',n.neighbor_side,'condition_notes',n.condition_notes,'recorded_at',n.recorded_at,'evidence_refs',n.evidence_refs) order by n.recorded_at),'[]'::jsonb)
 into v_neighbor from public.bct_neighbor_property_conditions n where n.project_id=i.project_id;
 return jsonb_build_object(
 'incident',jsonb_build_object('id',i.id,'project_id',i.project_id,'incident_type',i.incident_type,'severity',i.severity,'description',i.description,'occurred_at',i.occurred_at,'evidence_notes',i.evidence_notes,'responsibility_status',i.responsibility_status,'responsibility_party_type',i.responsibility_party_type,'responsibility_party_id',i.responsibility_party_id,'responsibility_notes',i.responsibility_notes,'responsibility_reviewed_at',i.responsibility_reviewed_at,'related_change_order_id',i.related_change_order_id),
 'pre_work_baseline',v_baseline,'neighbor_conditions',v_neighbor);
end $$;
revoke all on function public.bct_admin_damage_review_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_damage_review_snapshot(uuid) to authenticated;

create or replace function public.bct_damage_review_closeout_blockers(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('incident_id',i.id,'incident_type',i.incident_type,'severity',i.severity,'occurred_at',i.occurred_at,'reason','damage responsibility review unresolved') order by i.occurred_at),'[]'::jsonb)
 into v from public.bct_incidents i
 where i.project_id=p_project_id
 and lower(coalesce(i.incident_type,'')) in ('damage','property_damage','customer_property_damage','neighbor_damage')
 and coalesce(i.responsibility_status,'')<>'reviewed';
 return v;
end $$;
revoke all on function public.bct_damage_review_closeout_blockers(uuid) from public,anon,authenticated;
grant execute on function public.bct_damage_review_closeout_blockers(uuid) to authenticated;
