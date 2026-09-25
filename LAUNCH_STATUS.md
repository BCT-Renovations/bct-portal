# BCT Renovations Launch Status

Last verified: 2026-09-25

## Completed in the current build

- Job Health Dashboard and admin project-operations bundle are wired to Supabase.
- Job lifecycle supports draft, open for bids, bid review, awarded, scheduled, in progress, on hold, completed, and closed.
- Milestones, weather impact, materials/returns, change orders, approvals, financing, escrow, and attention indicators are integrated.
- Homeowner, contractor, and admin authentication controls include forgot-password and confirmation-email actions.
- New and reset passwords require at least seven characters, a number, a special character, and matching confirmation.
- Password history rejects reuse of the last five recorded passwords.
- Homeowner, contractor, and quality-review uploads support multiple files.
- Automatic project, application, job, service-call, and contract identifiers are backed by Supabase generators.
- Roofing is present in the public service catalog with localized translations.
- Launch-readiness and frontend-cutover gates report the current production-source deployment requirement truthfully.
- Stale prototype wording was removed from Spanish, French, Portuguese, Chinese, Arabic, and Russian locale overrides.

## Verification completed

- Supabase migrations through `20260925095442` are applied to project `onpqykpikxbbypfvmtin`.
- Transient rollback smoke tests exercised scheduled jobs, weather, materials, change orders, approvals, milestones, financing, escrow, and job-health summaries.
- `git diff --check` passes.
- All four inline scripts in `index.html` parse successfully.
- `node scripts/bct-launch-smoke.mjs` passes and verifies password recovery, duplicate-submit guards, multi-file upload UI, contractor bidding, admin actions, job health, financing, escrow, change orders, service calls, translation, public-key safety markers, and the Supabase security smoke-check script.
- `scripts/bct-supabase-security-smoke.sql` is available for Supabase SQL Editor/MCP execution against admin RPC grants, password-history access, storage policy breadth, and unexpected `SECURITY DEFINER` functions.
- The current working tree is clean.
- Latest frontend source and launch-critical migration files are synchronized to GitHub `main`.
- Production deployment `dpl_4AuJC78D3bD3bbg1ntnjvGYJArp3` is READY on the existing V45 project.
- Live production HTML was checked for V46, Forgot Password, password rules, Roofing, and Job Health Dashboard controls.
- Current source now hard-locks homeowner and contractor submission forms after a successful submit, blocks duplicate in-flight submits, and uses the custom single file-picker UI for authenticated homeowner and contractor document uploads.
- Locale bundles no longer expose old prototype/test-account wording for the homeowner account and project-file storage copy.
- Approved contractors now submit private bids with inline amount, start-date, duration, and notes fields instead of mobile-unfriendly prompt popups.
- Homeowner and contractor authenticated file uploads now report choose/upload/success/failure status inline instead of using blocking popups.
- Live Supabase admin actions now report inline success/failure status and use in-page confirmation for bid awards, change-order approval, job approvals, launch refresh, job publishing, and service-call creation.
- Homeowner and contractor sign-in/resend actions now guard against duplicate taps, show friendlier confirmation/authentication errors, and expired password-reset links land on the reset page with a clear recovery message.

## Remaining external gates

- Run authenticated live-browser tests for homeowner, contractor, and admin workflows.
- Test confirmation and password-reset email delivery with a real test mailbox.
- Verify the notification worker with Resend and mark the provider launch control complete.
- Verify Supabase backups/PITR and enable leaked-password protection.
- Complete human policy/legal review before enabling the pilot.

These remaining gates require authenticated external actions or a business/legal decision. The current Work Mode automatic-approval usage limit has prevented GitHub push, Vercel deploy, browser-auth, and dashboard-auth actions; no credentials are stored in this repository.
