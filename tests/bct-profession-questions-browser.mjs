import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const server=createServer(async(req,res)=>{try{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch(process.env.BCT_CHROMIUM_PATH?{executablePath:process.env.BCT_CHROMIUM_PATH,args:['--no-sandbox']}:{});
let checks=0;
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(6000);
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 await page.goto(base);await page.locator('[data-entry-login="contractor"]').click();
 await page.locator('[data-bct-worker-role="electrical"]').click();await page.locator('#bctContractorSignupBtn').click();
 const eGroup=page.locator('[data-profession="electrical"]'),pGroup=page.locator('[data-profession="plumbing"]');
 await page.locator('[name=legalName]').fill('Sample Applicant');await page.locator('[name=businessName]').fill('Sample Crew');await page.locator('#applicationForm [name=phone]').fill('3175550100');await page.locator('#applicationForm [name=email]').fill('sample@example.test');await page.locator('[name=contractorPassword]').fill('Sample7!');await page.locator('[name=contractorPassword2]').fill('Sample7!');await page.locator('#applicationForm [data-bct-next]').click();
 await eGroup.waitFor({state:'visible'});assert.ok(await eGroup.isVisible());assert.ok(!await pGroup.isVisible());checks+=2;
 for(const key of ['license','scope','safety','permits','training','diagnostics','example'])await page.locator(`#bctProfession-electrical-${key}`).fill(`Electrical sample ${key}`);
 await page.evaluate(()=>document.querySelector('[name=history2]').value='Original work history');
 // Direct trade changes and selected secondary categories both control questionnaires.
 await page.locator('#applicationForm [name="trade"]').selectOption('plumbing');
 await page.evaluate(()=>{const e=document.querySelector('[name=contractorNetworkRole][value=electrical]');e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}));});
 assert.ok(await pGroup.isVisible());assert.ok(!await eGroup.isVisible());checks+=2;
 const missing=await page.evaluate(()=>{try{BCTProfessionQuestions.read(document.getElementById('applicationForm'));return '';}catch(e){return e.message;}});
 assert.match(missing,/Answer each selected profession/);checks++;
 for(const key of ['license','scope','diagnostics','permits','training','isolation','example'])await page.locator(`#bctProfession-plumbing-${key}`).fill(`Plumbing sample ${key}`);
 await page.evaluate(()=>{const e=document.querySelector('[name=contractorNetworkRole][value=electrical]');e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));});assert.ok(await eGroup.isVisible());checks++;
 const headings={en:'Profession-specific questions',es:'Preguntas específicas de la profesión',fr:'Questions propres au métier',ht:'Kesyon espesifik pou metye a',pt:'Perguntas específicas da profissão',vi:'Câu hỏi riêng cho từng nghề',zh:'专业申请问题',ar:'أسئلة خاصة بالمهنة',ru:'Вопросы по специальности'};
 for(const [lang,heading] of Object.entries(headings)){
  await page.locator('#bctLoginLanguage').selectOption(lang,{force:true});
  await page.waitForFunction(expected=>document.querySelector('#bctProfessionQuestions h3').textContent===expected,heading);
  assert.equal(await page.locator('#bctProfessionQuestions h3').textContent(),heading);
  assert.equal(await eGroup.locator('label').count(),7);assert.equal(await pGroup.locator('label').count(),7);
  const labels=await page.locator('#bctProfessionQuestions label').allTextContents();
  assert.ok(labels.every(label=>label.trim()));if(lang!=='en')assert.ok(labels.every(label=>!label.startsWith('Describe your')&&!label.startsWith('Which ')&&!label.startsWith('Electrical license')));
  assert.equal(await page.locator('#bctProfession-electrical-scope').inputValue(),'Electrical sample scope');
  assert.equal(await page.locator('#bctProfession-plumbing-scope').inputValue(),'Plumbing sample scope');
  assert.equal(await page.locator('#bctProfessionQuestions').getAttribute('dir'),lang==='ar'?'rtl':'ltr');
  const payload=await page.evaluate(()=>BCTProfessionQuestions.history(document.getElementById('applicationForm')));
  assert.ok(payload.startsWith('Original work history\n\n'));const answers=JSON.parse(payload.split('BCT profession questionnaire v1\n\n')[1]);
  assert.equal(answers.answers.electrical.scope,'Electrical sample scope');assert.equal(answers.answers.plumbing.scope,'Plumbing sample scope');assert.ok(!('isolation' in answers.answers.electrical));assert.ok(!('safety' in answers.answers.plumbing));
  console.log('PASS',lang,'fourteen translated questions, answer retention, isolated answers, payload');checks+=12;
 }
 await page.evaluate(()=>{const e=document.querySelector('[name=contractorNetworkRole][value=electrical]');e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}));});
 const single=await page.evaluate(()=>BCTProfessionQuestions.read(document.getElementById('applicationForm')));assert.deepEqual(Object.keys(single.answers),['plumbing']);checks++;
 await page.locator('#bctProfession-plumbing-scope').fill('   ');
 const blank=await page.evaluate(()=>{try{BCTProfessionQuestions.read(document.getElementById('applicationForm'));return '';}catch(e){return e.message;}});assert.ok(blank);assert.ok(!blank.includes('Answer each'));checks++;
 await page.locator('#applicationForm [name="trade"]').selectOption('');assert.ok(!await page.locator('#bctProfessionQuestions').isVisible());
 assert.equal(await page.evaluate(()=>BCTProfessionQuestions.history(document.getElementById('applicationForm'))),'Original work history');checks+=2;
 await page.evaluate(()=>document.getElementById('applicationForm').reset());
 assert.equal(await page.locator('#bctProfession-electrical-scope').inputValue(),'');assert.equal(await page.locator('#bctProfession-plumbing-scope').inputValue(),'');checks+=2;
 // Every other profession has its own questions; test all selected categories together.
 await page.evaluate(()=>{const f=document.getElementById('applicationForm');f.querySelectorAll('[name=contractorNetworkRole]').forEach(e=>e.checked=true);f.dispatchEvent(new Event('change',{bubbles:true}));});
 const roles=['general_contractor','electrical','plumbing','hvac','roofing','drywall','concrete_masonry','flooring','handyman_services','specialty_trade'];
 for(const role of roles){const group=page.locator(`[data-profession="${role}"]`);assert.ok(await group.isVisible());const inputs=await group.locator('textarea').all();assert.equal(inputs.length,['electrical','plumbing'].includes(role)?7:2);for(const input of inputs)await input.fill(`Sample ${role} response`);checks+=2;}
 await page.locator('#bctLoginLanguage').selectOption('en',{force:true});await page.waitForFunction(()=>document.documentElement.lang==='en');
 const english=await page.locator('#bctProfessionQuestions [data-profession-copy]').allTextContents();
 for(const [lang,heading] of Object.entries(headings)){
  await page.locator('#bctLoginLanguage').selectOption(lang,{force:true});await page.waitForFunction(expected=>document.querySelector('#bctProfessionQuestions h3').textContent===expected,heading);
  const labels=await page.locator('#bctProfessionQuestions [data-profession-copy]').allTextContents();assert.equal(labels.length,42);assert.ok(labels.every(t=>t.trim()&&!t.includes('undefined')));
  if(lang!=='en')assert.ok(labels.every((t,i)=>t!==english[i]),lang+' must translate every new label');
  const payload=await page.evaluate(()=>BCTProfessionQuestions.read(document.getElementById('applicationForm')));assert.equal(Object.keys(payload.answers).length,10);
  for(const role of roles)assert.ok(Object.values(payload.answers[role]).every(v=>v===`Sample ${role} response`));
  console.log('PASS',lang,'all 10 profession sections and 30 questions translated; payload retains answers');checks+=14;
 }
 await page.locator('#bctLoginLanguage').selectOption('en',{force:true});
 // Switching the primary trade shows its matching questionnaire with no stale answers submitted.
 for(const role of roles){await page.evaluate(()=>document.querySelectorAll('[name=contractorNetworkRole]').forEach(e=>e.checked=false));if(await page.locator(`#applicationForm [name="trade"] option[value="${role}"]`).count())await page.locator('#applicationForm [name="trade"]').selectOption(role);else await page.evaluate(r=>{const f=document.getElementById('applicationForm');f.elements.trade.value='';const checkbox=f.querySelector(`[name=contractorNetworkRole][value="${r}"]`);checkbox.checked=true;checkbox.dispatchEvent(new Event('change',{bubbles:true}));},role);assert.ok(await page.locator(`[data-profession="${role}"]`).isVisible());const payload=await page.evaluate(()=>BCTProfessionQuestions.read(document.getElementById('applicationForm')));assert.deepEqual(Object.keys(payload.answers),[role]);checks+=2;}
 console.log(`${checks} profession application checks passed. All external traffic blocked; no Admin or connected Supabase testing.`);
}finally{await browser.close();server.close();}
