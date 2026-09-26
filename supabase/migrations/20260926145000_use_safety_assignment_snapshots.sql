-- Make assigned safety requirements immutable for completion and contractor display.
create or replace function public.bct_complete_my_safety_training(p_assignment_id uuid,p_acknowledged boolean,p_quiz_score integer default null)
returns jsonb language plpgsql security definer set search_path=public,auth as $f$
declare v public.bct_safety_training_assignments%rowtype; m public.bct_safety_training_modules%rowtype; v_quiz boolean; v_pass integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not p_acknowledged then raise exception 'Safety acknowledgment is required'; end if;
 select * into v from public.bct_safety_training_assignments where id=p_assignment_id and contractor_id=public.bct_current_contractor_id() for update;
 if not found then raise exception 'Safety training assignment not found'; end if;
 if v.status in ('completed','exempt') then raise exception 'Safety training assignment is already closed'; end if;
 select * into m from public.bct_safety_training_modules where id=v.module_id;
 v_quiz:=coalesce(v.quiz_required_snapshot,m.quiz_required,false);
 v_pass:=coalesce(v.passing_score_snapshot,m.passing_score,80);
 if p_quiz_score is not null and (p_quiz_score<0 or p_quiz_score>100) then raise exception 'Quiz score must be between 0 and 100'; end if;
 if v_quiz and (p_quiz_score is null or p_quiz_score<v_pass) then raise exception 'Passing quiz score required'; end if;
 update public.bct_safety_training_assignments set status='completed',completed_at=now(),acknowledged_at=now(),quiz_score=p_quiz_score,completion_verified=true,updated_at=now() where id=v.id;
 if not exists(select 1 from public.bct_safety_training_assignments a where a.contractor_id=v.contractor_id and a.status not in('completed','exempt') and now()>a.grace_until) then
  insert into public.bct_contractor_workforce_holds(contractor_id,safety_restricted,safety_restricted_at) values(v.contractor_id,false,null)
  on conflict(contractor_id) do update set safety_restricted=false,safety_restricted_at=null,updated_at=now();
 end if;
 insert into public.bct_audit_events(actor_user_id,entity_type,entity_id,action,details) values(auth.uid(),'safety_training_assignment',v.id::text,'completed',jsonb_build_object('quiz_score',p_quiz_score,'passing_score',v_pass,'quiz_required',v_quiz));
 return jsonb_build_object('status','completed','workforce_eligible',public.bct_contractor_workforce_eligible(v.contractor_id));
end $f$;

create or replace function public.bct_my_safety_training() returns jsonb language sql stable set search_path=public as $f$
select jsonb_build_object(
 'workforce_eligible',public.bct_contractor_workforce_eligible(),
 'hold',(select to_jsonb(h) from public.bct_contractor_workforce_holds h where h.contractor_id=public.bct_current_contractor_id()),
 'assignments',coalesce((select jsonb_agg(to_jsonb(x) order by x.due_at) from (
  select a.id,a.cycle_key,a.assigned_at,a.due_at,a.grace_until,a.status,a.completed_at,a.acknowledged_at,a.quiz_score,
   coalesce(a.module_title_snapshot,m.title) title,coalesce(a.module_description_snapshot,m.description) description,
   coalesce(a.module_type_snapshot,m.module_type) module_type,coalesce(a.trade_code_snapshot,m.trade_code) trade_code,
   coalesce(a.video_url_snapshot,m.video_url) video_url,coalesce(a.quiz_required_snapshot,m.quiz_required) quiz_required,
   coalesce(a.passing_score_snapshot,m.passing_score) passing_score
  from public.bct_safety_training_assignments a left join public.bct_safety_training_modules m on m.id=a.module_id
  where a.contractor_id=public.bct_current_contractor_id()
 ) x),'[]'::jsonb)
);
$f$;
