# Profession applications — isolated continuation, October 15, 2026

Baseline: approved Live commit `2926cf5a5759e63209ad8c9567f73d65c477724d`. Continue on `fix/takai-translation-audit-20261015`; do not change Live or the Takai/THEO safe points.

## This batch

Added profession-specific questions within the existing contractor application, beside its primary-trade step. Shared contact, insurance, work history, references, screening and terms remain unchanged. Estimator already uses a separate application and is unchanged.

| Profession | New questions |
| --- | --- |
| Electrician | License/registration jurisdiction and expiry; electrical work experience; isolation/testing procedures; permits, inspections and work limits; training, diagnostics/safe water isolation and a recent project example |
| Plumber | License/registration jurisdiction and expiry; plumbing work experience; leaks/pressure testing/drain inspection/shutoff; permits, inspections and work limits; training, diagnostics/safe water isolation and a recent project example |
| Contractor / Renovations | Renovation leadership and occupied-home experience; planning, subcontractors, change documentation and permit/licensed-trade boundaries |
| HVAC | System experience and certifications; diagnostics, refrigerants, electrical isolation, combustion safety and work limits |
| Roofer | Systems, repairs, flashing and leaks; fall protection, ladders, weather and occupied-property protection |
| Drywaller | Hanging, taping, patches, finishing and texture matching; dust, occupied rooms, moisture and suspected hazardous materials |
| Concrete / Masonry | Flatwork, repairs, forms, reinforcement and drainage; preparation, curing, weather, excavation checks and equipment |
| Flooring | Materials, subfloors and transitions; moisture, substrate, dust and suspected hazardous materials |
| Handyman | Independent repairs and licensed-trade limits; tools, ladders, availability, problem documentation and scope changes |
| Other Specialty Trade | Specialty, projects and credentials; equipment, safety, permits and qualification limits |

30 questions total. All new headings, instructions, question labels and application validation messages have explicit translations for English, Spanish, French, Haitian Creole, Portuguese, Vietnamese, Chinese, Arabic and Russian. Arabic uses RTL. Selecting multiple categories shows their own questions; deselected categories do not submit their answers. Answers survive trade/language switching within the open form and clear on reset. No draft is saved to browser storage.

Answers are serialized with stable profession/question IDs into the existing `additional_work_history` payload alongside the original work history, for both existing-user RPC and new-user signup metadata paths. Backend persistence and Admin visibility are **not verified**. No new database field, migration or connected write is introduced. Public instructions explicitly exclude SSNs, bank details and identity document numbers.

A separate saved Electrician/Plumber draft was discovered at `8bfed4f9cd5ec9654eca426ea8dd589463968c7c` on `feature/takai-profession-applications-isolated-20261016`. Its branch and preview remain intact. This batch retains its training, scope, diagnostics, isolation and recent-project topics, and supplies the translated integration and questions for the other professions.

## Verification boundaries

Local browser tests block every request outside the local test server. Use `node tests/bct-profession-questions-browser.mjs` (set `BCT_CHROMIUM_PATH` if needed). The test covers translations, required answers, whitespace rejection, selection changes, multi-profession payload isolation, preserved original history and reset.

Run existing `tests/takai-translation-source-regression.mjs`, `tests/takai-portal-languages-browser.mjs`, `scripts/bct-contractor-onboarding-smoke.mjs`, and `scripts/bct-handyman-application-depth-smoke.mjs` for regression checks. The general translation audit delegates the new questionnaire region to its dedicated all-nine-language test because the region owns its localized text.

Verified locally: 286 profession-application checks, 248 existing portal browser checks, 39 translation source checks, and contractor/Handyman application smoke checks passed. A known pre-existing Admin initialization error remains outside this batch and is deferred.

## Still pending

- Handyman assignment scheduling/notes: `bct-handyman-operations.js` disables the date input; assignment creation omits the date and notes. Correcting and proving the connected flow needs the backend contract and Admin verification. Do not enable a date input that would silently discard a promised schedule.
- Authenticated application persistence, Admin review, credential approval, assignments and permissions remain deferred until the authorized connected testing window (October 31).
- Profession questions are intake questions, not a scored trade examination or a substitute for credential verification.
- The earlier 242-item checklist and unfinished 50-item batch are not present as an authoritative itemized ledger in this checkout. Do not subtract question counts, test assertions, or language variants from those totals. Reconcile by original item ID before reporting a new total.

## October 16 continuation — review and contractor navigation

User confirmed: the account-free question review is **preview only**. Real applicants must still complete the required initial contact/password details before moving through their application. Do not create fake accounts or bypass Admin access. Live deployment of this continuation is not authorized.

