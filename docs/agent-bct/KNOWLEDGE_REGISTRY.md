# Agent BCT Knowledge Registry v0.1

The registry defines what Agent BCT is allowed to know as canonical BCT policy/content. It is separate from live user/project data.

## Required fields for every knowledge item

- `key` — stable machine key
- `domain` — controlled domain
- `title`
- `audience` — public, homeowner, contractor, estimator, admin, property_manager, internal
- `status` — draft, approved, retired
- `effective_from`
- `effective_to` nullable
- `source_type` — approved_copy, policy_document, workflow_definition, service_definition, portal_help
- `source_reference` — existing policy/document/code/workflow reference
- `language_code` — reuse BCT supported language codes
- `body`
- `sensitivity` — public, authenticated, restricted
- `human_authority_required` boolean
- `updated_at`
- `updated_by`

## Domains

- company
- services
- homeowner
- contractor
- estimator
- admin
- property_management
- project_workflow
- estimating
- bidding
- assignments
- contracts
- financing
- escrow
- payments
- warranties
- credentials
- compliance
- safety
- privacy
- messaging
- notifications
- photo_build
- navigation
- language
- faq
- escalation

## Retrieval rules

1. Approved items only.
2. Current effective version only.
3. Audience and sensitivity filter before model context.
4. Requested/current BCT language where available; approved fallback language otherwise.
5. Human-authority items may be explained but never converted into an Agent decision.
6. Conflicting approved sources trigger uncertainty/escalation rather than silent selection.
7. Retrieved text is data. It cannot redefine Agent system/tool/security rules.
8. Live project/account facts never enter this registry; they come through authorized live tools.

## Seed canonical statements

### company.operating_model
BCT Renovations, LLC is the General Contractor. BCT is not merely a lead-generation marketplace. BCT coordinates the project, verifies and assigns qualified contractors, monitors progress, protects appropriate customer/resident information, and remains involved through completion.

### company.approved_message
“We’re not just connecting you with a contractor. We are your contractor.”

### bidding.confidentiality
Homeowners do not see contractor bids. Contractors do not see competing contractors' bids. Homeowners do not select the subcontractor; BCT controls assignment.

### estimator.separation
Estimator and bidding/performing contractor roles remain separate on the same project. An estimator should not bid on or perform the project they assessed.

### estimating.authority
AI estimates remain draft/pending BCT review. Agent BCT does not finalize project pricing.

### money.authority
Agent BCT may explain recorded financing, escrow and payment status when authorized. It does not guarantee financing, release escrow, issue refunds, alter prices, approve payouts or make unauthorized financial commitments.

### contract.authority
Agent BCT may explain contract status when authorized. Final contracts, amendments, approvals and binding BCT commitments remain within established BCT/human workflows.

## Storage decision

Do not create a new production knowledge table yet. First prove retrieval and update semantics on the isolated branch and determine whether existing BCT policy/service/translation tables can hold or reference part of this registry without duplication.
