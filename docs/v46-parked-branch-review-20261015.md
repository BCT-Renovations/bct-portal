# Parked branch reconciliation — October 15, 2026

Working branch remains feature/takai-insurance-integration-isolated-20261014. Target checkpoint 43daf9c9; Live remains release/takai-approved-only-from-live-20261014 at 6c90eb9a. TAKAI 0a7afd44 and THEO c701d33f safe points are preserved. The companion JSON pins all discovered branch heads and six complete tree comparisons; no branch was switched or merged wholesale.

## Source mapping

| Source | Pinned head | Exact / different / absent paths | Disposition |
|---|---|---|---|
| field-controls integration | f8ebf17d | 124 / 47 / 114 | Existing foundations retained. Missing field extensions need separate schema dependency and authorization tests before narrow porting. |
| contractor identity/trade leads | 7f9c4aa7 | 121 / 47 / 8 | Identity, MFA, signing and closeout additions reviewed below; dormant pending repair and integration. |
| Ace of Spades isolated | f68433f2 | 197 / 41 / 6 | No absent implementation file. Requirements reconciled below; no historical full-app replacement. |
| contractor Google Maps | 5e4025ae | 135 / 42 / 2 | Navigation SQL and inline wiring not integrated. Recover narrow assignment-scoped directions, not the old index. |
| Handyman combined latest | 645e6125 | 179 / 52 / 5 | Core modules/schema already present; individual lifecycle/auth/assignment gaps remain in tasks 46–51. |
| insurance foundation | 40f51e11 | 128 / 43 / 41 | Ordinary migration paths are intentionally absent: corrected insurance chain already exists as 14 staged migrations. Never import duplicates. |

Counts describe files, not completed tasks. Changed paths often contain later owner-approved branding/navigation or independently verified repairs. Existing source files are not proof that their deployed database dependencies exist.

## Identity, MFA, signing and closeout review (task 4)

Reviewed all three missing UI modules and all three missing SQL files at identity head 7f9c4aa7, plus the field/readiness and estimator integration contracts at f8ebf17d.

- Identity SQL extends the canonical contractor document/application/assignment records, restricts approved profile release to assigned, active contractors and the owning homeowner, and excludes government IDs from the release RPC. Unique visible lead per normalized trade and a single released primary contact are already designed. Reuse these rather than add a parallel identity system.
- **Do not port this SQL unchanged.** Three function definitions use invalid single-dollar delimiters (`as $` / `$;` / `end $;`). The contractor submit replacement also rejects roofing, contradicting the later approved Roofer catalog. Its public SECURITY DEFINER identity-readiness predicates need caller/ownership review. New table revokes/RLS mean the proposed storage-policy joins need executable tests; policy text alone cannot prove approved-photo downloads work.
- New identity singleton indexes need duplicate preflight; retirement must not delete an existing uploaded object through SQL. Existing private storage registration and original filenames should remain authoritative.
- The MFA module calls refresh during initialization, exposes a manual enforcement action and depends on BCT_V46_BRIDGE, security-settings columns/RPCs and a tested AAL2 path. None of those dependencies may be assumed present. Do not change canonical is_bct_admin or enable enforcement from this inventory. Recovery/lockout and stale-account tests remain mandatory.
- Signature renderers enable UI unless a flag is explicitly false, depend on a global signing RPC/reload bridge, and treat awaited calls as success without a receipt. Before integration require an explicit capability, immutable version/receipt evidence, duplicate/account guards and role-scoped server tests. Retain distinct homeowner/contractor/BCT signatures and policy acknowledgment gates.
- Closeout uses existing completion requests, punch list and ratings; it is not a second closeout engine. Direct request insert, cancel/rating RPCs and state reload require assignment ownership tests, successful receipt validation, duplicate guards and account-switch clearing. Admin keeps final approval.
- **Version collision:** identity 20261002100000 and 20261002103000 conflict with field composition/priority migration versions. Record source provenance and generate new isolated migration versions through the CLI after the baseline is reproducible. Do not rename applied production history.

Task 4 is a completed source review for narrow integration. Tasks 28/29/144/178 and hosted acceptance remain open; this review does not activate their features.

## Ace acceptance reconciliation (task 5)

The October 12 Ace gates used Live 16618e84 and a rejected mobile candidate. They are historical requirements, not the current deployment baseline. Current Live 6c90eb9a and TAKAI decisions control wording/layout.

| Historical gate | Current disposition |
|---|---|
| Four compact Electrician/Plumber/Contractor/Handyman choices | Superseded only in catalog extent: current approved nine roles include Roofer, Drywaller, Concrete / Masonry, HVAC and Flooring. Keep responsive layout, canonical IDs and large gray headings. Actual controller/catalog fixtures verify the nine choices. |
| Approved logo/no duplicate slogan/About | Current Live logo and embedded slogan prevail; exact homepage/fallback preservation tests remain. Do not copy the old logo, icon, or index from Ace. |
| Old Back-to-Home presentation | Latest mint/dark-teal navigation and previous-client-page Back decision prevail. Complete task 206, including mobile/browser history, independently. |
| Returning sign-in first; new signup separate; restricted contractor panels | Retained; current source has separate entry flow. Account/permission/hosted persistence checks remain open. |
| Client Estimate & Contract, landlord permission and standalone About | Retained. Existing current modules are the integration target; action/draft/permission acceptance remains tasks 57–59 and 207. |
| Translation, no raw keys, no viewport overlaps | Retained, not waived. Existing targeted fixtures do not establish all forms/nine languages or physical Safari acceptance. |
| Single shared sign-in, expiration and sign-out | Retained; UI role choice must never grant permission. Tasks 175–177 remain open. |
| Manifest/worker/icon stability | Current owner-approved behavior includes unregistering stale BCT workers rather than restoring a legacy fetch cache. Physical iPhone acceptance remains open. |
| All gates on one accepted isolated preview | Retained. Passing static/offline tests does not satisfy this hosted/device gate. No production promotion. |

Tasks 2 and 5 close the source mapping/reconciliation work only. Task 3 remains partial: missing approved field controls are identified, but importing its incompatible full schema/app would break the current build. The JSON includes the exact missing implementation paths for continued narrow porting.
