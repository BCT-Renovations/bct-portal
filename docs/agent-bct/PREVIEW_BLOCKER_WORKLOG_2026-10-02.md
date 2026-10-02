# Agent BCT Preview Blocker Worklog — 2026-10-02

## External blocker
GitHub commit status for the verified candidate reported Vercel: **Deployment rate limited — retry in 24 hours.** This is an external preview-build quota blocker, not evidence that Agent BCT is READY or that its application build failed.

## Verified CI checkpoint before additional hardening
SHA `fb39ccadf8b6186d2804c5a767ee1ae1eb7ea9ca`:
- Agent BCT Security Tests: SUCCESS
- 138 tests / 138 pass / 0 fail
- BCT V46 Smoke Checks: SUCCESS
- BCT V46 Production Guard: SUCCESS
- Vercel exact preview: BLOCKED by deployment rate limit

## Work performed while preview is blocked
Only branch-local, non-production hardening/preparation:
- exact candidate evidence template;
- strict live-context metadata validation;
- finite knowledge limit parsing;
- policy role/language interpolation hardening;
- non-finite audit duration handling;
- exact escalation enum validation;
- validated minimized escalation receipts;
- finite preview limiter clock;
- sanitized AI Gateway request correlation ID;
- object-projector array rejection;
- expanded tests for the above.

Several intermediate commits failed CI because source-edit tooling inserted literal escaped line breaks or because tests intentionally exposed incomplete hardening. Those failures are not release evidence. Corrections continue on `agent-bct`; only a later exact SHA with all required workflows green can replace the verified checkpoint.

## Production safety
No production merge, production Agent deployment, production database migration, Agent write activation, estimator live-tool activation, or voice activation occurred.


## 2026-10-02 exact-head preview follow-up
- Current branch head before this documentation update: `25b9b437301045b6fce0b39bfa4bfaa8699b9450`.
- Exact-head CI: Agent BCT Security Tests PASS; BCT V46 Smoke Checks PASS; BCT V46 Production Guard PASS.
- Branch comparison: 290 commits ahead of main, 0 behind, 97 changed files.
- Vercel is accepting preview deployments again, but the newest READY Agent BCT preview observed is `ffae7480e55dd93eda679ab9646115889251b486`, not the current exact candidate.
- Other repository branches are currently producing READY previews, so the old global deployment-rate-limit condition is no longer the active explanation.
- Do not use an older READY preview as evidence for the current candidate.
- No production deployment or merge was triggered.
