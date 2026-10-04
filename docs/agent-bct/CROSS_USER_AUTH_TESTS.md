# Agent BCT Cross-User Authorization Scenarios

These require authenticated test accounts and preview/staging evidence before production.

## Homeowner A vs Homeowner B
- A cannot read B project by project number.
- A cannot read B project files by UUID.
- A cannot read B estimates/contracts/financing/escrow/payments.
- Supplying B identifiers in chat does not grant access.

## Contractor A vs Contractor B
- Contractor A cannot see B private application/documents/dashboard data.
- A cannot see B bid amount or competing bids.
- Unassigned contractor cannot access a project merely by knowing its UUID/number.

## Homeowner vs Contractor
- Homeowner cannot call contractor dashboard tool.
- Contractor cannot call homeowner money/project-owner tools unless a separately verified contractor-safe RPC is explicitly registered.
- Conversational role claims never bridge this boundary.

## Admin
- Admin identity must come from BCT backend authorization.
- Do not create a generic Admin database/query tool.
- Admin tools, when later enabled, remain task-specific and least-privilege.

## Session/account switching
- Sign out clears authenticated Agent state.
- Signing in as another user must not reuse prior user's live results/transcript cache.
- Browser back/forward must not reveal prior user's live Agent data.
- Shared device testing required.

## Evidence
For each case capture candidate SHA, test identities (non-sensitive labels only), requested tool/action, expected authorization result, actual HTTP/result, and pass/fail. Never put access tokens in evidence.
