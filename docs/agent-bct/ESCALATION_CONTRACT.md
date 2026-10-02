# Agent BCT Human Escalation Contract

Existing BCT case system is the preferred handoff mechanism, but Agent write access remains disabled until a safe wrapper exists.

## Existing backend verified

`bct_open_case(project_id, job_id, case_type, category, severity, subject, description)`:
- requires authenticated caller;
- requires project access;
- validates supplied job belongs to project;
- derives opened_by from `auth.uid()`;
- derives homeowner/contractor/Admin role;
- is SECURITY INVOKER.

`bct_add_case_message` also checks case/project access and reserves internal-only notes for Admin.

## Why Agent does not call bct_open_case directly yet

The current RPC accepts free-form:
- case_type
- category
- severity
- subject
- description

It does not itself provide Agent-specific duplicate suppression, explicit confirmation semantics, Agent provenance, bounded controlled categories, or structured redaction.

## Required Agent wrapper behavior

Future `bct_agent_open_case` or equivalent should:
1. require authenticated user;
2. accept project/job only when existing access checks pass;
3. allow a fixed Agent escalation category/type set;
4. derive actor from auth, never client input;
5. require explicit user confirmation for ordinary escalation writes;
6. permit emergency/safety guidance to tell user to use emergency services where appropriate rather than treating a case as emergency response;
7. cap subject/description length;
8. reject empty/whitespace-only content;
9. suppress obvious duplicate open Agent cases for the same user/project/category within a defined window;
10. mark provenance as Agent BCT without storing hidden prompts;
11. write an audit event;
12. return only homeowner/contractor-safe case fields.

## Suggested controlled categories

- project_question
- schedule_issue
- payment_question
- financing_question
- escrow_question
- contract_question
- estimate_question
- change_order_question
- contractor_issue
- estimator_issue
- document_issue
- access_or_portal_issue
- warranty_or_service_call
- dispute_or_claim
- safety_concern
- other

Severity remains bounded to BCT-approved values; the Agent does not self-declare legal/emergency severity.

## Conversation behavior

Agent may say a matter needs BCT/Admin review and prepare a concise escalation summary. It must ask for confirmation before creating the case unless an existing BCT workflow explicitly defines another behavior.

Agent never promises the outcome, approval, refund, price, schedule change, assignment or response time merely because a case was opened.


## Live case schema verification — 2026-10-01

Verified constraints:
- case_type is only `issue` or `dispute`;
- category is only `scope, quality, schedule, payment, contractor, customer, materials, property_damage, communication, safety, other`;
- severity is only `low, normal, high, critical`;
- status is only `open, in_review, waiting_on_customer, waiting_on_contractor, resolved, closed`;
- subject and description must be nonblank;
- case_number is unique;
- project access is protected by RLS;
- only Admin may update cases under the current update policy.

Therefore the earlier suggested Agent-facing categories are conversational labels only. A future wrapper must map them onto the existing case category enum rather than expanding or bypassing the production schema.

### Duplicate handling finding

The live case table has no uniqueness constraint for actor + project + category + open status. The existing `bct_open_case` RPC does not suppress duplicates. Agent write activation therefore remains blocked until duplicate/idempotency behavior is deliberately added.

### Write activation decision

Do not expose `bct_open_case` directly to the model. The future Agent wrapper must validate fixed enums, enforce length limits, require confirmation, add provenance/audit metadata safely, and return a minimized case receipt.
