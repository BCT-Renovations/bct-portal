import fs from 'node:fs';import assert from 'node:assert/strict';
const repoRoot=new URL('../',import.meta.url);const portalPath=new URL('bct-insurance-portal.js',repoRoot);const adminPath=new URL('bct-insurance-admin.js',repoRoot);const migrationsDir=new URL('supabase/migrations/',repoRoot);
if(!fs.existsSync(portalPath)||!fs.existsSync(adminPath)) { console.log('BCT Insurance Portal boundary checks skipped: insurance module is not present in this V46 checkout.'); process.exit(0); }
const portal=fs.readFileSync(portalPath,'utf8'),admin=fs.readFileSync(adminPath,'utf8');
const migrations=fs.readdirSync(migrationsDir).filter(x=>x.includes('insurance')).map(x=>fs.readFileSync(new URL(x,migrationsDir),'utf8')).join('\n');
assert.ok(portal.includes('BCT INSURANCE PORTAL'));
assert.ok(portal.includes('bct_insurance_submit_claim'));
assert.ok(!portal.includes('contractor_bids'));
assert.ok(!portal.includes('bct_submit_homeowner_project'));
assert.ok(admin.includes('Prepare Project Handoff'));
assert.ok(!admin.includes('bct_submit_homeowner_project'));
assert.ok(!migrations.includes('insert into public.bct_projects'),'insurance migrations must not create a parallel BCT project');
assert.ok(migrations.includes('bct_insurance_partner_claims_project_unique'),'one-to-one project link guard missing');
assert.ok(migrations.includes("'bct_only'"),'private BCT claim event boundary missing');
assert.ok(migrations.includes('bct_insurance_can_read_claim'),'per-claim authorization missing');
console.log('BCT Insurance Portal cross-layer regression boundary checks passed');