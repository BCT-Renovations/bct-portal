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

## Candidate isolated deployments (references, NOT accepted as integrated)
- 2026-10-12 13:46 EDT: 8427dbf6 contractor role headings.
- 2026-10-12 13:48 EDT: 4d665ca9 Agent BCT header.
- 2026-10-12 15:40 EDT: 7e91bf8e signed-out iPhone layout (user rejected this as integrated preview).

Do not claim complete until actual source integration, build, smoke tests, and Safari preview verification succeed.