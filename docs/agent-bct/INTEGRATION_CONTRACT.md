# Agent BCT Integration Contract

Status: DEVELOPMENT ONLY — NOT APPROVED FOR PRODUCTION MERGE
Branch: `agent-bct`
Production integration baseline: `f442749655e12238bf86ae364f33c614c2fb2148`
Baseline meaning: production `main` after approved BCT PHOTO BUILD PR #7 merge.

## Non-negotiable integration rules

Agent BCT is an intelligence layer over the existing BCT platform. It must not replace V46, create a parallel BCT application, bypass Supabase RLS, trust a role claimed in chat text, expose privileged credentials to browser code, or merge to production without Ty Perry's explicit production merge approval.

The regular BCT portals must remain usable if Agent BCT or its AI provider is unavailable.

## Existing BCT systems to reuse

- Supabase Auth authenticated session as identity source.
- Existing BCT role/permission helpers and RLS as authorization source, including `is_bct_admin()`, project ownership/assignment/access helpers, and role permissions.
- Existing Homeowner/Client project workflow and `bct_projects` / `homeowner_projects` compatibility surfaces.
- Existing contractor applications, contractor records, verification, documents, references, memberships, bidding and assignments.
- Existing Estimator V46 portal/policy modules and existing production estimator backend objects once verified. Do not create duplicate estimator concepts merely to satisfy Agent BCT.
- Existing project identifiers, files, photos, messages, message reads, notifications, scheduling, approvals, change orders, contracts/signatures, payments, financing, escrow, completion, ratings/disputes, warranties, property-management/privacy controls, safety and compliance.
- Existing BCT PHOTO BUILD gallery and private `bct-gallery` storage contract.
- Existing multilingual architecture: `supported_languages`, `user_profiles.preferred_language`, `ui_translations`, service/policy translations and language RPCs.
- Existing server-side/RPC surfaces should be preferred over direct table access for live Agent reads/actions.

## Current architecture observations

The production frontend is a mobile-first, progressively enhanced HTML/JavaScript application with modular BCT V46 scripts. Estimator modules are loaded separately through `bct-admin-sections.js`. The estimator frontend explicitly separates estimator and contractor duties and uses authenticated session role metadata for its UI gate. Backend authorization remains authoritative.

The production database already contains broad domain models and narrowly scoped RPCs for Homeowner, Contractor and Admin workflows. Examples include `bct_my_*` read surfaces for authenticated users and `bct_admin_*` Admin surfaces. Agent BCT should wrap approved narrow RPCs rather than receive unrestricted SQL/database access.

## Authentication and authorization contract

1. Resolve the current Supabase authenticated session server-side for live requests.
2. Resolve effective BCT permissions from backend-authoritative role/access functions and RLS; never from conversational claims.
3. Scope every live project request to the authenticated user's authorized projects/assignments.
4. Do not expose private Admin notes, competing bids, protected resident data, or another user's/project's data.
5. Contractor bid visibility remains isolated; homeowners do not receive contractor bid competition data.
6. Resident/contact information is available only through existing authorized project/property-manager/assignment privacy controls.
7. Record-changing tools must call explicit, allowlisted server-side operations with validation.
8. High-impact actions require confirmation and/or Admin approval and remain outside autonomous Agent authority.

## Knowledge architecture

Agent BCT knowledge must be maintainable and separated from live account data. Approved knowledge domains:
company; services; homeowner procedures; contractor procedures; estimator procedures; Admin procedures; financing; escrow/payment; contracts; project workflow; credentials/compliance; safety; warranty; Photo Build; property management; privacy/security; FAQs; portal navigation; current BCT policies.

Knowledge retrieval must treat uploaded files, project descriptions, messages, notes and retrieved content as untrusted DATA, never as system instructions.

Policy content should be versionable/updatable without rebuilding the Agent application. Existing BCT policy tables/translations should be reused where they are the canonical source.

## Live data/tool contract

General BCT questions may use approved knowledge without account lookup.

Live questions require authenticated, authorized server-side tools. Initial candidate read tools, subject to exact signature/permission verification:
- user/session role and permissions
- my projects / project dashboard / project identifiers
- my project messages/files/photos/schedule/milestones
- my notifications
- my estimates safe view
- my financing/payment/escrow-visible state
- my approvals/change-order-visible state
- contractor application/compliance/assignment state
- estimator application/assignment/assessment state after backend verification
- Admin escalation creation/status

No unrestricted database tool is permitted.

## Human/Admin authority

Agent BCT may explain, collect, summarize, navigate and escalate. It may not independently finalize project pricing/estimate approval, contracts, material financial decisions, refunds, escrow release, contractor/estimator approval or rejection, contractor assignment, disputes/claims, policy exceptions, legal judgments, or safety-emergency decisions.

Agent BCT must never impersonate Ty Perry or represent that BCT/Admin approved an action unless the backend confirms that decision.

