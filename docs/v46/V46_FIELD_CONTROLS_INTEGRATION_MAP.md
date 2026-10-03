# BCT V46 Field Controls Integration Map

Status: DEVELOPMENT BRANCH ONLY — no production merge/deploy/database mutation.
Baseline: main @ f442749655e12238bf86ae364f33c614c2fb2148
Rule: reuse/extend existing V46 controls; do not create parallel systems.

## Confirmed existing foundations to extend
- Incident response: bct_incidents, bct_incident_witnesses, bct_safety_corrective_actions, bct_emergency_response_events, project photos/files, notifications.
- Stop work: bct_stop_work_orders plus existing project holds/safety controls. Release remains BCT-authorized.
- Property access: bct_site_keys, bct_site_access_rules, bct_customer_access, privacy controls.
- Materials: bct_job_materials, bct_customer_materials, bct_material_batches, bct_material_locations, bct_delivery_receipts/proofs, vendor orders, substitutions, special orders, purchase requests.
- Crew/assignment: bct_assignments, bct_project_crews, bct_worker_profiles/assignments. Homeowner-facing trade-lead identity is already being developed on feature/contractor-identity-trade-leads and must be extended rather than replaced.
- Pre-work/property condition: bct_site_condition_baselines, bct_project_photos/files.
- Hidden conditions: bct_hidden_conditions + existing change orders/approvals.
- Homeowner decisions: bct_customer_decisions, bct_decision_deadlines, notifications, schedule/project dependencies.
- Permits/inspections: bct_permits, bct_inspections, bct_quality_hold_points, bct_code_corrections, project dependencies.
- Utilities: bct_utility_interruptions.
- Property/contents protection and temporary protection: existing checklist/task/photo infrastructure should be extended; do not add a second checklist engine.
- Daily reporting: bct_daily_logs + project photos.
- Equipment/rentals: bct_equipment_usage, bct_tools_assets, bct_asset_assignments, bct_equipment_reservations, bct_job_health_alerts, bct_action_inbox.
- Waste/site logistics: bct_dumpster_permits plus checklist/tasks/files.
- Handoffs: bct_work_packages + bct_project_dependencies.
- Customer concerns/feedback: bct_customer_concerns, bct_concern_escalations, bct_customer_feedback/surveys, existing urgent/attention routing.
- Financial protection: bct_lien_waivers, bct_progress_billing, bct_allowances, bct_permit_responsibilities, bct_warranty_responsibility, bct_warranties, bct_job_costs/budget/committed costs/unbudgeted alerts, bct_financial_closeouts.
- Closeout: bct_closeouts, bct_closeout_items, punch list, completion certificates, warranties, project files.
- Property manager/commercial: existing organization/property/unit/commercial contact architecture.
- Insurance/claims: keep feature/insurance-claims-partner-foundation; no separate adjuster system.
- Readiness: existing approval, credentials, safety, materials, payment, access, assignment, project holds/dependencies and operational-readiness controls collectively form the readiness model. Do not add a new readiness subsystem.

## Genuine gaps / extensions to implement
1. Add lifecycle detail to incident handling: immediate safety response, BCT alert timestamp, evidence linkage, assessment, follow-up, documented closure; reuse incident/witness/corrective-action records.
2. Extend stop-work detail with affected scope/evidence/corrective requirements and enforce BCT-only release.
3. Extend access custody for card/code/lockbox types, purpose, issue/revoke/return history; keep sensitive values private.
4. Extend customer-material records for brand/model/size, photos/receipt references, location/delivery state, and explicit verification outcomes including insufficient/damaged/incompatible/wrong-spec/additional-needed.
5. Extend delivery/material custody for quantities, tickets, secured location, shortage/damage, transfer/return/handoff.
6. Extend existing Who's Coming work with arrival/departure/check-in/check-out and BCT-approved substitution lifecycle; no unverified worker may check in and homeowner visibility remains explicit.
7. Add pre-work baseline requirement flags/checklist linkage rather than a new photo system.
8. Hidden condition workflow must automatically hold affected scope until BCT disposition and route money/scope change through existing change order.
9. Add schedule-impact/reminder fields to customer decision deadlines where absent.
10. Link permit/inspection hold points to project dependencies so successor phase cannot advance without documented clearance.
11. Extend utility interruption with authorization, actual shutoff/restoration timestamps/responsible party and safe-restoration confirmation.
12. Add reusable checklist templates/items for contents protection, occupied-home rules, preconstruction orientation, noise/dust/odor, temporary protection, end-of-day security/cleanup, final property return.
13. Add contractor cannot-perform and Need BCT Decision as categories in existing field-question/case/action-inbox/escalation architecture, not separate systems.
14. Extend daily logs with named/authorized crew references, photos/issues/next steps.
15. Extend correction records with final clearance evidence/status.
16. Add weather/open-building temporary-protection checklist/evidence link.
17. Use neighbor-property condition/concern records for adjacent-property issues and damage evidence.
18. Extend rental/equipment records with rental company, responsible party, issue/return condition, deadline, extension/return resolution and late-fee exposure; feed existing Job Health/action inbox with advance warning -> urgent -> CRITICAL/OVERDUE.
19. Add waste haul/disposal responsibility and documentation to existing dumpster/logistics records.
20. Add explicit work-package handoff offer/acknowledgment fields.
21. Add expected-arrival/no-show/late status to crew attendance and route alerts through existing notifications/attention.
22. Add material shortage lookahead against upcoming schedule/work package and route warning through existing Job Health.
23. Extend special orders with measurement/selection/price/approval/responsible-party confirmation before nonreturnable purchase.
24. Keep punch-list items open until correction and verification.
25. Add manufacturer serial/model/document references to warranty/product closeout records.
26. Homeowner portal should compose existing data into What Happens Next, Today at My Home, My Decisions, Money & Project Summary, Report a Problem, optional Daily Feedback.
27. Closeout Home Record is a presentation/organization layer over existing completion/warranty/product/permit/inspection files.
28. Estimator assessment completeness must extend the existing estimator migration history when reconciled; no duplicate estimator backend.
29. Property manager multi-property priority view should be a query/view over existing properties/projects/action inbox, not new project records.
30. Insurance assignment completeness belongs inside existing Insurance/Claims Partner intake; adjuster is a representative/member role, not a separate portal/system.

## Implementation order
A. Safety/access/field authority: incident, stop-work, access custody, cannot-perform/BCT decision.
B. Workforce presence: Who's Coming substitutions + attendance/no-show.
C. Materials/custody/special orders/deliveries/shortage.
D. Field execution controls: baseline, hidden conditions, hold points, utilities, occupied-home/protection, daily logs, weather, neighbor, handoffs, cleanup.
E. Equipment/waste and urgent escalation.
F. Financial/closeout controls.
G. Portal composition: homeowner, estimator completeness, property manager priority, insurance intake completeness.
H. Cross-role/RLS/regression tests and preview only.
I. STOP before production merge/deploy/database application and request explicit approval.

## Production protection
This map authorizes development design/branch work only. No migration is to be applied to the live Supabase project and no branch is to be merged/deployed to production without explicit approval.
