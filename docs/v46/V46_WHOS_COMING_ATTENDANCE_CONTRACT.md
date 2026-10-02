# V46 Who's Coming / Attendance & Substitution Contract

This work extends the existing contractor identity/trade-lead, worker-assignment and project-crew architecture. No parallel crew or homeowner identity system is permitted.

## Homeowner identity
BCT may internally assign unlimited contractors, workers and crews. The homeowner-facing Who's Coming identity view shows only BCT-released trade leads. Each visible lead requires an active project assignment and an approved profile photo. One visible lead is allowed per trade; one visible primary contact per project.

## Attendance
Physical check-in is tied to the canonical worker profile and worker assignment. A signed-in worker may check in/out only their own authorized crew record; BCT Admin may perform the controlled administrative action.

## Substitutions
A substitute must have an active worker assignment and BCT approval before check-in. Unapproved substitutes are excluded from homeowner attendance status. Approval does not automatically make the substitute a named homeowner-facing trade lead.

## Privacy
Attendance exposes safe schedule/presence state only. It does not expose government ID, verification documents, bids, margins, internal notes, resident private notes or access instructions. Named identity remains governed by the trade-lead release system.

## Release gates
- worker/project assignment match
- caller authorization
- substitute BCT approval
- homeowner project ownership
- approved/released trade lead identity
- assignment lifecycle revokes stale visibility
- profile-photo review revocation hides stale identity
- no production application without explicit approval
