import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const dir='supabase/migrations';
const files=fs.readdirSync(dir).filter(n=>n.endsWith('.sql')&&(n.includes('v46')||n.startsWith('20261002')));
const malformed=[];
const unsafe=[];
for(const name of files){
 const s=fs.readFileSync(path.join(dir,name),'utf8');
 if(/^\s*as \$\s*$/m.test(s)||/^\s*end \$;\s*$/m.test(s)) malformed.push(name);
 const defs=(s.match(/security definer/gi)||[]).length;
 const paths=(s.match(/set search_path\s*=/gi)||[]).length;
 if(defs>paths) unsafe.push({name,security_definer:defs,search_path:paths});
}
assert.deepEqual(malformed,[],'Malformed SQL dollar delimiters: '+JSON.stringify(malformed));
assert.deepEqual(unsafe,[],'SECURITY DEFINER functions missing hardened search_path: '+JSON.stringify(unsafe));
const batch4=fs.readFileSync(path.join(dir,'20261002093000_v46_portal_enforcement_batch4.sql'),'utf8').toLowerCase();
assert.ok(!batch4.includes('alter table public.bct_insurance_claims'),'Batch4 must not mutate legacy insurance claims');
assert.ok(!batch4.includes('bct_admin_confirm_insurance_intake'),'Stale legacy insurance intake RPC returned to Batch4');
console.log('V46 migration static integrity checks passed across',files.length,'migration files');