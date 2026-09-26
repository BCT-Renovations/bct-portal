# BCT AI Estimating — Launch Contract

AI estimating is a launch-critical BCT Admin feature.

## Required flow
1. Read the selected homeowner project/job scope, measurements, description and available project-file metadata.
2. Generate a structured **draft** only: scope summary, assumptions, material/labor/other line items, quantities, units and unit costs.
3. Persist the draft to `ai_estimates` and `ai_estimate_items`.
4. Recalculate all monetary totals server-side with `recalculate_ai_estimate`.
5. Show BCT-only cost, markup, internal notes and totals in BCT Admin.
6. Allow authorized BCT Admin users to edit every estimate input before approval.
7. Only `approve_ai_estimate` may transition an estimate to approved. AI generation must never call approval.
8. Customer-facing estimate release must require `status='approved'`; contractors/homeowners must never receive internal cost, markup, AI payload or internal notes.

## Structured AI output
The generation service must validate JSON before persistence:
- scope_summary: string
- assumptions: string[]
- items: [{category: material|labor|other, description, quantity >= 0, unit, unit_cost >= 0}]
- warnings: string[]
- confidence_notes: string[]

Photos are evidence, not authoritative measurements. When a reliable measurement or specification is missing, the AI must state an assumption or flag it for BCT review rather than inventing precision.

## Security
RLS denies estimate tables to non-admin users. BCT Admin is checked by `is_bct_admin()`. No service-role credential belongs in browser code. Model/API credentials must remain server-side.

## Completion gate
Do not mark AI estimating complete until: schema migration applied; server-side AI generation endpoint connected; admin editor connected; save/reload works; recalc works; manual approval works; non-admin access is denied; approved customer-safe output excludes BCT internal fields; mobile UI passes; and an authenticated end-to-end test passes.
