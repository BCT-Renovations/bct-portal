# TAKAI insurance session and request regression batch

Base: `c40daee58a2b2b461fa06133892863d382e61735` on the existing isolated insurance branch.

Changes:
- Invalidate pending partner reads when the selected company or authenticated session changes.
- Prevent older refresh responses from replacing newer claims.
- Clear claim history, message text, and organization selection when the session changes.
- Bind history and communications to their starting claim and session; ignore obsolete results.
- Serialize sign-in and communication writes, and all Admin write controls.
- Clear Admin claim data on authentication events and reject stale Admin query results and notifications.
- Handle sign-in and Admin request failures without leaving the controls locked.

Verified locally:
- Four insurance static suites and both changed JavaScript syntax checks.
- All 14 staged migrations, reapplication, and 65 disposable PostgreSQL assertions.
- Mocked Chromium browser regression, including delayed company responses, duplicate communications, partner session cleanup, and delayed Admin responses after sign-out.
- Existing Admin job pages, Admin section navigation, and current PWA cold-launch source regression.

No database migration changes, production writes, insurance activation, or Live deployment. Operational modules remain dormant. Real Supabase Auth/RLS/REST and phone/Safari testing remain pending. The older source-integrity suite's obsolete caching expectations have not been changed; the current cold-launch test validates the intended unregister behavior.

Completion estimates remain Database 85%, Security 85%, Insurance Portal 75%, Admin 80%, Testing 80%. Passing additional local tests does not close the hosted verification gates.
