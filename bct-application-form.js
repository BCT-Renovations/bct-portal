/* Staged structured intake renderer. Local file selection is not upload.
 * No submit handler, network, storage, or approval side effects. */
(function(root){
'use strict';
let sequence=0;
function mount(container,professionId,{language='en',state=null}={}){
 const catalogue=root.BCTApplicationLocales.catalogue(language,professionId);
 const ui=root.BCTApplicationLocales.controls(language);
 const profession=catalogue.find(item=>item.id===professionId);
 if(!profession)throw new Error('Unknown profession');
 const doc=container.ownerDocument,prefix='bct-intake-'+(++sequence),readers=[],fileReaders=[];
 const section=doc.createElement('section');section.lang=language;section.dir=language==='ar'?'rtl':'ltr';section.dataset.application=professionId;
 const heading=doc.createElement('h2');heading.textContent=profession.title;section.append(heading);
 function element(tag,text){const e=doc.createElement(tag);if(text)e.textContent=text;return e;}
 function control(parent,label,type='text'){
  const id=prefix+'-'+(++sequence),wrap=element('div'),caption=element('label',label),input=element(type==='textarea'?'textarea':'input');
  caption.htmlFor=id;input.id=id;if(type!=='textarea')input.type=type;
  if(type==='text'||type==='textarea')input.maxLength=6000;
  wrap.append(caption,input);parent.append(wrap);return input;
 }
 function fileInfo(file){return {name:file.name,size:file.size,type:file.type,lastModified:file.lastModified};}
 function savedAnswer(path){const parts=path.split('.');let answer=state?.answers?.[parts.shift()];for(const part of parts)answer=answer?.followups?.[part];return answer;}
 function savedFiles(path){return state?.files?.find(item=>item.path===path)?.files||[];}
 function render(question,parent,path){
  const group=element('fieldset'),legend=element('legend',(question.number?question.number+'. ':'')+question.text);group.append(legend);parent.append(group);group.dataset.question=path;
  if(question.help)group.append(element('p',question.help));
  const saved=savedAnswer(path);
  let value;
  if(question.type==='single'||question.type==='multiple'){
   const inputs=question.options.map(option=>{const input=control(group,option.label,question.type==='single'?'radio':'checkbox');input.name=prefix+'-'+path;input.value=option.value;input.checked=Array.isArray(saved?.value)?saved.value.includes(option.value):saved?.value===option.value;return input;});
   value=()=>question.type==='single'?inputs.find(i=>i.checked)?.value:inputs.filter(i=>i.checked).map(i=>i.value);
  }else if(question.type==='text'){
   const input=control(group,question.text,'textarea');input.value=typeof saved?.value==='string'?saved.value:'';value=()=>input.value;
  }else if(question.type==='document'){
   const input=control(group,question.text,'file');input.multiple=true;input.accept='.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif';input.dataset.category=question.category;
   let files=savedFiles(path);input.addEventListener('change',()=>{files=Array.from(input.files);});
   fileReaders.push({path,group,read:()=>files});value=()=>files.map(fileInfo);
  }else if(question.type==='portfolio'){
   const note=element('p',ui.localFiles);group.append(note);
   const input=control(group,ui.selectPhotos,'file');input.multiple=true;input.accept='image/jpeg,image/png,image/webp,image/heic,image/heif';input.dataset.category='work_photo';
   const count=element('p');count.setAttribute('role','status');group.append(count);
   const photos=element('div');group.append(photos);
   const photoKey=file=>JSON.stringify([file.name,file.size,file.type,file.lastModified]);
   let selectedPhotoRows=[];
   function updateCount(){count.textContent=ui.photoCount+': '+selectedPhotoRows.length;}
   function appendPhoto(file,saved){
     const key=photoKey(file);if(selectedPhotoRows.some(row=>row.key===key))return;
     const row=element('fieldset');row.append(element('legend',file.name));photos.append(row);
     const description=control(row,ui.description,'textarea'),role=control(row,ui.personalRole),supervisor=control(row,ui.supervisor);
     if(saved){description.value=saved.description;role.value=saved.role;supervisor.value=saved.supervisor;}
     const read=()=>({file:fileInfo(file),description:description.value,role:role.value,supervisor:supervisor.value});
     selectedPhotoRows.push({key,file,read});
     const remove=element('button',ui.removePhoto);remove.type='button';row.append(remove);remove.addEventListener('click',()=>{selectedPhotoRows=selectedPhotoRows.filter(item=>item.key!==key);row.remove();updateCount();input.focus();});
   }
   for(const file of savedFiles(path)){const previous=saved?.value?.photos?.find(photo=>photoKey(photo.file)===photoKey(file));appendPhoto(file,previous);}
   updateCount();
   input.addEventListener('change',()=>{
    // Each chooser visit adds to the in-memory portfolio. Do not discard earlier
    // photos/descriptions when a mobile picker returns only the new selection.
    for(const file of Array.from(input.files))appendPhoto(file);
    input.value='';updateCount();
   });
   fileReaders.push({path,group,read:()=>selectedPhotoRows.map(row=>row.file)});
   const supervisor=control(group,ui.reviewSupervisor);supervisor.value=saved?.value?.supervisor||'';
   const references=Array.from({length:3},(_,i)=>{
    const row=element('fieldset');row.append(element('legend',ui.reference+' '+(i+1)));group.append(row);
    const name=control(row,ui.name),relationship=control(row,ui.relationship),contact=control(row,ui.contact),reference=saved?.value?.references?.[i];
    if(reference){name.value=reference.name;relationship.value=reference.relationship;contact.value=reference.contact;}
    return ()=>({name:name.value,relationship:relationship.value,contact:contact.value});
   });
   value=()=>({photos:selectedPhotoRows.map(row=>row.read()),references:references.map(read=>read()),supervisor:supervisor.value});
  }else throw new Error('Unsupported question type');
  const children=(question.followups||[]).map(child=>({question:child,...render(child,group,path+'.'+child.id)}));
  function active(child){const current=value();return !child.when||child.when.values.some(v=>Array.isArray(current)?current.includes(v):current===v);}
  function sync(){for(const child of children){const enabled=active(child.question);child.group.hidden=!enabled;child.group.disabled=!enabled;}}
  group.addEventListener('change',sync);sync();
  return {group,read(includeInactive=false){return {value:value(),followups:Object.fromEntries(children.filter(child=>includeInactive||active(child.question)).map(child=>[child.question.id,child.read(includeInactive)]))};}};
 }
 for(const question of profession.questions)readers.push([question.id,render(question,section,question.id)]);
 const background=control(section,ui.background,'checkbox');background.checked=state?.backgroundCheckAcknowledged===true;
 const status=element('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');section.append(status);
 const errorList=element('ul');errorList.hidden=true;section.append(errorList);
 container.append(section);
 const api=Object.freeze({
  read(){return {answers:Object.fromEntries(readers.map(([id,field])=>[id,field.read()])),backgroundCheckAcknowledged:background.checked};},
  files(){return fileReaders.filter(item=>!item.group.closest('fieldset[disabled]')).map(item=>({path:item.path,files:item.read().slice()}));},
  snapshot(){return {answers:Object.fromEntries(readers.map(([id,field])=>[id,field.read(true)])),backgroundCheckAcknowledged:background.checked,files:fileReaders.map(item=>({path:item.path,files:item.read().slice()}))};},
  setLanguage(next){const replacement=mount(container,professionId,{language:next,state:this.snapshot()});this.destroy();return replacement;},
  validate(){
   const result=root.BCTApplicationValidation.validate(professionId,this.read());status.textContent=result.valid?ui.localPassed:result.errors.length+' '+ui.needsAttention;
   errorList.replaceChildren();errorList.hidden=result.valid;section.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));
   for(const error of result.errors){
    const relative=error.path.slice(professionId.length+1),groups=Array.from(section.querySelectorAll('[data-question]'));
    const group=groups.filter(node=>relative===node.dataset.question||relative.startsWith(node.dataset.question+'.')).sort((a,b)=>b.dataset.question.length-a.dataset.question.length)[0];
    const target=group||background;target.setAttribute('aria-invalid','true');
    const label=group?.querySelector(':scope > legend')?.textContent||ui.background;
    const item=element('li'),button=element('button',label+' — '+root.BCTApplicationLocales.errorMessage(language,error.code));button.type='button';
    button.addEventListener('click',()=>{target.tabIndex=-1;target.focus();});item.append(button);errorList.append(item);
   }
   return result;
  },
  destroy(){section.remove();}
 });return api;
}
root.BCTApplicationForm=Object.freeze({mount});
})(globalThis);
