import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch(process.env.BCT_CHROMIUM_PATH?{executablePath:process.env.BCT_CHROMIUM_PATH,args:['--no-sandbox']}:{});
const base=process.env.BCT_URL||'http://localhost:8765';
assert.ok(!base.includes('bct-portal.vercel.app'),'Live testing is prohibited');
const failures=[];let checks=0;
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 // This suite never contacts authentication, databases, email, or other remote services.
 await context.route('https://**/*',route=>route.abort());
 const page=await context.newPage();page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'load'});
 const completeness=await page.evaluate(()=>{
  const missing=[];const identical={es:['No'],fr:['Messages','Commercial','Vacant','5 — Budget'],ht:[],pt:['Drywall'],vi:['Email'],zh:[],ar:[],ru:[]};
  for(const language of Object.keys(identical)){
   for(const id of ['view-customer','view-apply','view-status','view-estimator','view-password-request','view-password-reset']){
    const root=document.getElementById(id);const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while(n=walk.nextNode()){
     if(n.parentElement.closest('script,style,textarea,[data-bct-profession-questions]'))continue;
     const text=n.nodeValue.trim();if(!/[A-Za-z]{2}/.test(text)||/^\$|^[A-Za-z ]+ \([A-Z]{2}\)$|^BCT Renovations|^myproject@|^317|^9465/.test(text))continue;
     const key=n.parentElement.dataset.i18n;const translated=key?bctLocalKeyText(key,language):bctTranslateKnownText(text,language);
     if((translated===text||translated===key)&&!identical[language].includes(text))missing.push(language+': '+text);
    }
   }
  }
  return [...new Set(missing)];
 });
 assert.deepEqual(completeness,[],'Missing local portal copy');checks+=8;
 for(const language of ['es','fr','ht','pt','vi','zh','ar','ru','en','es','ar','en']){
  console.log('switching',language);
  await page.evaluate(()=>window.bctReturnToPublicLanding());
  await page.locator('#bctLoginLanguage').selectOption(language);
  await page.waitForTimeout(150);
  assert.equal(await page.locator('html').getAttribute('lang'),language);
  assert.equal(await page.locator('html').getAttribute('dir'),language==='ar'?'rtl':'ltr');checks+=2;
  const gallery=await page.locator('#bctHomeGalleryGrid figcaption').allTextContents();
  assert.ok(gallery.length>=4,'fallback gallery renders');
  if(language==='en'){assert.ok(gallery.some(t=>t.includes('BCT home improvement work')));}else{assert.ok(!gallery.some(t=>t.includes('BCT home improvement work')||t.includes('Verified contractor process')),'gallery captions translate');}
  checks+=2;
  for(const [role,view] of [['client','customer'],['contractor','status'],['estimator','estimator']]){
   console.log('enter',language,role);
   await page.evaluate(()=>window.bctReturnToPublicLanding());
   await page.locator(`[data-entry-login="${role}"]`).click();
   await page.waitForTimeout(120);
   assert.ok(await page.locator('#view-'+view).isVisible(),role+' entry');checks++;
   if(role==='client'){
    await page.locator('#bctHomeLoginBtn').click();await page.waitForTimeout(100);
    const status=await page.locator('#bctHomeAuthStatus').innerText();
    assert.ok(status.trim(),'empty client sign-in validation');
    if(language!=='en')assert.ok(!status.includes('Enter your email and password.'),'client validation translates');checks++;
    await page.locator('#bctHomeSignupBtn').click();await page.waitForTimeout(100);
    assert.ok(await page.locator('#custFirst').isVisible());
    await page.locator('#custPassword').fill('abcdefg');await page.waitForTimeout(30);
    await page.locator('#custPassword').fill('abcdef7');await page.waitForTimeout(30);
    await page.locator('#custPassword').fill('abcdef7!');await page.locator('#custPassword2').fill('different7!');await page.waitForTimeout(30);
    await page.locator('#custPassword2').fill('abcdef7!');await page.waitForTimeout(30);checks+=2;
   }
   if(role==='contractor'){
    for(const profession of ['electrical','plumbing','drywall','concrete_masonry']){
     await page.evaluate(code=>{window.BCTContractorNetwork.setActiveRole(code)},profession);await page.waitForTimeout(40);checks++;
    }
   }
   if(role==='estimator'){
    await page.locator('#bctEstimatorSignIn').click();await page.waitForTimeout(100);
    const status=await page.locator('#bctEstimatorStatus').innerText();
    assert.ok(status.trim(),'empty estimator sign-in validation');
    if(language!=='en')assert.ok(!status.includes('Enter estimator email and password.'),'estimator validation translates');checks++;
    await page.locator('#bctEstimatorApplyOpen').click();
    assert.ok(await page.locator('#bctEstimatorApplication').isVisible());
    for(const panel of ['assignments','assessment','account','signin']){await page.locator(`[data-estimator-page="${panel}"]`).click();assert.ok(await page.locator(`[data-estimator-panel="${panel}"]`).isVisible());checks++;}
   }
  }
  const issues=await page.evaluate(language=>{
   const issues=[];
   for(const id of ['view-customer','view-apply','view-status','view-estimator','view-password-request','view-password-reset']){
    const root=document.getElementById(id);if(!root)continue;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){
     if(n.parentElement.closest('script,style,textarea,select,[data-i18n],[data-bct-profession-questions]'))continue;
     const text=n.nodeValue.trim();if(!text)continue;
     const expected=bctTranslateKnownText(text,language);
     if(text!==expected)issues.push(id+': '+text+' => '+expected);
    }
    root.querySelectorAll('[data-i18n]').forEach(el=>{if(el.children.length)return;if(el.dataset.i18n==='homeowner.back_home'&&language==='ar'){if(/[A-Za-z]/.test(el.textContent))issues.push('Arabic back button retains English');return;}const expected=bctLocalKeyText(el.dataset.i18n,language);if(el.textContent.replace(/^←\s*/,'')!==expected.replace(/^←\s*/,''))issues.push(el.dataset.i18n+': '+el.textContent+' => '+expected)});
    root.querySelectorAll('[data-bct-role-title]').forEach(el=>{const expected=bctTranslateKnownText(el.dataset.bctRoleTitle,language);if(el.dataset.bctRoleTitle!==expected)issues.push('visible profession title: '+el.dataset.bctRoleTitle+' => '+expected)});
    root.querySelectorAll('[placeholder]').forEach(el=>{const expected=bctTranslateKnownText(el.placeholder,language);if(el.placeholder!==expected)issues.push('placeholder '+el.id+': '+el.placeholder+' => '+expected)});
   }
   return [...new Set(issues)];
  },language);
  if(issues.length)failures.push({language,issues});
  console.log(language+': '+issues.length+' inconsistent labels',JSON.stringify(issues));checks++;
 }
 const knownDeferred=errors.filter(e=>e==='runAi is not defined');
 console.log('Deferred pre-existing admin initialization errors: '+knownDeferred.length);
 assert.deepEqual(errors.filter(e=>e!=='runAi is not defined'),[],'New JavaScript errors');
 assert.deepEqual(failures,[],'Language inconsistencies');
 console.log('PASS '+checks+' browser checks; all nine languages, client signup/password states, estimator navigation, repeat switching; backend excluded.');
 await context.close();
}finally{await browser.close()}
