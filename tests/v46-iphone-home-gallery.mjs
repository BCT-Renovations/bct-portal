import { webkit, devices } from 'playwright';
import assert from 'node:assert/strict';

const url=process.env.BCT_URL||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
const page=await context.newPage();

try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#bctHomeGallery',{state:'attached',timeout:10000});

  assert.equal(await page.locator('#bctSignedOutEntry').count(),1,'protected signed-out entry missing');
  assert.equal(await page.locator('#bctShareAppBtn').count(),1,'Share App button missing');
  assert.equal(await page.locator('#bctPublicLicenseBar').count(),1,'Licensed/Bonded/Insured bar missing');

  const gallery=page.locator('#bctHomeGallery');
  await expectVisible(gallery,'Our Work gallery');
  assert.equal((await gallery.locator('.bct-gallery-card').count()),8,'expected eight prepared project slots');

  const firstFour=gallery.locator('.bct-gallery-card').nth(0);
  await expectVisible(firstFour,'first project card');
  for(let i=0;i<4;i++)await expectVisible(gallery.locator('.bct-gallery-card').nth(i),`initial project card ${i+1}`);
  for(let i=4;i<8;i++)assert.equal(await gallery.locator('.bct-gallery-card').nth(i).isVisible(),false,`extra project card ${i+1} should start hidden`);

  const toggle=gallery.locator('#bctGalleryToggle');
  assert.equal((await toggle.textContent())?.trim(),'View More Projects','wrong initial gallery button label');
  await toggle.tap();
  for(let i=0;i<8;i++)await expectVisible(gallery.locator('.bct-gallery-card').nth(i),`expanded project card ${i+1}`);
  assert.equal((await toggle.textContent())?.trim(),'Show Fewer Projects','wrong expanded gallery button label');

  const bodyWidth=await page.evaluate(()=>document.body.scrollWidth);
  const viewportWidth=await page.evaluate(()=>window.innerWidth);
  assert.ok(bodyWidth<=viewportWidth+1,`gallery introduced horizontal overflow: body=${bodyWidth}, viewport=${viewportWidth}`);

  await page.evaluate(()=>localStorage.setItem('bctPreferredLanguage','es'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#bctHomeGallery',{state:'attached',timeout:10000});
  assert.equal((await page.locator('#bctHomeGalleryTitle').textContent())?.trim(),'Nuestro Trabajo','Spanish gallery heading did not apply');

  console.log('V46 iPhone WebKit home gallery checks passed.');
} finally {
  await browser.close();
}

async function expectVisible(locator,label){
  assert.equal(await locator.isVisible(),true,`${label} is not visible`);
}
