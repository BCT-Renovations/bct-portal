# Agent BCT Tool Grant Verification

Verified read-only against live Supabase on 2026-10-01. No grants changed.

Authenticated EXECUTE exists for the currently registered user-scoped Agent RPC surfaces:
- bct_my_permissions
- bct_my_project_summary_cards
- bct_my_project_dashboard
- bct_my_notifications
- bct_my_project_files
- bct_my_schedule
- bct_my_upcoming_schedule
- bct_my_estimates_safe
- bct_my_contract_summary
- bct_my_financing
- bct_my_escrow
- bct_my_payments
- bct_my_contractor_dashboard

`bct_active_services_localized` has EXECUTE for both anon and authenticated. Agent's generic tool endpoint nevertheless remains authenticated by design; public service discovery should use a separate narrow public path if later desired rather than weakening the generic executor.

No current Agent tool requires a new production EXECUTE grant. Do not broaden grants merely to make Agent behavior convenient. Existing RPC authorization/RLS plus Agent role/tool allowlisting remain layered controls.
