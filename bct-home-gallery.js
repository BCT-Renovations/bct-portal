/* BCT V46 public-home project gallery.
   Isolated add-on: does not replace existing landing controls or portal logic. */
(function(){
  'use strict';
  const VERSION='BCT-PHOTO-BUILD-2026.10.01-public-foundation-2';
  window.BCT_HOME_GALLERY_VERSION=VERSION;

  const COPY={
    en:{title:'Our Work',lead:'A look at recent BCT Renovations projects.',more:'View More Projects',less:'Show Fewer Projects',full:'Open Full Gallery',close:'Close',prev:'Previous',next:'Next',all:'All',slot:'BCT project photo'},
    es:{title:'Nuestro Trabajo',lead:'Una muestra de proyectos recientes de BCT Renovations.',more:'Ver Más Proyectos',less:'Ver Menos Proyectos',slot:'Foto de proyecto BCT'},
    fr:{title:'Nos Réalisations',lead:'Un aperçu de projets récents de BCT Renovations.',more:'Voir Plus de Projets',less:'Voir Moins de Projets',slot:'Photo de projet BCT'},
    ht:{title:'Travay Nou',lead:'Yon gade sou kèk pwojè BCT Renovations resan.',more:'Gade Plis Pwojè',less:'Montre Mwens Pwojè',slot:'Foto pwojè BCT'},
    pt:{title:'Nosso Trabalho',lead:'Uma amostra de projetos recentes da BCT Renovations.',more:'Ver Mais Projetos',less:'Ver Menos Projetos',slot:'Foto de projeto BCT'},
    vi:{title:'Công Trình Của Chúng Tôi',lead:'Một số dự án gần đây của BCT Renovations.',more:'Xem Thêm Dự Án',less:'Hiển Thị Ít Hơn',slot:'Ảnh dự án BCT'},
    zh:{title:'我们的工程',lead:'查看 BCT Renovations 最近的部分项目。',more:'查看更多项目',less:'收起项目',slot:'BCT 项目照片'},
    ar:{title:'أعمالنا',lead:'نظرة على بعض مشاريع BCT Renovations الحديثة.',more:'عرض المزيد من المشاريع',less:'عرض مشاريع أقل',slot:'صورة مشروع BCT'},
    ru:{title:'Наши Работы',lead:'Некоторые недавние проекты BCT Renovations.',more:'Показать Больше Проектов',less:'Показать Меньше',slot:'Фото проекта BCT'}
  };

  let PROJECTS=[]; // Loaded from the secure BCT gallery table; never create empty placeholders.

  let expanded=false;
  let loaded=false;
  let FULL=[];let fullIndex=0;let fullCategory='All';let fullPage=0;const FULL_PAGE=24;let fullHasMore=false;
  const $=id=>document.getElementById(id);
  function language(){try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}catch(_){return 'en'}}
  function copy(){return COPY[language()]||COPY.en}

  function injectStyle(){
    if($('bct-home-gallery-style'))return;
    const style=document.createElement('style');
    style.id='bct-home-gallery-style';
    style.textContent=`
      #bctHomeGallery{display:none}
      body:not(.bct-authenticated):not(.bct-portal-entered) #bctHomeGallery{display:block;margin:14px 0 0;padding:16px;background:#fff;border:1px solid #d7e0e1;border-radius:16px;box-shadow:0 8px 24px rgba(23,36,39,.06)}
      #bctHomeGallery h2{margin:0;text-align:center;color:#0a4549;font-size:clamp(24px,6vw,32px)}
      #bctHomeGallery .bct-gallery-lead{text-align:center;margin:6px 0 14px;color:#5f6f73;line-height:1.4}
      #bctHomeGalleryGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .bct-gallery-card{margin:0;cursor:pointer;border:1px solid #d7e0e1;border-radius:12px;overflow:hidden;background:#f7faf9;min-width:0}
      .bct-gallery-frame{aspect-ratio:4/3;background:linear-gradient(145deg,#e7f3f3,#f7fbf8);display:flex;align-items:center;justify-content:center;overflow:hidden;color:#0f5f63;font-weight:800;text-align:center;padding:14px}
      .bct-gallery-frame img{width:100%;height:100%;display:block;object-fit:cover}
      .bct-gallery-card figcaption{padding:9px 10px;font-size:13px;font-weight:700;color:#173c3e;text-align:center}
      .bct-gallery-extra[hidden]{display:none!important}
      #bctGalleryToggle,#bctGalleryFull{display:block;width:100%;min-height:50px;margin:12px 0 0;background:#0f5f63;color:#fff;border-radius:10px;font-size:16px;font-weight:900}\n      #bctGalleryModal[hidden]{display:none!important}#bctGalleryModal{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.9);color:#fff;padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));display:grid;grid-template-rows:auto 1fr auto}.bct-gallery-modal-head,.bct-gallery-modal-foot{display:flex;gap:8px;align-items:center;justify-content:space-between}.bct-gallery-modal-head button,.bct-gallery-modal-foot button,.bct-gallery-modal-head select{min-height:44px;border-radius:9px;padding:8px 12px}.bct-gallery-stage{display:grid;place-items:center;min-height:0}.bct-gallery-stage img{max-width:100%;max-height:68vh;object-fit:contain}.bct-gallery-modal-caption{text-align:center;margin-top:6px}
      #bctGalleryToggle:focus-visible{outline:3px solid #7dd3fc;outline-offset:3px}
      @media(min-width:620px){#bctHomeGalleryGrid{grid-template-columns:repeat(4,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function formatDate(value){if(!value)return '';const d=new Date(value+'T12:00:00');return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat(language(),{year:'numeric',month:'short',day:'numeric'}).format(d)}
  function card(project,index){
    const c=copy();
    const figure=document.createElement('figure');
    figure.className='bct-gallery-card'+(index>=4?' bct-gallery-extra':'');
    if(index>=4&&!expanded)figure.hidden=true;

    const frame=document.createElement('div');
    frame.className='bct-gallery-frame';
    if(project.image){
      const img=document.createElement('img');
      img.src=project.image;
      img.alt=project.alt||`${c.slot} ${index+1}`;
      img.loading=index<4?'eager':'lazy';
      img.decoding='async';
      frame.appendChild(img);
    }else{return document.createDocumentFragment();}

    const caption=document.createElement('figcaption');
    caption.textContent=[project.caption,formatDate(project.project_work_date)].filter(Boolean).join(' • ')||c.slot;
    figure.tabIndex=0;figure.setAttribute('role','button');figure.setAttribute('aria-label',(project.alt||c.slot)+' — '+formatDate(project.project_work_date));const open=async()=>{await loadFull(true);const i=FULL.findIndex(x=>x.id===project.id);if(i>=0){fullIndex=i;showFull()}};figure.addEventListener('click',open);figure.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});figure.append(frame,caption);
    return figure;
  }

  function render(){
    const section=$('bctHomeGallery');
    if(!section)return;
    const c=copy();
    section.querySelector('h2').textContent=c.title;
    section.querySelector('.bct-gallery-lead').textContent=c.lead;
    const grid=$('bctHomeGalleryGrid');
    grid.replaceChildren(...PROJECTS.map(card));
    const toggle=$('bctGalleryToggle');
    toggle.hidden=PROJECTS.length<=4;
    toggle.textContent=expanded?c.less:c.more;
    toggle.setAttribute('aria-expanded',String(expanded));
    // Keep the gallery section and its entry buttons visible even when the public photo query is empty or temporarily unavailable.\n    // This preserves the existing gallery system and prevents the Full Gallery entry point from disappearing.\n    section.hidden=false;
    const full=$('bctGalleryFull');
    if(full){full.disabled=PROJECTS.length===0;full.textContent=PROJECTS.length===0?'Gallery Coming Soon':c.full;}
  }

  async function loadProjects(){
    if(!window.supabaseClient){loaded=true;PROJECTS=[];render();return}
    const {data,error}=await window.supabaseClient.from('bct_gallery_photos')
      .select('id,storage_path,thumbnail_path,caption,alt_text,project_work_date,category,home_order')
      .eq('is_published',true).eq('show_on_home',true).order('home_order',{ascending:true}).limit(30);
    loaded=true;
    if(error){PROJECTS=[];render();return}
    const items=(data||[]).filter(x=>x.storage_path);
    PROJECTS=(await Promise.all(items.map(async x=>{const path=x.thumbnail_path||x.storage_path;const {data:signed}=await window.supabaseClient.storage.from('bct-gallery').createSignedUrl(path,3600);return signed&&signed.signedUrl?{image:signed.signedUrl,caption:x.caption,alt:x.alt_text,project_work_date:x.project_work_date,category:x.category,id:x.id}:null}))).filter(Boolean);
    render();
  }


  function fullList(){return fullCategory==='All'?FULL:FULL.filter(x=>x.category===fullCategory)}
  function showFull(){const list=fullList();if(!list.length)return;fullIndex=Math.max(0,Math.min(fullIndex,list.length-1));const p=list[fullIndex];$('bctGalleryModalImage').src=p.image;$('bctGalleryModalImage').alt=p.alt||copy().slot;$('bctGalleryModalCaption').textContent=[p.caption,p.category,formatDate(p.project_work_date)].filter(Boolean).join(' • ');$('bctGalleryModalCount').textContent=(fullIndex+1)+' / '+list.length;$('bctGalleryModal').hidden=false}
  function moveFull(n){const list=fullList();if(!list.length)return;fullIndex=(fullIndex+n+list.length)%list.length;showFull()}
  async function loadFull(reset=true){if(!window.supabaseClient)return;if(reset){FULL=[];fullPage=0}const from=fullPage*FULL_PAGE,to=from+FULL_PAGE-1;const {data,error}=await window.supabaseClient.from('bct_gallery_photos').select('id,storage_path,caption,alt_text,project_work_date,category,gallery_order').eq('is_published',true).order('gallery_order',{ascending:true}).order('project_work_date',{ascending:false}).range(from,to);if(error)return;const items=(data||[]).filter(x=>x.storage_path);const batch=(await Promise.all(items.map(async x=>{const {data:signed}=await window.supabaseClient.storage.from('bct-gallery').createSignedUrl(x.storage_path,3600);return signed&&signed.signedUrl?{...x,image:signed.signedUrl}:null}))).filter(Boolean);const priorCategory=fullCategory,priorIndex=fullIndex;FULL=reset?batch:FULL.concat(batch);fullHasMore=batch.length===FULL_PAGE;const sel=$('bctGalleryCategory');sel.replaceChildren(new Option(copy().all||'All','All'));[...new Set(FULL.map(x=>x.category).filter(Boolean))].sort().forEach(x=>sel.add(new Option(x,x)));fullCategory=reset?'All':([...sel.options].some(o=>o.value===priorCategory)?priorCategory:'All');sel.value=fullCategory;fullIndex=reset?0:priorIndex;showFull();if($('bctGalleryMore'))$('bctGalleryMore').hidden=!fullHasMore}

  function ensure(){
    const home=$('view-home');
    const license=$('bctPublicLicenseBar');
    if(!home||!license)return;
    injectStyle();
    if($('bctHomeGallery')){render();return}

    const section=document.createElement('section');
    section.id='bctHomeGallery';
    section.setAttribute('aria-labelledby','bctHomeGalleryTitle');
    section.innerHTML='<h2 id="bctHomeGalleryTitle"></h2><p class="bct-gallery-lead"></p><div id="bctHomeGalleryGrid"></div><button type="button" id="bctGalleryToggle" aria-controls="bctHomeGalleryGrid" aria-expanded="false"></button><button type="button" id="bctGalleryFull">Open Full Gallery</button>';
    license.insertAdjacentElement('beforebegin',section);
    section.querySelector('#bctGalleryToggle').addEventListener('click',()=>{expanded=!expanded;render()});section.querySelector('#bctGalleryFull').addEventListener('click',loadFull);
    if(!$('bctGalleryModal')){const m=document.createElement('div');m.id='bctGalleryModal';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.innerHTML='<div class="bct-gallery-modal-head"><button id="bctGalleryClose" type="button">Close</button><label>Category <select id="bctGalleryCategory"><option>All</option></select></label><span id="bctGalleryModalCount"></span></div><div class="bct-gallery-stage"><div><img id="bctGalleryModalImage" alt=""><div id="bctGalleryModalCaption" class="bct-gallery-modal-caption"></div></div></div><div class="bct-gallery-modal-foot"><button id="bctGalleryPrev" type="button">← Previous</button><button id="bctGalleryMore" type="button">Load More Photos</button><button id="bctGalleryNext" type="button">Next →</button></div>';document.body.appendChild(m);$('bctGalleryClose').onclick=()=>m.hidden=true;$('bctGalleryPrev').onclick=()=>moveFull(-1);$('bctGalleryNext').onclick=()=>moveFull(1);$('bctGalleryMore').onclick=()=>{fullPage++;loadFull(false)};$('bctGalleryCategory').onchange=e=>{fullCategory=e.target.value;fullIndex=0;showFull()};let sx=0;m.addEventListener('touchstart',e=>sx=e.changedTouches[0].clientX,{passive:true});m.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)moveFull(dx<0?1:-1)},{passive:true});document.addEventListener('keydown',e=>{if(m.hidden)return;if(e.key==='Escape')m.hidden=true;else if(e.key==='ArrowLeft')moveFull(-1);else if(e.key==='ArrowRight')moveFull(1)})}
    loadProjects();
  }

  document.addEventListener('change',event=>{
    if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(render,0);
  },true);
  window.addEventListener('pageshow',ensure);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
})();
