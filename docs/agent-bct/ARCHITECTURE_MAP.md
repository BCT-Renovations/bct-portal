# Agent BCT Architecture Map — Baseline Discovery

Baseline SHA: `f442749655e12238bf86ae364f33c614c2fb2148`
Discovery date: 2026-10-01 America/Indiana/Indianapolis

## Confirmed application shape

BCT production is a mobile-first HTML/JavaScript application with modular V46 scripts backed by Supabase. The root `index.html` supplies the shared shell/styles and portal views. Add-on modules are loaded without replacing the main application. Current production includes the separate estimator modules and BCT PHOTO BUILD.

## Authentication / role model

- Supabase Auth is the login/session system.
- Existing frontend Estimator code reads authenticated user metadata for a UI role gate.
- Backend RLS and helper functions are the authority for data access.
- Confirmed backend helpers include `is_bct_admin`, `is_approved_bct_contractor`, `bct_my_permissions`, `bct_user_can_view_project`, `bct_user_owns_project`, `bct_user_owns_or_manages_project`, `bct_user_assigned_to_project`, and project/case access validators.
- Agent BCT must use backend-authoritative permissions for live data; frontend role metadata is not sufficient authorization.

## Homeowner / Client workflow map

Confirmed database/RPC architecture supports:
submission -> BCT review/verification -> estimate lifecycle -> customer decision -> contract/e-sign -> financing/payment/escrow -> project execution/schedule/messages/files/photos -> change orders/approvals -> completion/sign-off -> rating/dispute/warranty.

Key surfaces include `homeowner_projects`, `bct_projects`, `bct_submit_homeowner_project`, `bct_update_my_project`, `bct_my_project_dashboard`, `bct_my_project_messages`, `bct_my_project_files`, `bct_my_project_photos`, `bct_my_estimates_safe`, `bct_homeowner_decide_estimate`, `bct_my_payments`, `bct_my_notifications`, and related narrowly scoped RPCs.

## Contractor workflow map

Confirmed architecture supports:
application -> references/documents/background/compliance -> BCT approval -> available jobs -> private bid submission/update/withdrawal -> BCT bid review/award -> assignment -> project execution/safety/materials/messages -> invoicing/payout/completion.

Key tables include `bct_contractor_applications`, `bct_contractors`, `bct_contractor_documents`, `bct_contractor_references`, `bct_contractor_verifications`, `bct_bids`, `bct_assignments`, and safety/compliance tables. Key RPCs include `bct_submit_contractor_application`, `bct_submit_bid`, `bct_update_my_bid`, `bct_withdraw_bid`, `bct_admin_bid_review`, `bct_admin_award_bid`, and contractor-safe available/assigned-job surfaces.

## Estimator workflow map

Production frontend confirms a separate Estimator role and portal. Current V46 policy flow is:
assessment required -> payment pending -> paid -> estimator assigned -> scheduled -> site assessment completed -> assessment submitted -> BCT review -> BCT approved -> contractor bidding -> credited to project.

Rules confirmed in production code:
- free remote estimate first;
- paid in-person assessment only when BCT determines it is needed;
- estimator compensation per completed assignment;
- complete assessment package and BCT acceptance required for payment eligibility;
- normal travel included, unusual-distance travel pre-approved;
- estimator cannot bid on or perform the same project assessed;
- BCT approval is required before contractor bidding.

Important discovery: the production frontend references `bct_estimator_applications` and estimator assessment/assignment backend concepts, but initial public-schema name discovery did not return estimator-named tables. This is a verification item before Agent BCT gets any estimator live-data tool. Do not create duplicate estimator tables until the current estimator persistence path is fully traced.

## Admin workflow map

The database exposes a large `bct_admin_*` RPC surface for applications, contractors, estimates, bids/awards, jobs/projects, financing, escrow, payments/payouts, contracts/e-signatures, change orders, notifications, compliance, safety, completion, ratings/disputes, policy controls, translations and system/launch health.

Agent BCT Admin actions must be allowlisted one by one; no general Admin SQL/database tool.

## Database domain map

Confirmed relevant production tables include:
- projects/work: `bct_projects`, `homeowner_projects`, `bct_project_identifiers`, `bct_project_files`, `bct_project_photos`, `bct_project_messages`, `bct_project_message_reads`, `bct_project_milestones`, `bct_project_risks`, `bct_project_contacts`, `bct_project_property_units`;
- contractor/bidding: `bct_contractor_applications`, `bct_contractors`, `bct_contractor_documents`, `bct_contractor_references`, `bct_contractor_verifications`, `bct_bids`, `bct_assignments`;
- money/contracts: `bct_financing_records`, `bct_escrow_records`, `bct_payments`, `bct_contracts`, `bct_contract_signatures`;
- communications: `bct_notifications`, `bct_project_messages`, `bct_case_messages`;
- language/policy: `supported_languages`, `user_profiles`, `ui_translations`, `bct_service_translations`, `bct_policy_documents`, `bct_policy_translations`, `bct_translation_requests`;
- property/commercial/privacy: existing property account/property/unit/access and mediated communication controls;
- Photo Build: `bct_gallery_photos` and private `bct-gallery` storage.

## Language architecture

The production DB has nine rows in `supported_languages`. `user_profiles.preferred_language` references the language catalog. UI/service/policy translation tables and language RPCs already exist. Agent BCT must consume this system and must not create a parallel preference store.

## Security/RLS boundaries

RLS is enabled on confirmed critical tables. Sample policy counts at discovery:
- `bct_projects` 4
- `bct_bids` 4
- `bct_assignments` 4
- `bct_project_messages` 4
- `bct_notifications` 4
- `bct_financing_records` 4
- `bct_escrow_records` 4
- `bct_payments` 4
- `bct_contracts` 4
- `bct_contract_signatures` 2
- language/profile/policy tables also have RLS and multiple policies.

Agent tools must preserve these boundaries and prefer existing security-aware RPCs.

## Messaging / notifications

Existing project-message, read-receipt, case-message and notification architecture is present. Notification emitters exist for application, assignment, change order, completion, contract, contractor document review, escrow, estimate, financing, job approval, payment, payout, project workflow, rating and service-call events. Agent BCT should integrate with these instead of creating a second notification system.

## Financing / escrow / project status

Existing dedicated records and Admin/my-user RPCs exist for financing, escrow and payments. Existing job/project dashboards and health controls exist. Agent BCT should explain general policy from approved knowledge and retrieve live status only through authorized user-scoped/Admin-scoped server tools.

## Initial Agent tool boundary

Safe initial implementation order:
1. authenticated identity/effective permissions;
2. approved BCT knowledge retrieval;
3. read-only user-scoped project summary/status;
4. read-only notifications/messages/files where already authorized;
5. explicit Admin escalation;
6. only then consider confirmed write actions with confirmation/approval gates.

No autonomous money, assignment, approval, contract, dispute or escrow-release tools.
