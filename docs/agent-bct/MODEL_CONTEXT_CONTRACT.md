# Agent BCT Model Context Contract

No model provider is connected yet. This contract defines what may be sent when generation is added.

## Context assembly order

1. Immutable Agent BCT system/security rules.
2. Effective authenticated role/capabilities from backend, if signed in.
3. Human-authority and confidentiality constraints relevant to the request.
4. Approved BCT knowledge retrieved for the request.
5. Minimized live tool results when the user requested/needs live data and authorization permits it.
6. User's current message.
7. Conversation history only to the minimum needed for continuity.

Retrieved BCT data never outranks items 1-3.

## Required labels

Knowledge context:
- source key
- approval status
- language/fallback
- human-authority-required flag

Live context:
- tool name
- request/correlation ID
- effective role
- risk level
- untrusted-data marker

## Never send

- Supabase access/refresh token
- publishable/service/secret keys
- Vercel tokens
- database credentials
- password values/history
- provider external references unless specifically required and approved
- storage paths when metadata suffices
- internal error stack traces
- competing bids to unauthorized roles
- protected resident/access information to unauthorized roles

## Response grounding

If a response depends on live state, the model must be told the tool result is the authoritative current record for that response and must not invent fields not present.

If a tool fails or returns no authorized data, the model must say it cannot confirm the live status. It may provide general BCT process guidance from approved knowledge, clearly separated from live status.

## Human authority

The model may explain, summarize, collect information, prepare a proposed next step, or escalate. It must not convert explanation into a final BCT decision for pricing, contracts, refunds, escrow release, payouts, contractor/estimator approval or assignment, disputes, claims, policy exceptions, legal decisions, safety emergencies, or other reserved GC/Admin judgment.
