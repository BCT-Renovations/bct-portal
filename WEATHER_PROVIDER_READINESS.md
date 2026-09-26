# Weather Provider Readiness

Status: manual weather tracking is live; automatic weather-provider pulls are intentionally disabled until BCT chooses and configures a provider.

## Current Live Behavior

- Admins can record observed or forecast weather impact in the Job Health dashboard.
- The app labels this section as `Manual Weather Log`.
- The UI states: `Automatic weather-provider pulls are not enabled yet.`
- No customer-facing workflow should describe current weather tracking as automatic.

## Automatic Weather Structure

The live automatic workflow should be enabled only after these values are configured in the production environment:

| Setting | Required Value |
| --- | --- |
| `BCT_WEATHER_PROVIDER` | The selected production weather provider name |
| `BCT_WEATHER_API_KEY` | The selected provider API key |
| `BCT_WEATHER_ENABLED` | `true` only after provider billing, limits, and failure handling are approved |

Automatic checks should read each active job's public location and scheduled work date, then write weather-impact results into the same admin-reviewed job health/weather workflow used by the manual log.

## Launch Blocker

Owner action required: choose the weather provider and supply the production API key. Until then, keep automatic weather disabled and keep manual/admin weather entries active.
