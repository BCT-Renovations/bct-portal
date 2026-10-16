const {test}=require('node:test');const assert=require('node:assert/strict');
const api=require('../bct-profession-applications.js');
function fixture(trade,extra=[]){
 const fields={trade:{value:trade}};const panels={};
 for(const role of Object.keys(api.questions)){
  const keys=['license_status','jurisdiction','license_details',...api.questions[role].questions.map(q=>q[0])];
  const controls=keys.map(key=>fields['profession_'+role+'_'+key]={value:key==='license_status'?'none':key==='license_details'?'':'Sample '+role+' '+key,dataset:{question:key},setCustomValidity(message){this.error=message;}});
  panels[role]={querySelectorAll(){return controls}};
 }
 const form={elements:{namedItem(key){return fields[key]||null}},querySelectorAll(){return extra.map(value=>({value}))},querySelector(selector){return panels[selector.match(/="(.*?)"/)[1]]}};
 return {form,fields,panels};
}
test('single profession serializes only its own answers and preserves existing history',()=>{
 const {form}=fixture('plumbing');const result=api.read(form);assert.deepEqual(Object.keys(result.professions),['plumbing']);assert.match(result.professions.plumbing.answers.scope,/plumbing/);
 assert.equal(api.appendHistory('Existing history',result).startsWith('Existing history\n\n'),true);assert.equal(api.appendHistory('Existing history',{professions:{}}),'Existing history');
});
test('switching professions disables old requirements, preserves drafts, and excludes old answers',()=>{
 const {form,fields,panels}=fixture('electrical');api.read(form);fields.profession_electrical_experience.value='Draft electrical history';fields.trade.value='plumbing';const result=api.read(form);
 assert.equal(panels.electrical.hidden,true);assert.equal(fields.profession_electrical_experience.disabled,true);assert.equal(fields.profession_electrical_experience.required,false);assert.equal(fields.profession_electrical_experience.value,'Draft electrical history');assert.equal(result.professions.electrical,undefined);
});
test('multi-profession applications retain distinct answers without duplicate sections',()=>{
 const {form}=fixture('electrical',['electrical','plumbing']);const result=api.read(form);assert.deepEqual(Object.keys(result.professions),['electrical','plumbing']);assert.notEqual(result.professions.electrical.answers.safety,result.professions.plumbing.answers.safety);
});
test('license details are required only when a license is claimed',()=>{
 const {form,fields}=fixture('electrical');api.read(form);assert.equal(fields.profession_electrical_license_details.required,false);fields.profession_electrical_license_status.value='held';assert.throws(()=>api.read(form),/Electrician/);fields.profession_electrical_license_details.value='Sample registration and expiry';assert.doesNotThrow(()=>api.read(form));
});
test('blank and whitespace-only required answers cannot enter a submission payload',()=>{
 const {form,fields}=fixture('plumbing');fields.profession_plumbing_safety.value='  ';assert.throws(()=>api.read(form),/Plumber/);assert.ok(fields.profession_plumbing_safety.error);fields.profession_plumbing_safety.value='  Safe process  ';assert.equal(api.read(form).professions.plumbing.answers.safety,'Safe process');assert.equal(fields.profession_plumbing_safety.error,'');
});
test('other professions retain existing intake without electric/plumbing requirements',()=>{
 const {form,panels}=fixture('flooring');assert.deepEqual(api.read(form),{version:1,professions:{}});assert.equal(panels.electrical.disabled,true);assert.equal(panels.plumbing.disabled,true);
});
test('electrician and plumber have different work, diagnostic, safety, and example questions',()=>{
 for(const key of ['scope','diagnostics','safety','example'])assert.notEqual(api.questions.electrical.questions.find(q=>q[0]===key)[1],api.questions.plumbing.questions.find(q=>q[0]===key)[1]);
 assert.match(api.questions.electrical.questions.find(q=>q[0]==='scope')[1],/panels/);assert.match(api.questions.plumbing.questions.find(q=>q[0]==='scope')[1],/water heaters/);
});
