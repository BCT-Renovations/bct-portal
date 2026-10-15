# Requested 50-item batch — October 15, 2026

Starting checkpoint: c0b8e18. Starting count: 23 closed / 219 open.

This is a 50-item work queue, not a claim that 50 tasks are complete. One additional task (80) has verified local closure; task 49 has a tested partial repair. Current count after the additional task 194 review: 25 local tasks closed / 217 open. No hosted acceptance or production changes.

## Verified work

- Task 80: Fresh 25-test suite proves the existing photo parser supports both provider response shapes and rejects invalid responses. No redundant rewrite.
- Task 49: Operations dashboard now becomes visible, participates in shared view routing, clears private markup on hash/portal changes, rejects old responses, guards duplicate lookup, and shows retryable errors distinctly from empty. Fifteen browser assertions pass.
- Task 49 remains partial: the operations module is parked; entrypoints and the code/email-only server privacy boundary (task 50) must be reconciled before enabling it.
- Task 48 remains open: current five-argument assignment RPC has no notes or scheduled-time parameters. Do not invent client parameters or silently discard input.
- Index/home/gallery branding remain unchanged in this batch. Insurance remains dormant.

## Selected numbered tasks

- 49: Verify shared Handyman operations views open visibly and close on navigation; mounting a hidden section alone is not a working dashboard. **tested partial repair; integration blocked by task 50.**
- 80: Test photo-response parsing against actual provider response shapes; the endpoint currently assumes data.output_text is directly present. **verified local closure.**
- 2: Map parked branches to the current build and identify already-integrated changes before porting anything; preserve TAKAI, THEO, and prior safe points. **queued; not yet completed.**
- 3: Review the field-controls branch against TAKAI and bring over only approved missing changes; do not merge its divergent full app wholesale. **queued; not yet completed.**
- 4: Review contractor-identity/trade-lead, Admin MFA, contract-signing, and contractor-closeout additions on their parked branch for narrow integration. **queued; not yet completed.**
- 5: Reconcile Ace of Spades acceptance requirements with current navigation, role selection, session, and homeowner code; retire only requirements superseded by later owner decisions. **queued; not yet completed.**
- 9: Implement handling for application credential files: the current form collects selections but the submit payload ignores them. **queued; not yet completed.**
- 10: Implement assessment photo/video file handling: the current submit path ignores selected media and sets photos/documentation complete to true. **queued; not yet completed.**
- 11: Derive assessment completeness from saved evidence, rather than hardcoded site-visit/photos/documentation flags. **queued; not yet completed.**
- 14: Connect estimator account/profile/history and payment-eligibility details; the current Account panel is policy text. **queued; not yet completed.**
- 15: Complete estimator account creation, Forgot Password, recovery, and returning-session behavior using the existing shared authentication design. **queued; not yet completed.**
- 16: Add in-flight and successful-submit duplicate guards to estimator applications and assessments, with safe retry behavior. **queued; not yet completed.**
- 18: Replace the descriptive Admin estimator panel and zero-only counters with real application, assignment, review, travel, payment, and history controls. **queued; not yet completed.**
- 27: Check application fields and validation for work history/photos, tools, transportation, service areas, experience, availability, crew size default 1, and exactly five professional references. **queued; not yet completed.**
- 28: Bring over missing identity controls: mandatory profile photo, private government ID front/back, BCT verification, and distinct document categories. **queued; not yet completed.**
- 29: Bring over approved homeowner-facing trade leads: one released lead per trade and one primary contact, approved photo, and active assignment. **queued; not yet completed.**
- 31: Check current contractor Primary Trade selection and application validation against the previously reported stuck dropdown and save error. **queued; not yet completed.**
- 32: Check contractor-side credential statuses CURRENT, EXPIRING SOON, EXPIRED, PENDING, and ACTION REQUIRED without falsely implying BCT approval. **queued; not yet completed.**
- 33: Complete any missing contractor-facing credential upload/renewal validation and understandable rejection/correction instructions against existing document controls. **queued; not yet completed.**
- 34: Confirm the authorized background-screening provider, contractor-paid fee, payment/report visibility to BCT, and consent workflow; do not collect SSN in ordinary application forms. **queued; not yet completed.**
- 46: Verify separate returning Handyman sign-in, new application, status, and assignment paths are actually connected; avoid duplicate contractor applications. **queued; not yet completed.**
- 47: Review the expanded Handyman questionnaire, two-reference fields, tools, transport, crew, job limits, work eligibility, service radius, and consent against the specific Handyman requirements. **queued; not yet completed.**
- 48: Repair the assignment form's scheduling/notes path: date is disabled/read but unused, and notes are not sent in its assignment RPC payload. **queued; not yet completed.**
- 50: Replace application-code/email-only access with the approved authenticated privacy boundary where required; review what existing RPCs expose before changing it. **queued; not yet completed.**
- 51: Confirm successful application resubmission is server-deduplicated and status/error messaging is safe and translated. **queued; not yet completed.**
- 57: Check returning-client direct-to-dashboard navigation, multiple-project selection, and working Overview/Estimate & Contract/Files/Financing/Messages/Schedule/Walkthrough actions. **queued; not yet completed.**
- 58: Check owner/renter intake and landlord contact/permission capture; unapproved tenant work must not proceed. **queued; not yet completed.**
- 59: Check project description, measurements, property type, photos/videos, budget, timeline, address, service selection, and required-field/error validation. **queued; not yet completed.**
- 60: Compose What Happens Next, Today at My Home, My Decisions, Money & Project Summary, Report a Problem, and optional Daily Feedback from existing project records. **queued; not yet completed.**
- 61: Provide the homeowner Home Record using existing completion, warranty, product, permit, inspection, and project files. **queued; not yet completed.**
- 69: Check Manage Job links, section navigation, scrolling, mobile tap targets, and return paths against prior reported failures. **queued; not yet completed.**
- 70: Distinguish loading/error/unavailable counts from actual zero; missing backend data must not look like all-clear readiness. **queued; not yet completed.**
- 71: Connect parked approved field, identity, estimator, and Handyman operations to existing board sections without a fourth urgent front or a competing dashboard. **queued; not yet completed.**
- 83: Test Project Manager role responses, permitted project context, progress explanation, and escalation limits with local fixtures. **queued; not yet completed.**
- 84: Test Estimator role intake, scope/measurement guidance, draft-only estimates, and assessment handoff with fixtures. **queued; not yet completed.**
- 85: Test Contractor Coordinator role onboarding, documents, eligibility, private bidding, and assignment guidance with fixtures. **queued; not yet completed.**
- 86: Test Assignment & Scheduling Coordinator role availability, dependencies, delays, and BCT-controlled assignment boundaries. **queued; not yet completed.**
- 87: Test Customer Support role service/policy answers, recovery guidance, and escalation without unauthorized account actions. **queued; not yet completed.**
- 88: Test Finance & Escrow Coordinator role explanations; no autonomous prices, money movement, or escrow release. **queued; not yet completed.**
- 89: Test Insurance & Claims Coordinator role within the existing parked claims boundary; no parallel adjuster system. **queued; not yet completed.**
- 90: Test Property Management & Commercial Coordinator role privacy and property-scoped guidance. **queued; not yet completed.**
- 91: Test Documents & Change Order Coordinator role draft/document guidance and required BCT approvals. **queued; not yet completed.**
- 92: Test Quality & Completion Coordinator role inspection, punch-list, sign-off, and warranty guidance. **queued; not yet completed.**
- 93: Test Compliance & Credentials Coordinator role renewal/training guidance without self-verification or hold removal. **queued; not yet completed.**
- 94: Test the single Admin Escalation & Human Review role for complaints, disputes, safety, exceptions, and final decisions. **queued; not yet completed.**
- 95: Test Analytics & Reporting role safe summaries and authorized reporting-tool coverage. **queued; not yet completed.**
- 96: Test Photo Recommendation role reusing the existing gallery, with no automatic publishing or consent inference. **queued; not yet completed.**
- 98: Confirm AI provider/model, keys, enabled-generation flags, spend limits, and operational monitoring; current configured runtime state has not been read. **queued; not yet completed.**
- 106: Finish the property-manager/commercial multi-property, building, and unit views against existing organization/property records. **queued; not yet completed.**
- 107: Bring over the parked portfolio-priority composition with safe critical/urgent/pending-decision aggregates; do not create duplicate projects. **queued; not yet completed.**

