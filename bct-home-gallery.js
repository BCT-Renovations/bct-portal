/* BCT V46 public-home project gallery.
   Isolated add-on: does not replace existing landing controls or portal logic. */
(function(){
  'use strict';
  const VERSION='BCT-PHOTO-BUILD-2026.10.09-translation-shell-1';
  window.BCT_HOME_GALLERY_VERSION=VERSION;

  const COPY={
    en:{title:'Our Work',lead:'A look at recent BCT Renovations projects.',more:'View More Projects',morePhotos:'More Photos',less:'Show Fewer Projects',full:'Open Full Gallery',coming:'Gallery Coming Soon',close:'Close',prev:'Previous',next:'Next',all:'All',category:'Category',slot:'BCT project photo'},
    es:{title:'Nuestro Trabajo',lead:'Una muestra de proyectos recientes de BCT Renovations.',more:'Ver Más Proyectos',morePhotos:'Más Fotos',less:'Ver Menos Proyectos',full:'Abrir Galería Completa',coming:'Galería Próximamente',close:'Cerrar',prev:'Anterior',next:'Siguiente',all:'Todos',category:'Categoría',slot:'Foto de proyecto BCT'},
    fr:{title:'Nos Réalisations',lead:'Un aperçu de projets récents de BCT Renovations.',more:'Voir Plus de Projets',morePhotos:'Plus de Photos',less:'Voir Moins de Projets',full:'Ouvrir la Galerie Complète',coming:'Galerie Bientôt Disponible',close:'Fermer',prev:'Précédent',next:'Suivant',all:'Tous',category:'Catégorie',slot:'Photo de projet BCT'},
    ht:{title:'Travay Nou',lead:'Yon gade sou kèk pwojè BCT Renovations resan.',more:'Gade Plis Pwojè',morePhotos:'Plis Foto',less:'Montre Mwens Pwojè',full:'Louvri Galri Konplè a',coming:'Galri a Ap Vini Talè',close:'Fèmen',prev:'Anvan',next:'Pwochen',all:'Tout',category:'Kategori',slot:'Foto pwojè BCT'},
    pt:{title:'Nosso Trabalho',lead:'Uma amostra de projetos recentes da BCT Renovations.',more:'Ver Mais Projetos',morePhotos:'Mais Fotos',less:'Ver Menos Projetos',full:'Abrir Galeria Completa',coming:'Galeria em Breve',close:'Fechar',prev:'Anterior',next:'Próximo',all:'Todos',category:'Categoria',slot:'Foto de projeto BCT'},
    vi:{title:'Công Trình Của Chúng Tôi',lead:'Một số dự án gần đây của BCT Renovations.',more:'Xem Thêm Dự Án',morePhotos:'Thêm Ảnh',less:'Hiển Thị Ít Hơn',full:'Mở Thư Viện Ảnh Đầy Đủ',coming:'Thư Viện Ảnh Sắp Ra Mắt',close:'Đóng',prev:'Trước',next:'Tiếp',all:'Tất Cả',category:'Danh mục',slot:'Ảnh dự án BCT'},
    zh:{title:'我们的工程',lead:'查看 BCT Renovations 最近的部分项目。',more:'查看更多项目',morePhotos:'更多照片',less:'收起项目',full:'打开完整图库',coming:'图库即将推出',close:'关闭',prev:'上一张',next:'下一张',all:'全部',category:'分类',slot:'BCT 项目照片'},
    ar:{title:'أعمالنا',lead:'نظرة على بعض مشاريع BCT Renovations الحديثة.',more:'عرض المزيد من المشاريع',morePhotos:'المزيد من الصور',less:'عرض مشاريع أقل',full:'فتح المعرض الكامل',coming:'المعرض قريبًا',close:'إغلاق',prev:'السابق',next:'التالي',all:'الكل',category:'الفئة',slot:'صورة مشروع BCT'},
    ru:{title:'Наши Работы',lead:'Некоторые недавние проекты BCT Renovations.',more:'Показать Больше Проектов',morePhotos:'Больше Фото',less:'Показать Меньше',full:'Открыть Полную Галерею',coming:'Галерея Скоро Откроется',close:'Закрыть',prev:'Назад',next:'Далее',all:'Все',category:'Категория',slot:'Фото проекта BCT'}
  };

  let PROJECTS=[]; // Loaded from the secure BCT gallery table; never create empty placeholders.

  let expanded=false;
  let loaded=false;
  let FULL=[];let fullIndex=0;let fullCategory='All';let fullPage=0;const FULL_PAGE=24;let fullHasMore=false;let fullModalScrollY=0;
  const $=id=>document.getElementById(id);
  function language(){try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}catch(_){return 'en'}}
  function copy(){return COPY[language()]||COPY.en}
  const CATEGORY_COPY={en:{Kitchen:'Kitchen',Bathroom:'Bathroom',Gutters:'Gutters',Siding:'Siding',Roofing:'Roofing',Decks:'Decks','Doors / Windows':'Doors / Windows',Concrete:'Concrete',Interior:'Interior',Exterior:'Exterior',Before:'Before',After:'After',Other:'Other'},es:{Kitchen:'Cocina',Bathroom:'Baño',Gutters:'Canaletas',Siding:'Revestimiento',Roofing:'Techos',Decks:'Terrazas','Doors / Windows':'Puertas / Ventanas',Concrete:'Concreto',Interior:'Interior',Exterior:'Exterior',Before:'Antes',After:'Después',Other:'Otro'},fr:{Kitchen:'Cuisine',Bathroom:'Salle de bain',Gutters:'Gouttières',Siding:'Revêtement',Roofing:'Toiture',Decks:'Terrasses','Doors / Windows':'Portes / Fenêtres',Concrete:'Béton',Interior:'Intérieur',Exterior:'Extérieur',Before:'Avant',After:'Après',Other:'Autre'}};
  const CAPTION_FALLBACK={en:{'Some more of our work!':'Some more of our work!','Dirty':'Dirty','Really dirty! Time for BCT to do our thing!❤️❤️❤️':'Really dirty! Time for BCT to do our thing!❤️❤️❤️'},es:{'Some more of our work!':'¡Más de nuestro trabajo!','Dirty':'Sucio','Really dirty! Time for BCT to do our thing!❤️❤️❤️':'¡Muy sucio! ¡Es hora de que BCT haga lo suyo! ❤️❤️❤️'}};
  function translatedField(project,field){const lang=language();const map=project[field+'_translations']||{};return map[lang]||((CAPTION_FALLBACK[lang]||{})[project[field]]||project[field]||'')}
  function translatedCategory(project){const lang=language();const map=project.category_translations||{};return map[lang]||((CATEGORY_COPY[lang]||CATEGORY_COPY.en)[project.category]||project.category||'')}


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
      .bct-gallery-frame{position:relative}.bct-gallery-frame img{width:100%;height:100%;display:block;object-fit:cover}.bct-gallery-image-text{position:absolute;left:0;right:0;bottom:0;padding:10px 12px;background:rgba(0,0,0,.72);color:#fff;font-weight:900;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.8);line-height:1.25}
      .bct-gallery-card figcaption{padding:9px 10px;font-size:13px;font-weight:700;color:#173c3e;text-align:center}
      .bct-gallery-extra[hidden]{display:none!important}
      #bctGalleryToggle,#bctGalleryFull{display:block;width:100%;min-height:50px;margin:12px 0 0;background:#0f5f63;color:#fff;border-radius:10px;font-size:16px;font-weight:900}\n      body.bct-gallery-modal-open{overflow:hidden!important}#bctGalleryModal[hidden]{display:none!important}#bctGalleryModal{position:fixed;inset:0;z-index:100000;background:#000;color:#fff;padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));display:grid;grid-template-rows:auto 1fr auto;overscroll-behavior:contain;touch-action:none}.bct-gallery-modal-head,.bct-gallery-modal-foot{display:flex;gap:8px;align-items:center;justify-content:space-between}.bct-gallery-modal-head button,.bct-gallery-modal-foot button,.bct-gallery-modal-head select{min-height:44px;border-radius:9px;padding:8px 12px}.bct-gallery-stage{display:grid;place-items:center;min-height:0}.bct-gallery-stage img{max-width:100%;max-height:68vh;object-fit:contain}.bct-gallery-modal-caption{text-align:center;margin-top:6px}
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
      img.alt=translatedField(project,'alt')||`${c.slot} ${index+1}`;
      img.loading=index<4?'eager':'lazy';
      img.decoding='async';
      frame.appendChild(img);
    }else{return document.createDocumentFragment();}

    const caption=document.createElement('figcaption');
    caption.textContent=[translatedField(project,'caption'),formatDate(project.project_work_date)].filter(Boolean).join(' • ')||c.slot;
    const imageText=translatedField(project,'image_text');
    if(imageText){const overlay=document.createElement('div');overlay.className='bct-gallery-image-text';overlay.textContent=imageText;frame.appendChild(overlay)}
    figure.tabIndex=0;figure.setAttribute('role','button');figure.setAttribute('aria-label',(translatedField(project,'alt')||c.slot)+' — '+formatDate(project.project_work_date));const open=()=>{FULL=PROJECTS.slice();fullCategory='All';fullIndex=FULL.findIndex(x=>x.id===project.id);if(fullIndex<0)fullIndex=0;showFull()};figure.addEventListener('click',open);figure.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});figure.append(frame,caption);
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
    if(full){const hasPhotos=PROJECTS.length>0;full.disabled=!hasPhotos;full.textContent=hasPhotos?c.full:c.coming;full.setAttribute('aria-disabled',String(!hasPhotos));}
  }

  async function loadProjects(){
    if(!window.supabaseClient){loaded=true;PROJECTS=[];render();return}
    const {data,error}=await window.supabaseClient.from('bct_gallery_photos')
      .select('id,storage_path,thumbnail_path,caption,caption_translations,alt_text,alt_text_translations,image_text,image_text_translations,project_work_date,category,category_translations,home_order')
      .eq('is_published',true).eq('show_on_home',true).order('home_order',{ascending:true}).limit(30);
    loaded=true;
    if(error){PROJECTS=[];render();return}
    const items=(data||[]).filter(x=>x.storage_path);
    PROJECTS=(await Promise.all(items.map(async x=>{const path=x.thumbnail_path||x.storage_path;const {data:signed}=await window.supabaseClient.storage.from('bct-gallery').createSignedUrl(path,3600);return signed&&signed.signedUrl?{image:signed.signedUrl,caption:x.caption,caption_translations:x.caption_translations||{},alt:x.alt_text,alt_translations:x.alt_text_translations||{},project_work_date:x.project_work_date,category:x.category,category_translations:x.category_translations||{},id:x.id,image_text:x.image_text||'',image_text_translations:x.image_text_translations||{}}:null}))).filter(Boolean);
    render();
  }


  function fullList(){return fullCategory==='All'?FULL:FULL.filter(x=>x.category===fullCategory)}
  function lockFullGalleryScroll(){if(document.body.classList.contains('bct-gallery-modal-open'))return;fullModalScrollY=window.scrollY||document.documentElement.scrollTop||0;document.body.classList.add('bct-gallery-modal-open');document.body.style.position='fixed';document.body.style.top='-'+fullModalScrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%'}
  function unlockFullGalleryScroll(){if(!document.body.classList.contains('bct-gallery-modal-open'))return;document.body.classList.remove('bct-gallery-modal-open');document.body.style.removeProperty('position');document.body.style.removeProperty('top');document.body.style.removeProperty('left');document.body.style.removeProperty('right');document.body.style.removeProperty('width');window.scrollTo({top:fullModalScrollY,left:0,behavior:'auto'})}
  function openFullGallery(){lockFullGalleryScroll();$('bctGalleryModal').hidden=false}
  function closeFullGallery(){const modal=$('bctGalleryModal');if(modal)modal.hidden=true;unlockFullGalleryScroll()}
  function showFull(){ensureGalleryModal();const list=fullList();if(!list.length)return;fullIndex=Math.max(0,Math.min(fullIndex,list.length-1));const p=list[fullIndex];$('bctGalleryModalImage').src=p.image;$('bctGalleryModalImage').alt=translatedField(p,'alt')||copy().slot;const modalText=translatedField(p,'image_text');$('bctGalleryModalImage').dataset.imageText=modalText;$('bctGalleryModalCaption').textContent=[translatedField(p,'caption'),translatedCategory(p),formatDate(p.project_work_date)].filter(Boolean).join(' • ');$('bctGalleryModalCount').textContent=(fullIndex+1)+' / '+list.length;openFullGallery()}
  function moveFull(n){const list=fullList();if(!list.length)return;fullIndex=(fullIndex+n+list.length)%list.length;showFull()}
  async function loadFull(reset=true){ensureGalleryModal();if(reset){FULL=[];fullPage=0;fullCategory='All';fullIndex=0;}if(!window.supabaseClient){FULL=PROJECTS.slice();if(FULL.length)showFull();return;}const from=fullPage*FULL_PAGE,to=from+FULL_PAGE-1;const {data,error}=await window.supabaseClient.from('bct_gallery_photos').select('id,storage_path,caption,caption_translations,alt_text,alt_text_translations,image_text,image_text_translations,project_work_date,category,category_translations,gallery_order').eq('is_published',true).order('gallery_order',{ascending:true}).order('project_work_date',{ascending:false}).range(from,to);if(error){if(!FULL.length)FULL=PROJECTS.slice();if(FULL.length)showFull();return;}const items=(data||[]).filter(x=>x.storage_path);const batch=(await Promise.all(items.map(async x=>{const {data:signed}=await window.supabaseClient.storage.from('bct-gallery').createSignedUrl(x.storage_path,3600);return signed&&signed.signedUrl?{...x,image:signed.signedUrl,caption_translations:x.caption_translations||{},alt_translations:x.alt_text_translations||{},category_translations:x.category_translations||{},image_text:x.image_text||'',image_text_translations:x.image_text_translations||{}}:null}))).filter(Boolean);const priorCategory=fullCategory,priorIndex=fullIndex;FULL=reset?batch:FULL.concat(batch);fullHasMore=batch.length===FULL_PAGE;const sel=$('bctGalleryCategory');sel.replaceChildren(new Option(copy().all||'All','All'));[...new Set(FULL.map(x=>x.category).filter(Boolean))].sort().forEach(x=>sel.add(new Option(((CATEGORY_COPY[language()]||CATEGORY_COPY.en)[x]||x),x)));fullCategory=reset?'All':([...sel.options].some(o=>o.value===priorCategory)?priorCategory:'All');sel.value=fullCategory;fullIndex=reset?0:priorIndex;showFull();if($('bctGalleryMore'))$('bctGalleryMore').hidden=!fullHasMore}

  function ensureGalleryModal(){
    if($('bctGalleryModal'))return;
    const m=document.createElement('div');m.id='bctGalleryModal';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
    const c=copy();
    m.innerHTML='<div class="bct-gallery-modal-head"><button id="bctGalleryClose" type="button">'+c.close+'</button><label>'+c.category+' <select id="bctGalleryCategory"><option value="All">'+c.all+'</option></select></label><span id="bctGalleryModalCount"></span></div><div class="bct-gallery-stage"><div><img id="bctGalleryModalImage" alt=""><div id="bctGalleryModalCaption" class="bct-gallery-modal-caption"></div></div></div><div class="bct-gallery-modal-foot"><button id="bctGalleryPrev" type="button">← '+c.prev+'</button><button id="bctGalleryMore" type="button">'+c.morePhotos+'</button><button id="bctGalleryNext" type="button">'+c.next+' →</button></div>';
    document.body.appendChild(m);
    $('bctGalleryClose').onclick=closeFullGallery;$('bctGalleryPrev').onclick=()=>moveFull(-1);$('bctGalleryNext').onclick=()=>moveFull(1);$('bctGalleryMore').onclick=()=>{fullPage++;loadFull(false)};$('bctGalleryCategory').onchange=e=>{fullCategory=e.target.value;fullIndex=0;showFull()};
    let sx=0;m.addEventListener('touchstart',e=>sx=e.changedTouches[0].clientX,{passive:true});m.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)moveFull(dx<0?1:-1)},{passive:true});document.addEventListener('keydown',e=>{if(m.hidden)return;if(e.key==='Escape')closeFullGallery();else if(e.key==='ArrowLeft')moveFull(-1);else if(e.key==='ArrowRight')moveFull(1)});
  }

  function wireGalleryControls(section){
    if(section.dataset.bctGalleryWired==='1')return;
    section.dataset.bctGalleryWired='1';
    const toggle=$('bctGalleryToggle');if(toggle)toggle.addEventListener('click',()=>{expanded=!expanded;render()});
    const full=$('bctGalleryFull');if(full)full.addEventListener('click',()=>{ensureGalleryModal();loadFull(true)});
  }

    function ensure(){
    const home=$('view-home');
    const license=$('bctPublicLicenseBar');
    if(!home||!license)return;
    injectStyle();
    let section=$('bctHomeGallery');
    if(!section){
      section=document.createElement('section');
      section.id='bctHomeGallery';
      section.setAttribute('aria-labelledby','bctHomeGalleryTitle');
      section.innerHTML='<h2 id="bctHomeGalleryTitle"></h2><p class="bct-gallery-lead"></p><div id="bctHomeGalleryGrid"></div><button type="button" id="bctGalleryToggle" aria-controls="bctHomeGalleryGrid" aria-expanded="false"></button><button type="button" id="bctGalleryFull">Open Full Gallery</button>';
      license.insertAdjacentElement('beforebegin',section);
    }
    wireGalleryControls(section);
    ensureGalleryModal();
    render();
    loadProjects();
  }


  document.addEventListener('change',event=>{
    if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(render,0);
  },true);
  window.addEventListener('pageshow',()=>{ensure();setTimeout(loadProjects,50)});window.addEventListener('bct-gallery-changed',()=>{setTimeout(loadProjects,0)});document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(loadProjects,50)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
})();
