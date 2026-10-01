/* BCT V46 Estimator Portal — separate role, application, sign in, assignments and assessment package */
(function(){
'use strict';
const VERSION='V46-2026.10.01-estimator-portal-2-mobile';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function setView(name){ if(typeof window.setVisibleView==='function')return window.setVisibleView(name); document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name)?.classList.remove('hidden'); }
function status(msg,type='notice'){const x=$('bctEstimatorStatus');if(x)x.innerHTML='<div class="'+type+'">'+esc(msg)+'</div>'}
function ensure(){
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
   <div class="grid grid-2"><div><label>Legal Name</label><input name="legal_name" required></div><div><label>Business / Company (optional)</label><input name="business_name"></div><div><label>Phone</label><input name="phone" type="tel" required></div><div><label>Email</label><input name="email" type="email" required></div><div><label>Construction / Estimating Experience</label><textarea name="experience" required></textarea></div><div><label>Qualified Trades</label><textarea name="trades" required placeholder="Example: roofing, siding, drywall"></textarea></div><div><label>Service Areas / Jurisdictions</label><textarea name="jurisdictions" required></textarea></div><div><label>References</label><textarea name="references" required></textarea></div><div><label>Credentials / Documents</label><input name="credentials" type="file" multiple></div><div><label>Background Screening</label><select name="background_consent" required><option value="">Select</option><option value="yes">I understand BCT verification/background screening is required.</option></select></div></div>
   <label><input name="accuracy" type="checkbox" required style="width:auto"> I certify the information submitted is accurate.</label><button type="submit">Submit Estimator Application</button>
  </form>
 </div>
 <div class="card section hidden" data-estimator-panel="assignments"><h3>Current Assignments</h3><p class="muted">Only BCT-assigned site assessments appear here. Normal travel is included in the assignment fee. Any unusual-distance travel amount must be approved before acceptance.</p><div id="bctEstimatorAssignments"><div class="notice">No estimator assignment loaded.</div></div></div>
 <div class="card section hidden" data-estimator-panel="assessment"><h3>Site Assessment Package</h3><p class="muted">Complete all required field documentation. Submission goes to BCT Review and is not released for contractor bidding until BCT approves it.</p>
  <form id="bctAssessmentPackage"><div class="grid grid-2"><div><label>Project / Assignment Number</label><input name="project_id" required></div><div><label>Visit Date</label><input name="visit_date" type="date" required></div><div><label>Standardized Photos</label><input name="photos" type="file" accept="image/*" multiple required></div><div><label>Videos (when needed)</label><input name="videos" type="file" accept="video/*" multiple></div><div><label>Measurements</label><textarea name="measurements" required></textarea></div><div><label>Property / Project Conditions</label><textarea name="conditions" required></textarea></div><div><label>Proposed Scope</label><textarea name="scope" required></textarea></div><div><label>Estimating Notes</label><textarea name="notes" required></textarea></div><div><label>Additional Inspection Required?</label><select name="additional_inspection"><option>No</option><option>Yes</option></select></div><div><label>Additional Inspection Details</label><textarea name="inspection_details"></textarea></div></div><label><input name="complete" type="checkbox" required style="width:auto"> I confirm the required site visit, photos, measurements, documentation, and assessment package are complete.</label><button type="submit">Submit Complete Package to BCT</button></form></div>
 <div class="card section hidden" data-estimator-panel="account"><h3>Estimator Account</h3><p>Payment basis: <strong>per completed assignment</strong>. Payment eligibility begins only after BCT accepts the complete assessment package.</p><p>No default hourly pay, no percentage of the construction contract, and no open-ended gas allowance.</p><div class="notice"><strong>Required separation:</strong> You cannot bid on or perform a project you assessed for BCT.</div></div>
 <div id="bctEstimatorStatus" class="section"></div><button type="button" class="secondary" id="bctEstimatorBackHome">Back to Home</button>`;
 main.appendChild(s);
 document.querySelectorAll('[data-estimator-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.estimatorPage)));
 $('bctEstimatorApplyOpen')?.addEventListener('click',()=>$('bctEstimatorApplication')?.classList.remove('hidden'));
 $('bctEstimatorBackHome')?.addEventListener('click',()=>window.bctReturnToPublicLanding?.()||setView('home'));
 $('bctEstimatorSignIn')?.addEventListener('click',signIn);
 $('bctEstimatorApplication')?.addEventListener('submit',submitApplication);
 $('bctAssessmentPackage')?.addEventListener('submit',submitAssessment);
 }
function showPage(page){
 document.querySelectorAll('[data-estimator-page]').forEach(b=>b.classList.toggle('active',b.dataset.estimatorPage===page));
 document.querySelectorAll('[data-estimator-panel]').forEach(p=>p.classList.toggle('hidden',p.dataset.estimatorPanel!==page));
}
async function signIn(){
 const email=$('bctEstimatorEmail')?.value?.trim(),password=$('bctEstimatorPassword')?.value||'';
 if(!email||!password)return status('Enter estimator email and password.','notice');
 try{
  const r=await window.supabaseClient?.auth?.signInWithPassword?.({email,password});if(r?.error)throw r.error;
  const user=r?.data?.user;if(!window.BCT_ESTIMATOR_SYSTEM?.canEstimatorAccess(user)){await window.supabaseClient?.auth?.signOut?.({scope:'local'});throw new Error('This account is not authorized as a BCT Estimator.');}
  document.body.classList.add('bct-authenticated');showPage('assignments');status('Estimator signed in.');
 }catch(e){status(e.message||'Estimator sign in failed.','notice')}
}
async function submitApplication(e){
 e.preventDefault();const f=new FormData(e.currentTarget);
 const payload={legal_name:f.get('legal_name'),business_name:f.get('business_name'),phone:f.get('phone'),email:f.get('email'),experience:f.get('experience'),trades:String(f.get('trades')||'').split(',').map(x=>x.trim()).filter(Boolean),service_jurisdictions:String(f.get('jurisdictions')||'').split(',').map(x=>x.trim()).filter(Boolean),references_data:[String(f.get('references')||'')],background_status:'pending',approval_status:'pending'};
 try{
  const r=await window.supabaseClient?.from?.('bct_estimator_applications')?.insert?.(payload);if(r?.error)throw r.error;
  e.currentTarget.reset();e.currentTarget.classList.add('hidden');status('Estimator application submitted to BCT for verification and approval.');
 }catch(err){status(err.message||'Estimator application could not be submitted.','notice')}
}
async function submitAssessment(e){
 e.preventDefault();const f=new FormData(e.currentTarget);const projectId=String(f.get('project_id')||'').trim();
 const session=await window.supabaseClient?.auth?.getSession?.();const user=session?.data?.session?.user;
 if(!window.BCT_ESTIMATOR_SYSTEM?.canEstimatorAccess(user))return status('Estimator sign in is required.','notice');
 const payload={project_id:projectId,estimator_user_id:user.id,status:'assessment_submitted',site_visit_complete:true,photos_complete:true,measurements_complete:!!String(f.get('measurements')||'').trim(),documentation_complete:true,assessment_package:{visit_date:f.get('visit_date'),measurements:f.get('measurements'),conditions:f.get('conditions'),scope:f.get('scope'),notes:f.get('notes'),additional_inspection:f.get('additional_inspection'),inspection_details:f.get('inspection_details')}};
 try{
  const r=await window.supabaseClient?.rpc?.('bct_submit_assessment_package',{p_project_id:projectId,p_package:payload.assessment_package,p_site_visit_complete:true,p_photos_complete:true,p_measurements_complete:payload.measurements_complete,p_documentation_complete:true});if(r?.error)throw r.error;
  status('Assessment package submitted. Status: BCT Review. Contractors cannot use it until BCT approves it.');
 }catch(err){status(err.message||'Assessment package could not be submitted.','notice')}
}
ensure();
window.BCT_ESTIMATOR_PORTAL={VERSION,ensure,showPage,open(){ensure();setView('estimator');showPage('signin')}};
})();