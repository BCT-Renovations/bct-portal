/* BCT V46 Admin Estimator Management */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-estimator-admin-1';
  function root(){return document.getElementById('view-admin')}
  function ensurePanel(){
    const r=root();if(!r)return null;
    let p=document.getElementById('adminEstimatorManagement');if(p)return p;
    p=document.createElement('section');
    p.id='adminEstimatorManagement';p.className='card section';p.dataset.adminPagePanel='estimators';p.dataset.bctBoardInclude='1';
    p.innerHTML=`
      <div class="toolbar"><div><h3>Estimator Management</h3><p class="muted">BCT-only management for estimator applications, assignments, assessment review, payment eligibility, travel approvals, and history.</p></div></div>
      <div class="grid grid-4 section">
        <div class="card"><div class="metric" data-estimator-metric="applications">0</div><small>New Applications</small></div>
        <div class="card"><div class="metric" data-estimator-metric="assignments">0</div><small>Current Assignments</small></div>
        <div class="card"><div class="metric" data-estimator-metric="review">0</div><small>BCT Review</small></div>
        <div class="card"><div class="metric" data-estimator-metric="payment">0</div><small>Payment Eligible</small></div>
      </div>
      <div class="grid grid-2">
        <div class="stage"><h4>Applications & Verification</h4><p>Contact information • experience • qualified trades • service areas/jurisdictions • references • credentials/documents • background screening • BCT approval.</p></div>
        <div class="stage"><h4>Assignments & Scheduling</h4><p>Available estimators • current assignments • scheduling • service area/trade match • pre-approved unusual travel compensation.</p></div>
        <div class="stage"><h4>Assessment Review</h4><p>Site visit • standardized photos/videos • measurements • conditions • proposed scope • notes • additional-inspection flags • complete package • BCT review/approval.</p></div>
        <div class="stage"><h4>Payment & History</h4><p>Per completed assignment only. Eligibility begins after BCT accepts the complete package. Track completed assignments, approved travel, and estimator performance/history.</p></div>
      </div>
      <div class="notice section"><strong>Separation of duties:</strong> an estimator who assessed a project cannot bid on or perform that same project. This is enforced by the V46 estimator/contractor eligibility rules.</div>
      <div class="notice section"><strong>Admin Control Board:</strong> estimator-related urgent assessment items feed into JOBS. No fourth urgent panel is created.</div>`;
    const tabs=r.querySelector('.portal-tabs');
    if(tabs){
      if(!tabs.querySelector('[data-admin-page-tab="estimators"]')){
        const b=document.createElement('button');b.type='button';b.dataset.adminPageTab='estimators';b.textContent='Estimators';tabs.appendChild(b);
      }
      tabs.insertAdjacentElement('afterend',p);
    }else r.appendChild(p);
    return p;
  }
  function tagEstimatorUrgency(){
    const p=ensurePanel();if(!p)return;
    p.dataset.bctUrgentCategory='jobs';
  }
  function init(){ensurePanel();tagEstimatorUrgency()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.BCT_ESTIMATOR_ADMIN={VERSION,ensurePanel};
})();