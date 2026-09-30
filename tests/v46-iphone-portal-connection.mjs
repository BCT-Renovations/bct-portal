import { webkit, devices } from 'playwright';

const base=process.env.BCT_URL;
if(!base) throw new Error('BCT_URL is required');
const browser=await webkit.launch();
const iphone=devices['iPhone 13'];
const failures=[];

async function openLanding(page){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1800);
  if(!(await page.locator('#view-home').isVisible().catch(()=>false))) failures.push('landing: public home is not visible');
}

async function physicalTap(page,selector,label){
  const el=page.locator(selector);
  await el.waitFor({state:'visible',timeout:10000});
  const box=await el.boundingBox();
  if(!box) throw new Error(label+': no bounding box');
  const x=box.x+box.width/2, y=box.y+box.height/2;
  const hit=await page.evaluate(({selector,x,y})=>{
    const el=document.querySelector(selector), top=document.elementFromPoint(x,y), cs=el?getComputedStyle(el):null;
    return {ok:!!el&&(top===el||el.contains(top)),top:top?(top.id||top.getAttribute?.('data-entry-login')||top.className||top.tagName):null,pointerEvents:cs?.pointerEvents,disabled:el?.disabled||false};
  },{selector,x,y});
  console.log('TOUCH '+label,JSON.stringify(hit));
  if(!hit.ok) failures.push(label+': touch center is covered by '+hit.top);
  if(hit.disabled) failures.push(label+': control is disabled');
  await page.touchscreen.tap(x,y);
}

async function newPage({share=false,standalone=false}={}){
  const context=await browser.newContext({...iphone});
  const page=await context.newPage();
  if(share||standalone) await page.addInitScript(({share,standalone})=>{
    if(share) Object.defineProperty(navigator,'share',{configurable:true,value:async()=>true});
    if(standalone) Object.defineProperty(navigator,'standalone',{configurable:true,value:true});
  },{share,standalone});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  return {context,page,errors};
}

async function expectVisible(page,selector,label){if(!(await page.locator(selector).isVisible().catch(()=>false))) failures.push(label+': '+selector+' is not visible');}
async function expectHome(page,label){await page.waitForTimeout(500);if(!(await page.locator('#view-home').isVisible().catch(()=>false)))failures.push(label+': did not return to public home');}

async function enter(page,kind,view,target){
  await openLanding(page);
  await physicalTap(page,'[data-entry-login="'+kind+'"]',kind+' portal');
  await page.waitForTimeout(2100);
  await expectVisible(page,'#view-'+view,kind+' portal');
  await expectVisible(page,target,kind+' portal');
  if(await page.locator('#view-home').isVisible().catch(()=>false)) failures.push(kind+': public landing remained visible after entry');
}

async function verifyLanguage(){
  const {context,page,errors}=await newPage();
  await openLanding(page);
  const before=(await page.locator('[data-entry-login="client"]').textContent())?.trim();
  await page.locator('#bctLoginLanguage').selectOption('es');
  await page.waitForTimeout(500);
  const after=(await page.locator('[data-entry-login="client"]').textContent())?.trim();
  console.log('RESULT language',JSON.stringify({before,after,lang:await page.locator('html').getAttribute('lang')}));
  if(!after||after===before) failures.push('language: Spanish selection did not translate the landing controls');
  if((await page.locator('html').getAttribute('lang'))!=='es') failures.push('language: html lang did not change to es');
  if(errors.length) failures.push('language page errors: '+errors.join(' | '));
  await context.close();
}

async function verifyClient(){
  {
    const {context,page,errors}=await newPage();
    await enter(page,'client','customer','#bctHomeownerLoginCard');
    await expectVisible(page,'#bctHomeownerSignupCard','client signup card');
    await physicalTap(page,'#bctHomeSignupBtn','client Sign Up');
    await page.waitForTimeout(600);
    await expectVisible(page,'#custFirst','client signup form');
    if(!(await page.locator('body').getAttribute('class'))?.includes('bct-home-signup')) failures.push('client signup: signup state was not activated');
    await physicalTap(page,'#bctNewClientBackBtn','client signup Back');
    await page.waitForTimeout(700);
    await expectVisible(page,'#bctHomeownerLoginCard','client signup Back');
    await expectVisible(page,'#bctHomeownerSignupCard','client signup Back');
    if(errors.length) failures.push('client signup page errors: '+errors.join(' | '));
    await context.close();
  }
  {
    const {context,page,errors}=await newPage();
    await enter(page,'client','customer','#bctHomeLoginBtn');
    await physicalTap(page,'#bctHomeLoginBtn','client Sign In');
    await page.waitForTimeout(400);
    const status=(await page.locator('#bctHomeAuthStatus').textContent().catch(()=>''))?.trim();
    console.log('RESULT client signin validation',JSON.stringify({status}));
    if(!status) failures.push('client Sign In: empty-input validation did not respond');
    await physicalTap(page,'#bctHomeForgotBtn','client Forgot Password');
    await page.waitForTimeout(400);
    await expectVisible(page,'#view-password-request','client Forgot Password');
    await expectVisible(page,'#passwordRequestEmail','client Forgot Password');
    if(errors.length) failures.push('client signin page errors: '+errors.join(' | '));
    await context.close();
  }
  {
    const {context,page}=await newPage();
    await enter(page,'client','customer','#bctHomeBackHomeBtn');
    await physicalTap(page,'#bctHomeBackHomeBtn','client Back Home');
    await expectHome(page,'client Back Home');
    await context.close();
  }
}

