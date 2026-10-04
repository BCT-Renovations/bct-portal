# Agent BCT Mobile / iPhone Test Matrix

Status: prepared for execution after exact READY preview and Phase A/Phase B backend gates.

## Public entry
- Ask Agent BCT opens without altering existing landing-page layout.
- Existing language selector, logo, sign-in/sign-up and all portal buttons remain functional.
- Agent failure never blocks portal selection or normal navigation.

## Authenticated entry
- Homeowner, contractor and Admin use the existing authenticated session.
- No Agent-specific bearer token persistence.
- Logout immediately clears authenticated Agent transcript/state.
- Account switch cannot display the prior account's live project information.
- Estimator live entry remains unavailable until backend reconciliation.

## iPhone layout
Test portrait and landscape on supported iPhone viewport sizes:
- no horizontal overflow;
- safe-area respected at top and bottom;
- close/back control always reachable;
- composer visible above software keyboard;
- textarea grows only to its cap;
- transcript owns its scrolling and does not cause page-wide runaway scrolling;
- opening/closing Agent does not change existing portal scroll position unexpectedly;
- loading/error overlays do not block portal navigation;
- tap targets remain usable at text zoom.

## Conversation behavior
- duplicate send prevented while identical request is in flight;
- failed request preserves draft;
- response announcement does not reread entire transcript;
- long Agent response remains bounded and scrollable;
- rate-limit/auth/service-unavailable states are understandable and recoverable;
- internal model/tool/error details never appear in normal UI.

## Trust/provenance
Render only backend-derived states:
- BCT general guidance;
- Confirmed from your BCT project;
- BCT review required;
- live status unavailable.

Never infer confirmation from model wording.

## Languages/accessibility
For en, ar, zh, fr, ht, pt, ru, es, vi:
- language preference is inherited;
- controls remain readable;
- long translations do not overflow;
- Arabic uses RTL layout while numbers/IDs remain legible;
- focus order and screen-reader labels remain meaningful;
- reduced motion respected.

## Failure matrix
- Agent API offline -> portal usable;
- model timeout -> text error state, portal usable;
- authentication expires -> sign-in required, no stale live data;
- network loss -> draft preserved;
- microphone denied -> irrelevant to initial text release; no microphone request occurs;
- voice flag OFF -> no voice controls or microphone permission request.

A screenshot alone is not a pass. Execute interactions on the exact READY candidate.
