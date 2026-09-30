/* BCT V46 public Our Work gallery.
   Isolated landing-page enhancement created from the protected "Big Dog" checkpoint.
   Does not alter auth, portals, Admin security, Supabase, or existing landing controls. */
(function(){
  'use strict';

  const VERSION='V46-2026.09.30-public-gallery-1';
  const SECTION_ID='bctOurWorkGallery';
  const STYLE_ID='bctOurWorkGalleryStyle';
  const STORAGE_KEY='bctPublicGalleryPhotos';
  const INITIAL_VISIBLE=4;
  const PLACEHOLDER_COUNT=8;

  window.BCT_PUBLIC_GALLERY_VERSION=VERSION;

  function escapeText(value){
    return String(value==null?'':value);
  }

  function savedPhotos(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return [];
      const parsed=JSON.parse(raw);
      if(!Array.isArray(parsed))return [];
      return parsed
        .filter(item=>item&&typeof item==='object')
        .map((item,index)=>({
          src:typeof item.src==='string'?item.src.trim():'',
          alt:typeof item.alt==='string'&&item.alt.trim()?item.alt.trim():`BCT Renovations project ${index+1}`,
          caption:typeof item.caption==='string'?item.caption.trim():''
        }));
    }catch(_){return []}
  }

  function configuredPhotos(){
    const fromWindow=Array.isArray(window.BCT_PROJECT_GALLERY)?window.BCT_PROJECT_GALLERY:[];
    const cleaned=fromWindow
      .filter(item=>item&&typeof item==='object')
      .map((item,index)=>({
        src:typeof item.src==='string'?item.src.trim():'',
        alt:typeof item.alt==='string'&&item.alt.trim()?item.alt.trim():`BCT Renovations project ${index+1}`,
        caption:typeof item.caption==='string'?item.caption.trim():''
      }));
    return cleaned.length?cleaned:savedPhotos();
  }

  function galleryItems(){
    const photos=configuredPhotos();
    if(photos.length)return photos;
    return Array.from({length:PLACEHOLDER_COUNT},(_,index)=>({
      src:'',
      alt:`Project photo slot ${index+1}`,
      caption:index<INITIAL_VISIBLE?'Project photo':'More project photos'
    }));
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${SECTION_ID}{
        width:100%;margin:18px 0 0;padding:18px;
        background:#fff;border:1px solid #d7e0e1;border-radius:16px;
        box-shadow:0 8px 24px rgba(23,36,39,.06);text-align:left
      }
      #${SECTION_ID} .bct-gallery-head{display:flex;justify-content:space-between;gap:14px;align-items:end;flex-wrap:wrap;margin-bottom:14px}
      #${SECTION_ID} .bct-gallery-head h2{margin:0;color:#07383b;font-size:clamp(22px,5vw,30px)}
      #${SECTION_ID} .bct-gallery-head p{margin:5px 0 0;color:#5f6f73;line-height:1.45;max-width:680px}
      #${SECTION_ID} .bct-gallery-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      #${SECTION_ID} .bct-gallery-card{margin:0;min-width:0}
      #${SECTION_ID} .bct-gallery-media{aspect-ratio:4/3;border-radius:12px;overflow:hidden;border:1px solid #d7e0e1;background:#eef7f1;display:grid;place-items:center}
      #${SECTION_ID} .bct-gallery-media img{width:100%;height:100%;display:block;object-fit:cover}
      #${SECTION_ID} .bct-gallery-placeholder{width:100%;height:100%;display:grid;place-items:center;text-align:center;padding:16px;color:#0f5f63;background:linear-gradient(145deg,#f5fbf7,#e4f2e8)}
      #${SECTION_ID} .bct-gallery-placeholder svg{width:34px;height:34px;margin:0 auto 8px;display:block}
      #${SECTION_ID} .bct-gallery-placeholder span{font-size:13px;font-weight:800}
      #${SECTION_ID} figcaption{padding:7px 2px 0;color:#43565a;font-size:13px;line-height:1.35}
      #${SECTION_ID} .bct-gallery-actions{display:flex;justify-content:center;margin-top:14px}
      #${SECTION_ID} .bct-gallery-more{min-height:48px;padding:11px 18px;border-radius:10px;background:#0f5f63;color:#fff;font-weight:800;touch-action:manipulation}
      #${SECTION_ID} .bct-gallery-more:focus-visible{outline:3px solid #7dd3fc;outline-offset:3px}
      #${SECTION_ID} [hidden]{display:none!important}
      @media(max-width:820px){
        #${SECTION_ID}{padding:14px;margin-top:14px}
        #${SECTION_ID} .bct-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      }
      @media(max-width:380px){#${SECTION_ID} .bct-gallery-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function placeholderNode(label){
    const box=document.createElement('div');
    box.className='bct-gallery-placeholder';
    box.setAttribute('aria-label',label);
    box.innerHTML='<div><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"/></svg><span>Project photo</span></div>';
    return box;
  }

  function card(item,index){
    const figure=document.createElement('figure');
    figure.className='bct-gallery-card';
    figure.dataset.galleryIndex=String(index);
    if(index>=INITIAL_VISIBLE)figure.hidden=true;

    const media=document.createElement('div');
    media.className='bct-gallery-media';
    if(item.src){
      const img=document.createElement('img');
      img.src=item.src;
      img.alt=escapeText(item.alt||`BCT Renovations project ${index+1}`);
      img.loading=index<INITIAL_VISIBLE?'eager':'lazy';
      img.decoding='async';
      img.addEventListener('error',()=>{
        media.replaceChildren(placeholderNode(`Project photo slot ${index+1}`));
      },{once:true});
      media.appendChild(img);
    }else{
      media.appendChild(placeholderNode(`Project photo slot ${index+1}`));
    }
    figure.appendChild(media);

    if(item.caption){
      const caption=document.createElement('figcaption');
      caption.textContent=item.caption;
      figure.appendChild(caption);
    }
    return figure;
  }

  function build(){
    if(document.getElementById(SECTION_ID))return;
    const home=document.getElementById('view-home');
    const anchor=document.getElementById('bctPublicLicenseBar');
    if(!home||!anchor)return;

    injectStyle();
    const items=galleryItems();
    const section=document.createElement('section');
    section.id=SECTION_ID;
    section.setAttribute('aria-labelledby','bctOurWorkTitle');

    const head=document.createElement('div');
    head.className='bct-gallery-head';
    head.innerHTML='<div><h2 id="bctOurWorkTitle">Our Work</h2><p>Take a look at BCT Renovations project work. Four projects are shown first so the home page stays clean.</p></div>';

    const grid=document.createElement('div');
    grid.className='bct-gallery-grid';
    items.forEach((item,index)=>grid.appendChild(card(item,index)));

    section.append(head,grid);

    if(items.length>INITIAL_VISIBLE){
      const actions=document.createElement('div');
      actions.className='bct-gallery-actions';
      const more=document.createElement('button');
      more.type='button';
      more.className='bct-gallery-more';
      more.textContent='View More Projects';
      more.setAttribute('aria-expanded','false');
      more.addEventListener('click',()=>{
        const expanded=more.getAttribute('aria-expanded')==='true';
        grid.querySelectorAll('[data-gallery-index]').forEach((node,index)=>{
          if(index>=INITIAL_VISIBLE)node.hidden=expanded;
        });
        more.setAttribute('aria-expanded',expanded?'false':'true');
        more.textContent=expanded?'View More Projects':'Show Fewer Projects';
      });
      actions.appendChild(more);
      section.appendChild(actions);
    }

    anchor.insertAdjacentElement('afterend',section);
  }

  function ensure(){
    if(document.getElementById(SECTION_ID))return;
    build();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});
  else ensure();
  window.addEventListener('pageshow',ensure);
})();
