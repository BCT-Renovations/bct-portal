-- BCT V46: secure contractor navigation address projection
-- Isolated feature branch only. Do not apply to production without approval.

create or replace function public.bct_my_assigned_contract_locations()
returns table (
  id uuid,
  project_number text,
  street_address text,
  city text,
  state text,
  zip_code text,
  property_name text,
  project_type text,
  description text,
  workflow_status text,
  assignment_status text,
  assigned_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    c.project_number,
    c.street_address,
    c.city,
    c.state,
    c.zip_code,
    c.property_name,
    c.project_type,
    c.description,
    c.workflow_status,
    a.status as assignment_status,
    a.assigned_at
  from public.bct_contracts c
  join public.bct_assignments a on a.project_id = c.id
  join public.bct_contractors k on k.id = a.contractor_id
  where k.auth_user_id = (select auth.uid())
    and a.status in ('awarded','accepted','scheduled','in_progress','quality_review','completed')
    and c.status <> 'draft'
  order by a.assigned_at desc;
$$;

revoke execute on function public.bct_my_assigned_contract_locations() from public;
revoke execute on function public.bct_my_assigned_contract_locations() from anon;
grant execute on function public.bct_my_assigned_contract_locations() to authenticated;

create or replace function public.bct_frontend_contractor_state()
returns jsonb
language plpgsql
stable
set search_path to 'public', 'auth'
as $function$
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
   'assigned_locations',coalesce((select jsonb_agg(to_jsonb(x) order by x.assigned_at desc) from public.bct_my_assigned_contract_locations() x),'[]'::jsonb),
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
$function$;
