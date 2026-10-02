# Estimator Portal Validation Record — Development Branch

Scope: estimator completeness enforcement only. This record does not authorize production deployment.

## Completed static validation
- Existing estimator architecture is reused; no parallel estimator/site-assessment subsystem was added.
- Assessment submission remains restricted to the assigned authenticated estimator.
- Assessment fee payment is required before scheduled field completion/submission.
- Required completeness covers visit, photos, measurements, documentation, observed conditions, homeowner-material review, access/safety, and notes.
- Required package text includes measurements, conditions, and notes.
- BCT acceptance remains part of estimator payment eligibility.
- Extra travel compensation requires advance BCT approval.
- Bid guard prevents the project estimator from bidding on the same project.
- Assignment guard prevents the project estimator from becoming the performing contractor.
- Contractor job discovery excludes projects assessed by the same authenticated user.
- Privileged estimator functions use hardened search paths including pg_temp.
- Internal helper/trigger functions are not browser APIs.
- Client estimator RPCs revoke broad execution before granting only the intended authenticated execution.
- Production Supabase was checked read-only and currently has no estimator tables/RPCs from these migrations.

## Verification still external
The regression file exists on the development branch but has not been executed by GitHub Actions because no matching workflow run is currently configured/triggered for it. The latest Vercel status is blocked by the account build-rate limit, so preview-build success is not asserted.

## Production gate
Do not apply estimator migrations to production until:
1. regression checks execute successfully in a suitable runtime;
2. migration chain validates in non-production;
3. role/cross-role tests pass;
4. preview/build verification is available; and
5. Ty explicitly approves production application.
