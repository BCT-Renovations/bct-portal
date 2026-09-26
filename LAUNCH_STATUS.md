# BCT Renovations Launch Status

Last verified: 2026-09-26

## Completed in the current build

- Job Health Dashboard and admin project-operations bundle are wired to Supabase.
- Job lifecycle supports draft, open for bids, bid review, awarded, scheduled, in progress, on hold, completed, and closed.
- Milestones, weather impact, materials/returns, change orders, approvals, financing, escrow, and attention indicators are integrated.
- Weather tracking is verified as manual/admin-recorded job weather impact through `bct_weather_checks`, `bct_admin_record_weather`, `bct_admin_weather_checks`, and `bct_my_weather_checks`; automatic external weather-provider pulls are not enabled yet.
- `WEATHER_PROVIDER_READINESS.md` now defines the automatic weather structure, required environment settings, and owner/provider decision needed before live automatic weather can be enabled.
- Homeowner, contractor, and admin authentication controls include forgot-password and confirmation-email actions.
- New and reset passwords require at least seven characters, a number, a special character, and matching confirmation.
- Password history rejects reuse of the last five recorded passwords.
- Homeowner, contractor, and quality-review uploads support multiple files; project and contractor upload paths now enforce allowed extensions plus 10-file and 25 MB-per-file limits before private storage upload.
- Automatic project, application, job, service-call, and contract identifiers are backed by Supabase generators.
- Roofing is present in the public service catalog with localized translations.
- Launch-readiness and frontend-cutover gates report the current production-source deployment requirement truthfully.
- Stale prototype wording was removed from Spanish, French, Portuguese, Chinese, Arabic, and Russian locale overrides.

## Verification completed

