// Run: node --test tests/v46-navigation-static.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'bct-contractor-roles.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('contractor role options exist',()=>{
 for(const role of ['general_contractor','electrical','plumbing','handyman_services'])
  assert.ok(script.includes("code:'"+role+"'"),'missing '+role);
});
test('home page restoration must not have unbounded mutation repair',()=>{
 for(const [name,source] of [['standalone',script],['inline',html]])
  assert.doesNotMatch(source,/new MutationObserver\(\(\)=>repairAuthLabels\(\)\)/,name+' has document-wide label observer');
});
test('contractor click listener is installed only once',()=>{
 assert.match(script,/__bctContractorNetworkClickBound/,'click listener lacks idempotent guard');
});
test('page restore listener is present',()=>{
 assert.match(script,/addEventListener\('pageshow'/);
});

test('renter approval appears for No selection in both implementations',()=>{
 for(const [name,source] of [['standalone',script],['inline',html]]){
  assert.match(source,/\^\(no\|renter\|tenant\)/i,name+' missing renter No branch');
  assert.match(source,/waiting_for_landlord_signature/,name+' missing assignment hold');
 }
});

test('logo and slogan are distinct DOM elements for translation',()=>{
 assert.match(html,/<img[^>]*class="brand-logo"[^>]*>/);
 assert.match(html,/<div class="bct-dynamic-slogan" data-bct-slogan/);
 assert.match(html,/function syncBrandSlogan\(language\)/);
 for(const lang of ['en','es','fr','ht','pt','vi','zh','ar','ru']) assert.match(html,new RegExp('\\b'+lang+':'), 'missing '+lang+' translation');
});
test('preserve signed-out header color and existing logo layout until asset replacement',()=>{
 assert.match(html,/background:#e8f5ec/);
 assert.match(html,/class="bct-logo-crop"/);
});

test('Client About labels never fall through to raw translation keys',()=>{
 assert.match(html,/if\(key==='homeowner\.about_button'\|\|key==='homeowner\.about_close'\)/);
 assert.match(html,/translated=pair\[key==='homeowner\.about_button'\?0:1\]/);
 for(const lang of ['en','es','fr','ht','pt','vi','zh','ar','ru']) assert.match(html,new RegExp('\\b'+lang+':\\['));
});

test('client tabs scroll to selected panel rather than portal top',()=>{
 assert.match(html,/const selectedPanel=\[\.\.\.document\.querySelectorAll\('\[data-customer-page-panel\]'\)\]/);
 assert.match(html,/selectedPanel\.scrollIntoView\(\{behavior:'smooth',block:'start'\}\)/);
 assert.doesNotMatch(html,/window\.scrollTo\(\{top:view\.offsetTop-80,behavior:'smooth'\}\)/);
});

test('About remains hidden until explicitly opened and has newcomer entry',()=>{
 assert.ok(html.includes('#bctClientPublicAbout{display:none!important}'));
 assert.ok(html.includes('bct-v46-about-isolated-navigation'));
 assert.ok(html.includes('bctNewClientAboutBtn'));
 assert.ok(html.includes('bct-about-page-open'));
 assert.ok(html.includes('previousFocus?.focus?.()'));
});

test('customer tabs scroll to active visible panel, not hidden duplicate',()=>{
 assert.match(html,/panel\.dataset\.customerPagePanel===page && panel\.classList\.contains\('active'\) && !panel\.classList\.contains\('hidden'\)/);
});
