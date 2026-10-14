# TAKAI isolated insurance verification — October 14, 2026

Base verified: `b3164369a9716eb17debb12e1099d53ddcd420d0` on `feature/takai-insurance-integration-isolated-20261014`.

## Changes verified locally

- Corrected the SQL-body extractor and invalid JavaScript regex in existing automated gates. The earlier correction commit existed but the branch's tests still failed before this batch.
- Reviewed and executed all 14 staged SQL files against disposable PostgreSQL (PGlite 0.3.14). Executed the package again to check reapplication. A minimal synthetic TAKAI dependency schema supplies `auth.users`, `auth.uid()`, `is_bct_admin()` and canonical projects; this does not represent a full hosted Supabase clone.
- Fixed overlapping permissive membership policies. Adjusters cannot enumerate other members; organization admins retain their management visibility.
- Explicit SELECT grants support databases without automatic Data API table grants; anonymous table access and direct authenticated writes remain denied.
- Added a case-insensitive, trimmed claim-number unique index per organization; retained one-to-one canonical project linkage.
- Suspended organizations lose partner claim read/write access. Read-only users cannot mutate claims, even when assigned.
- Added insurance-visible reasons/information requests to Admin decisions through an audited RPC. Private notes remain private.
- Fixed async form event handling, duplicate submission lock, missing-session authentication handling, password clearing, session-change cleanup, read-only controls, company activation check, escaped history responses, and mint Back controls.
- Set `completed_at` during completion. Supplements preserve active construction.

## Executed checks

PASS: 65 disposable PostgreSQL migration/permission/workflow assertions including 14 first applications, 14 reapplications, duplicate claims, duplicate project linkage, cross-carrier isolation, read-only writes, private history, information requests, suspended-company access, construction lifecycle, and legacy table preservation.

PASS: four existing insurance static suites and syntax checks for all insurance JavaScript modules.

PASS: mocked Chromium browser regression — public visual-only preview makes no backend calls; existing account reused; password cleared; input escaped; information response displayed; duplicate submission blocked; read-only UI enforced; Admin panel created once and guarded.

PASS: existing Admin job-page and Admin section-navigation regressions.

BASELINE FAILURE: `scripts/bct-source-integrity-smoke-current.mjs` expects old service-worker cache marker `bct-command-center-hotfix`. The unchanged TAKAI service worker intentionally unregisters for the iPhone icon fix. This batch does not restore old caching behavior or alter this shared test.

## Reproduce disposable tests

Install exact dependencies outside the repository:

```sh
npm install --prefix /tmp/bct-insurance-test --save-exact @electric-sql/pglite@0.3.14 playwright@1.62.1
PGLITE_MODULE=/tmp/bct-insurance-test/node_modules/@electric-sql/pglite/dist/index.js node tests/takai-insurance-database.mjs
PLAYWRIGHT_MODULE=/tmp/bct-insurance-test/node_modules/playwright node tests/takai-insurance-browser.mjs
```

The browser test also accepts `CHROMIUM_EXECUTABLE` when a local Chromium is already installed. It uses an entirely mocked backend and synthetic records.

## Still pending — do not declare complete

- Only production Supabase project `onpqykpikxbbypfvmtin` is connected. No migrations or data writes were sent there. A separate hosted test project is needed for real Supabase Auth, REST/RPC grants, advisors, and the full canonical schema compatibility test.
- Operational insurance modules remain dormant in the TAKAI entrypoint and Admin loader. The public entry remains visual-only. Nothing is activated against production.
- Approved organization selection is available; real multi-company memberships must still be exercised against isolated Supabase Auth and RLS.
- Full phone/Safari and hosted end-to-end tests remain pending. Document/photo upload and signed attachment access are not implemented by this batch.
- Vercel inspection shows an older READY preview at `a1ca5336`, no preview for base `b3164369`. A successful read API call does not establish that the deployment daily quota has reset.
- TAKAI Live, canonical project creation, existing portal source, and production migrations are unchanged.
