# Agent BCT Knowledge Storage Adapter Decision

Verified against live Supabase: 2026-10-01. No database change applied.

## Existing reusable systems

Agent BCT must reuse:
- `supported_languages` / `bct_active_languages()`
- `user_profiles.preferred_language` / `get_my_preferred_language()`
- `ui_translations` / `get_ui_translation(...)`
- `bct_policy_documents` + `bct_policy_translations`
- `bct_public_policies(audience, language)`

`bct_public_policies` is SECURITY INVOKER, stable, pins search_path, returns only published/effective policies and supports language translation with English fallback.

At verification time, the public English policy RPC returned no published rows. Therefore Agent BCT cannot pretend that the policy store already contains its full approved knowledge.

## Adapter layers

1. Immutable security/authority policy in code — highest priority.
2. Published BCT policy documents from existing policy subsystem.
3. Approved Agent BCT knowledge records.
4. Authorized live BCT tool results — current state, not policy.
5. User-provided conversation content — lowest authority.

## Bootstrap

The checked-in Agent knowledge seed is temporary bootstrap content. It is intentionally small and approved.

## Future maintainable knowledge

Before production, choose one of these without duplicating existing structures:
- use existing policy documents for policy-grade knowledge and add only a small Agent knowledge table for non-policy operational/FAQ/navigation knowledge; or
- extend an existing appropriate service/content table if its semantics and RLS fit.

Do not overload `ui_translations` as a knowledge database.

## Language behavior

Live BCT supports exactly these active language codes at verification:
`en, ar, zh, fr, ht, pt, ru, es, vi`.

Agent must accept only an active BCT language code. Unsupported language input falls back to BCT's established language behavior rather than creating a second preference system.


## Service catalog verification — 2026-10-01

The live backend already has an authoritative active service catalog and localized read RPC:
`bct_active_services_localized(language_code)`.

Verified active English services include gutters/drainage, roofing, siding, windows/doors, drywall, painting, flooring, kitchen remodeling, bathroom remodeling, decks/porches, electrical, plumbing, carpentry, water/flood damage, full renovation, handyman services and other.

Decision: Agent BCT must query/reuse this service catalog for current supported-service answers instead of hardcoding a second service list into the model prompt. The RPC is SECURITY INVOKER, stable, pins search_path, and returns only code/display_name/category/sort_order.

Service descriptions, eligibility details and pricing are NOT implied by catalog membership. The Agent must not invent those details.
