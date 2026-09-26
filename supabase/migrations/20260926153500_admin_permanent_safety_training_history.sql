-- Permanent BCT Admin safety training transcript.
create or replace function public.bct_admin_safety_training_history(p_contractor_id uuid default null)
returns jsonb language plpgsql stable security invoker set search_path=public,auth as $f$
declare v_rows jsonb;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.assigned_at desc),'[]'::jsonb) into v_rows from (
  select a.id assignment_id,a.contractor_id,c.legal_name,c.business_name,c.email,c.primary_trade,
   a.cycle_key,a.assigned_at,a.due_at,a.grace_until,a.status,a.completed_at,a.acknowledged_at,
   a.quiz_score,a.completion_verified,a.exemption_reason,
   coalesce(a.module_title_snapshot,m.title) module_title,
   coalesce(a.module_description_snapshot,m.description) module_description,
   coalesce(a.module_type_snapshot,m.module_type) module_type,
   coalesce(a.trade_code_snapshot,m.trade_code) trade_code,
   coalesce(a.quiz_required_snapshot,m.quiz_required,false) quiz_required,
   coalesce(a.passing_score_snapshot,m.passing_score,80) passing_score,
   case when coalesce(a.quiz_required_snapshot,m.quiz_required,false)
        then a.quiz_score>=coalesce(a.passing_score_snapshot,m.passing_score,80)
        else a.status='completed' end passed,
   coalesce(h.safety_restricted,false) safety_restricted,coalesce(h.admin_hold,false) admin_hold,h.admin_hold_reason
  from public.bct_safety_training_assignments a
  join public.bct_contractors c on c.id=a.contractor_id
  left join public.bct_safety_training_modules m on m.id=a.module_id
  left join public.bct_contractor_workforce_holds h on h.contractor_id=a.contractor_id
  where p_contractor_id is null or a.contractor_id=p_contractor_id
 ) x;
 return jsonb_build_object('records',v_rows,'record_count',jsonb_array_length(v_rows),'generated_at',now());
end $f$;
revoke all on function public.bct_admin_safety_training_history(uuid) from public,anon;
grant execute on function public.bct_admin_safety_training_history(uuid) to authenticated;
