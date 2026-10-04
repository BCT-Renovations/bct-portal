# Agent BCT Escalation Wrapper Test Contract

No write wrapper is activated yet. These are mandatory tests for the future wrapper before model access.

## Authentication/authorization
- unauthenticated caller -> denied;
- actor identity is derived from auth, never request body;
- project outside caller access -> denied;
- job not belonging to project -> denied;
- knowing project/job UUID alone -> no access.

## Input
- only mapped existing BCT case_type/category/severity values reach the case backend;
- empty subject/description -> denied;
- subject/description hard length caps;
- control characters/hidden prompt text do not become authority;
- conversational Agent categories map deterministically to existing schema enums.

## Confirmation/idempotency
- ordinary escalation requires explicit confirmation;
- repeated identical confirmed request in the idempotency window returns existing safe receipt or duplicate result, not a second case;
- retry after network uncertainty does not create duplicate cases;
- different project/category may create a distinct case when authorized.

## Safety/authority
- emergency language gets emergency guidance; opening a BCT case is not represented as emergency response;
- case creation never promises refund, price, assignment, schedule change, dispute result or response time;
- model cannot select internal-only case message behavior;
- no Admin-only note creation from homeowner/contractor.

## Output
Safe receipt only: case number/id as appropriate, project reference, mapped category/type, severity/status, created timestamp. No hidden prompt, raw auth, internal notes or unrelated case fields.

## Audit
Successful and denied writes produce safe Agent audit metadata once durable audit integration is available. Audit actor cannot be forged and raw subject/description are not copied into audit details.
