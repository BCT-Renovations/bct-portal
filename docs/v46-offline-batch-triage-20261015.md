# Offline batch and test triage — October 15, 2026

Saved prior checkpoints: bbb8717a (photo security), a4c35b11 (estimator safety). Existing isolated branch only.

## New verified changes

- Agent requests serialize before async session lookup; account/portal changes abort pending requests and reject delayed responses. Unavailable service responses restore the draft. Existing scoped transcript storage is retained. 21 browser assertions include 14 mocked UI position fixtures, not 14 completed live Agent integrations.
- Gallery Next fetches the next 24-photo page rather than cycling through the first page forever. Original/thumbnail signed URLs are reused in memory for 55 minutes, concurrent home loads share a promise, and gallery-change events clear the URL cache. Published metadata is still queried; this is not a persistent private-photo cache. Nine browser assertions cover pagination, reuse and honest empty states. Branding is no longer substituted for unavailable project photos. Hosted bandwidth/publication expiry remains unverified.
- Photo tests now test actual markup, read files correctly, inspect read-only SELECT queries and verify SQL has no publication UPDATE. Assertions no longer depend on comments or the retired Load More button. Two source suites follow the existing October 10 approved logo asset version; no branding was changed.
- Pinned dependency manifest/lockfile and explicit offline runner added. A new workflow targets this isolated branch and relevant PRs, with read-only repository permission and no production credentials/deploy steps.

Fresh local result: **23/23 commands pass**, including 175 security/Agent unit tests, 14 migrations / 75 disposable PostgreSQL checks, mocked insurance browser regression, 20 estimator / 21 Agent / 9 gallery browser assertions and two 200-check source suites. Counts overlap existing gates and must not be summed into feature completion.

## All 19 previously failing invocations triaged

The original failures were rerun before edits. Six now pass; 13 retain historical/current-wrapper failures outside the selected maintained suite. They are not hidden or declared fixed. Source strings must be reconciled against the latest product scope before replacing them.

| Script | Result | Finding |
|---|---|---|
| `scripts/agent-bct-mobile-smoke.mjs` | GREEN: passes | Repaired test and/or verified behavior; included in focused regression or rerun directly. |
| `scripts/bct-launch-smoke-current.mjs` | RED: baseline failure | Retired cache-generation, native role-entry and older branding expectations. Current worker unregisters; do not restore caching. |
| `scripts/bct-launch-smoke.mjs` | RED: baseline failure | Retired cache-generation, native role-entry and older branding expectations. Current worker unregisters; do not restore caching. |
| `scripts/bct-source-integrity-smoke.mjs` | RED: historical failure | Old worker-injected hotfix contract conflicts with approved non-intercepting worker. Maintained current integrity test passes. |
| `tests/agent-bct-photo-recommendations.mjs` | GREEN: passes | Repaired test and/or verified behavior; included in focused regression or rerun directly. |
| `tests/bct-photo-build.mjs` | GREEN: passes | Repaired test and/or verified behavior; included in focused regression or rerun directly. |
| `tests/v46-production-200-checks-round10-current.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round10.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round11.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round12-current.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round12.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round13.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round2-current.mjs` | GREEN: passes | Repaired test and/or verified behavior; included in focused regression or rerun directly. |
| `tests/v46-production-200-checks-round2.mjs` | GREEN: passes | Repaired test and/or verified behavior; included in focused regression or rerun directly. |
| `tests/v46-production-200-checks-round7.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks-round8.mjs` | RED: baseline failure | Exact snapshot needles for changed submitted-project copy, About markup, form heading, worker cleanup or Admin template structure; requires semantic scope reconciliation. |
| `tests/v46-production-200-checks.mjs` | GREEN: passes | Repaired test and/or verified behavior; included in focused regression or rerun directly. |
| `tests/v46-production-500-checks-round4-current.mjs` | RED: baseline failure | Exact opening-tag expectations omit current hidden, Back and action classes; current wrapper only remaps some controls. |
| `tests/v46-production-500-checks-round4.mjs` | RED: baseline failure | Exact opening-tag expectations omit current hidden, Back and action classes; current wrapper only remaps some controls. |

## Deployment evidence and remaining gates

Vercel read inspection found READY automatic previews for bbb8717a and a4c35b11. Preview source `bct-estimator-portal.js` returned HTTP 200 with version `V46-2026.10.15-estimator-offline-safety` and the saved caller-assignment/draft protections. This proves source delivery, not browser/Auth acceptance. No manual deploy was requested.

Production remains READY at 9f54b9b50d03374a95d3a932ef428aea7ad7c153 on its separate fix branch. No production deployments or Supabase project calls were made. Automatic previews can result from saving this authorized isolated branch.

Checklist mapping: 78–80 locally verified security/shape coverage; 8, 12–13, 16–17 local estimator fixes; 9–11 and 14 partial; 83–96 UI routing fixtures only; 97 request/draft/scope fixes; 214–215 local gallery improvements; 231 triaged all 19, 232 repaired Agent/photo assertions, 233 workflow prepared, 234 pinned runtime installed with npm ci, 235 disposable/mock rerun. Hosted acceptance remains pending for all relevant items. This batch does **not** complete the requested 100-item target or all 242 tasks.
