import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const dir=new URL('supabase/insurance-isolated-migrations/',root);
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();
assert.equal(files.length,13,'All 13 parked insurance migrations must be staged');
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
assert.match(combined,/if not public\.is_bct_admin\(\)/i);
assert.match(combined,/bct_insurance_member_of/i);
console.log('TAKAI insurance staged SQL static namespace and boundary checks passed:',files.length,'migrations');
