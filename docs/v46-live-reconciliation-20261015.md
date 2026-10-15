# Current Live reconciliation and verified development — October 15, 2026

## Authoritative baseline and preserved work

Owner confirmed that current Live is authoritative, including work deployed by another chat. Read-only Vercel inspection confirms production READY at **6c90eb9a50b2eb1e0199683e07dc5ca1fb4667f1**, `bct-portal`, release branch `release/takai-approved-only-from-live-20261014`.

The two commits after the previous Live baseline 9f54b9b are c4c7cebd (homepage emphasis/two-line commitment) and 6c90eb9a (eight-language fallback labels). Those changes were compared directly and preserved in the existing isolated development branch. No branch switch, history replacement, production change, provider call or Supabase project call was performed.

`index.html`, after removing exactly the two dormant insurance-preview additions and reversing the one documented profession-heading fix, has Git blob **a57ac3ea2dcf18b0950e0b1d6058f594b80fc547**, identical to current Live. A pinned test checks this full-file equality. A second test checks the unchanged approved gallery fallback/translation block. The earlier development decision to remove branding fallbacks was superseded by the owner's latest instruction to preserve current Live; approved fallbacks are retained. They remain branding assets, not evidence of completed projects. Gallery pagination/URL reuse remains separate from this wording preservation.

Existing saved security/estimator/Agent/gallery checkpoints remain in history: bbb8717a, a4c35b11, 30abc249. GitHub Actions run **38663064456** succeeded for the isolated offline workflow at 30abc249; this is verified hosted CI execution, not Supabase acceptance.

## New application fixes

- Switching contractor professions could leave the pre-application heading on the first selected role. A failing browser fixture reproduced Electrician still labeled Contractor. The active inline controller now updates any Stage 1 profession heading; its duplicate source definition follows the same narrow condition. Nine professions retain canonical service codes, selectable primary trade, their own heading, ARIA selection and one-account category mapping. No signup/persistence success is inferred.
- Estimator applications now require an explicit successful SDK response (`error:null`, HTTP 2xx); malformed results cannot reset the draft or report success. Private upload/assessment submission remains blocked pending a compatible private-storage contract.
- Photo API request timeouts now include streamed response-body consumption, with a 64 KiB response bound. Oversized and stalled-response fixtures pass; no paid provider request was made.

## Test repair rationale

All **19 previously failing invocations pass locally**, plus the round-9 baseline uncovered by the broader run. No app behavior was reverted to satisfy old tests.

- Launch/integrity/round-8/round-9/round-12/round-13 follow the approved self-removing worker and BCT-only cache cleanup, not retired worker registration/injected-hotfix/cache-generation behavior.
- Portal regression checks follow the current four role buttons and absent retired native links.
- Logo checks use the approved October 10 asset; slogan-mask checks follow existing 22% CSS. No logo styling was changed by the repair.
- About checks follow the existing strong element and current copy location. Removed submitted-project boilerplate checks now verify the actual translated returning-client sign-in/private-upload guidance; no removed copy was restored.
- Profession-heading checks follow the actual dynamic controller, backed by the 39-assertion browser test, rather than requiring a retired default Subcontractor heading.
- The 500-control suite resolves controls by stable identity/action type and tests actual URL attributes. Four negative tests catch missing/changed controls and unsafe encoded schemes. Current wrappers delegate to maintained base suites instead of rewriting source strings into temporary tests.
- Photo/gallery tests read their files correctly, inspect actual markup/read-only queries, and test Previous/Next pagination rather than a retired Load More button.

## Fresh verification

**56/56 offline commands pass**:

- 183 Agent/photo/control-safety/Live-preservation unit tests.
- 49 source/static invocations, including all formerly failing scripts. Historical/current entrypoints overlap and are not separate features.
- All 14 staged insurance migrations and 75 disposable PostgreSQL compatibility/permission/workflow assertions.
- Mocked insurance browser regression, including company/account switches and read-only restrictions.
- 21 estimator, 21 Agent, 10 gallery and 39 contractor browser assertions.

Dependencies are pinned in `tests/offline/package-lock.json`. Run `node scripts/bct-isolated-offline-regression.mjs` after the documented install. Browser tests use mocks/blocked network; PGlite uses synthetic dependencies. A passing fixture or source needle is not hosted workflow certification.

## Remaining scope

The 242-item register includes implementation, reconciliation, decisions and hosted acceptance. The earlier spoken count of 16 meant items addressed or verified, including partial items; it must not be subtracted as 16 fully completed features. This record does not claim the 100-item target is met. Full private uploads, hosted Auth/RLS/storage, canonical empty-database replay, provider deliveries, phone/Safari and cross-role business workflows remain pending. Insurance remains named **Unfinished** and dormant; original TAKAI remains separate. No Live approval is requested while release gates remain pending.
