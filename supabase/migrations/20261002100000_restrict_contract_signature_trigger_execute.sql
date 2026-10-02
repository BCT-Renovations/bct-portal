-- Source hardening for contract-signature trigger helpers.
-- Do not apply to production until the protected integration/deployment gate is approved.
-- These functions are trigger-only helpers and must not be browser-callable.

revoke execute on function public.bct_prepare_contract_signature() from public, anon, authenticated;
revoke execute on function public.bct_prevent_contract_signature_mutation() from public, anon, authenticated;
