# Agent BCT V46 Regression Contract

Agent BCT integration is additive. Existing V46 behavior must remain functional even if Agent BCT is unavailable.

## Public/opening screen

Verify unchanged:
- official BCT logo/header treatment;
- language selector;
- Sign In / Sign Up;
- Homeowner/Client, Contractor and Admin portal entry;
- Share App/referral area;
- Licensed • Bonded • Insured section;
- no unexplained blank area or runaway page scroll.

## Authentication

Verify unchanged:
- homeowner returning/new user paths;
- contractor returning/application paths;
- Admin sign-in;
- forgot-password flow;
- password rules;
- logout;
- role-specific portal state.

## Homeowner

Verify:
- project submission;
- duplicate prevention/submitted lockout;
- multi-file upload;
- project status/dashboard;
- estimates remain BCT-review controlled;
- contracts/signatures;
- messages/notifications;
- financing/escrow visibility;
- completion/sign-off.

## Contractor

Verify:
- application;
- documents/references;
- approval state;
- bidding confidentiality;
- bid submission/update/withdraw where existing;
- assignments;
- job/project messages;
- no competing bid visibility.

## Admin

Verify:
- Admin portal button/navigation;
- applicant/project review;
- AI estimate remains DRAFT/PENDING BCT REVIEW;
- estimate edit/markup/approval;
- bidding/assignment;
- contracts/change orders/approvals;
- financing/escrow/payment controls;
- notifications/messages;
- audit/reporting;
- status indicators;
- no auto-scroll regression.

## Translation

Verify all existing BCT languages still switch existing UI correctly. Agent must inherit the language system rather than altering it.

## Agent isolation

With Agent feature disabled/unavailable:
- normal V46 routes load;
- no Agent overlay blocks navigation;
- no Agent API failure prevents portal actions;
- no Agent environment variable is required for normal V46;
- no production database permission is broadened solely for Agent.

## Release evidence

Run on the exact candidate SHA. Record pass/fail and defects. Any material V46 regression blocks production integration.
