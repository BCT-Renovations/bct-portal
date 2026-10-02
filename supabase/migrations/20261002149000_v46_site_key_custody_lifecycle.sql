-- V46 key / property access custody lifecycle. Development only.
-- Reuses canonical bct_site_keys; no parallel custody table.

create or replace function public.bct_admin_issue_site_key(
 p_site_key_id uuid,p_holder_type text,p_holder_id uuid,p_access_purpose text default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_site_keys%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if nullif(btrim(coalesce(p_holder_type,'')),'') is null then raise exception 'Holder type required'; end if;
 if p_holder_id is null then raise exception 'Holder required'; end if;
 select * into v from public.bct_site_keys where id=p_site_key_id for update;
 if v.id is null then raise exception 'Site key not found'; end if;
 if v.checked_out_at is not null and v.returned_at is null and lower(coalesce(v.status,'')) not in ('available','returned','revoked') then
   raise exception 'Site key is already checked out';
 end if;

 update public.bct_site_keys
 set holder_type=btrim(p_holder_type),holder_id=p_holder_id,
     checked_out_at=now(),returned_at=null,status='checked_out',
     access_purpose=nullif(btrim(coalesce(p_access_purpose,'')),''),
     issued_by=auth.uid(),revoked_at=null,revoked_by=null
 where id=p_site_key_id;
 return p_site_key_id;
end $$;
revoke all on function public.bct_admin_issue_site_key(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_issue_site_key(uuid,text,uuid,text) to authenticated;

create or replace function public.bct_admin_return_site_key(
 p_site_key_id uuid,p_notes text default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_site_keys%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into v from public.bct_site_keys where id=p_site_key_id for update;
 if v.id is null then raise exception 'Site key not found'; end if;
 if v.checked_out_at is null or v.returned_at is not null then raise exception 'Active key custody not found'; end if;

 update public.bct_site_keys
 set returned_at=now(),status='available',
     notes=case when nullif(btrim(coalesce(p_notes,'')),'') is null then notes
                when nullif(btrim(coalesce(notes,'')),'') is null then btrim(p_notes)
                else notes||E'\n'||btrim(p_notes) end
 where id=p_site_key_id;

 update public.bct_action_inbox
 set status='closed'
 where project_id=v.project_id and action_type='unreturned_site_key' and status in ('open','overdue');

 return p_site_key_id;
end $$;
revoke all on function public.bct_admin_return_site_key(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_return_site_key(uuid,text) to authenticated;

create or replace function public.bct_refresh_site_key_custody_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 select k.project_id,'unreturned_site_key',concat('Unreturned property access item: ',k.key_label),'critical','open',now()
 from public.bct_site_keys k
 join public.bct_projects p on p.id=k.project_id
 where k.checked_out_at is not null and k.returned_at is null
   and lower(coalesce(k.status,'')) not in ('returned','revoked','available')
   and lower(coalesce(p.workflow_status,'')) in ('completed','complete','closed','closeout')
   and not exists(
     select 1 from public.bct_action_inbox ai
     where ai.project_id=k.project_id and ai.action_type='unreturned_site_key'
       and ai.status='open' and ai.title=concat('Unreturned property access item: ',k.key_label)
   );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_site_key_custody_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_site_key_custody_attention() to authenticated;
