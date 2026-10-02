# Audit And Notification Readiness

Status: launch-critical actions have app-side audit hooks and readiness checks; final live notification delivery still needs provider/mailbox verification.

## Actions That Must Stay Audited

| Action | Current Readiness |
| --- | --- |
| Contractor approval/screening | Admin actions call the contractor status RPC and write an admin activity entry. |
| Job assignment/bid award | Admin bid award flow uses the assignment RPC and writes an admin activity entry. |
| Estimate creation/edit/review/approval | AI estimates remain draft/pending BCT review; customer release is a separate manual action. |
| Customer approval/completion sign-off | Completion certificate readiness is tracked by operational readiness checks. |
| Change order | Change-order create/send RPCs are covered by launch dry-run smoke checks. |
| Financing/escrow status | Admin financing and escrow RPCs are covered by launch dry-run smoke checks. |
| Disputes/ratings | Operational readiness tracks case/dispute and feedback/rating coverage. |
| Notifications | Notification delivery queue readiness is checked; live delivery still needs provider/mailbox verification. |

## Remaining Verification

- Confirm production notification sender and mailbox delivery after the email/provider setup is finalized.
- Confirm durable server-side audit rows during the live dry run for estimate approval, job assignment, change order, completion sign-off, disputes, and ratings.
- Keep local admin activity audit visible for in-session operator traceability, but do not treat it as a replacement for durable backend audit history.


## 2026-10-02 live delivery recheck

- The deployed `bct-notification-dispatch` Edge Function is ACTIVE, requires JWT, re-checks `is_bct_admin()`, and uses Resend only when its provider configuration is present.
- Current `bct_notifications` rows include both `queued` and `sent` statuses, but the live rows show zero delivery attempts and zero provider message IDs. A `sent` application status without provider evidence is not accepted as proof of external email delivery.
- Keep `outbound_email_provider_configured` incomplete until a provider-backed send records an actual attempt/provider message ID and a real mailbox receives it.


## 2026-10-02 provider-account audit

- The connected Resend account has a verified `bctrenovations.com` sending domain in the U.S. region with sending enabled.
- Resend has active API credentials configured for the BCT/Supabase mail path.
- Resend transactional history shows multiple BCT password-reset messages accepted by the provider and marked `delivered`; API logs also show successful `POST /emails` requests from the Resend SMTP path.
- This verifies that the Resend/Supabase Auth mail provider path is operational. It does **not** by itself prove that the separate `bct-notification-dispatch` Edge Function has its `RESEND_API_KEY` and `BCT_EMAIL_FROM` secrets configured or that its queued BCT notifications have been sent.
- Outlook mailbox inspection confirms password-reset mail has reached the connected business mailbox in prior testing, while GoDaddy quarantine digests remain a separate deliverability consideration.
- Keep the application-notification worker gate incomplete until one real `bct-notification-dispatch` send records a delivery attempt/provider message ID and the target mailbox receives that notification.
