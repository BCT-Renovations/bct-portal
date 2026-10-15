# V46 offline security checkpoint — October 15, 2026

Base: `10df584a2dec915002500422e5d7e10319a703f6`, existing isolated insurance branch.

## Verified local changes

Checklist 78: photo API verifies a bearer token with Auth, checks the database Admin RPC with the caller token, reads the selected photo through caller-scoped RLS, and restricts the image URL to that photo in the configured private gallery bucket before any AI request. Client-supplied metadata cannot replace authorized database metadata. Browser sends its existing session token.

Checklist 79: bounded request, allowlisted response schema, sanitized errors, request timeouts, no-store headers and an instance-local per-user rate limit. This rate limit is not a distributed quota or spending cap. No provider configuration was changed.

Checklist 80: fixtures cover direct output_text and REST message output, malformed/incomplete responses and invalid scores/enums. Real provider output remains unverified.

Verification: `node --test tests/offline/photo-security.test.mjs tests/agent-bct/*.test.js` — 175 passed, zero failed. The 23 new security tests mock all network requests. They prove unauthorized requests cannot invoke the provider; they do not prove deployed Auth/RLS or provider operation.

## Pending boundaries

Hosted Admin/non-Admin tests, real Supabase policies and provider testing remain pending. No Supabase project calls, migrations, provider calls, preview deployment, production changes or insurance activation were performed. Insurance remains Unfinished. This checkpoint does not claim 100 numbered tasks complete.
