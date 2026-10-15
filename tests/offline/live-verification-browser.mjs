import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
try{
 const page=await browser.newPage();await page.route('**/*',r=>r.abort());
 await page.setContent('<main id="jobManagementPanel"></main><div id="view-jobs"></div>');
 await page.evaluate(()=>{window.activeManagedJob={project_id:'p1',job_id:'j1'};window.creates=[];window.rpc=async(name,args)=>{if(name==='bct_admin_create_live_verification')return new Promise(resolve=>creates.push({args,resolve}));return [{id:'bad',verification_mode:'live_video',video_join_url:'javascript:alert(1)'},{id:'good',verification_mode:'live_video',video_join_url:'https://meet.example.test/room'}];};});
 await page.addScriptTag({content:fs.readFileSync('bct-live-project-verification.js','utf8')});
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 await page.waitForFunction(()=>document.querySelector('#bctContractorLiveVerificationList a'));
 assert.equal(await page.locator('#bctContractorLiveVerificationList a').count(),1,'unsafe stored links omitted');
 const submit=()=>page.evaluate(()=>document.querySelector('#bctLiveVerificationForm').dispatchEvent(new Event('submit',{cancelable:true})));
 await page.fill('[name=scheduledFor]','2026-10-16T10:00');
 for(const url of ['javascript:alert(1)','https://','https://user:password@meet.example.test']){
  await page.fill('[name=videoUrl]',url);await submit();assert.equal(await page.evaluate(()=>creates.length),0,'invalid URL rejected');
 }
 await page.fill('[name=videoUrl]','https://meet.example.test/room');await submit();await submit();
 assert.equal(await page.evaluate(()=>creates.length),1,'double submit only sends once');
 assert.equal(await page.locator('#bctLiveVerificationForm button').isDisabled(),true);
 await page.evaluate(()=>creates[0].resolve({}));
 await page.waitForFunction(()=>!document.querySelector('#bctLiveVerificationForm button').disabled);
 assert.match(await page.locator('#bctLiveVerificationStatus').textContent(),/saved/);
 assert.equal(await page.inputValue('[name=videoUrl]'),'','async completion resets original form');
 assert.equal(await page.locator('#bctLiveVerificationList a').count(),1,'admin also rejects unsafe saved URL');
 await page.fill('[name=scheduledFor]','2026-10-16T11:00');await submit();
 await page.evaluate(()=>{activeManagedJob={project_id:'p2',job_id:'j2'};document.querySelector('[name=notes]').value='new job draft';creates[1].resolve({});});
 await page.waitForFunction(()=>!document.querySelector('#bctLiveVerificationForm button').disabled);
 assert.equal(await page.inputValue('[name=notes]'),'new job draft','old save cannot reset new job draft');
 console.log('Live verification browser regressions passed: unsafe stored/input URLs, duplicate submits, async form reset and job-switch draft preservation. Hosted acceptance pending.');
}finally{await browser.close();}
