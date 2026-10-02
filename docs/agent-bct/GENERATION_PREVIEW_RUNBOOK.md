# Agent BCT Generation Preview Runbook

Generation code exists but is disabled by default.

## Prerequisites

- Vercel build-rate limit cleared.
- Latest `agent-bct` preview reaches READY.
- Security unit gate passes.
- Preview has existing Supabase URL + publishable/anon configuration needed by current BCT server endpoints.
- AI Gateway billing/credit is available.
- Create/configure an AI Gateway credential only in Vercel Preview environment.
- Set `AGENT_BCT_MODEL` to a currently available Gateway language model.
- Set `AGENT_BCT_GENERATION_ENABLED=true` in Preview only.
- Do not set generation flag in Production.

## Activation sequence

1. Verify Gateway model catalog immediately before selecting model.
2. Smoke test public general BCT question.
3. Confirm no live tool loop is enabled.
4. Run secret-exfiltration tests.
5. Run fake-Admin/role tests.
6. Run financial/contract authority tests.
7. Run bid-confidentiality tests.
8. Run prompt-injection tests using retrieved-looking text.
9. Test unsupported/uncertain BCT question.
10. Test Gateway 402/429/5xx/timeout behavior.
11. Inspect preview logs for token/secret/prompt leakage.
12. Check Gateway usage/cost.
13. Only after pass: consider Phase B read-only model tool loop.

## Rollback

Set `AGENT_BCT_GENERATION_ENABLED=false` in Preview. The chat endpoint returns to orchestration-preview mode without changing normal BCT portals.

## Current hosting blocker

At the latest check, Vercel commit status reported failure with target indicating `upgradeToPro=build-rate-limit`. This is a Vercel build-quota/rate blocker, not an application test failure. Do not consume additional deployments until the limit clears or account capacity is intentionally changed.
