# V46 Cross-Role Regression Matrix

Development branch only.

## Release gates

1. Existing homeowner, contractor, and admin sign-in flows remain intact.
2. Homeowner project summaries are limited to the homeowner's own project and exclude internal/private fields.
3. Estimator submission remains separate from BCT approval.
4. A project estimator cannot bid on or become the performing contractor for the same project.
5. Who's Coming shows only BCT-approved homeowner-visible trade leads.
6. An unapproved substitute cannot check in.
7. Stop-work release remains BCT/Admin controlled.
8. Insurance/Claims uses the existing claim architecture; representatives do not create a parallel claims system.
9. Property-manager priority is composed from existing project and attention data.
10. Readiness is composed from existing controls; no competing readiness subsystem.
11. Urgent concerns, rental deadlines, and material shortages feed the existing attention system.
12. Punch-list closeout requires verification.
13. Sensitive access information remains private and role-scoped.
14. Privileged RPCs require explicit authorization/ownership checks.
15. Production remains untouched until explicit approval.

## Live security review

The current Supabase security advisor reports warnings for several privileged Live Quality and password-history RPCs because signed-in users can execute them. Inspection of representative functions confirms they include internal admin, ownership, or contractor checks. These require targeted least-privilege review rather than broad changes that could break working flows.

Leaked-password protection is also currently reported disabled and remains a separate account/platform setting decision.

## Release sequence

Static validation -> cross-role authorization tests -> existing V46 regression -> preview build -> preview browser smoke tests -> security review -> final release report -> explicit production approval.
