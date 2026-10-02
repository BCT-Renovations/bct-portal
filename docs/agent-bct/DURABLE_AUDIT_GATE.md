# Agent BCT Durable Audit Migration Gate

No production audit migration is authorized by this document. It defines the conditions required before a future narrow Agent audit RPC may be applied.

## Preconditions
- existing bct_audit_events trigger/hash behavior reverified;
- existing Admin audit visibility preserved;
- no direct authenticated INSERT grant added;
- wrapper actor derives from auth.uid();
- actor AAL derives from authenticated context;
- fixed Agent event/action allowlist;
- request/entity identifiers bounded;
- details JSON constructed server-side from approved scalar metadata only;
- no prompt, completion, bearer token, password, provider credential, raw tool payload or arbitrary user text accepted;
- project/entity references validated against caller access where applicable;
- pinned search_path and least-privilege EXECUTE;
- migration has rollback/revoke plan.

## Mandatory tests
- unauthenticated denied;
- caller cannot forge actor_user_id;
- caller cannot forge Admin role/AAL;
- arbitrary event/action denied;
- secret/free-text metadata denied or redacted;
- cross-project entity reference denied;
- successful event preserves existing audit integrity mechanism;
- no new authenticated direct table INSERT capability;
- existing Admin audit read behavior unchanged.

## Activation
Preview structured logs remain the only Agent audit mechanism until this migration is separately reviewed and intentionally deployed. Agent functionality must not gain broader database authority merely to create audit records.
