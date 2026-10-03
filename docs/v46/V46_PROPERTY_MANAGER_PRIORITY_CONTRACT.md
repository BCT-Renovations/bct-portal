# V46 Property Manager / Commercial Priority Contract

Development branch only. This extends the existing property-account, managed-property, unit, project, decision, and action-inbox architecture. It does not create a second property-management system.

## Portfolio behavior
A signed-in property manager sees only projects attached to an active managed property belonging to their active property account. Priority is composed from existing BCT action-inbox records and project workflow state.

The view may expose safe aggregates such as:
- critical/urgent project counts
- open attention count
- pending decision count
- active project count
- property/building/unit identifiers needed to locate the job

It must not expose BCT internal action details merely because an aggregate count is shown.

## Unit privacy
Property manager unit/project summaries deliberately exclude resident_private_notes and access_notes. Contractor access instructions remain governed by assignment-specific access controls; they are not included in the portfolio priority RPC.

## Security model
The priority/summary functions use SECURITY DEFINER only because their source attention records are admin-RLS protected. Every such function must authenticate the caller and prove exact property ownership through:
property account -> managed property -> project.

No broad property-account match, no cross-property fallback, and no unscoped action-inbox read is allowed.

## Release gates
- Cross-account manager isolation.
- Inactive account/property denial.
- Exact managed-property/project scope.
- Correct critical/high aggregate ordering.
- Pending decision aggregation.
- No resident private notes.
- No unit access notes.
- No internal action-inbox row details.
- No production application without explicit approval.
