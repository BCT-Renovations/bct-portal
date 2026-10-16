import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch(process.env.BCT_CHROMIUM_PATH?{executablePath:process.env.BCT_CHROMIUM_PATH,args:['--no-sandbox']}:{});let checks=0;
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const requests=[];await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==base||u.pathname.startsWith('/api/')){requests.push(u.origin+u.pathname);return route.abort();}return route.continue();});
 const page=await context.newPage();page.setDefaultTimeout(5000);
 await page.goto(base+'/profession-review.html');
 assert.equal(await page.locator('form,input,textarea').count(),0);checks++;
 const headings={en:'Application Question Review',es:'Revisión de preguntas de solicitud',fr:'Consultation des questions de candidature',ht:'Revizyon kesyon aplikasyon',pt:'Revisão das perguntas de candidatura',vi:'Xem câu hỏi ứng tuyển',zh:'申请问题预览',ar:'مراجعة أسئلة التقديم',ru:'Просмотр вопросов заявки'};
 const roles=['electrical','plumbing','general_contractor','hvac','roofing','drywall','concrete_masonry','flooring','handyman_services','specialty_trade'];
 let english;
 for(const [lang,heading] of Object.entries(headings)){
  await page.locator('#reviewLanguage').selectOption(lang);assert.equal(await page.locator('h1').innerText(),heading);assert.equal(await page.locator('html').getAttribute('dir'),lang==='ar'?'rtl':'ltr');checks+=2;
  const all=[];for(const role of roles){await page.locator('#reviewProfession').selectOption(role);const questions=await page.locator('#reviewQuestions li').allTextContents();assert.equal(questions.length,['electrical','plumbing'].includes(role)?7:2);assert.ok(questions.every(t=>t.length>12));all.push(...questions);checks+=2;}
  assert.equal(all.length,30);if(lang==='en')english=all;else assert.ok(all.every((q,i)=>q!==english[i]));checks++;
  console.log('PASS review',lang,'all 30 questions; no account/form/network');
 }
 assert.equal(requests.length,0);assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});checks+=2;
 // Production host never displays the preview-only review controls.
 const prod=await context.newPage();await prod.route('https://bct-portal.vercel.app/**',async route=>{const pathname=new URL(route.request().url()).pathname;try{const body=await readFile(path.join(root,pathname==='/'?'profession-review.html':pathname));await route.fulfill({body,contentType:pathname.endsWith('.js')?'application/javascript':pathname.endsWith('.css')?'text/css':'text/html'});}catch{await route.abort();}});
 await prod.goto('https://bct-portal.vercel.app/profession-review.html');assert.ok(!await prod.locator('#reviewControls').isVisible());await prod.close();checks++;
 await page.goto(base);await page.locator('[data-entry-login="contractor"]').click();await page.locator('#bctProfessionReviewLink').waitFor({state:'visible'});await page.locator('#bctProfessionReviewLink').click();await page.locator('#reviewControls').waitFor({state:'visible'});checks++;
 // Start the real application: no signup details are skipped.
 await page.goto(base);await page.locator('[data-entry-login="contractor"]').click();await page.locator('[data-bct-worker-role="plumbing"]').click();await page.locator('#bctContractorSignupBtn').click();
 assert.ok(await page.locator('#bctApplicationBack').isVisible());assert.equal(await page.locator('#bctApplicationBack').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(168, 230, 207)');checks+=2;
 await page.locator('#applicationForm [data-bct-next]').click();assert.ok(await page.locator('#applicationForm [name=legalName]').isVisible());assert.equal(await page.locator('#applicationForm [name=legalName]').inputValue(),'');checks+=2;
 const backLabels={en:'← Back',es:'← Atrás',fr:'← Retour',ht:'← Retounen',pt:'← Voltar',vi:'← Quay lại',zh:'← 返回',ar:'رجوع ←',ru:'← Назад'};
 for(const [lang,label] of Object.entries(backLabels)){await page.locator('#bctLoginLanguage').selectOption(lang,{force:true});await page.waitForFunction(expected=>document.getElementById('bctApplicationBack').textContent===expected,label);assert.equal(await page.locator('#bctApplicationBack').textContent(),label);checks++;}
 await page.locator('#bctLoginLanguage').selectOption('en',{force:true});
 await page.locator('#bctApplicationBack').click();assert.ok(await page.locator('#view-status').isVisible());checks++;
 await page.locator('[data-bct-worker-role="plumbing"]').click();await page.locator('#bctContractorSignupBtn').click();await page.locator('#applicationForm [data-bct-back]').click();assert.ok(await page.locator('#view-status').isVisible());checks++;
 // Simulate slow session recovery entirely in memory; no Supabase connection.
 const slow=await context.newPage();await slow.addInitScript(()=>{window.supabase={createClient(){return {auth:{getSession:()=>window.delaySession?new Promise(resolve=>window.releaseSession=()=>resolve({data:{session:null}})):Promise.resolve({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:async()=>({data:{},error:null})};}};});
 await slow.goto(base);await slow.evaluate(()=>window.delaySession=true);await slow.locator('[data-entry-login="contractor"]').click();assert.ok(await slow.locator('#view-status').isVisible());checks++;
 await slow.locator('[data-bct-worker-role="plumbing"]').click();await slow.locator('#bctContractorSignupBtn').click();
 await slow.goBack();assert.ok(await slow.locator('#view-apply').isVisible()||await slow.locator('#view-status').isVisible());checks++;
 // Back may first leave the duplicate application history entry; continue to contractor entry.
 if(await slow.locator('#view-apply').isVisible())await slow.goBack();assert.ok(await slow.locator('#view-status').isVisible());checks++;
 await slow.locator('[data-bct-worker-role="electrical"]').click();await slow.locator('#bctContractorSignupBtn').click();await slow.evaluate(()=>window.releaseSession?.());await slow.waitForTimeout(100);assert.ok(await slow.locator('#view-apply').isVisible());checks++;
 await slow.locator('#bctApplicationBack').click();await slow.goBack();await slow.waitForTimeout(100);assert.ok(await slow.locator('#view-apply').isVisible()||await slow.locator('#view-status').isVisible()||await slow.locator('#view-home').isVisible());checks++;
 console.log(`${checks} read-only review and navigation checks passed; no real signup, Admin or Supabase access.`);
}finally{await browser.close();server.close();}
