import fs from 'node:fs';
const id=fs.readFileSync(new URL('../supabase/migrations/20261002050000_contractor_identity_trade_leads.sql',import.meta.url),'utf8').toLowerCase();
const crew=fs.readFileSync(new URL('../supabase/migrations/20261002083000_v46_field_controls_extension_batch2.sql',import.meta.url),'utf8').toLowerCase();
const bridge=fs.readFileSync(new URL('../supabase/migrations/20261002110000_v46_whos_coming_crew_integration.sql',import.meta.url),'utf8').toLowerCase();
const need=(s,x,m)=>{if(!s.includes(x))throw new Error(m+': '+x)};

['bct_project_trade_leads','bct_homeowner_project_trade_leads','bct_homeowner_contractor_profile_photo_path',
 'bct_project_trade_leads_one_visible_lead_per_trade','profile_photo_status=\'approved\'','homeowner_visible'].forEach(x=>need(id,x,'identity/trade-lead gate missing'));
need(id,'set search_path=public,auth,pg_temp','identity privileged functions need hardened search path');
need(id,'cu.auth_user_id=auth.uid()','homeowner ownership missing');
need(id,"a.status in ('assigned','scheduled','in_progress','quality_review')",'active assignment gate missing');

need(crew,'worker_profile_id uuid references public.bct_worker_profiles(id)','crew worker FK missing');
need(crew,'wa.worker_profile_id=pc.worker_profile_id','canonical worker assignment link missing');
need(crew,'wp.auth_user_id=auth.uid() or public.is_bct_admin()','check-in caller authorization missing');
need(crew,"pc.substitute_approval_status='approved'",'substitute approval check-in gate missing');
need(crew,'set search_path=public,auth,pg_temp','crew privileged search path missing');

need(bridge,'bct_admin_approve_crew_substitute','admin substitute approval missing');
need(bridge,'if not public.is_bct_admin()','substitute approval admin gate missing');
need(bridge,'bct_homeowner_project_crew_status','safe homeowner attendance missing');
need(bridge,'c.auth_user_id=auth.uid()','attendance homeowner ownership missing');
need(bridge,"pc.substitute_for is null or pc.substitute_approval_status='approved'",'unapproved substitute homeowner exclusion missing');

if((id.match(/create table if not exists public\.bct_project_trade_leads/g)||[]).length!==1) throw new Error('parallel trade-lead system detected');
if(bridge.includes('resident_private_notes')||bridge.includes('access_notes')||bridge.includes('government_id')) throw new Error('private data leaked into attendance bridge');
console.log("V46 Who's Coming attendance/substitution regression checks passed");
