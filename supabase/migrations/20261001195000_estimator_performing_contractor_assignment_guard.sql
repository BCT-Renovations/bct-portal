-- Defense-in-depth separation of duties at the performing-contractor assignment boundary.
-- Reuses the existing estimator/project conflict assertion instead of creating a competing rule.

create or replace function public.bct_guard_assignment_estimator_separation()
returns trigger
language plpgsql
security definer
set search_path=public,auth,pg_temp
as $bct$
declare
  v_contractor_user_id uuid;
begin
  select c.auth_user_id
    into v_contractor_user_id
  from public.bct_contractors c
  where c.id = new.contractor_id;

  if v_contractor_user_id is null then
    raise exception 'Contractor account is not linked to an authenticated user';
  end if;

  perform public.bct_assert_no_estimator_project_conflict(new.project_id, v_contractor_user_id);
  return new;
end
$bct$;

revoke all on function public.bct_guard_assignment_estimator_separation() from public,anon,authenticated;

drop trigger if exists bct_assignment_estimator_separation_guard on public.bct_assignments;
create trigger bct_assignment_estimator_separation_guard
before insert or update of contractor_id,project_id on public.bct_assignments
for each row execute function public.bct_guard_assignment_estimator_separation();

comment on function public.bct_guard_assignment_estimator_separation() is
'Internal trigger guard preventing the estimator for a project from becoming that project performing contractor.';
