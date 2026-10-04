# Agent BCT Data-Minimization Review

Review date: 2026-10-01

Existing user-scoped RPCs are useful authorization boundaries, but some return whole table rows. Agent BCT must not automatically pass whole records to the model.

## Safe/curated surfaces

- `bct_my_permissions()` — curated JSON permission response.
- `bct_my_project_dashboard(project_number)` — curated homeowner project summary.
- `bct_my_project_summary_cards()` — project summaries, still review fields before model context.
- `bct_my_estimates_safe()` — intentionally customer-safe estimate fields/statuses.
- `bct_my_contract_summary()` — aggregate contract summary.
- `bct_my_contractor_dashboard()` — aggregate contractor dashboard.

## Whole-row surfaces requiring server-side projection

These functions return `SETOF <table>` and therefore may include fields Agent BCT does not need:
- `bct_my_notifications()`
- `bct_my_project_files(...)`
- `bct_my_schedule()`
- `bct_my_financing()`
- `bct_my_escrow()`
- `bct_my_payments()`

Rule: tool handlers must project an explicit allowlist of fields before any result is included in model context or client response. Do not simply JSON-forward the RPC result.

## Role limitation discovered

Several `bct_my_*` functions are homeowner-specific because they join projects through `bct_customers.auth_user_id=auth.uid()` or call `bct_user_owns_project`. They cannot be assumed to serve assigned contractors/Admin.

Rule: tool registry declares supported roles per tool. Contractor/Admin live tools must use their own verified backend surfaces. Never broaden a homeowner RPC or bypass it with service-role access merely to make a generic tool work.

## Authorization model note

`bct_my_permissions()` derives:
- Admin from `app_metadata.role='admin'`;
- contractor from contractor/application records;
- otherwise homeowner.

`is_bct_admin()` accepts app-metadata roles `admin`, `bct_admin`, `owner` and also recognizes the configured BCT owner email.

Agent rule: backend functions remain authoritative. The Agent never maps a chat statement to a role.


## Money/contract function verification — 2026-10-01

Read-only live schema inspection confirms:
- `bct_my_contract_summary()` returns curated JSONB and is SECURITY INVOKER.
- `bct_my_estimates_safe()` returns an explicit customer-safe table shape and is SECURITY INVOKER.
- `bct_my_financing()`, `bct_my_escrow()`, and `bct_my_payments()` are SECURITY INVOKER but return whole table rows.

Therefore Agent BCT keeps explicit server-side projection for financing/escrow/payments and must not forward their raw rows. Money tools remain read-only/high-risk and cannot be interpreted as authority to approve financing, release escrow, refund, create payments, or alter amounts.
