/* BCT Insurance Portal — isolated insurance/claims partner intake and claim tracking */
(function(){
'use strict';
const VERSION='BCT-INSURANCE-PORTAL-2026.10.01-membership-bound-2';
let insuranceEpoch=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function setView(name){if(typeof window.setVisibleView==='function')return window.setVisibleView(name);document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name)?.classList.remove('hidden')}
function status(msg,type='notice'){const n=$('bctInsuranceStatus');if(n)n.innerHTML='<div class="'+type+'">'+esc(msg)+'</div>'}
function ensure(){
 if($('view-insurance'))return;
 const main=$('bctMain')||document.querySelector('main');if(!main)return;
 const s=document.createElement('section');s.id='view-insurance';s.className='view section hidden';
 s.innerHTML=`<div class="bct-portal-title">BCT INSURANCE PORTAL</div>
 <div class="card section"><label for="bctInsuranceOrgSelect">Approved Insurance Organization</label><select id="bctInsuranceOrgSelect" aria-label="Approved Insurance Organization"><option value="">Sign in to load approved memberships</option></select><span class="badge info">Insurance / Claims Partner</span><h2>BCT Insurance Portal</h2>
 <p class="muted">For authorized insurance companies, adjusters, and claims representatives working with BCT Renovations. BCT remains the General Contractor and controls project review, estimating, contractor assignment, and completion.</p>
 <div class="portal-tabs"><button type="button" data-ins-page="signin" class="active">Sign In</button><button type="button" data-ins-page="new">Submit Claim</button><button type="button" data-ins-page="claims">My Claims</button></div></div>
 <div class="card section" data-ins-panel="signin"><h3>Insurance Company / Claims Adjuster Sign In</h3><div class="grid grid-2"><div><label>Email</label><input id="bctInsuranceEmail" type="email" autocomplete="email"></div><div><label>Password</label><input id="bctInsurancePassword" type="password" autocomplete="current-password"></div></div><button type="button" id="bctInsuranceSignIn">Sign In</button><p class="muted">Only BCT-approved insurance organizations and authorized members may access claims.</p></div>
 <div class="card section hidden" data-ins-panel="new"><h3>Submit Claim Assignment to BCT</h3><div class="notice"><strong>BCT Review:</strong> Submitting a claim does not automatically create or authorize a construction job.</div>
 <form id="bctInsuranceClaimForm"><div class="grid grid-2">
 <div><label>Insurance Organization</label><input id="bctInsuranceOrganization" value="Verified from your approved account" disabled></div><div><label>Claim Number</label><input name="claim_number" required></div>
 <div><label>Policyholder Name</label><input name="policyholder_name" required></div><div><label>Type of Loss</label><input name="loss_type" required placeholder="Wind, water, hail, fire..."></div>
 <div><label>Property Address</label><input name="property_address" required></div><div><label>City</label><input name="property_city" required></div>
 <div><label>State</label><input name="property_state" required></div><div><label>ZIP</label><input name="property_zip"></div>
 <div><label>Date of Loss</label><input name="loss_date" type="date"></div><div><label>Carrier Scope / Notes</label><textarea name="scope_notes"></textarea></div>
 </div><button type="submit">Submit to BCT Review</button></form></div>
 <div class="card section hidden" data-ins-panel="claims"><h3>My Authorized Claims</h3><button type="button" id="bctInsuranceRefresh">Refresh Claims</button><div id="bctInsuranceClaims"><div class="notice">Sign in to view authorized claims.</div></div></div>
 <div class="card section hidden" id="bctInsuranceClaimAction"><h3>Claim Communication</h3><p class="muted" id="bctInsuranceClaimActionLabel"></p><div id="bctInsuranceClaimHistory" class="notice">Open a claim to load its authorized history.</div><label>Message / Additional Information</label><textarea id="bctInsuranceClaimMessage"></textarea><div class="portal-tabs"><button type="button" id="bctInsuranceSendMessage">Send Message</button><button type="button" id="bctInsuranceRespondInfo" class="secondary">Respond to Needs Information</button></div></div>
 <div id="bctInsuranceStatus" class="section"></div><button type="button" class="secondary bct-portal-back" style="background:#a8e6cf;color:#0a4549;min-height:48px" id="bctInsuranceBackHome">← Back</button>`;
 main.appendChild(s);
 window.supabaseClient?.auth?.onAuthStateChange?.((_event,session)=>{insuranceEpoch++;if(session?.user?.id!==window.BCT_INSURANCE_MEMBER?.user_id){window.BCT_INSURANCE_MEMBER=null;activeClaim=null;activeClaimStatus=null;$('bctInsuranceClaims').textContent='Sign in to view authorized claims.';$('bctInsuranceClaimHistory').textContent='Sign in to view authorized history.';$('bctInsuranceClaimAction').classList.add('hidden');}});
 s.querySelectorAll('[data-ins-page]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.insPage)));
 $('bctInsuranceSignIn')?.addEventListener('click',signIn);$('bctInsuranceOrgSelect')?.addEventListener('change',()=>{window.BCT_INSURANCE_MEMBER=null;activeClaim=null;$('bctInsuranceClaimAction').classList.add('hidden');loadClaims()});
 $('bctInsuranceClaimForm')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;if(form.dataset.busy)return;form.dataset.busy='1';const button=form.querySelector('[type=submit]');button.disabled=true;try{await submitClaim(e)}catch{status('Claim submission could not be confirmed. Refresh My Claims before retrying.','error')}finally{delete form.dataset.busy;button.disabled=false}});
 $('bctInsuranceRefresh')?.addEventListener('click',loadClaims); $('bctInsuranceSendMessage')?.addEventListener('click',()=>sendClaimAction('message')); $('bctInsuranceRespondInfo')?.addEventListener('click',()=>sendClaimAction('information'));
 $('bctInsuranceBackHome')?.addEventListener('click',()=>{if(typeof window.bctReturnToPublicLanding==='function')window.bctReturnToPublicLanding();else setView('home')});
}
function show(page){if(page==='new'&&window.BCT_INSURANCE_MEMBER?.member_role==='read_only')return status('Your insurance account has read-only access.','error');$('bctInsuranceClaimAction')?.classList.add('hidden');activeClaim=null;activeClaimStatus=null;document.querySelectorAll('[data-ins-page]').forEach(b=>b.classList.toggle('active',b.dataset.insPage===page));document.querySelectorAll('[data-ins-panel]').forEach(p=>p.classList.toggle('hidden',p.dataset.insPanel!==page))}
async function getMembership(sb,userId){
 const {data,error}=await sb.from('bct_insurance_members').select('organization_id,member_role,status').eq('user_id',userId).eq('status','active');
 const select=$('bctInsuranceOrgSelect'),selected=select?.value||'',members=data||[];
 if(error)return {data:null,error};
 if(select){select.innerHTML='<option value="">Choose your insurance organization</option>'+members.map(m=>'<option value="'+esc(m.organization_id)+'">'+esc(m.organization_id)+' · '+esc(m.member_role.replaceAll('_',' '))+'</option>').join('');select.value=members.some(m=>m.organization_id===selected)?selected:members.length===1?members[0].organization_id:'';}
 const member=members.find(m=>m.organization_id===select?.value)||null;
 if(members.length>1&&!member)status('Choose the insurance organization you want to access.','notice');
 return {data:member,error:null};
}
async function signIn(){
 const sb=window.supabaseClient;if(!sb)return status('Secure sign in is not available.','error');
 const email=$('bctInsuranceEmail')?.value.trim(),password=$('bctInsurancePassword')?.value||'';
 if(!email||!password)return status('Enter your email and password.','error');
 // Never replace an already authenticated BCT user's shared session with another account.
 const {data:existing,error:existingError}=await sb.auth.getUser();
 if(existingError&&existingError.status!==401&&existingError.name!=='AuthSessionMissingError')return status('Unable to verify your existing BCT session. Please try again.','error');
 let user=existing?.user||null;
 if(user&&String(user.email||'').toLowerCase()!==email.toLowerCase()){
  window.BCT_INSURANCE_MEMBER=null;
  return status('A different BCT account is already signed in. Use that account or sign out through the normal BCT account controls before changing accounts.','error');
 }
 if(!user){
  const {data:login,error}=await sb.auth.signInWithPassword({email,password});
  if(error)return status(error.message,'error');
  user=login?.user||null;
 }
 if(!user){window.BCT_INSURANCE_MEMBER=null;return status('Insurance account could not be verified.','error')}
 const {data:member,error:memberError}=await getMembership(sb,user.id);
 if(memberError||!member){window.BCT_INSURANCE_MEMBER=null;return status('This account is not authorized for the BCT Insurance Portal. Access denied.','error')}
 const {data:orgActive,error:orgError}=await sb.rpc('bct_insurance_org_active',{p_org:member.organization_id});if(orgError||orgActive!==true){window.BCT_INSURANCE_MEMBER=null;return status('Your insurance organization is not active.','error')}
 window.BCT_INSURANCE_MEMBER={...member,user_id:user.id};$('bctInsurancePassword').value='';status('Insurance partner signed in.','success');show('claims');await loadClaims();
}
async function submitClaim(e){
 e.preventDefault();const form=e.currentTarget;const sb=window.supabaseClient;if(!sb)return status('Secure claim submission is not available.','error');
 const {data:{user}}=await sb.auth.getUser();if(!user)return status('Sign in before submitting a claim.','error');
 const {data:member,error:memberError}=await getMembership(sb,user.id);if(memberError||!member){window.BCT_INSURANCE_MEMBER=null;return status('Your approved insurance organization could not be verified. Sign in again.','error')}window.BCT_INSURANCE_MEMBER={...member,user_id:user.id};const f=new FormData(form),organization_id=member.organization_id;
 const property_address={street:String(f.get('property_address')||'').trim(),city:String(f.get('property_city')||'').trim(),state:String(f.get('property_state')||'').trim(),zip:String(f.get('property_zip')||'').trim()};
 const {error}=await sb.rpc('bct_insurance_submit_claim',{p_organization_id:organization_id,p_claim_number:String(f.get('claim_number')||'').trim(),p_policyholder_name:String(f.get('policyholder_name')||'').trim(),p_property_address:property_address,p_loss_type:String(f.get('loss_type')||'').trim(),p_date_of_loss:f.get('loss_date')||null,p_carrier_scope:{notes:String(f.get('scope_notes')||'').trim()},p_carrier_estimate:{},p_documents:[],p_photos:[]});if(error)return status(error.message,'error');
 form.reset();status('Claim submitted to BCT Review. No construction job has been authorized yet.','success');show('claims');await loadClaims();
}
async function loadClaims(){
 const epoch=insuranceEpoch;const sb=window.supabaseClient;if(!sb)return;const box=$('bctInsuranceClaims');if(!box)return;
 const {data:session}=await sb.auth.getUser();if(!session?.user){window.BCT_INSURANCE_MEMBER=null;box.textContent='Sign in to view authorized claims.';return}
 const {data:membership,error:membershipError}=await getMembership(sb,session.user.id);
 if(membershipError||!membership){window.BCT_INSURANCE_MEMBER=null;box.textContent='Your insurance membership is not active.';return}
 const {data:orgActive,error:orgError}=await sb.rpc('bct_insurance_org_active',{p_org:membership.organization_id});if(orgError||orgActive!==true){window.BCT_INSURANCE_MEMBER=null;box.textContent='Your insurance organization is not active.';return}
 if(epoch!==insuranceEpoch)return;window.BCT_INSURANCE_MEMBER={...membership,user_id:session.user.id};
 const {data,error}=await sb.from('bct_partner_claims').select('id,claim_number,policyholder_name,property_address,loss_type,date_of_loss,status,created_at').eq('organization_id',membership.organization_id).order('created_at',{ascending:false}).limit(100);
 if(epoch!==insuranceEpoch)return;
 if(error){box.innerHTML='<div class="error">'+esc(error.message)+'</div>';return}
 box.innerHTML=(data||[]).length?(data||[]).map(c=>`<article class="card"><strong>Claim ${esc(c.claim_number)}</strong><p>${esc(c.policyholder_name)} · ${esc(c.loss_type)}</p><p class="muted">${esc(c.property_address?.street||'')}, ${esc(c.property_address?.city||'')}, ${esc(c.property_address?.state||'')}</p><p>Status: <strong>${esc(c.status)}</strong></p><button type="button" data-ins-open="${esc(c.id)}" data-ins-status="${esc(c.status)}" data-ins-number="${esc(c.claim_number)}">Open Claim Communication</button></article>`).join(''):'<div class="notice">No authorized claims found.</div>'; box.querySelectorAll('[data-ins-open]').forEach(b=>b.addEventListener('click',()=>openClaimAction(b.dataset.insOpen,b.dataset.insStatus,b.dataset.insNumber)));
}
let activeClaim=null,activeClaimStatus=null;
async function openClaimAction(id,claimStatus,number){activeClaim=id;activeClaimStatus=claimStatus;$('bctInsuranceClaimAction')?.classList.remove('hidden');const l=$('bctInsuranceClaimActionLabel');if(l)l.textContent='Claim '+number+' · '+claimStatus;const r=$('bctInsuranceRespondInfo');if(r)r.disabled=claimStatus!=='needs_information'||window.BCT_INSURANCE_MEMBER?.member_role==='read_only';const send=$('bctInsuranceSendMessage');if(send)send.disabled=window.BCT_INSURANCE_MEMBER?.member_role==='read_only';await loadClaimHistory(id);}
async function loadClaimHistory(id){const sb=window.supabaseClient,box=$('bctInsuranceClaimHistory');if(!sb||!box)return;box.textContent='Loading authorized claim history…';const {data,error}=await sb.rpc('bct_insurance_claim_history',{p_claim_id:id});if(id!==activeClaim)return;if(error){box.textContent=error.message;return;}box.innerHTML=(data||[]).length?(data||[]).map(e=>'<div class="claim-event"><strong>'+esc(e.event_type.replaceAll('_',' '))+'</strong><p>'+esc(e.body||e.payload?.response||e.payload?.notes||'')+'</p></div>').join(''):'<span class="muted">No insurance-visible claim activity yet.</span>';}
async function sendClaimAction(kind){if(window.BCT_INSURANCE_MEMBER?.member_role==='read_only')return status('Your insurance account has read-only access.','error');const sb=window.supabaseClient;if(!sb||!activeClaim)return status('Select an authorized claim first.','error');const {data:session}=await sb.auth.getUser();if(!session?.user||session.user.id!==window.BCT_INSURANCE_MEMBER?.user_id){activeClaim=null;window.BCT_INSURANCE_MEMBER=null;return status('Your insurance session changed. Sign in again.','error')}const body=$('bctInsuranceClaimMessage')?.value.trim();if(!body)return status('Enter the information you want to send.','error');let error;if(kind==='information'){({error}=await sb.rpc('bct_insurance_respond_to_information_request',{p_claim_id:activeClaim,p_response:{response:body}}));}else{({error}=await sb.rpc('bct_insurance_add_claim_message',{p_claim_id:activeClaim,p_body:body}));}if(error)return status(error.message,'error');$('bctInsuranceClaimMessage').value='';status(kind==='information'?'Additional information returned to BCT Review.':'Claim message sent.','success');await loadClaims();if(activeClaim)await loadClaimHistory(activeClaim);}
window.BCT_INSURANCE_PORTAL_VERSION=VERSION;window.bctOpenInsurancePortal=()=>{ensure();setView('insurance')};window.bctInsurancePortalReady=true;
})();