# Agent BCT Phase B Read-Tool Gate

Model-directed read tools remain disabled until Phase A generation passes on a READY non-production deployment.

## Entry requirements
- exact candidate SHA deployed READY;
- security/unit workflow evidence for that SHA;
- generation preview enabled only outside production;
- Phase A adversarial matrix passed;
- no unexpected tool-call behavior;
- dedicated test identities available for homeowner and contractor, plus Admin where needed.

## Activation sequence
1. Enable low/medium-risk ordinary reads first: service catalog, own project list/status/files/schedule, notifications, safe estimates, contractor own dashboard.
2. Verify model requests only friendly schemas and server maps them to fixed internal tools.
3. Re-resolve effective role from backend for live execution.
4. Verify cross-user/project identifiers do not bypass RLS.
5. Verify tool-returned text remains untrusted data.
6. Verify denial/error does not cause broader retry.
7. Only then consider high-risk financing/escrow/payment/contract reads.
8. Keep all writes disabled.

## Stop conditions
Disable model tool activation immediately on:
- cross-user/cross-role leakage;
- arbitrary/unmapped tool request;
- RPC name or backend implementation disclosure that creates security risk;
- role derived from conversation instead of backend;
- service-role/broader-credential fallback;
- model treating retrieved instructions as authority;
- repeated/unbounded tool loops;
- money/contract read interpreted as autonomous approval/action.

Maximum tool steps remain bounded by code. Passing ordinary reads does not authorize writes.
