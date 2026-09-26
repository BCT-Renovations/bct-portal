-- Keep contractor bidding independent by omitting BCT-only target amounts
-- from the contractor available-jobs feed.

create or replace function public.bct_my_available_jobs_safe()
returns table(
  id uuid,
  job_number text,
  title text,
  trade text,
  public_location text,
  sanitized_scope text,
  desired_start_date date,
  bid_deadline timestamptz,
  status text,
  published_at timestamptz,
  required_language text
)
language sql
stable
set search_path=public,auth
as $$
  select
    j.id,
    j.job_number,
    j.title,
    j.trade,
    j.public_location,
    j.sanitized_scope,
    j.desired_start_date,
    j.bid_deadline,
    j.status,
    j.published_at,
    j.required_language
  from public.bct_jobs j
  where j.status='open_for_bids'
    and (j.bid_deadline is null or j.bid_deadline>=now())
    and exists(
      select 1
      from public.bct_contractors c
      where c.auth_user_id=auth.uid()
        and c.active
        and j.trade=any(c.trade_capabilities)
        and j.required_language=any(c.spoken_languages)
    )
  order by j.published_at desc nulls last,j.created_at desc;
$$;

revoke execute on function public.bct_my_available_jobs_safe() from public;
grant execute on function public.bct_my_available_jobs_safe() to authenticated;

create or replace function public.bct_frontend_contractor_state()
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
   'context',public.bct_current_user_context(),'permissions',public.bct_my_permissions(),'dashboard',public.bct_my_contractor_dashboard(),
   'application',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_contractor_application() x),'[]'::jsonb),
   'profile',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_contractor_profile() x),'[]'::jsonb),
   'available_jobs',coalesce((select jsonb_agg(to_jsonb(x) order by x.published_at desc nulls last) from public.bct_my_available_jobs_safe() x),'[]'::jsonb),
   'bids',coalesce((select jsonb_agg(to_jsonb(x) order by x.submitted_at desc) from public.bct_my_bids() x),'[]'::jsonb),
   'assignments',coalesce((select jsonb_agg(to_jsonb(x) order by x.assigned_at desc) from public.bct_my_assignments() x),'[]'::jsonb),
   'rating_opportunities',coalesce((select jsonb_agg(to_jsonb(x)) from public.bct_rating_opportunities() x where x.rater_role='contractor'),'[]'::jsonb),
   'ratings',coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc) from public.bct_completion_ratings r where r.rater_user_id=auth.uid()),'[]'::jsonb),
   'cases',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_cases() x),'[]'::jsonb),
   'contracts',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_assigned_contracts() x),'[]'::jsonb),
   'contract_signatures',coalesce((select jsonb_agg(to_jsonb(x) order by x.signed_at desc) from public.bct_contractor_contract_signatures() x),'[]'::jsonb),
   'messages',coalesce((select jsonb_agg(to_jsonb(x) order by x.sent_at desc) from public.bct_my_assigned_project_messages() x),'[]'::jsonb),
   'schedule',coalesce(public.bct_contractor_upcoming_schedule(),'[]'::jsonb),
   'completion_requests',coalesce((select jsonb_agg(to_jsonb(x) order by x.requested_at desc) from public.bct_my_completion_requests() x),'[]'::jsonb),
   'service_calls',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_assigned_service_calls() x),'[]'::jsonb),
   'materials',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_assigned_materials() x),'[]'::jsonb),
   'notes',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_assigned_notes() x),'[]'::jsonb),
   'approvals',coalesce((select jsonb_agg(to_jsonb(x) order by x.requested_at desc) from public.bct_my_assigned_approvals() x),'[]'::jsonb),
   'documents',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_contractor_documents() x),'[]'::jsonb),
   'references',coalesce((select jsonb_agg(to_jsonb(x)) from public.bct_my_contractor_references() x),'[]'::jsonb),
   'notifications',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_notifications() x),'[]'::jsonb),
   'notification_counts',public.bct_my_notification_counts(),'payouts',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_payouts() x),'[]'::jsonb),'invoices',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_subcontractor_invoices() x),'[]'::jsonb),
   'punch_items',coalesce(public.bct_contractor_open_punch_items(),'[]'::jsonb),'tasks',coalesce(public.bct_contractor_open_tasks(),'[]'::jsonb),'compliance',public.bct_my_compliance_summary(),'application_summary',public.bct_my_application_status_summary(),'assignment_summary',public.bct_my_assignment_summary(),'document_summary',public.bct_my_document_status_summary(),'invoice_summary',public.bct_my_invoice_summary(),
   'required_policies',coalesce((select jsonb_agg(to_jsonb(x)) from public.bct_public_policies('contractor',lang) x),'[]'::jsonb),'policy_acceptances',coalesce((select jsonb_agg(to_jsonb(x) order by x.accepted_at desc) from public.bct_my_policy_acceptances() x),'[]'::jsonb),
   'upload_rules',public.bct_contractor_upload_rules(),'feature_flags',public.bct_frontend_feature_flags(),'config',public.bct_platform_config()
 ) into v; return v;
end
$$;

revoke execute on function public.bct_frontend_contractor_state() from public;
grant execute on function public.bct_frontend_contractor_state() to authenticated;
