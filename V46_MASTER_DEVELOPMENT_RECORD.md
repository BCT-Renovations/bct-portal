# BCT V46 master development record

Owner: Ty Perry — BCT Renovations, LLC. Updated October 9, 2026.

## Boundaries and evidence

- Only develop `feature/v46-handyman-combined-latest`. Never merge to main or release Live without explicit approval.
- Audited starting branch SHA: `c88115726773b25e03989bc4481e77ccc72f8d33`.
- Read-only main baseline: `3fbbeb283d493f484e026cd7c094748feaeb31b2`.
- Existing combination: `81dc7ff`; logo cache update: `2334744`; fullscreen CSS: `c881157`.
- Isolated Vercel project: `prj_Ds2ru0QG7r7Jr1uHvtaWcNYt2HmX`, `bct-v46-isolated-preview`.
- Starting deployment `dpl_7dQVHnvFVvNkfdqDQ1fFYwDK41Hs` READY and matches starting branch SHA. CSS deployed, but Agent UI JS fails parsing.
- Public isolated alias initially pointed to older deployment `dpl_HU92V38MFVAuwCTj4u9N3L72GrYk`. Never call that latest without checking its commit.
- Connected Supabase project: `onpqykpikxbbypfvmtin`. Read-only metadata checks only. No migrations or test records applied. No isolated database identified; shared backend must remain untouched.
- Preserved existing test files, migrations, LAUNCH_STATUS.md, LAUNCH_DRY_RUN_CHECKLIST.md and PAID_SERVICES_CHECKLIST.md. Prior assertions are evidence records, not automatic proof of current runtime behavior.
- Status vocabulary: COMPLETED AND VERIFIED; BUILT BUT UNVERIFIED; PARTIALLY IMPLEMENTED; MISSING; BROKEN; BLOCKED; READY FOR DEPLOYMENT.

## Changes in this batch

- Removed duplicated Agent UI mount block and unmatched brace causing SyntaxError. Retained the original Agent and existing opaque CSS.
- Added Home and Message translations for all nine existing languages; Arabic direction retained.
- Moved existing Handyman entry into homepage actions between Contractor and BCT Estimator. Uses existing portal, no duplicate application.
- Handyman navigation hides other views, Back restores home, submission disables its button while pending and rejects repeated clicks. Successful submission still resets form.
- Localized Handyman entry and intro, added Arabic direction, repaired application-ID label translation (previous code wrote text onto an input).
- Refreshed changed JS cache versions. Added JS parsing to existing mobile smoke check.

## Verification ledger

| Check | Result | Limits |
|---|---|---|
| Starting Agent UI `node --check` | FAILED: Unexpected token if, line 98 | Direct root cause for missing Agent |
| Corrected Agent UI, Handyman portal/i18n parse | PASS | Source compilation, not rendering |
| `node scripts/agent-bct-positions-smoke.mjs` | PASS: 12 roles and voice profiles, authority boundary | Structure, not 12 live workflow demonstrations |
| `node scripts/agent-bct-mobile-smoke.mjs` | PASS including new JS compilation | Source checks, not physical iPhone/Android |
| `node --test tests/agent-bct/*.test.js` | PASS: 148 tests, 0 failed, 0 skipped | Backend tests with fixtures; no real provider connectivity claim |
| `git diff --check` | PASS | Whitespace |
| Supabase routine inventory | No Handyman routines; seven insurance routines | Read-only catalog query, no user data |
| Supabase applied migrations | Latest listed: `20261005211303 bct_gallery_translation_fields`; no October 8 Handyman migrations | Existing migration files preserved |
| Existing alias browser inspection | V46 homepage, no Handyman entry; older deployment | Not evidence for this batch |
| Local Playwright installation | BLOCKED: browser absent; download truncated | Cloud browser used for deployed verification |

## Requirement reconciliation

Unless a row specifies otherwise, relevant implementation commit is the audited base `c881157` (existing work), test evidence is source/catalog inspection only, and next action is targeted isolated runtime testing. BUILT BUT UNVERIFIED never means launch-ready.

