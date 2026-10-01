/* BCT V46 Admin Control Board
   Big Dog 3 derived test branch only. Keeps Admin data/auth/RLS untouched while replacing the long-scroll Admin landing with a portal-style control board. */
(function(){
  'use strict';

  const VERSION='V46-2026.09.30-admin-control-board-3-home-category';
  const ROOT_ID='view-admin';
  const PANEL_HIDDEN='bct-admin-board-panel-hidden';
  const BOARD_ID='bctAdminControlBoard';
  const URGENT_ID='bctAdminUrgentView';
  const history=[];
  let mode='board';
  let activePanelId='';
  let wasVisible=false;
  let scheduled=false;
  let observer=null;

  window.BCT_ADMIN_CONTROL_BOARD_VERSION=VERSION;

  const COPY={
    en:{title:'Admin Control Board',sub:'Choose the area you need. Only the selected Admin section opens.',urgent:'Urgent Attention',jobs:'JOBS',contractors:'CONTRACTORS',clients:'CLIENTS / HOMEOWNERS',noJobs:'No Urgent Job Items',noContractors:'No Urgent Contractor Items',noClients:'No Urgent Client Items',areas:'Admin Portals',back:'← Back',board:'Admin Control Board',home:'Back to Home',none:'No urgent items in this category.',open:'Open'},
    es:{title:'Panel de control administrativo',sub:'Elija el área que necesita. Solo se abre la sección administrativa seleccionada.',urgent:'Atención urgente',jobs:'TRABAJOS',contractors:'CONTRATISTAS',clients:'CLIENTES / PROPIETARIOS',noJobs:'No hay trabajos urgentes',noContractors:'No hay contratistas urgentes',noClients:'No hay clientes urgentes',areas:'Portales administrativos',back:'← Volver',board:'Panel administrativo',home:'Volver al inicio',none:'No hay asuntos urgentes en esta categoría.',open:'Abrir'},
    fr:{title:'Tableau de contrôle admin',sub:'Choisissez la zone nécessaire. Seule la section sélectionnée s’ouvre.',urgent:'Attention urgente',jobs:'CHANTIERS',contractors:'ENTREPRENEURS',clients:'CLIENTS / PROPRIÉTAIRES',noJobs:'Aucun chantier urgent',noContractors:'Aucun entrepreneur urgent',noClients:'Aucun client urgent',areas:'Portails administrateur',back:'← Retour',board:'Tableau admin',home:'Retour à l’accueil',none:'Aucun élément urgent dans cette catégorie.',open:'Ouvrir'},
    ht:{title:'Tablo Kontwòl Administrasyon',sub:'Chwazi zòn ou bezwen an. Se sèlman seksyon ou chwazi a ki louvri.',urgent:'Atansyon Ijan',jobs:'TRAVAY',contractors:'KONTRAKTÈ',clients:'KLIYAN / PWOPRIYETÈ',noJobs:'Pa gen travay ijan',noContractors:'Pa gen kontraktè ijan',noClients:'Pa gen kliyan ijan',areas:'Pòtay Administrasyon',back:'← Retounen',board:'Tablo Administrasyon',home:'Retounen lakay',none:'Pa gen bagay ijan nan kategori sa a.',open:'Louvri'},
    pt:{title:'Painel de Controle Administrativo',sub:'Escolha a área necessária. Somente a seção selecionada será aberta.',urgent:'Atenção urgente',jobs:'TRABALHOS',contractors:'CONTRATADOS',clients:'CLIENTES / PROPRIETÁRIOS',noJobs:'Nenhum trabalho urgente',noContractors:'Nenhum contratado urgente',noClients:'Nenhum cliente urgente',areas:'Portais administrativos',back:'← Voltar',board:'Painel Administrativo',home:'Voltar ao início',none:'Nenhum item urgente nesta categoria.',open:'Abrir'},
    vi:{title:'Bảng điều khiển quản trị',sub:'Chọn khu vực cần dùng. Chỉ phần quản trị được chọn sẽ mở.',urgent:'Cần chú ý khẩn cấp',jobs:'CÔNG VIỆC',contractors:'NHÀ THẦU',clients:'KHÁCH HÀNG / CHỦ NHÀ',noJobs:'Không có công việc khẩn cấp',noContractors:'Không có nhà thầu khẩn cấp',noClients:'Không có khách hàng khẩn cấp',areas:'Cổng quản trị',back:'← Quay lại',board:'Bảng quản trị',home:'Về trang chủ',none:'Không có mục khẩn cấp trong danh mục này.',open:'Mở'},
    zh:{title:'管理员控制面板',sub:'选择所需区域。一次只打开所选管理部分。',urgent:'紧急关注',jobs:'工作',contractors:'承包商',clients:'客户 / 房主',noJobs:'没有紧急工作事项',noContractors:'没有紧急承包商事项',noClients:'没有紧急客户事项',areas:'管理门户',back:'← 返回',board:'管理员控制面板',home:'返回主页',none:'此类别没有紧急事项。',open:'打开'},
    ar:{title:'لوحة تحكم الإدارة',sub:'اختر المنطقة المطلوبة. سيتم فتح قسم الإدارة المحدد فقط.',urgent:'تنبيه عاجل',jobs:'المشاريع',contractors:'المقاولون',clients:'العملاء / أصحاب المنازل',noJobs:'لا توجد مشاريع عاجلة',noContractors:'لا توجد أمور عاجلة للمقاولين',noClients:'لا توجد أمور عاجلة للعملاء',areas:'بوابات الإدارة',back:'رجوع ←',board:'لوحة الإدارة',home:'العودة إلى الرئيسية',none:'لا توجد عناصر عاجلة في هذه الفئة.',open:'فتح'},
    ru:{title:'Панель управления администратора',sub:'Выберите нужную область. Открывается только выбранный раздел.',urgent:'Срочное внимание',jobs:'РАБОТЫ',contractors:'ПОДРЯДЧИКИ',clients:'КЛИЕНТЫ / ВЛАДЕЛЬЦЫ',noJobs:'Нет срочных работ',noContractors:'Нет срочных вопросов по подрядчикам',noClients:'Нет срочных вопросов клиентов',areas:'Порталы администратора',back:'← Назад',board:'Панель администратора',home:'На главную',none:'В этой категории нет срочных пунктов.',open:'Открыть'}
  };

  const $=id=>document.getElementById(id);
  function root(){return $(ROOT_ID)}
  function language(){
    try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}
    catch(_){return (document.documentElement.lang||'en').toLowerCase().split('-')[0]}
  }
  function copy(){return COPY[language()]||COPY.en}
  function adminVisible(){const r=root();return !!r&&!r.classList.contains('hidden')&&document.body.classList.contains('bct-authenticated')}
  function pageTabs(){return [...(root()?.querySelectorAll('[data-admin-page-tab]')||[])]}
  function panels(){return [...(root()?.querySelectorAll('[data-admin-page-panel]')||[])]}
  function panelTitle(panel){return (panel?.querySelector('h2,h3,h4')?.textContent||panel?.id||'Admin Section').trim()}
  function panelPage(panel){return panel?.dataset.adminPagePanel||''}
  function pageLabel(page){
    const tab=pageTabs().find(item=>item.dataset.adminPageTab===page);
    return (tab?.textContent||page||'Admin').trim();
  }
  function boardEligible(panel){
    if(!panel||panel.id==='jobManagementPanel')return false;
    if(panel.classList.contains('hidden')&&!panel.dataset.bctBoardInclude)return false;
    return true;
  }

  function injectStyle(){
    if($('bct-admin-control-board-style'))return;
    const style=document.createElement('style');
    style.id='bct-admin-control-board-style';
    style.textContent=`
      #view-admin{touch-action:pan-y!important;overflow:visible!important;-webkit-overflow-scrolling:touch}
      #view-admin .${PANEL_HIDDEN}{display:none!important}
      #view-admin .bct-control-board-source-tabs{display:none!important}
      #${BOARD_ID},#${URGENT_ID}{margin:12px 0 20px;touch-action:pan-y}
      #${BOARD_ID}[hidden],#${URGENT_ID}[hidden]{display:none!important}
      .bct-admin-board-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
      .bct-admin-board-head h2{margin:0;color:#0a4549}
      .bct-admin-board-head p{margin:6px 0 0;color:#5f6f73;max-width:760px}
      .bct-admin-board-home,.bct-admin-board-back,.bct-admin-board-button{
        background:#0f5f63!important;color:#fff!important;border:1px solid #0a4549!important;border-radius:12px!important;
        min-height:48px!important;padding:11px 14px!important;font-weight:800!important;box-shadow:0 3px 10px rgba(15,95,99,.16)!important;
        touch-action:manipulation!important;pointer-events:auto!important
      }
      .bct-admin-board-home:active,.bct-admin-board-back:active,.bct-admin-board-button:active{background:#0a4549!important}
      .bct-admin-board-home:focus-visible,.bct-admin-board-back:focus-visible,.bct-admin-board-button:focus-visible{outline:3px solid #9fd6d2!important;outline-offset:2px}
      .bct-admin-urgent-wrap{border:1px solid #d7e0e1;border-radius:16px;background:#fff;padding:14px;margin-bottom:16px;box-shadow:0 8px 22px rgba(23,36,39,.05)}
      .bct-admin-urgent-wrap h3{margin:0 0 10px;color:#172427}
      .bct-admin-urgent-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .bct-admin-urgent-card{position:relative;text-align:left;background:#f8fbfb!important;color:#0a4549!important;border:2px solid #b9d7d3!important;border-radius:14px!important;min-height:108px!important;padding:14px!important;box-shadow:none!important;touch-action:manipulation!important}
      .bct-admin-urgent-card strong{display:block;font-size:15px;letter-spacing:.02em}
      .bct-admin-urgent-card .bct-admin-alert-count{display:inline-grid;place-items:center;min-width:34px;height:34px;padding:0 8px;margin:8px 0 4px;border-radius:999px;background:#0f5f63;color:#fff;font-size:18px;font-weight:900}
      .bct-admin-urgent-card small{display:block;color:#5f6f73;line-height:1.3}
      .bct-admin-urgent-card[data-level="warning"]{border-color:#b45309!important;background:#fffaf0!important}
      .bct-admin-urgent-card[data-level="warning"] .bct-admin-alert-count{background:#b45309}
      .bct-admin-urgent-card[data-level="critical"]{border-color:#b91c1c!important;background:#fff5f5!important}
      .bct-admin-urgent-card[data-level="critical"] .bct-admin-alert-count{background:#b91c1c}
      @keyframes bctAdminCriticalPulse{0%,100%{box-shadow:0 0 0 0 rgba(185,28,28,0)}50%{box-shadow:0 0 0 5px rgba(185,28,28,.14)}}
      .bct-admin-urgent-card[data-level="critical"]{animation:bctAdminCriticalPulse 1.8s ease-in-out infinite}
      @media(prefers-reduced-motion:reduce){.bct-admin-urgent-card[data-level="critical"]{animation:none}}
      .bct-admin-portal-wrap{border:1px solid #d7e0e1;border-radius:16px;background:#fff;padding:14px;box-shadow:0 8px 22px rgba(23,36,39,.05)}
      .bct-admin-portal-wrap h3{margin:0 0 10px;color:#172427}
      .bct-admin-portal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .bct-admin-portal-card{background:#0f5f63!important;color:#fff!important;border:1px solid #0a4549!important;border-radius:14px!important;min-height:86px!important;padding:13px!important;text-align:left!important;box-shadow:0 4px 12px rgba(15,95,99,.15)!important;touch-action:manipulation!important}
      .bct-admin-portal-card strong{display:block;font-size:15px;line-height:1.25}
      .bct-admin-portal-card small{display:block;margin-top:5px;color:#d9f1ee;line-height:1.25}
      .bct-admin-panel-nav{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px;background:#fff;padding:6px 0;position:sticky;top:92px;z-index:7}
      .bct-admin-panel-nav .bct-admin-board-button{flex:1;min-width:132px}
      .bct-admin-urgent-list{display:grid;gap:10px;margin-top:12px}
      .bct-admin-urgent-item{border:1px solid #d7e0e1;border-radius:12px;padding:12px;background:#fff}
      .bct-admin-urgent-item[data-level="critical"]{border-color:#b91c1c;background:#fff5f5}
      .bct-admin-urgent-item[data-level="warning"]{border-color:#b45309;background:#fffaf0}
      .bct-admin-urgent-item p{margin:0 0 10px;line-height:1.4;color:#172427}
      @media(max-width:820px){.bct-admin-portal-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bct-admin-urgent-grid{grid-template-columns:1fr}.bct-admin-panel-nav{top:84px}}
      @media(max-width:390px){.bct-admin-portal-grid{grid-template-columns:1fr 1fr}.bct-admin-portal-card{padding:11px;min-height:80px}.bct-admin-portal-card strong{font-size:14px}}
    `;
    document.head.appendChild(style);
  }

  function sourceTabs(){
    const r=root();if(!r)return null;
    const tabs=r.querySelector('.portal-tabs');
    if(tabs)tabs.classList.add('bct-control-board-source-tabs');
    return tabs;
  }

  function goHome(){
    if(typeof window.bctReturnToPublicLanding==='function'){
      window.bctReturnToPublicLanding();
      return;
    }
    if(typeof window.showView==='function')window.showView('home');
    else location.hash='home';
  }

  function setPanelVisibility(selected){
    panels().forEach(panel=>{
      const show=!!selected&&panel===selected;
      panel.classList.toggle(PANEL_HIDDEN,!show);
      panel.classList.toggle('active',show);
    });
  }

  function setActivePage(page){
    pageTabs().forEach(tab=>tab.classList.toggle('active',tab.dataset.adminPageTab===page));
  }

  function ensurePanelNav(panel){
    if(!panel)return;
    let nav=panel.querySelector(':scope > .bct-admin-panel-nav');
    if(!nav){
      nav=document.createElement('div');nav.className='bct-admin-panel-nav';
      nav.innerHTML='<button type="button" class="bct-admin-board-button" data-bct-board-back></button><button type="button" class="bct-admin-board-button" data-bct-board-homeboard></button><button type="button" class="bct-admin-board-button" data-bct-board-publichome></button>';
      panel.prepend(nav);
    }
    const t=copy();
    nav.querySelector('[data-bct-board-back]').textContent=t.back;
    nav.querySelector('[data-bct-board-homeboard]').textContent=t.board;
    nav.querySelector('[data-bct-board-publichome]').textContent=t.home;
  }

  function openPanel(panel,push=true){
    if(!panel||!root()?.contains(panel))return;
    if(push&&activePanelId&&activePanelId!==panel.id)history.push(activePanelId);
    activePanelId=panel.id||'';
    mode='panel';
    const board=$(BOARD_ID),urgent=$(URGENT_ID);if(board)board.hidden=true;if(urgent)urgent.hidden=true;
    setActivePage(panelPage(panel));
    setPanelVisibility(panel);
    ensurePanelNav(panel);
  }

  function showBoard(){
    mode='board';activePanelId='';history.length=0;
    setPanelVisibility(null);
    const urgent=$(URGENT_ID);if(urgent)urgent.hidden=true;
    const board=ensureBoard();if(board)board.hidden=false;
    refreshBoard();
  }

  function goBack(){
    const previous=history.pop();
    if(previous){const panel=$(previous);if(panel){openPanel(panel,false);return}}
    showBoard();
  }

  function categoryForPanel(panel){
    const hay=(panelPage(panel)+' '+(panel?.id||'')+' '+panelTitle(panel)).toLowerCase();
    if(/contractor|applicant|safety|training|crew/.test(hay))return 'contractors';
    if(/client|customer|homeowner|resident|property account/.test(hay))return 'clients';
    if(/job|project|service call|post job|bid|estimate|change order|approval|completion|schedule|weather|material|inspection|verification|payment|escrow|financ/.test(hay))return 'jobs';
    return '';
  }

  function severity(text){
    const s=String(text||'').toLowerCase();
    if(/critical|failed|blocked|dispute|emergency|security failure/.test(s))return 'critical';
    if(/expired|delayed|overdue|needs attention|action required|pending approval|pending review|on hold|missing|required action|failure/.test(s))return 'warning';
    return '';
  }

  function collectUrgent(){
    const results={jobs:[],contractors:[],clients:[]};
    const seen=new Set();
    panels().forEach(panel=>{
      if(!boardEligible(panel)&&panel.id!=='jobManagementPanel')return;
      const category=categoryForPanel(panel);
      if(!category)return;
      const candidates=panel.querySelectorAll('.badge.bad,.badge.warn,.backend-warn,[data-status],[data-state],[data-severity],[aria-label*="critical" i],[aria-label*="urgent" i]');
      candidates.forEach(node=>{
        const text=((node.getAttribute('data-status')||'')+' '+(node.getAttribute('data-state')||'')+' '+(node.getAttribute('data-severity')||'')+' '+(node.getAttribute('aria-label')||'')+' '+(node.textContent||'')).replace(/\s+/g,' ').trim();
        const level=severity(text);if(!level)return;
        const key=category+'|'+panel.id+'|'+text.slice(0,180);if(seen.has(key))return;seen.add(key);
        results[category].push({panelId:panel.id,title:panelTitle(panel),text:text.slice(0,220),level});
      });
    });
    return results;
  }

  function urgentLevel(items){return items.some(i=>i.level==='critical')?'critical':items.length?'warning':'normal'}

  function renderUrgentCards(board){
    const t=copy(),data=collectUrgent();
    const defs=[['jobs',t.jobs,t.noJobs],['contractors',t.contractors,t.noContractors],['clients',t.clients,t.noClients]];
    const grid=board.querySelector('.bct-admin-urgent-grid');if(!grid)return;
    const renderKey=defs.map(([key,label,empty])=>{
      const items=data[key];
      return `${key}:${label}:${items.length}:${urgentLevel(items)}:${items.length?`${items.length} ${t.urgent}`:empty}`;
    }).join('|');
    if(grid.dataset.renderKey===renderKey)return;
    grid.dataset.renderKey=renderKey;
    grid.replaceChildren(...defs.map(([key,label,empty])=>{
      const items=data[key];const button=document.createElement('button');button.type='button';button.className='bct-admin-urgent-card';button.dataset.bctUrgentCategory=key;button.dataset.level=urgentLevel(items);
      button.innerHTML=`<strong>${label}</strong><span class="bct-admin-alert-count">${items.length}</span><small>${items.length?`${items.length} ${t.urgent}`:empty}</small>`;
      return button;
    }));
  }

  function renderPortalCards(board){
    const grid=board.querySelector('.bct-admin-portal-grid');if(!grid)return;
    const list=panels().filter(boardEligible);
    const key=list.map(p=>`${p.id}:${panelPage(p)}:${panelTitle(p)}`).join('|');
    if(grid.dataset.renderKey===key)return;grid.dataset.renderKey=key;
    grid.replaceChildren(...list.map(panel=>{
      const button=document.createElement('button');button.type='button';button.className='bct-admin-portal-card';button.dataset.bctOpenPanel=panel.id;
      button.innerHTML=`<strong>${panelTitle(panel)}</strong><small>${pageLabel(panelPage(panel))}</small>`;
      return button;
    }));
  }

  function ensureBoard(){
    const r=root();if(!r)return null;injectStyle();sourceTabs();
    let board=$(BOARD_ID);if(board)return board;
    board=document.createElement('section');board.id=BOARD_ID;board.setAttribute('aria-label','Admin Control Board');
    board.innerHTML='<div class="bct-admin-board-head"><div><h2></h2><p></p></div><button type="button" class="bct-admin-board-home" data-bct-board-publichome></button></div><div class="bct-admin-urgent-wrap"><h3></h3><div class="bct-admin-urgent-grid"></div></div><div class="bct-admin-portal-wrap"><h3></h3><div class="bct-admin-portal-grid"></div></div>';
    const tabs=sourceTabs();if(tabs)tabs.insertAdjacentElement('beforebegin',board);else r.prepend(board);
    return board;
  }

  function refreshBoard(){
    const board=ensureBoard();if(!board)return;const t=copy();
    board.querySelector('.bct-admin-board-head h2').textContent=t.title;
    board.querySelector('.bct-admin-board-head p').textContent=t.sub;
    board.querySelector('.bct-admin-board-home').textContent=t.home;
    board.querySelector('.bct-admin-urgent-wrap h3').textContent=t.urgent;
    board.querySelector('.bct-admin-portal-wrap h3').textContent=t.areas;
    renderUrgentCards(board);renderPortalCards(board);
    if(mode==='panel'&&activePanelId)ensurePanelNav($(activePanelId));
  }

  function showUrgent(category){
    const data=collectUrgent()[category]||[],t=copy();
    let view=$(URGENT_ID);if(!view){view=document.createElement('section');view.id=URGENT_ID;ensureBoard()?.insertAdjacentElement('afterend',view)}
    const labels={jobs:t.jobs,contractors:t.contractors,clients:t.clients};
    view.innerHTML='<div class="bct-admin-board-head"><div><h2></h2><p></p></div><div><button type="button" class="bct-admin-board-back" data-bct-board-homeboard></button> <button type="button" class="bct-admin-board-home" data-bct-board-publichome></button></div></div><div class="bct-admin-urgent-list"></div>';
    view.querySelector('h2').textContent=`${t.urgent}: ${labels[category]||category}`;
    view.querySelector('p').textContent=data.length?`${data.length} ${t.urgent}`:t.none;
    view.querySelector('[data-bct-board-homeboard]').textContent=t.board;
    view.querySelector('[data-bct-board-publichome]').textContent=t.home;
    const list=view.querySelector('.bct-admin-urgent-list');
    if(data.length){data.forEach(item=>{const card=document.createElement('div');card.className='bct-admin-urgent-item';card.dataset.level=item.level;card.innerHTML=`<p><strong>${item.title}</strong><br>${item.text}</p><button type="button" class="bct-admin-board-button" data-bct-open-panel="${item.panelId}">${t.open}</button>`;list.appendChild(card)})}
    mode='urgent';setPanelVisibility(null);const board=$(BOARD_ID);if(board)board.hidden=true;view.hidden=false;
  }

  function syncVisibility(){
    scheduled=false;
    const visible=adminVisible();
    if(visible&&!wasVisible){showBoard()}
    else if(visible){refreshBoard();if(mode==='board')setPanelVisibility(null);else if(mode==='panel'&&activePanelId){const p=$(activePanelId);if(p)setPanelVisibility(p)}}
    wasVisible=visible;
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(syncVisibility)}

  document.addEventListener('click',event=>{
    if(!adminVisible())return;
    const r=root();if(!r)return;
    const portal=event.target?.closest?.('[data-bct-open-panel]');
    if(portal&&r.contains(portal)){event.preventDefault();event.stopPropagation();const panel=$(portal.dataset.bctOpenPanel);if(panel)openPanel(panel,true);return}
    const urgent=event.target?.closest?.('[data-bct-urgent-category]');
    if(urgent&&r.contains(urgent)){event.preventDefault();event.stopPropagation();showUrgent(urgent.dataset.bctUrgentCategory);return}
    const back=event.target?.closest?.('[data-bct-board-back]');
    if(back&&r.contains(back)){event.preventDefault();event.stopPropagation();goBack();return}
    const board=event.target?.closest?.('[data-bct-board-homeboard]');
    if(board&&r.contains(board)){event.preventDefault();event.stopPropagation();showBoard();return}
    const home=event.target?.closest?.('[data-bct-board-publichome]');
    if(home&&r.contains(home)){event.preventDefault();event.stopPropagation();goHome();return}
  },true);

  document.addEventListener('change',event=>{if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(refreshBoard,0)},true);
  // Admin state changes are explicit; avoid lifecycle/hash refresh loops that can fight iPhone navigation.

  window.BCT_ADMIN_CONTROL_BOARD_OPEN_PANEL=function(target){
    const panel=typeof target==='string'?$(target):(target?.matches?.('[data-admin-page-panel]')?target:target?.closest?.('[data-admin-page-panel]'));
    if(panel)openPanel(panel,true);
  };
  window.BCT_ADMIN_CONTROL_BOARD_SHOW=showBoard;

  function init(){
    injectStyle();
    const r=root();
    if(r&&!observer){observer=new MutationObserver(records=>{
      const meaningful=records.some(record=>{
        const target=record.target;
        if(target?.closest?.(`#${BOARD_ID},#${URGENT_ID},.bct-admin-panel-nav`))return false;
        return true;
      });
      if(meaningful)schedule();
    });observer.observe(r,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-hidden','data-status','data-state','data-severity']})}
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();