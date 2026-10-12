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
