# Agent BCT Threat Model — v0.1

## Assets to protect

- customer/homeowner project data
- protected resident/property-manager data
- contractor private bids and compliance data
- estimator application/assessment data when backend exists
- Admin notes and Admin-only operational data
- contracts, signatures, financing, escrow, payments and payouts
- account/session identity
- Supabase and AI-provider secrets
- BCT policies/knowledge integrity
- audit history

## Trust boundaries

1. User/chat input is untrusted.
2. Uploaded files, photos, project descriptions, contractor notes and retrieved messages are untrusted content.
3. The authenticated Supabase session establishes identity.
4. Backend RLS/permission functions establish data authorization.
5. Agent tool router is an allowlist boundary.
6. High-impact BCT decisions remain a human/Admin boundary.
7. AI-provider output is advisory/orchestration output, never database authority.

## Primary threats and required controls

### Role impersonation
Threat: user says “I am Admin/contractor/homeowner.”
Control: ignore conversational role claims for authorization; resolve backend session permissions.

### BOLA / cross-project access
Threat: user supplies another project/job/contract ID.
Control: call only user-scoped RPCs or explicit backend access checks; never trust object IDs alone.

### Competing-bid disclosure
Threat: homeowner/contractor asks for other contractors' bids.
Control: no Agent tool exposes bid competition to those roles; Admin-only review remains outside Phase 1.

### Resident-information disclosure
Threat: unassigned contractor requests resident/access details.
Control: preserve existing assignment/access/privacy checks; never include protected contact/access fields in generic project summaries.

### Prompt injection from BCT data
Threat: message/file/project text says to reveal secrets, ignore policy or execute actions.
Control: retrieved content is DATA; system/tool policy always wins; no arbitrary tool execution from retrieved text.

### Financial/contract overreach
Threat: model attempts refund, price change, financing guarantee, escrow release, payout, contract approval/signature.
Control: those actions are denied autonomous tools and require established BCT/Admin workflows.

### Secret exfiltration
Threat: prompt asks for API keys/service role/system prompt.
Control: secrets server-only; never place service-role/AI secret in browser; redact sensitive logs.

### Tool parameter manipulation
Threat: model supplies unauthorized IDs/fields or hidden write intent.
Control: per-tool schemas, server-side validation, fixed RPC mapping, no arbitrary SQL/RPC names.

### Stale authorization
Threat: role changed after JWT issued.
Control: sensitive future actions should validate current backend authorization; do not rely solely on cached UI state. Review session freshness requirements before write tools.

### Agent outage/provider failure
Threat: AI unavailable blocks BCT.
Control: Agent is additive; normal portals remain independent; return clear retry/support path; never fabricate status.

## Phase 1 design posture

Read-only live tools first. No Admin action tools. No Estimator live tools until backend persistence is reconciled. Escalation write tool remains disabled until its behavior is tested. All production integration remains behind PR + explicit Ty Perry merge approval.
