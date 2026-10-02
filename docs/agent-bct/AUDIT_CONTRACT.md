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
