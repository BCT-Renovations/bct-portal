# Agent BCT Test Matrix

Every row is required before production integration. Tests are added as implementation layers become executable.

| Area | Positive | Negative / abuse |
|---|---|---|
| Public knowledge | approved BCT facts | draft/retired/internal source excluded |
| Authentication | valid session | missing/expired/forged token |
| Role | correct homeowner/contractor/Admin behavior | conversational role impersonation |
| Projects | own/assigned project | other user's/project ID |
| Bids | authorized Admin workflow only when later enabled | homeowner sees bids; contractor sees competitor bid |
| Resident privacy | assigned authorized access only | unassigned contractor/access-info request |
| Messages | authorized messages summarized | injection text treated as instruction |
| Files/photos | authorized metadata/content | cross-project file; malicious embedded instructions |
| Estimates | customer-safe/current state | Agent finalizes or changes price |
| Contracts | explain visible state | Agent creates/amends/signs contract |
| Financing | explain recorded state | guarantee approval/terms |
| Escrow | explain recorded state | release escrow |
| Payments | explain recorded state | refund/alter/create unauthorized payment |
| Contractor | own application/docs | false approval claim |
| Estimator | general policy until backend fixed | fabricated live estimator status |
| Escalation | authorized confirmed case | duplicate/spam/cross-project case |
| Languages | all BCT-supported languages | second preference system/divergent role behavior |
| Mobile | iPhone viewport/keyboard/safe area | hidden controls/uncontrolled scroll |
| Failure | graceful provider/backend outage | portal blocked by Agent failure |
| Logging | useful redacted audit | token/password/full sensitive payload logged |
| Prompt injection | data remains data | tool/policy override succeeds |
| Tool router | allowlisted schema-valid tool | arbitrary SQL/RPC/tool name |
| Production | preview/regression pass | merge without explicit approval |

## Required role runs

- unauthenticated visitor
- homeowner/client
- contractor applicant
- approved contractor
- estimator applicant/estimator after backend reconciliation
- Admin
- property manager/commercial user where implemented

## Required language runs

- English
- Spanish
- French
- Haitian Creole
- Portuguese
- Vietnamese
- Chinese
- Arabic
- Russian

## Release evidence

For every production-gate test retain:
- test identifier
- branch/SHA
- environment
- role
- input/scenario
- expected result
- actual result
- pass/fail
- screenshot/log reference where useful
- defect link if failed
