# Isolated offline regression

Run from the repository root with Node 22 or newer:

```sh
npm ci --prefix tests/offline --ignore-scripts --no-audit --no-fund
node tests/offline/node_modules/playwright/cli.js install --with-deps chromium
node scripts/bct-isolated-offline-regression.mjs
```

The lockfile pins Playwright 1.62.1 (including playwright-core) and PGlite 0.3.14. No Supabase account, database connection, provider key or paid service is used. Browser methods are mocked and external browser requests are blocked or fulfilled locally. SQL executes only in disposable PGlite memory against a synthetic dependency schema.

Existing installed runtimes may be supplied using absolute `PLAYWRIGHT_MODULE`, `PGLITE_MODULE` and `CHROMIUM_EXECUTABLE` paths. The runner reports all failures and exits nonzero if any selected gate fails. The explicit list excludes hosted/live browser tests, which must never be run implicitly against production.

The suite covers 183 Agent/photo/control-safety/Live-preservation unit tests; all 49 selected source/static suites; insurance isolation and workflow gates; 14 staged migrations with 75 SQL assertions; mocked insurance browser tests; and 21 estimator, 21 Agent, 10 gallery and 39 contractor / 15 Admin / 18 simulation browser assertions. Source-check counts are not feature completion counts. The 14 Agent UI position fixtures are not real tool/database acceptance.

All 19 formerly failing source scripts and the additional round-9 baseline now pass; the runner executes 59 commands. See the October 15 reconciliation record for each contract correction. This does not imply hosted/production acceptance passes. Real Supabase Auth/RLS/storage, full canonical-schema compatibility, provider calls and phone/Safari remain separate gates. Insurance remains dormant/Unfinished.
