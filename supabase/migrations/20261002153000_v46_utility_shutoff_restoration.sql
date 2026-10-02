-- V46 utility shutoff / restoration lifecycle. Development only.
-- Reuses canonical bct_utility_interruptions and action inbox.

create or replace function public.bct_admin_authorize_utility_interruption(
 p_utility_interruption_id uuid,p_customer_notice_confirmed boolean default false
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_utility_interruptions%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into v from public.bct_utility_interruptions where id=p_utility_interruption_id for update;
 if v.id is null then raise exception 'Utility interruption not found'; end if;
 if v.planned_start is null then raise exception 'Planned utility shutoff time required'; end if;

 update public.bct_utility_interruptions
 set authorized_by=auth.uid(),
     customer_notice_at=case when p_customer_notice_confirmed then coalesce(customer_notice_at,now()) else customer_notice_at end,
     status='authorized'
 where id=p_utility_interruption_id;
 return p_utility_interruption_id;
end $$;
revoke all on function public.bct_admin_authorize_utility_interruption(uuid,boolean) from public,anon,authenticated;
grant execute on function public.bct_admin_authorize_utility_interruption(uuid,boolean) to authenticated;

create or replace function public.bct_admin_record_utility_shutoff(
 p_utility_interruption_id uuid
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_utility_interruptions%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 select * into v from public.bct_utility_interruptions where id=p_utility_interruption_id for update;
 if v.id is null then raise exception 'Utility interruption not found'; end if;
 if v.authorized_by is null then raise exception 'Utility interruption must be authorized before shutoff'; end if;

 update public.bct_utility_interruptions
 set actual_shutoff_at=coalesce(actual_shutoff_at,now()),shutoff_by=auth.uid(),
     status='shut_off',safe_restoration_confirmed=false
 where id=p_utility_interruption_id;
 return p_utility_interruption_id;
end $$;
revoke all on function public.bct_admin_record_utility_shutoff(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_record_utility_shutoff(uuid) to authenticated;

create or replace function public.bct_admin_restore_utility(
 p_utility_interruption_id uuid,p_safe_restoration_confirmed boolean,p_notes text default null
) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v public.bct_utility_interruptions%rowtype;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if not coalesce(p_safe_restoration_confirmed,false) then raise exception 'Safe restoration confirmation required'; end if;
 select * into v from public.bct_utility_interruptions where id=p_utility_interruption_id for update;
 if v.id is null then raise exception 'Utility interruption not found'; end if;
 if v.actual_shutoff_at is null then raise exception 'Utility shutoff has not been recorded'; end if;

 update public.bct_utility_interruptions
 set restored_at=now(),restored_by=auth.uid(),safe_restoration_confirmed=true,
     status='restored',
     notes=case when nullif(btrim(coalesce(p_notes,'')),'') is null then notes
                when nullif(btrim(coalesce(notes,'')),'') is null then btrim(p_notes)
                else notes||E'\n'||btrim(p_notes) end
 where id=p_utility_interruption_id;

 update public.bct_action_inbox
 set status='closed'
 where project_id=v.project_id and action_type='utility_not_restored' and status in ('open','overdue');

 return p_utility_interruption_id;
end $$;
revoke all on function public.bct_admin_restore_utility(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.bct_admin_restore_utility(uuid,boolean,text) to authenticated;

create or replace function public.bct_refresh_utility_restoration_attention()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare n integer:=0;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 insert into public.bct_action_inbox(project_id,action_type,title,due_at,priority,status,created_at)
 select u.project_id,'utility_not_restored',
        concat('Utility restoration required: ',u.utility_type),
        coalesce(u.planned_end,now()),'critical',
        case when u.planned_end is not null and u.planned_end<now() then 'overdue' else 'open' end,now()
 from public.bct_utility_interruptions u
 where u.actual_shutoff_at is not null
   and (u.restored_at is null or not coalesce(u.safe_restoration_confirmed,false))
   and not exists(
     select 1 from public.bct_action_inbox ai
     where ai.project_id=u.project_id and ai.action_type='utility_not_restored'
       and ai.status in ('open','overdue')
       and ai.title=concat('Utility restoration required: ',u.utility_type)
   );
 get diagnostics n=row_count;
 return jsonb_build_object('created',n,'refreshed_at',now());
end $$;
revoke all on function public.bct_refresh_utility_restoration_attention() from public,anon,authenticated;
grant execute on function public.bct_refresh_utility_restoration_attention() to authenticated;
