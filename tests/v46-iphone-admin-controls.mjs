import { webkit, devices } from 'playwright';

const base=process.env.BCT_URL;
if(!base) throw new Error('BCT_URL is required');
const browser=await webkit.launch();
const context=await browser.newContext({...devices['iPhone 13']});
const page=await context.newPage();
const failures=[];
page.on('pageerror',e=>failures.push('pageerror: '+String(e)));

async function loadCurrentShell(){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1200);
  if(await page.evaluate(()=>('serviceWorker' in navigator))) {
    await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true).catch(()=>false));
    for(let i=0;i<6;i++){
      await page.reload({waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForTimeout(1200);
      const version=await page.evaluate(()=>window.BCT_ADMIN_MOBILE_FIX_VERSION||'');
      if(version.includes('2026.09.30-admin-mobile'))return;
      await page.waitForTimeout(2500);
    }
  }
  failures.push('current admin mobile patch did not load from the production shell');
}

async function forceAdminView(){
  await page.evaluate(()=>{
    document.body.classList.add('bct-authenticated','bct-portal-entered');
    document.body.classList.remove('bct-signed-out','bct-entry-client','bct-entry-contractor','bct-entry-admin');
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    const admin=document.getElementById('view-admin');
    admin?.classList.remove('hidden');
    admin?.removeAttribute('aria-hidden');
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(400);
}

async function tap(selector,label){
  const el=page.locator(selector).first();
  await el.waitFor({state:'visible',timeout:10000});
  const box=await el.boundingBox();
  if(!box){failures.push(label+': no bounding box');return;}
  const x=box.x+box.width/2,y=box.y+box.height/2;
  const hit=await page.evaluate(({selector,x,y})=>{
    const el=document.querySelector(selector),top=document.elementFromPoint(x,y),style=el?getComputedStyle(el):null;
    return {ok:!!el&&(top===el||el.contains(top)),top:top?(top.id||top.tagName):null,pointer:style?.pointerEvents,disabled:!!el?.disabled};
  },{selector,x,y});
  console.log('ADMIN TOUCH '+label,JSON.stringify(hit));
  if(!hit.ok)failures.push(label+': touch surface covered by '+hit.top);
  if(hit.pointer==='none')failures.push(label+': pointer-events none');
  if(hit.disabled)failures.push(label+': unexpectedly disabled');
  await page.touchscreen.tap(x,y);
  await page.waitForTimeout(300);
}

await loadCurrentShell();
await forceAdminView();

await tap('[data-admin-page-tab="contractors"]','Contractors tab');
if(!(await page.locator('#adminApplicantPipeline').evaluate(el=>el.classList.contains('active')).catch(()=>false))) failures.push('Contractors tab did not activate applicant pipeline');

await tap('[data-admin-page-tab="projects"]','Projects & Estimates tab');
if(!(await page.locator('#adminHomeownerProjects').evaluate(el=>el.classList.contains('active')).catch(()=>false))) failures.push('Projects tab did not activate homeowner project review');

await tap('[data-admin-page-tab="jobs"]','Jobs & Progress tab');
if(!(await page.locator('#jobHealthDashboard').evaluate(el=>el.classList.contains('active')).catch(()=>false))) failures.push('Jobs tab did not activate job health');

await tap('#bctCommandCenter [data-admin-jump="adminServiceCalls"]','Command Center Service Calls');
if(!(await page.locator('#adminServiceCalls').evaluate(el=>el.classList.contains('active')).catch(()=>false))) failures.push('Command Center did not jump to Service Calls');

await page.locator('#bctCommandSearch').fill('service');
await page.waitForTimeout(250);
const visibleCommands=await page.locator('#bctCommandResults [data-admin-jump]:visible').count();
if(visibleCommands<1) failures.push('Command Center search returned no visible result for service');

await page.evaluate(()=>{
  localStorage.setItem('bctPreferredLanguage','es');
  document.documentElement.lang='es';
  const select=document.getElementById('bctLoginLanguage');
  if(select){select.value='es';select.dispatchEvent(new Event('change',{bubbles:true}));}
});
await page.waitForTimeout(650);

const adminHeading=(await page.locator('#view-admin h2').first().textContent().catch(()=>''))?.trim();
const commandHeading=(await page.locator('#bctCommandCenter h3').textContent().catch(()=>''))?.trim();
const logoutText=(await page.locator('#adminLogoutBtn').textContent().catch(()=>''))?.trim();
const searchPlaceholder=await page.locator('#bctCommandSearch').getAttribute('placeholder').catch(()=>null);
console.log('ADMIN ES',JSON.stringify({adminHeading,commandHeading,logoutText,searchPlaceholder}));
if(adminHeading!=='Panel de administración de BCT') failures.push('Spanish admin dashboard heading not translated');
if(commandHeading!=='Centro de control') failures.push('Spanish Command Center heading not translated');
if(logoutText!=='Cerrar sesión') failures.push('Spanish admin logout not translated');
if(!String(searchPlaceholder||'').startsWith('Buscar:')) failures.push('Spanish command search placeholder not translated');

await browser.close();
if(failures.length){console.error('V46 iPhone admin control failures:\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 iPhone Admin controls + Spanish translation verification passed.');
