# Agent BCT — fourteen-role capability map

Source-derived mapping for checklist 82. This maps foundations and gaps; it does not certify fourteen operational roles. Selected position changes focus only. Authenticated backend role determines the shared read-only tool pool. No per-position database elevation exists.

Chat responses currently declare `liveToolLoopEnabled:false` in both protected preview and generation-preview paths. A separate guarded read endpoint is not proof that chat executed it. No provider/configuration was activated for this inventory.

| Position | UI portals | Existing workflow/data foundation | Remaining operational gap |
|---|---|---|---|
| Project Manager | client, contractor, estimator, admin | Homeowner project/status/schedule reads; contractor dashboard through the separately authorized role pool. | No assignment, milestone, approval or project write tool. |
| Estimator | estimator, admin | Estimator portal is separate; Agent has estimating process policy and scope guidance. | No estimator profile, assessment, media or submission Agent tool. |
| Contractor Coordinator | contractor, handyman, admin | Contractor dashboard summary and process guidance. | No bid, onboarding, document upload, approval or assignment Agent write tool. |
| Assignment & Scheduling Coordinator | client, contractor, estimator, admin | Homeowner schedule/upcoming-schedule reads. | No live worker availability, assignment or schedule write tool. |
| Customer Support | client, admin | Service catalog, permitted notifications and process knowledge. | No account recovery/change tool; no unconfirmed live account actions. |
| Finance & Escrow Coordinator | client, admin | Homeowner financing/escrow/payment read endpoints exist at high risk. | Excluded from default medium-risk model schema pool; no money movement or release tool. |
| Insurance & Claims Coordinator | admin | Parked insurance portal has its own guarded RPCs; Agent provides claims process focus. | No claims-specific Agent tool; no parallel adjuster system or claim resolution authority. |
| Property Management & Commercial Coordinator | admin | Property/privacy process focus; ordinary authorized homeowner context only. | No property/building/unit/resident-specific Agent tool. |
| Documents & Change Order Coordinator | admin | Safe homeowner file metadata, estimates and contract summary reads. | No document signing, binding change-order or contract amendment tool; storage paths omitted. |
| Quality & Completion Coordinator | admin | Authorized project summary can include punch-list/warranty counts. | No inspection, acceptance, signature, warranty decision or completion write tool. |
| Compliance & Credentials Coordinator | contractor, admin | Contractor dashboard includes readiness/safety summary fields. | No credential verification, renewal upload or hold-removal Agent tool. |
| Analytics & Reporting Coordinator | admin | Authorized summaries can be explained using the caller role pool. | No Admin analytics/reporting aggregate tool in the registry. |
| Admin Escalation & Human Review Coordinator | contractor, estimator, admin | Human-review policy and escalation receipt/preparation modules exist. | No registered durable escalation/approval/decision write tool; no delivery promise. |
| Photo Recommendation Coordinator | admin | Existing gallery and separate Admin-only photo recommendation API/UI. | Not an Agent chat tool; no publication, consent inference or automatic image analysis in test mode. |

## Exact authenticated-role pools

The model-schema lists below use the default medium risk ceiling; the registry includes high-risk read endpoints separately. Anonymous callers receive no private tools. Estimator/insurance positions do not create a new recognized backend role in this registry.

### public

Registry: none.

Default model schema pool: none.

### homeowner

Registry: `service.list`, `identity.permissions`, `project.list`, `project.status`, `notification.list`, `project.files`, `project.schedule`, `project.schedule.upcoming`, `estimate.list`, `contract.summary`, `financing.list`, `escrow.list`, `payment.list`.

Default model schema pool: `service_list`, `project_list`, `project_status`, `notifications`, `project_files`, `project_schedule`, `upcoming_schedule`, `estimates`, `contract_summary`.

### contractor

Registry: `service.list`, `identity.permissions`, `notification.list`, `contractor.dashboard`.

Default model schema pool: `service_list`, `notifications`, `contractor_dashboard`.

### admin

Registry: `service.list`, `identity.permissions`, `notification.list`.

Default model schema pool: `service_list`, `notifications`.

## Registry implementation

| Tool | Backend RPC | Verified role allowlist | Risk | Writes |
|---|---|---|---|---|
| service.list | bct_active_services_localized | homeowner, contractor, admin | low | disabled |
| identity.permissions | bct_my_permissions | homeowner, contractor, admin | low | disabled |
| project.list | bct_my_project_summary_cards | homeowner | medium | disabled |
| project.status | bct_my_project_dashboard | homeowner | medium | disabled |
| notification.list | bct_my_notifications | homeowner, contractor, admin | medium | disabled |
| project.files | bct_my_project_files | homeowner | medium | disabled |
| project.schedule | bct_my_schedule | homeowner | medium | disabled |
| project.schedule.upcoming | bct_my_upcoming_schedule | homeowner | medium | disabled |
| estimate.list | bct_my_estimates_safe | homeowner | medium | disabled |
| contract.summary | bct_my_contract_summary | homeowner | medium | disabled |
| financing.list | bct_my_financing | homeowner | high | disabled |
| escrow.list | bct_my_escrow | homeowner | high | disabled |
| payment.list | bct_my_payments | homeowner | high | disabled |
| contractor.dashboard | bct_my_contractor_dashboard | contractor | medium | disabled |

## Acceptance limits

Fourteen UI routing fixtures and existing policy/security tests are local evidence. Checklist 83–96 still require the role-specific business guidance/context/authority scenarios stated in the register; they are not automatically closed by this mapping. Hosted tool ownership, real Auth/RLS, live data, provider behavior, escalation delivery and user acceptance remain pending.
