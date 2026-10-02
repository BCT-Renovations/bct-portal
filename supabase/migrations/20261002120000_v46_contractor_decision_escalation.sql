-- V46 Contractor Portal decision/cannot-perform composition.
-- Extends existing field questions, scope items and action inbox. No parallel escalation system.

create or replace function public.bct_contractor_need_bct_decision(p_project_id uuid,p_question text,p_priority text default 'normal',p_scope_item_id uuid default null)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_id uuid; v_priority text:=lower(coalesce(nullif(btrim(p_priority),''),'normal'));
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if nullif(btrim(p_question),'') is null then raise exception 'Question is required'; end if;
 if v_priority not in ('normal','high','urgent','critical') then raise exception 'Invalid priority'; end if;
 if not exists(select 1 from public.bct_assignments a join public.bct_contractors c on c.id=a.contractor_id where a.project_id=p_project_id and c.auth_user_id=auth.uid() and lower(a.status) in ('active','assigned','accepted','in_progress')) then raise exception 'Active project assignment required'; end if;
 if p_scope_item_id is not null and not exists(select 1 from public.bct_scope_items s where s.id=p_scope_item_id and s.project_id=p_project_id) then raise exception 'Scope item does not belong to project'; end if;
 insert into public.bct_field_questions(project_id,question,asked_by,priority,status,decision_requested_at,affected_scope_item_id)
 values(p_project_id,btrim(p_question),auth.uid(),v_priority,'open',now(),p_scope_item_id) returning id into v_id;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 values(p_project_id,'contractor_bct_decision','Contractor needs BCT decision',case when v_priority in ('urgent','critical') then 'critical' else v_priority end,'open',now());
 return v_id;
end $$;
revoke all on function public.bct_contractor_need_bct_decision(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.bct_contractor_need_bct_decision(uuid,text,text,uuid) to authenticated;

create or replace function public.bct_contractor_report_cannot_perform(p_scope_item_id uuid,p_reason text)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_project uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if nullif(btrim(p_reason),'') is null then raise exception 'Reason is required'; end if;
 select s.project_id into v_project from public.bct_scope_items s where s.id=p_scope_item_id;
 if v_project is null then raise exception 'Scope item not found'; end if;
 if not exists(select 1 from public.bct_assignments a join public.bct_contractors c on c.id=a.contractor_id where a.project_id=v_project and c.auth_user_id=auth.uid() and lower(a.status) in ('active','assigned','accepted','in_progress')) then raise exception 'Active project assignment required'; end if;
 update public.bct_scope_items set cannot_perform_reason=btrim(p_reason),cannot_perform_reported_at=now(),cannot_perform_reported_by=auth.uid() where id=p_scope_item_id;
 insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at)
 values(v_project,'contractor_cannot_perform','Contractor reports assigned scope cannot be performed','critical','open',now());
 return p_scope_item_id;
end $$;
revoke all on function public.bct_contractor_report_cannot_perform(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_contractor_report_cannot_perform(uuid,text) to authenticated;
