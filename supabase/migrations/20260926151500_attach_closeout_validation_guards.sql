-- Reconcile closeout trigger protection without duplicating existing guards.
-- Production already has bct_closeout_guard (bct_validate_closeout) and
-- bct_closeout_audit (bct_log_detailed_audit_event). Ensure updated_at exists.
drop trigger if exists bct_closeouts_updated_at on public.bct_closeouts;
create trigger bct_closeouts_updated_at before update on public.bct_closeouts
for each row execute function public.bct_set_updated_at();

-- Remove duplicate names if this migration is replayed after an earlier draft.
drop trigger if exists bct_closeout_validation_guard on public.bct_closeouts;
drop trigger if exists bct_closeouts_audit on public.bct_closeouts;
