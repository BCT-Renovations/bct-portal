-- V46: targeted indexes for active RLS/foreign-key access paths.
-- Intentionally limited to the HOA/privacy policies verified on 2026-09-30.

create index if not exists bct_hoa_authorizations_homeowner_user_idx
  on public.bct_hoa_authorizations (homeowner_user_id);

create index if not exists bct_privacy_shares_owner_user_idx
  on public.bct_privacy_shares (owner_user_id);

create index if not exists bct_share_access_log_share_idx
  on public.bct_share_access_log (share_id);
