(()=>{if(window.__bctHomeownerPagesLoaded)return;window.__bctHomeownerPagesLoaded=true;
const $=id=>document.getElementById(id),root=()=>$('view-customer');
const css='.bct-hp-shell{margin:0 0 18px;padding:18px;border:1px solid #075985;border-radius:20px;background:#07111f}.bct-hp-brand{display:flex;align-items:center;gap:12px;margin-bottom:12px}.bct-hp-brand img{width:58px;height:58px;border-radius:14px}.bct-hp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.bct-hp-tile{min-height:105px;text-align:left;border:1px solid #334155;border-radius:15px;background:#0b1220;color:#f8fafc;padding:14px}.bct-hp-tile b,.bct-hp-tile span{display:block}.bct-hp-tile span{font-size:12px;color:#cbd5e1;margin-top:5px}.bct-hp-tile.active{outline:2px solid #38bdf8;background:#082f49}.bct-hp-bar{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.bct-hp-bar button{width:auto}.bct-hp-managed,.bct-hp-overview{display:none!important}.bct-hp-active{display:block!important}.bct-hp-note{border:1px solid #334155;border-radius:14px;padding:14px;background:#0b1220}@media(max-width:900px){.bct-hp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.bct-hp-grid{grid-template-columns:1fr}.bct-hp-tile{min-height:auto}.bct-hp-bar{display:grid;grid-template-columns:1fr 1fr}.bct-hp-bar button{width:100%}}';
const st=document.createElement('style');st.id='bct-homeowner-pages-style';st.textContent=css;document.head.appendChild(st);
const pages=[['overview','Project Overview','Sign in, check a project, or start a new request.'],['details','Project Details','Account, property, scope, budget, and timeline.'],['files','Photos & Files','Upload project photos, video, and documents.'],['estimate','Estimate & Contract','Customer-facing estimate and contract information.'],['finance','Financing & Payments','Financing, payment, and escrow status.'],['schedule','Schedule & Progress','Schedule, milestones, and progress.'],['messages','Messages','Project communication with BCT.'],['completion','Final Walkthrough & Completion','Completion review and homeowner sign-off.']];
// Homeowner navigation copy is generated after the global language pass.
// Keep English originals so changing back to English never retains Spanish text.
const hpOriginalText=new WeakMap();
const hpSpanish={
 'Project Overview':'Resumen del proyecto','Sign in, check a project, or start a new request.':'Inicie sesión, consulte un proyecto o cree una nueva solicitud.',
 'Project Details':'Detalles del proyecto','Account, property, scope, budget, and timeline.':'Cuenta, propiedad, alcance, presupuesto y calendario.',
 'Photos & Files':'Fotos y archivos','Upload project photos, video, and documents.':'Suba fotos, videos y documentos del proyecto.',
 'Estimate & Contract':'Presupuesto y contrato','Customer-facing estimate and contract information.':'Información de presupuestos y contratos para clientes.',
 'Financing & Payments':'Financiación y pagos','Financing, payment, and escrow status.':'Estado de financiación, pagos y fondos en depósito.',
 'Schedule & Progress':'Calendario y progreso','Schedule, milestones, and progress.':'Calendario, hitos y progreso.',
 'Messages':'Mensajes','Project communication with BCT.':'Comunicación del proyecto con BCT.',
 'Final Walkthrough & Completion':'Inspección final y finalización','Completion review and homeowner sign-off.':'Revisión de finalización y aprobación del propietario.',
 'Private homeowner project area':'Área privada de proyectos del propietario',
 'Sign in through Project Overview to load information BCT has released to your account.':'Inicie sesión desde Resumen del proyecto para consultar la información que BCT ha habilitado para su cuenta.',
 'Approved customer-facing estimates and contract actions appear here; BCT-only costs, markup, notes, and AI metadata stay hidden.':'Aquí aparecen los presupuestos y contratos aprobados para clientes; los costos internos, márgenes, notas y datos de IA de BCT permanecen ocultos.',
 'Financing and escrow information appears here. BCT controls approval and release status.':'Aquí aparece la información de financiación y depósito en garantía. BCT controla las aprobaciones y los desembolsos.',
 'Approved schedule events, milestones, and project progress appear here.':'Aquí aparecen las fechas, los hitos y el progreso aprobados del proyecto.',
 'Homeowner-to-BCT project messages appear here. Contractor contact remains controlled by BCT.':'Aquí aparecen los mensajes entre el propietario y BCT. BCT sigue controlando el contacto con los contratistas.',
 'Final review, completion approval, and sign-off appear here.':'Aquí aparecen la revisión final, la aprobación de finalización y la firma.',
 'Account':'Cuenta','Property':'Propiedad','Work Needed':'Trabajo necesario','Budget':'Presupuesto','Timeline':'Calendario','Review & Submit':'Revisar y enviar',
 'BCT Homeowner Portal':'Portal de propietarios BCT','Your project, one page at a time.':'Su proyecto, paso a paso.',
 'Choose what you need instead of scrolling through the whole portal.':'Elija lo que necesita sin recorrer todo el portal.'
};
function translateHomeownerShell(){
 const shell=$('bctHomeownerDashboard');if(!shell)return;
 const lang=localStorage.getItem('bctPreferredLanguage')||'en';
 const walker=document.createTreeWalker(shell,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){
  if(!node.parentElement || node.parentElement.closest('script,style,[data-i18n]'))continue;
  if(!hpOriginalText.has(node))hpOriginalText.set(node,node.nodeValue);
  const original=hpOriginalText.get(node),raw=original.trim();
  const next=lang==='es' && hpSpanish[raw] ? original.replace(raw,hpSpanish[raw]) : original;
  if(node.nodeValue!==next)node.nodeValue=next;
 }
 // Include the separate private page cards created by host().
 root()?.querySelectorAll('[id^="bct-homeowner-"][id$="-page"]').forEach(page=>{
  const walk=document.createTreeWalker(page,NodeFilter.SHOW_TEXT);let textNode;
  while((textNode=walk.nextNode())){
   if(!hpOriginalText.has(textNode))hpOriginalText.set(textNode,textNode.nodeValue);
   const original=hpOriginalText.get(textNode),raw=original.trim();
   const next=lang==='es' && hpSpanish[raw] ? original.replace(raw,hpSpanish[raw]) : original;
   if(textNode.nodeValue!==next)textNode.nodeValue=next;
  }
 });
}
document.addEventListener('change',event=>{if(['bctLoginLanguage','bctLanguage'].includes(event.target?.id))setTimeout(translateHomeownerShell,0)},true);
function h(c){return(c?.querySelector('h3')?.textContent||'').trim()}function card(p){return[...root().querySelectorAll('.card.section')].find(c=>h(c).startsWith(p))}
function manage(el,page,sub){if(!el)return;el.classList.add('bct-hp-managed');el.dataset.hpPage=page;if(sub)el.dataset.hpSub=sub}
function host(key,title,copy){const el=document.createElement('div');el.className='card section bct-hp-managed';el.dataset.hpPage=key;el.id='bct-homeowner-'+key+'-page';el.innerHTML='<h3>'+title+'</h3><div class="bct-hp-note"><b>Private homeowner project area</b><p class="muted">'+copy+'</p><p class="muted">Sign in through Project Overview to load information BCT has released to your account.</p></div>';root().appendChild(el)}
function subbar(){return[['account','Account'],['property','Property'],['work','Work Needed'],['budget','Budget'],['timeline','Timeline'],['review','Review & Submit']].map(x=>'<button type="button" class="secondary" data-hp-sub="'+x[0]+'">'+x[1]+'</button>').join('')}
function openSub(k,scroll=true){root().querySelectorAll('[data-hp-page="details"]').forEach(el=>el.classList.toggle('bct-hp-active',el.dataset.hpSub===k));$('bctHomeownerPageBar')?.querySelectorAll('[data-hp-sub]').forEach(b=>b.classList.toggle('active',b.dataset.hpSub===k));translateHomeownerShell();if(scroll)$('bctHomeownerDashboard')?.scrollIntoView({behavior:'smooth',block:'start'})}
function openPage(k,scroll=true){root().querySelectorAll('.bct-hp-overview').forEach(el=>el.classList.toggle('bct-hp-active',el.dataset.hpPage===k));root().querySelectorAll('.bct-hp-managed').forEach(el=>el.classList.toggle('bct-hp-active',el.dataset.hpPage===k));root().querySelectorAll('[data-hp-open]').forEach(b=>b.classList.toggle('active',b.dataset.hpOpen===k));const bar=$('bctHomeownerPageBar');if(k==='details'){bar.classList.remove('hidden');bar.innerHTML=subbar();bar.querySelectorAll('[data-hp-sub]').forEach(b=>b.addEventListener('click',()=>openSub(b.dataset.hpSub)));openSub('account',false)}else{bar.classList.add('hidden');bar.innerHTML=''}if(scroll)$('bctHomeownerDashboard')?.scrollIntoView({behavior:'smooth',block:'start'})}
function install(){if(!root()||$('bctHomeownerDashboard'))return;const hero=root().querySelector('.customer-hero'),login=$('bctHomeownerLoginCard');[hero,login].forEach(el=>{if(el){el.classList.add('bct-hp-overview');el.dataset.hpPage='overview'}});manage(card('1 —'),'details','account');manage(card('2 —'),'details','property');manage(card('3 —'),'details','work');manage(card('4 —'),'files','files');manage(card('5 —'),'details','budget');manage(card('6 —'),'details','timeline');manage(card('7 —'),'details','review');host('estimate','Estimate & Contract','Approved customer-facing estimates and contract actions appear here; BCT-only costs, markup, notes, and AI metadata stay hidden.');host('finance','Financing & Payments','Financing and escrow information appears here. BCT controls approval and release status.');host('schedule','Schedule & Progress','Approved schedule events, milestones, and project progress appear here.');host('messages','Messages','Homeowner-to-BCT project messages appear here. Contractor contact remains controlled by BCT.');host('completion','Final Walkthrough & Completion','Final review, completion approval, and sign-off appear here.');
const shell=document.createElement('div');shell.id='bctHomeownerDashboard';shell.className='bct-hp-shell';shell.innerHTML='<div class="bct-hp-brand"><img src="/bct-icon.svg" alt="BCT Renovations"><div><span class="badge info">BCT Homeowner Portal</span><h2 style="margin:4px 0">Your project, one page at a time.</h2><p class="muted" style="margin:0">Choose what you need instead of scrolling through the whole portal.</p></div></div><div class="bct-hp-grid">'+pages.map(x=>'<button type="button" class="bct-hp-tile" data-hp-open="'+x[0]+'"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>').join('')+'</div><div id="bctHomeownerPageBar" class="bct-hp-bar hidden"></div>';root().insertBefore(shell,root().firstChild);shell.querySelectorAll('[data-hp-open]').forEach(b=>b.addEventListener('click',()=>openPage(b.dataset.hpOpen)));openPage('overview',false)}
window.bctOpenHomeownerPage=openPage;document.addEventListener('DOMContentLoaded',install);install()})();