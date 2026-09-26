-- Password history is intentionally SECURITY DEFINER because direct table access is denied by RLS.
-- Limit RPC execution to authenticated users; each function scopes work to auth.uid().
revoke all on function public.bct_validate_password_not_recent(text) from public,anon;
revoke all on function public.bct_record_password_history(text) from public,anon;
grant execute on function public.bct_validate_password_not_recent(text) to authenticated;
grant execute on function public.bct_record_password_history(text) to authenticated;
