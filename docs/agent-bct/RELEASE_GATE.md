# Agent BCT Release Gate

Status: HOLD. This file is a release checklist, not production approval.

## Immutable release rules
- Agent BCT development remains on `agent-bct`.
- Draft PR/review activity does not authorize merge.
- Production V46 remains the source of truth.
- No production merge or deployment until Ty Perry gives explicit final production approval after the complete/remaining report.
- A blocked external gate is BLOCKED, never PASS.

## Required evidence for the final candidate SHA
1. Agent BCT automated security tests PASS.
2. V46 smoke checks PASS.
3. V46 production guard PASS.
4. Exact non-production Vercel deployment READY.
5. Health endpoint confirms non-production; writes, estimator live tools and voice OFF.
6. Phase A generation/adversarial matrix PASS using the configured preview model.
7. Phase B authenticated ordinary reads PASS, including cross-user/cross-project/RLS denial.
8. High-risk read tests PASS separately; no write capability.
9. Durable audit/escalation path verified, including confirmation, duplicate/idempotency and no secret leakage.
10. Estimator backend is reconciled before estimator live tools.
11. Nine-language text behavior verified; Arabic RTL verified in product UI.
12. iPhone/mobile keyboard, safe-area, scroll, back navigation, account switch and outage behavior PASS.
13. Voice has its own runtime/pricing/language/privacy verification before it can be enabled.
14. Integration Contract and completion report are current.

## Current hard stops
- Vercel exact-candidate preview is currently blocked by the account deployment build-rate limit.
- Production merge is intentionally withheld.
- Agent writes remain disabled.
- Estimator live tools remain disabled.
- Voice remains disabled.

## Final approval wording
When every technical gate above has evidence, report the exact candidate SHA and remaining business-only decisions, then STOP. Do not interpret earlier broad repository/deployment permission as final Agent BCT production approval.


## CI regression rule
A previously passing workflow does not cover later commits. If Agent BCT Security Tests fail on the current candidate, the release gate is failed until the defect or test fixture is corrected and a subsequent security-relevant SHA passes. V46 Smoke/Production Guard success does not override an Agent security failure.
