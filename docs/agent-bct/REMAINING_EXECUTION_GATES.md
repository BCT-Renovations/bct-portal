# Agent BCT Remaining Execution Gates

This checklist tracks work that cannot be marked complete by design documents alone.

## Gate 1 — Exact preview evidence
- obtain a READY non-production deployment for the exact candidate SHA;
- record the exact SHA;
- verify health reports non-production and all write/voice/estimator flags OFF;
- verify no production alias changed.

## Gate 2 — Executed automated tests — PASS for candidate 755ed046554be0523b2ede1c26078b129a38ebe3
- GitHub Agent BCT Security Tests passed on push and pull_request;
- Node suite executed 128 tests: 128 passed, 0 failed;
- BCT V46 Smoke Checks passed on the same candidate;
- BCT V46 Production Guard passed on the same candidate;
- any later code change requires a fresh exact-SHA pass.

## Gate 3 — Phase A generation
- configure a current approved model in preview only;
- generation flag ON only in preview;
- run the adversarial matrix;
- verify no model-directed tools are accepted;
- verify response guard, rate, timeout, budget and outage behavior.

## Gate 4 — Phase B ordinary reads
- expose low/medium-risk schemas only;
- execute homeowner/contractor/Admin role tests;
- execute cross-user/cross-project/RLS denial tests;
- verify no broader retry and no service-role fallback;
- verify tool output remains projected and untrusted.

## Gate 5 — High-risk reads
- separately enable financing/escrow/payment reads in preview;
- repeat authorization and leakage tests;
- no write capability is introduced.

## Gate 6 — Durable audit and escalation
- verify existing audit-chain behavior before migration;
- implement only the narrow approved Agent audit path;
- implement safe escalation wrapper with confirmation/idempotency;
- execute forging, cross-project, duplicate and secret-leak tests.

## Gate 7 — Estimator reconciliation
- reconcile the missing live estimator backend/role before any estimator live tool;
- do not invent parallel tables or a duplicate role system.

## Gate 8 — Product integration
- add mobile Agent UI after backend gates;
- test iPhone safe area, keyboard, scrolling, back navigation, account switching, RTL and accessibility;
- Agent outage must not block ordinary portal use.

## Gate 9 — Voice
- only after secure text/read/escalation behavior;
- choose current runtime after pricing/language/privacy review;
- same auth/orchestration; no second Agent;
- raw audio storage OFF by default;
- test interruptions, microphone denial, network failure and text fallback.

## Gate 10 — Release
- full V46 regression;
- Integration Contract current;
- exact candidate SHA evidence;
- complete/remaining report;
- STOP for Ty Perry's explicit production merge approval.
