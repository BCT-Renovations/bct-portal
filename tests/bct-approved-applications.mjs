import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {catalogue,policy}=require('../bct-application-catalogue.js');
const {validate}=require('../bct-application-validation.js');
const locales=require('../bct-application-locales.js');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
check(catalogue.length===10,'ten approved professions');
check(catalogue.filter(p=>p.id==='drywall').length===1,'drywall counted once');
check(!catalogue.some(p=>p.id==='specialty_trade'),'unapproved specialty not counted as approved profession');
assert.deepEqual(policy.languages,['en','es','fr','ht','pt','vi','zh','ar','ru']);checks++;
function sampleField(q){
 if(q.type==='portfolio')return {value:{photos:Array.from({length:5},(_,i)=>({file:{name:`work-${i}.jpg`,size:100+i,type:'image/jpeg'},description:'Completed work',role:'Personally performed',supervisor:'Supervisor'})),references:Array.from({length:3},(_,i)=>({name:'Reference '+i,relationship:'Previous client',contact:`reference${i}@example.test`})),supervisor:'Supervisor'}};
 const value=q.type==='single'?'1':q.type==='multiple'?['1']:q.type==='document'?[{name:'credential.pdf',size:100}]:'Sample details';
 const followups={};for(const child of q.followups||[])if(!child.when||child.when.values.some(v=>Array.isArray(value)?value.includes(v):value===v))followups[child.id]=sampleField(child);
 return {value,followups};
}
function sample(p){const answers=Object.fromEntries(p.questions.map(q=>[q.id,sampleField(q)]));answers.service_area.value='Indianapolis, Indiana';answers.crew.followups.crew_size.value='3';return {answers,backgroundCheckAcknowledged:true};}
for(const p of catalogue){
 check(p.questions.length===19,p.id+' has 19 numbered questions');
 assert.deepEqual(p.questions.map(q=>q.number),Array.from({length:19},(_,i)=>i+1));checks++;
 check(new Set(p.questions.map(q=>q.id)).size===19,'no duplicated question ids');
 for(const q of p.questions){
  check(q.text.trim()&&q.required,p.id+' required question text');
  if(q.options)check(new Set(q.options.map(o=>o.value)).size===q.options.length,'unique stable option values');
 }
 check(p.questions[2].id==='credentials','credential question remains #3');
 check(p.questions[2].options.length===4,'not required and supervised apprentice options');
 check(p.questions[12].id==='portfolio','portfolio remains #13');
 check(p.questions[12].followups[0].maximum===10,'ten photo maximum');
 check(p.questions[12].followups[0].minimum===5,'five photo minimum');
 check(p.questions[12].followups[0].apprenticeManualReview,'apprentice review exception');
 check(!JSON.stringify(p).match(/past injur|medical history|diagnosis|SSN/),'no injury or medical history questions');
 const input=sample(p),ok=validate(p.id,input);
 assert.deepEqual(ok.errors,[]);checks++;
 check(ok.valid&&!ok.submissionReady&&ok.approvalStatus==='pending_bct_review','preflight does not approve or claim connected upload');
 const under=structuredClone(input);under.answers.portfolio.followups.work_portfolio.value.photos=[];
 // GC's first qualification is not an apprentice; supervised credential status
 // explicitly exercises the same manual-review route for every profession.
 under.answers.credentials={value:'4',followups:{credential_supervision:{value:'Named supervisor, credential and supervision details'}}};
 const apprentice=validate(p.id,under);check(apprentice.valid&&apprentice.reviewReasons.includes('apprentice_portfolio_under_5'),'apprentice empty portfolio requires manual review');
 delete under.answers.portfolio.followups.work_portfolio.value.supervisor;
 check(!validate(p.id,under).valid,'apprentice exception still requires named supervisor');
 under.answers.qualification.value='2';under.answers.credentials.value='2';under.answers.credentials.followups={};
 check(validate(p.id,under).errors.some(e=>e.code==='minimum_5_photos'),'non apprentice minimum enforced');
 const over=structuredClone(input);const port=over.answers.portfolio.followups.work_portfolio.value;
 port.photos=Array.from({length:11},(_,i)=>({...port.photos[0],file:{name:i+'.jpg',size:100+i,type:'image/jpeg'}}));
 check(validate(p.id,over).errors.some(e=>e.code==='maximum_10_photos'),'maximum enforced');
 const duplicate=structuredClone(input);duplicate.answers.portfolio.followups.work_portfolio.value.photos[1]=structuredClone(duplicate.answers.portfolio.followups.work_portfolio.value.photos[0]);
 check(validate(p.id,duplicate).errors.some(e=>e.code==='duplicate_photo'),'duplicate photo does not count twice');
 const missing=structuredClone(input);missing.answers.portfolio.followups.work_portfolio.value.photos[0].description='  ';
 check(validate(p.id,missing).errors.some(e=>e.code==='description_required'),'per-photo description enforced');
 const noReference=structuredClone(input);noReference.answers.portfolio.followups.work_portfolio.value.references.pop();
 check(validate(p.id,noReference).errors.some(e=>e.code==='three_professional_references_required'),'three references enforced');
 const credential=structuredClone(input);credential.answers.credentials.followups.credential_documents.value=[];
 check(!validate(p.id,credential).valid,'yes credentials requires document');
 const exempt=structuredClone(input);exempt.answers.credentials={value:'3',followups:{credential_scope:{value:'Small repairs, Indianapolis, Indiana'},credential_documents:{value:[{name:'stale.pdf',size:1}]}}};
 const exemptResult=validate(p.id,exempt);check(exemptResult.valid&&exemptResult.reviewReasons.includes('credential_requirement_needs_verification'),'not-required is reviewed, not auto verified');
 check(!('credential_documents' in exemptResult.answers.credentials.followups),'hidden stale credential answer excluded');
 const crew=structuredClone(input);crew.answers.crew.value='2';
 check(!Object.keys(validate(p.id,crew).answers.crew.followups).length,'crew no hides and excludes old details');
 const invalid=structuredClone(input);invalid.answers.experience.value='999';
 check(!validate(p.id,invalid).valid,'unrecognized option rejected');
 const noConsent=structuredClone(input);noConsent.backgroundCheckAcknowledged=false;
 check(!validate(p.id,noConsent).valid,'background acknowledgment required');
 console.log('PASS',p.id,'19 questions, conditional answers, portfolio boundaries, private-review gates');
}
const estimator=catalogue.find(p=>p.id==='estimator');
check(estimator.questions[14].help.includes('BCT approves final pricing'),'estimator pricing authority');
check(estimator.questions[8].help.includes('engineering'),'estimator specialist boundary');
const est=sample(estimator);est.answers.software.value=['1','9'];check(!validate('estimator',est).valid,'software none exclusive');
check(Object.isFrozen(catalogue)&&Object.isFrozen(catalogue[0].questions),'immutable approved source');
for(const file of ['bct-application-catalogue.js','bct-application-validation.js']){const text=await readFile(new URL('../'+file,import.meta.url),'utf8');check(!/fetch\(|localStorage|sessionStorage|supabase\.|XMLHttpRequest/.test(text),'no network or storage side effects');}
console.log(`${checks} approved application source and preflight checks passed. Rendering, translations and private backend uploads remain separate gates.`);
const controls=locales.controls('en');
for(const lang of policy.languages){const coverage=locales.coverage(lang),labels=locales.controls(lang);assert.deepEqual(Object.keys(labels),Object.keys(controls));assert.ok(Object.values(labels).every(text=>text.trim()));if(lang==='en')assert.equal(locales.catalogue(lang).length,10);else{assert.ok(Object.keys(labels).every(key=>labels[key]!==controls[key]),'every supplementary label translated: '+lang);assert.ok(coverage.translated>=87);assert.ok(!coverage.ready);assert.throws(()=>locales.catalogue(lang),error=>error.code==='TRANSLATION_INCOMPLETE');}console.log(`${lang}: ${coverage.translated}/${coverage.total} distinct new questionnaire strings translated; ready=${coverage.ready}`);}
assert.throws(()=>locales.controls('unknown'));
for(const lang of policy.languages){
 for(const code of ['answer_required_or_invalid','maximum_10_photos','minimum_5_photos','image_file_required','duplicate_photo','description_required','personal_role_required','supervisor_required','supervisor_required_for_manual_review','three_professional_references_required','reference_details_required','city_and_state_required','positive_crew_size_required','no_software_is_exclusive','background_check_acknowledgment_required']){
  const message=locales.errorMessage(lang,code);assert.ok(message.trim());if(lang!=='en')assert.notEqual(message,locales.errorMessage('en',code));
 }
 for(const id of ['electrical','plumbing','general_contractor','hvac'])assert.equal(locales.coverage(lang,id).ready,true);
}
