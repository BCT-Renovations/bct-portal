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
