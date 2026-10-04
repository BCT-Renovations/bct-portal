# Agent BCT Mobile UI Contract

Implementation begins only after preview generation/security gates pass. This prevents UI work from hiding backend defects.

## Entry points

- Public landing: “Ask Agent BCT” for public BCT/process questions.
- Authenticated portals: Agent BCT opens with the existing signed-in session and role.
- Admin may receive a separate management/escalation view later; no unrestricted Admin chat tools initially.

## iPhone-first behavior

- no horizontal overflow
- respect safe-area insets
- composer remains visible above iOS keyboard
- transcript scroll is user-controlled; no page-wide runaway auto-scroll
- new response scrolls within Agent panel only when user is already near the bottom
- large tap targets
- visible close/back control
- no overlay that blocks existing portal navigation
- textarea grows to a capped height, then scrolls internally
- loading state never disables portal navigation
- Agent failure never blocks normal portal use

## Message states

- sending
- answered
- needs BCT review
- live status unavailable
- authentication required
- rate limited
- service temporarily unavailable

Do not expose internal error codes, model names, tokens or tool traces to normal users.

## Trust cues

When appropriate:
- “Confirmed from your BCT project” for authorized live data
- “BCT general guidance” for approved general knowledge
- “BCT review required” for human-authority decisions

Never use a badge that implies Admin approval unless the backend confirms that approval.

## Composer protections

- bounded input
- no file upload in initial Agent release
- no arbitrary URL ingestion in initial Agent release
- Enter/Send behavior must work on mobile
- preserve draft if a network request fails
- prevent accidental duplicate sends while one identical request is in flight

## Accessibility

- semantic dialog/region labeling
- keyboard/focus management
- screen-reader message announcements without rereading entire transcript
- sufficient contrast
- RTL layout for Arabic
- language inherited from existing BCT preference
- reduced-motion friendly

## Session/privacy

- do not persist bearer tokens in Agent-specific storage
- use existing Supabase session mechanism
- logout closes/clears authenticated Agent conversation state
- switching accounts clears prior authenticated transcript from active UI
- do not display another role/user's cached live response

## Initial release exclusions

- voice
- live video/screen sharing
- file ingestion
- autonomous writes
- contractor bid visibility
- estimator live status until backend reconciliation
- long-running background agent jobs

These can be evaluated after the core secure text Agent is stable.
