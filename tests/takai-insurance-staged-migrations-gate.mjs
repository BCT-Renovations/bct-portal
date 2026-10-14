import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const dir=new URL('supabase/insurance-isolated-migrations/',root);
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();
assert.equal(files.length,14,'All 13 parked migrations plus final security hardening must be staged');
const sql=files.map(f=>fs.readFileSync(new URL(f,dir),'utf8'));
for(let i=0;i<files.length;i++){
 const s=sql[i],name=files[i];
 assert.doesNotMatch(s,/\b(?:public\.)?bct_insurance_claims\b/i,name+' must not target legacy claims');
 assert.doesNotMatch(s,/\b(?:public\.)?bct_insurance_claim_events\b/i,name+' must not target legacy events');
 assert.doesNotMatch(s,/\b(?:drop\s+table|truncate\s+table)\b/i,name+' must not destroy tables');
 assert.doesNotMatch(s,/\b(?:insert\s+into|update|delete\s+from)\s+(?:public\.)?bct_projects\b/i,name+' must not modify canonical projects');
}
const combined=sql.join('\n');
assert.match(combined,/create table if not exists public\.bct_partner_claims\b/i);
assert.match(combined,/create table if not exists public\.bct_partner_claim_events\b/i);
assert.match(combined,/create table if not exists public\.bct_insurance_organizations\b/i);
assert.match(combined,/create table if not exists public\.bct_insurance_members\b/i);
assert.match(combined,/create unique index if not exists bct_partner_claims_project_unique/i);
assert.match(combined,/if auth\.uid\(\) is null or not coalesce\(public\.is_bct_admin\(\),false\)/i);
assert.match(combined,/bct_insurance_member_of/i);
assert.match(combined,/m\.member_role in \('organization_admin','adjuster','claims_representative'\)/,'Read-only insurance members must not submit claims');
assert.match(combined,/revoke insert,update,delete on public\.bct_partner_claims from authenticated/i,'Direct browser claims mutation must be denied');
const finalGuard=fs.readFileSync(new URL('20261002013500_bct_insurance_partner_mutation_role_guard.sql',dir),'utf8');
assert.match(finalGuard,/bct_insurance_can_write_claim/,'Separate partner write permission must exist');
assert.match(finalGuard,/m\.member_role in \('organization_admin','adjuster','claims_representative'\)/,'Read-only members cannot mutate claims');
assert.match(finalGuard,/o\.status='active'/,'Suspended insurance organizations cannot mutate claims');
for(const fn of ['bct_insurance_add_claim_message','bct_insurance_respond_to_information_request','bct_insurance_submit_supplement']){
 const i=finalGuard.indexOf('create or replace function public.'+fn);
 assert.ok(i>=0,fn+' must be overridden in final security migration');
 const end=finalGuard.indexOf('end $$;',i);
 assert.ok(end>i,fn+' must have a complete SQL body');
 const body=finalGuard.slice(i,end+7);
 assert.match(body,/bct_insurance_can_write_claim/,'Partner mutation must verify write access: '+fn);
}
assert.match(finalGuard,/status=case when status='construction' then status else 'supplement' end/,'Supplement must not reverse active construction');
console.log('TAKAI insurance staged SQL static namespace and boundary checks passed:',files.length,'migrations');
