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
