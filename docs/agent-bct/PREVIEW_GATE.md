# Agent BCT Preview Gate

## Verified automatically available

- Git branch `agent-bct` is connected to the current BCT Vercel production project.
- Non-production preview deployments are created from Agent branch commits.
- Production `main` remains on baseline `f442749655e12238bf86ae364f33c614c2fb2148`.

## Gate sequence

1. Static/security unit tests pass.
2. Vercel preview for the tested SHA reaches READY.
3. Health endpoint returns development mode and writes disabled.
4. Public knowledge endpoint returns only public approved items.
5. Chat preview endpoint reports generation disabled before Gateway activation.
6. Session/tool endpoints reject missing auth.
7. With dedicated test accounts, verify each role and cross-role denial.
8. Only after 1-7: enable model generation in preview.
9. Model receives no live tool loop initially; run adversarial conversation tests.
10. Only after model adversarial pass: enable read-only model-directed tools in preview.
11. Run cross-user/project, money, bid-confidentiality and injection tests again.
12. Add mobile UI only after backend behavior is stable.
13. Full V46 regression.
14. Production gate and explicit Ty approval.

## Current blockers/observations

- GitHub workflow created on the feature branch has not yet reported a workflow run at the immediate verification point. Do not claim CI pass until a run exists and succeeds.
- Recent Vercel deployment listing had not yet advanced to the newest Agent commits at the immediate verification point. Do not claim preview of the newest server code is READY until its SHA appears.
- No production deployment is required to clear these preview gates.


## Evidence rule

A gate is PASS only with evidence from the exact candidate SHA/environment. Design documents, source inspection, or the existence of a test file are not execution evidence.

Required evidence categories:
- GitHub test run: workflow run ID + successful conclusion + SHA.
- Vercel: READY preview deployment + SHA.
- Endpoint smoke: status/result recorded against that preview.
- Auth/cross-user: dedicated non-production test identities, no real customer secrets in evidence.
- Model adversarial: prompt/scenario + expected/actual + pass/fail, with secrets redacted.
- V46 regression: exact candidate SHA and checklist result.

If infrastructure prevents a gate from running, mark BLOCKED, not PASS and not FAIL.
