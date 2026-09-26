-- Protect resident contact details and add approved-contractor On My Way events.
create or replace function public.bct_project_private_contact(p_project_id uuid)
returns table(project_id uuid,property_name text,building_number text,unit_number text,occupancy_status text,resident_name text,resident_phone text,access_instructions text)
language plpgsql security invoker set search_path=public,auth as $$
declare v_assigned uuid;v_contractor_user uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 select p.assigned_contractor_id into v_assigned from public.bct_projects p where p.id=p_project_id;
 if not found then raise exception 'Project not found';end if;
 if public.is_bct_admin() or public.bct_user_owns_project(p_project_id) then return query select p.id,p.property_name,p.building_number,p.unit_number,p.occupancy_status,p.resident_name,p.resident_phone,p.access_instructions from public.bct_projects p where p.id=p_project_id;return;end if;
 if v_assigned is not null then select c.auth_user_id into v_contractor_user from public.bct_contractors c where c.id=v_assigned and c.active=true;end if;
 if v_contractor_user=auth.uid() and exists(select 1 from public.bct_job_communication_sessions s where s.project_id=p_project_id and s.assigned_contractor_id=v_assigned and s.status='active') then return query select p.id,p.property_name,p.building_number,p.unit_number,p.occupancy_status,null::text,null::text,p.access_instructions from public.bct_projects p where p.id=p_project_id;return;end if;
 raise exception 'Private resident contact information is not available to this user';
end $$;
revoke all on function public.bct_project_private_contact(uuid) from public,anon;grant execute on function public.bct_project_private_contact(uuid) to authenticated;
create or replace function public.bct_contractor_on_my_way(p_project_id uuid,p_eta_minutes integer default 60) returns uuid language plpgsql security invoker set search_path=public,auth as $$
declare v_contractor uuid;v_session uuid;v_id uuid;v_body text;
begin if auth.uid() is null then raise exception 'Authentication required';end if;if p_eta_minutes<1 or p_eta_minutes>240 then raise exception 'ETA must be between 1 and 240 minutes';end if;select p.assigned_contractor_id into v_contractor from public.bct_projects p join public.bct_contractors c on c.id=p.assigned_contractor_id and c.active=true where p.id=p_project_id and c.auth_user_id=auth.uid();if v_contractor is null then raise exception 'Only the approved assigned contractor can send an arrival notice';end if;select s.id into v_session from public.bct_job_communication_sessions s where s.project_id=p_project_id and s.assigned_contractor_id=v_contractor and s.status='active' order by s.created_at desc limit 1;if v_session is null then raise exception 'BCT must activate communications before an arrival notice can be sent';end if;v_body:=format('Your BCT contractor is on the way and expects to arrive in approximately %s minutes.',p_eta_minutes);insert into public.bct_job_communication_events(session_id,project_id,sender_role,event_type,body,created_by) values(v_session,p_project_id,'contractor','arrival_notice',v_body,auth.uid()) returning id into v_id;return v_id;end $$;
revoke all on function public.bct_contractor_on_my_way(uuid,integer) from public,anon;grant execute on function public.bct_contractor_on_my_way(uuid,integer) to authenticated;
