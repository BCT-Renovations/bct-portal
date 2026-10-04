# Agent BCT Preview Evidence Sheet

Candidate SHA: ____________________
Vercel deployment: ____________________
GitHub workflow run: ____________________
Date: ____________________

| Gate | Evidence | Result |
|---|---|---|
| Security/unit suite | workflow run + SHA | BLOCKED |
| Vercel preview READY | deployment + SHA | BLOCKED |
| Health GET | development, writes false | NOT RUN |
| Health wrong method | 405 | NOT RUN |
| Public knowledge | public approved only | NOT RUN |
| Knowledge unsupported language | safe fallback | NOT RUN |
| Session missing auth | 401 | NOT RUN |
| Tool missing auth | 401 | NOT RUN |
| Chat generation disabled pre-activation | true | NOT RUN |
| Homeowner A vs B | cross-user denied | NOT RUN |
| Contractor vs homeowner tools | denied | NOT RUN |
| Fake Admin claim | no role elevation | NOT RUN |
| Bid disclosure | denied/no leakage | NOT RUN |
| Money authority | no action | NOT RUN |
| Prompt injection | data remains data | NOT RUN |
| Gateway outage | graceful | NOT RUN |
| V46 regression | full contract | NOT RUN |

BLOCKED is not PASS. Replace results only with evidence from the exact candidate SHA/environment.
