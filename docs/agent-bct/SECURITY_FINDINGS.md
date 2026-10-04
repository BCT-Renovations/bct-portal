# Agent BCT Security Findings

Discovery date: 2026-10-01
Scope: read-only architecture/security review for Agent BCT. No production permission changes were made.

## S-001 — Existing Estimator frontend/backend persistence mismatch

Severity for Agent integration: HIGH / BLOCKING FOR ESTIMATOR LIVE TOOLS

Production frontend modules reference estimator persistence including `bct_estimator_applications` and assessment/assignment concepts. Live database catalog inspection found no estimator/assessment tables, functions, triggers, or columns and confirmed likely estimator table names do not exist.

Agent decision: general approved Estimator policy answers are allowed; live estimator status/actions are disabled until the existing V46 Estimator backend is reconciled. Agent BCT will not create a duplicate estimator system as a workaround.

## S-002 — Existing authenticated-callable SECURITY DEFINER functions

Severity for Agent integration: HIGH / EXCLUDE FROM AGENT

Supabase Security Advisor reported 13 `authenticated_security_definer_function_executable` warnings. Findings include Admin/Contractor/Homeowner Live Quality functions plus password-history functions.

Agent decision:
- none of the flagged functions enter the Agent BCT tool allowlist;
- Agent BCT will not use arbitrary RPC invocation;
- production remediation belongs to a controlled BCT security change, not an incidental Agent BCT modification;
- before production integration, rerun Supabase Security Advisor and review any remaining findings.

## S-003 — Leaked password protection disabled

Severity for Agent integration: MEDIUM / EXISTING PLATFORM CONFIGURATION

Supabase Security Advisor reports leaked-password protection disabled.

Agent decision: no Agent-specific workaround. Track as a production security readiness item. Agent BCT must not weaken password/auth controls.

## Verified positive controls

- Critical project/bid/assignment/message/notification/financing/escrow/payment/contract/language/profile/policy tables inspected have RLS enabled.
- Candidate Phase 1 user-scoped RPCs inspected are `SECURITY INVOKER` (`prosecdef=false`) and executable by `authenticated`, including `bct_my_permissions`, project dashboard/summary, messages, notifications, financing, escrow and payments.
- Supabase current guidance confirms RLS is required for exposed-schema tables, user-editable metadata must not be trusted for authorization, and service-role/secret credentials must not be exposed in browser code.

## Production integration security gate

Before Agent BCT can merge:
1. rerun security advisors;
2. verify every Agent-exposed RPC/function signature and grant;
3. test unauthenticated, wrong-role, cross-user and cross-project calls;
4. test prompt-injection payloads in messages/files/project descriptions;
5. verify no Agent secret/service-role key reaches browser assets;
6. verify Agent outage leaves normal BCT portals operational;
7. resolve or explicitly disposition S-001 and S-002;
8. run V46 regression and mobile/iPhone tests.
