# Agent BCT Activation Flags

Feature activation must be staged and reversible.

## Current
- generation: server flag, default OFF;
- model-directed live tool loop: OFF;
- writes: OFF;
- estimator live tools: OFF;
- voice: not implemented.

## Required staged order
1. READY non-production deployment with generation OFF.
2. Smoke endpoints/security.
3. Enable generation in preview only; Phase A has no model tools.
4. Run adversarial model matrix.
5. Enable ordinary read-only model tools in preview.
6. Run cross-role/cross-user/RLS tests.
7. Enable high-risk read-only money/contract tools only after ordinary reads pass.
8. Durable audit + safe escalation wrapper.
9. Any future controlled write requires its own explicit confirmation/authority contract and tests.
10. Mobile UI and full V46 regression.
11. Production gate and Ty's explicit merge approval.

## Rollback
At any failed gate, disable the newest capability flag first. Agent failure must not disable ordinary BCT portal functionality. Never compensate for a failed gate by broadening database privileges, switching to service-role access, or silently enabling another provider.
