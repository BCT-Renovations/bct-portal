/* BCT Insurance Portal — isolated insurance/claims partner intake and claim tracking */
(function(){
'use strict';
const VERSION='BCT-INSURANCE-PORTAL-2026.10.01-foundation-1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function setView(name){if(typeof window.setVisibleView==='function')return window.setVisibleView(name);document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name)?.classList.remove('hidden')}
function status(msg,type='notice'){const n=$('bctInsuranceStatus');if(n)n.innerHTML='<div class="'+type+'">'+esc(msg)+'</div>'}
function ensure(){
 if($('view-insurance'))return;
 const main=$('bctMain')||document.querySelector('main');if(!main)return;
 const s=document.createElement('section');s.id='view-insurance';s.className='view section hidden';
 s.innerHTML=`<div class="bct-portal-title">BCT INSURANCE PORTAL</div>
 <div class="card section"><span class="badge info">Insurance / Claims Partner</span><h2>BCT Insurance Portal</h2>
 <p class="muted">For authorized insurance companies, adjusters, and claims representatives working with BCT Renovations. BCT remains the General Contractor and controls project review, estimating, contractor assignment, and completion.</p>
 <div class="portal-tabs"><button type="button" data-ins-page="signin" class="active">Sign In</button><button type="button" data-ins-page="new">Submit Claim</button><button type="button" data-ins-page="claims">My Claims</button></div></div>
 <div class="card section" data-ins-panel="signin"><h3>Insurance Partner Sign In</h3><div class="grid grid-2"><div><label>Email</label><input id="bctInsuranceEmail" type="email" autocomplete="email"></div><div><label>Password</label><input id="bctInsurancePassword" type="password" autocomplete="current-password"></div></div><button type="button" id="bctInsuranceSignIn">Sign In</button><p class="muted">Only BCT-approved insurance organizations and authorized members may access claims.</p></div>
 <div class="card section hidden" data-ins-panel="new"><h3>Submit Claim Assignment to BCT</h3><div class="notice"><strong>BCT Review:</strong> Submitting a claim does not automatically create or authorize a construction job.</div>
 <form id="bctInsuranceClaimForm"><div class="grid grid-2">
 <div><label>Insurance Organization ID</label><input name="organization_id" required></div><div><label>Claim Number</label><input name="claim_number" required></div>
 <div><label>Policyholder Name</label><input name="policyholder_name" required></div><div><label>Type of Loss</label><input name="loss_type" required placeholder="Wind, water, hail, fire..."></div>
 <div><label>Property Address</label><input name="property_address" required></div><div><label>City</label><input name="property_city" required></div>
 <div><label>State</label><input name="property_state" required></div><div><label>ZIP</label><input name="property_zip"></div>
 <div><label>Date of Loss</label><input name="loss_date" type="date"></div><div><label>Carrier Scope / Notes</label><textarea name="scope_notes"></textarea></div>
 </div><button type="submit">Submit to BCT Review</button></form></div>
 <div class="card section hidden" data-ins-panel="claims"><h3>My Authorized Claims</h3><button type="button" id="bctInsuranceRefresh">Refresh Claims</button><div id="bctInsuranceClaims"><div class="notice">Sign in to view authorized claims.</div></div></div>
 <div id="bctInsuranceStatus" class="section"></div><button type="button" class="secondary" id="bctInsuranceBackHome">Back to Home</button>`;
 main.appendChild(s);
 s.querySelectorAll('[data-ins-page]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.insPage)));
 $('bctInsuranceSignIn')?.addEventListener('click',signIn);
 $('bctInsuranceClaimForm')?.addEventListener('submit',submitClaim);
 $('bctInsuranceRefresh')?.addEventListener('click',loadClaims);
 $('bctInsuranceBackHome')?.addEventListener('click',()=>window.bctReturnToPublicLanding?.()||setView('home'));
}
function show(page){document.querySelectorAll('[data-ins-page]').forEach(b=>b.classList.toggle('active',b.dataset.insPage===page));document.querySelectorAll('[data-ins-panel]').forEach(p=>p.classList.toggle('hidden',p.dataset.insPanel!==page))}
async function signIn(){
 const sb=window.supabaseClient;if(!sb)return status('Secure sign in is not available.','error');
 const email=$('bctInsuranceEmail')?.value.trim(),password=$('bctInsurancePassword')?.value||'';
 if(!email||!password)return status('Enter your email and password.','error');
 const {error}=await sb.auth.signInWithPassword({email,password});if(error)return status(error.message,'error');
 const {data:member,error:memberError}=await sb.from('bct_insurance_members').select('id,organization_id,member_role,active').eq('user_id',(await sb.auth.getUser()).data.user?.id).eq('active',true).limit(1).maybeSingle();
 if(memberError||!member){await sb.auth.signOut();return status('This account is not authorized for the BCT Insurance Portal.','error')}
 window.BCT_INSURANCE_MEMBER=member;status('Insurance partner signed in.','success');show('claims');await loadClaims();
}
async function submitClaim(e){
 e.preventDefault();const sb=window.supabaseClient;if(!sb)return status('Secure claim submission is not available.','error');
 const {data:{user}}=await sb.auth.getUser();if(!user)return status('Sign in before submitting a claim.','error');
 const f=new FormData(e.currentTarget),organization_id=String(f.get('organization_id')||'').trim();
 const payload={organization_id,claim_number:String(f.get('claim_number')||'').trim(),policyholder_name:String(f.get('policyholder_name')||'').trim(),property_address:String(f.get('property_address')||'').trim(),property_city:String(f.get('property_city')||'').trim(),property_state:String(f.get('property_state')||'').trim(),property_zip:String(f.get('property_zip')||'').trim()||null,loss_type:String(f.get('loss_type')||'').trim(),loss_date:f.get('loss_date')||null,carrier_scope:{notes:String(f.get('scope_notes')||'').trim()},submitted_by:user.id,status:'submitted',authorization_status:'pending'};
 const {error}=await sb.from('bct_insurance_claims').insert(payload);if(error)return status(error.message,'error');
 e.currentTarget.reset();status('Claim submitted to BCT Review. No construction job has been authorized yet.','success');show('claims');await loadClaims();
}
async function loadClaims(){
 const sb=window.supabaseClient;if(!sb)return;const box=$('bctInsuranceClaims');if(!box)return;
 const {data,error}=await sb.from('bct_insurance_claims').select('id,claim_number,policyholder_name,property_address,property_city,property_state,loss_type,loss_date,status,authorization_status,created_at').order('created_at',{ascending:false}).limit(100);
 if(error){box.innerHTML='<div class="error">'+esc(error.message)+'</div>';return}
 box.innerHTML=(data||[]).length?(data||[]).map(c=>`<article class="card"><strong>Claim ${esc(c.claim_number)}</strong><p>${esc(c.policyholder_name)} · ${esc(c.loss_type)}</p><p class="muted">${esc(c.property_address)}, ${esc(c.property_city)}, ${esc(c.property_state)}</p><p>Status: <strong>${esc(c.status)}</strong> · Authorization: <strong>${esc(c.authorization_status)}</strong></p></article>`).join(''):'<div class="notice">No authorized claims found.</div>';
}
window.BCT_INSURANCE_PORTAL_VERSION=VERSION;window.bctOpenInsurancePortal=()=>{ensure();setView('insurance')};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
})();