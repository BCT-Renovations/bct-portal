-- Keep safety program configuration BCT Admin-only and make reminder timing honor Admin settings.
drop policy if exists "Safety settings authenticated read" on public.bct_safety_training_settings;
create policy "Safety settings admin read" on public.bct_safety_training_settings for select to authenticated using(public.is_bct_admin());

create or replace function public.bct_admin_process_safety_training_reminders()
returns jsonb language plpgsql security invoker set search_path=public,auth as $$
declare a record;k text;nid uuid;n integer:=0;s public.bct_safety_training_settings%rowtype;d integer;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required';end if;
 select * into s from public.bct_safety_training_settings where singleton;
 if not coalesce(s.enabled,false) then return jsonb_build_object('notifications_queued',0,'enabled',false);end if;
 for a in select x.id,x.contractor_id,x.due_at,x.grace_until,x.status,c.auth_user_id from public.bct_safety_training_assignments x join public.bct_contractors c on c.id=x.contractor_id where x.status in('assigned','in_progress','overdue') and c.auth_user_id is not null loop
   k:=null;
   if now()>a.grace_until then k:='overdue';
   elsif now()>a.due_at then k:='grace';
   else foreach d in array coalesce(s.reminder_days,array[7,3,1]) loop if a.due_at<=now()+make_interval(days=>d) then k:='due_'||d||'d';end if;end loop;
   end if;
   if k is not null and not exists(select 1 from public.bct_safety_training_reminder_log l where l.assignment_id=a.id and l.reminder_key=k) then
     insert into public.bct_notifications(recipient_user_id,notification_type,subject,message,channel,status) values(a.auth_user_id,'safety_training','BCT safety training required',case when k='overdue' then 'Required safety training is overdue. New BCT work is restricted until completion.' when k='grace' then 'Required safety training is past due and is in the grace period. Complete it now to avoid a workforce restriction.' else 'Required BCT safety training is due soon. Sign in to the contractor portal to complete it.' end,'in_app','queued') returning id into nid;
     insert into public.bct_safety_training_reminder_log(assignment_id,reminder_key,notification_id) values(a.id,k,nid);n:=n+1;
   end if;
 end loop;
 return jsonb_build_object('notifications_queued',n,'reminder_days',s.reminder_days);
end $$;
revoke all on function public.bct_admin_process_safety_training_reminders() from public,anon;
grant execute on function public.bct_admin_process_safety_training_reminders() to authenticated;