## Verification

Final full maintained suite passed 60/60 commands after all changes, including 15 new Handyman operations browser assertions. The photo-security suite separately passed all 25 tests. Browser requests are mocked; no hosted Supabase calls, paid provider requests, production deployments or migrations.

Do not subtract queued tasks, individual assertions, passing commands, or partially repaired workflows from the checklist.


## Concurrent checkpoint 6b0ba0d (historical)


Recovered exact branch head 28ea9c6. Hardened live-verification browser behavior: validate both submitted and stored HTTPS links using URL parsing; reject embedded credentials; retain the form before awaiting saves; guard duplicate submissions; preserve a new job's draft when an old save resolves; avoid replacing a pending form during language refresh. The existing repeated addEventListener with the same callback was already browser-deduplicated; no extra closure is claimed for removing it.

Added blocked-network browser regressions for unsafe stored/input links, duplicate submissions, successful asynchronous reset and job-switch draft preservation. Full maintained suite: **61/61 offline commands pass** with Chromium /tmp/bct-chromium. No hosted Supabase, production, provider or Safari acceptance performed. Count remains **24 locally closed / 218 open**. Requested 50-item queue remains unfinished; these repairs are evidence toward task 200, not its full closure.


Superseded count after combined review: 25 closed / 217 open. The saved video fixtures are preserved as live-verification-saved-browser.mjs alongside the expanded review fixtures. Same-callback addEventListener registration was browser-deduplicated already; it was not an independently reproduced duplicate-listener defect.
