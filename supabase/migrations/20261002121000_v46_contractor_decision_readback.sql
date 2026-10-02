-- V46 contractor decision status readback. Development only.
create or replace function public.bct_my_contractor_decisions()
returns jsonb language sql stable security invoker set search_path=public,auth as $$
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',q.id,'project_id',q.project_id,'question',q.question,'priority',q.priority,
  'status',q.status,'answer',q.answer,'bct_decision',q.bct_decision,
  'decided_at',q.decided_at,'blocks_work',q.blocks_work,'needed_by',q.needed_by
 )),'[]'::jsonb)
 from public.bct_field_questions q
 where q.asked_by=auth.uid() and q.question_category='bct_decision';
$$;
revoke all on function public.bct_my_contractor_decisions() from public,anon,authenticated;
grant execute on function public.bct_my_contractor_decisions() to authenticated;
