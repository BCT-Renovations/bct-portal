/* BCT V46 Estimator Portal — separate role, application, sign in, assignments and assessment package */
(function(){
'use strict';
const VERSION='V46-2026.10.15-estimator-offline-safety';
let authGeneration=0,currentUser=null,assignments=[],applicationBusy=false,assessmentBusy=false,signInBusy=false,authBound=false;
const submittedApplications=new Set();
function client(){const c=window.supabaseClient;if(!c?.auth||typeof c.from!=='function')throw new Error('Estimator service is unavailable. Your draft has been kept.');return c;}
function lock(form,busy){form?.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=busy);form?.setAttribute('aria-busy',String(busy));}
async function verifiedUser(){const c=client();if(typeof c.auth.getUser!=='function')throw new Error('Secure account verification is unavailable.');const r=await c.auth.getUser();if(r?.error||!r?.data?.user)throw new Error('Estimator sign in is required.');const u=r.data.user;if(!window.BCT_ESTIMATOR_SYSTEM?.canEstimatorAccess(u))throw new Error('This account is not authorized as a BCT Estimator.');return u;}
function clearAccount(){authGeneration++;currentUser=null;assignments=[];const select=$('bctEstimatorAssignment');if(select)select.innerHTML='<option value="">Sign in to load assigned assessments</option>';const list=$('bctEstimatorAssignments');if(list)list.textContent='Sign in to load assigned assessments.';const account=$('bctEstimatorAccountData');if(account)account.textContent='Sign in to load your account.';}
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function setView(name){ if(typeof window.setVisibleView==='function')return window.setVisibleView(name); document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name)?.classList.remove('hidden'); }
function status(msg,type='notice'){const x=$('bctEstimatorStatus');if(x)x.innerHTML='<div class="'+type+'">'+esc(msg)+'</div>'}
function ensure(){
 if(!authBound&&window.supabaseClient?.auth?.onAuthStateChange){authBound=true;window.supabaseClient.auth.onAuthStateChange((_event,session)=>{const changed=currentUser?.id&&currentUser.id!==session?.user?.id;clearAccount();if(changed){$('bctAssessmentPackage')?.reset();$('bctEstimatorApplication')?.reset();}});}
 if($('view-estimator'))return;
 if(!$('bct-estimator-mobile-style')){const st=document.createElement('style');st.id='bct-estimator-mobile-style';st.textContent=`#view-estimator,#view-estimator *{box-sizing:border-box}#view-estimator{width:100%;max-width:100%;overflow-x:hidden}#view-estimator .card,#view-estimator .grid,#view-estimator .grid>div,#view-estimator input,#view-estimator select,#view-estimator textarea{min-width:0;max-width:100%}#view-estimator input,#view-estimator select,#view-estimator textarea{width:100%}@media(max-width:820px){#view-estimator .grid-2{grid-template-columns:minmax(0,1fr)}#view-estimator .portal-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}#view-estimator .portal-tabs button{min-width:0;white-space:normal}}@media(max-width:390px){#view-estimator .portal-tabs{grid-template-columns:minmax(0,1fr)}}`;document.head.appendChild(st);}
 const main=$('bctMain')||document.querySelector('main');if(!main)return;
 const s=document.createElement('section');s.id='view-estimator';s.className='view section hidden';
 s.innerHTML=`
 <div class="bct-portal-title">ESTIMATOR PORTAL</div>
 <div class="card section"><span class="badge info">BCT Estimator Portal</span><h2>Professional Site Assessment</h2>
 <p class="muted">BCT first attempts a free remote estimate. Approved estimators are assigned only when BCT determines a professional site assessment is required.</p>
 <div class="portal-tabs"><button type="button" data-estimator-page="signin" class="active">Sign In / Apply</button><button type="button" data-estimator-page="assignments">Assignments</button><button type="button" data-estimator-page="assessment">Assessment Package</button><button type="button" data-estimator-page="account">Account</button></div></div>
 <div class="card section" data-estimator-panel="signin">
  <div class="grid grid-2"><div><h3>Existing Estimator — Sign In</h3><label data-i18n="estimator.email">Email</label><input id="bctEstimatorEmail" type="email" autocomplete="email"><label>Password</label><input id="bctEstimatorPassword" type="password" autocomplete="current-password"><button type="button" id="bctEstimatorSignIn" style="margin-top:10px">Sign In</button></div>
  <div><h3>New Estimator — Apply</h3><p class="muted">Create an estimator application for BCT verification and approval.</p><button type="button" id="bctEstimatorApplyOpen">Start Estimator Application</button></div></div>
  <form id="bctEstimatorApplication" class="section hidden">
   <div class="grid grid-2"><div><label>Legal Name</label><input name="legal_name" required></div><div><label>Business / Company (optional)</label><input name="business_name"></div><div><label>Phone</label><input name="phone" type="tel" required></div><div><label>Email</label><input name="email" type="email" required></div><div><label>Construction / Estimating Experience</label><textarea name="experience" required></textarea></div><div><label>Qualified Trades</label><textarea name="trades" required placeholder="Example: roofing, siding, drywall"></textarea></div><div><label>Service Areas / Jurisdictions</label><textarea name="jurisdictions" required></textarea></div><div><label>References</label><textarea name="references" required></textarea></div><div><label>Credentials / Documents</label><input name="credentials" type="file" multiple><p class="muted">Private credential upload is pending verification. Selected files will never be silently discarded.</p></div><div><label>Background Screening</label><select name="background_consent" required><option value="">Select</option><option value="yes">I understand BCT verification/background screening is required.</option></select></div></div>
   <label><input name="accuracy" type="checkbox" required style="width:auto"> I certify the information submitted is accurate.</label><button type="submit">Submit Estimator Application</button>
  </form>
 </div>
 <div class="card section hidden" data-estimator-panel="assignments"><h3>Current Assignments</h3><p class="muted">Only BCT-assigned site assessments appear here. Normal travel is included in the assignment fee. Any unusual-distance travel amount must be approved before acceptance.</p><div id="bctEstimatorAssignments"><div class="notice">No estimator assignment loaded.</div></div></div>
 <div class="card section hidden" data-estimator-panel="assessment"><h3>Site Assessment Package</h3><p class="muted">Complete all required field documentation. Submission goes to BCT Review and is not released for contractor bidding until BCT approves it.</p>
  <form id="bctAssessmentPackage"><div class="grid grid-2"><div><label>Project / Assignment Number</label><select name="project_id" id="bctEstimatorAssignment" required><option value="">Sign in to load assigned assessments</option></select></div><div><label>Visit Date</label><input name="visit_date" type="date" required></div><div><label>Standardized Photos</label><input name="photos" type="file" accept="image/*" multiple required></div><div><label>Videos (when needed)</label><input name="videos" type="file" accept="video/*" multiple></div><div><label>Measurements</label><textarea name="measurements" required></textarea></div><div><label>Property / Project Conditions</label><textarea name="conditions" required></textarea></div><div><label>Proposed Scope</label><textarea name="scope" required></textarea></div><div><label>Estimating Notes</label><textarea name="notes" required></textarea></div><div><label>Additional Inspection Required?</label><select name="additional_inspection"><option>No</option><option>Yes</option></select></div><div><label>Additional Inspection Details</label><textarea name="inspection_details"></textarea></div></div><label><input name="complete" type="checkbox" required style="width:auto"> I confirm the required site visit, photos, measurements, documentation, and assessment package are complete.</label><button type="submit">Submit Complete Package to BCT</button></form></div>
 <div class="card section hidden" data-estimator-panel="account"><h3>Estimator Account</h3><div id="bctEstimatorAccountData">Sign in to load your account.</div><p>Payment basis: <strong>per completed assignment</strong>. Payment eligibility begins only after BCT accepts the complete assessment package.</p><p>No default hourly pay, no percentage of the construction contract, and no open-ended gas allowance.</p><div class="notice"><strong>Required separation:</strong> You cannot bid on or perform a project you assessed for BCT.</div></div>
 <div id="bctEstimatorStatus" role="status" aria-live="polite" class="section"></div><button type="button" class="secondary" id="bctEstimatorBackHome">Back</button>`;
 main.appendChild(s);
 document.querySelectorAll('[data-estimator-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.estimatorPage)));
 $('bctEstimatorApplyOpen')?.addEventListener('click',()=>{const form=$('bctEstimatorApplication');form?.classList.remove('hidden');form?.scrollIntoView({block:'start',behavior:'smooth'});});
 $('bctEstimatorBackHome')?.addEventListener('click',()=>{const form=$('bctEstimatorApplication');if(form&&!form.classList.contains('hidden')){form.classList.add('hidden');$('bctEstimatorApplyOpen')?.scrollIntoView({block:'center',behavior:'smooth'});return;}window.bctReturnToPublicLanding?.()||setView('home');});
 $('bctEstimatorSignIn')?.addEventListener('click',signIn);
 $('bctEstimatorApplication')?.addEventListener('submit',submitApplication);
 $('bctAssessmentPackage')?.addEventListener('submit',submitAssessment);
 }
function showPage(page){
 if(!['signin','assignments','assessment','account'].includes(page))return;
 if(['assignments','assessment','account'].includes(page))loadAccount();
 document.querySelectorAll('[data-estimator-page]').forEach(b=>b.classList.toggle('active',b.dataset.estimatorPage===page));
 document.querySelectorAll('[data-estimator-panel]').forEach(p=>p.classList.toggle('hidden',p.dataset.estimatorPanel!==page));
}
async function loadAccount(){
 const generation=++authGeneration;
 try{
  const user=await verifiedUser(),c=client();if(generation!==authGeneration)return;
  const [rows,profile]=await Promise.all([
   c.from('bct_site_assessments').select('id,project_id,estimator_user_id,status,fee_paid_at,scheduled_for,site_visit_complete,estimator_assignment_fee,extra_travel_preapproved,extra_travel_amount,created_at').eq('estimator_user_id',user.id).order('created_at',{ascending:false}),
   c.from('bct_estimator_profiles').select('user_id,approval_status,available,trades,service_jurisdictions,background_status').eq('user_id',user.id).maybeSingle()
  ]);
  if(generation!==authGeneration)return;
  if(!rows||rows.error||!Array.isArray(rows.data)||!profile||profile.error)throw new Error('Account information could not be loaded. Retry when the service is available.');
  currentUser=user;assignments=rows.data.filter(row=>row.estimator_user_id===user.id);
  $('bctEstimatorAssignments').innerHTML=assignments.length?assignments.map(row=>'<div class="notice"><strong>'+esc(row.project_id)+'</strong><br>'+esc(window.BCT_ESTIMATOR_SYSTEM?.LABELS?.[row.status]||row.status)+'<br>Scheduled: '+esc(row.scheduled_for||'Not scheduled')+'<br>Assignment fee: $'+esc(Number(row.estimator_assignment_fee||0).toFixed(2))+'<br>Extra travel: '+(row.extra_travel_preapproved?'BCT approved $'+esc(Number(row.extra_travel_amount||0).toFixed(2)):'No extra travel approved')+'</div>').join(''):'No assignments are assigned to your account.';
  const select=$('bctEstimatorAssignment'),selected=select?.value;
  if(select){select.innerHTML='<option value="">Select an assigned assessment</option>'+assignments.filter(row=>row.status==='site_assessment_completed'&&row.fee_paid_at).map(row=>'<option value="'+esc(row.project_id)+'">'+esc(row.project_id)+'</option>').join('');if(assignments.some(row=>row.project_id===selected))select.value=selected;}
  const p=profile.data;
  $('bctEstimatorAccountData').innerHTML=p?'<p>Approval: '+esc(p.approval_status)+' · Background: '+esc(p.background_status)+'</p><p>Availability: '+(p.available?'Available':'Unavailable')+'</p><p>Trades: '+esc((p.trades||[]).join(', '))+'</p><p>Service areas: '+esc((p.service_jurisdictions||[]).join(', '))+'</p>':'No estimator profile is available for this account.';
 }catch(error){if(generation===authGeneration){clearAccount();status(error.message,'notice');}}
}
async function signIn(){
 if(signInBusy)return;signInBusy=true;const button=$('bctEstimatorSignIn');if(button)button.disabled=true;
 try{
  const c=client();let existing=await c.auth.getUser();
  if(existing?.data?.user){if(!window.BCT_ESTIMATOR_SYSTEM?.canEstimatorAccess(existing.data.user))throw new Error('This account is not authorized as a BCT Estimator.');}
  else{
   const email=$('bctEstimatorEmail')?.value?.trim(),password=$('bctEstimatorPassword')?.value||'';
   if(!email||!password)throw new Error('Enter estimator email and password.');
   const r=await c.auth.signInWithPassword({email,password});if(!r||r.error||!r.data?.user)throw new Error('Estimator sign in failed.');
   if(!window.BCT_ESTIMATOR_SYSTEM?.canEstimatorAccess(r.data.user))throw new Error('This account is not authorized as a BCT Estimator.');
  }
  await verifiedUser();document.body.classList.add('bct-authenticated');showPage('assignments');status('Estimator signed in.');
 }catch(error){status(error.message||'Estimator sign in failed.','notice');}
 finally{if($('bctEstimatorPassword'))$('bctEstimatorPassword').value='';signInBusy=false;if(button)button.disabled=false;}
}
async function submitApplication(e){
 e.preventDefault();const form=e.currentTarget;if(applicationBusy||!form?.reportValidity())return;
 applicationBusy=true;lock(form,true);
 try{
  const c=client(),f=new FormData(form),email=String(f.get('email')||'').trim().toLowerCase();
  if(submittedApplications.has(email))throw new Error('This application was already submitted in this session.');
  if(f.getAll('credentials').some(file=>file?.size>0))throw new Error('Private credential upload is not available yet. Your files and application draft have been kept.');
  const payload={legal_name:String(f.get('legal_name')||'').trim(),business_name:String(f.get('business_name')||'').trim(),phone:String(f.get('phone')||'').trim(),email,experience:String(f.get('experience')||'').trim(),trades:String(f.get('trades')||'').split(',').map(x=>x.trim()).filter(Boolean),service_jurisdictions:String(f.get('jurisdictions')||'').split(',').map(x=>x.trim()).filter(Boolean),references_data:[String(f.get('references')||'').trim()],background_status:'pending',approval_status:'pending'};
  if(!payload.legal_name||!payload.phone||!payload.email||!payload.experience||!payload.trades.length||!payload.service_jurisdictions.length||!payload.references_data[0]||f.get('background_consent')!=='yes'||!f.get('accuracy'))throw new Error('Complete the required application fields and confirmations.');
  const r=await c.from('bct_estimator_applications').insert(payload);if(!r||r.error)throw new Error(r?.error?.code==='23505'?'An application already exists for this email. Contact BCT for its status.':'Application could not be submitted. Your draft has been kept.');
  submittedApplications.add(email);form.reset();form.classList.add('hidden');status('Estimator application submitted to BCT for verification and approval.');
 }catch(error){status(error.message||'Estimator application could not be submitted.','notice');}
 finally{applicationBusy=false;lock(form,false);}
}
async function submitAssessment(e){
 e.preventDefault();const form=e.currentTarget;if(assessmentBusy||!form?.reportValidity())return;
 assessmentBusy=true;lock(form,true);
 try{
  const user=await verifiedUser(),c=client(),f=new FormData(form),projectId=String(f.get('project_id')||'').trim();
  const row=assignments.find(a=>a.project_id===projectId&&a.estimator_user_id===user.id);
  if(currentUser?.id!==user.id||!row||row.status!=='site_assessment_completed'||!row.fee_paid_at)throw new Error('Load a paid, completed assessment assigned to your account before submitting.');
  // No approved estimator private-storage policy exists in the current source.
  // Never mark selected local files as uploaded evidence or assert completeness.
  if(f.getAll('photos').some(file=>file?.size>0)||f.getAll('videos').some(file=>file?.size>0))throw new Error('Private assessment upload is not available yet. Your assessment draft and selected files have been kept.');
  throw new Error('Verified private photo evidence is required before an assessment package can be submitted. Your draft has been kept.');
 }catch(error){status(error.message||'Assessment package could not be submitted.','notice');}
 finally{assessmentBusy=false;lock(form,false);}
}

ensure();
window.BCT_ESTIMATOR_PORTAL={VERSION,ensure,showPage,loadAccount,open(){ensure();setView('estimator');showPage('signin');}};
})();