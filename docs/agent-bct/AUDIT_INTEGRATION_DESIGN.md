# Agent BCT Audit Integration Design

Verified live schema: 2026-10-01. No migration applied.

## Existing table

Reuse `public.bct_audit_events`.

Existing useful fields:
- id bigint
- actor_user_id uuid
- entity_type text
- entity_id text
- action text
- details jsonb
- created_at timestamptz
- previous_hash text
- event_hash text
- actor_aal text
- request_id text

Existing RLS policy is Admin-only through `is_bct_admin()`. Authenticated has SELECT privilege but RLS limits visibility; authenticated does not have INSERT privilege.

## Agent write design

Do NOT grant authenticated users direct INSERT to `bct_audit_events`.
Do NOT use a service-role key merely to log Agent events.

Future migration should add one narrowly scoped RPC, tentatively `bct_log_agent_event(...)`, with:
- caller must be authenticated for authenticated event types;
- actor_user_id always derived from `auth.uid()`, never supplied by client;
- actor_aal derived from JWT/auth context;
- request_id length/format bounded;
- entity_type fixed to Agent-approved values;
- action fixed to Agent-approved values;
- details schema explicitly constructed from scalar safe fields;
- raw prompt/completion/token/header/secret fields rejected;
- project/entity reference included only where caller already has appropriate access;
- function EXECUTE granted only to intended role(s);
- search_path pinned;
- hash-chain mechanism preserved by existing table behavior/trigger if applicable;
- tests verify user cannot forge another actor or inject arbitrary details.

## Preview before migration

Until that RPC is reviewed/migrated:
- Vercel preview logs may carry request ID, event code, status, duration and non-sensitive build metadata;
- never log bearer tokens or raw sensitive payloads;
- durable Agent audit integration remains disabled.

This avoids weakening the existing BCT audit subsystem just to make Agent development easier.
