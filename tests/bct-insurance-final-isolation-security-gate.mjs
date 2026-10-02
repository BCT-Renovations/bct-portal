import fs from'node:fs';import assert from'node:assert/strict';
const files=fs.readdirSync('supabase/migrations').filter(x=>x.includes('insurance'));const sql=files.map(x=>fs.readFileSync('supabase/migrations/'+x,'utf8')).join('\n');
const portal=fs.readFileSync('bct-insurance-portal.js','utf8'),admin=fs.readFileSync('bct-insurance-admin.js','utf8');
for(const forbidden of ['contractor_bids','service_role'])assert.ok(!portal.includes(forbidden),'carrier UI contains forbidden '+forbidden);
assert.ok(!portal.includes('bct_submit_homeowner_project'),'carrier UI must not invoke homeowner project submission');
assert.ok(!sql.includes('insert into public.bct_projects'),'insurance migrations must not create parallel projects');\nassert.ok(sql.includes('public.bct_insurance_partner_claims'),'partner claim intake table missing');\nassert.ok(!sql.includes('public.bct_insurance_claims'),'partner migrations must not target the legacy internal claims table');
for(const x of ['bct_insurance_can_read_claim','bct_insurance_org_active','bct_admin_add_insurance_internal_note','bct_admin_link_insurance_claim_to_project','bct_insurance_claim_history'])assert.ok(sql.includes(x),x+' missing');
for(const x of ['Prepare Project Handoff','Private BCT Note','Move to Construction'])assert.ok(admin.includes(x),x+' missing');
console.log('BCT Insurance final isolation/security static gate passed');