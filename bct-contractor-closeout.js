/* BCT V46 contractor closeout UI — uses existing completion, punch-list, and rating systems. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>String(v||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
async function rpc(name,args={}){const b=window.BCT_V46_BRIDGE;if(!b?.callRpc)throw new Error('BCT closeout connection is not ready.');return b.callRpc(name,args)}
function host(){
 const root=$('view-jobs');if(!root)return null;
 let el=$('bctContractorCloseout');
 if(!el){el=document.createElement('section');el.id='bctContractorCloseout';el.className='card section';root.appendChild(el)}
 return el;
}
function assignmentLabel(a){return a.job_number||a.project_number||a.job_title||'BCT Assignment'}
window.bctRenderContractorCloseout=function(state){
 const el=host();if(!el)return;
 const assignments=Array.isArray(state?.assignments)?state.assignments:[];
 const requests=Array.isArray(state?.completion_requests)?state.completion_requests:[];
 const punches=Array.isArray(state?.punch_items)?state.punch_items:[];
 const ratings=(Array.isArray(state?.rating_opportunities)?state.rating_opportunities:[]).filter(x=>x.rater_role==='contractor');
 const eligible=assignments.filter(a=>a.status==='in_progress');
 const pendingByAssignment=new Map(requests.filter(r=>r.status==='pending').map(r=>[r.assignment_id,r]));
 el.innerHTML=`<h2>Completion & Closeout</h2>
 <p class="muted">Request BCT completion review, track punch-list corrections, and leave a completion rating. BCT retains final closeout approval.</p>
 <div id="bctContractorCloseoutStatus" class="notice" aria-live="polite"></div>
 <h3>Completion Requests</h3>
 <div class="grid">${eligible.length?eligible.map(a=>{const pending=pendingByAssignment.get(a.id);return pending?`<div class="stage"><b>${esc(assignmentLabel(a))}</b><br><span class="badge warn">Pending BCT Review</span>${pending.contractor_notes?`<p>${esc(pending.contractor_notes)}</p>`:''}<button type="button" class="secondary" data-cancel-completion="${esc(pending.id)}">Cancel Request</button></div>`:`<form class="stage" data-completion-request data-assignment-id="${esc(a.id)}" data-project-id="${esc(a.project_id)}" data-job-id="${esc(a.job_id||'')}" data-contractor-id="${esc(a.contractor_id)}"><b>${esc(assignmentLabel(a))}</b><p class="muted">Use this only when your assigned work is ready for BCT final review.</p><label>Completion notes</label><textarea name="notes" maxlength="3000" placeholder="What is complete and ready for review?"></textarea><button type="submit">Request BCT Completion Review</button></form>`}).join(''):'<div class="notice">No in-progress assignment is currently eligible for a completion request.</div>'}</div>
 <h3 class="section">Open Punch List</h3>
 <div class="grid">${punches.length?punches.map(p=>`<div class="stage"><b>${esc(p.description||p.title||'Punch-list item')}</b><br><span class="badge warn">${esc(fmt(p.status||'open'))}</span>${p.due_date?`<small> • Due ${esc(p.due_date)}</small>`:''}${p.responsible_party?`<p class="muted">Responsible: ${esc(p.responsible_party)}</p>`:''}</div>`).join(''):'<div class="notice">No open punch-list items assigned to you.</div>'}</div>
 <h3 class="section">Completion Ratings</h3>
 <div class="grid">${ratings.filter(r=>!r.already_rated).length?ratings.filter(r=>!r.already_rated).map(r=>`<form class="stage" data-contractor-rating data-assignment-id="${esc(r.assignment_id)}"><b>${esc(r.project_number||r.job_number||'BCT Project')}</b><p class="muted">Rate your completed BCT project experience.</p><label>Rating</label><select name="rating" required><option value="">Choose 1–5</option><option value="5">5 — Excellent</option><option value="4">4 — Very Good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select><label>Review (optional)</label><textarea name="review" maxlength="3000"></textarea><button type="submit">Submit Rating</button></form>`).join(''):'<div class="notice">No unrated completion opportunities are available.</div>'}</div>`;
 el.querySelectorAll('[data-completion-request]').forEach(f=>f.onsubmit=submitRequest);
 el.querySelectorAll('[data-cancel-completion]').forEach(b=>b.onclick=cancelRequest);
 el.querySelectorAll('[data-contractor-rating]').forEach(f=>f.onsubmit=submitRating);
};
function status(message){const el=$('bctContractorCloseoutStatus');if(el)el.textContent=message}
async function reload(){await window.BCT_V46_BRIDGE?.reloadContractor?.()}
async function submitRequest(e){
 e.preventDefault();const f=e.currentTarget,btn=f.querySelector('button');try{btn.disabled=true;status('Submitting completion request…');const {data:userData,error:userError}=await window.supabaseClient.auth.getUser();if(userError)throw userError;const uid=userData?.user?.id;if(!uid)throw new Error('Contractor sign-in is required.');const payload={assignment_id:f.dataset.assignmentId,project_id:f.dataset.projectId,job_id:f.dataset.jobId||null,contractor_id:f.dataset.contractorId,requested_by:uid,status:'pending',contractor_notes:f.notes.value.trim()||null};const {error}=await window.supabaseClient.from('bct_completion_requests').insert(payload);if(error)throw error;status('Completion request sent to BCT.');await reload()}catch(err){status(err?.message||'Completion request could not be submitted.')}finally{btn.disabled=false}
}
async function cancelRequest(e){
 const id=e.currentTarget.dataset.cancelCompletion;if(!id)return;try{status('Cancelling completion request…');await rpc('bct_contractor_cancel_completion_request',{p_request_id:id});status('Completion request cancelled.');await reload()}catch(err){status(err?.message||'Completion request could not be cancelled.')}
}
async function submitRating(e){
 e.preventDefault();const f=e.currentTarget,btn=f.querySelector('button');try{btn.disabled=true;const rating=Number(f.rating.value);if(!Number.isInteger(rating)||rating<1||rating>5)throw new Error('Choose a rating from 1 to 5.');status('Submitting rating…');await rpc('bct_submit_completion_rating',{p_assignment_id:f.dataset.assignmentId,p_rating:rating,p_review:f.review.value.trim()||null});status('Rating submitted.');await reload()}catch(err){status(err?.message||'Rating could not be submitted.')}finally{btn.disabled=false}
}
})();