/* BCT PHOTO BUILD Admin manager. Isolated V46 add-on. */
(function(){'use strict';
const VERSION='BCT-PHOTO-BUILD-2026.10.05-admin-agent-bct-2';window.BCT_PHOTO_BUILD_ADMIN_VERSION=VERSION;
const $=id=>document.getElementById(id);let rows=[],page=0,total=0;const PAGE=24;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function url(path){const base=(window.SUPABASE_URL||window.supabaseUrl||'').replace(/\/$/,'');return base?base+'/storage/v1/object/bct-gallery/'+String(path||'').split('/').map(encodeURIComponent).join('/'):''}
function css(){if($('bct-photo-admin-style'))return;const s=document.createElement('style');s.id='bct-photo-admin-style';s.textContent=`
#bctPhotoAdmin{margin:12px 0;padding:14px;border:1px solid #d7e0e1;border-radius:16px;background:#fff}
#bctPhotoAdmin .bct-photo-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:end}
#bctPhotoAdmin label{font-weight:800;color:#173c3e;display:grid;gap:4px}
#bctPhotoAdmin input,#bctPhotoAdmin select{min-height:44px;border:1px solid #9fb5b6;border-radius:9px;padding:8px;max-width:100%}
#bctPhotoAdmin button{min-height:44px;background:#0f5f63;color:#fff;border:1px solid #0a4549;border-radius:9px;padding:8px 12px;font-weight:800}
#bctPhotoAdmin .bct-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:12px}
.bct-photo-admin-card{border:2px solid #b91c1c;border-radius:12px;padding:9px;background:#fff}
.bct-photo-admin-card[data-published="true"]{border-color:#15803d}
.bct-photo-admin-card img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;background:#eef3f3}
.bct-photo-state{font-weight:900}.bct-photo-state.green{color:#15803d}.bct-photo-state.red{color:#b91c1c}
.bct-photo-fields{display:grid;gap:6px;margin-top:7px}.bct-photo-fields input,.bct-photo-fields select{width:100%}
.bct-photo-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.bct-photo-actions button{flex:1}
.bct-photo-pager{display:flex;gap:8px;justify-content:center;margin-top:12px}
@media(max-width:430px){#bctPhotoAdmin .bct-photo-grid{grid-template-columns:1fr}.bct-photo-tools>*{width:100%}}
`;document.head.appendChild(s)}
async function load(){if(!window.supabaseClient)return;const from=page*PAGE,to=from+PAGE-1;const {data,error,count}=await window.supabaseClient.from('bct_gallery_photos').select('*',{count:'exact'}).order('created_at',{ascending:false}).range(from,to);if(error){status('🔴 '+error.message);return}rows=data||[];total=Number(count||0);render()}
function status(t){const x=$('bctPhotoAdminStatus');if(x)x.textContent=t}
async function patch(id,values){const {error}=await window.supabaseClient.from('bct_gallery_photos').update(values).eq('id',id);if(error){status('🔴 '+error.message);return false}status('🟢 Saved');await load();return true}
const withTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' timed out after '+Math.round(ms/1000)+' seconds.')),ms))]);
async function upload(files){
 if(!files?.length)return;
 const list=[...files];
 window.dispatchEvent(new CustomEvent('bct-agent-photo-upload-started',{detail:{count:list.length}}));
 if(total+list.length>1000){status('🔴 The gallery library is limited to 1,000 photos.');return}
 let uploaded=0,failed=0;
 for(const file of list){
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)){failed++;status('🔴 '+file.name+': JPEG, PNG, or WebP only');continue}
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const path=new Date().toISOString().slice(0,10)+'/'+crypto.randomUUID()+'-'+safe;
  status('🟡 Uploading '+(uploaded+failed+1)+' of '+list.length+': '+file.name);
  try{
   const result=await withTimeout(window.supabaseClient.storage.from('bct-gallery').upload(path,file,{upsert:false}),45000,'Photo upload');
   if(result.error)throw result.error;
   const db=await withTimeout(window.supabaseClient.from('bct_gallery_photos').insert({storage_path:path,caption:'',alt_text:'BCT Renovations project photo',category:'Other',project_work_date:new Date().toISOString().slice(0,10)}),30000,'Photo record save');
   if(db.error){await window.supabaseClient.storage.from('bct-gallery').remove([path]);throw db.error}
   uploaded++;
   status('🟢 '+uploaded+' of '+list.length+' uploaded. Loading the photo now…');
  }catch(e){
   failed++;
   const message=e?.message||'Unknown upload error.';
   try{await window.supabaseClient.storage.from('bct-gallery').remove([path])}catch(_){}
   window.dispatchEvent(new CustomEvent('bct-agent-photo-upload-error',{detail:{message:message}}));
   status('🔴 '+file.name+': '+message);
  }
 }
 try{await withTimeout(load(),30000,'Photo gallery refresh')}catch(e){status('🔴 Upload completed, but the photo list could not refresh: '+(e?.message||e))}
 if(uploaded)window.dispatchEvent(new CustomEvent('bct-agent-photo-upload-complete',{detail:{count:uploaded}}));
 if(failed&&!uploaded)window.dispatchEvent(new CustomEvent('bct-agent-photo-upload-error',{detail:{message:'No selected photos were uploaded.'}}));
 try{const input=$('bctPhotoUpload');if(input)input.value=''}catch(_){}
}
async function hydrateImage(img,path){if(!img||!path||!window.supabaseClient)return;const {data,error}=await window.supabaseClient.storage.from('bct-gallery').createSignedUrl(path,900);if(!error&&data?.signedUrl)img.src=data.signedUrl}
function card(r){const el=document.createElement('article');el.className='bct-photo-admin-card';el.dataset.published=String(r.is_published);el.innerHTML=`<img data-bct-path="${esc(r.thumbnail_path||r.storage_path)}" alt=""><div class="bct-photo-state ${r.is_published?'green':'red'}">${r.is_published?'🟢 Published':'🔴 Hidden'}${r.show_on_home?' • Front page #'+r.home_order:''}</div><div class="bct-photo-fields"><label>Work date<input data-f="project_work_date" type="date" value="${esc(r.project_work_date)}"></label><label>Category<select data-f="category">${['Kitchen','Bathroom','Gutters','Siding','Roofing','Decks','Doors / Windows','Concrete','Interior','Exterior','Before','After','Other'].map(x=>`<option ${x===r.category?'selected':''}>${x}</option>`).join('')}</select></label><label>Caption<input data-f="caption" value="${esc(r.caption)}" maxlength="180"></label><label>Alt text<input data-f="alt_text" value="${esc(r.alt_text)}" maxlength="180"></label><label>Front-page order (1–30)<input data-f="home_order" type="number" min="1" max="30" value="${r.home_order||''}"></label></div><div class="bct-photo-actions"><button data-a="save">Save</button><button data-a="agent">Agent BCT</button><button data-a="publish">${r.is_published?'Hide':'Publish'}</button><button data-a="home">${r.show_on_home?'Remove from Front':'Show on Front'}</button><button data-a="delete">Remove</button></div>`;
el.addEventListener('click',async e=>{const a=e.target.dataset.a;if(!a)return;const vals=Object.fromEntries([...el.querySelectorAll('[data-f]')].map(x=>[x.dataset.f,x.value]));if(a==='save')await patch(r.id,{project_work_date:vals.project_work_date,category:vals.category,caption:vals.caption,alt_text:vals.alt_text,home_order:r.show_on_home?Number(vals.home_order)||r.home_order:null});if(a==='agent'){window.dispatchEvent(new CustomEvent('bct-agent-photo-request',{detail:{photoId:r.id}}));status('🟡 Agent BCT recommendation area is ready for this photo.');}if(a==='publish')await patch(r.id,{is_published:!r.is_published,show_on_home:r.is_published?false:r.show_on_home,home_order:r.is_published?null:r.home_order});if(a==='home'){if(!r.show_on_home&&!r.is_published){status('🔴 Publish the photo before placing it on the front page.');return}const order=Number(vals.home_order);if(!r.show_on_home&&(!order||order<1||order>30)){status('🔴 Enter a front-page order from 1 to 30.');return}await patch(r.id,{show_on_home:!r.show_on_home,home_order:r.show_on_home?null:order});}if(a==='delete'){if(!confirm('Remove this gallery photo?'))return;const {error}=await window.supabaseClient.from('bct_gallery_photos').delete().eq('id',r.id);if(error){status('🔴 '+error.message);return}await window.supabaseClient.storage.from('bct-gallery').remove([r.storage_path,...(r.thumbnail_path?[r.thumbnail_path]:[])]);status('🟢 Removed');await load()}});
hydrateImage(el.querySelector('img'),r.thumbnail_path||r.storage_path);return el}
function render(){const g=$('bctPhotoAdminGrid');if(!g)return;g.replaceChildren(...rows.map(card));$('bctPhotoPrev').disabled=page===0;$('bctPhotoNext').disabled=(page+1)*PAGE>=total;$('bctPhotoLibraryCount').textContent=total+' / 1,000 photos';}
function ensure(){const root=$('view-admin');if(!root||$('bctPhotoAdmin'))return;css();const section=document.createElement('section');section.id='bctPhotoAdmin';section.dataset.adminPagePanel='photos';section.dataset.bctBoardInclude='1';section.dataset.bctPhotoControl='1';section.innerHTML='<h2>Photo Control</h2><p><strong>BCT PHOTO BUILD</strong></p><p>Manage the Our Work Gallery. 🟢 published/showing • 🔴 hidden/inactive. The library supports up to 1,000 photos; only 0–30 may appear on the front page.</p><div class="bct-photo-tools"><label>Upload photos<input id="bctPhotoUpload" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><button id="bctPhotoRefresh" type="button">Refresh Gallery</button><strong id="bctPhotoLibraryCount">0 / 1,000 photos</strong><strong id="bctPhotoAdminStatus" aria-live="polite"></strong></div><div id="bctPhotoAdminGrid" class="bct-photo-grid"></div><div class="bct-photo-pager"><button id="bctPhotoPrev">Previous</button><button id="bctPhotoNext">Next</button></div>';root.appendChild(section);const input=$('bctPhotoUpload');if(input){input.addEventListener('change',e=>{const files=e.target.files;if(files?.length)upload(files);},false);}window.addEventListener('bct-agent-photo-upload-files',e=>upload(e.detail?.files));$('bctPhotoRefresh').onclick=()=>{status('🟡 Refreshing gallery…');load().then(()=>status('🟢 Gallery refreshed.')).catch(e=>status('🔴 Gallery refresh failed: '+(e?.message||e)))};$('bctPhotoPrev').onclick=()=>{if(page){page--;load()}};$('bctPhotoNext').onclick=()=>{if(rows.length===PAGE){page++;load()}};load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();window.addEventListener('pageshow',ensure);window.addEventListener('bct-admin-view-ready',ensure);window.addEventListener('bct-photo-control-init',ensure);
})();