- Added `/profession-review.html`, a read-only review of all 30 saved profession questions, using the same question catalogue and all nine translations. There are no application fields, submit controls, account calls or draft storage. The page has `connect-src 'none'` and `form-action 'none'` CSP restrictions and is restricted to the isolated preview/local hosts. No Admin information is present.
- The isolated Contractor profession chooser includes a link to this review. The link does not appear on Live hosts. Review-page styles are scoped to prevent changes to the existing app design.
- Added an always-visible mint Back button above the application, translated in all nine languages. The first step's existing bottom Back now returns to the contractor entry instead of being disabled. Later step Back continues to move to the preceding application step.
- Contractor entry now paints the public sign-in/profession shell before awaiting session recovery. A request guard discards late recovery results after navigation or opening the application. Browser history restores the public application directly without routing through the asynchronous sign-in gate.
- Local verification: 232 review/navigation checks passed, including all 30 questions in all nine languages, zero review-page remote requests or browser storage writes, retained initial required fields, both Back controls, simulated slow session recovery, and suppression of review controls on a simulated Live hostname. The 286 profession application checks also passed. No connected accounts, Admin or Supabase were used.

Remaining: authenticated save/approval verification and Handyman assignment dates/notes remain deferred. Do not mark the full connected workflow complete on the basis of local browser checks.

## October 16 approved expanded applications — source/preflight checkpoint

The owner supplied and approved expanded questionnaires for **ten distinct applications**:
Electrician, Plumber, Contractor / Renovations, HVAC, Roofer, Drywaller,
Concrete / Masonry, Flooring, Handyman, and Estimator. Drywall is included once.
Earlier spoken counts of eight/nine trades were inconsistent; these ten names,
not those running counts, define this batch. The existing Other Specialty Trade
questionnaire is preserved, not silently replaced or counted as an approved set.

`bct-application-catalogue.js` captures 15 core questions and their answer choices
for each approved profession, plus four numbered questions: service area
**city and state only**, availability/start time, crew/team, and ability to perform
essential duties safely with or without reasonable accommodation. Crew details
remain conditional follow-ups, not additional numbered questions: size, training,
experience, required credentials, supervision, task qualifications, and subcontractor
license/insurance verification. No past injury or medical-history questions.

Later approved amendments supersede the older pasted boilerplate:

- Portfolios: 5–10 prior-work photos, each with description and personal role;
  three professional references. Apprentices/assistants may show supervised work,
  identifying their responsibilities and supervisor. Fewer than five photos for
  an apprentice routes to manual review, **not** an automatic rejection or approval.
- Files must remain private for authorized BCT Admin review. Never claim that
  local file selection or file metadata proves a secure upload or access policy.
- All ten credential questions include Yes, No, Not required for my work/location,
  and Apprentice under supervision. Yes requires credential details and supporting
  documents; other branches require work/location or supervisor details. BCT must
  verify actual location/scope requirements; no blanket trade exemption. An upload
  is not verification. No claim that any specific jurisdiction's law was checked.
- Required background screening across professional applications. A local
  acknowledgment is not a completed check, consent workflow, or clearance.
- Estimators submit assessments/recommendations; BCT approves final pricing.
  Assessment concerns do not authorize engineering or specialized inspections.
- Homeowner intake changes remain on hold. Do not impose professional portfolio,
  licensing, or background-check gates on the homeowner forms.

`bct-application-validation.js` implements **local preflight only**: conditional
answer validation, recognized stable choice values, multi-selects, Other details,
inactive-answer exclusion, portfolio bounds/descriptions/roles/supervision,
references, city/state, crew size, and background acknowledgment. Results always
remain pending BCT review, with credentials/background/private upload unverified
and `submissionReady: false`. This module does not approve, upload, save, or
connect to accounts/data services.

Verification: `node tests/bct-approved-applications.mjs` passes **620 source and
preflight assertions**, plus translation-gate checks. These are not browser or
backend workflow checks. Tests cover all ten sets, nineteen questions each,
duplicate photo rejection, under/over photo bounds, apprentice exception,
required per-photo descriptions and references, conditional credential uploads,
credential exemption review, stale hidden answers, and invalid choice rejection.

**Not activated or deployed yet.** These new files are intentionally not loaded
by `index.html` or `profession-review.html`: the existing working nine-language
preview is preserved while the larger batch is prepared. New questionnaires have
691 distinct source strings; the shared translation pack currently covers 30
in each non-English language. `bct-application-locales.js` refuses incomplete
localized catalogues instead of leaking English fallback. Remaining work:
complete the eight non-English catalogues; accessible structured-form rendering;
integration into contractor/Handyman and separate Estimator application paths;
per-photo metadata/upload-category integration; all-nine-language browser tests;
then isolated preview deployment and exact-commit verification. Private uploads,
Admin access, screening provider workflow, and connected persistence/permissions
remain subject to the existing deferred verification boundaries. Do not replace
the old preview link with a claim that this new batch is already visible.
