# Takai translation regression checklist (2026-10-15)

This checklist is for the isolated branch `fix/takai-translation-audit-20261015`. Do not change the Takai safe point or production.

## Scope
- Entry / public homepage, About BCT, gallery, share app, language selector
- Client, contractor, drywaller and other trade-specific pre-application/sign-in, estimator, admin, Agent BCT
- All Back and Back to Home controls, titles, labels, tabs, navigation, profession choices, form fields, dropdown options, placeholders, upload widgets, error messages, confirmation messages and accessibility labels
- All supported languages, including Chinese; switch language on each screen and navigate away and back
- Verify sign-in, signup, submission, portal navigation, Back behavior, and layout at mobile widths

## Known defect and first fix
`applyCommonPortalLanguage` previously assigned `textContent` to containers that could have nested elements, destroying buttons, icons, or form controls. This branch now skips elements with child elements and descendants of `data-i18n` nodes.

## Required verification before calling complete
- Audit every rendered and dynamically created UI string for missing translation keys and fallback English
- Verify language switching does not revert parts of a page or leave mixed-language labels
- Verify static and dynamic translation routines do not overwrite each other's work
- Run syntax, smoke, and portal navigation tests; record results
- Deploy an isolated preview and manually check screenshots in every supported language
- Never merge or deploy to Live without separate approval

**Status:** Work in progress. This checklist is not a test-pass report.
