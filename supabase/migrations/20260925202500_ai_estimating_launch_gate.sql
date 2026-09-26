-- Upgrade BCT AI estimating state to explicitly expose launch gating.
create or replace function public.bct_admin_ai_estimating_state(p_project_id uuid default null)
returns jsonb language plpgsql stable set search_path=public,auth as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required'; end if;
 return jsonb_build_object(
  'engine_version','2026.09.25-ai-2',
  'admin_review_required',true,
  'manual_approval_only',true,
  'external_model_enabled',false,
  'external_model_status','not_configured',
  'generation_mode','rules_rate_card_draft',
  'rate_cards',(select coalesce(jsonb_agg(to_jsonb(r) order by r.service_code,r.version desc),'[]'::jsonb) from public.bct_estimate_rate_cards r where r.active),
  'runs',(select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) from public.bct_ai_estimate_runs x where p_project_id is null or x.project_id=p_project_id),
  'feedback',(select coalesce(jsonb_agg(to_jsonb(f) order by f.created_at desc),'[]'::jsonb) from public.bct_ai_estimate_feedback f join public.bct_ai_estimate_runs x on x.id=f.run_id where p_project_id is null or x.project_id=p_project_id),
  'accuracy',public.bct_admin_ai_estimate_accuracy()
 );
end $$;