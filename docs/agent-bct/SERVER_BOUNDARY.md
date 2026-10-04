# Agent BCT Server Boundary

Decision date: 2026-10-01

## Existing hosting shape

The current repository is a static/mobile-first V46 application with `index.html`, modular browser JavaScript and `vercel.json`. It has no `package.json` and no framework project structure.

Current Vercel documentation confirms non-framework projects can add server-side functions in the repository `/api` directory. Therefore Agent BCT does not require rewriting V46 into Next.js or another framework.

## Chosen boundary

Use a dedicated Vercel Function under `/api/agent-bct/` as the server-side trust boundary.

Browser:
- displays Agent UI;
- supplies the current Supabase access token to the Agent endpoint;
- never receives AI provider secret or Supabase service-role/secret key;
- never chooses arbitrary backend RPC names.

Server:
- validates request shape and limits;
- validates/authenticates the supplied Supabase session;
- maps requests to a fixed Agent tool registry;
- calls only reviewed BCT backend surfaces;
- invokes the AI provider through a server-only credential;
- applies BCT system/role/tool policy;
- returns minimized responses;
- emits redacted audit metadata.

## Dependency rule

Do not add an AI SDK/provider dependency merely to start the boundary. The repository currently has no package manager manifest. First implement and verify a minimal dependency-free health/request/auth shell using platform Web APIs. Add an AI SDK/provider only after the server boundary, environment contract and tool schemas are proven and the current package/provider documentation has been verified.

## Endpoint sequence

1. `GET /api/agent-bct/health` — no secrets; reports service build/readiness only.
2. `POST /api/agent-bct/session` — authenticated session/permission resolution, no AI generation.
3. `POST /api/agent-bct/chat` — added only after knowledge/tool router is ready.
4. Write/action endpoints are not separate generic APIs; future actions pass through explicit allowlisted tool handlers with confirmation/approval policy.

## Environment contract

Names are placeholders until hosting/project linkage is positively verified:
- public Supabase URL may be shared with browser/server
- public/publishable Supabase key may be shared as intended by Supabase
- AI provider/Gateway credential is server-only
- service-role/secret key is not required for Phase 1 user-scoped reads and must not be introduced casually
- production environment variables are not changed from the Agent branch without explicit deployment approval

## Failure contract

- missing/invalid auth -> 401
- authenticated but unauthorized -> 403
- invalid input -> 400
- unsupported method -> 405
- oversized request -> 413
- dependency/provider unavailable -> 503
- unexpected server error -> 500 with correlation ID, no secret/internal stack in client response
- normal BCT portal remains usable regardless of Agent status
