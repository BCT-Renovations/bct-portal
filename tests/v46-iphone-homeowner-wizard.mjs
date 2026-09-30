import { webkit, devices } from 'playwright';

const base=process.env.BCT_URL;
if(!base) throw new Error('BCT_URL is required');
const browser=await webkit.launch();
const iphone=devices['iPhone 13'];
const failures=[];

async function makePage(){
  const context=await browser.newContext({...iphone});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1800);
  return {context,page,errors};
}

async function physicalTap(page,selector,label){
  const el=page.locator(selector);
  await el.waitFor({state:'visible',timeout:10000});
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const box=await el.boundingBox();
  if(!box) throw new Error(label+': no bounding box');
  const x=box.x+box.width/2,y=box.y+box.height/2;
  const hit=await page.evaluate(({selector,x,y})=>{
    const el=document.querySelector(selector),top=document.elementFromPoint(x,y);
    return {ok:!!el&&(top===el||el.contains(top)),disabled:!!el?.disabled,top:top?(top.id||top.getAttribute?.('data-bct-next')||top.getAttribute?.('data-bct-back')||top.tagName):null};
  },{selector,x,y});
  if(!hit.ok) failures.push(label+': touch center covered by '+hit.top);
  if(hit.disabled) failures.push(label+': unexpectedly disabled');
  await page.touchscreen.tap(x,y);
}

async function openSignup(page){
  await physicalTap(page,'[data-entry-login="client"]','client portal');
  await page.waitForTimeout(900);
  await physicalTap(page,'#bctHomeSignupBtn','client Sign Up');
  await page.waitForTimeout(700);
  if(!(await page.locator('#customerProjectForm').isVisible().catch(()=>false))) failures.push('wizard: customer form not visible');
  if(!(await page.locator('#bctClientBackHomeTop').isVisible().catch(()=>false))) failures.push('wizard: Back to Home not visible');
}

async function progressText(page){return ((await page.locator('#customerProjectForm .bct-step-progress').textContent().catch(()=>''))||'').trim();}

async function fillVisibleRequired(page){
  const fields=page.locator('#customerProjectForm .bct-form-step.bct-step-active input:visible, #customerProjectForm .bct-form-step.bct-step-active select:visible, #customerProjectForm .bct-form-step.bct-step-active textarea:visible');
  const count=await fields.count();
  for(let i=0;i<count;i++){
    const f=fields.nth(i);
    if(!(await f.getAttribute('required'))) continue;
    const tag=await f.evaluate(el=>el.tagName.toLowerCase());
    const type=((await f.getAttribute('type'))||'text').toLowerCase();
    if(tag==='select'){
      const value=await f.locator('option').evaluateAll(opts=>(opts.find(o=>o.value)||{}).value||'');
      if(value) await f.selectOption(value);
    }else if(type==='checkbox'||type==='radio'){
      await f.check({force:true}).catch(()=>{});
    }else if(type==='email') await f.fill('wizard-test@example.com');
    else if(type==='tel') await f.fill('3175550101');
    else if(type==='number') await f.fill('1');
    else if(type==='date') await f.fill('2026-10-15');
    else if(type==='password') await f.fill('Wizard123!');
    else if(type==='url') await f.fill('https://example.com');
    else await f.fill('Test');
  }
}

async function verifyEnglishWizard(){
  const {context,page,errors}=await makePage();
  await openSignup(page);
  let progress=await progressText(page);
  console.log('WIZARD english start',JSON.stringify({progress}));
  if(!/Step\s*1\s*(?:of|\/)\s*7/i.test(progress)) failures.push('wizard: expected Step 1 of 7, got '+progress);
  if(!(await page.locator('#customerProjectForm [data-bct-back]').isDisabled().catch(()=>false))) failures.push('wizard: Back should be disabled on Step 1');

  await physicalTap(page,'#customerProjectForm [data-bct-next]','wizard Continue empty');
  await page.waitForTimeout(300);
  progress=await progressText(page);
  if(!/Step\s*1\s*(?:of|\/)\s*7/i.test(progress)) failures.push('wizard: empty required fields should keep Step 1, got '+progress);

  await fillVisibleRequired(page);
  await physicalTap(page,'#customerProjectForm [data-bct-next]','wizard Continue filled');
  await page.waitForTimeout(500);
  progress=await progressText(page);
  if(!/Step\s*2\s*(?:of|\/)\s*7/i.test(progress)) failures.push('wizard: Continue did not advance to Step 2, got '+progress);

  await physicalTap(page,'#customerProjectForm [data-bct-back]','wizard Back');
  await page.waitForTimeout(400);
  progress=await progressText(page);
  if(!/Step\s*1\s*(?:of|\/)\s*7/i.test(progress)) failures.push('wizard: Back did not return to Step 1, got '+progress);

  await physicalTap(page,'#bctClientBackHomeTop','wizard Back to Home');
  await page.waitForTimeout(500);
  if(!(await page.locator('#view-home').isVisible().catch(()=>false))) failures.push('wizard: Back to Home did not return to public landing');
  if(errors.length) failures.push('wizard English page errors: '+errors.join(' | '));
  await context.close();
}

async function verifySpanishWizard(){
  const {context,page,errors}=await makePage();
  await page.locator('#bctLoginLanguage').selectOption('es');
  await page.waitForTimeout(400);
  await openSignup(page);
  const progress=await progressText(page);
  const back=((await page.locator('#customerProjectForm [data-bct-back]').textContent())||'').trim();
  const next=((await page.locator('#customerProjectForm [data-bct-next]').textContent())||'').trim();
  const home=((await page.locator('#bctClientBackHomeTop').textContent())||'').trim();
  console.log('WIZARD spanish',JSON.stringify({progress,back,next,home}));
  if(!/Paso\s*1\s*(?:de|\/)\s*7/i.test(progress)) failures.push('wizard Spanish: step progress not translated: '+progress);
  if(!/Atrás|Volver/i.test(back)) failures.push('wizard Spanish: Back not translated: '+back);
  if(!/Continuar/i.test(next)) failures.push('wizard Spanish: Continue not translated: '+next);
  if(!/Volver al inicio/i.test(home)) failures.push('wizard Spanish: Back to Home not translated: '+home);
  if(errors.length) failures.push('wizard Spanish page errors: '+errors.join(' | '));
  await context.close();
}

await verifyEnglishWizard();
await verifySpanishWizard();
await browser.close();
if(failures.length){console.error('iPhone homeowner wizard failures:\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 iPhone homeowner 7-step wizard verification passed without submitting data.');
