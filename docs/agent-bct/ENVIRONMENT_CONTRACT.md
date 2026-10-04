# Agent BCT Environment Contract

No secret values belong in this document or repository.

## Required for server boundary

### SUPABASE_URL
Classification: server configuration; URL is not itself a privileged secret.
Purpose: BCT Supabase project URL.

### SUPABASE_PUBLISHABLE_KEY
Classification: publishable/public client credential.
Purpose: Data API calls made in the context of the user's bearer session.

Compatibility fallback during development: `SUPABASE_ANON_KEY`.
Do not introduce a service-role key for Phase 1 user-scoped reads.

## Required later for generation

AI provider/Gateway credential name will be selected only after:
- hosting project linkage is positively identified;
- current provider/Gateway documentation is verified;
- model choice is current;
- cost/limits are understood.

Classification: server secret.
Never expose to browser JavaScript.

## Explicitly prohibited from browser

- Supabase service-role/secret key
- AI provider/Gateway secret
- Vercel access token
- database password/connection secret
- webhook signing secrets
- internal Admin credentials

## Environment separation

Development/preview and production values must remain separately controlled. Agent BCT branch work does not change production environment variables without explicit deployment approval.

## Startup/readiness behavior

Health endpoint does not reveal whether secret values exist.
Authenticated session/chat endpoints return a generic service-unavailable response if required server configuration is missing.
No client response may include secret values, raw stack traces or internal connection strings.
