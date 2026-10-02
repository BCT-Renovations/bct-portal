import fs from 'node:fs';
const launch=fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql',import.meta.url),'utf8').toLowerCase();
const project=fs.readFileSync(new URL('../supabase/migrations/20261002100000_v46_portal_composition_batch5.sql',import.meta.url),'utf8').toLowerCase();
const need=(s,x,m)=>{if(!s.includes(x))throw new Error(m+': '+x)};
need(launch,'bct_admin_operational_readiness','platform launch readiness missing');
need(project,'bct_project_readiness_blockers','canonical project readiness missing');
need(project,"if not public.is_bct_admin() then raise exception 'bct admin access required'","project readiness admin gate missing");
need(project,'security definer set search_path=public,auth,pg_temp','project readiness hardened execution missing');
need(project,'revoke all on function public.bct_project_readiness_blockers(uuid) from public,anon,authenticated','broad readiness execute revoke missing');
need(project,"'ready',count(*)=0",'readiness boolean missing');
need(project,"'blocker_count',count(*)",'blocker count missing');
for(const x of ["'project_hold'","'contract'","'assignment'","'payment'","'access'","'inspection'","'material'","'decision'","'stop_work'","'required_approval'","'dependency'","'permit'","'failed_inspection'","'customer_material'","'hidden_condition'","'material_substitution'","'utility_restoration'","'required_checklist'"]) need(project,x,'blocker class missing');
need(project,'bct_permit_responsibilities','permit blocker must be driven by required permit responsibility');
need(project,'coalesce(cm.quantity_claimed,0)>0','customer material blocker must require claimed material');
if(project.includes("coalesce(h.reason,h.hold_type")) throw new Error('internal hold reason exposed');
if(project.includes("select 'permit','a required project permit is not ready'\n     where exists(select 1 from public.bct_permits pm")) throw new Error('all permit rows must not become readiness requirements');
if((project.match(/create or replace function public\.bct_project_readiness_blockers/g)||[]).length!==1) throw new Error('duplicate project readiness function');
console.log('V46 project readiness reconciliation regression checks passed');

for(const x of ['bct_hidden_conditions','bct_material_substitutions','bct_utility_interruptions','bct_project_checklists']) need(project,x,'canonical readiness source missing');

need(project,'bct_code_corrections','failed-inspection readiness must inspect correction clearance');
need(project,'cc.cleared_at is null','cleared inspection corrections must release readiness blocker');
