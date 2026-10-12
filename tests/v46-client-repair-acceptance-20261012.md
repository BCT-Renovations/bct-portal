# V46 client repair acceptance gates

Source: owner review October 12, 2026, issue #33. Production must remain unchanged until verified.

- [ ] About is a standalone, explicitly opened informational view; never appears automatically, does not expose the intake form underneath, and Back restores previous portal and unsaved form state.
- [ ] About entry is visible above new-client signup; returning sign-in remains prominent.
- [ ] Client/homeowner/renter About copy differs from contractor and estimator copy, with all supported language translations.
- [ ] No raw `homeowner.about_button` or `homeowner.about_close` strings appear in any language.
- [ ] Estimate & Contract navigation opens the estimate/contract section, not intake top.
- [ ] Project Overview routes unauthenticated visitors to a dedicated sign-in screen only; signed-in clients go straight to their own project dashboard without another sign-in.
- [ ] No unrelated signup/About content on returning-client sign-in.
- [ ] Project-locked tabs provide a clear translated explanation instead of silently failing.
- [ ] Verify iPhone navigation, translations, authenticated access, project ownership, no form data loss, and unchanged branding.

Current implementation investigation: `index.html` has an inline `V46 CLIENT ABOUT ACCESS PATCH` that inserts `#bctClientAboutPanel` after the portal tabs and uses `scrollIntoView`; that design is the cause of the reported About inline-scroll behavior. A separate About route/view must replace that behavior, not simply rename the button.
