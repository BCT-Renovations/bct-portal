# TAKAI insurance integration — isolated safety plan

Base: production TAKAI commit 9f54b9b50d03374a95d3a932ef428aea7ad7c153.
Source: feature/insurance-claims-partner-foundation. Separate insurance verification source: feature/v46-insurance-verification-isolated.

## Rules
- Do not merge the historic branch wholesale: branches have diverged.
- Preserve current index.html, Admin Control Board, homeowner, contractor, estimator, Agent BCT, gallery, and navigation.
- Integrate only isolated insurance modules after checking existing script names, DOM IDs, routing, and dependencies; load once, guard duplicate event handlers and prevent redirect loops.
- Keep insurance claims partner portal distinct from contractor insurance credential verification.
- No production schema changes or deployment until explicit later approval.
- Validate canonical project creation, original contract numbering, and one project per claim; no direct browser inserts into bct_projects.
- Apply migrations in a separate nonproduction Supabase environment, checking current schema and migration history first.
- Verify RLS for admin, carrier admin, assigned adjuster, unrelated adjusters/carriers, and anonymous visitors; verify authorized uploads and audit history.
- Run existing TAKAI regression tests, insurance tests, and mobile navigation checks on isolated preview.
- Preserve TAKAI and THEO safe points; never rewrite or delete historical branches.

## Status
Integration planning branch established. Insurance code has NOT been copied, activated, migrated, tested end-to-end, or deployed. Next: inventory source modules and dependencies; prepare minimal additive integration.