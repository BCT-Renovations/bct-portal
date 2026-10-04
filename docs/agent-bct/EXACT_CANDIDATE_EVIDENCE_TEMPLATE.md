# Agent BCT Exact Candidate Evidence

Status: template. Complete only with observed evidence; never infer PASS.

Candidate SHA:
Branch: agent-bct
Timestamp:
Preview deployment ID:
Preview URL/reference:
Vercel state:

## Automated gates
| Gate | Evidence | Result |
| --- | --- | --- |
| Agent BCT Security Tests | workflow run ID + totals | BLOCKED |
| V46 Smoke Checks | workflow run ID | BLOCKED |
| V46 Production Guard | workflow run ID | BLOCKED |

## Preview invariants
Record observed values:
- productionIntegrated:
- liveWritesEnabled:
- estimatorLiveToolsEnabled:
- voiceEnabled:
- generation flag:
- live model-tool loop:
- privacy/cache headers:

## Phase A generation
Configured model:
Gateway/provider:
Adversarial matrix evidence:
Nine-language evidence:
Timeout/budget/rate-limit evidence:
Result: BLOCKED

## Phase B reads
Controlled account fixtures:
Ordinary read matrix:
Cross-user/cross-project denials:
High-risk read stage:
Injection/untrusted-data checks:
Result: BLOCKED

## Audit / escalation
Durable audit evidence:
Escalation confirmation evidence:
Duplicate/idempotency evidence:
Receipt minimization evidence:
Result: BLOCKED

## Mobile
iPhone/device/browser:
Keyboard/scroll/safe-area:
Back/close/account switch:
RTL/accessibility:
Agent-outage portal regression:
Result: BLOCKED

## Voice
Voice is not part of initial text readiness unless separately approved. Record runtime, current official pricing, language coverage, privacy/retention, microphone behavior, interruption and cost ceilings before changing voiceEnabled.

## Release conclusion
Technical release gate: BLOCKED
Production approval: NOT GIVEN

Any security-relevant commit after this evidence changes the candidate SHA and requires affected evidence to be refreshed. Production merge remains prohibited until the final report is presented and Ty Perry explicitly approves it.
