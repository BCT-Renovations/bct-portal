-- Development-only V46 operational closeout coverage.
create or replace function public.bct_operational_closeout_blockers(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select coalesce(jsonb_agg(x),'[]'::jsonb) into v from (
  select jsonb_build_object('type','project_hold','id',h.id) x
  from public.bct_project_holds h where h.project_id=p_project_id and h.released_at is null
  union all
  select jsonb_build_object('type','punch_list','id',p.id)
  from public.bct_punch_list_items p where p.project_id=p_project_id and lower(coalesce(p.status,'')) not in ('complete','completed','closed','verified')
  union all
  select jsonb_build_object('type','required_closeout','id',c.id)
  from public.bct_closeout_items c where c.project_id=p_project_id and coalesce(c.required,false) and lower(coalesce(c.status,'')) not in ('complete','completed','closed')
  union all
  select jsonb_build_object('type','homeowner_concern','id',cc.id)
  from public.bct_customer_concerns cc where cc.project_id=p_project_id and cc.resolved_at is null
  union all
  select jsonb_build_object('type','unreturned_site_key','id',k.id)
  from public.bct_site_keys k where k.project_id=p_project_id
    and k.checked_out_at is not null and k.returned_at is null
    and lower(coalesce(k.status,'')) not in ('returned','revoked','available')
 ) s;
 return v;
end $$;
revoke all on function public.bct_operational_closeout_blockers(uuid) from public,anon,authenticated;
grant execute on function public.bct_operational_closeout_blockers(uuid) to authenticated;
