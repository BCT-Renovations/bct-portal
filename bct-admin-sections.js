/* BCT V46 signed-in Admin section navigation.
   Organizes the existing Admin Portal without changing data, auth, RLS, or public portals. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-admin-sections-1';
  const ROOT_ID='view-admin';
  const COLLAPSED='bct-admin-section-collapsed';
  const historyStack=[];
  const selectedByPage=new Map();
  let scheduled=false;
  let applying=false;

  window.BCT_ADMIN_SECTIONS_VERSION=VERSION;

  const COPY={
    en:{back:'← Back',dashboard:'Admin Dashboard',sections:'Admin sections'},
    es:{back:'← Volver',dashboard:'Panel de administración',sections:'Secciones de administración'},
    fr:{back:'← Retour',dashboard:'Tableau de bord admin',sections:'Sections administrateur'},
    ht:{back:'← Retounen',dashboard:'Tablo Administrasyon',sections:'Seksyon administrasyon'},
    pt:{back:'← Voltar',dashboard:'Painel Administrativo',sections:'Seções administrativas'},
    vi:{back:'← Quay lại',dashboard:'Bảng điều khiển quản trị',sections:'Mục quản trị'},
    zh:{back:'← 返回',dashboard:'管理员控制面板',sections:'管理部分'},
    ar:{back:'رجوع ←',dashboard:'لوحة الإدارة',sections:'أقسام الإدارة'},
    ru:{back:'← Назад',dashboard:'Панель администратора',sections:'Разделы администратора'}
  };

  function root(){return document.getElementById(ROOT_ID)}
  function language(){
    try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}
    catch(_){return (document.documentElement.lang||'en').toLowerCase().split('-')[0]}
  }
  function copy(){return COPY[language()]||COPY.en}
  function signedInAdmin(){
    const r=root();
    return !!r && document.body.classList.contains('bct-authenticated') && !r.classList.contains('hidden');
  }
  function pageTabs(){return [...(root()?.querySelectorAll('[data-admin-page-tab]')||[])]}
  function panels(page){
    const r=root(); if(!r)return [];
    return [...r.querySelectorAll('[data-admin-page-panel]')].filter(panel=>panel.dataset.adminPagePanel===page);
  }
  function currentPage(){
    const active=pageTabs().find(tab=>tab.classList.contains('active'));
    return active?.dataset.adminPageTab||'launch';
  }
  function panelTitle(panel){
    const h=panel?.querySelector('h2,h3,h4');
    return (h?.textContent||panel?.id||'Section').trim();
  }
  function usablePanels(page){
    return panels(page).filter(panel=>!panel.classList.contains('hidden')||panel.id==='jobManagementPanel');
  }
  function visiblePanelId(page){
    const list=usablePanels(page);
    if(!list.length)return '';
    const preferred=selectedByPage.get(page);
    const selected=list.find(panel=>panel.id===preferred&&!panel.classList.contains('hidden'));
    if(selected)return selected.id;
    const first=list.find(panel=>!panel.classList.contains('hidden'))||list[0];
    return first?.id||'';
  }
  function state(){const page=currentPage();return {page,panel:visiblePanelId(page)}}
  function sameState(a,b){return !!a&&!!b&&a.page===b.page&&a.panel===b.panel}
  function remember(next){
    const prev=historyStack[historyStack.length-1];
    if(!sameState(prev,next))historyStack.push(next);
    if(historyStack.length>24)historyStack.shift();
  }
  function injectStyle(){
    if(document.getElementById('bct-admin-section-navigation-style'))return;
    const style=document.createElement('style');
    style.id='bct-admin-section-navigation-style';
    style.textContent=`
      #view-admin .${COLLAPSED}{display:none!important}
      #view-admin .bct-admin-panel-nav{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}
      #view-admin .bct-admin-back-btn,#view-admin .bct-admin-dashboard-btn,#bctAdminBackHome{
        background:#2563a6!important;color:#fff!important;border:1px solid #1d4f8c!important;
        min-height:46px!important;padding:10px 14px!important;border-radius:10px!important;
        font-weight:800!important;box-shadow:0 3px 10px rgba(37,99,166,.18)!important;
        touch-action:manipulation!important;pointer-events:auto!important
      }
      #view-admin .bct-admin-back-btn:focus-visible,#view-admin .bct-admin-dashboard-btn:focus-visible,#bctAdminBackHome:focus-visible{outline:3px solid #93c5fd!important;outline-offset:2px}
      #view-admin #bctAdminSectionSwitcher{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px;padding:10px;border:1px solid #cbdde0;border-radius:12px;background:#f8fbfc}
      #view-admin #bctAdminSectionSwitcher[hidden]{display:none!important}
      #view-admin #bctAdminSectionSwitcher .bct-admin-section-choice{background:#fff!important;color:#174b78!important;border:1px solid #9fc4e8!important;box-shadow:none!important;min-height:44px}
      #view-admin #bctAdminSectionSwitcher .bct-admin-section-choice.active{background:#2563a6!important;color:#fff!important;border-color:#1d4f8c!important}
      @media(max-width:820px){
        #view-admin #bctAdminSectionSwitcher{display:grid;grid-template-columns:1fr 1fr;position:sticky;top:148px;z-index:6}
        #view-admin #bctAdminSectionSwitcher .bct-admin-section-choice{width:100%;white-space:normal}
        #view-admin .bct-admin-panel-nav{position:sticky;top:96px;z-index:6;background:rgba(255,255,255,.96);padding:6px 0}
        #view-admin .bct-admin-back-btn,#view-admin .bct-admin-dashboard-btn{flex:1;min-width:135px}
      }
      @media(max-width:430px){#view-admin #bctAdminSectionSwitcher{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function ensureSwitcher(){
    const r=root(); if(!r)return null;
    let switcher=r.querySelector('#bctAdminSectionSwitcher');
    if(switcher)return switcher;
    const tabs=r.querySelector('.portal-tabs');
    if(!tabs)return null;
    switcher=document.createElement('div');
    switcher.id='bctAdminSectionSwitcher';
    switcher.setAttribute('role','navigation');
    tabs.insertAdjacentElement('afterend',switcher);
    return switcher;
  }
  function dashboard(){
    const r=root(); if(!r)return;
    requestAnimationFrame(()=>r.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  function restore(target,push=false){
    if(!target)return dashboard();
    applyPage(target.page,target.panel,push);
  }
  function goBack(){
    if(historyStack.length>1){
      historyStack.pop();
      restore(historyStack[historyStack.length-1],false);
      return;
    }
    dashboard();
  }
  function ensurePanelNav(panel){
    if(!panel||panel.querySelector(':scope > .bct-admin-panel-nav'))return;
    const nav=document.createElement('div');
    nav.className='bct-admin-panel-nav';
    const back=document.createElement('button');
    back.type='button';back.className='bct-admin-back-btn';back.dataset.bctAdminBack='1';
    const dash=document.createElement('button');
    dash.type='button';dash.className='bct-admin-dashboard-btn';dash.dataset.bctAdminDashboard='1';
    nav.append(back,dash);
    panel.prepend(nav);
  }
  function updateNavCopy(){
    const r=root(); if(!r)return;
    const t=copy();
    r.querySelectorAll('.bct-admin-back-btn').forEach(btn=>{if(btn.textContent!==t.back)btn.textContent=t.back});
    r.querySelectorAll('.bct-admin-dashboard-btn').forEach(btn=>{if(btn.textContent!==t.dashboard)btn.textContent=t.dashboard});
    const switcher=r.querySelector('#bctAdminSectionSwitcher');
    if(switcher&&switcher.getAttribute('aria-label')!==t.sections)switcher.setAttribute('aria-label',t.sections);
  }
  function renderSwitcher(page,selectedId){
    const switcher=ensureSwitcher(); if(!switcher)return;
    const list=usablePanels(page).filter(panel=>!panel.classList.contains('hidden'));
    const t=copy();
    switcher.setAttribute('aria-label',t.sections);
    switcher.replaceChildren();
    if(list.length<=1){switcher.hidden=true;return}
    switcher.hidden=false;
    list.forEach(panel=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='bct-admin-section-choice'+(panel.id===selectedId?' active':'');
      btn.dataset.bctAdminSection=panel.id;
      btn.dataset.bctAdminPage=page;
      btn.textContent=panelTitle(panel);
      switcher.appendChild(btn);
    });
  }
  function applyPage(page,preferredId='',push=false){
    if(applying||!signedInAdmin())return;
    applying=true;
    try{
      injectStyle();
      const r=root(); if(!r)return;
      pageTabs().forEach(tab=>tab.classList.toggle('active',tab.dataset.adminPageTab===page));
      const list=panels(page);
      r.querySelectorAll('[data-admin-page-panel]').forEach(panel=>{
        const onPage=panel.dataset.adminPagePanel===page;
        panel.classList.toggle('active',onPage);
        if(!onPage)panel.classList.add(COLLAPSED);
      });
      let chosen=list.find(panel=>panel.id===preferredId&&!panel.classList.contains('hidden'));
      if(!chosen){
        const saved=selectedByPage.get(page);
        chosen=list.find(panel=>panel.id===saved&&!panel.classList.contains('hidden'));
      }
      if(!chosen)chosen=list.find(panel=>!panel.classList.contains('hidden'))||list[0];
      list.forEach(panel=>panel.classList.toggle(COLLAPSED,panel!==chosen));
      if(chosen)selectedByPage.set(page,chosen.id);
      list.forEach(ensurePanelNav);
      updateNavCopy();
      renderSwitcher(page,chosen?.id||'');
      const next={page,panel:chosen?.id||''};
      if(push)remember(next);
      if(!historyStack.length)remember(next);
      requestAnimationFrame(()=>{
        const tabs=r.querySelector('.portal-tabs');
        (tabs||r).scrollIntoView({behavior:'smooth',block:'start'});
      });
    }finally{applying=false}
  }
  function choosePanel(page,panelId,push=true){
    selectedByPage.set(page,panelId);
    applyPage(page,panelId,push);
  }
  function sync(){
    scheduled=false;
    if(!signedInAdmin())return;
    const page=currentPage();
    const management=document.getElementById('jobManagementPanel');
    if(page==='jobs'&&management&&!management.classList.contains('hidden'))selectedByPage.set('jobs','jobManagementPanel');
    applyPage(page,selectedByPage.get(page)||'',false);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}

  document.addEventListener('click',event=>{
    if(!signedInAdmin())return;
    const r=root(); if(!r)return;
    const back=event.target?.closest?.('[data-bct-admin-back]');
    if(back&&r.contains(back)){event.preventDefault();goBack();return}
    const dash=event.target?.closest?.('[data-bct-admin-dashboard]');
    if(dash&&r.contains(dash)){event.preventDefault();dashboard();return}
    const section=event.target?.closest?.('[data-bct-admin-section]');
    if(section&&r.contains(section)){
      event.preventDefault();
      choosePanel(section.dataset.bctAdminPage||currentPage(),section.dataset.bctAdminSection,true);
      return;
    }
    const tab=event.target?.closest?.('[data-admin-page-tab]');
    if(tab&&r.contains(tab)){
      const page=tab.dataset.adminPageTab;
      setTimeout(()=>applyPage(page,selectedByPage.get(page)||'',true),0);
      return;
    }
    const jump=event.target?.closest?.('[data-admin-jump]');
    if(jump&&r.contains(jump)){
      const target=document.getElementById(jump.dataset.adminJump);
      const panel=target?.matches?.('[data-admin-page-panel]')?target:target?.closest?.('[data-admin-page-panel]');
      const page=panel?.dataset.adminPagePanel;
      if(page&&panel?.id)setTimeout(()=>choosePanel(page,panel.id,true),0);
      return;
    }
    const close=event.target?.closest?.('#closeJobManagementBtn');
    if(close&&r.contains(close)){
      setTimeout(()=>{selectedByPage.set('jobs','jobHealthDashboard');applyPage('jobs','jobHealthDashboard',false)},0);
    }
  },true);

  document.addEventListener('change',event=>{
    if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(()=>{updateNavCopy();schedule()},0);
  },true);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('hashchange',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','lang','aria-hidden','inert']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
