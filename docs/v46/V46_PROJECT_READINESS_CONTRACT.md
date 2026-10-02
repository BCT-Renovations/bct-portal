# V46 Project Readiness Contract

Project readiness is a composition of existing project controls, not a new subsystem or table.

## Separate purpose from platform launch readiness
`bct_admin_operational_readiness()` remains the existing admin-only platform/pilot launch capability check.
`bct_project_readiness_blockers(project_id)` is the canonical project-level readiness surface.

## Canonical project blockers
The project readiness surface composes existing records for active project holds, required contract signatures, performing-contractor assignment, overdue required payment, site access readiness, required quality/inspection hold points, material availability, and overdue homeowner decisions.

## Security
Detailed project blocker composition is BCT Admin-only. The function uses explicit authentication/admin checks, a hardened search path, and explicit execute grants. Homeowners and contractors do not receive internal hold reasons, access-rule values, material cost/notes, contractor bids/margins, or other internal blocker records through this function.

## No duplicate readiness system
Do not add a project-readiness table, parallel blocker queue, or second project-readiness RPC. New readiness criteria must extend the canonical project function by composing existing authoritative records.

## Release gates
- canonical blocker categories match live schema
- no internal/private blocker detail leakage
- admin authorization enforced
- no duplicate readiness subsystem
- platform launch readiness remains separate and unchanged
- successful preview/runtime validation before production
- explicit Ty approval before production application
