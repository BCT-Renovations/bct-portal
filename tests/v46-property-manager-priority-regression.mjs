import fs from 'node:fs';

const b5=fs.readFileSync(new URL('../supabase/migrations/20261002100000_v46_portal_composition_batch5.sql',import.meta.url),'utf8').toLowerCase();
const pm=fs.readFileSync(new URL('../supabase/migrations/20261002103000_v46_property_manager_priority_extension.sql',import.meta.url),'utf8').toLowerCase();

const need=(src,t,msg)=>{if(!src.includes(t)) throw new Error(msg+': '+t)};

need(b5,'bct_my_property_portfolio_priority','portfolio priority RPC missing');
need(b5,'security definer','priority aggregation must bypass admin-only source RLS only after explicit ownership gate');
need(b5,'if auth.uid() is null','authentication gate missing');
need(b5,'mp.id=p.managed_property_id','managed-property exact scope missing');
need(b5,'mp.property_account_id','property account scope missing');
need(b5,'pa.auth_user_id=auth.uid()','property account ownership missing');
need(b5,'pa.active','active property account gate missing');
need(b5,'mp.active','active managed property gate missing');
need(b5,'revoke all on function public.bct_my_property_portfolio_priority() from public,anon,authenticated','broad execute revoke missing');
need(b5,'grant execute on function public.bct_my_property_portfolio_priority() to authenticated','authenticated execute grant missing');

need(pm,'bct_my_property_portfolio_summary','portfolio summary missing');
need(pm,'bct_my_property_unit_project_summary','unit project summary missing');
need(pm,'project access denied','unit project ownership denial missing');
need(pm,"pu.property_id=(\n      select p.managed_property_id",'unit must bind to project managed property');
need(pm,'and mp.active','unit property must remain active');
need(pm,'resident_private_notes','privacy exclusion documentation missing');
need(pm,'access_notes','access-note exclusion documentation missing');
need(pm,'security definer','safe aggregate privilege missing');

if(pm.includes('select pu.*')||pm.includes('resident_private_notes,')||pm.includes('access_notes,'))
 throw new Error('Property manager safe unit RPC may expose private unit fields');
if((pm.match(/create table/g)||[]).length) throw new Error('Parallel property manager tables are prohibited');
if((pm.match(/create or replace function public.bct_my_property_portfolio_summary/g)||[]).length!==1)
 throw new Error('Duplicate portfolio summary RPC');
if((pm.match(/create or replace function public.bct_my_property_unit_project_summary/g)||[]).length!==1)
 throw new Error('Duplicate unit summary RPC');

console.log('V46 property manager portfolio security/privacy regression checks passed');
