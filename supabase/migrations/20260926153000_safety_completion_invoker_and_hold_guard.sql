-- Run contractor completion with caller privileges and never clear an Admin hold.
create or replace function public.bct_complete_my_safety_training(p_assignment_id uuid,p_acknowledged boolean,p_quiz_score integer default null)
returns jsonb language plpgsql security invoker set search_path=public,auth as $f$
declare v public.bct_safety_training_assignments%rowtype; m public.bct_safety_training_modules%rowtype; v_quiz boolean; v_pass integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not p_acknowledged then raise exception 'Safety acknowledgment is required'; end if;
 select * into v from public.bct_safety_training_assignments where id=p_assignment_id and contractor_id=public.bct_current_contractor_id() for update;
 if not found then raise exception 'Safety training assignment not found'; end if;
 if v.status in ('completed','exempt') then raise exception 'Safety training assignment is already closed'; end if;
 select * into m from public.bct_safety_training_modules where id=v.module_id;
 v_quiz:=coalesce(v.quiz_required_snapshot,m.quiz_required,false); v_pass:=coalesce(v.passing_score_snapshot,m.passing_score,80);
 if p_quiz_score is not null and (p_quiz_score<0 or p_quiz_score>100) then raise exception 'Quiz score must be between 0 and 100'; end if;
 if v_quiz and (p_quiz_score is null or p_quiz_score<v_pass) then raise exception 'Passing quiz score required'; end if;
 update public.bct_safety_training_assignments set status='completed',completed_at=now(),acknowledged_at=now(),quiz_score=p_quiz_score,completion_verified=true,updated_at=now() where id=v.id;
 if not exists(select 1 from public.bct_safety_training_assignments a where a.contractor_id=v.contractor_id and a.status not in('completed','exempt') and now()>a.grace_until) then
  update public.bct_contractor_workforce_holds set safety_restricted=false,safety_restricted_at=null,updated_at=now() where contractor_id=v.contractor_id and coalesce(admin_hold,false)=false;
 end if;
 insert into public.bct_audit_events(actor_user_id,entity_type,entity_id,action,details) values(auth.uid(),'safety_training_assignment',v.id::text,'completed',jsonb_build_object('quiz_score',p_quiz_score,'passing_score',v_pass,'quiz_required',v_quiz));
 return jsonb_build_object('status','completed','workforce_eligible',public.bct_contractor_workforce_eligible(v.contractor_id));
end $f$;
