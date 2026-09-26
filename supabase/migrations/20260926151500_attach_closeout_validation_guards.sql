-- Enforce final closeout prerequisites at the database boundary.
drop trigger if exists bct_closeout_validation_guard on public.bct_closeouts;
create trigger bct_closeout_validation_guard
before insert or update of closed_at,final_inspection_passed,punch_list_complete,customer_signoff_at,final_payment_received,contractor_paid,warranty_delivered
on public.bct_closeouts for each row execute function public.bct_validate_closeout();

drop trigger if exists bct_closeouts_updated_at on public.bct_closeouts;
create trigger bct_closeouts_updated_at before update on public.bct_closeouts
for each row execute function public.bct_set_updated_at();

drop trigger if exists bct_closeouts_audit on public.bct_closeouts;
create trigger bct_closeouts_audit after insert or update or delete on public.bct_closeouts
for each row execute function public.bct_log_detailed_audit_event();