| Feature | Status | Existing implementation / evidence | Remaining work, dependencies and next action |
|---|---|---|---|
| Agent fullscreen / background scrolling / Home | BUILT BUT UNVERIFIED | Existing CSS `c881157`, corrected UI in this batch | Deploy then browser open/Home/scroll checks |
| Original 12 Agent roles | PARTIALLY IMPLEMENTED | `_positions.js`, context/policy/session; structure and 148 backend tests pass | UI currently does not send selected position; verify role selection and authorized workflow per role |
| Analytics & Reporting addition | BUILT BUT UNVERIFIED | Historical proposal recovered, no implementation found in current role catalog | Confirm exact agreed boundaries and connect authorized reporting tools |
| Escalation & Human Review addition | BLOCKED | Historical proposal overlaps existing Admin & Escalation | Owner decision: clarify distinct responsibility before making a duplicate role |
| Handyman homepage entry/navigation | BUILT BUT UNVERIFIED | Existing portal moved into required order this batch | Browser verify current deployment |
| Handyman applications / status | BLOCKED | Existing portal and 3 migration files | Required RPCs absent in connected DB; provision/select isolated backend before migration/tests |
| Handyman references / tools / transport / work history / crew | PARTIALLY IMPLEMENTED | Foundation portal form has basic identity, services, experience | Map requirements to existing schema; extend only missing fields |
| Handyman screening / credentials / assignments | BLOCKED | Operations/admin files and migration scaffolding | Isolated DB missing; provider authorization unconfirmed; end-to-end approvals required |
| Handyman document expiration / notifications | BUILT BUT UNVERIFIED | Credential and operations foundations | Verify scheduler, delivery and private access |
| Insurance uploads / coverage review / expiration | BUILT BUT UNVERIFIED | Existing contractor docs UI; 7 insurance DB routines | Test private upload/review/expiration and authorized access |
| Insurance-company connectivity / claims | BLOCKED | Insurance role exists; no carrier adapter found in current api/functions; separate insurance portal files absent | Obtain authorized provider/partner and isolate tests; code existence is insufficient |
| Homeowner registration / login / recovery | BUILT BUT UNVERIFIED | Existing index auth and portal | Test targeted recovery/delivery with authorized test accounts |
| Homeowner submission / measurements / scope / budget / scheduling | BUILT BUT UNVERIFIED | Existing forms, RPCs and migrations | Preserve prior evidence; targeted isolated lifecycle test |
| Homeowner multi-upload / confirmations / duplicate prevention | BUILT BUT UNVERIFIED | Existing upload validations and notifications | Test changed boundary only; no writes to shared Live DB |
| Homeowner verification / status / messages / contracts / financing / completion | BUILT BUT UNVERIFIED | Existing portal and operational RPCs | Authorized test lifecycle |
| Contractor application / five references / screening | BUILT BUT UNVERIFIED | Existing form; five-reference migration in applied inventory | Verify client/server count and approval gates |
| Contractor insurance / credentials / work photos / equipment / transport / crew | BUILT BUT UNVERIFIED | Existing portal documents and credential controls | Targeted uploads/access/expiry checks |
| Contractor bids / BCT selection / one-active-job gate | BUILT BUT UNVERIFIED | Existing bids/assignment rules and migrations | Test cross-user confidentiality and active-job boundary |
| Property manager properties / buildings / units / status | BUILT BUT UNVERIFIED | Existing property management migration history | Confirm accessible portal and CRUD in isolated DB |
| Resident privacy / assigned-contractor access instructions | BUILT BUT UNVERIFIED | Existing privacy/access policies | Cross-role isolated tests; never expose resident records in audit output |
| Admin applications / verification / approvals / assignments | BUILT BUT UNVERIFIED | Existing control board and admin RPCs | Handyman board entry missing; verify role gate before exposing controls |
| Admin pricing / contracts / AI approval / finances | BUILT BUT UNVERIFIED | Existing admin tools and financial/estimate migrations | Authorized lifecycle checks |
| Job Health On Track / Needs Attention / Delayed / Critical | BUILT BUT UNVERIFIED | Existing dashboard and migrations | Verify actual data/status mapping, not empty counters |
| Admin alerts / audit / reporting | BUILT BUT UNVERIFIED | Existing notification/security/operations infrastructure | Verify production configuration through read-only metadata, isolated delivery tests |
| AI estimating drafts / edit / recalculate / markup | BUILT BUT UNVERIFIED | AI_ESTIMATING.md, existing estimate code and migrations | Verify no automatic approval/assignment; protect customer price boundary |
| Job/contract numbers / schedule / progress / weather / materials | BUILT BUT UNVERIFIED | Existing numbering, operational RPCs, weather readiness record | Verify manual vs provider-connected weather and lifecycle |
| Photos / notes / change orders / approvals / signatures / messaging | BUILT BUT UNVERIFIED | Existing portals, migrations and tests | Verify ownership and sign-off flow in isolated backend |
| Warranty / disputes / completion sign-off | BUILT BUT UNVERIFIED | Existing closeout/case migrations | Isolated lifecycle and immutable evidence tests |
| Acorn qualification link | BUILT BUT UNVERIFIED | Existing financing config and UI | Verify current correct link and launch behavior |
| Escrow / completion-based release / BCT financial controls | BUILT BUT UNVERIFIED | Existing escrow/payment workflow code | Verify actual third-party arrangement, not just internal status fields |
| 15% senior / 15% veteran / 20% combined cap | BUILT BUT UNVERIFIED | Existing discount migration | Test pricing boundaries and display |
| Authentication / role permissions / secure documents | BUILT BUT UNVERIFIED | Existing RLS/auth/UI; Agent security fixtures pass | Cross-role real isolated tests |
| Password confirmation / 7 chars / number / special / previous 5 | BUILT BUT UNVERIFIED | Password history/policy migrations present in applied inventory | Real recovery/change-password tests and history behavior |
| Authenticator / MFA | BUILT BUT UNVERIFIED | Existing MFA controls/migration | Verify enrollment and enforcement with test account |
| Backups / database protection / recovery | BUILT BUT UNVERIFIED | PAID_SERVICES_CHECKLIST.md and recovery plan | Verify current plan/config; no paid upgrades authorized |
| Forms reset / duplicates / lockout / clear errors | PARTIALLY IMPLEMENTED | Existing core controls; Handyman pending-click guard added | Handyman server dedup and safe error messages need review |
| File types / sizes / counts / downloads / unauthorized edits | BUILT BUT UNVERIFIED | Existing upload validators and tests | Targeted isolated failures and download checks |
| Confirmations / approval-rejection / updates / expiry / contracts / change orders / completion / admin notifications | BUILT BUT UNVERIFIED | Existing notification queue; AUDIT_NOTIFICATION_READINESS.md | Verify actual Resend authorization/delivery, not presence of code |
| Mandatory translation / multilingual fonts / RTL / preference | PARTIALLY IMPLEMENTED | Nine-language maps; Agent Home/Message and Handyman entry/intro/RTL fixed | Remaining dynamic errors, admin/operations strings, roles, generated contracts require coverage audit |
| Official logo and no duplicate slogan | BROKEN | Current `bct-logo-master.png` visually reads comma + “Your General Contractor” | Required asset must include “We Are Your General Contractor”; locate exact supplied logo; do not regenerate/edit substitute |
| Homepage colors/type/layout / About/footer | BUILT BUT UNVERIFIED | Preserved current styling and copy; only required entry position changed | Compare new deployment with main; verify approved messaging |
| iPhone / Android / mobile forms/uploads/navigation | BUILT BUT UNVERIFIED | Existing mobile CSS/tests retained | Browser engine/device checks pending; no physical-device claims |
| GitHub / Vercel | COMPLETED AND VERIFIED | Branch SHA and READY deployment metadata match | Verify new commit deployment before sharing |
| Supabase | COMPLETED AND VERIFIED | Connected project ACTIVE_HEALTHY; read-only routine/migration queries succeeded | Connection confirmed only; individual workflows remain unverified |
| Resend / existing email / document integrations | BUILT BUT UNVERIFIED | Existing queue/code/config records | Confirm deployment env flags and authorized delivery |
| Business rules: BCT authority / bid privacy / homeowner privacy | BUILT BUT UNVERIFIED | Existing policies; Agent fixtures enforce persona-only authority | Real cross-role flow testing |
| Isolated preview / Live release | BLOCKED | Correct isolated project located; code ready for preview build | Logo mismatch and backend gaps block release readiness; Live approval required independently |

