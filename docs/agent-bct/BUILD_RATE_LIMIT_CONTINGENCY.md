# Agent BCT Build-Rate-Limit Contingency

Observed 2026-10-01: Vercel commit status for the Agent branch reported failure with a build-rate-limit upgrade target. This is infrastructure throttling, not evidence that Agent code failed to build.

## While throttled

Continue only work that does not require claiming a fresh deployment passed:
- static code/security review
- Supabase read-only architecture inspection
- test creation
- documentation/contracts
- tool schema/data minimization
- knowledge/language design
- voice and escalation architecture
- production-regression planning

Avoid unnecessary tiny commits where practical because every Git commit may trigger another preview build.

## Gate remains closed

Do not:
- enable production generation
- merge to main
- claim latest preview is healthy
- claim endpoint tests passed on newest SHA
- bypass Vercel by deploying an uncontrolled production copy

When preview capacity returns, verify the newest branch SHA and run the PREVIEW_GATE sequence.
