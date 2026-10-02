# Property Manager Priority Validation Record — Development Branch

Scope: Property Manager / Commercial multi-property priority enforcement. Production remains unchanged.

## Completed design/security validation
- Reuses bct_property_accounts, bct_managed_properties, bct_property_units, bct_project_property_units, bct_projects, bct_customer_decisions and bct_action_inbox.
- No parallel property-management tables or competing priority subsystem.
- Portfolio access requires an authenticated caller.
- Property/project visibility is bound to the caller's active property account and active managed property.
- Priority can safely aggregate admin-only action-inbox records without exposing the underlying internal rows.
- Critical and high attention are prioritized ahead of normal project states.
- Pending project decisions can be surfaced as manager-action counts without exposing unrelated homeowner data.
- Unit lookup is bound to the project's exact managed property, preventing same-manager cross-property unit leakage.
- Unit summary excludes resident_private_notes and access_notes.
- SECURITY DEFINER functions use explicit authentication, exact ownership checks and hardened public/auth/pg_temp search paths.
- Broad function execution is revoked before the intended authenticated grant.

## External verification status
The latest GitHub/Vercel check is currently blocked by Vercel's build-rate limit. This is not treated as a passing preview and is not treated as an application-code failure.

## Production gate
Do not apply these migrations to production until:
1. preview/build check is available and successful;
2. regression checks execute in a suitable runtime;
3. cross-account and cross-property tests pass;
4. private resident/access fields remain excluded; and
5. Ty explicitly approves production application.