- Supabase migrations through `20260926010606` are applied to project `onpqykpikxbbypfvmtin`.
- Supabase project `onpqykpikxbbypfvmtin` is `ACTIVE_HEALTHY` on Postgres 17.6.1.
- Transient rollback smoke tests exercised scheduled jobs, weather, materials, change orders, approvals, milestones, financing, escrow, and job-health summaries.
- `git diff --check` passes.
- All four inline scripts in `index.html` parse successfully.
- `node scripts/bct-launch-smoke.mjs` passes and verifies password recovery, duplicate-submit guards, multi-file upload UI, contractor bidding, admin actions, job health, financing, escrow, change orders, service calls, translation, public-key safety markers, the Operational Readiness dashboard, and the Supabase security smoke-check script.
- `node scripts/bct-launch-dry-run-smoke.mjs` passes and verifies that the V46 launch dry-run path is bound to production Supabase RPCs for homeowner, contractor, admin, bidding, job health, financing, escrow, change orders, approvals, notifications, and operational readiness; it also verifies AI estimating remains draft/review-required with an explicit manual approval gate.
- `scripts/bct-supabase-security-smoke.sql` is available for Supabase SQL Editor/MCP execution against admin RPC grants, password-history access, storage policy breadth, and unexpected `SECURITY DEFINER` functions.
- `20260926102000_revoke_public_admin_rpc_execute.sql` is applied and removes `PUBLIC` execute access from the remaining admin-only RPCs while preserving explicit `authenticated` execution for app/admin-role checks.
- `20260926104500_homeowner_safe_estimate_summary.sql` is applied and rewires homeowner state to `bct_my_estimates_safe()`, excluding BCT-only internal cost, markup, internal notes, approver, creator, and AI-run metadata from homeowner estimate summaries.
- Supabase verification confirms `bct_my_estimates_safe()` omits internal estimate fields and `bct_frontend_homeowner_state()` now calls the safe estimate summary RPC.
- `scripts/bct-supabase-security-smoke.sql` now passes all four checks in Supabase: no broad homeowner storage ALL policy, no PUBLIC execute on admin RPCs, password-history direct access denied, and no unexpected BCT `SECURITY DEFINER` functions.
- `node scripts/bct-role-visibility-smoke.mjs` passes and verifies customer-safe homeowner estimate summaries, safe estimate line items, contractor job lockout, sanitized-scope wording, private bids, and AI release wording.
- Latest frontend source and launch-critical migration files are synchronized to GitHub `main`.
- Production deployment `dpl_J3AMzZmgUZMnVubtKtL2pXcmaEAS` is READY on the existing V45/V46 project stream and points to GitHub `main` commit `54d6a80d24c1eebadac3c3b3cd8b6ee2b08f5178`.
- Live protected production was checked for the V46 launch cutover title, portal navigation, financing card, and admin entry.
- Operational readiness returns 10/10 internal capabilities covered and zero internal gaps.
- Supabase security advisors still report leaked-password protection disabled. This remains a real external launch blocker because it must be enabled in the Supabase Auth dashboard.
- Supabase security advisors still warn that authenticated users can execute `bct_validate_password_not_recent` and `bct_record_password_history`. These are intentional password-reset RPCs: they require `auth.uid()`, enforce password policy/history, and direct table access to `bct_password_history` is denied to `anon` and `authenticated`; the security smoke confirms no unexpected `SECURITY DEFINER` functions remain.
- Current source now hard-locks homeowner and contractor submission forms after a successful submit, blocks duplicate in-flight submits, and uses the custom single file-picker UI for authenticated homeowner and contractor document uploads.
- Locale bundles no longer expose old prototype/test-account wording for the homeowner account and project-file storage copy.
- Approved contractors now submit private bids with inline amount, start-date, duration, and notes fields instead of mobile-unfriendly prompt popups.
- Homeowner and contractor authenticated file uploads now report choose/upload/success/failure status inline instead of using blocking popups.
- Live Supabase admin actions now report inline success/failure status and use in-page confirmation for bid awards, change-order approval, job approvals, launch refresh, job publishing, and service-call creation.
- Homeowner and contractor sign-in/resend actions now guard against duplicate taps, show friendlier confirmation/authentication errors, and expired password-reset links land on the reset page with a clear recovery message.
- Contractor pre-approval screening is now part of the pre-application flow with pass/fail scoring, two attempts, a 14-day retest lockout, admin screening controls, document checklist messaging, and a front-end hard gate that blocks jobs, bids, and assignments until screening is passed and BCT Admin approves.
- Contractor pre-applications now require explicit acknowledgment that BCT controls customer contact, private bidding, customer-facing pricing, assignments, required documents, and any second active job exception.
- AI estimating now shows admin-side cost controls, limits draft generation per project/admin day on the client, and keeps the manual BCT review/release gates in place.
- `PRE_PRO_BACKUP_EXPORT_PLAN.md` documents the manual export/backup checklist to use until Supabase Pro backups/PITR are enabled and verified.
- `AUDIT_NOTIFICATION_READINESS.md` documents launch-critical audit/notification coverage and the remaining live-provider verification steps.
- BCT Admin Launch Controls now show an owner action checklist for Supabase Pro/PITR, leaked-password protection, weather API provider/key, e-sign provider, live mailbox testing, and final business/legal policy approval.
- BCT Admin now has a session activity audit panel that records launch-test admin actions for contractor screening, customer verification, project workflow, bid awards, job publishing, service-call creation, and job-management updates.
- BCT Admin now has an Operational Readiness panel backed by `bct_admin_operational_readiness`, showing whether completion sign-off, project documents, document expiration alerts, ratings, disputes, reporting, durable audit, messaging, notifications, security readiness, backup/PITR, leaked-password protection, live email, and policy/legal gates are covered before pilot launch.
- `LAUNCH_DRY_RUN_CHECKLIST.md` now provides the full homeowner -> admin -> contractor -> job -> estimate -> approval -> completion dry-run path.
- `PAID_SERVICES_CHECKLIST.md` now tracks Supabase Pro, leaked-password protection, backups/PITR, email sender, AI/API billing, Vercel/domain, financing provider, and escrow provider decisions.

## Remaining external gates

- Enable Supabase leaked-password protection.
  - Dashboard path: Supabase project `onpqykpikxbbypfvmtin` > Authentication > Auth settings / Password security.
  - Turn on leaked-password protection / prevent leaked passwords.
  - Save the setting, then rerun Supabase security advisors.
- Verify Supabase backups and PITR.
  - Dashboard path for backups: Supabase project `onpqykpikxbbypfvmtin` > Database > Backups.
  - Confirm a current restorable backup exists.
  - Dashboard path for PITR: Database > Backups > Point in Time settings.
  - Confirm whether PITR is enabled or document the retention/launch decision before public pilot.
- Run authenticated live-browser tests for homeowner, contractor, and admin workflows with real test accounts.
- Test confirmation and password-reset email delivery with a real test mailbox.
- Verify the notification worker with Resend and mark the provider launch control complete.
- Decide whether automatic live weather API integration is required for the first public pilot. Current V46 weather tracking is manual/admin-recorded and visible in job health.
- Choose a weather API provider and production key before enabling automatic live weather. Required production settings are documented in `WEATHER_PROVIDER_READINESS.md`.
- Choose an e-sign provider before claiming legally binding e-signature automation. Current approval/completion flows remain manual/admin-controlled.
- Follow `PRE_PRO_BACKUP_EXPORT_PLAN.md` for manual exports until Supabase Pro backups/PITR are verified.
- Complete human policy/legal review before enabling the pilot.

These remaining gates require authenticated external actions, dashboard settings, a live mailbox, or a business/legal decision. No credentials are stored in this repository.
