-- V46 field controls batch 4: estimator completeness + insurance intake completeness.
-- DEVELOPMENT BRANCH ONLY. Do not apply to production without explicit approval.
-- Reuses existing bct_site_assessments and bct_insurance_claims; no duplicate portal/system.

-- Estimator package completeness: preserve the existing estimator system and add only missing required dimensions.
alter table public.bct_site_assessments
  add column if not exists observed_conditions_complete boolean not null default false,
  add column if not exists homeowner_materials_review_complete boolean not null default false,
  add column if not exists access_safety_complete boolean not null default false,
  add column if not exists assessment_notes_complete boolean not null default false;

create or replace function public.bct_submit_assessment_package(
  p_project_id uuid,p_package jsonb,p_site_visit_complete boolean,p_photos_complete boolean,
  p_measurements_complete boolean,p_documentation_complete boolean
) returns void
language plpgsql security definer set search_path=public,auth,pg_temp
as $bct$
declare a public.bct_site_assessments;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into a from public.bct_site_assessments where project_id=p_project_id for update;
  if a.id is null or a.estimator_user_id is distinct from auth.uid() then raise exception 'Assessment assignment not authorized'; end if;
  if a.status <> 'site_assessment_completed' then raise exception 'Site assessment must be marked completed before package submission'; end if;
  if a.fee_paid_at is null then raise exception 'Assessment fee payment is required'; end if;
  if not (p_site_visit_complete and p_photos_complete and p_measurements_complete and p_documentation_complete)
     or not (a.observed_conditions_complete and a.homeowner_materials_review_complete
             and a.access_safety_complete and a.assessment_notes_complete) then
    raise exception 'Complete assessment package requires visit, photos, measurements, observed conditions, homeowner materials review, access/safety information, documentation and notes';
  end if;
  if jsonb_typeof(coalesce(p_package,'{}'::jsonb)) <> 'object' then raise exception 'Assessment package must be an object'; end if;
  if coalesce(nullif(btrim(p_package->>'measurements'),''),'')='' then raise exception 'Required measurements are missing'; end if;
  if coalesce(nullif(btrim(p_package->>'conditions'),''),'')='' then raise exception 'Observed conditions are missing'; end if;
  if coalesce(nullif(btrim(p_package->>'notes'),''),'')='' then raise exception 'Assessment notes are missing'; end if;

  update public.bct_site_assessments set
    status='assessment_submitted',
    site_visit_complete=p_site_visit_complete,
    photos_complete=p_photos_complete,
    measurements_complete=p_measurements_complete,
    documentation_complete=p_documentation_complete,
    assessment_package=coalesce(p_package,'{}'::jsonb),
    assessment_completed_at=coalesce(assessment_completed_at,now()),
    updated_at=now()
  where id=a.id;
end $bct$;

revoke all on function public.bct_submit_assessment_package(uuid,jsonb,boolean,boolean,boolean,boolean) from public,anon,authenticated;
grant execute on function public.bct_submit_assessment_package(uuid,jsonb,boolean,boolean,boolean,boolean) to authenticated;

-- Insurance / Claims Partner intake intentionally omitted here.
-- External partner claims use public.bct_insurance_partner_claims and its dedicated
-- access/lifecycle migrations. Legacy public.bct_insurance_claims remains untouched.
