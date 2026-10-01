import { webkit } from 'playwright';
import assert from 'node:assert/strict';

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:390,height:844},
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  isMobile:true,
  hasTouch:true
});
const page=await context.newPage();

await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;font-family:Arial,sans-serif}.hidden{display:none!important}.wrap{padding:14px}.portal-tabs{display:flex;gap:6px}.panel{min-height:300px;padding:12px}.badge{display:inline-block;padding:4px}.badge.bad{color:#b91c1c}.badge.warn{color:#b45309}
</style></head><body class="bct-authenticated"><main id="view-admin" class="wrap">
  <div class="portal-tabs">
    <button data-admin-page-tab="launch" class="active">Launch</button>
    <button data-admin-page-tab="contractors">Contractors</button>
    <button data-admin-page-tab="projects">Projects</button>
    <button data-admin-page-tab="jobs">Jobs</button>
  </div>
  <section id="commandCenter" class="panel" data-admin-page-panel="launch"><h2>Command Center</h2><p>Launch controls</p><span class="badge warn" data-status="failed">Email delivery failed</span></section>
  <section id="applicantPipeline" class="panel" data-admin-page-panel="contractors"><h2>Applicant Review</h2><span class="badge warn" data-status="expired">Insurance expired</span></section>
  <section id="homeownerProjectReview" class="panel" data-admin-page-panel="projects"><h2>Homeowner Projects</h2><span class="badge warn" data-status="pending approval">Customer approval waiting</span></section>
  <section id="jobHealthDashboard" class="panel" data-admin-page-panel="jobs"><h2>Job Health</h2><span class="badge bad" data-status="critical">Critical job delay</span></section>
</main><script>
window.showView=function(name){document.body.dataset.fallbackView=name;return Promise.resolve(name)};
window.bctReturnToPublicLanding=function(){document.body.dataset.lastView='home';document.body.dataset.publicLanding='1'};
</script></body></html>`);
await page.addScriptTag({path:'bct-admin-control-board.js'});
await page.waitForSelector('#bctAdminControlBoard:not([hidden])');
await page.waitForTimeout(150);

assert.equal(await page.locator('#bctAdminControlBoard').isVisible(),true,'Admin Control Board must be first after Admin becomes visible.');
assert.equal(await page.locator('[data-admin-page-panel]:visible').count(),0,'No long stack of Admin panels may remain expanded on the Control Board.');
assert.equal(await page.locator('.bct-admin-urgent-card').count(),3,'Jobs, Contractors, and Clients urgent panels must be separate.');

const counts=await page.locator('.bct-admin-urgent-card').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.bctUrgentCategory,n.querySelector('.bct-admin-alert-count')?.textContent])));
assert.equal(counts.jobs,'1','Jobs alert count must contain job alerts only and must not absorb Launch/System warnings.');
assert.equal(counts.contractors,'1','Contractor alert count must be independent.');
assert.equal(counts.clients,'1','Client/Homeowner alert count must be independent.');

const initialScroll=await page.evaluate(()=>window.scrollY);
await page.waitForTimeout(650);
assert.equal(await page.evaluate(()=>window.scrollY),initialScroll,'Admin Control Board must not auto-scroll after opening.');
assert.equal(await page.locator('#view-admin').evaluate(el=>getComputedStyle(el).touchAction),'pan-y','Admin must preserve vertical iPhone touch scrolling.');

await page.locator('[data-bct-open-panel="jobHealthDashboard"]').click();
assert.equal(await page.locator('#jobHealthDashboard').isVisible(),true,'Tapping a portal must open its selected Admin section.');
assert.equal(await page.locator('#commandCenter').isVisible(),false,'Other Admin sections must remain closed.');
assert.equal(await page.locator('#bctAdminControlBoard').isVisible(),false,'Control Board must close while a section is open.');

const navColor=await page.locator('#jobHealthDashboard .bct-admin-board-button').first().evaluate(el=>getComputedStyle(el).backgroundColor);
assert.equal(navColor,'rgb(15, 95, 99)','Admin navigation buttons must use BCT teal #0f5f63.');

await page.locator('#jobHealthDashboard [data-bct-board-homeboard]').click();
assert.equal(await page.locator('#bctAdminControlBoard').isVisible(),true,'Admin Control Board button must return to the board.');
assert.equal(await page.locator('[data-admin-page-panel]:visible').count(),0,'Returning to board must collapse Admin content again.');

await page.locator('[data-bct-urgent-category="contractors"]').click();
assert.equal(await page.locator('#bctAdminUrgentView').isVisible(),true,'Urgent category must open its own detail view.');
assert.equal(await page.locator('#bctAdminUrgentView .bct-admin-urgent-item').count(),1,'Contractor urgent view must show only contractor urgent items in this fixture.');
assert.match(await page.locator('#bctAdminUrgentView').innerText(),/Insurance expired/i,'Contractor urgent detail must contain the contractor issue.');
assert.doesNotMatch(await page.locator('#bctAdminUrgentView').innerText(),/Critical job delay/i,'Contractor urgent detail must not mix in job alerts.');
assert.doesNotMatch(await page.locator('#bctAdminUrgentView').innerText(),/Email delivery failed/i,'Contractor urgent detail must not mix in system alerts.');

await page.locator('#bctAdminUrgentView [data-bct-board-homeboard]').click();
await page.locator('#bctAdminControlBoard [data-bct-board-publichome]').click();
assert.equal(await page.evaluate(()=>document.body.dataset.lastView),'home','Back to Home must call the existing public-landing routine.');
assert.equal(await page.evaluate(()=>document.body.dataset.publicLanding),'1','Back to Home must preserve the public landing behavior rather than using an Admin-local fallback.');
assert.equal(await page.evaluate(()=>document.body.dataset.fallbackView||''),'','Back to Home must not use the fallback route when the public landing routine exists.');

assert.equal(await page.evaluate(()=>window.scrollY),initialScroll,'Admin navigation must not force automatic page scrolling.');

await browser.close();
console.log('V46 Admin Control Board WebKit/iPhone regression: PASS');