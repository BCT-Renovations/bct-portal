const assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:390,height:844}});
 let network=0;await context.route(/^https?:/,route=>{network++;return route.abort()});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(require('node:path').resolve(__dirname,'../profession-applications-preview.html')).href);
 const q=r=>page.locator('[data-profession="'+r+'"]');
 await q('electrical').waitFor({state:'visible'});assert.equal(await q('plumbing').isVisible(),false);
 assert.equal(await q('electrical').locator('textarea,select').count(),8);
 assert.equal(await q('plumbing').locator(':disabled').count(),8);
 await page.locator('[name="profession_electrical_experience"]').fill('Electrical apprenticeship');
 await page.selectOption('[name="trade"]','plumbing');assert.equal(await q('electrical').isVisible(),false);assert.equal(await q('plumbing').isVisible(),true);
 assert.match(await q('plumbing').innerText(),/water heaters/);assert.doesNotMatch(await q('plumbing').innerText(),/panels/);
 await page.check('[name="contractorNetworkRole"][value="electrical"]');assert.equal(await q('electrical').isVisible(),true);
 assert.equal(await page.inputValue('[name="profession_electrical_experience"]'),'Electrical apprenticeship');
 await page.selectOption('[name="profession_electrical_license_status"]','held');assert.equal(await page.locator('[name="profession_electrical_license_details"]').getAttribute('required'),'');
 await page.selectOption('[name="profession_electrical_license_status"]','none');assert.equal(await page.locator('[name="profession_electrical_license_details"]').getAttribute('required'),null);
 for(const role of ['electrical','plumbing']){
  await page.selectOption('[name="profession_'+role+'_license_status"]','none');
  for(const key of ['jurisdiction','experience','scope','diagnostics','safety','example'])await page.locator('[name="profession_'+role+'_'+key+'"]').fill('Sample '+role+' '+key);
 }
 let data=await page.evaluate(()=>BCTProfessionApplications.read(document.getElementById('applicationForm')));assert.deepEqual(Object.keys(data.professions),['electrical','plumbing']);
 await page.locator('[name="profession_plumbing_safety"]').fill('   ');
 assert.equal(await page.evaluate(()=>{try{BCTProfessionApplications.read(document.getElementById('applicationForm'));return false}catch{return true}}),true);
 await page.locator('[name="profession_plumbing_safety"]').fill('Sample safe process');
 await page.uncheck('[name="contractorNetworkRole"][value="electrical"]');
 data=await page.evaluate(()=>BCTProfessionApplications.read(document.getElementById('applicationForm')));assert.deepEqual(Object.keys(data.professions),['plumbing']);
 const history=await page.evaluate(()=>BCTProfessionApplications.appendHistory('Existing work history',BCTProfessionApplications.read(document.getElementById('applicationForm'))));assert.match(history,/^Existing work history\n\nBCT profession/);assert.doesNotMatch(history,/Electrical apprenticeship/);
 await page.click('[type="submit"]');assert.match(await page.locator('#status').innerText(),/No application was submitted/);
 await page.click('[type="reset"]');await page.waitForFunction(()=>document.querySelector('[data-profession="electrical"]').hidden===false);
 assert.equal(await page.inputValue('[name="profession_electrical_experience"]'),'');assert.equal(await q('plumbing').isVisible(),false);
 assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);assert.equal(network,0);
 console.log('PASS: distinct questions, 8 fields per profession, switching, retained drafts, multi-profession selection, conditional license details, whitespace validation, answer isolation, existing history preservation, local review/reset, mobile width; zero HTTP requests.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
