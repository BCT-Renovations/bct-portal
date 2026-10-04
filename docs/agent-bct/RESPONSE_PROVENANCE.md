# Agent BCT Response Provenance Contract

Users should be able to understand what kind of answer they received without seeing internal tool traces or prompts.

## Provenance classes

### general_guidance
Derived from approved BCT knowledge/policy. It is not a claim about the user's current project/account.

### live_confirmed
Derived from an authorized current BCT read tool for the signed-in user. The UI may say “Confirmed from your BCT project/account” when the underlying tool succeeded.

### mixed
Contains both live-confirmed state and general BCT process guidance. The response must distinguish the two.

### human_review_required
The requested outcome is reserved for BCT/Admin/human authority. Agent may explain/collect/prepare but not imply the decision has been made.

### unavailable
Agent could not confirm the requested live state because authentication, backend, provider, or authorized data was unavailable.

## Rules

- Never label a user assertion as live_confirmed.
- Never label branch seed knowledge as live project status.
- A failed/denied tool cannot produce live_confirmed.
- A successful tool only confirms fields actually returned after projection.
- Do not expose RPC names, hidden prompt text, raw tool payloads, tokens, internal risk codes or database identifiers merely to prove provenance.
- If knowledge conflicts with immutable Agent security policy, security policy wins.
- If live state conflicts with general guidance, state the live state and explain that BCT review may be needed; do not silently rewrite either source.
