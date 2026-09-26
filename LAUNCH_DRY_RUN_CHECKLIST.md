# BCT Renovations Launch Dry-Run Checklist

Use this checklist on the newest V46 production deployment only. Do not switch projects, old ZIPs, old Vercel projects, or prototype copies during the dry run.

## Preflight

- Confirm GitHub `main` is the source of record for `BCT-Renovations/bct-portal`.
- Confirm Vercel production deployment is `READY` on the existing V45/V46 project stream.
- Confirm Supabase project `onpqykpikxbbypfvmtin` is `ACTIVE_HEALTHY`.
- Confirm Supabase Pro-only items are either completed or explicitly marked blocked: leaked-password protection, daily backups, and PITR/retention decision.
- Confirm `PRE_PRO_BACKUP_EXPORT_PLAN.md` has been followed for a manual export if Supabase Pro backups/PITR are still blocked.
- Confirm automatic weather remains disabled unless `BCT_WEATHER_PROVIDER`, `BCT_WEATHER_API_KEY`, and `BCT_WEATHER_ENABLED=true` have been configured and approved.
- Confirm email/password-reset testing is scheduled with a real mailbox before public launch.

## Homeowner Flow

- Create or sign in with a homeowner test account.
- Submit one homeowner project with contact details, property address, service selections, full description, measurements, photos/files, budget range, timeline, and privacy acknowledgment.
- Verify the submitted-request lockout clears the form, disables duplicate submission, and shows a submitted/received state.
- Attempt a duplicate submission and confirm it is blocked.
- Upload multiple project files on desktop layout.
- Upload multiple project files on mobile layout.
- Verify BCT Admin can see the submitted project and that homeowner contact details are not exposed in contractor bidding views.

## Admin Review And Estimating

- Sign in as authorized BCT Admin.
- Review the homeowner project.
- Set customer verification status.
- Move the project workflow through site visit/scope-ready style states.
- Generate an AI estimate draft from the project.
- Confirm the AI Cost Controls notice is visible before generation.
- Confirm the AI estimate remains draft/review-required and is not customer-visible.
- Edit scope, assumptions, material lines, labor lines, other costs, customer line prices, discount, markup/profit, and internal notes.
- Recalculate totals.
- Manually complete BCT review.
- Manually approve and release the customer-safe estimate.
- Confirm homeowner/contractor views never expose internal cost, markup, AI payload, or BCT-only notes.

## Job, Bid, And Assignment

- Create a BCT job from the verified project.
- Confirm job number and contract number generation.
- Confirm contractor-visible scope is sanitized.
- Sign in as a contractor/applicant test account.
- Verify contractor screening/admin approval gates block jobs and bidding until approved.
- Submit a private contractor bid after approval.
- Confirm homeowners do not see bids and contractors do not see each other's bids.
- Award the bid from BCT Admin.
- Confirm BCT assignment controls the selected contractor.
- Confirm second active job/contract requires BCT Admin override.

## Job Operations

- Add or update schedule events.
- Record manual weather impact and confirm job health shows delay/reschedule attention when applicable.
- Add materials, delivery/install status, returns, and notes.
- Add financing status, application reference, approved amount, customer shared approval, and notes.
- Add escrow status, provider/reference, amount, homeowner release approval, BCT release approval, and notes.
- Create and send a change order for homeowner review.
- Record BCT change-order approval.
- Create job approval requests and approve/reject them.
- Create a service call tied to the original job.
- Verify messaging, notifications queue visibility, document expiration alerts, audit trail, ratings, dispute/case reporting, and completion sign-off paths.

## Security And Launch Verification

- Run `node scripts/bct-launch-smoke.mjs`.
- Run `node scripts/bct-launch-dry-run-smoke.mjs`.
- Run `node scripts/bct-role-visibility-smoke.mjs`.
- Run `scripts/bct-supabase-security-smoke.sql` through Supabase SQL execution.
- Check Supabase security advisors.
- Check Vercel runtime errors for the production project.
- Verify protected production serves the newest V46 code.
- Update `LAUNCH_STATUS.md` with pass/fail results and remaining blockers.

## Pass Criteria

- No duplicate homeowner/contractor submissions.
- Multi-file uploads work on desktop and mobile layouts.
- AI never approves estimates.
- BCT Admin manually approves estimates, bids, assignments, change orders, and release/sign-off steps.
- Internal pricing and BCT notes remain admin-only.
- Supabase Pro-only blockers are cleared or documented as blocked by billing decision.
- Vercel production is `READY` and serving the newest GitHub `main` commit.
