-- Enforce one-to-one insurance-claim to BCT-project linkage at the database layer.
-- The Admin RPC also checks this relationship; this index closes concurrent-link race conditions.
create unique index if not exists bct_insurance_claims_project_unique
  on public.bct_insurance_partner_claims(project_id)
  where project_id is not null;
