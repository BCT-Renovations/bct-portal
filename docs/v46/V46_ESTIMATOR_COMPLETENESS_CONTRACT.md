# V46 Estimator Portal Completeness Contract

Development-branch integration contract. Production remains unchanged until separately approved.

## Existing estimator architecture reused
- bct_estimator_applications
- bct_estimator_profiles
- bct_site_assessments
- bct_submit_assessment_package
- bct_complete_site_assessment
- estimator/bid conflict guard
- estimator/performing-contractor assignment guard

No parallel estimator or site-assessment system is permitted.

## Field package required before submission
The assigned estimator must have a paid assessment and complete the scheduled site visit. Submission must include:
- site visit complete
- photos complete
- measurements complete
- documentation complete
- observed conditions complete
- homeowner-supplied materials review complete
- access/safety information complete
- assessment notes complete
- nonempty measurements, conditions, and notes in the assessment package

The estimator cannot self-assign, alter the homeowner fee, alter payment state, approve BCT review, change travel compensation, or skip workflow states.

## BCT acceptance and payment
Estimator compensation is assignment-based, not hourly and not a percentage of project value. Payment eligibility requires the complete assessment package and BCT acceptance. Extra travel compensation requires advance BCT approval.

## Separation of duties
The estimator who assesses a project cannot:
- bid on that project
- discover that project as an available contractor job
- become the performing contractor for that project

These restrictions are server-side guards, not UI-only rules.

## Portal behavior
The Estimator Portal should present completeness as one assessment checklist tied to the existing assessment record. Missing required items remain visibly incomplete. Submit Assessment stays unavailable until all required items are complete. BCT review status is read-only to the estimator.

Urgent estimator issues route into the existing JOBS/Admin attention workflow; do not create a separate fourth Admin front.

## Release gates
Before production application:
1. Run estimator regression checks against the full migration chain.
2. Validate migration SQL in a non-production database/preview.
3. Verify assigned-estimator read access and unauthorized cross-estimator denial.
4. Verify incomplete packages cannot submit.
5. Verify unpaid assessments cannot start field completion/submission.
6. Verify estimator cannot bid on or be assigned to the same project as performing contractor.
7. Verify BCT acceptance is required for payment eligibility.
8. Verify no private homeowner access data is exposed beyond what the assigned estimator needs.
9. Apply to production only after explicit approval.
