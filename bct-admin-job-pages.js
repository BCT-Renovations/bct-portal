/* BCT V46 Admin job-management page flips.
   Keeps existing Admin job controls intact while showing one job-management section at a time. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-admin-job-pages-1';
  window.BCT_ADMIN_JOB_PAGES_VERSION=VERSION;

  const COPY={
    en:{section:'Job Management Section',previous:'← Previous',next:'Next →'},
    es:{section:'Sección de gestión del trabajo',previous:'← Anterior',next:'Siguiente →'},
    fr:{section:'Section de gestion du chantier',previous:'← Précédent',next:'Suivant →'},
    ht:{section:'Seksyon jesyon travay',previous:'← Anvan',next:'Apre →'},
    pt:{section:'Seção de gestão do trabalho',previous:'← Anterior',next:'Próximo →'},
    vi:{section:'Mục quản lý công việc',previous:'← Trước',next:'Tiếp →'},
    zh:{section:'工作管理部分',previous:'← 上一项',next:'下一项 →'},
    ar:{section:'قسم إدارة العمل',previous:'السابق ←',next:'→ التالي'},
    ru:{section:'Раздел управления работой',previous:'← Назад',next:'Далее →'}
  };
  const LABELS={
    jobStatusForm:'Job Status',jobScheduleForm:'Schedule',bctLiveVerificationForm:'Live Project Verification',
    bctLiveVerificationListCard:'Live Verification Results',jobWeatherForm:'Weather',jobMaterialForm:'Add Material',
    jobChangeOrderForm:'Change Order',jobApprovalForm:'Approval Request',jobFinanceForm:'Financing',jobEscrowForm:'Escrow',
    jobMilestoneForm:'Completion Milestone'
  };
  let selectedId='';
  let observer=null;

  const $=id=>document.getElementById(id);
  function language(){try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}catch(_){return 'en'}}
  function copy(){return COPY[language()]||COPY.en}
  function panel(){return $('jobManagementPanel')}
  function grid(){const p=panel();return p?.querySelector(':scope > .grid.grid-2.section')||null}
  function pages(){const g=grid();return g?[...g.children].filter(el=>el.classList.contains('stage')):[]}
  function titleFor(el,index){return LABELS[el.id]||(el.querySelector('h3')?.textContent||`Section ${index+1}`).trim()}
  function injectStyle(){
    if($('bct-admin-job-pages-style'))return;
    const style=document.createElement('style');style.id='bct-admin-job-pages-style';style.textContent=`
      #jobManagementPanel .bct-job-page-hidden{display:none!important}
      #jobManagementPanel .bct-job-paged-grid{display:block!important}
      #jobManagementPanel .bct-job-paged-grid>.stage:not(.bct-job-page-hidden){width:100%;margin:0}
      #bctJobPageNav{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:end;margin:12px 0;padding:12px;border:1px solid #cbdde0;border-radius:12px;background:#f8fbfc;position:sticky;top:96px;z-index:7}
      #bctJobPageNav label{margin:0}
      #bctJobPageNav select{min-height:46px}
      #bctJobPagePrev,#bctJobPageNext{background:#2563a6!important;color:#fff!important;border:1px solid #1d4f8c!important;min-height:46px!important;border-radius:10px!important;font-weight:800!important;touch-action:manipulation!important}
      #bctJobPagePrev:disabled,#bctJobPageNext:disabled{opacity:.45!important}
      @media(max-width:620px){#bctJobPageNav{grid-template-columns:1fr 1fr}#bctJobPageNav .bct-job-page-select-wrap{grid-column:1/-1}#bctJobPagePrev,#bctJobPageNext{width:100%}}
    `;document.head.appendChild(style);
  }
  function ensureIds(list){list.forEach((el,index)=>{if(!el.id){el.id=`bctJobManagedSection${index+1}`}})}
  function ensureNav(){
    const p=panel(),g=grid();if(!p||!g)return null;injectStyle();g.classList.add('bct-job-paged-grid');
    let nav=$('bctJobPageNav');if(nav)return nav;
    nav=document.createElement('div');nav.id='bctJobPageNav';
    nav.innerHTML='<div class="bct-job-page-select-wrap"><label for="bctJobPageSelect"></label><select id="bctJobPageSelect"></select></div><button type="button" id="bctJobPagePrev"></button><button type="button" id="bctJobPageNext"></button>';
    g.insertAdjacentElement('beforebegin',nav);
    $('bctJobPageSelect').addEventListener('change',event=>show(event.target.value,true));
    $('bctJobPagePrev').addEventListener('click',()=>move(-1));
    $('bctJobPageNext').addEventListener('click',()=>move(1));
    return nav;
  }
  function renderNav(list){
    const nav=ensureNav();if(!nav)return;const c=copy();
    nav.querySelector('label').textContent=c.section;$('bctJobPagePrev').textContent=c.previous;$('bctJobPageNext').textContent=c.next;
    const select=$('bctJobPageSelect');const current=selectedId;
    select.replaceChildren(...list.map((el,index)=>{const option=document.createElement('option');option.value=el.id;option.textContent=titleFor(el,index);return option}));
    if(list.some(el=>el.id===current))select.value=current;
  }
  function show(id,scroll=false){
    const list=pages();if(!list.length)return;ensureIds(list);
    let selected=list.find(el=>el.id===id)||list[0];selectedId=selected.id;
    list.forEach(el=>el.classList.toggle('bct-job-page-hidden',el!==selected));
    renderNav(list);const select=$('bctJobPageSelect');if(select)select.value=selectedId;
    const index=list.indexOf(selected);if($('bctJobPagePrev'))$('bctJobPagePrev').disabled=index<=0;if($('bctJobPageNext'))$('bctJobPageNext').disabled=index>=list.length-1;
    if(scroll)requestAnimationFrame(()=>$('bctJobPageNav')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  function move(delta){const list=pages();if(!list.length)return;const index=Math.max(0,list.findIndex(el=>el.id===selectedId));const next=Math.min(list.length-1,Math.max(0,index+delta));show(list[next].id,true)}
  function sync(reset=false){
    const p=panel(),g=grid();if(!p||!g)return;const list=pages();if(!list.length)return;ensureIds(list);ensureNav();
    if(reset||!list.some(el=>el.id===selectedId))selectedId=list[0].id;
    show(selectedId,false);
    if(!observer){observer=new MutationObserver(()=>requestAnimationFrame(()=>sync(false)));observer.observe(g,{childList:true})}
  }
  function hookManage(){
    if(typeof window.bctManageJob!=='function'||window.bctManageJob.__bctJobPagesWrapped)return;
    const original=window.bctManageJob;
    const wrapped=async function(){const result=await original.apply(this,arguments);sync(true);return result};
    wrapped.__bctJobPagesWrapped=true;window.bctManageJob=wrapped;
  }
  document.addEventListener('change',event=>{if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(()=>sync(false),0)},true);
  window.addEventListener('pageshow',()=>{hookManage();sync(false)});
  function init(){hookManage();sync(false);setTimeout(()=>{hookManage();sync(false)},600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
