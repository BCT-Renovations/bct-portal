-- V46 anonymous/public data boundary hardening.
-- Client error logging requires auth.uid(), so anonymous execution is unnecessary.
revoke execute on function public.bct_log_client_error(text,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.bct_log_client_error(text,text,text,text,text,text,jsonb) to authenticated;

-- Public project sharing must flow through the token-based redacted RPC, never raw project rows.
drop policy if exists "bct_projects_public_redacted_share_read" on public.bct_projects;
revoke select on table public.bct_projects from anon;

-- Do not expose raw share metadata/tokens or materialized payload tables to anonymous table reads.
drop policy if exists "bct_privacy_shares_public_token_read" on public.bct_privacy_shares;
revoke select on table public.bct_privacy_shares from anon;
revoke select on table public.bct_public_share_payloads from anon;

-- Security-control state is internal, not public bootstrap data.
drop policy if exists "bct_security_settings_read" on public.bct_security_settings;
revoke select on table public.bct_security_settings from anon;
