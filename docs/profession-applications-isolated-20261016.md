# Electrician and Plumber application draft

User-approved scope: prove the application pattern with Electrician and Plumber first. Each profession needs its own questions; reuse basic contact information and layout only. Continue from approved Live source 2926cf5a5759e63209ad8c9567f73d65c477724d. No Admin sessions, production Supabase access/changes, or production deployment.

Implemented in isolated source:
- Eight questions per profession: license/registration status, jurisdiction, conditional credential details, and five separate trade-specific questions covering experience, scope/limits, diagnostics, safe isolation, and recent work.
- Primary trade and additional selected professions determine which sections are enabled and required.
- Switching trades preserves in-memory drafts but excludes inactive answers from submission. No credentials, passwords, or government IDs enter local persistent storage.
- Existing submission code calls profession validation before its existing account/network work. Answers are versioned and appended to the existing additional_work_history string without changing the database schema, approval status, or credentials controls. Backend acceptance and Admin visibility are NOT verified.
- Standalone profession-applications-preview.html is a local-only sample form. Its Content Security Policy blocks connections and form navigation. It does not load the main app or Supabase.

Validation: seven Node contract tests passed. Module syntax and all main-page inline-script syntax passed. Browser test was attempted but could not run: Chromium was absent and the permitted browser download returned an unusable archive. No browser result is claimed.

Remaining before any release recommendation:
1. Browser verification of standalone sample form and full existing multipage application, role routing, switching, required fields, reset, mobile layout, and error focus.
2. Translate new question sections for all nine supported languages. This first question draft is English only; it is not ready for Live.
3. Confirm existing history-field size, account metadata limits, backend persistence, review visibility, and data privacy using an authorized isolated test service. Do not access production or Admin under current authorization.
4. Add independently designed questions for remaining professions after the first pattern passes review.
5. Preserve all existing approvals and one-account/multiple-trade controls. These answers cannot establish credential approval.

Checklist: no additional items from the original 242 are marked closed. Last historical checkpoint remains 41 closed / 201 open; this is not a newly audited count. Browser tests are tests, not completed checklist items.

Handyman follow-up retained: approved-baseline source still has disabled assignment date and does not pass date/notes in the assignment RPC. Do not blindly enable these fields or add RPC arguments until the existing function contract and saved batch work have been reconciled. No Handyman or database change is included here.
