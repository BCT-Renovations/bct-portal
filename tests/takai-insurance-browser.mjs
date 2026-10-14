// Mock backend browser regression. No live accounts or data are used.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const launch={headless:true};if(process.env.CHROMIUM_EXECUTABLE)launch.executablePath=process.env.CHROMIUM_EXECUTABLE;if(process.env.CHROMIUM_MODULE){const portable=(await import(process.env.CHROMIUM_MODULE)).default;launch.executablePath=await portable.executablePath();launch.args=portable.args;}
const browser=await chromium.launch(launch);const page=await browser.newPage();
await page.setContent('<main id="bctMain"><section id="view-home" class="view"></section><section id="view-admin" class="view"></section></main><button id="bctInsurancePreviewEntry">Insurance</button>');
await page.evaluate(()=>{window.calls=[];window.setVisibleView=name=>document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!=='view-'+name));window.bctReturnToPublicLanding=()=>window.setVisibleView('home');window.memberRole='adjuster';window.claims=[{id:'claim-a',claim_number:'CL-1',status:'needs_information',policyholder_name:'<script>bad</script>',loss_type:'Water',property_address:{street:'123 Test'}}];window.supabaseClient={auth:{onAuthStateChange:callback=>{(window.authCallbacks||=[]).push(callback)},getUser:async()=>({data:{user:{id:'dummy',email:'dummy@example.test'}}}),signInWithPassword:async()=>{throw Error('Existing session must be reused')}},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,limit:()=>q,maybeSingle:async()=>({data:{organization_id:'org-a',member_role:window.memberRole,status:'active'}}),then:resolve=>resolve({data:table==='bct_insurance_members'?(window.memberships||[{organization_id:'org-a',member_role:window.memberRole,status:'active'}]):window.claims})};return q},rpc:async(name,args)=>{window.calls.push({name,args});await new Promise(r=>setTimeout(r,20));return {data:name==='bct_insurance_org_active'?true:name==='is_bct_admin'?window.adminAllowed!==false:name==='bct_insurance_claim_history'?[{event_type:'document_note',body:null,payload:{response:'Requested detail supplied'}}]:null,error:null}}};});
await page.addScriptTag({content:fs.readFileSync(new URL('../bct-insurance-preview-shell.js',import.meta.url),'utf8')});
await page.click('#bctInsurancePreviewEntry');assert.equal(await page.locator('#view-insurance-preview').isVisible(),true);assert.equal(await page.evaluate(()=>calls.length),0);await page.click('#bctInsurancePreviewBack');
await page.addScriptTag({content:fs.readFileSync(new URL('../bct-insurance-portal.js',import.meta.url),'utf8')});await page.evaluate(()=>bctOpenInsurancePortal());
await page.fill('#bctInsuranceEmail','dummy@example.test');await page.fill('#bctInsurancePassword','dummy-password');await page.click('#bctInsuranceSignIn');await page.waitForFunction(()=>window.BCT_INSURANCE_MEMBER);assert.equal(await page.inputValue('#bctInsurancePassword'),'');
await page.click('[data-ins-open]');await page.waitForFunction(()=>document.getElementById('bctInsuranceClaimHistory').textContent.includes('Requested detail supplied'));assert.equal(await page.locator('#bctInsuranceClaims script').count(),0);
await page.click('[data-ins-page=new]');for(const [name,value] of Object.entries({claim_number:'CL-2',policyholder_name:'Dummy',loss_type:'Water',property_address:'123 Test',property_city:'Test',property_state:'IN'}))await page.fill(`[name=${name}]`,value);
await page.evaluate(()=>{const form=document.getElementById('bctInsuranceClaimForm');form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
await page.waitForFunction(()=>document.getElementById('bctInsuranceStatus').textContent.includes('Claim submitted'));assert.equal(await page.evaluate(()=>calls.filter(c=>c.name==='bct_insurance_submit_claim').length),1);
await page.waitForFunction(()=>!document.getElementById('bctInsuranceClaimForm').dataset.busy);await page.evaluate(()=>{memberRole='read_only';BCT_INSURANCE_MEMBER.member_role='read_only'});await page.click('[data-ins-page=new]');assert.match(await page.locator('#bctInsuranceStatus').textContent(),/read-only/);
await page.evaluate(()=>{window.memberships=[{organization_id:'org-a',member_role:'adjuster',status:'active'},{organization_id:'org-b',member_role:'read_only',status:'active'}]});await page.click('#bctInsuranceRefresh');await page.waitForFunction(()=>document.querySelectorAll('#bctInsuranceOrgSelect option').length===3);await page.selectOption('#bctInsuranceOrgSelect','org-b');await page.waitForFunction(()=>window.BCT_INSURANCE_MEMBER?.organization_id==='org-b');
await page.addScriptTag({content:fs.readFileSync(new URL('../bct-insurance-admin.js',import.meta.url),'utf8')});await page.evaluate(()=>{bctEnsureInsuranceAdminPanel();bctEnsureInsuranceAdminPanel();return bctLoadInsuranceAdmin()});assert.equal(await page.locator('#bctInsuranceAdminPanel').count(),1);
await page.evaluate(()=>{adminAllowed=false;return bctLoadInsuranceAdmin()});assert.match(await page.locator('#bctInsuranceAdminClaims').textContent(),/Admin access required/);
// A delayed old-company claim response must never overwrite the new company.
await page.evaluate(()=>{
 window.memberRole='adjuster';window.BCT_INSURANCE_MEMBER.member_role='adjuster';
 window.originalFrom=window.supabaseClient.from;
 window.supabaseClient.from=table=>{
  if(table!=='bct_partner_claims')return window.originalFrom(table);
  let org;const q={select:()=>q,eq:(_key,value)=>{org=value;return q},order:()=>q,limit:()=>q,then:resolve=>{
   if(org==='org-a')window.releaseOldClaims=()=>resolve({data:[{id:'old',claim_number:'OLD-COMPANY',status:'bct_review',property_address:{}}]});
   else resolve({data:[{id:'new',claim_number:'NEW-COMPANY',status:'bct_review',property_address:{}}]});
  }};return q;
 };
});
await page.selectOption('#bctInsuranceOrgSelect','org-a');
await page.waitForFunction(()=>typeof releaseOldClaims==='function');
await page.selectOption('#bctInsuranceOrgSelect','org-b');
await page.waitForFunction(()=>document.getElementById('bctInsuranceClaims').textContent.includes('NEW-COMPANY'));
await page.evaluate(()=>releaseOldClaims());
await page.waitForTimeout(50);
assert.doesNotMatch(await page.locator('#bctInsuranceClaims').textContent(),/OLD-COMPANY/);
// Communication writes are serialized and bound to the claim clicked before auth resolves.
await page.evaluate(()=>{
 window.BCT_INSURANCE_MEMBER.member_role='adjuster';window.originalRpc=window.supabaseClient.rpc;
 window.supabaseClient.rpc=async(name,args)=>{
  if(name==='bct_insurance_add_claim_message'){window.calls.push({name,args});return new Promise(resolve=>{window.releaseMessage=()=>resolve({data:null,error:null})})}
  return window.originalRpc(name,args);
 };
});
await page.click('[data-ins-open]');await page.fill('#bctInsuranceClaimMessage','One message');
await page.evaluate(()=>{document.getElementById('bctInsuranceSendMessage').click();document.getElementById('bctInsuranceSendMessage').click()});
await page.waitForFunction(()=>typeof releaseMessage==='function');
assert.equal(await page.evaluate(()=>calls.filter(c=>c.name==='bct_insurance_add_claim_message').length),1);
await page.selectOption('#bctInsuranceOrgSelect','org-a');
await page.evaluate(()=>releaseMessage());await page.waitForTimeout(50);
assert.doesNotMatch(await page.locator('#bctInsuranceStatus').textContent(),/Claim message sent/);
// Session invalidation clears partner and Admin claim data synchronously.
await page.evaluate(()=>{document.getElementById('bctInsuranceAdminClaims').textContent='PRIVATE ADMIN CLAIM';authCallbacks.forEach(cb=>cb('SIGNED_OUT',null))});
assert.doesNotMatch(await page.locator('#bctInsuranceAdminClaims').textContent(),/PRIVATE ADMIN CLAIM/);
assert.equal(await page.evaluate(()=>BCT_INSURANCE_MEMBER),null);
assert.equal(await page.locator('#bctInsuranceOrgSelect option').count(),1);
// Admin data fetched before a session change cannot appear afterward.
await page.evaluate(()=>{
 window.adminAllowed=true;window.supabaseClient.from=()=>{
  const q={select:()=>q,order:()=>q,limit:()=>q,then:resolve=>{window.releaseAdminClaims=()=>resolve({data:[{id:'private',claim_number:'STALE-ADMIN',property_address:{}}]})}};return q;
 };window.pendingAdmin=bctLoadInsuranceAdmin();
});
await page.waitForFunction(()=>typeof releaseAdminClaims==='function');
await page.evaluate(()=>{authCallbacks.forEach(cb=>cb('SIGNED_OUT',null));releaseAdminClaims();return pendingAdmin});
assert.doesNotMatch(await page.locator('#bctInsuranceAdminClaims').textContent(),/STALE-ADMIN/);
await browser.close();console.log('Insurance browser regressions passed: visual-only preview, session reuse, history, escaped content, duplicate submit lock, read-only UI, admin gate, company-switch races, and session invalidation.');

