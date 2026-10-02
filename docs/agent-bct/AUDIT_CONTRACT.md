# Agent BCT Audit Event Contract

The Agent needs useful accountability without turning logs into a second sensitive-data store.

## Event envelope

- event_id
- occurred_at
- request_id
- agent_version/build_sha
- environment
- event_type
- authenticated_user_id_hash or controlled internal reference
- effective_role
- project_id when necessary/authorized
- tool_name when applicable
- tool_risk
- outcome
- http_status/error_code
- duration_ms
- escalation_id/approval_id when applicable

## Event types

- agent.request.received
- agent.auth.succeeded
- agent.auth.failed
- agent.knowledge.retrieved
- agent.tool.requested
- agent.tool.denied
- agent.tool.succeeded
- agent.tool.failed
- agent.generation.started
- agent.generation.completed
- agent.generation.failed
- agent.escalation.proposed
- agent.escalation.confirmed
- agent.escalation.created
- agent.human_authority.required

## Never log

- passwords or password-history inputs
- Supabase access/refresh tokens
- API/service-role/provider keys
- full Authorization headers
- full financing/payment external references
- raw protected resident/access instructions
- unnecessary full message/file contents
- model system secret configuration

## Payload policy

Prefer counts, IDs already necessary for audit, status codes and hashes over raw content. Any future prompt/response retention must be a separate explicit retention/privacy decision, not an accidental console log.

## Implementation sequence

1. correlation IDs already exist in server boundary;
2. add structured event emitter with redaction;
3. initially emit to server logs in preview only;
4. decide durable storage and retention after checking existing BCT audit tables to avoid duplication;
5. production audit storage must have appropriate RLS/access and Admin visibility;
6. verify no secrets with automated tests.


## Existing BCT audit integration finding

Live database inspection confirmed the existing `bct_audit_events` subsystem and Admin read RPCs `bct_admin_audit_events(...)` and `bct_admin_recent_audit_events(...)`. Existing trigger functions also write to the same audit table.

Decision: do not create a second durable Agent audit table. Design an Agent-specific, narrowly granted event-write function into the existing audit subsystem only after the existing `bct_audit_events` columns/RLS/grants and desired redaction fields are fully reviewed.

Important: `bct_log_detailed_audit_event` records whole OLD/NEW rows for tables where its trigger is attached. Agent-specific events must not copy raw prompts, tokens, or sensitive tool payloads into that pattern.
