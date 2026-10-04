# BCT Estimator Backend Reconciliation Contract

Status: required V46 backend completion; design only; no live migration applied.

## Confirmed mismatch

Frontend currently expects:
- direct insert to `bct_estimator_applications`;
- RPC `bct_submit_assessment_package(...)`;
- estimator role in authenticated app metadata;
- assignment, scheduling, review and payment concepts.

Live database inspection found none of the estimator/assessment tables/functions previously searched. `bct_my_permissions()` also has no estimator branch.

Agent BCT must not fabricate around this gap.

## Required implementation order

### 1. Application intake
Prefer an RPC over direct browser table INSERT so server validation, duplicate prevention and audit are centralized.

Required fields from current UI:
- legal_name
- business_name optional
- phone
- email
- experience
- qualified trades
- service jurisdictions
- references
- background-screening consent/status
- application/approval status
- timestamps
- auth_user_id only after secure account linkage

Credentials/files must use BCT's existing document/storage patterns rather than storing uploaded files in JSON.

### 2. Estimator identity/profile
After BCT approval, establish an estimator profile linked to `auth.users`.
Do not rely solely on a stale JWT role for sensitive workflow actions; backend profile/status remains authoritative.

### 3. Assignment
Assignment must include:
- project
- estimator
- BCT assignment status
- offered/accepted timestamps
- schedule
- per-completed-assignment compensation
- normal travel included
- unusual travel extra amount only when pre-approved
- separation-of-duties marker/check

### 4. Homeowner assessment fee/workflow
Workflow states must support the existing V46 policy:
`assessment_required -> payment_pending -> paid -> estimator_assigned -> scheduled -> site_assessment_completed -> assessment_submitted -> bct_review -> bct_approved -> contractor_bidding -> credited_to_project`.

Scheduling cannot proceed before the required fee is recorded paid when a paid site assessment applies.

### 5. Assessment package
Current portal requires:
- visit_date
- standardized photos
- optional videos
- measurements
- conditions
- proposed scope
- estimating notes
- additional inspection flag/details
- site-visit complete
- photos complete
- measurements complete
- documentation complete
- package complete

Use existing BCT project file/photo/storage mechanisms for media where possible. Do not duplicate storage infrastructure.

### 6. BCT review
Only BCT/Admin can accept completeness and approve release to contractor bidding.
Estimator submission does not equal BCT approval.
AI does not approve the package.

### 7. Estimator payment eligibility
Payment eligibility requires:
- site visit complete
- required photos complete
- measurements complete
- documentation complete
- complete assessment package
- BCT accepted

Payment basis is per completed accepted assignment, not hourly or percentage of construction contract.

### 8. Separation of duties
Database/backend enforcement is required, not only JavaScript:
- estimator on project cannot submit a contractor bid for that project;
- estimator on project cannot be awarded/assigned as performing contractor for that project.

This must integrate with existing bid/assignment RPCs rather than relying only on Agent BCT.

### 9. Permissions/RLS
Required cases:
- applicant sees own application;
- approved estimator sees own profile and assignments;
- estimator sees/submits only assigned assessment packages;
- estimator cannot approve own package;
- estimator cannot see competing bids;
- homeowner sees only homeowner-safe assessment status/fee information;
- contractor sees only bidding-safe approved assessment information when BCT releases it;
- Admin has management access;
- unassigned/cross-project access denied.

### 10. Agent BCT
Only after backend is implemented and tested:
- add estimator role to authoritative permission resolution;
- add estimator-safe read RPCs;
- add them to Agent BCT fixed allowlist;
- keep approval/assignment/payment decisions human/Admin controlled.

## Migration gate

Before any live schema change:
- inspect existing document/payment/project/audit foreign-key conventions;
- design schema with constraints and indexes;
- create migration on branch;
- review RLS and function grants;
- run security advisors;
- test on non-production/staging path;
- verify existing V46 regression;
- then separately approve live application.


## Reconciliation update — 2026-10-02

Repository inspection found that V46 already contains additive estimator migrations on the development history, including:
- `20260930232500_estimator_system.sql`;
- `20261001001500_estimator_contractor_conflict_guard.sql`;
- `20261001195000_estimator_performing_contractor_assignment_guard.sql`.

These migrations define the estimator application/profile/site-assessment model and database separation-of-duties guards. Agent BCT must reuse this work rather than inventing another estimator schema.

A read-only check of the currently connected live Supabase project on 2026-10-02 returned no live `bct_estimator_applications`, `bct_estimator_profiles`, `bct_site_assessments`, `bct_submit_assessment_package`, or `bct_complete_site_assessment` objects. Therefore repository implementation and live database state are not yet reconciled.

No estimator migration was applied to the live database during Agent BCT work. Applying or merging these V46 migrations is a production change and remains outside the Agent branch release gate until separately approved and verified.
