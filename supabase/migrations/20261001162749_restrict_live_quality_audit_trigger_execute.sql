-- Mirror the already-applied live hardening so repository migration history
-- reproduces the same least-privilege trigger-function permissions.
revoke execute on function public.bct_live_quality_check_audit() from public, anon, authenticated;
