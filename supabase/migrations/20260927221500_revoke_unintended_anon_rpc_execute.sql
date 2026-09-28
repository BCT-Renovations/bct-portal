-- V46 security hardening: private/authenticated workflow RPCs must not inherit EXECUTE from PUBLIC.
-- Intentionally public bootstrap/catalog RPCs are not changed here.
revoke execute on function public.bct_add_case_message(uuid,text,boolean) from public, anon;
revoke execute on function public.bct_admin_hoa_state(uuid) from public, anon;
revoke execute on function public.bct_admin_log_hoa_communication(uuid,text,text,text,text,text) from public, anon;
revoke execute on function public.bct_contractor_contract_signatures() from public, anon;
revoke execute on function public.bct_contractor_esign_contract(uuid,text,boolean) from public, anon;
revoke execute on function public.bct_contractor_owns_contract(uuid) from public, anon;
revoke execute on function public.bct_contractor_workforce_eligible(uuid) from public, anon;
revoke execute on function public.bct_hoa_permission_active(uuid) from public, anon;
revoke execute on function public.bct_homeowner_create_private_share(uuid,text,uuid,text,integer) from public, anon;
revoke execute on function public.bct_homeowner_esign_contract(uuid,text,boolean) from public, anon;
revoke execute on function public.bct_homeowner_grant_hoa_authorization(uuid) from public, anon;
revoke execute on function public.bct_homeowner_revoke_hoa_authorization(uuid) from public, anon;
revoke execute on function public.bct_homeowner_revoke_private_share(uuid) from public, anon;
revoke execute on function public.bct_homeowner_set_hoa_profile(uuid,text,text,text) from public, anon;
revoke execute on function public.bct_my_cases() from public, anon;
revoke execute on function public.bct_my_contract_signatures() from public, anon;
revoke execute on function public.bct_my_permissions() from public, anon;
revoke execute on function public.bct_open_case(uuid,uuid,text,text,text,text,text) from public, anon;
revoke execute on function public.bct_submit_completion_rating(uuid,integer,text) from public, anon;