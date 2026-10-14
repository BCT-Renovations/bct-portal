# TAKAI Insurance — isolated staging validation

**Production safety:** This folder is deliberately outside `supabase/migrations/`. Never copy or apply these files to the live Supabase project without explicit BCT owner approval. The existing `bct_insurance_claims` and `bct_insurance_policies` tables must not be modified.

## Order and gates

1. Use a separate disposable Supabase project/database with a compatible TAKAI schema and `public.is_bct_admin()` function. Do not use the live project or live user records.
2. Apply the 14 SQL files from `supabase/insurance-isolated-migrations/` in ascending filename order. The final `20261002013500` migration overrides earlier mutation RPCs with the strictest partner role checks.
3. Execute `node tests/takai-insurance-staged-migrations-gate.mjs` and `node tests/takai-insurance-isolation-gate.mjs` against the checked-out isolated branch. These are **static checks**, not substitutes for database tests.
4. Test roles using separate dummy users: BCT Admin, approved organization admin, approved adjuster, approved claims representative, read-only member, suspended member, suspended organization member, and unrelated organization member.
5. Verify read-only members can read only authorized claims but cannot submit claims, post messages, answer information requests, or submit supplements. Suspended organizations and members must fail all partner writes.
6. Verify cross-organization claim reads and writes fail, and `bct_only` event history is never visible to partner accounts.
7. Submit the same organization/claim number twice: the second attempt must be rejected by the unique constraint. Verify two insurance claims cannot link to the same canonical project.
8. Verify a supplement on a `construction` claim does not roll status back to `supplement`. Only BCT Admin may approve, link a canonical project, activate construction, and complete insurance work.
9. Confirm the public insurance preview is visual-only and does not call the live backend. Confirm the operational portal and admin modules remain dormant until explicit activation.
10. Only after all gates pass, deploy the **isolated preview** for phone/browser review. Production activation requires a separate approval.

## Outstanding limitation

The insurance operational portal currently shares the primary BCT Supabase client. Its sign-in refuses to replace a different active BCT user, but a fresh sign-in with no existing session still uses the shared client. Before operational activation, verify the intended single-sign-on experience and session behavior across all TAKAI portals in an isolated browser environment.

## Test status

Static test code and SQL hardening have been committed. Full Node execution, disposable-database migrations, live RLS permission probes, and browser smoke tests have **not** been verified in this work batch. Do not mark them green without actual test results.
