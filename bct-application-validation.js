/* Local preflight only, not an authorization or upload-security boundary.
 * No network, persistence, background check, or approval side effects. */
(function(root){
'use strict';
const source=typeof module!=='undefined'&&module.exports?require('./bct-application-catalogue.js'):root.BCTApprovedApplicationCatalogue;
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
function validate(professionId,input={}){
 const profession=source.catalogue.find(item=>item.id===professionId);
 if(!profession)throw new Error('Unknown profession');
 const errors=[],reviewReasons=[],answers={},raw=input.answers||{};
 const add=(path,code)=>errors.push({path,code});
 const qualification=profession.questions.find(q=>q.id==='qualification');
 const apprentice=qualification.options.some(o=>o.value===raw.qualification?.value&&/Apprentice|Assistant/.test(o.label))||raw.credentials?.value==='4';
 function field(question,entry,path){
  entry=entry&&typeof entry==='object'?entry:{};
  const value=entry.value;
  let valid=true;
  if(question.type==='single')valid=typeof value==='string'&&question.options.some(o=>o.value===value);
  else if(question.type==='multiple')valid=Array.isArray(value)&&(!question.required||value.length>0)&&new Set(value).size===value.length&&value.every(v=>typeof v==='string'&&question.options.some(o=>o.value===v));
  else if(question.type==='text')valid=nonempty(value)&&value.length<=6000;
  else if(question.type==='document')valid=Array.isArray(value)&&value.length>0&&value.every(file=>file&&nonempty(file.name)&&Number.isFinite(file.size)&&file.size>0);
  else if(question.type==='portfolio')return portfolio(value,path);
  else valid=false;
  if(!question.required&&(value===undefined||value===''||(Array.isArray(value)&&value.length===0)))return undefined;
  if(!valid){add(path,'answer_required_or_invalid');return undefined;}
  const clean={value:typeof value==='string'?value.trim():value,followups:{}};
  for(const followup of question.followups||[]){
   if(followup.when&&!followup.when.values.some(v=>Array.isArray(value)?value.includes(v):value===v))continue;
   const result=field(followup,entry.followups?.[followup.id],path+'.'+followup.id);
   if(result!==undefined)clean.followups[followup.id]=result;
  }
  return clean;
 }
 function portfolio(value,path){
  value=value&&typeof value==='object'?value:{};
  const photos=Array.isArray(value.photos)?value.photos:[],references=Array.isArray(value.references)?value.references:[];
  if(photos.length>source.policy.photoMaximum)add(path+'.photos','maximum_10_photos');
  if(photos.length<source.policy.photoMinimum){if(apprentice)reviewReasons.push('apprentice_portfolio_under_5');else add(path+'.photos','minimum_5_photos');}
  const seen=new Set();
  photos.forEach((photo,index)=>{
   const prefix=path+'.photos.'+index;
   const file=photo?.file;
   if(!file||!nonempty(file.name)||!Number.isFinite(file.size)||file.size<=0||!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type||''))add(prefix+'.file','image_file_required');
   else{const identity=[file.name,file.size,file.lastModified||0].join(':');if(seen.has(identity))add(prefix+'.file','duplicate_photo');seen.add(identity);}
   if(!nonempty(photo?.description))add(prefix+'.description','description_required');
   if(!nonempty(photo?.role))add(prefix+'.role','personal_role_required');
   if(apprentice&&!nonempty(photo?.supervisor))add(prefix+'.supervisor','supervisor_required');
  });
  if(references.length<source.policy.professionalReferences)add(path+'.references','three_professional_references_required');
  references.forEach((reference,index)=>{if(!nonempty(reference?.name)||!nonempty(reference?.relationship)||!nonempty(reference?.contact))add(path+'.references.'+index,'reference_details_required');});
  // Even with no photos, the apprentice exception must identify supervision.
  if(apprentice&&photos.length<5&&!nonempty(value.supervisor))add(path+'.supervisor','supervisor_required_for_manual_review');
  return {value:{photos,references,...(apprentice?{supervisor:String(value.supervisor||'').trim()}:{})}};
 }
 for(const question of profession.questions){const result=field(question,raw[question.id],professionId+'.'+question.id);if(result!==undefined)answers[question.id]=result;}
 // City/state only, not a duplicate street-address or medical-history intake.
 if(nonempty(raw.service_area?.value)&&!/\S.+[,\n].+\S/.test(raw.service_area.value))add(professionId+'.service_area','city_and_state_required');
 if(raw.crew?.value==='1'){
  const size=raw.crew.followups?.crew_size?.value;
  if(!/^\d+$/.test(String(size||''))||Number(size)<1||Number(size)>10000)add(professionId+'.crew.crew_size','positive_crew_size_required');
 }
 if(professionId==='estimator'&&raw.software?.value?.includes('9')&&raw.software.value.length>1)add(professionId+'.software','no_software_is_exclusive');
 if(input.backgroundCheckAcknowledged!==true)add(professionId+'.background_check','background_check_acknowledgment_required');
 if(raw.credentials?.value==='2')reviewReasons.push('credentials_missing');
 if(raw.credentials?.value==='3')reviewReasons.push('credential_requirement_needs_verification');
 if(raw.credentials?.value==='4')reviewReasons.push('supervision_needs_verification');
 if(raw.insurance?.value==='2')reviewReasons.push('insurance_needs_review');
 if(raw.bct_procedures?.value==='2')reviewReasons.push('bct_procedures_not_accepted');
 if(raw.essential_duties?.value==='2')reviewReasons.push('essential_duties_needs_private_review');
 return {version:source.policy.version,profession:professionId,valid:errors.length===0,errors,answers,reviewReasons:[...new Set(reviewReasons)],
  // A front-end checkbox/file is never proof of screening, access controls or upload.
  approvalStatus:'pending_bct_review',backgroundCheckStatus:'not_verified',credentialsStatus:'not_verified',privateUploadStatus:'not_verified',submissionReady:false};
}
const api=Object.freeze({validate});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BCTApplicationValidation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
