# Agent BCT Authorization Primitive Map

Verified against live Supabase on 2026-10-01. No database change applied.

Existing SECURITY INVOKER authorization primitives:
- `bct_user_owns_project(project_uuid)`
- `bct_user_assigned_to_project(project_uuid)`
- `bct_user_can_view_project(project_uuid)`
- `bct_user_can_access_case_project(project_uuid)`

These are reusable backend authorization boundaries. Agent BCT must not duplicate their logic in model prompts or browser JavaScript.

## Rule

For live data/actions, prefer an existing user-scoped RPC that already applies the correct ownership/assignment semantics. If a new Agent wrapper is eventually required, it must call/reuse the appropriate BCT authorization primitive and still rely on RLS where applicable.

Knowing a project UUID/number is never authorization.

Do not use service-role access to turn a denied authorization primitive into success.

## Testing implication

Preview cross-user tests must deliberately supply another user's valid project identifier and verify denial. This proves authorization is identity-based rather than identifier secrecy.
