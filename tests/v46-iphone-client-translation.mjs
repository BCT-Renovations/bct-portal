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
  if(await page.evaluate(()=>('serviceWorker' in navigator))){
    await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true).catch(()=>false));
    for(let i=0;i<7;i++){
      await page.reload({waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForTimeout(1200);
      const version=await page.evaluate(()=>window.BCT_CLIENT_TRANSLATION_FIX_VERSION||'');
      if(version.includes('2026.09.30-client-es'))return;
      await page.waitForTimeout(1800);
    }
  }
  failures.push('current Client Portal translation patch did not load from production shell');
}

async function forceClientView(){
  await page.evaluate(()=>{
    document.body.classList.remove('bct-authenticated','bct-entry-admin','bct-entry-contractor');
    document.body.classList.add('bct-portal-entered','bct-entry-client');
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    const client=document.getElementById('view-customer');
    client?.classList.remove('hidden');
    client?.removeAttribute('aria-hidden');
    localStorage.setItem('bctPreferredLanguage','es');
    document.documentElement.lang='es';
    const select=document.getElementById('bctLoginLanguage')||document.getElementById('bctLanguage');
    if(select){select.value='es';select.dispatchEvent(new Event('change',{bubbles:true}));}
  });
  await page.waitForTimeout(1100);
}

async function text(selector){return ((await page.locator(selector).first().textContent().catch(()=>''))||'').trim();}
function expectEqual(actual,expected,label){if(actual!==expected)failures.push(`${label}: expected "${expected}" got "${actual}"`);}
function expectIncludes(actual,expected,label){if(!actual.includes(expected))failures.push(`${label}: expected to include "${expected}" got "${actual}"`);}

await loadCurrentShell();
await forceClientView();

expectEqual(await text('#bctClientPortalTitle'),'PORTAL DEL CLIENTE','Client Portal title');
expectEqual(await text('#bctClientBackHomeTop'),'← Volver al inicio','Back to Home');
expectEqual(await text('#bctHomeownerSignupCard h3'),'Nuevo cliente — Registrarse','New Client heading');
expectEqual(await text('#bctHomeownerLoginCard h3'),'Cliente existente — Iniciar sesión','Returning Client heading');
expectEqual(await text('#bctHomeownerLoginCard label:first-of-type'),'Correo electrónico','Email label');
expectEqual(await text('#bctHomeownerLoginCard button[data-i18n="homeowner.signin_button"]'),'Iniciar sesión','Sign In button');
expectEqual(await text('#bctCommandFakeNeverExists'),'','noop');
expectEqual(await text('[data-i18n="homeowner.portal_badge"]'),'Portal del cliente BCT','Portal badge');
expectEqual(await text('[data-i18n="homeowner.tell_title"]'),'Cuéntele a BCT sobre su proyecto','Tell BCT heading');
expectEqual(await text('[data-i18n="homeowner.already_submitted"]'),'¿Ya lo envió?','Already submitted');
expectEqual(await text('[data-i18n="homeowner.project_number"]'),'Número de proyecto','Project number');
expectEqual(await text('[data-i18n="homeowner.check_project"]'),'Verificar proyecto','Check project');
expectEqual(await text('[data-i18n="homeowner.tab_overview"]'),'Resumen del proyecto','Overview tab');
expectEqual(await text('[data-i18n="homeowner.tab_files"]'),'Fotos y archivos','Files tab');
expectEqual(await text('[data-i18n="homeowner.tab_payments"]'),'Financiamiento y pagos','Payments tab');
expectEqual(await text('[data-i18n="homeowner.tab_completion"]'),'Recorrido final','Completion tab');

const propertyTypeLabel=await page.locator('select[name="propertyType"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(propertyTypeLabel,'Tipo de propiedad','Property Type label');
expectEqual(await text('select[name="propertyType"] option:first-child'),'Casa unifamiliar','Single-family option');
const ownerLabel=await page.locator('select[name="ownerStatus"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(ownerLabel,'¿Es usted el propietario?','Owner question');
expectEqual(await text('select[name="ownerStatus"] option:first-child'),'Sí','Yes option');
const propertyNameLabel=await page.locator('input[name="propertyName"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectIncludes(propertyNameLabel,'Nombre de la propiedad / complejo','Property complex label');
const buildingLabel=await page.locator('input[name="buildingNumber"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(buildingLabel,'Número de edificio','Building Number');
const unitLabel=await page.locator('input[name="unitNumber"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(unitLabel,'Número de unidad / suite','Unit / Suite Number');
const unitStatusLabel=await page.locator('select[name="occupancyStatus"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(unitStatusLabel,'Estado de la unidad','Unit Status');
expectEqual(await text('select[name="occupancyStatus"] option:first-child'),'No aplica','Not applicable option');
const residentNameLabel=await page.locator('input[name="residentName"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(residentNameLabel,'Nombre del residente (privado para BCT)','Resident Name');
const residentPhoneLabel=await page.locator('input[name="residentPhone"]').evaluate(el=>el.parentElement?.querySelector('label')?.textContent?.trim()||'').catch(()=> '');
expectEqual(residentPhoneLabel,'Teléfono del residente (privado para BCT)','Resident Phone');

const rawKeyCount=await page.getByText('homeowner.about_button',{exact:true}).count();
if(rawKeyCount)failures.push('raw homeowner.about_button key is visible');
const aboutText=await text('#bctClientAboutBtn');
if(aboutText&&aboutText!=='Acerca de BCT')failures.push('About button is not translated: '+aboutText);

await page.evaluate(()=>{
  localStorage.setItem('bctPreferredLanguage','en');
  document.documentElement.lang='en';
  const select=document.getElementById('bctLoginLanguage')||document.getElementById('bctLanguage');
  if(select){select.value='en';select.dispatchEvent(new Event('change',{bubbles:true}));}
});
await page.waitForTimeout(900);
expectEqual(await text('#bctClientPortalTitle'),'CLIENT PORTAL','English round-trip title');
expectEqual(await text('#bctHomeownerSignupCard h3'),'New Client — Sign Up','English round-trip signup heading');

await browser.close();
if(failures.length){console.error('V46 Client Portal translation failures:\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 Client Portal Spanish translation verification passed.');
