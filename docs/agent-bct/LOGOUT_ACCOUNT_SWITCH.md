# Agent BCT Logout and Account-Switch Contract

Agent BCT must treat BCT authentication state as authoritative and must not retain another user's private context after identity changes.

## Required client behavior
On logout, token refresh failure, explicit account switch, or detected authenticated user-id change:
- clear Agent transcript state that contains authenticated live results;
- clear cached role/capability/session response;
- clear pending tool/action confirmations;
- cancel in-flight Agent requests where possible;
- discard live project/money/contract data already returned for the prior identity;
- return Agent UI to public/signed-out state.

## Required server behavior
Every authenticated session/tool/chat request re-evaluates the bearer session as required. No server request accepts a prior client role as authority. Tool authorization is not inherited from an earlier conversation turn.

## Browser history
Back/forward navigation must not rehydrate another user's authenticated Agent data from persistent local storage. Initial implementation should avoid durable localStorage persistence of authenticated transcripts/live results.

## Shared device test
1. User A signs in and opens Agent live project data.
2. User A signs out.
3. User B signs in on same browser.
4. Agent shows no User A transcript/live results.
5. User B cannot retrieve User A data by replaying visible identifiers.
