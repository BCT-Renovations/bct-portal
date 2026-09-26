-- Safety training admin automation, reminder routing, and new-work gates.
create or replace function public.bct_admin_set_contractor_hold(p_contractor_id uuid,p_on_hold boolean,p_reason text default null)
returns jsonb language plpgsql security invoker set search_path=public,auth as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 if p_on_hold and nullif(btrim(p_reason),'') is null then raise exception 'Admin hold reason required'; end if;
 insert into public.bct_contractor_workforce_holds(contractor_id,admin_hold,admin_hold_reason,updated_at)
 values(p_contractor_id,p_on_hold,case when p_on_hold then btrim(p_reason) else null end,now())
 on conflict(contractor_id) do update set admin_hold=excluded.admin_hold,admin_hold_reason=excluded.admin_hold_reason,updated_at=now();
 insert into public.bct_audit_events(actor_user_id,entity_type,entity_id,action,details)
 values(auth.uid(),'contractor',p_contractor_id::text,case when p_on_hold then 'admin_hold_applied' else 'admin_hold_cleared' end,jsonb_build_object('reason',p_reason));
 return jsonb_build_object('contractor_id',p_contractor_id,'admin_hold',p_on_hold);
end $$;

create or replace function public.bct_admin_exempt_safety_training(p_assignment_id uuid,p_reason text)
returns jsonb language plpgsql security invoker set search_path=public,auth as $$
declare cid uuid;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 if nullif(btrim(p_reason),'') is null then raise exception 'Exemption reason required'; end if;
 update public.bct_safety_training_assignments set status='exempt',exemption_reason=btrim(p_reason),updated_at=now() where id=p_assignment_id returning contractor_id into cid;
 if cid is null then raise exception 'Safety training assignment not found'; end if;
 if not exists(select 1 from public.bct_safety_training_assignments where contractor_id=cid and status='overdue') then
  insert into public.bct_contractor_workforce_holds(contractor_id,safety_restricted,safety_restricted_at) values(cid,false,null)
  on conflict(contractor_id) do update set safety_restricted=false,safety_restricted_at=null,updated_at=now();
 end if;
 insert into public.bct_audit_events(actor_user_id,entity_type,entity_id,action,details) values(auth.uid(),'safety_training_assignment',p_assignment_id::text,'admin_exemption',jsonb_build_object('reason',p_reason));
 return jsonb_build_object('assignment_id',p_assignment_id,'status','exempt','workforce_eligible',public.bct_contractor_workforce_eligible(cid));
end $$;

create or replace function public.bct_refresh_safety_training_compliance()
returns jsonb language plpgsql security invoker set search_path=public,auth as $$
declare n_overdue integer; n_restricted integer;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 update public.bct_safety_training_assignments set status='overdue',updated_at=now() where status in('assigned','in_progress') and now()>grace_until;
 get diagnostics n_overdue=row_count;
 insert into public.bct_contractor_workforce_holds(contractor_id,safety_restricted,safety_restricted_at)
 select distinct contractor_id,true,now() from public.bct_safety_training_assignments where status='overdue'
 on conflict(contractor_id) do update set safety_restricted=true,safety_restricted_at=coalesce(public.bct_contractor_workforce_holds.safety_restricted_at,now()),updated_at=now();
 get diagnostics n_restricted=row_count;
 return jsonb_build_object('overdue_updated',n_overdue,'holds_upserted',n_restricted);
end $$;

create or replace function public.bct_admin_process_safety_training_reminders()
returns jsonb language plpgsql security invoker set search_path=public,auth as $$
declare a record; k text; nid uuid; n integer:=0;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 for a in select x.id,x.due_at,x.grace_until,c.auth_user_id from public.bct_safety_training_assignments x join public.bct_contractors c on c.id=x.contractor_id where x.status in('assigned','in_progress','overdue') and c.auth_user_id is not null loop
  k:=case when now()>a.grace_until then 'overdue' when now()>a.due_at then 'grace' when a.due_at<=now()+interval '1 day' then 'due_1d' when a.due_at<=now()+interval '3 days' then 'due_3d' when a.due_at<=now()+interval '7 days' then 'due_7d' else null end;
  if k is not null and not exists(select 1 from public.bct_safety_training_reminder_log l where l.assignment_id=a.id and l.reminder_key=k) then
   insert into public.bct_notifications(recipient_user_id,notification_type,subject,message,channel,status)
   values(a.auth_user_id,'safety_training','BCT safety training required',case when k='overdue' then 'Required safety training is overdue. New BCT work is restricted until completion.' when k='grace' then 'Required safety training is past due and is in the grace period. Complete it now to avoid a workforce restriction.' else 'Required BCT safety training is due soon. Sign in to the contractor portal to complete it.' end,'in_app','queued') returning id into nid;
   insert into public.bct_safety_training_reminder_log(assignment_id,reminder_key,notification_id) values(a.id,k,nid); n:=n+1;
  end if;
 end loop;
 return jsonb_build_object('notifications_queued',n);
end $$;

create or replace function public.bct_my_available_jobs()
returns setof public.bct_jobs language sql stable security invoker set search_path=public,auth as $$
 select j.* from public.bct_jobs j where j.status='open_for_bids' and(j.bid_deadline is null or j.bid_deadline>=now())
 and public.bct_contractor_workforce_eligible(public.bct_current_contractor_id())
 and exists(select 1 from public.bct_contractors c where c.auth_user_id=auth.uid() and c.active and j.trade=any(c.trade_capabilities) and j.required_language=any(c.spoken_languages))
 order by j.published_at desc nulls last,j.created_at desc
$$;

revoke all on function public.bct_admin_set_contractor_hold(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.bct_admin_set_contractor_hold(uuid,boolean,text) to authenticated;
revoke all on function public.bct_admin_exempt_safety_training(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_exempt_safety_training(uuid,text) to authenticated;
revoke all on function public.bct_refresh_safety_training_compliance() from public,anon,authenticated;
grant execute on function public.bct_refresh_safety_training_compliance() to authenticated;
revoke all on function public.bct_admin_process_safety_training_reminders() from public,anon,authenticated;
grant execute on function public.bct_admin_process_safety_training_reminders() to authenticated;
