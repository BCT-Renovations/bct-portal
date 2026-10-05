/* BCT V46 Admin navigation loader.
   Big Dog 3 derived branch: the long-scroll Admin section controller is replaced by the portal-style Admin Control Board. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-admin-control-board-loader-2-dedupe';
  window.BCT_ADMIN_SECTIONS_VERSION=VERSION;

  function loadOnce(src,marker){
    if(document.querySelector(`script[${marker}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(marker,'1');
    script.defer=true;
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[src*="/bct-admin-control-board.js"]')) loadOnce('/bct-admin-control-board.js?v=20260930-2','data-bct-admin-control-board');
  loadOnce('/bct-live-project-verification.js?v=20260930-1','data-bct-live-project-verification');
  loadOnce('/bct-admin-job-pages.js?v=20260930-2','data-bct-admin-job-pages');
  loadOnce('/bct-estimator-system.js?v=20260930-1','data-bct-estimator-system');
  loadOnce('/bct-estimator-portal.js?v=20261001-1','data-bct-estimator-portal');
  loadOnce('/bct-estimator-admin.js?v=20260930-1','data-bct-estimator-admin');
  loadOnce('/bct-photo-admin.js?v=20261005-2','data-bct-photo-admin');
  loadOnce('/agent-bct-photo-recommendation.js?v=20261005-6','data-agent-bct-photo-recommendation');
})();
