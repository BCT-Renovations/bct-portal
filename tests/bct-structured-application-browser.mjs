import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const browser=await chromium.launch(process.env.BCT_CHROMIUM_PATH?{executablePath:process.env.BCT_CHROMIUM_PATH,args:['--no-sandbox']}:{});
let checks=0;
try{
 const page=await browser.newPage();await page.route('**/*',route=>route.abort());
 await page.setContent('<main id="intake"></main>');
 for(const file of ['bct-application-catalogue.js','bct-application-translation-rows.js','bct-application-locales.js','bct-application-validation.js','bct-application-form.js'])await page.addScriptTag({path:fileURLToPath(new URL('../'+file,import.meta.url))});
 const ids=await page.evaluate(()=>BCTApprovedApplicationCatalogue.catalogue.map(p=>p.id));
 for(const id of ids){
  await page.evaluate(id=>{window.form=BCTApplicationForm.mount(document.querySelector('main'),id);},id);
  assert.equal(await page.locator('section > fieldset').count(),19);checks++;
  if(id==='estimator'){assert.ok((await page.locator('[data-question="diagnostics"] > p').textContent()).includes('engineering'));assert.ok((await page.locator('[data-question="bct_procedures"] > p').textContent()).includes('BCT approves final pricing'));checks+=2;}
  const credential=page.locator('[data-question="credentials"]');
  await credential.locator('input[type=radio][value="1"]').check();
  assert.ok(await credential.locator('[data-question="credentials.credential_documents"]').isVisible());checks++;
  await credential.locator('input[type=file]').setInputFiles({name:'license.pdf',mimeType:'application/pdf',buffer:Buffer.from('sample')});
  await credential.locator('[data-question="credentials.credential_details"] textarea').fill('License retained for language changes');
  assert.equal(await page.evaluate(()=>form.read().answers.credentials.followups.credential_documents.value[0].name),'license.pdf');checks++;
  await credential.locator('input[type=radio][value="3"]').check();
  assert.ok(await credential.locator('[data-question="credentials.credential_documents"]').isHidden());checks++;
  assert.equal(await page.evaluate(()=>Object.hasOwn(form.read().answers.credentials.followups,'credential_documents')),false);checks++;
  await credential.locator('input[type=radio][value="4"]').check();
  assert.ok(await credential.locator('[data-question="credentials.credential_supervision"]').isVisible());checks++;
  await page.locator('[data-question=portfolio] > div input[value="1"]').check();
  await page.locator('[data-category=work_photo]').setInputFiles([{name:'work.png',mimeType:'image/png',buffer:Buffer.from('sample')}]);
  const photo=await page.evaluate(()=>form.read().answers.portfolio.followups.work_portfolio.value.photos[0]);
  assert.equal(photo.file.name,'work.png');checks++;
  const photoRow=page.locator('[data-question="portfolio.work_portfolio"] fieldset').first();
  await photoRow.locator('textarea').fill('Existing project description');
  await photoRow.locator('input[type=text]').first().fill('Personally repaired');
  await page.locator('[data-category=work_photo]').setInputFiles([{name:'second.png',mimeType:'image/png',buffer:Buffer.from('second')}]);
  const retained=await page.evaluate(()=>form.read().answers.portfolio.followups.work_portfolio.value.photos);
  assert.equal(retained[0].description,'Existing project description');assert.equal(retained[0].role,'Personally repaired');assert.equal(retained[1].description,'');checks+=3;
  assert.equal(retained.length,2);checks++;
  const before=await page.evaluate(()=>form.read());
  await page.evaluate(()=>{window.form=form.setLanguage('en');});
  assert.deepEqual(await page.evaluate(()=>form.read()),before);checks++;
  assert.equal(await page.evaluate(()=>form.files().find(item=>item.path==='portfolio.work_portfolio').files.length),2);checks++;
  assert.equal(await page.evaluate(async()=>form.files().find(item=>item.path==='portfolio.work_portfolio').files[0].text()),'sample');checks++;
  assert.equal(await page.evaluate(()=>form.files().some(item=>item.path==='credentials.credential_documents')),false);checks++;
  await page.locator('[data-question="credentials"] input[value="1"]').check();
  assert.equal(await page.locator('[data-question="credentials.credential_details"] textarea').inputValue(),'License retained for language changes');checks++;
  assert.equal(await page.evaluate(async()=>form.files().find(item=>item.path==='credentials.credential_documents').files[0].text()),'sample');checks++;
  await page.locator('[data-question="credentials"] input[value="4"]').check();
  await page.locator('[data-question="portfolio.work_portfolio"] button').first().click();
  assert.equal(await page.evaluate(()=>form.read().answers.portfolio.followups.work_portfolio.value.photos.length),1);checks++;
  assert.equal(await page.evaluate(()=>form.read().answers.portfolio.followups.work_portfolio.value.photos[0].file.name),'second.png');checks++;
  const unchanged=await page.evaluate(()=>form.read());
  assert.equal(await page.evaluate(()=>{try{form.setLanguage('unknown');return false;}catch(e){return e.code==='TRANSLATION_INCOMPLETE';}}),true);checks++;
  assert.deepEqual(await page.evaluate(()=>form.read()),unchanged);checks++;
  const selected=await page.evaluate(()=>form.snapshot());assert.ok(selected.files.some(item=>item.path==='portfolio.work_portfolio'));checks++;
  const result=await page.evaluate(()=>form.validate());assert.equal(result.submissionReady,false);assert.equal(result.privateUploadStatus,'not_verified');checks+=2;
  assert.ok(result.errors.some(e=>e.code==='description_required'));checks++;
  await page.evaluate(()=>form.destroy());assert.equal(await page.locator('section').count(),0);checks++;
 }
 const blocked=await page.evaluate(()=>{try{BCTApplicationForm.mount(document.querySelector('main'),'flooring',{language:'es'});return false;}catch(e){return e.code==='TRANSLATION_INCOMPLETE';}});
 assert.ok(blocked);checks++;
 for(const profession of ['electrical','plumbing','general_contractor','hvac']){
 await page.evaluate(profession=>{window.form=BCTApplicationForm.mount(document.querySelector('main'),profession);},profession);
 await page.locator('[data-question=experience] input[value="3"]').check();
 await page.locator('[data-question=portfolio] > div input[value="1"]').check();
 await page.locator('[data-category=work_photo]').setInputFiles([{name:'retained.jpg',mimeType:'image/jpeg',buffer:Buffer.from('retained image bytes')}]);
 await page.locator('[data-question="portfolio.work_portfolio"] textarea').fill('Retain this description');
 for(const lang of ['en','es','fr','ht','pt','vi','zh','ar','ru']){
  await page.evaluate(lang=>{window.form=form.setLanguage(lang);},lang);
  assert.equal(await page.locator('section').getAttribute('lang'),lang);assert.equal(await page.locator('section').getAttribute('dir'),lang==='ar'?'rtl':'ltr');checks+=2;
  const headings=await page.locator('section > fieldset > legend').allTextContents();assert.equal(headings.length,19);checks++;
  if(lang!=='en'){assert.ok(headings.every(text=>!/^\d+\. (How |What |Do |Which |Are |Can |Will )/.test(text)));checks++;}
  assert.equal(await page.locator('[data-question=experience] input[value="3"]').isChecked(),true);checks++;
  assert.equal(await page.locator('[data-question="portfolio.work_portfolio"] textarea').inputValue(),'Retain this description');checks++;
  assert.equal(await page.evaluate(async()=>form.files().find(item=>item.path==='portfolio.work_portfolio').files[0].text()),'retained image bytes');checks++;
  const validation=await page.evaluate(()=>form.validate());assert.equal(validation.valid,false);checks++;
  const message=await page.evaluate(lang=>BCTApplicationLocales.errorMessage(lang,'personal_role_required'),lang);
  assert.ok((await page.locator('section > ul').textContent()).includes(message));checks++;
  await page.locator('section > ul button').first().click();
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-invalid')),'true');checks++;
 }
 await page.evaluate(()=>form.destroy());
 }
 console.log(checks+' structured-form browser checks passed across all ten professions. No connected upload/submission exercised.');
}finally{await browser.close();}
