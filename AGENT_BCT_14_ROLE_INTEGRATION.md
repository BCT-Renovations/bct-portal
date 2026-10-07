# Agent BCT — 14 Role Integration Matrix (V46)

Status: isolated V46 workstream. This document is an orchestration contract, not a new application.

## Roles
1. Credential & Compliance
2. Job Coordinator
3. Estimator
4. Contractor Manager
5. Homeowner Support
6. Project Manager
7. Change Order Manager
8. Claims Assistant
9. Safety & Quality
10. Materials & Logistics
11. Finance & Payment
12. Communication & Translation
13. Analytics & Reporting
14. Escalation & Human Review

## Integration rules
- Agent BCT reads and coordinates existing V46 systems; it does not create duplicate credential, estimator, bidding, job, payment, photo, messaging, or approval systems.
- BCT Admin remains the final authority for approvals, overrides, pricing, contracts, disputes, money, legal matters, credential exceptions, and safety holds.
- Contractor eligibility continues to use the existing credential board and bid guard.
- Estimator behavior continues to use the existing estimator system and separation-of-duties guards.
- AI estimates remain DRAFT/PENDING BCT REVIEW and cannot auto-approve or auto-release.
- Customer project photos remain private unless an existing BCT-controlled publication path explicitly authorizes publication; Agent BCT only recommends.
- Translation is a cross-cutting requirement for homeowner and contractor interactions.
- Government ID remains private and is never surfaced by Agent BCT to homeowners or contractors.
- Escalation creates/updates the existing Admin workflow instead of creating a parallel queue.

## Core handoff chain
Credential -> Contractor Manager -> Job Coordinator -> Project Manager -> Safety/Quality -> Materials/Logistics -> Change Orders -> Finance/Payment -> Communication/Translation -> Analytics/Reporting -> Human Review when authority is required.

Estimator joins before contractor bidding when remote evidence is insufficient and hands the completed assessment into existing BCT review.

Claims Assistant pulls existing photos, documents, verification, and job history for a human-reviewed evidence package; it does not file a claim.

## Explicit no-auto-decision gates
Credential approval/override, AI estimate approval, customer-facing price release, contract approval, change-order approval, escrow release, payment disputes/refunds, claims filing, legal decisions, safety-hold clearance, and public photo/gallery publication.

## Build posture
This batch is intentionally isolated on branch `agent-bct-14-role-integration-v46`. No production deployment or merge is performed by this workstream.
