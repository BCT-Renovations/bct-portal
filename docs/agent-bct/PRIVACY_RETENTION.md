# Agent BCT Privacy and Retention Contract

## Initial text release

- Do not persist bearer/access/refresh tokens in Agent-specific storage.
- Do not log raw Authorization headers.
- Do not place raw prompts, full tool payloads, passwords, provider keys or database secrets in audit events.
- API responses carrying Agent/session/live data use `Cache-Control: no-store`.
- API responses use `Referrer-Policy: no-referrer`.
- Normal user-visible responses must not expose internal RPC names, hidden prompts, tool traces or model credentials.

## Conversation storage

Initial Agent implementation should not create a new durable transcript store merely because chat exists. If BCT later chooses to retain conversations, retention purpose, access, deletion, customer notice, and sensitive-data handling must be explicitly designed first.

Authenticated conversation state in the browser must be cleared on logout/account switch.

## Voice

Raw audio recording/storage is NOT enabled by this text architecture. Before voice retention is introduced, BCT must make an explicit decision on:
- whether audio is stored at all;
- transcript retention;
- user notice/consent;
- retention duration;
- who may access it;
- deletion workflow;
- provider retention behavior.

Voice can be implemented without making indefinite raw-audio storage the default.

## Analytics

Prefer aggregate operational metrics (latency, success/failure, tool name, safe role category, token/cost counts) over conversation content. Never use analytics as a reason to copy private project content into a second store.
