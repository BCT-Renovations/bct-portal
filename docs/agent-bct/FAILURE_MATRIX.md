# Agent BCT Failure Matrix

Agent failure must never make the normal BCT portal unusable.

| Failure | User-facing behavior | Forbidden fallback |
|---|---|---|
| AI Gateway unavailable/5xx | Agent temporarily unavailable; normal portal stays usable | service-role access or fabricated answer |
| AI Gateway timeout | stop request cleanly; allow retry | endless spinner/retry loop |
| AI budget blocked | Agent unavailable | switching to an unapproved paid provider automatically |
| AI rate limited | bounded retry guidance | rapid automatic retries |
| Supabase auth invalid/expired | authentication required | trusting claimed identity from chat |
| BCT RPC denied by RLS | access denied / no authorized data | broader RPC or Admin access |
| Live tool returns no data | say live status could not be confirmed | infer a project/payment status |
| Tool returns malformed data | fail closed and log metadata | pass raw malformed object to user/model |
| Model asks for a tool during Phase A | reject generation as unexpected tool call | execute it |
| Estimator live request before backend reconciliation | explain general policy only | invent estimator assignment/status |
| Escalation write unavailable | prepare/explain handoff | claim a case was created |
| Audit persistence unavailable in preview | retain safe structured preview logging | log prompts/tokens/secrets |
| Voice layer fails later | text fallback | block portal navigation |

## Retry policy

Retries must be deliberate and bounded. Never retry an authorization denial. Never convert a failure into broader privileges. High-impact writes, when eventually enabled, require idempotency so a retry cannot duplicate a case/payment/contract action.
