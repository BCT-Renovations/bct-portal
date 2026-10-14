# TAKAI Insurance: verified schema compatibility gate (2026-10-14)

## Read-only production findings
Supabase project `onpqykpikxbbypfvmtin` is the sole currently connected project; it has no development branch.
- Existing `public.bct_insurance_claims`: 0 rows; columns include `claim_status`, `carrier`, `claim_number`, `project_id`; it lacks parked portal columns `status`, `organization_id`, `submitted_by`, `policyholder_name`, `property_address`, `loss_type`.
- Existing `public.bct_insurance_policies`: 0 rows; belongs to contractor insurance credential verification, not claims partner intake.
- Missing `public.bct_insurance_organizations` and `public.bct_insurance_members`.
- No parked insurance claims partner RPCs present; existing insurance RPCs concern contractor policy verification.
- The parked foundation migration uses `CREATE TABLE IF NOT EXISTS public.bct_insurance_claims` followed by indexes on `organization_id`. Since the table already exists with incompatible columns, **running it unchanged would fail** and could leave a partially applied migration if not transactional.

## Required safe integration design
1. Keep existing `bct_insurance_claims` and `bct_insurance_policies` unchanged. Do not rename, drop, truncate, or repurpose either.
2. Introduce a **separate** claims-partner table name, e.g. `bct_partner_claims`, and separate organizations/members/events; rewrite parked RPCs and portal/admin queries consistently before any migration.
3. Verify references, policies, permissions, unique claim numbers scoped to organization, and one-to-one project linkage; prevent direct browser project creation and cross-carrier reads.
4. Use a new development database project/branch after cost approval. No production DDL or data writes.
5. Test complete schema migrations, security roles, claim intake, Admin decisions, and existing TAKAI regression gates before activating a preview.

## Status
Read-only discovery completed. No database changes or deployments. This is a blocking incompatibility, not a green gate.
