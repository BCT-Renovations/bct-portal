-- BCT Insurance Portal Admin visibility + controlled organization membership management.
drop policy if exists bct_insurance_organizations_read on public.bct_insurance_organizations;
create policy bct_insurance_organizations_read on public.bct_insurance_organizations
for select to authenticated using (
 public.is_bct_admin() or public.bct_insurance_member_of(id)
);

drop policy if exists bct_insurance_members_read on public.bct_insurance_members;
create policy bct_insurance_members_read on public.bct_insurance_members
for select to authenticated using (
 public.is_bct_admin()
 or user_id=auth.uid()
 or public.bct_insurance_org_admin_of(organization_id)
);

create or replace function public.bct_admin_set_insurance_member_status(
 p_organization_id uuid,p_user_id uuid,p_member_role text,p_status text
) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_bct_admin() then raise exception 'BCT admin required' using errcode='42501'; end if;
 if not exists(select 1 from public.bct_insurance_organizations where id=p_organization_id) then raise exception 'Insurance organization not found'; end if;
 if p_member_role not in('organization_admin','adjuster','claims_representative','read_only') then raise exception 'Unsupported insurance member role'; end if;
 if p_status not in('active','suspended','inactive') then raise exception 'Unsupported insurance member status'; end if;
 insert into public.bct_insurance_members(organization_id,user_id,member_role,status)
 values(p_organization_id,p_user_id,p_member_role,p_status)
 on conflict(organization_id,user_id) do update set member_role=excluded.member_role,status=excluded.status,updated_at=now();
end $$;
revoke all on function public.bct_admin_set_insurance_member_status(uuid,uuid,text,text) from public,anon;
grant execute on function public.bct_admin_set_insurance_member_status(uuid,uuid,text,text) to authenticated;

-- Carrier organization admins may assign existing active members to claims in their own active organization.
create or replace function public.bct_insurance_org_admin_assign_claim(p_claim_id uuid,p_assigned_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c public.bct_insurance_claims;
begin
 select * into c from public.bct_insurance_claims where id=p_claim_id for update;
 if c.id is null then raise exception 'Insurance claim not found'; end if;
 if not public.bct_insurance_org_admin_of(c.organization_id) then raise exception 'Insurance organization admin required' using errcode='42501'; end if;
 if not public.bct_insurance_org_active(c.organization_id) then raise exception 'Insurance organization is not active' using errcode='42501'; end if;
 if not exists(select 1 from public.bct_insurance_members m where m.organization_id=c.organization_id and m.user_id=p_assigned_user_id and m.status='active') then raise exception 'Assigned insurance member is not active in this organization'; end if;
 update public.bct_insurance_claims set assigned_adjuster_user_id=p_assigned_user_id,updated_at=now() where id=c.id;
end $$;
revoke all on function public.bct_insurance_org_admin_assign_claim(uuid,uuid) from public,anon;
grant execute on function public.bct_insurance_org_admin_assign_claim(uuid,uuid) to authenticated;
