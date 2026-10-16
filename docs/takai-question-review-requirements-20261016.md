# Takai application question review — owner decisions

Recorded October 15, 2026, America/Indiana/Indianapolis.

Baseline: approved profession-question preview commit 65b9516216cca0e554bb84327218f9b723f6f3db. Preserve existing working application flows and Takai/THEO safe points.

## Required behavior

- Provide a separate review page in the isolated preview where the owner can select a profession and read that profession's existing application questions without creating an account, entering personal information, or submitting an application.
- This account-free review is for the isolated preview only. Do not add an account-free shortcut to the real applicant flow or deploy the review page to Live.
- Real applicants must complete the required initial signup information (including legal name, email, password and confirmation, and other required fields) before proceeding to the rest of the application. Preserve this validation.
- Translate all new review headings, instructions, profession choices, controls and navigation into the existing nine languages.
- No account creation, submission, Admin access, or connected Supabase operations during review/testing. No Live changes without explicit owner approval.

## Reported navigation issues

- Owner reports that using the phone/browser back arrow from the new contractor portal briefly leaves blank main content with Agent BCT still visible; the page eventually returns. Reproduction and repair remain pending.
- Owner reports no page-level Back control on the initial contractor signup step, although an application Back control exists elsewhere. Verify and add the approved mint-green Back control returning to the previous contractor page as needed.

## Status at recording

Requirements recorded; account-free review page has not yet been implemented or deployed. Hosted browser verification, backend persistence and Admin review remain unverified. Do not report these as complete.
