# Ace of Spades V46 — isolated integration gates (2026-10-12)

BASELINE: production alias bct-portal.vercel.app points to deployment dpl_5VM346tcyn7ftPbNSYYBFDKoaVtS, commit 16618e84. Preserve this live baseline. Never promote isolated work without explicit approval.

SOURCE AUDIT: feature/v46-handyman-combined-latest and fix/v46-ios-home-layout-20261012 diverge from baseline (5 commits ahead, 134 behind); feature/contractor-portal-layout-20261011 diverges (1 ahead, 48 behind). Do NOT merge entire branches or overwrite index.html, PWA assets, manifest, service worker, or logo. Port narrowly reviewed changes and test each.

## Required acceptance gates — ALL must pass on one isolated preview
- [ ] Agent BCT mobile header: X, Back to Home, title don't overlap.
- [ ] Four compact role choices: Electrician, Plumber, Contractor, Handyman, on one row where usable; no horizontal overflow on iPhone.
- [ ] Role headings larger, bold, gray; descriptions smaller; translation preserves title markup.
- [ ] Returning contractor sign-in first: email, password, Sign In, Forgot Password.
- [ ] New contractor application separated from returning sign-in.
- [ ] During new application, Status & Documents and Authorized Jobs hidden; no auth or permissions regression.
- [ ] Contractor Back to Home works; browser back works.
- [ ] Homeowner Estimate & Contract action and navigation work.
- [ ] No/Renter property-owner selection opens landlord approval intake; submission held until approved.
- [ ] All portal labels translate and survive language switching; no raw keys.
- [ ] iPhone viewport no overlaps, duplicate click handlers, or broken navigation.
- [ ] Approved live logo retained; no duplicate slogan; About BCT button correct.
- [ ] Existing iPhone icon, install path, manifest, and service worker remain stable.
- [ ] Regression smoke checks and role/permission boundaries pass.
- [ ] Single sign-in/session continuity: once signed in, users can navigate their permitted dashboard/portal/Agent BCT areas without repeated login prompts; role boundaries, session expiration, and sign-out must remain secure.

## Current branch status
- Branch: feature/ace-of-spades-v46-isolated-from-live-20261012
- Live baseline: 16618e84
- Current isolated head before this doc update: 005f9fe56ed6b59b8a75a0fd76b92545fee302a6
- Confirmed branch is ahead of live baseline only; live remains untouched.
- Completed code changes so far are limited to Agent BCT CSS/header cache refresh, compact four-card contractor role layout, and gray/larger role-title styling. Remaining must-haves still require narrow integration and testing.

## Candidate isolated deployments (references, NOT accepted as integrated)
- 2026-10-12 13:46 EDT: 8427dbf6 contractor role headings.
- 2026-10-12 13:48 EDT: 4d665ca9 Agent BCT header.
- 2026-10-12 15:40 EDT: 7e91bf8e signed-out iPhone layout (user rejected this as integrated preview).

## Operating rules for continuation
- Continue from the existing isolated branch and latest head; do not restart.
- Do not merge incompatible branches wholesale.
- Do not revisit completed fixes unless testing proves a problem.
- Integrate missing requirements narrowly against the current live foundation.
- Do not deploy or promote to live without explicit owner approval.
- Do not claim complete until actual source integration, build, smoke tests, and Safari preview verification succeed.