async function verifyContractor(){
  {
    const {context,page,errors}=await newPage();
    await enter(page,'contractor','status','#bctContractorLoginCard');
    await expectVisible(page,'#bctContractorSignupCard','contractor signup card');
    await physicalTap(page,'#bctContractorSignupBtn','contractor Sign Up');
    await page.waitForTimeout(700);
    await expectVisible(page,'#view-apply','contractor application');
    await expectVisible(page,'#applicationForm','contractor application');
    if(errors.length) failures.push('contractor signup page errors: '+errors.join(' | '));
    await context.close();
  }
  {
    const {context,page,errors}=await newPage();
    await enter(page,'contractor','status','#bctContractorLoginBtn');
    await physicalTap(page,'#bctContractorLoginBtn','contractor Sign In');
    await page.waitForTimeout(400);
    const status=(await page.locator('#bctContractorAuthStatus').textContent().catch(()=>''))?.trim();
    console.log('RESULT contractor signin validation',JSON.stringify({status}));
    if(!status) failures.push('contractor Sign In: empty-input validation did not respond');
    await physicalTap(page,'#bctContractorForgotBtn','contractor Forgot Password');
    await page.waitForTimeout(400);
    await expectVisible(page,'#view-password-request','contractor Forgot Password');
    if(errors.length) failures.push('contractor signin page errors: '+errors.join(' | '));
    await context.close();
  }
  {
    const {context,page}=await newPage();
    await enter(page,'contractor','status','#bctContractorBackHomeBtn');
    await physicalTap(page,'#bctContractorBackHomeBtn','contractor Back Home');
    await expectHome(page,'contractor Back Home');
    await context.close();
  }
}

async function verifyAdmin(){
  {
    const {context,page,errors}=await newPage();
    await enter(page,'admin','admin-login','#adminLoginBtn');
    await page.locator('#adminPassword').fill('Example123!');
    await physicalTap(page,'#adminShowPassword','admin Show Password');
    await page.waitForTimeout(200);
    if((await page.locator('#adminPassword').getAttribute('type'))!=='text') failures.push('admin Show Password: password did not become visible');
    await page.locator('#adminPassword').fill('');
    await physicalTap(page,'#adminLoginBtn','admin Sign In');
    await page.waitForTimeout(400);
    const status=(await page.locator('#adminAuthStatus').textContent().catch(()=>''))?.trim();
    console.log('RESULT admin signin validation',JSON.stringify({status}));
    if(!status) failures.push('admin Sign In: empty-input validation did not respond');
    await physicalTap(page,'#adminForgotBtn','admin Forgot Password');
    await page.waitForTimeout(400);
    await expectVisible(page,'#view-password-request','admin Forgot Password');
    if(errors.length) failures.push('admin page errors: '+errors.join(' | '));
    await context.close();
  }
  {
    const {context,page}=await newPage();
    await enter(page,'admin','admin-login','#adminBackBtn');
    await physicalTap(page,'#adminBackBtn','admin Back Home');
    await expectHome(page,'admin Back Home');
    await context.close();
  }
}

async function verifyShare(){
  const {context,page,errors}=await newPage({share:true});
  await openLanding(page);
  await physicalTap(page,'#bctShareAppBtn','Share App');
  await page.waitForTimeout(400);
  const status=(await page.locator('#bctShareAppStatus').textContent().catch(()=>''))?.trim();
  console.log('RESULT share',JSON.stringify({status}));
  if(!status) failures.push('Share App: no success/status response');
  if(errors.length) failures.push('share page errors: '+errors.join(' | '));
  await context.close();
}

async function verifyRefreshAndStandalone(){
  const {context,page,errors}=await newPage({standalone:true});
  await enter(page,'client','customer','#bctHomeownerLoginCard');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1800);
  const hash=new URL(page.url()).hash;
  console.log('RESULT refresh',JSON.stringify({hash,home:await page.locator('#view-home').isVisible().catch(()=>false),customer:await page.locator('#view-customer').isVisible().catch(()=>false)}));
  if(hash==='#customer' && !(await page.locator('#view-customer').isVisible().catch(()=>false))) failures.push('refresh: #customer URL did not reopen the Client portal');
  if(errors.length) failures.push('standalone/refresh page errors: '+errors.join(' | '));
  await context.close();
}

await verifyLanguage();
await verifyClient();
await verifyContractor();
await verifyAdmin();
await verifyShare();
await verifyRefreshAndStandalone();

await browser.close();
if(failures.length){console.error('iPhone/WebKit control failures:\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 iPhone/WebKit expanded control verification passed.');
