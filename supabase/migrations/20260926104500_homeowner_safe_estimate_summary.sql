-- Keep homeowner estimate summaries customer-safe.
-- Homeowners may see released estimate totals and public scope text only.
-- BCT-only internal cost, markup, internal notes and approver metadata stay admin-only.

create or replace function public.bct_my_estimates_safe()
returns table(
  id uuid,
  project_id uuid,
  estimate_number text,
  version integer,
  status text,
  subtotal numeric,
  discount_percent numeric,
  discount_amount numeric,
  total numeric,
  ai_assisted boolean,
  ai_summary text,
  assumptions text,
  created_at timestamptz,
  updated_at timestamptz,
  approved_at timestamptz
)
language sql
stable
set search_path=public,auth
as $$
  select
    e.id,
    e.project_id,
    e.estimate_number,
    e.version,
    e.status,
    e.subtotal,
    e.discount_percent,
    e.discount_amount,
    e.total,
    e.ai_assisted,
    e.ai_summary,
    e.assumptions,
    e.created_at,
    e.updated_at,
    e.approved_at
  from public.bct_estimates e
  join public.bct_projects p on p.id=e.project_id
  join public.bct_customers c on c.id=p.customer_id
  where c.auth_user_id=auth.uid()
    and e.status in ('sent','accepted','declined')
  order by e.created_at desc;
$$;

revoke execute on function public.bct_my_estimates_safe() from public;
grant execute on function public.bct_my_estimates_safe() to authenticated;

create or replace function public.bct_frontend_homeowner_state()
returns jsonb
language plpgsql
stable
set search_path=public,auth
as $$
declare v jsonb; lang text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 lang:=coalesce((select preferred_language from public.user_profiles where user_id=auth.uid()),'en');
 select jsonb_build_object(
   'context',public.bct_current_user_context(),'permissions',public.bct_my_permissions(),'dashboard',public.bct_my_homeowner_dashboard(),
   'projects',coalesce((select jsonb_agg(to_jsonb(x) order by x.submitted_at desc) from public.bct_my_homeowner_projects() x),'[]'::jsonb),
   'rating_opportunities',coalesce((select jsonb_agg(to_jsonb(x)) from public.bct_rating_opportunities() x where x.rater_role='homeowner'),'[]'::jsonb),
   'ratings',coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc) from public.bct_completion_ratings r where r.rater_user_id=auth.uid()),'[]'::jsonb),
   'cases',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_cases() x),'[]'::jsonb),
   'notifications',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_notifications() x),'[]'::jsonb),'notification_counts',public.bct_my_notification_counts(),
   'service_calls',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_service_calls() x),'[]'::jsonb),
   'financing',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_financing() x),'[]'::jsonb),
   'escrow',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_escrow() x),'[]'::jsonb),
   'estimates',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_estimates_safe() x),'[]'::jsonb),
   'estimate_items',coalesce((select jsonb_agg(to_jsonb(x) order by x.estimate_id,x.sort_order) from public.bct_my_estimate_items_safe() x),'[]'::jsonb),
   'contracts',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_contracts() x),'[]'::jsonb),
   'contract_signatures',coalesce((select jsonb_agg(to_jsonb(x) order by x.signed_at desc) from public.bct_my_contract_signatures() x),'[]'::jsonb),
   'payments',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_payments() x),'[]'::jsonb),
   'schedule',coalesce((select jsonb_agg(to_jsonb(x) order by x.starts_at) from public.bct_my_schedule() x),'[]'::jsonb),
   'messages',coalesce((select jsonb_agg(to_jsonb(x) order by x.sent_at desc) from public.bct_my_project_messages() x),'[]'::jsonb),
   'warranties',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_warranties() x),'[]'::jsonb),
   'weather',coalesce((select jsonb_agg(to_jsonb(x) order by x.check_date desc,x.created_at desc) from public.bct_my_weather_checks() x),'[]'::jsonb),
   'identifiers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_project_identifiers() x),'[]'::jsonb),
   'completion_certificates',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_completion_certificates() x),'[]'::jsonb),
   'decisions',public.bct_my_pending_decisions(),'approvals',public.bct_my_open_approvals(),'summary_cards',public.bct_my_project_summary_cards(),
   'required_policies',coalesce((select jsonb_agg(to_jsonb(x)) from public.bct_public_policies('homeowner',lang) x),'[]'::jsonb),
   'policy_acceptances',coalesce((select jsonb_agg(to_jsonb(x) order by x.accepted_at desc) from public.bct_my_policy_acceptances() x),'[]'::jsonb),
   'upload_rules',public.bct_homeowner_upload_rules(),'feature_flags',public.bct_frontend_feature_flags(),'config',public.bct_platform_config()
 ) into v; return v;
end
$$;

revoke execute on function public.bct_frontend_homeowner_state() from public;
grant execute on function public.bct_frontend_homeowner_state() to authenticated;