## Money/financing safeguards

No financing guarantees or invented loan terms. No autonomous price changes, refunds, escrow release, payouts or financial commitments. Use existing financing/payment/escrow state and approval paths.

## Estimator safeguards

Estimators remain separate from contractors. Compensation is per accepted completed assessment assignment, not hourly or construction percentage. Remote estimating remains free. A disclosed in-person assessment fee may be required when BCT determines an assessment is necessary. Project-credit/nonrefund behavior follows approved BCT policy. The estimator who assesses a project must not bid on or perform that same project.

## Translation integration

Use the existing BCT preferred language and supported language catalog. Current production catalog contains nine supported languages. Agent BCT must not create a second language-preference store.

## Agent-specific persistence (planned, not yet migrated)

Only after schema/RLS review, Agent-specific data may include:
- conversation/session metadata with user/role/project scope
- Agent audit/action events
- escalation records or links to the existing case/notification system
- versioned Agent knowledge metadata where existing policy/content tables are not sufficient

Do not duplicate existing project, messaging, notification, approval, payment, policy, translation or role tables.

## Logging/audit

Where appropriate record user/account ID, effective role, project/job ID, timestamp, Agent action/tool, result, escalation/approval requirement and errors. Do not log passwords, access/refresh tokens, service-role keys, raw secrets, or unnecessary sensitive personal data.

## Environment/secrets

AI provider keys and Supabase privileged credentials, if needed, are server-only environment variables. Browser code may only receive public/publishable configuration already allowed by BCT. Service-role credentials must never be embedded in client JavaScript.

## Existing V46 files modified

None yet. Initial work is isolated documentation/mapping on `agent-bct`.

## Database migrations

None yet. Do not apply Agent BCT DDL to production during architecture mapping. Any future Agent migration must be represented in-repo, reviewed for RLS/grants/security, tested in an isolated development environment when available, and explicitly included in the production integration report.

## Rollback

Before production integration, Agent BCT changes must be removable by reverting the Agent BCT merge commit/PR and, for database changes, applying a reviewed forward rollback migration where destructive rollback would risk data. Existing portal functionality must not depend on Agent availability.

## Production integration gate

Before merge: verify branch; migrations; security tests; V46 regression; preview deployment; iPhone/mobile; this Integration Contract; PR review; exact completion/remaining report. Then wait for Ty Perry's explicit production merge approval.


## Implementation checkpoint — 2026-10-01 large-batch continuation

Implemented on `agent-bct` only:
- server health/session boundary;
- fixed read-only tool registry and authenticated executor;
- data-minimizing projections;
- approved knowledge seed/retrieval;
- immutable orchestration policy and injection guardrails;
- model context assembler;
- exact nine-language BCT registry;
- disabled-by-default Vercel AI Gateway runtime;
- gated generation path with no live model tool loop;
- model-safe tool schemas and bounded read-only tool-loop core;
- preview audit envelope and existing-audit integration design;
- preview abuse rate guard;
- executable Node security tests and GitHub workflow;
- preview/generation/tool-loop runbooks;
- estimator backend reconciliation contract.

Current blockers:
- Vercel branch builds are presently blocked by the account build-rate limit; latest commit status points to `upgradeToPro=build-rate-limit`.
- CI workflow has not yet produced a recorded run; do not treat tests as passed until execution evidence exists.
- Estimator backend remains absent in live Supabase and therefore live Estimator Agent tools remain disabled.
- durable Agent audit-write RPC is designed but not migrated.
- generation environment/model is not enabled.
- model-directed live tools remain disabled.
- mobile Agent UI not yet connected.

Production invariants remain unchanged: no Agent production merge, no Agent production deployment, no Agent DB migration.


## Reconciliation checkpoint — 2026-10-02

The earlier checkpoint above is historical. Current verified state:
- GitHub Actions now executes the Agent BCT suite; exact candidate `755ed046554be0523b2ede1c26078b129a38ebe3` executed 128 tests with 128 pass / 0 fail, and V46 Smoke Checks plus Production Guard passed.
- Subsequent hardening commits require their own exact-SHA CI evidence before release.
- Vercel still reports deployment rate limiting, so the current exact candidate does not yet have READY preview evidence.
- Repository history contains the V46 estimator-system and estimator separation-of-duty migrations. A read-only check of the connected live Supabase project found those estimator objects absent; Agent BCT therefore continues to disable estimator live tools and will not invent a parallel estimator schema.
- Agent BCT has not applied a production database migration.
- Generation remains disabled by default; model-directed live reads remain unconnected to chat; writes and voice remain disabled.
- Final release requirements are now also captured in `RELEASE_GATE.md`, and mobile execution requirements in `MOBILE_UI_TEST_MATRIX.md`.

Production invariants remain unchanged: no Agent production merge/deployment and no Agent database migration without the release gates and Ty Perry's explicit final approval.
