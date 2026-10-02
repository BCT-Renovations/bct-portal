-- BCT Insurance Portal per-claim access hardening.
-- Organization admins may see organization claims; adjusters/reps see only assigned/submitted claims.

create or replace function public.bct_insurance_org_admin_of(p_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.bct_insurance_members m
 where m.organization_id=p_org and m.user_id=auth.uid() and m.status='active' and m.member_role='organization_admin');
$$;
revoke all on function public.bct_insurance_org_admin_of(uuid) from public,anon;
grant execute on function public.bct_insurance_org_admin_of(uuid) to authenticated;

create or replace function public.bct_insurance_can_read_claim(p_claim uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(
  select 1 from public.bct_insurance_claims c
  where c.id=p_claim and (
   public.is_bct_admin()
   or public.bct_insurance_org_admin_of(c.organization_id)
   or (public.bct_insurance_member_of(c.organization_id)
       and (c.assigned_adjuster_user_id=auth.uid() or c.submitted_by=auth.uid()))
  )
 );
$$;
revoke all on function public.bct_insurance_can_read_claim(uuid) from public,anon;
grant execute on function public.bct_insurance_can_read_claim(uuid) to authenticated;

drop policy if exists "insurance_claim_member_read" on public.bct_insurance_claims;
create policy "insurance_claim_authorized_read" on public.bct_insurance_claims
for select to authenticated using (
 public.is_bct_admin()
 or public.bct_insurance_org_admin_of(organization_id)
 or (public.bct_insurance_member_of(organization_id)
     and (assigned_adjuster_user_id=auth.uid() or submitted_by=auth.uid()))
);

drop policy if exists "insurance claim event authorized read" on public.bct_insurance_claim_events;
create policy "insurance claim event authorized read" on public.bct_insurance_claim_events
for select to authenticated using (
 public.is_bct_admin() or (
  visibility='insurance_and_bct' and public.bct_insurance_can_read_claim(claim_id)
 )
);

comment on function public.bct_insurance_can_read_claim(uuid) is
'Per-claim insurance authorization boundary: BCT Admin, carrier organization admin, or assigned/submitting authorized member only.';
