# BCT Insurance Portal — Integration Readiness Gate

Status: **INTEGRATED ON V46 DEVELOPMENT BRANCH / NOT PRODUCTION READY**

The Insurance Portal foundation, carrier/member access, per-claim RLS boundaries, claim intake, BCT review, needs-information loop, messaging, supplements, authorization, internal notes, existing-project linking, and linked-project lifecycle are selectively integrated into the current V46 development branch without replacing the newer homeowner, contractor, estimator, property-manager, or Admin shell.

## Required before production integration

- Verify the deployed canonical BCT project-creation contract and its required fields.
- Preserve the existing BCT project/job numbering path.
- Do not call `bct_submit_homeowner_project` as an insurance user or BCT Admin unless the deployed contract explicitly supports that use.
- Do not insert directly into `bct_projects` from Insurance Portal browser code.
- Create/link exactly one canonical BCT project per insurance claim.
- Run migrations in a non-production Supabase environment first.
- Execute authenticated RLS tests for BCT Admin, insurance org admin, assigned adjuster, unrelated same-carrier adjuster, unrelated carrier, and anonymous user.
- Run existing V46 regression/smoke checks plus Insurance Portal checks.
- Verify mobile/iPhone behavior and role visibility.
- Obtain explicit production merge/deploy approval.

Until all gates pass, the Insurance Portal must remain development-only and must not be merged/deployed to production.
