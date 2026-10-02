# Agent BCT Mobile Integration Gate

Status: implementation contract locked; production activation prohibited until backend generation and cross-user gates pass.

## Entry and session
- Agent BCT uses the existing Supabase browser session. No second login, role selector, or Agent-specific bearer-token storage.
- Effective role always comes from the backend `bct_my_permissions` result.
- Public users receive general BCT guidance only.
- Homeowner, contractor, and Admin live data remains subject to existing RLS and allowlisted Agent tools.
- Estimator live access remains disabled until estimator backend reconciliation is complete.

## Sign-out and account switching
Every existing BCT sign-out path must clear Agent transcript, pending request state, live-result labels, and any in-memory authenticated context before another account can use the Agent. The Agent must never persist private live results in localStorage, sessionStorage, service-worker caches, URLs, analytics payloads, or browser history.

## iPhone shell
The Agent UI must be additive and must not replace or restructure the approved V46 landing page or portal routing. Required behavior:
- no horizontal overflow;
- safe-area aware top/bottom spacing;
- reachable close/back control;
- composer stays above the software keyboard;
- transcript owns its scrolling; opening Agent cannot create page-wide runaway scrolling;
- portal scroll position is restored on close;
- text zoom and long translations remain usable;
- Arabic uses RTL presentation without changing authorization;
- reduced-motion preference is honored.

## Failure isolation
Agent failure must never block normal BCT portal use. Authentication expiry clears private Agent state and requests sign-in. Network/model timeout preserves the user's draft. Voice remains OFF and no microphone permission is requested for the initial text release.

## Provenance labels
The frontend may render only backend-derived trust states:
- BCT general guidance
- Confirmed from your BCT project
- BCT review required
- Live status unavailable

Model wording alone can never create a confirmed-live label.

## Release order
1. Exact preview generation and adversarial tests.
2. Separate authenticated homeowner/contractor authorization evidence.
3. Additive mobile Agent shell on `agent-bct` only.
4. iPhone portrait/landscape, keyboard, scroll, logout/account-switch, nine-language and accessibility tests.
5. Full V46 regression.
6. Release report.
7. Explicit Ty approval before production merge/deploy.
