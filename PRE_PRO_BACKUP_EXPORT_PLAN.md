# Pre-Pro Backup And Export Plan

Status: Supabase Pro backups and PITR are not claimed active until the owner upgrades the project and the settings are verified.

## Until Supabase Pro Is Enabled

Run a manual export before major launch testing, before schema changes, and at least daily during launch prep.

1. Open Supabase dashboard for the BCT production project.
2. Go to `Project Settings` -> `Database` -> `Backups` and confirm whether automatic backups are available for the current plan.
3. If Pro backups/PITR are not available, use the dashboard SQL/table export tools or CLI export process to save current production data.
4. Export or verify these areas before any risky change:
   - Auth users and role metadata.
   - Homeowner projects, project files metadata, and workflow status.
   - Contractor applications, documents, bids, and assignments.
   - Estimates, estimate items, AI estimate runs, approvals, and customer releases.
   - Job health, weather checks, financing, escrow, change orders, completion sign-offs, disputes, ratings, notifications, and audit logs.
5. Store exports in the owner-approved secure location.
6. Record export date, operator, project ID, and restore notes in the launch log.

## After Supabase Pro Upgrade

- Enable and verify Supabase backups.
- Enable and verify point-in-time recovery/PITR.
- Enable leaked-password protection in Auth.
- Rerun Supabase security advisors.
- Update `LAUNCH_STATUS.md` only after the production settings are verified.
