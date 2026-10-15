# Estimator offline checkpoint — October 15, 2026

Parent checkpoint: bbb8717a. Uses the existing isolated branch; no hosted service calls.

## Local fixes

- Checklist 8: missing client/insert response can no longer be treated as success. Errors preserve the application.
- Checklist 12–13: caller-verified account reads its own assignments and profile; assignment choices contain only that user's paid, completed assessments. Unavailable data is distinct from an empty assignment list. Account/profile fields are escaped.
- Checklist 16–17: synchronous submission locks prevent concurrent applications; successful email submissions are guarded within the session, database duplicate-email errors are explained, and only confirmed success clears the captured form. Failed requests retain draft fields and files.
- Existing authenticated accounts are verified and reused. An unauthorized account is denied without signing out the shared TAKAI session. Passwords clear after sign-in attempts. Session changes invalidate delayed account reads and clear previous-account assessment drafts.
- Checklist 9–11 are **partial**: selected files no longer disappear silently, and the portal cannot assert uploaded-photo completeness for local files. Private credential/assessment uploads remain blocked because the current source has no approved estimator private-storage contract. No schema, upload policy, or successful package submission is implied.
- Checklist 14 is **partial**: profile, assignment fees, travel approval and assignment status are displayed. Payment-history data, account editing and real payment integration remain pending.
- Account creation/password-recovery and Admin estimator workflow controls remain pending.

## Verification

`node tests/v46-estimator-system.mjs` passes existing workflow/separation assertions with an updated evidence-blocking assertion.

`PLAYWRIGHT_MODULE=<pinned Playwright path> CHROMIUM_EXECUTABLE=<Chromium path> node tests/offline/estimator-browser.mjs` passes 20 assertions: session reuse, role denial, assignment isolation, escaped profile, missing client, draft retention, unsupported-file refusal, concurrent submit, sanitized errors, confirmed reset, blocked fake completeness, stale-response denial and account-switch cleanup. All network requests are blocked; database methods are mocks.

Fresh insurance regression: 14 migrations / 75 disposable PostgreSQL checks pass; mocked Chromium insurance regression passes. Hosted Supabase, provider, phone/Safari and production acceptance remain unverified. Insurance stays Unfinished and dormant.
