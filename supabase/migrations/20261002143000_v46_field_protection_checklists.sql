-- V46 canonical field-protection checklist bootstrap. Development only.
-- Reuses bct_project_checklists + bct_checklist_items; no parallel checklist system.

create or replace function public.bct_admin_ensure_field_protection_checklists(p_project_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_created integer:=0; v_items integer:=0; r record;
begin
 if auth.uid() is null or not public.is_bct_admin() then raise exception 'BCT Admin access required'; end if;
 if not exists(select 1 from public.bct_projects p where p.id=p_project_id) then raise exception 'Project not found'; end if;

 for r in
  select * from (values
   ('preconstruction_orientation','Pre-Construction Homeowner Orientation',true,false,true),
   ('occupied_home_protection','Occupied-Home Protection',true,false,true),
   ('contents_protection','Homeowner Property & Contents Protection',true,false,true),
   ('noise_dust_odor','Noise / Dust / Odor Control',true,false,true),
   ('temporary_protection','Temporary Protection Tracking',true,false,true),
   ('end_of_day_security','End-of-Day Site Security & Cleanup',false,false,true),
   ('final_property_return','Final Property Return Check',false,true,true)
  ) v(checklist_type,title,required_before_start,blocks_closeout,homeowner_visible)
 loop
  insert into public.bct_project_checklists(project_id,checklist_type,title,status,required_before_start,blocks_closeout,homeowner_visible)
  select p_project_id,r.checklist_type,r.title,'open',r.required_before_start,r.blocks_closeout,r.homeowner_visible
  where not exists(select 1 from public.bct_project_checklists c where c.project_id=p_project_id and c.checklist_type=r.checklist_type);
  if found then v_created:=v_created+1; end if;
 end loop;

 insert into public.bct_checklist_items(checklist_id,item_text,required,status,sort_order,evidence_required,responsible_party,blocks_progress)
 select c.id,x.item_text,true,'pending',x.sort_order,x.evidence_required,'BCT',x.blocks_progress
 from public.bct_project_checklists c
 join (values
  ('preconstruction_orientation','Confirm work areas, schedule, access, household considerations and emergency contact.',1,false,true),
  ('preconstruction_orientation','Confirm homeowner understands who may enter the work area and how BCT identifies approved leads.',2,false,true),
  ('occupied_home_protection','Separate active work zones from occupied living areas.',1,true,true),
  ('occupied_home_protection','Confirm safe household access and egress remain available.',2,true,true),
  ('occupied_home_protection','Secure tools, debris and hazardous materials from residents, children and pets.',3,true,true),
  ('contents_protection','Document and protect homeowner contents adjacent to the work area.',1,true,true),
  ('contents_protection','Confirm coverings, relocation or barriers are in place before work starts.',2,true,true),
  ('noise_dust_odor','Install required dust containment and ventilation controls.',1,true,true),
  ('noise_dust_odor','Communicate unusual noise, dust or odor impacts before affected work begins.',2,false,false),
  ('temporary_protection','Verify floor, wall, opening and weather protection appropriate to the active scope.',1,true,true),
  ('temporary_protection','Record damaged or displaced temporary protection before work continues.',2,true,true),
  ('end_of_day_security','Remove or secure debris, tools and trip hazards.',1,true,false),
  ('end_of_day_security','Secure openings, doors, windows and weather-exposed areas before leaving.',2,true,false),
  ('end_of_day_security','Confirm utilities and temporary equipment are left in a safe condition.',3,false,false),
  ('final_property_return','Complete final property-condition walkthrough against pre-work evidence.',1,true,true),
  ('final_property_return','Resolve or document remaining property-protection concerns before closeout.',2,true,true),
  ('final_property_return','Confirm keys/access devices and protected areas are returned as required.',3,false,true)
 ) x(checklist_type,item_text,sort_order,evidence_required,blocks_progress)
  on x.checklist_type=c.checklist_type
 where c.project_id=p_project_id
 and not exists(select 1 from public.bct_checklist_items i where i.checklist_id=c.id and i.item_text=x.item_text);
 get diagnostics v_items=row_count;

 return jsonb_build_object('project_id',p_project_id,'checklists_created',v_created,'items_created',v_items);
end $$;
revoke all on function public.bct_admin_ensure_field_protection_checklists(uuid) from public,anon,authenticated;
grant execute on function public.bct_admin_ensure_field_protection_checklists(uuid) to authenticated;
