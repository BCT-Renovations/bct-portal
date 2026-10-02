-- BCT Admin resolution path for contractor field decisions. Development only.
create or replace function public.bct_admin_resolve_contractor_decision(p_question_id uuid,p_decision text)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_project uuid;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT admin access required'; end if;
 if nullif(btrim(p_decision),'') is null then raise exception 'Decision is required'; end if;
 update public.bct_field_questions
 set bct_decision=btrim(p_decision),answer=btrim(p_decision),status='answered',
     answered_at=now(),decided_at=now(),decided_by=auth.uid()
 where id=p_question_id returning project_id into v_project;
 if v_project is null then raise exception 'Decision request not found'; end if;
 return p_question_id;
end $$;
revoke all on function public.bct_admin_resolve_contractor_decision(uuid,text) from public,anon,authenticated;
grant execute on function public.bct_admin_resolve_contractor_decision(uuid,text) to authenticated;
