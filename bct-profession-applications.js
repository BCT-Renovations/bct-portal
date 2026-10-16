/* Profession-specific intake, isolated from approval, auth, and backend access. */
(function(root){
'use strict';
const QUESTIONS={
 electrical:{title:'Electrician',questions:[
  ['experience','Describe your electrical training and years of hands-on electrical experience.'],
  ['scope','Which electrical work do you perform: wiring, circuits, panels, lighting, or other work? Describe your limits.'],
  ['diagnostics','Describe how you diagnose an electrical fault and the testing equipment you use.'],
  ['safety','How do you isolate power and verify a circuit is safe before starting work?'],
  ['example','Describe a recent electrical project, your responsibilities, and how the work was checked.']
 ]},
 plumbing:{title:'Plumber',questions:[
  ['experience','Describe your plumbing training and years of hands-on plumbing experience.'],
  ['scope','Which plumbing work do you perform: supply pipes, drains, fixtures, water heaters, or other work? Describe your limits.'],
  ['diagnostics','Describe how you diagnose a leak or drain problem and the equipment you use.'],
  ['safety','How do you isolate water and manage pressure, leaks, and sanitation risks before starting work?'],
  ['example','Describe a recent plumbing project, your responsibilities, and how the work was checked.']
 ]}
};
const SHARED=[['license_status','What is your current trade license or registration status?'],['jurisdiction','Where do you perform this trade, and which authority issued your license or registration, if applicable?'],['license_details','Provide the license or registration type, number, and expiration date. Do not enter a Social Security number.']];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function selected(form){const roles=new Set([form.elements.namedItem('trade')?.value,...Array.from(form.querySelectorAll('[name="contractorNetworkRole"]:checked'),e=>e.value)]);return Object.keys(QUESTIONS).filter(role=>roles.has(role));}
function name(role,key){return 'profession_'+role+'_'+key;}
function input(form,role,key){return form.elements.namedItem(name(role,key));}
function sync(form){
 const roles=selected(form);
 for(const role of Object.keys(QUESTIONS)){
  const panel=form.querySelector('[data-profession="'+role+'"]');if(!panel)continue;
  const active=roles.includes(role);panel.hidden=!active;panel.disabled=!active;
  for(const field of panel.querySelectorAll('input,textarea,select')){field.disabled=!active;field.required=active&&(field.dataset.question!=='license_details'||input(form,role,'license_status')?.value==='held');if(!field.required)field.setCustomValidity('');}
 }
 return roles;
}
function read(form){
 sync(form);const professions={};
 for(const role of selected(form)){
  const answers={};for(const [key] of [...SHARED,...QUESTIONS[role].questions]){
   const field=input(form,role,key),value=String(field?.value||'').trim();
   if(field?.required&&!value){field.setCustomValidity('Please answer this question.');throw new Error(QUESTIONS[role].title+': please complete the profession-specific questions.');}
   field?.setCustomValidity('');answers[key]=value;
  }
  professions[role]={questionnaire_version:1,answers};
 }
 return {version:1,professions};
}
function appendHistory(history,data){
 const text=String(history||'').trim();if(!Object.keys(data.professions).length)return text;
 return text+(text?'\n\n':'')+'BCT profession-specific application (self-reported; pending BCT review)\n'+JSON.stringify(data);
}
function mount(form){
 if(!form||form.querySelector('[data-profession-applications]'))return;
 const container=document.createElement('div');container.dataset.professionApplications='1';container.className='section';
 container.innerHTML=Object.entries(QUESTIONS).map(([role,config])=>'<fieldset data-profession="'+role+'" hidden disabled><legend><b>'+esc(config.title)+' Application — Trade Questions</b></legend><p>Answer for this profession only. BCT reviews credentials separately; these answers do not grant approval.</p>'+[...SHARED,...config.questions].map(([key,label])=>{
  const id=name(role,key);return '<div class="section"><label for="'+id+'">'+esc(label)+'</label>'+(key==='license_status'?'<select id="'+id+'" name="'+id+'" data-question="'+key+'"><option value="">Choose status</option><option value="held">I hold a license or registration</option><option value="pending">Application or renewal pending</option><option value="none">I do not currently hold one</option></select>':'<textarea id="'+id+'" name="'+id+'" data-question="'+key+'" maxlength="1500" rows="3"></textarea>')+'</div>';
 }).join('')+'</fieldset>').join('');
 const trade=form.elements.namedItem('trade'),step=trade?.closest('.bct-pre-step');
 if(step)step.appendChild(container);else form.appendChild(container);
 form.addEventListener('change',()=>sync(form));
 form.addEventListener('input',event=>event.target.setCustomValidity?.(''));
 form.addEventListener('reset',()=>setTimeout(()=>sync(form),0));
 document.addEventListener('bct:contractor-role-change',()=>sync(form));sync(form);
}
root.BCTProfessionApplications={mount,sync,read,appendHistory,questions:QUESTIONS};
if(typeof module!=='undefined')module.exports=root.BCTProfessionApplications;
if(typeof document!=='undefined'){
 const install=()=>mount(document.getElementById('applicationForm'));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}
})(typeof window==='undefined'?globalThis:window);