## Original Agent role ledger

Each role is PARTIALLY IMPLEMENTED: catalog, voice profile and policy wiring verified by source smoke; actual role-specific frontend/API/data/response flow remains unverified. All share authoritative permissions; selecting a persona must never elevate access.

1. Project Manager (`project_manager`)
2. Estimator (`estimator`)
3. Contractor Coordinator (`contractor_coordinator`)
4. Assignment & Scheduling Coordinator (`assignment_scheduler`)
5. Customer Support (`customer_support`)
6. Finance & Escrow Coordinator (`finance_escrow`)
7. Insurance & Claims Coordinator (`insurance_claims`)
8. Property Management & Commercial Coordinator (`property_commercial`)
9. Documents & Change Order Coordinator (`documents_change_orders`)
10. Quality & Completion Coordinator (`quality_completion`)
11. Compliance & Credentials Coordinator (`compliance_credentials`)
12. BCT Admin & Escalation Coordinator (`admin_escalation`)

## Next actions

1. Commit this batch on the existing isolated branch; confirm READY deployment and exact SHA.
2. Verify Agent open, opaque panel, Home and Handyman entry/Back in deployed browser. Record observable limits.
3. Resolve official-logo source and two-role overlap; never invent approvals.
4. Obtain/select isolated Supabase environment before applying preserved Handyman migrations or submitting test data.
5. Wire role selection and Handyman admin access with existing auth, then complete translation/permission coverage and remaining workflows in scoped batches.

## Deployed verification follow-up

- Batch commit `2d7bbb5597837dc49c2bb7b1b0c457f44ea4ffe0` deployed READY: `dpl_9jzApdMtrFZQjW16ZGpjhhCN9e6N`, exact branch/SHA verified.
- Existing isolated public alias reassigned to that deployment, only within isolated project. Live project unchanged.
- Browser: Agent panel full viewport (1363 × 936), opaque white background, homepage absent from Agent accessibility tree; Home returns landing.
- Browser: Handyman entry appears exactly between Contractor and BCT Estimator. Initial click exposed legacy signed-out CSS hiding its form: portal display none although hidden class removed. Fixed scoped portal-entered/class routing and CSS, plus Back and Agent Home cleanup.
- Browser: Agent header inherited mint landing background with white text. Fixed dialog-scoped dark teal header, preserving homepage CSS.
- Required logo still mismatched; no asset rewritten. Newest known IMG_9589.png is a screenshot, not the official standalone logo. Search did not resolve the October 8 replacement file.
- These follow-up changes require new deployment/browser confirmation. No actual Handyman submissions performed against shared DB.
