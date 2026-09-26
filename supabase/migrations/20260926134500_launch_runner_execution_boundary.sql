-- V46 production parity guard for launch automation runners.
-- This migration records the security/grant boundary verified in production.
-- The runner bodies remain represented by their original production migrations;
-- this guard prevents accidental anonymous/public execution after future changes.

revoke all on function public.bct_admin_run_launch_automations() from public, anon;
revoke all on function public.bct_admin_run_200_launch_checks() from public, anon;
revoke all on function public.bct_admin_run_500_launch_validations() from public, anon;
revoke all on function public.bct_admin_run_1000_launch_requirements() from public, anon;

grant execute on function public.bct_admin_run_launch_automations() to authenticated;
grant execute on function public.bct_admin_run_200_launch_checks() to authenticated;
grant execute on function public.bct_admin_run_500_launch_validations() to authenticated;
grant execute on function public.bct_admin_run_1000_launch_requirements() to authenticated;

-- Production verification on 2026-09-26:
-- all four functions are SECURITY INVOKER, volatile, no-argument JSONB runners.
-- Internal is_bct_admin() checks remain the human authorization boundary.
