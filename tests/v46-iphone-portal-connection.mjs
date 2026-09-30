import { webkit, devices } from 'playwright';
const base=process.env.BCT_URL;
if(!base) throw new Error('BCT_URL is required');
const browser=await webkit.launch();
const context=await browser.newContext({...devices['iPhone 13']});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));

async function tap(selector,label){
  const el=page.locator(selector); await el.waitFor({state:'visible',timeout:10000});
  const b=await el.boundingBox(); if(!b) throw new Error(label+': no box');
  const x=b.x+b.width/2,y=b.y+b.height/2;
  const top=await page.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y);return e?.id||e?.getAttribute?.('data-entry-login')||e?.className||e?.tagName},{x,y});
  console.log('TOUCH',label,top); await page.touchscreen.tap(x,y);
}
async function state(label){
  const s=await page.evaluate(()=>{
    const apply=document.getElementById('view-apply');
    const form=document.getElementById('applicationForm');
    const visible=[...document.querySelectorAll('.view')].filter(v=>getComputedStyle(v).display!=='none'&&!v.classList.contains('hidden')).map(v=>v.id);
    return {
      body:document.body.className,
      hash:location.hash,
      visible,
      applyClass:apply?.className,
      applyDisplay:apply?getComputedStyle(apply).display:null,
      applyVisibility:apply?getComputedStyle(apply).visibility:null,
      formDisplay:form?getComputedStyle(form).display:null,
      formVisible:!!form&&getComputedStyle(form).display!=='none'&&!!(form.offsetWidth||form.offsetHeight||form.getClientRects().length)
    };
  });
  console.log('STATE '+label,JSON.stringify(s));
  return s;
}

await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(1800);
await tap('[data-entry-login="contractor"]','contractor portal');
await page.waitForTimeout(2100);
await state('before signup');
await tap('#bctContractorSignupBtn','contractor signup');
for(const [label,ms] of [['0ms',0],['50ms',50],['250ms',200],['700ms',450],['1500ms',800]]){
  if(ms) await page.waitForTimeout(ms);
  await state(label);
}
console.log('PAGE ERRORS',JSON.stringify(errors));
await context.close(); await browser.close();
