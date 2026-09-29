import { webkit, devices } from 'playwright';

const base=process.env.BCT_URL;
if(!base) throw new Error('BCT_URL is required');
const browser=await webkit.launch();
const iphone=devices['iPhone 13'];
const failures=[];

async function verify(kind, expectedView, expectedSelector){
  const context=await browser.newContext({...iphone});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  const link=page.locator('[data-entry-login="'+kind+'"]');
  await link.waitFor({state:'visible',timeout:10000});
  const box=await link.boundingBox();
  if(!box) failures.push(kind+': control has no tappable bounding box');
  const hit=await page.evaluate((sel)=>{
    const el=document.querySelector(sel); if(!el)return {ok:false,reason:'missing'};
    const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    const top=document.elementFromPoint(x,y);
    return {ok:top===el||el.contains(top),top:top?.id||top?.getAttribute?.('data-entry-login')||top?.tagName||null,x,y,w:r.width,h:r.height};
  },'[data-entry-login="'+kind+'"]');
  if(!hit.ok) failures.push(kind+': touch center is covered by '+hit.top);
  await link.tap({timeout:10000});
  await page.waitForTimeout(2300);
  const view=page.locator('#view-'+expectedView);
  const target=page.locator(expectedSelector);
  const viewVisible=await view.isVisible().catch(()=>false);
  const targetVisible=await target.isVisible().catch(()=>false);
  const homeVisible=await page.locator('#view-home').isVisible().catch(()=>false);
  if(!viewVisible) failures.push(kind+': expected #view-'+expectedView+' to be visible');
  if(!targetVisible) failures.push(kind+': expected '+expectedSelector+' to be visible');
  if(homeVisible) failures.push(kind+': public landing remained visible after portal entry');
  if(pageErrors.length) failures.push(kind+': page errors: '+pageErrors.join(' | '));
  await page.goBack({waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(500);
  if(!(await page.locator('#view-home').isVisible().catch(()=>false))) failures.push(kind+': browser Back did not restore public landing');
  await context.close();
}

await verify('client','customer','#bctHomeownerLoginCard');
await verify('contractor','status','#bctContractorLoginCard');
await verify('admin','admin-login','#adminLoginBtn');

await browser.close();
if(failures.length){
  console.error('iPhone/WebKit portal connection failures:\n- '+failures.join('\n- '));
  process.exit(1);
}
console.log('BCT V46 iPhone/WebKit portal connection: Client, Contractor, Admin and Back navigation passed.');
