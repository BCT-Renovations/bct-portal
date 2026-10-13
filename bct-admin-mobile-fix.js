/* BCT V46 admin mobile controls + phone overflow containment patch. */
(function(){
  'use strict';
  const VERSION='V46-2026.10.11-mobile-overflow-containment-live';
  const ROOT_ID='view-admin';
  window.BCT_ADMIN_MOBILE_FIX_VERSION=VERSION;

  function injectMobileContainment(){
    if(document.getElementById('bct-mobile-overflow-containment'))return;
    const style=document.createElement('style');
    style.id='bct-mobile-overflow-containment';
    style.textContent=`
      @media (max-width: 820px){
        html,body{
          width:100%!important;
          max-width:100%!important;
          overflow-x:hidden!important;
          overscroll-behavior-x:none!important;
          touch-action:pan-y!important;
        }
        body,*{
          max-width:100vw;
        }
        .wrap,main.wrap,header,.view,.card,.stage,.notice,.toolbar,.brand,.home-panel,.home-quick-grid,.customer-hero,.customer-actions,.grid,.grid-2,.grid-3,.grid-4{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          overflow-x:hidden!important;
        }
        .brand{align-items:flex-start!important;}
        .brand>div:last-child{min-width:0!important;max-width:calc(100vw - 110px)!important;overflow-wrap:anywhere!important;}
        img,svg,video,canvas,table,input,select,textarea,button,.btn{
          max-width:100%!important;
        }
        h1,h2,h3,h4,p,small,label,span,a,button,.btn,.muted,.notice{
          overflow-wrap:anywhere!important;
          word-break:normal!important;
        }
        nav,.home-quick-grid,.admin-project-actions,.admin-gate-actions,.quality-review-actions{
          display:grid!important;
          grid-template-columns:1fr!important;
          width:100%!important;
          max-width:100%!important;
        }
        nav button,.home-action-card,.admin-project-actions button,.quality-review-actions button{
          width:100%!important;
          min-width:0!important;
          white-space:normal!important;
        }
        table,.app-review-table,.bid-review-table{
          table-layout:fixed!important;
          width:100%!important;
          max-width:100%!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function adminRoot(){return document.getElementById(ROOT_ID)}
  function isAdminVisible(){const root=adminRoot();return !!root&&!root.classList.contains('hidden')}
  function showPage(page){
    const root=adminRoot(); if(!root||!page)return;
    root.querySelectorAll('[data-admin-page-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.adminPageTab===page));
    root.querySelectorAll('[data-admin-page-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.adminPagePanel===page));
  }
  function jumpTo(id){
    const root=adminRoot(); if(!root)return;
    const target=document.getElementById(id); if(!target||!root.contains(target))return;
    const page=target.dataset.adminPagePanel||target.closest('[data-admin-page-panel]')?.dataset.adminPagePanel;
    if(typeof window.BCT_ADMIN_CONTROL_BOARD_OPEN_PANEL==='function'){
      window.BCT_ADMIN_CONTROL_BOARD_OPEN_PANEL(target);
    }else if(page){
      showPage(page);
    }
    target.classList.add('bct-jump-highlight');
    setTimeout(()=>target.classList.remove('bct-jump-highlight'),1800);
  }
  function filterCommands(){
    const root=adminRoot(); if(!root)return;
    const input=root.querySelector('#bctCommandSearch');
    const results=root.querySelector('#bctCommandResults');
    const empty=root.querySelector('#bctCommandEmpty');
    if(!input||!results)return;
    const q=String(input.value||'').trim().toLowerCase();
    let matches=0;
    results.querySelectorAll('[data-admin-jump]').forEach(btn=>{
      const hay=((btn.dataset.commandLabel||'')+' '+(btn.textContent||'')).toLowerCase();
      const on=!q||hay.includes(q);
      btn.hidden=!on;
      if(on)matches++;
    });
    results.hidden=false;
    if(empty)empty.hidden=!q||matches>0;
  }
  function stabilizeTouchSurface(){
    injectMobileContainment();
    const root=adminRoot();
    if(!root)return;
    if(isAdminVisible()){
      root.removeAttribute('inert');
      root.removeAttribute('aria-hidden');
      root.style.pointerEvents='auto';
      ['view-home','view-admin-login'].forEach(id=>{
        const el=document.getElementById(id);
        if(el&&el.classList.contains('hidden'))el.style.pointerEvents='none';
      });
    }
    root.querySelectorAll('button,a,input,select,textarea,[role="button"]').forEach(el=>{
      if(el.disabled||el.getAttribute('aria-disabled')==='true')return;
      el.style.pointerEvents='auto';
      el.style.touchAction='manipulation';
    });
    root.querySelectorAll('#bctCommandResults [data-admin-jump]').forEach(btn=>{
      btn.style.color='#e0f2fe';
      btn.querySelectorAll('*').forEach(child=>child.style.color='inherit');
    });
  }
  function refresh(){stabilizeTouchSurface();}

  document.addEventListener('click',function(event){
    const root=adminRoot(); if(!root||!isAdminVisible())return;
    const tab=event.target?.closest?.('[data-admin-page-tab]');
    if(tab&&root.contains(tab)){
      event.preventDefault();
      showPage(tab.dataset.adminPageTab);
      requestAnimationFrame(refresh);
      return;
    }
    const jump=event.target?.closest?.('[data-admin-jump]');
    if(jump&&root.contains(jump)){
      event.preventDefault();
      jumpTo(jump.dataset.adminJump);
      requestAnimationFrame(refresh);
      return;
    }
    const close=event.target?.closest?.('#closeJobManagementBtn');
    if(close&&root.contains(close)){
      const panel=document.getElementById('jobManagementPanel');
      if(panel){event.preventDefault();panel.classList.add('hidden');panel.classList.remove('active');}
    }
  },true);
  document.addEventListener('input',function(event){if(event.target?.id==='bctCommandSearch')filterCommands();},true);
  document.addEventListener('change',function(event){
    if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(refresh,0);
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  window.addEventListener('orientationchange',()=>setTimeout(refresh,250),{passive:true});
  window.addEventListener('resize',()=>requestAnimationFrame(refresh),{passive:true});
})();
