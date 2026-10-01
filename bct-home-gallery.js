/* BCT V46 public-home project gallery.
   Isolated add-on: does not replace existing landing controls or portal logic. */
(function(){
  'use strict';
  const VERSION='BCT-PHOTO-BUILD-2026.10.01-public-foundation-2';
  window.BCT_HOME_GALLERY_VERSION=VERSION;

  const COPY={
    en:{title:'Our Work',lead:'A look at recent BCT Renovations projects.',more:'View More Projects',less:'Show Fewer Projects',slot:'BCT project photo'},
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
      .bct-gallery-card{margin:0;border:1px solid #d7e0e1;border-radius:12px;overflow:hidden;background:#f7faf9;min-width:0}
      .bct-gallery-frame{aspect-ratio:4/3;background:linear-gradient(145deg,#e7f3f3,#f7fbf8);display:flex;align-items:center;justify-content:center;overflow:hidden;color:#0f5f63;font-weight:800;text-align:center;padding:14px}
      .bct-gallery-frame img{width:100%;height:100%;display:block;object-fit:cover}
      .bct-gallery-card figcaption{padding:9px 10px;font-size:13px;font-weight:700;color:#173c3e;text-align:center}
      .bct-gallery-extra[hidden]{display:none!important}
      #bctGalleryToggle{display:block;width:100%;min-height:50px;margin:12px 0 0;background:#0f5f63;color:#fff;border-radius:10px;font-size:16px;font-weight:900}
      #bctGalleryToggle:focus-visible{outline:3px solid #7dd3fc;outline-offset:3px}
      @media(min-width:620px){#bctHomeGalleryGrid{grid-template-columns:repeat(4,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

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
    caption.textContent=[project.caption,project.project_work_date].filter(Boolean).join(' • ')||c.slot;
    figure.append(frame,caption);
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
    section.hidden=loaded&&PROJECTS.length===0;
  }

  async function loadProjects(){
    if(!window.supabaseClient){loaded=true;PROJECTS=[];render();return}
    const {data,error}=await window.supabaseClient.from('bct_gallery_photos')
      .select('id,storage_path,thumbnail_path,caption,alt_text,project_work_date,category,home_order')
      .eq('is_published',true).eq('show_on_home',true).order('home_order',{ascending:true}).limit(30);
    loaded=true;
    if(error){PROJECTS=[];render();return}
    const base=String(window.SUPABASE_URL||window.supabaseUrl||'').replace(/\/$/,'');
    const objectUrl=p=>base?base+'/storage/v1/object/public/bct-gallery/'+String(p||'').split('/').map(encodeURIComponent).join('/'):'';
    PROJECTS=(data||[]).filter(x=>x.storage_path).map(x=>({image:objectUrl(x.thumbnail_path||x.storage_path),caption:x.caption,alt:x.alt_text,project_work_date:x.project_work_date,category:x.category,id:x.id}));
    render();
  }

  function ensure(){
    const home=$('view-home');
    const license=$('bctPublicLicenseBar');
    if(!home||!license)return;
    injectStyle();
    if($('bctHomeGallery')){render();return}

    const section=document.createElement('section');
    section.id='bctHomeGallery';
    section.setAttribute('aria-labelledby','bctHomeGalleryTitle');
    section.innerHTML='<h2 id="bctHomeGalleryTitle"></h2><p class="bct-gallery-lead"></p><div id="bctHomeGalleryGrid"></div><button type="button" id="bctGalleryToggle" aria-controls="bctHomeGalleryGrid" aria-expanded="false"></button>';
    license.insertAdjacentElement('beforebegin',section);
    section.querySelector('#bctGalleryToggle').addEventListener('click',()=>{expanded=!expanded;render()});
    loadProjects();
  }

  document.addEventListener('change',event=>{
    if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(render,0);
  },true);
  window.addEventListener('pageshow',ensure);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
})();
