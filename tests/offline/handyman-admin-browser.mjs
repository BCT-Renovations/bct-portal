// Actual Handyman review controller; RPC/auth fixtures only, no network.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});let checks=0;const check=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++;};
try{
 const page=await browser.newPage();page.setDefaultTimeout(5000);await page.route('**/*',r=>r.abort());await page.setContent('<main id="view-admin"><div class="portal-tabs"></div></main>');
 await page.evaluate(()=>{
  window.user='admin-a';window.allowed=true;window.calls=[];window.alerts=[];window.alert=m=>alerts.push(m);
  window.rows=[{id:'app-1',application_code:'A1',legal_name:'<img src=x onerror=alert(1)>',approval_status:'approved',background_check_status:'clear'},{id:'app-2',application_code:'A2',legal_name:'Pending applicant',approval_status:'pending_bct_review'}];
  window.supabaseClient={auth:{getUser:async()=>({data:{user:user?{id:user}:null},error:null}),onAuthStateChange:cb=>window.authChanged=cb},rpc:async(name,args)=>{calls.push({name,args});if(name==='is_bct_admin')return {data:allowed,error:null};if(name==='bct_admin_handyman_applications'){if(window.hold)return new Promise(resolve=>window.release=()=>resolve({data:rows,error:null}));return {data:window.malformed?null:rows,error:null};}if(name==='bct_admin_review_handyman_application')return new Promise(resolve=>window.finishReview=()=>resolve({data:null,error:null}));throw Error('Unexpected RPC');}};
 });
 await page.addScriptTag({content:fs.readFileSync('bct-handyman-admin.js','utf8')});
 check(await page.locator('#bctHandymanAdminMount').getAttribute('data-bct-admin-queue-state'),'unknown','mount cannot imply loaded records');
 await page.evaluate(()=>BCTHandymanAdmin.load());check(await page.locator('#bctHandymanAdminMount').getAttribute('data-bct-admin-queue-state'),'ready','verified successful load');
 check(await page.locator('#bctHandymanAdminList img').count(),0,'application names are escaped');
 check(await page.locator('#bctHandymanAdminList > [data-status]').first().getAttribute('data-status'),'approved','approved application is not tagged pending');
 check(await page.locator('#bctHandymanAdminList > [data-status]').nth(1).getAttribute('data-status'),'pending_bct_review','pending application retains urgent status');
 await page.evaluate(()=>{document.body.classList.add('bct-authenticated');document.getElementById('view-admin').dataset.bctAdminDataState='ready';});await page.addScriptTag({content:fs.readFileSync('bct-admin-control-board.js','utf8')});await page.waitForSelector('[data-bct-urgent-category=contractors] .bct-admin-alert-count');check(await page.locator('[data-bct-urgent-category=contractors] .bct-admin-alert-count').textContent(),'1','one pending application counts once and approved application counts zero');
 await page.evaluate(()=>{const b=document.querySelector('[data-id="app-2"]');b.click();b.click();});await page.waitForFunction(()=>!!window.finishReview);
 check(await page.evaluate(()=>calls.filter(c=>c.name==='bct_admin_review_handyman_application').length),1,'duplicate review clicks issue one mutation');
 check(await page.locator('[data-id="app-2"]:disabled').count(),4,'all actions for in-flight application locked');
 await page.evaluate(()=>{user=null;authChanged('SIGNED_OUT',null);finishReview();});await page.waitForTimeout(30);
 check(await page.locator('#bctHandymanAdminList [data-id]').count(),0,'sign-out clears private rows and late mutation cannot restore them');
 await page.evaluate(()=>{user='admin-b';authChanged('SIGNED_IN',{user:{id:user}});hold=true;window.loading=BCTHandymanAdmin.load();});await page.waitForFunction(()=>!!window.release);
 await page.evaluate(async()=>{user='other';authChanged('SIGNED_IN',{user:{id:user}});release();await loading;});check(await page.locator('#bctHandymanAdminList [data-id]').count(),0,'previous account delayed read discarded');
 await page.evaluate(async()=>{hold=false;allowed=false;await BCTHandymanAdmin.load();});check(await page.locator('#bctHandymanAdminMount').getAttribute('data-bct-admin-queue-state'),'error','permission denial is unavailable, not empty success');
 const before=await page.evaluate(()=>calls.filter(c=>c.name==='bct_admin_handyman_applications').length);await page.evaluate(()=>BCTHandymanAdmin.load());check(await page.evaluate(()=>calls.filter(c=>c.name==='bct_admin_handyman_applications').length),before,'non-admin never requests application records');
 await page.evaluate(async()=>{allowed=true;malformed=true;await BCTHandymanAdmin.load();});check(await page.locator('#bctHandymanAdminMount').getAttribute('data-bct-admin-queue-state'),'error','malformed response cannot claim zero');
 await page.evaluate(async()=>{malformed=false;rows=[];await BCTHandymanAdmin.load();});check(await page.locator('#bctHandymanAdminList').textContent(),'No handyman applications yet.','verified empty result is explicit');
 console.log(`Handyman Admin offline browser: ${checks} assertions passed; hosted authorization remains pending`);
}finally{await browser.close();}
