// Disposable PostgreSQL only: no connection string, remote client, or production access.
// npm install --prefix /tmp/bct-db-test --save-exact @electric-sql/pglite@0.3.14
// PGLITE_MODULE=/tmp/bct-db-test/node_modules/@electric-sql/pglite/dist/index.js node tests/takai-insurance-database.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();let checks=0;
const uid=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
create function public.is_bct_admin() returns boolean language sql stable as $$ select coalesce(auth.uid()='${uid(1)}'::uuid,false) $$;
create table public.bct_projects(id uuid primary key);
create table public.bct_insurance_claims(id uuid primary key,claim_status text);
create table public.bct_insurance_policies(id uuid primary key);
insert into auth.users select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,9) i;
insert into public.bct_projects values('${uid(101)}');`);
const dir=new URL('../supabase/insurance-isolated-migrations/',import.meta.url);
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort()){
 try{await db.exec('begin;'+fs.readFileSync(new URL(f,dir),'utf8')+'commit;');checks++;}
 catch(e){throw new Error(f+': '+e.message);}
}
// Reapplying the staged package must preserve existing namespaces and policies.
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort()){await db.exec('begin;'+fs.readFileSync(new URL(f,dir),'utf8')+'commit;');checks++;}
const one=async sql=>(await db.query(sql)).rows[0];
async function as(n,sql){await db.exec(`set role authenticated;set request.jwt.claim.sub='${uid(n)}';`);try{return await db.query(sql);}finally{await db.exec('reset role;');}}
async function denied(n,sql,code){await assert.rejects(as(n,sql),e=>!code||e.code===code);checks++;}
async function equal(n,sql,key,value){assert.equal((await as(n,sql)).rows[0][key],value);checks++;}
const org=(await as(1,"select bct_admin_create_insurance_organization('Dummy Carrier A',null) as id")).rows[0].id;
const other=(await as(1,"select bct_admin_create_insurance_organization('Dummy Carrier B',null) as id")).rows[0].id;
for(const o of [org,other])await as(1,`select bct_admin_set_insurance_org_status('${o}','active')`);
for(const [n,role,status,o] of [[2,'organization_admin','active',org],[3,'adjuster','active',org],[4,'read_only','active',org],[5,'adjuster','suspended',org],[6,'adjuster','active',other],[7,'claims_representative','active',org],[8,'adjuster','active',org]])await as(1,`select bct_admin_set_insurance_member_status('${o}','${uid(n)}','${role}','${status}')`);
const submit=(o,num)=>`select bct_insurance_submit_claim('${o}','${num}','Dummy Policyholder','{"street":"123 Test St","city":"Test","state":"IN"}','water',null) as id`;
const claim=(await as(3,submit(org,'CL-1'))).rows[0].id;
await denied(3,submit(org,' cl-1 '),'23505');
await denied(4,submit(org,'CL-2'),'42501');await denied(5,submit(org,'CL-2'),'42501');await denied(6,submit(org,'CL-2'),'42501');
await equal(3,'select count(*)::int as n from bct_partner_claims','n',1);
await equal(6,'select count(*)::int as n from bct_partner_claims','n',0);
await equal(8,'select count(*)::int as n from bct_partner_claims','n',0);
await equal(3,'select count(*)::int as n from bct_insurance_members','n',1);
await equal(2,'select count(*)::int as n from bct_insurance_members','n',6);
for(const n of [3,4,5,6,8,9])await denied(n,`select bct_admin_review_insurance_claim('${claim}','accepted')`,'42501');
await denied(3,`update bct_partner_claims set status='accepted' where id='${claim}'`,'42501');
await denied(1,`select bct_admin_review_insurance_claim_with_note('${claim}','needs_information','')`);
await as(1,`select bct_admin_review_insurance_claim_with_note('${claim}','needs_information','Please provide loss details')`);
await equal(3,`select count(*)::int as n from bct_insurance_claim_history('${claim}') where body='Please provide loss details'`,'n',1);
await as(1,`select bct_admin_add_insurance_internal_note('${claim}','SECRET','{}')`);
await as(3,`select bct_insurance_respond_to_information_request('${claim}','{"response":"Provided"}')`);
await equal(3,`select status from bct_partner_claims where id='${claim}'`,'status','bct_review');
await equal(3,`select count(*)::int as n from bct_insurance_claim_history('${claim}') where body='SECRET'`,'n',0);
await denied(6,`select * from bct_insurance_claim_history('${claim}')`,'42501');
await as(2,`select bct_insurance_org_admin_assign_claim('${claim}','${uid(4)}')`);
await equal(4,`select count(*)::int as n from bct_partner_claims`,'n',1);
for(const sql of [`select bct_insurance_add_claim_message('${claim}','blocked')`,`select bct_insurance_submit_supplement('${claim}','{"notes":"blocked"}')`,`select bct_insurance_respond_to_information_request('${claim}','{"response":"blocked"}')`])await denied(4,sql,'42501');
await as(1,`select bct_admin_review_insurance_claim('${claim}','accepted')`);
await denied(3,`select bct_admin_link_insurance_claim_to_project('${claim}','${uid(101)}')`,'42501');
await as(1,`select bct_admin_link_insurance_claim_to_project('${claim}','${uid(101)}')`);
const claim2=(await as(7,submit(org,'CL-2'))).rows[0].id;
await as(1,`select bct_admin_review_insurance_claim('${claim2}','accepted')`);
await denied(1,`select bct_admin_link_insurance_claim_to_project('${claim2}','${uid(101)}')`);
await as(1,`select bct_admin_activate_insurance_construction('${claim}')`);
await as(2,`select bct_insurance_submit_supplement('${claim}','{"notes":"Extra work"}')`);
await equal(2,`select status from bct_partner_claims where id='${claim}'`,'status','construction');
await denied(1,`select bct_admin_unlink_insurance_claim_project('${claim}','correction')`);
await as(1,`select bct_admin_complete_insurance_claim('${claim}')`);
await equal(2,`select completed_at is not null as complete from bct_partner_claims where id='${claim}'`,'complete',true);
await as(1,`select bct_admin_set_insurance_org_status('${org}','suspended')`);
await equal(2,'select count(*)::int as n from bct_partner_claims','n',0);
await denied(2,`select bct_insurance_add_claim_message('${claim}','blocked')`,'42501');
assert.equal((await one('select count(*)::int as n from bct_projects')).n,1);checks++;
assert.equal((await one('select count(*)::int as n from bct_insurance_claims')).n,0);checks++;
assert.equal((await one("select count(*)::int as n from information_schema.columns where table_name='bct_insurance_claims'")).n,2);checks++;
await db.exec('set role anon;');await assert.rejects(db.query('select * from bct_partner_claims'));await assert.rejects(db.query(`select bct_insurance_can_read_claim('${claim}')`));checks+=2;await db.exec('reset role;');
await db.close();console.log(`Disposable PostgreSQL: 14 migrations and ${checks} migration/permission/workflow checks passed. Hosted Supabase not exercised.`);
