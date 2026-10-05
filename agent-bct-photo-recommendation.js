/* Agent BCT Photo Recommendation System - isolated V46 development build.
   Uses the existing bct_gallery_photos table/storage. Recommendation-only.
   No code here can publish a photo. */
(function(){
'use strict';
const VERSION='AGENT-BCT-PHOTO-RECOMMENDATION-2026.10.03-1';
window.AGENT_BCT_PHOTO_RECOMMENDATION_VERSION=VERSION;
const CATEGORIES=['Kitchen','Bathroom','Gutters','Siding','Roofing','Decks','Doors / Windows','Concrete','Interior','Exterior','Before','After','Other'];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function style(){
 if($('agentBctPhotoRecStyle'))return;
 const s=document.createElement('style');s.id='agentBctPhotoRecStyle';s.textContent=`
 #agentBctPhotoRecommendations{margin:14px 0;padding:16px;border:1px solid #d7e0e1;border-radius:16px;background:#fff}
 #agentBctPhotoRecommendations h2{margin:0;color:#0f5f63}
 .abpr-note{margin:6px 0 14px;color:#5f6f73}
 .abpr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px}
 .abpr-card{border:1px solid #d7e0e1;border-radius:14px;background:#fff;overflow:hidden}
 .abpr-card img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#eef3f3}
 .abpr-body{padding:12px}
 .abpr-agent{color:#0f5f63;font-weight:900}
 .abpr-ai{display:inline-block;margin-left:6px;padding:3px 7px;border-radius:999px;background:#e9c57f;color:#173c3e;font-size:11px;font-weight:900}
 .abpr-row{display:flex;justify-content:space-between;gap:10px;margin:6px 0}
 .abpr-label{color:#5f6f73;font-size:12px;font-weight:800}
 .abpr-value{font-weight:800;text-align:right}
 .abpr-reason{padding:9px;border-left:4px solid #e9c57f;background:#fff9e8;border-radius:6px;margin:9px 0;line-height:1.4}
 .abpr-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
 .abpr-actions button{min-height:42px;border:1px solid #0a4549;border-radius:9px;padding:8px 12px;font-weight:900}
 .abpr-use{background:#15803d;color:#fff}.abpr-reject{background:#b91c1c;color:#fff}.abpr-later{background:#e5e7eb;color:#173c3e}
 .abpr-secondary{background:#0f5f63;color:#fff}
 .abpr-upload{background:#e9c57f;color:#173c3e;border-color:#b98b2f!important}
 .abpr-select{width:100%;min-height:40px;border:1px solid #9fb5b6;border-radius:8px;padding:6px}
 .abpr-permission{font-size:12px;color:#5f6f73;margin-top:9px}
 .abpr-empty{padding:18px;border:1px dashed #9fb5b6;border-radius:12px;color:#5f6f73}
 @media(max-width:520px){.abpr-grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}
async function signed(path){const {data,error}=await window.supabaseClient.storage.from('bct-gallery').createSignedUrl(path,900);return error?null:data?.signedUrl||null}
function score(v){return Math.max(0,Math.min(100,Number(v)||0))}
function testRecommendation(photo){
 const cat=(photo.category&&photo.category!=='Other')?photo.category:'Other';
 const hasCaption=Boolean(photo.caption&&photo.caption.trim());
 const q=hasCaption?82:68;
 const likelyMarketing=Boolean(photo.is_published)||hasCaption;
 return {suggested_category:cat,category_confidence:photo.category&&photo.category!=='Other'?91:62,photo_quality_score:q,marketing_value:likelyMarketing?'medium':'low',before_after_value:photo.category==='Before'||photo.category==='After'?'high':'medium',workmanship_visibility:hasCaption?'high':'medium',marketing_recommendation:likelyMarketing?'possible':'review',reason:likelyMarketing?'The photo appears potentially useful for BCT marketing review based on its project metadata and presentation.':'The photo may be useful, but Agent BCT recommends Admin review before considering marketing use.',model_name:'Agent BCT Test Analyzer',model_version:'test-1',analysis_mode:'test'};}
async function analyzePhoto(photo,mode){
 if(mode==='test')return testRecommendation(photo);
 const imageUrl=await signed(photo.thumbnail_path||photo.storage_path); if(!imageUrl)throw new Error('Could not create a private photo preview.');
 const res=await fetch('/api/agent-bct-photo-recommendation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photoId:photo.id,imageUrl,metadata:{category:photo.category,caption:photo.caption,project_work_date:photo.project_work_date}})});
 if(!res.ok)throw new Error((await res.text())||'Agent BCT analysis is unavailable.');
 return await res.json();
}
async function saveRecommendation(photoId,result){
 const {error}=await window.supabaseClient.from('bct_photo_recommendations').upsert({...result,photo_id:photoId,recommendation_status:'pending',admin_decision:null,corrected_category:null,admin_note:null},{onConflict:'photo_id'});
 if(error)throw error;
}
async function decide(id,decision,category,note){
 const values={admin_decision:decision};
 if(category)values.corrected_category=category;
 if(note)values.admin_note=note;
 const {error}=await window.supabaseClient.from('bct_photo_recommendations').update(values).eq('id',id);
 if(error)throw error;
}
function categoryOptions(selected){return CATEGORIES.map(c=>'<option '+(c===selected?'selected':'')+'>'+esc(c)+'</option>').join('')}
function card(item){
 const r=item.rec,el=document.createElement('article');el.className='abpr-card';
 const img=document.createElement('img');img.src=item.image;img.alt=item.photo.alt_text||'BCT project photo';
 const body=document.createElement('div');body.className='abpr-body';
 body.innerHTML='<div class="abpr-agent">Agent BCT Recommendation <span class="abpr-ai">'+esc(r.analysis_mode==='ai'?'AI analysis':'Test analysis')+'</span></div>'+
 '<div class="abpr-row"><span class="abpr-label">Suggested category</span><span class="abpr-value">'+esc(r.suggested_category)+'</span></div>'+
 '<div class="abpr-row"><span class="abpr-label">Category confidence</span><span class="abpr-value">'+score(r.category_confidence)+'%</span></div>'+
 '<div class="abpr-row"><span class="abpr-label">Photo quality/usefulness</span><span class="abpr-value">'+score(r.photo_quality_score)+'/100</span></div>'+
 '<div class="abpr-row"><span class="abpr-label">Marketing value</span><span class="abpr-value">'+esc(r.marketing_value)+'</span></div>'+
 '<div class="abpr-row"><span class="abpr-label">Before/after value</span><span class="abpr-value">'+esc(r.before_after_value)+'</span></div>'+
 '<div class="abpr-row"><span class="abpr-label">Workmanship visibility</span><span class="abpr-value">'+esc(r.workmanship_visibility)+'</span></div>'+
 '<div class="abpr-reason"><strong>Why:</strong> '+esc(r.reason)+'</div>'+
 '<label class="abpr-label">Admin category correction<select class="abpr-select" data-category>'+categoryOptions(r.corrected_category||r.suggested_category)+'</select></label>'+
 '<div class="abpr-permission">Marketing permission is separate. Agent BCT does not grant permission and does not publish this photo.</div>'+
 '<div class="abpr-actions"><button class="abpr-use" data-decision="use">Use</button><button class="abpr-reject" data-decision="reject">Reject</button><button class="abpr-later" data-decision="later">Later</button></div>'+
 '<div class="abpr-permission"><strong>Admin decision:</strong> '+esc(r.admin_decision||'Pending')+'</div>';
 el.append(img,body);
 el.querySelectorAll('[data-decision]').forEach(btn=>btn.onclick=async()=>{try{await decide(r.id,btn.dataset.decision,el.querySelector('[data-category]').value);await load();}catch(e){alert(e.message||'Could not save Admin decision.')}});
 return el;
}
async function load(){
 const grid=$('agentBctPhotoRecGrid');if(!grid||!window.supabaseClient)return;
 grid.innerHTML='<div class="abpr-empty">Loading Agent BCT recommendations…</div>';
 const {data,error}=await window.supabaseClient.from('bct_photo_recommendations').select('*').order('analyzed_at',{ascending:false});
 if(error){grid.innerHTML='<div class="abpr-empty">No recommendation data is available yet. Run a test recommendation from Photo Control.</div>';return}
 const rows=data||[];
 if(!rows.length){grid.innerHTML='<div class="abpr-empty">No Agent BCT recommendations yet.</div>';return}
 const ids=rows.map(x=>x.photo_id);
 const {data:photos}=await window.supabaseClient.from('bct_gallery_photos').select('id,storage_path,thumbnail_path,caption,alt_text,category,project_work_date,is_published').in('id',ids);
 const map=new Map((photos||[]).map(p=>[p.id,p]));
 const items=[];
 for(const r of rows){const p=map.get(r.photo_id);if(!p)continue;const image=await signed(p.thumbnail_path||p.storage_path);if(image)items.push({rec:r,photo:p,image});}
 grid.replaceChildren(...items.map(card));
}
async function runTest(){
 const status=$('agentBctPhotoRecStatus');if(status)status.textContent='Running test recommendations…';
 const {data:photos,error}=await window.supabaseClient.from('bct_gallery_photos').select('id,storage_path,thumbnail_path,caption,alt_text,category,project_work_date,is_published').order('created_at',{ascending:false}).limit(12);
 if(error){if(status)status.textContent='🔴 '+error.message;return}
 try{for(const p of (photos||[])){await saveRecommendation(p.id,await analyzePhoto(p,'test'));}if(status)status.textContent='🟢 Test recommendations saved for '+(photos||[]).length+' photos.';await load();}catch(e){if(status)status.textContent='🔴 '+(e.message||'Recommendation test failed.')}
}
function openExistingPhotoUploader(){const input=$('agentBctPhotoFileInput');if(input){input.click();return true;}const existing=$('bctPhotoUpload');if(existing){existing.click();return true;}const status=$('agentBctPhotoRecStatus');if(status)status.textContent='🟡 Upload control is loading. Try again in a moment.';return false;}
async function runAi(){
 const status=$('agentBctPhotoRecStatus');if(status)status.textContent='Running private Agent BCT AI analysis…';
 const {data:photos,error}=await window.supabaseClient.from('bct_gallery_photos').select('id,storage_path,thumbnail_path,caption,alt_text,category,project_work_date,is_published').order('created_at',{ascending:false}).limit(12);
 if(error){if(status)status.textContent='🔴 '+error.message;return}
 try{for(const p of (photos||[])){await saveRecommendation(p.id,await analyzePhoto(p,'ai'));}if(status)status.textContent='🟢 Private AI recommendations saved. No publication occurred.';await load();}catch(e){if(status)status.textContent='🔴 '+(e.message||'AI analysis failed.')}
}
function ensure(){
 const root=$('view-admin');if(!root||$('agentBctPhotoRecommendations'))return;
 style();const section=document.createElement('section');section.id='agentBctPhotoRecommendations';section.dataset.adminPagePanel='photos';
 section.innerHTML='<h2>Agent BCT Photo Recommendations</h2><p class="abpr-note">Private recommendation-only review. Agent BCT can suggest; only BCT Admin decides. Marketing permission remains separate.</p><input id="agentBctPhotoFileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple style="display:none"><div class="abpr-actions"><button id="agentBctPhotoUpload" class="abpr-secondary abpr-upload" type="button">Upload Photos</button><button id="agentBctPhotoTest" class="abpr-secondary" type="button">Run Test Recommendations</button><button id="agentBctPhotoAi" class="abpr-secondary" type="button">Run Private AI Analysis</button><button id="agentBctPhotoRefresh" class="abpr-secondary" type="button">Refresh</button></div><p id="agentBctPhotoRecStatus" aria-live="polite"></p><div id="agentBctPhotoRecGrid" class="abpr-grid"></div>';
 root.appendChild(section);
 $('agentBctPhotoFileInput').addEventListener('change',e=>{window.dispatchEvent(new CustomEvent('bct-agent-photo-upload-files',{detail:{files:e.target.files}}));e.target.value='';});$('agentBctPhotoUpload').onclick=openExistingPhotoUploader;$('agentBctPhotoTest').onclick=runTest;$('agentBctPhotoAi').onclick=runAi;$('agentBctPhotoRefresh').onclick=load;load();
}
async function analyzeRequestedPhoto(photoId){
 const status=$('agentBctPhotoRecStatus');if(status)status.textContent='Running Agent BCT test recommendation for selected photo…';
 const {data:photo,error}=await window.supabaseClient.from('bct_gallery_photos').select('id,storage_path,thumbnail_path,caption,alt_text,category,project_work_date,is_published').eq('id',photoId).single();
 if(error||!photo){if(status)status.textContent='🔴 Selected photo could not be loaded.';return}
 try{await saveRecommendation(photo.id,await analyzePhoto(photo,'test'));if(status)status.textContent='🟢 Test recommendation saved for selected photo.';await load();document.getElementById('agentBctPhotoRecommendations')?.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){if(status)status.textContent='🔴 '+(e.message||'Recommendation failed.')}}
window.addEventListener('bct-agent-photo-request',e=>{if(e.detail?.photoId)analyzeRequestedPhoto(e.detail.photoId)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();window.addEventListener('pageshow',ensure);
})();