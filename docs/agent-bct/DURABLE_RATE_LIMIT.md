# Agent BCT Durable Rate-Limit Design

Current limiter is intentionally preview-only and instance-local. It is not a production abuse-control guarantee.

## Production requirements
- authenticated quota keyed by verified BCT user identity after authentication, not conversational identity;
- public quota keyed only from a trustworthy platform/server signal, never an arbitrary client-supplied forwarded header;
- shared/durable state across server instances;
- bounded retention/automatic expiry;
- no raw IP or bearer token in application logs merely for rate limiting;
- separate public/authenticated limits;
- explicit Retry-After behavior;
- fail safely during limiter backend outage without granting privileged access;
- monitoring for sustained abuse without storing prompt contents.

## Ordering
1. Keep current local limiter for isolated preview.
2. Verify hosting-supported trusted request identity/current platform options at production-integration time.
3. Select durable shared store/mechanism already compatible with BCT/Vercel.
4. Test multi-instance behavior, expiry, authenticated account switching and public abuse.
5. Replace preview limiter before public production Agent activation.

Do not solve this by trusting `x-forwarded-for` directly from arbitrary requests, and do not use a Supabase service-role key in the browser.
