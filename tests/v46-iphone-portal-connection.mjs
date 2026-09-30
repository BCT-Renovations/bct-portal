import { webkit, devices } from 'playwright';

const base=process.env.BCT_URL;
if(!base) throw new Error('BCT_URL is required');
const browser=await webkit.launch();
const iphone=devices['iPhone 13'];
const failures=[];

async function openLanding(page){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(2500);
  const state=await page.evaluate(()=>({
    html:document.documentElement.className,
    body:document.body.className,
    homeDisplay:getComputedStyle(document.getElementById('view-home')).display,
    homeHidden:document.getElementById('view-home').classList.contains('hidden')
  }));
  console.log('LANDING STATE',JSON.stringify(state));
}

async function physicalTap(page,selector,label){
  const el=page.locator(selector);
  await el.waitFor({state:'visible',timeout:10000});
  const box=await el.boundingBox();
  if(!box) throw new Error(label+': no bounding box');
  const x=box.x+box.width/2, y=box.y+box.height/2;
  const hit=await page.evaluate(({selector,x,y})=>{
    const el=document.querySelector(selector);
    const top=document.elementFromPoint(x,y);
    const cs=el?getComputedStyle(el):null;
    return {
      ok:!!el && (top===el || el.contains(top)),
      top:top ? (top.id || top.getAttribute?.('data-entry-login') || top.className || top.tagName) : null,
      display:cs?.display,visibility:cs?.visibility,opacity:cs?.opacity,pointerEvents:cs?.pointerEvents,
      disabled:el?.disabled||false,
      rect:el?{x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}:null,
      body:document.body.className,
      html:document.documentElement.className
    };
  },{selector,x,y});
  console.log('TOUCH '+label,JSON.stringify(hit));
  if(!hit.ok) failures.push(label+': touch center is covered by '+hit.top);
  await page.touchscreen.tap(x,y);
}

async function verifyPortal(kind, expectedView, expectedSelector){
  const context=await browser.newContext({...iphone});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await openLanding(page);
  const selector='[data-entry-login="'+kind+'"]';
  await physicalTap(page,selector,kind);
  await page.waitForTimeout(2500);
  const viewVisible=await page.locator('#view-'+expectedView).isVisible().catch(()=>false);
  const targetVisible=await page.locator(expectedSelector).isVisible().catch(()=>false);
  const homeVisible=await page.locator('#view-home').isVisible().catch(()=>false);
  console.log('RESULT '+kind,JSON.stringify({viewVisible,targetVisible,homeVisible,url:page.url(),body:await page.locator('body').getAttribute('class')}));
  if(!viewVisible) failures.push(kind+': expected #view-'+expectedView+' to be visible');
  if(!targetVisible) failures.push(kind+': expected '+expectedSelector+' to be visible');
  if(homeVisible) failures.push(kind+': public landing remained visible after touch');
  if(pageErrors.length) failures.push(kind+': page errors: '+pageErrors.join(' | '));
  await context.close();
}

async function verifyShare(){
  const context=await browser.newContext({...iphone});
  const page=await context.newPage();
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:async()=>true});
  });
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await openLanding(page);
  await physicalTap(page,'#bctShareAppBtn','share');
  await page.waitForTimeout(500);
  const status=(await page.locator('#bctShareAppStatus').textContent().catch(()=>''))?.trim();
  console.log('RESULT share',JSON.stringify({status}));
  if(!status) failures.push('share: Share App did not produce a success/status response');
  if(pageErrors.length) failures.push('share: page errors: '+pageErrors.join(' | '));
  await context.close();
}

await verifyPortal('client','customer','#bctHomeownerLoginCard');
await verifyPortal('contractor','status','#bctContractorLoginCard');
await verifyPortal('admin','admin-login','#adminLoginBtn');
await verifyShare();

await browser.close();
if(failures.length){
  console.error('iPhone/WebKit portal connection failures:\n- '+failures.join('\n- '));
  process.exit(1);
}
console.log('BCT V46 iPhone/WebKit touch verification passed: Client, Contractor, Admin and Share App.');
