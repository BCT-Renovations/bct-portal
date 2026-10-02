# Weather Provider Readiness

Status: manual/admin weather logging remains the only V46 portal workflow currently exposed. Supabase already contains ACTIVE JWT-protected Open-Meteo Edge Functions (`bct-weather` and `bct-weather-refresh`), but the current V46 `index.html` does not call either function and still explicitly tells Admin that automatic weather-provider pulls are not enabled.

## Current Live Behavior

- Admins can record observed or forecast weather impact in the Job Health dashboard.
- The portal labels this section `Manual Weather Log`.
- The portal states: `Automatic weather-provider pulls are not enabled yet.`
- Current V46 source contains no `bct-weather` or `bct-weather-refresh` invocation.
- Therefore, the presence of active weather Edge Functions must not be interpreted as automatic weather being enabled in the portal.

## Existing Provider Foundation

- `bct-weather` is ACTIVE, requires JWT, resolves a signed-in user's accessible BCT project through `bct_lookup_my_record_by_number`, and returns Open-Meteo weather without writing a weather record.
- `bct-weather-refresh` is ACTIVE, requires JWT, checks `is_bct_admin()`, validates the project/job relationship, reads Open-Meteo forecast data, and writes through the canonical `bct_admin_record_weather` RPC.
- Neither Edge Function should be exposed from the V46 portal until BCT deliberately approves the automatic-weather product behavior and regression coverage.

## Enablement Gate

Before exposing automatic weather in V46:

1. BCT approves automatic weather as launch scope.
2. Confirm which Edge Function is the canonical portal path.
3. Add explicit UI controls and failure/loading states.
4. Preserve Admin review of job-impact decisions.
5. Add smoke coverage proving non-Admin callers cannot use the Admin refresh path and one customer cannot look up another customer's project.
6. Reverify provider availability and production runtime behavior.

Until those conditions are met, keep the current manual/admin weather workflow active and do not describe weather tracking as automatic.
