/* BCT Insurance Portal — Admin claim review controls */
(function(){'use strict';
const VERSION='BCT-INSURANCE-ADMIN-2026.10.01-1';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const sb=()=>window.supabaseClient;
function host(){return document.querySelector('#view-admin main,#view-admin .admin-content,#view-admin')||null}
function ensure(){
 if(document.getElementById('bctInsuranceAdminPanel'))return;
 const h=host();if(!h)return;
 const p=document.createElement('section');p.id='bctInsuranceAdminPanel';p.className='card section hidden';p.dataset.adminPagePanel='insurance';
 p.innerHTML='<div class="toolbar"><div><span class="badge info">BCT Insurance Portal</span><h2>Insurance Claims</h2><p class="muted">BCT-controlled insurance assignment review. Accepting a claim does not create a construction job.</p></div><button type="button" id="bctInsuranceAdminRefresh" class="secondary">Refresh</button></div><div id="bctInsuranceAdminStatus"></div><div id="bctInsuranceAdminClaims"><div class="notice">Open this page to load insurance claims.</div></div>';
 h.appendChild(p);document.getElementById('bctInsuranceAdminRefresh')?.addEventListener('click',load);
}
function note(m,t='notice'){const e=document.getElementById('bctInsuranceAdminStatus');if(e)e.innerHTML='<div class="'+t+'">'+esc(m)+'</div>'}
async function load(){
 const c=sb();if(!c)return note('Secure Admin connection is unavailable.','error');
 const box=document.getElementById('bctInsuranceAdminClaims');if(!box)return;
 const {data,error}=await c.from('bct_insurance_claims').select('id,claim_number,policyholder_name,property_address,loss_type,date_of_loss,status,organization_id,assigned_adjuster_user_id,project_id,created_at').order('created_at',{ascending:false}).limit(200);
 if(error){box.innerHTML='<div class="error">'+esc(error.message)+'</div>';return}
 box.innerHTML=(data||[]).length?data.map(x=>'<article class="card project-card"><div class="toolbar"><div><b>Claim '+esc(x.claim_number)+'</b><br><small>'+esc(x.policyholder_name)+' · '+esc(x.loss_type)+'</small></div><span class="badge info">'+esc(x.status)+'</span></div><p>'+esc(x.property_address?.street||'')+', '+esc(x.property_address?.city||'')+', '+esc(x.property_address?.state||'')+'</p>'+((x.status==='bct_review'||x.status==='needs_information')?'<div class="admin-project-actions"><button type="button" class="success" data-ins-review="accepted" data-id="'+esc(x.id)+'">Accept</button><button type="button" class="secondary" data-ins-review="needs_information" data-id="'+esc(x.id)+'">Needs Information</button><button type="button" class="danger" data-ins-review="declined" data-id="'+esc(x.id)+'">Decline</button></div>':'')+((['accepted','estimate_in_progress','carrier_review','supplement','authorized'].includes(x.status)&&!x.project_id)?'<div class="admin-project-actions"><button type="button" class="secondary" data-ins-handoff="'+esc(x.id)+'">Prepare Project Handoff</button></div>':'')+'</article>').join(''):'<div class="notice">No insurance claims submitted yet.</div>';
 box.querySelectorAll('[data-ins-review]').forEach(b=>b.addEventListener('click',()=>review(b.dataset.id,b.dataset.insReview))); box.querySelectorAll('[data-ins-handoff]').forEach(b=>b.addEventListener('click',()=>prepareHandoff(b.dataset.insHandoff)));
}
async function prepareHandoff(id){const c=sb();if(!c)return;note('Preparing controlled project handoff…');const {error}=await c.rpc('bct_admin_prepare_insurance_project_handoff',{p_claim_id:id});if(error)return note(error.message,'error');note('Handoff prepared. Create/select the canonical BCT project through the existing BCT project workflow before linking this claim.','success');}
async function review(id,decision){
 const c=sb();if(!c)return;note('Saving BCT review decision…');
 const {error}=await c.rpc('bct_admin_review_insurance_claim',{p_claim_id:id,p_decision:decision});
 if(error)return note(error.message,'error');note('Insurance claim review updated.','success');await load();
}
window.BCT_INSURANCE_ADMIN_VERSION=VERSION;window.bctLoadInsuranceAdmin=load;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
})();