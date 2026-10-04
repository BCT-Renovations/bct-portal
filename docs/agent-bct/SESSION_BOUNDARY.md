# Agent BCT Session Boundary Contract

The Agent session endpoint is a bootstrap/readiness surface, not a replacement authentication system.

## Rules
- Requires existing BCT bearer session.
- Resolves role through `bct_my_permissions`.
- Unknown/malformed authenticated role fails closed.
- Returns only normalized role and bounded string permission identifiers.
- Does not return JWT claims, email, password data, tokens, app metadata, user metadata or Supabase internals.
- Client cannot choose an RPC.
- No service-role credential.
- No Agent-specific login/session cookie.
- No write capability is advertised while writes remain disabled.
- Estimator live capability remains false until backend reconciliation.

## Account switching
The frontend must discard Agent authenticated state and live results on BCT logout/account switch. A session response from User A must never be reused as authorization for User B; every live tool call independently resolves the current bearer identity/role again.

## Failure
Missing/expired auth -> authentication required.
Unauthorized/unknown role -> access denied.
Backend unavailable -> generic failure/service unavailable.
No fallback to homeowner/Admin and no conversational identity claim.
