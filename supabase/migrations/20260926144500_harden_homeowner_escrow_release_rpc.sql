-- Harden legacy homeowner escrow release RPC to match the current ownership/policy boundary.
create or replace function public.bct_set_homeowner_escrow_release(p_escrow_id uuid,p_approved boolean)
returns public.bct_escrow_records language plpgsql set search_path=public,auth,pg_temp as $f$
declare v public.bct_escrow_records;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not public.bct_has_required_policy_acceptance('homeowner') then
  raise exception 'Accept the current BCT homeowner policies before changing escrow release approval';
 end if;
 update public.bct_escrow_records e
 set homeowner_approved_release=coalesce(p_approved,false),updated_at=now()
 where e.id=p_escrow_id and e.status in ('funded','hold','release_pending')
   and public.bct_user_owns_project(e.project_id)
 returning * into v;
 if v.id is null then raise exception 'Eligible escrow record not found or not owned by current homeowner'; end if;
 return v;
end $f$;
revoke all on function public.bct_set_homeowner_escrow_release(uuid,boolean) from public,anon;
grant execute on function public.bct_set_homeowner_escrow_release(uuid,boolean) to authenticated;
