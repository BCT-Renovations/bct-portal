# Isolated offline regression

Run from the repository root with Node 22 or newer:

```sh
npm ci --prefix tests/offline --ignore-scripts --no-audit --no-fund
node tests/offline/node_modules/playwright/cli.js install --with-deps chromium
node scripts/bct-isolated-offline-regression.mjs
```

The lockfile pins Playwright 1.62.1 (including playwright-core) and PGlite 0.3.14. No Supabase account, database connection, provider key or paid service is used. Browser methods are mocked and external browser requests are blocked or fulfilled locally. SQL executes only in disposable PGlite memory against a synthetic dependency schema.

Existing installed runtimes may be supplied using absolute `PLAYWRIGHT_MODULE`, `PGLITE_MODULE` and `CHROMIUM_EXECUTABLE` paths. The runner reports all failures and exits nonzero if any selected gate fails. The explicit list excludes hosted/live browser tests, which must never be run implicitly against production.

The suite covers 175 Agent/photo unit tests; current source/static and two 200-check source suites; insurance isolation and workflow gates; 14 staged migrations with 75 SQL assertions; mocked insurance browser tests; and 20 estimator, 21 Agent and 9 gallery browser assertions. Source-check counts are not feature completion counts. The 14 Agent UI position fixtures are not real tool/database acceptance.

Historical source snapshots still have known stale assertions. See the October 15 triage record; this selected suite does not imply every repository test or production acceptance passes. Real Supabase Auth/RLS/storage, full canonical-schema compatibility, provider calls and phone/Safari remain separate gates. Insurance remains dormant/Unfinished.
