# Agent BCT Voice Cost Controls

Status: design-only. This document sets cost safety rules; it does not select a vendor or state a current per-minute price.

## Rules
- Voice is OFF by default and requires an explicit server-side feature flag.
- Text Agent remains available when voice budget is unavailable.
- No silent provider fallback that changes price, privacy, model, language behavior or retention.
- Set a per-session duration ceiling and idle timeout before activation.
- Set account-level daily and monthly voice budget ceilings before activation.
- Stop new voice sessions cleanly when a configured budget ceiling is reached; do not terminate an active safety-critical handoff without giving the user a text/human path.
- Bound transcription input, spoken output and Agent response size.
- Do not keep the microphone/session alive while the user is inactive.
- Record usage metadata needed for cost accounting without storing raw audio by default.
- Admin cost reporting should aggregate usage; ordinary users do not see internal provider/model/token details.
- Rate-limit repeated reconnect/session creation attempts.

## Pricing verification gate
Immediately before implementation, verify current official pricing for the selected realtime/speech stack and document:
1. input audio pricing;
2. output audio pricing;
3. transcription pricing if separate;
4. text/model charges if separate;
5. cached-input behavior if applicable;
6. minimum billing units;
7. regional or retention implications;
8. projected low/normal/high BCT monthly usage.

No historical estimate is a release assumption. Cost ceilings must be derived from then-current official pricing and Ty's approved operating budget.

## Fail-safe behavior
Budget exceeded -> voice unavailable with text fallback.
Provider unavailable -> text fallback.
Unknown usage/cost telemetry -> do not expand voice rollout.
Unexpected cost spike -> disable voice flag without affecting normal BCT portal operation.
