# Agent BCT Implementation Order

This is the dependency order. It is intentionally not a vanity task count. Later layers do not start until their prerequisites are verified.

## Layer 0 — Freeze and map the existing BCT system
Status: substantially complete.
- pin production baseline SHA
- isolate `agent-bct`
- map frontend modules and portal roles
- map Supabase tables/RPCs/RLS
- map language, messaging, notifications, money and workflow systems
- identify Estimator persistence mismatch
- identify security-advisor findings
- maintain Integration Contract, Architecture Map, Tool Allowlist, Security Findings and Threat Model

## Layer 1 — Server-side Agent boundary
Status: next implementation layer.
- use Vercel `/api` function capability supported by the existing static project
- no framework rewrite
- create one Agent API boundary
- validate method/content type/body size
- validate Supabase bearer session server-side
- resolve permissions using existing backend
- separate public knowledge mode from authenticated live-data mode
- deny arbitrary SQL/RPC/tool names
- fixed tool registry only
- structured errors
- request/correlation IDs
- safe timeout/failure behavior
- no service-role secret in browser
- AI provider secret server-only
- CORS/same-origin review
- rate-limit design
- no production deployment until gate

## Layer 2 — Knowledge foundation
- canonical BCT knowledge domains
- approved/versioned source records
- public vs authenticated/internal visibility
- effective dates/versioning
- translations tied to existing language system
- policy source links/IDs
- retrieval filters
- prompt-injection isolation
- fallback when no approved knowledge exists
- Admin update path design
- tests for stale/conflicting knowledge

## Layer 3 — Read-only live tools
- identity.permissions
- project.list/status
- messages/files/photos/schedule
- notifications
- estimates/change orders/approvals
- contracts/signatures
- financing/escrow/payments
- contractor dashboard/application/docs/references
- per-tool schemas
- per-tool authorization tests
- cross-user/project negative tests
- output minimization/redaction

## Layer 4 — Agent orchestration
- BCT system instructions
- role-aware response policy
- tool-selection policy
- human-authority rules
- financial/contract safety
- estimator restrictions
- project/bid confidentiality
- resident privacy
- multilingual response behavior
- source/status grounding
- no fabricated live status
- clear uncertainty/escalation behavior

## Layer 5 — Audit and observability
- Agent conversation/session identifiers
- user/role/project linkage where authorized
- tool call/result/error metadata
- escalation/approval events
- latency/failure metrics
- redaction policy
- retention policy
- Admin audit visibility
- no passwords/tokens/full sensitive payloads in logs

## Layer 6 — Escalation
- verify `bct_open_case`
- duplicate behavior
- case categories/severity
- confirmation rules
- Admin routing
- notification behavior
- audit trail
- retry/idempotency
- escalation status readback

## Layer 7 — Estimator backend reconciliation
- reconcile existing V46 frontend with actual persistence model
- create/approve one canonical backend design only if missing
- application
- verification
- assignment
- fee/payment state
- scheduling
- assessment package
- BCT review/acceptance
- payment eligibility
- project credit
- separation of estimator/contractor duties
- RLS/RPCs/audit/notifications
- only then enable Estimator live Agent tools

## Layer 8 — Controlled write tools
Each tool separately reviewed and gated.
- low-risk user updates first
- explicit confirmation
- idempotency keys
- current authorization recheck
- audit event
- rollback/recovery behavior
- Admin approval where required
- money/contracts/assignment/final pricing remain human authority unless an existing BCT workflow explicitly authorizes a narrow operation

## Layer 9 — Mobile Agent UI
- add Agent BCT entry point without replacing portals
- iPhone safe-area/keyboard/viewport
- readable chat
- loading/streaming/failure states
- tool/action confirmation UI
- escalation UI
- language integration
- accessibility
- no uncontrolled scrolling
- no hidden portal/navigation buttons
- Agent outage does not block normal portal

## Layer 10 — Full verification
- homeowner
- contractor
- estimator after reconciliation
- Admin
- property manager/commercial where applicable
- unauthenticated
- wrong-role
- cross-user
- cross-project
- prompt injection
- malicious file/message content
- bid confidentiality
- resident privacy
- financing/escrow/payment
- contract/signature
- all supported languages
- iPhone/mobile
- Agent outage
- slow provider/timeouts
- V46 regression
- Supabase security advisors
- preview deployment

## Layer 11 — Production gate
- update Integration Contract
- final changed-file/migration inventory
- rollback instructions
- security findings disposition
- preview proof
- regression proof
- PR review
- report complete/remaining
- STOP and wait for Ty Perry's explicit production merge approval
- only after approval: merge/deploy/production smoke test
