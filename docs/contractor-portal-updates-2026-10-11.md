# BCT Contractor Portal — Approved Changes (2026-10-11)

Scope: Contractor landing/sign-in/sign-up page only. Preserve existing V46 application behavior and production.

## Page order
1. Existing Contractor Sign In at top: email, password, Sign In, Forgot Password.
2. New Contractor Sign Up directly below sign-in, with prominent Sign Up Now action.
3. Why Join BCT Contractors Network? below sign-up; preserve BCT's general-contractor-controlled assignment and private bid model.
4. Matching Sign Up Now action near bottom, pointing to the same registration flow.
5. Back to Home at very bottom, compact square/rounded-square teal-green with white lettering.

## Agent BCT
Make floating launcher finger-draggable, small, snap to safe screen edges/corners, avoid blocking content, preserve tap-to-open and existing chat/role behavior. Test on mobile. Remember position when feasible, with accessible keyboard fallback.

## Translation
Use existing localization infrastructure for all labels, including Back to Home (English), Volver al inicio (Spanish), and Agent BCT launcher. No raw keys such as contractor.email, contractor.password, contractor.signin_button, contractor.forgot_password, contractor.back_home, contractor.resend_confirmation. Preserve language selection.

## Verification before merge
- Verify sign-in, forgot password, new application, both registration CTAs, and Back to Home navigation.
- Verify English/Spanish, mobile safe-area/header spacing, draggable Agent BCT without blocking forms, and tap-to-open.
- Ensure no changes to homeowner/admin/estimator/handyman behavior, permissions, database, or production.
- No deployment or merge to Live without review.

Status: specification committed to isolated branch; implementation and tests not yet complete.
