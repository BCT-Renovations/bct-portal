-- Require explicit evidence before approval states are valid.
alter table public.bct_change_orders drop constraint if exists bct_change_order_approval_evidence_ck;
alter table public.bct_change_orders add constraint bct_change_order_approval_evidence_ck check (
 (status<>'approved') or (homeowner_approved_at is not null and bct_approved_at is not null)
) not valid;
alter table public.bct_change_orders validate constraint bct_change_order_approval_evidence_ck;

alter table public.bct_job_approvals drop constraint if exists bct_job_approval_response_evidence_ck;
alter table public.bct_job_approvals add constraint bct_job_approval_response_evidence_ck check (
 (status='pending' and responded_by is null and responded_at is null)
 or (status in('approved','rejected') and responded_by is not null and responded_at is not null)
) not valid;
alter table public.bct_job_approvals validate constraint bct_job_approval_response_evidence_ck;
