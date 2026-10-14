/* Isolated insurance visual-only preview. Never loads production insurance APIs or signs users in. */
(function(){
'use strict';
const id='bctInsurancePreviewEntry';
function open(){
 const main=document.getElementById('bctMain');if(!main)return;
 let panel=document.getElementById('view-insurance-preview');
 if(!panel){
  panel=document.createElement('section');panel.id='view-insurance-preview';panel.className='view section hidden';
  panel.innerHTML='<div class="card section"><div class="bct-portal-title">BCT INSURANCE PORTAL</div><h2>Insurance / Claims Partner</h2><p>Insurance companies, claims adjusters, and claims representatives can submit assignments to BCT for review.</p><div class="notice" role="status"><strong>Preview only:</strong> Insurance sign-in, claim submission, claim history, and Admin review are not enabled. No insurance data is being collected or changed.</div><div class="portal-tabs"><button type="button" data-ins-preview-tab="signin">Sign In</button><button type="button" data-ins-preview-tab="claim">Submit Claim</button><button type="button" data-ins-preview-tab="history">My Claims</button></div><div id="bctInsurancePreviewTab" class="card section"></div><button type="button" id="bctInsurancePreviewBack" class="secondary">Back to Home</button></div>';
  main.appendChild(panel);
  panel.querySelectorAll('[data-ins-preview-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.insPreviewTab)));
  document.getElementById('bctInsurancePreviewBack').addEventListener('click',()=>{if(typeof window.bctReturnToPublicLanding==='function')window.bctReturnToPublicLanding();else if(typeof window.setVisibleView==='function')window.setVisibleView('home');else{panel.classList.add('hidden');document.getElementById('view-home')?.classList.remove('hidden')}});
 }
 document.body.classList.remove('bct-entry-client','bct-entry-contractor','bct-entry-estimator','bct-entry-admin');
 if(typeof window.setVisibleView==='function')window.setVisibleView('insurance-preview');
 else {document.querySelectorAll('main .view').forEach(v=>v.classList.add('hidden'));panel.classList.remove('hidden')}
 tab('signin');
}
function tab(kind){
 const p=document.getElementById('bctInsurancePreviewTab');if(!p)return;
 const content={signin:'<h3>Insurance Partner Sign In</h3><p>Approved carrier representatives will sign in here when the secure database is ready.</p>',claim:'<h3>Submit a Claim Assignment</h3><p>Claim number, policyholder, property address, type and date of loss, scope, photos, and documents will be submitted for BCT review.</p><p>No construction project is created automatically.</p>',history:'<h3>My Authorized Claims</h3><p>Approved members will see only claims they are authorized to access, along with messages and status updates.</p>'};
 p.innerHTML=content[kind]||content.signin;
 document.querySelectorAll('[data-ins-preview-tab]').forEach(b=>b.classList.toggle('active',b.dataset.insPreviewTab===kind));
}
function init(){
 const btn=document.getElementById(id);if(!btn||btn.dataset.insPreviewBound)return;
 btn.dataset.insPreviewBound='1';btn.addEventListener('click',open);
 const style=document.createElement('style');style.id='bct-insurance-preview-visibility';
 style.textContent='body:not(.bct-authenticated) main#bctMain > section#view-insurance-preview.view:not(.hidden){display:block!important} body:not(.bct-authenticated) main#bctMain > section#view-insurance-preview.view.hidden{display:none!important}';
 document.head.appendChild(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
