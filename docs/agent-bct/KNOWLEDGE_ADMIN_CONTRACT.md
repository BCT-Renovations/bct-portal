# Agent BCT Knowledge Administration Contract

Agent knowledge changes must be maintainable without turning arbitrary Admin text into immediate model authority.

## Source classes

1. Immutable security/authority rules — code/review only.
2. Published BCT policy documents — existing policy workflow.
3. Service identity — existing service catalog.
4. Operational/FAQ/navigation guidance — future approved knowledge workflow if needed.
5. Live account/project state — never edited as knowledge; comes from authorized operational systems.

## Approval lifecycle for future operational knowledge

draft -> reviewed -> approved/published -> retired

A draft is never retrievable by the production Agent.

Required metadata: stable key, domain, audience, language, source reference, status, effective dates, human-authority flag, updater and timestamps.

## Admin safety

- Admin authentication comes from BCT backend, not chat.
- No model may self-publish knowledge.
- No uploaded/customer/project content becomes approved knowledge automatically.
- Publishing cannot alter immutable security rules or expand tool permissions.
- Retired/expired content is excluded.
- Conflicting approved sources should trigger review rather than silent ranking by convenience.
- Changes require audit metadata but audit must not contain secrets/raw credentials.

## Translation

English fallback may be used transparently while an approved translation is unavailable. Machine-generated translation must not silently become a new approved policy version. The existing BCT language codes/preferences remain authoritative.

## Production rule

Do not add a new production knowledge table until the non-policy operational content need is demonstrated and schema/RLS/Admin workflow are reviewed. Reuse existing BCT policy/service stores where their semantics fit.
