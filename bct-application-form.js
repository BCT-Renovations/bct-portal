/* Staged structured intake renderer. Local file selection is not upload.
 * No submit handler, network, storage, or approval side effects. */
(function(root){
'use strict';
let sequence=0;
function mount(container,professionId,{language='en'}={}){
 const catalogue=root.BCTApplicationLocales.catalogue(language);
 // Supplementary control labels are English until their translation gate passes.
 if(language!=='en')throw new Error('Structured form control translations incomplete');
 const profession=catalogue.find(item=>item.id===professionId);
 if(!profession)throw new Error('Unknown profession');
 const doc=container.ownerDocument,prefix='bct-intake-'+(++sequence),readers=[];
 const section=doc.createElement('section');section.lang=language;section.dataset.application=professionId;
 const heading=doc.createElement('h2');heading.textContent=profession.title;section.append(heading);
 function element(tag,text){const e=doc.createElement(tag);if(text)e.textContent=text;return e;}
 function control(parent,label,type='text'){
  const id=prefix+'-'+(++sequence),wrap=element('div'),caption=element('label',label),input=element(type==='textarea'?'textarea':'input');
  caption.htmlFor=id;input.id=id;if(type!=='textarea')input.type=type;
  if(type==='text'||type==='textarea')input.maxLength=6000;
  wrap.append(caption,input);parent.append(wrap);return input;
 }
 function fileInfo(file){return {name:file.name,size:file.size,type:file.type,lastModified:file.lastModified};}
 function render(question,parent,path){
  const group=element('fieldset'),legend=element('legend',(question.number?question.number+'. ':'')+question.text);group.append(legend);parent.append(group);group.dataset.question=path;
  let value;
  if(question.type==='single'||question.type==='multiple'){
   const inputs=question.options.map(option=>{const input=control(group,option.label,question.type==='single'?'radio':'checkbox');input.name=prefix+'-'+path;input.value=option.value;return input;});
   value=()=>question.type==='single'?inputs.find(i=>i.checked)?.value:inputs.filter(i=>i.checked).map(i=>i.value);
  }else if(question.type==='text'){
   const input=control(group,question.text,'textarea');value=()=>input.value;
  }else if(question.type==='document'){
   const input=control(group,question.text,'file');input.multiple=true;input.accept='.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif';input.dataset.category=question.category;
   value=()=>Array.from(input.files).map(fileInfo);
  }else if(question.type==='portfolio'){
   const note=element('p','Files selected here have not been uploaded.');group.append(note);
   const input=control(group,'Select up to 10 work photographs','file');input.multiple=true;input.accept='image/jpeg,image/png,image/webp,image/heic,image/heif';input.dataset.category='work_photo';
   const photos=element('div');group.append(photos);let photoReaders=[];
   const photoKey=file=>JSON.stringify([file.name,file.size,file.type,file.lastModified]);
   let selectedPhotoRows=[];
   input.addEventListener('change',()=>{
    const previous=new Map(selectedPhotoRows.map(row=>[row.key,row.read()]));
    photos.replaceChildren();photoReaders=[];selectedPhotoRows=[];
    // Keep all selected files so preflight can report an over-limit selection.
    Array.from(input.files).forEach(file=>{
     const row=element('fieldset');row.append(element('legend',file.name));photos.append(row);
     const description=control(row,'Short work description','textarea'),role=control(row,'Work personally performed or supervised'),supervisor=control(row,'Supervisor, if apprentice or assistant');
     const key=photoKey(file),saved=previous.get(key);
     if(saved){description.value=saved.description;role.value=saved.role;supervisor.value=saved.supervisor;}
     const read=()=>({file:fileInfo(file),description:description.value,role:role.value,supervisor:supervisor.value});
     photoReaders.push(read);selectedPhotoRows.push({key,read});
    });
   });
   const supervisor=control(group,'Supervisor for apprentice manual review');
   const references=Array.from({length:3},(_,i)=>{
    const row=element('fieldset');row.append(element('legend','Professional reference '+(i+1)));group.append(row);
    const name=control(row,'Name'),relationship=control(row,'Professional relationship'),contact=control(row,'Phone or email');return ()=>({name:name.value,relationship:relationship.value,contact:contact.value});
   });
   value=()=>({photos:photoReaders.map(read=>read()),references:references.map(read=>read()),supervisor:supervisor.value});
  }else throw new Error('Unsupported question type');
  const children=(question.followups||[]).map(child=>({question:child,...render(child,group,path+'.'+child.id)}));
  function active(child){const current=value();return !child.when||child.when.values.some(v=>Array.isArray(current)?current.includes(v):current===v);}
  function sync(){for(const child of children){const enabled=active(child.question);child.group.hidden=!enabled;child.group.disabled=!enabled;}}
  group.addEventListener('change',sync);sync();
  return {group,read(){return {value:value(),followups:Object.fromEntries(children.filter(child=>active(child.question)).map(child=>[child.question.id,child.read()]))};}};
 }
 for(const question of profession.questions)readers.push([question.id,render(question,section,question.id)]);
 const background=control(section,'I understand BCT requires background screening before approval.','checkbox');
 const status=element('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');section.append(status);
 container.append(section);
 return Object.freeze({
  read(){return {answers:Object.fromEntries(readers.map(([id,field])=>[id,field.read()])),backgroundCheckAcknowledged:background.checked};},
  validate(){const result=root.BCTApplicationValidation.validate(professionId,this.read());status.textContent=result.valid?'Local checks passed. BCT review, secure upload and screening remain pending.':result.errors.length+' fields need attention.';return result;},
  destroy(){section.remove();}
 });
}
root.BCTApplicationForm=Object.freeze({mount});
})(globalThis);
