# Takai portal translation verification — October 15, 2026

Branch: `fix/takai-translation-audit-20261015`.
Base: `a6f51f0` (preserves `9f4832a` gallery translations and subsequent saved homeowner work).

## Corrections

- Shared local lookup for keyed labels, static copy, placeholders, option labels, accessibility text, and CSS profession titles.
- Missing English source keys registered before translation. Available local copy is rendered immediately and is not overwritten by remote fallback.
- Added eight translated catalogs covering client signup, landlord/renter intake, contractor application and screening, estimator application and assessment, and password instructions/validation.
- Profession-specific labels and application text generated in the selected language.
- Dynamic text updates translated; English originals retained for repeated language changes. Observer disconnects while applying its own writes.
- Estimator exit clears its entry-state class, allowing subsequent portal navigation.
- Saved gallery captions/overlays preserved unchanged; gallery script URL refreshed to load those saved translations.
- CI browser checks now exercise the current checkout locally rather than an obsolete preview URL.

## Verification

`tests/takai-portal-languages-browser.mjs`: **248 checks passed** in Chromium at 390 × 844, with remote requests blocked.

Languages: English, Spanish, French, Haitian Creole, Portuguese, Vietnamese, Chinese, Arabic, Russian. Repeat sequence also exercises Spanish → Arabic → English.

Coverage: local-copy completeness across client, contractor entry/application, estimator, password request/reset; actual landing language selection; client signup and password validation states; empty client/estimator login validation; contractor role selection; estimator application/assignment/assessment/account navigation; gallery captions; profession title attributes; restoration to English and Arabic RTL.

Other checks passed: 39 translation source regressions; 4 Agent BCT language tests; gallery image-text integration test; syntax checks including all 28 inline scripts; `git diff --check`.

## Deferred / limitations

- No sign-in with real accounts, Supabase/admin restricted tests, or mutations. Deferred until October 31 as instructed.
- A pre-existing signed-out page error, `runAi is not defined`, originates in `agent-bct-photo-recommendation.js` admin initialization. The browser test explicitly reports it and permits only that known baseline error; any additional error fails the suite. It was not changed or represented as verified admin behavior.
- Chromium mobile viewport testing is not native iPhone Safari verification.
- Local UI checks do not prove translation of backend-returned private project content or authentication provider errors.
- New deployment and exact-commit verification are separate from local checks. No old preview is considered a verified result.

Live production, Takai/THEO safe points, billing, and database configuration were not changed.
