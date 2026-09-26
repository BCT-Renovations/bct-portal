-- Preserve contract signature evidence permanently once captured.
create or replace function public.bct_prevent_contract_signature_mutation()
returns trigger language plpgsql security invoker set search_path=public,auth as $$
begin
 raise exception 'Contract signature evidence is immutable. Create a new contract/version for corrections.';
end $$;
drop trigger if exists bct_contract_signature_immutable on public.bct_contract_signatures;
create trigger bct_contract_signature_immutable before update or delete on public.bct_contract_signatures for each row execute function public.bct_prevent_contract_signature_mutation();
revoke all on function public.bct_prevent_contract_signature_mutation() from public,anon;
grant execute on function public.bct_prevent_contract_signature_mutation() to authenticated;
