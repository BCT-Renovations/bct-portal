import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const browser=await chromium.launch(process.env.BCT_CHROMIUM_PATH?{executablePath:process.env.BCT_CHROMIUM_PATH,args:['--no-sandbox']}:{});
let checks=0;
try{
 const page=await browser.newPage();await page.route('**/*',route=>route.abort());
 await page.setContent('<main id="intake"></main>');
 for(const file of ['bct-application-catalogue.js','bct-application-locales.js','bct-application-validation.js','bct-application-form.js'])await page.addScriptTag({path:fileURLToPath(new URL('../'+file,import.meta.url))});
 const ids=await page.evaluate(()=>BCTApprovedApplicationCatalogue.catalogue.map(p=>p.id));
 for(const id of ids){
  await page.evaluate(id=>{window.form=BCTApplicationForm.mount(document.querySelector('main'),id);},id);
  assert.equal(await page.locator('section > fieldset').count(),19);checks++;
  const credential=page.locator('[data-question="credentials"]');
  await credential.locator('input[type=radio][value="1"]').check();
  assert.ok(await credential.locator('[data-question="credentials.credential_documents"]').isVisible());checks++;
  await credential.locator('input[type=file]').setInputFiles({name:'license.pdf',mimeType:'application/pdf',buffer:Buffer.from('sample')});
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
  const result=await page.evaluate(()=>form.validate());assert.equal(result.submissionReady,false);assert.equal(result.privateUploadStatus,'not_verified');checks+=2;
  assert.ok(result.errors.some(e=>e.code==='description_required'));checks++;
  await page.evaluate(()=>form.destroy());assert.equal(await page.locator('section').count(),0);checks++;
 }
 const blocked=await page.evaluate(()=>{try{BCTApplicationForm.mount(document.querySelector('main'),'electrical',{language:'es'});return false;}catch(e){return e.code==='TRANSLATION_INCOMPLETE';}});
 assert.ok(blocked);checks++;
 console.log(checks+' structured-form browser checks passed across all ten professions. No connected upload/submission exercised.');
}finally{await browser.close();}
