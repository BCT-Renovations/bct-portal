# BCT Renovations Paid Services Checklist

This checklist tracks account, billing, and provider items that cannot be fully completed from code alone.

## Required Before Public Launch

| Service | Needed action | Why it matters | Current status |
| --- | --- | --- | --- |
| Supabase Pro | Upgrade the Supabase project before public launch. | Unlocks leaked-password protection and managed backup features. | On hold by business decision. |
| Supabase leaked-password protection | Enable Prevent use of leaked passwords after Pro is active. | Blocks known compromised passwords during sign-up/reset. | Blocked until Supabase Pro. |
| Supabase backups | Verify current daily backups after Pro is active. | Confirms the production database has restorable backups. | Blocked until Supabase Pro. |
| Supabase PITR | Decide whether to enable PITR/add-on retention. | Allows point-in-time restore beyond basic backup coverage. | Business/billing decision pending. |
| Email sender | Verify confirmation and password-reset delivery with a real mailbox. | Required for account recovery and launch support. | Deferred by user; not a code blocker today. |
| AI/API billing | Confirm the AI estimate provider, spending limits, and alerting. | Prevents surprise AI costs while keeping estimates admin-reviewed. | Needs billing/provider confirmation before high-volume use. |
| Weather API provider | Choose a provider and configure `BCT_WEATHER_PROVIDER`, `BCT_WEATHER_API_KEY`, and `BCT_WEATHER_ENABLED=true` only after approval. | Enables automatic weather by job location/schedule without mislabeling manual tracking. | Manual weather tracking is live; automatic provider pulls are disabled. |
| E-sign provider | Choose a provider and approve legal signature wording/workflow. | Required before claiming automated legal e-signatures. | Manual customer approval/completion sign-off path remains admin-controlled. |
| Vercel/domain | Confirm production domain, protection settings, and deployment readiness. | Ensures customers reach the correct current app. | Current protected Vercel deployment is READY; public-domain decision pending if needed. |
| Financing provider | Confirm Acorn/customer prequalification link and fee/payment terms. | Keeps financing language accurate and compliant. | Tracking fields exist; provider terms need business review. |
| Escrow provider | Confirm escrow provider, fees, release process, and contract wording. | Required before promising escrow handling publicly. | Tracking fields exist; provider/legal terms need business review. |

## Do Not Launch Publicly Until

- Supabase Pro decision is complete.
- Leaked-password protection is enabled or the risk is formally accepted.
- Backup/PITR retention decision is documented.
- Email reset and confirmation delivery are tested with a real mailbox.
- Automatic weather provider and e-sign provider decisions are either completed or explicitly deferred from launch scope.
- Financing, escrow, contractor, terms, privacy, completion sign-off, ratings, and dispute wording receive business/legal approval.
- Full live dry run passes on the current V46 production deployment.
