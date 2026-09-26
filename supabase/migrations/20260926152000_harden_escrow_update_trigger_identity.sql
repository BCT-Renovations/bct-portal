-- Use canonical BCT role/ownership checks in the escrow update trigger.
create or replace function public.bct_guard_escrow_homeowner_update()
returns trigger language plpgsql set search_path=public,auth as $f$
begin
 if current_user not in ('postgres','service_role','supabase_admin') and not public.is_bct_admin() then
   if auth.uid() is null or not public.bct_user_owns_project(old.project_id) then
     raise exception 'Homeowner escrow access required';
   end if;
   if new.id is distinct from old.id
      or new.project_id is distinct from old.project_id
      or new.provider is distinct from old.provider
      or new.external_reference is distinct from old.external_reference
      or new.amount is distinct from old.amount
      or new.status is distinct from old.status
      or new.bct_approved_release is distinct from old.bct_approved_release
      or new.funded_at is distinct from old.funded_at
      or new.released_at is distinct from old.released_at
      or new.notes is distinct from old.notes
      or new.created_at is distinct from old.created_at
   then raise exception 'Homeowner may only change escrow release approval'; end if;
   if old.status not in ('funded','hold','release_pending') then
     raise exception 'Escrow release approval is not available in the current status';
   end if;
 end if;
 return new;
end $f$;
