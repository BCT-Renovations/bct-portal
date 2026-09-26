const CACHE_NAME='bct-portal-shell-v7-mobile-home-cleanup';
const APP_SHELL=['/','/index.html','/manifest.webmanifest','/bct-icon.svg','/bct-homeowner-pages.js'];

const ADMIN_LOGIN_HOTFIX=`
<script id="bct-admin-login-hotfix">
(()=>{
  const SUPABASE_URL='https://onpqykpikxbbypfvmtin.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JToQ3bPaJql-xHq-iyM0bg_Fweenyfh';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const status=(html,kind='notice')=>{const el=$('adminAuthStatus');if(el)el.innerHTML='<div class="'+kind+'">'+html+'</div>';};
  const friendly=e=>{const msg=String(e?.message||e||'Unknown authentication error');if(/invalid login credentials/i.test(msg))return 'The email or password did not match a BCT admin account.';if(/email not confirmed/i.test(msg))return 'This email is not confirmed yet. Use Forgot Password or resend confirmation, then check inbox and spam.';if(/failed to fetch|network|load failed/i.test(msg))return 'The browser could not reach the BCT login server. Check connection and try again.';return msg;};
  const showView=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(id)?.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});};
  const getClient=()=>{
    if(window.supabaseClient)return window.supabaseClient;
    if(window.supabase?.createClient)return window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    throw new Error('BCT login library did not load. Refresh the page and try again.');
  };
  async function hotfixAdminLogin(ev){
    const btn=ev?.target?.closest?.('#adminLoginBtn');
    if(!btn)return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const old=btn.textContent;
    try{
      btn.disabled=true;btn.textContent='Signing in...';
      const email=$('adminEmail')?.value?.trim()||'';
      const password=$('adminPassword')?.value||'';
      if(!email||!password)throw new Error('Enter your BCT admin email and password.');
      status('<b>Checking BCT admin login...</b>','notice backend-live');
      const client=getClient();
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error)throw error;
      const user=data?.user||(await client.auth.getUser()).data?.user;
      const role=user?.app_metadata?.role||user?.user_metadata?.role||user?.role||'';
      if(role!=='admin'){
        await client.auth.signOut({scope:'local'}).catch(()=>{});
        throw new Error('This account signed in, but it is not marked as a BCT admin yet. Add the admin role in Supabase, then try again.');
      }
      if($('adminSessionEmail'))$('adminSessionEmail').textContent=email;
      status('<b>✓ BCT Admin authenticated.</b> Opening the dashboard...','notice backend-live');
      showView('view-admin');
      if(typeof window.loadAdminState==='function')await window.loadAdminState();
    }catch(e){
      status('<b>Sign-in failed:</b> '+esc(friendly(e)));
    }finally{
      btn.disabled=false;btn.textContent=old||'Sign In to BCT Admin';
    }
  }
  document.addEventListener('click',hotfixAdminLogin,true);
  document.addEventListener('DOMContentLoaded',()=>{
    const pwd=$('adminPassword');
    if(pwd&&!pwd.dataset.bctEnterHotfix){pwd.dataset.bctEnterHotfix='true';pwd.addEventListener('keydown',e=>{if(e.key==='Enter'){$('adminLoginBtn')?.click();}})}
    const show=$('adminShowPassword');
    if(show&&!show.dataset.bctShowHotfix){show.dataset.bctShowHotfix='true';show.addEventListener('change',()=>{const p=$('adminPassword');if(p)p.type=show.checked?'text':'password';});}
    const forgot=$('adminForgotBtn');
    if(forgot&&!forgot.dataset.bctForgotHotfix){forgot.dataset.bctForgotHotfix='true';forgot.addEventListener('click',()=>{if(typeof requestPasswordReset==='function')requestPasswordReset();else showView('view-password-request');});}
  });
})();
</script>`;

const COMMAND_CENTER_HOTFIX=`
<style id="bct-command-center-style">
.bct-command-center{margin:18px 0 22px;padding:22px;border:1px solid #075985;border-radius:22px;background:linear-gradient(135deg,rgba(8,47,73,.98),rgba(15,23,42,.98));box-shadow:0 18px 50px rgba(0,0,0,.28)}
.bct-command-center h2{font-size:clamp(30px,6vw,52px);line-height:1;margin:.1em 0}.bct-command-center p{max-width:850px}.bct-command-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.bct-command-card{border:1px solid #334155;border-radius:16px;background:#0b1220;color:#f8fafc;text-align:left;padding:16px;min-height:95px;cursor:pointer}.bct-command-card:hover,.bct-command-card:focus{outline:2px solid #38bdf8;background:#082f49}.bct-command-card b{display:block;font-size:18px;margin-bottom:4px}.bct-command-card span{display:block;color:#cbd5e1;font-size:13px;line-height:1.35}.bct-portal-search-wrap{position:relative;margin-top:16px}.bct-portal-search{font-size:18px;padding:15px 16px;border:2px solid #0ea5e9;background:#020617}.bct-portal-results{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:60;max-height:330px;overflow:auto;border:1px solid #075985;border-radius:14px;background:#020617;box-shadow:0 18px 40px rgba(0,0,0,.42)}.bct-portal-result{display:flex;justify-content:space-between;gap:12px;width:100%;padding:13px 14px;text-align:left;border:0;border-bottom:1px solid #1e293b;border-radius:0;background:#020617;color:#f8fafc}.bct-portal-result:hover,.bct-portal-result:focus{background:#082f49;outline:none}.bct-portal-result small{color:#94a3b8}.bct-portal-no-results{padding:13px 14px;color:#fca5a5}.bct-view-section-index{margin:0 0 14px;padding:14px;border:1px solid #334155;border-radius:16px;background:#0b1220}.bct-view-section-index strong{display:block;margin-bottom:8px}.bct-section-chip-row{display:flex;gap:8px;flex-wrap:wrap}.bct-section-chip{border:1px solid #334155;border-radius:999px;background:#111827;color:#f8fafc;padding:8px 11px;font-size:13px}.bct-section-chip:hover,.bct-section-chip:focus{outline:2px solid #38bdf8;background:#082f49}.bct-highlight-target{animation:bctPulse 2.4s ease;border-color:#38bdf8!important;box-shadow:0 0 0 3px rgba(56,189,248,.35)}@keyframes bctPulse{0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,0)}35%{box-shadow:0 0 0 8px rgba(56,189,248,.35)}}@media(max-width:820px){.bct-command-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.bct-command-center{padding:16px}.bct-command-center>p{font-size:15px}.bct-portal-results{position:static;margin-top:8px;max-height:280px}.bct-command-card{min-height:auto;padding:12px}.bct-command-card b{font-size:15px}.bct-command-card span{font-size:11px}.bct-section-chip{width:100%;text-align:left}}@media(max-width:480px){.bct-command-card span{display:none}.bct-command-card{min-height:58px;display:flex;align-items:center}.bct-command-grid{grid-template-columns:1fr 1fr}}
</style>
<script id="bct-command-center-hotfix">
(()=>{
  if(window.__bctCommandCenterLoaded)return;window.__bctCommandCenterLoaded=true;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const viewMap={home:'view-home',customer:'view-customer',apply:'view-apply',status:'view-status',jobs:'view-jobs',admin:'view-admin-login'};
  const stopWords=new Set(['language','name','email','phone','address','city','state','zip','yes','no','notes','description','status','type']);
  function showViewByKey(key){
    const target=viewMap[key]||key;
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    const el=$(target);if(el){el.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});} 
    document.querySelectorAll('[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===key));
    renderSectionIndex(target);
  }
  function highlight(el){if(!el)return;el.classList.remove('bct-highlight-target');void el.offsetWidth;el.classList.add('bct-highlight-target');setTimeout(()=>el.classList.remove('bct-highlight-target'),2600)}
  function visibleLabel(el){return String(el?.innerText||el?.textContent||'').replace(/\s+/g,' ').trim()}
  const baseItems=[
    {label:'Homeowner Project',group:'Main Workflow',view:'customer',hint:'Submit a customer project to BCT'},
    {label:'Contractor Application',group:'Main Workflow',view:'apply',hint:'Apply or pre-apply as a subcontractor'},
    {label:'Applicant Status',group:'Main Workflow',view:'status',hint:'Check contractor application status'},
    {label:'Available Jobs',group:'Main Workflow',view:'jobs',hint:'View BCT jobs and bidding area'},
    {label:'BCT Admin Login',group:'Admin',view:'admin',hint:'Open protected admin sign-in'},
    {label:'Financing',group:'Customer',view:'home',selector:'#bctFinancingCard',hint:'Check financing information'},
    {label:'BCT Admin Dashboard',group:'Admin',view:'admin',selector:'#view-admin',hint:'Admin dashboard after sign-in'},
    {label:'Applicant Pipeline',group:'Admin',view:'admin',hint:'Review contractor applicants'},
    {label:'Homeowner Project Review',group:'Admin',view:'admin',hint:'Review customer projects'},
    {label:'AI Estimating',group:'Admin',view:'admin',hint:'Open estimating workspace'},
    {label:'BCT Bid Review',group:'Admin',view:'admin',hint:'Review subcontractor bids'},
    {label:'BCT Service Calls',group:'Admin',view:'admin',hint:'Manage service calls'},
    {label:'BCT Jobs',group:'Admin',view:'admin',hint:'Manage assigned jobs'},
    {label:'Payment Escrow Financing',group:'Admin',view:'admin',hint:'Track payment, escrow and financing'},
    {label:'Property Manager Commercial Apartment',group:'Property Manager',view:'customer',hint:'Commercial, building and unit fields'},
    {label:'Change Orders',group:'Project Controls',view:'admin',hint:'Open change-order review area'},
    {label:'Escrow Release',group:'Project Controls',view:'admin',hint:'Open escrow and payment release controls'},
    {label:'Safety Training',group:'Contractor',view:'apply',hint:'Open safety screening and training area'},
    {label:'Project Photos and Documents',group:'Uploads',view:'customer',hint:'Open customer file upload area'}
  ];
  function itemScore(item,q){
    const label=item.label.toLowerCase();const group=item.group.toLowerCase();const hay=(item.label+' '+item.group+' '+(item.hint||'')).toLowerCase();
    if(label===q)return 0;if(label.startsWith(q))return 1;if(group.startsWith(q))return 2;if(label.split(/\s+/).some(w=>w.startsWith(q)))return 3;if(hay.includes(q))return 4;return 99;
  }
  function scanItems(){
    const found=[];
    document.querySelectorAll('main h2, main h3, main .toolbar h3, main .card h3, main .stage h3, main label').forEach((el,i)=>{
      const label=visibleLabel(el);if(!label||label.length<3||label.length>95)return;
      if(stopWords.has(label.toLowerCase()))return;
      const section=el.closest('section');
      const viewId=section?.id||'view-home';
      if(!el.id)el.id='bct-search-target-'+i;
      found.push({label,group:viewId.replace('view-','').replace(/-/g,' '),view:viewId,selector:'#'+el.id,hint:'Open this section'});
    });
    const all=[...baseItems,...found];
    const seen=new Set();
    return all.filter(item=>{const key=(item.label+'|'+item.view+'|'+(item.selector||'')).toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
  }
  function openItem(item){
    if(!item)return;
    if(item.view&&item.view.startsWith('view-')){
      document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
      $(item.view)?.classList.remove('hidden');
      renderSectionIndex(item.view);
    }else showViewByKey(item.view||'home');
    const target=item.selector?document.querySelector(item.selector):null;
    setTimeout(()=>{
      const el=target||$(item.view)||$(viewMap[item.view]);
      if(el){el.scrollIntoView({behavior:'smooth',block:'start'});highlight(el.closest('.card,.stage,section')||el);} 
    },80);
    const results=$('bctPortalSearchResults');if(results)results.innerHTML='';
  }
  function renderResults(query){
    const box=$('bctPortalSearchResults');if(!box)return;
    const q=String(query||'').trim().toLowerCase();
    if(!q){box.innerHTML='';return;}
    const matches=scanItems().filter(item=>itemScore(item,q)<99).sort((a,b)=>itemScore(a,q)-itemScore(b,q)||a.label.localeCompare(b.label)).slice(0,14);
    if(!matches.length){box.innerHTML='<div class="bct-portal-no-results">No matching section found.</div>';return;}
    box.innerHTML=matches.map((item,idx)=>'<button type="button" class="bct-portal-result" data-bct-result="'+idx+'"><span><b>'+esc(item.label)+'</b><small>'+esc(item.hint||item.group)+'</small></span><small>'+esc(item.group)+'</small></button>').join('');
    box.querySelectorAll('[data-bct-result]').forEach(btn=>btn.addEventListener('click',()=>openItem(matches[Number(btn.dataset.bctResult)])));
  }
  function renderSectionIndex(viewId){
    const view=$(viewId);if(!view)return;
    const old=view.querySelector('.bct-view-section-index');if(old)old.remove();
    if(viewId==='view-home')return;
    const local=scanItems().filter(item=>item.view===viewId&&item.selector).slice(0,10);
    if(local.length<2)return;
    const nav=document.createElement('div');nav.className='bct-view-section-index';nav.innerHTML='<strong>Jump inside this page</strong><div class="bct-section-chip-row">'+local.map((item,idx)=>'<button type="button" class="bct-section-chip" data-bct-section-jump="'+idx+'">'+esc(item.label)+'</button>').join('')+'</div>';
    view.insertBefore(nav,view.firstChild);
    nav.querySelectorAll('[data-bct-section-jump]').forEach(btn=>btn.addEventListener('click',()=>openItem(local[Number(btn.dataset.bctSectionJump)])));
  }
  function installCommandCenter(){
    const home=$('view-home');if(!home||$('bctCommandCenter'))return;
    const panel=document.createElement('div');panel.id='bctCommandCenter';panel.className='bct-command-center';
    panel.innerHTML='<span class="badge info">BCT Command Center</span><h2>Start here.</h2><p class="muted">Search or tap a workflow. Sections open when needed so the app does not feel like one long stacked list.</p><div class="bct-portal-search-wrap"><label for="bctPortalSearch">Search the BCT Portal</label><input id="bctPortalSearch" class="bct-portal-search" type="search" autocomplete="off" placeholder="Type a title, name, job, section, or workflow..." aria-controls="bctPortalSearchResults"><div id="bctPortalSearchResults" class="bct-portal-results" role="listbox"></div></div><div class="bct-command-grid"><button class="bct-command-card" data-bct-open="customer"><b>Homeowner Project</b><span>Submit a private project request to BCT.</span></button><button class="bct-command-card" data-bct-open="apply"><b>Contractor Application</b><span>Start subcontractor pre-application and screening.</span></button><button class="bct-command-card" data-bct-open="status"><b>Applicant Status</b><span>Check current contractor application status.</span></button><button class="bct-command-card" data-bct-open="jobs"><b>Available Jobs</b><span>Open BCT jobs and private bidding area.</span></button><button class="bct-command-card" data-bct-open="admin"><b>BCT Admin</b><span>Protected BCT login and dashboard.</span></button><button class="bct-command-card" data-bct-open="financing"><b>Financing</b><span>Open financing information and qualification link.</span></button></div>';
    home.insertBefore(panel,home.firstChild);const direct=[...home.children].filter(el=>el!==panel);direct.forEach(el=>{if(el.id==='bctFinancingCard'){el.classList.add('hidden');return;}if(el.matches('.grid.grid-4.section')||el.matches('.notice'))el.classList.add('hidden');});
    panel.querySelectorAll('[data-bct-open]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.bctOpen;if(key==='financing')openItem({view:'home',selector:'#bctFinancingCard',label:'Financing'});else showViewByKey(key);}));
    const input=$('bctPortalSearch');if(input){input.addEventListener('input',()=>renderResults(input.value));input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';renderResults('');}})}
    renderSectionIndex(Array.from(document.querySelectorAll('.view')).find(v=>!v.classList.contains('hidden'))?.id||'view-home');
  }
  document.addEventListener('click',ev=>{const nav=ev.target.closest?.('[data-view]');if(nav?.dataset?.view){setTimeout(()=>renderSectionIndex(viewMap[nav.dataset.view]||'view-'+nav.dataset.view),120);}});
  document.addEventListener('DOMContentLoaded',installCommandCenter);
  installCommandCenter();
})();
</script>`;

const HOMEOWNER_PAGES_SCRIPT='<script src="/bct-homeowner-pages.js" defer><\/script>';

function injectPortalShell(html){
  if(typeof html!=='string')return html;
  let output=html;
  if(!output.includes('bct-admin-login-hotfix'))output=output.replace('</body>',ADMIN_LOGIN_HOTFIX+'\n</body>');
  if(!output.includes('bct-command-center-hotfix'))output=output.replace('</body>',COMMAND_CENTER_HOTFIX+'\n</body>');
  if(!output.includes('/bct-homeowner-pages.js'))output=output.replace('</body>',HOMEOWNER_PAGES_SCRIPT+'\n</body>');
  return output;
}

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bct-portal-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(!APP_SHELL.includes(url.pathname)||url.search)return;
  event.respondWith(fetch(event.request).then(async response=>{
    if(!response.ok||response.type!=='basic')return response;
    const contentType=response.headers.get('content-type')||'';
    if(contentType.includes('text/html')){
      const html=injectPortalShell(await response.text());
      const patched=new Response(html,{status:response.status,statusText:response.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
      const cacheCopy=patched.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,cacheCopy)));
      return patched;
    }
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
    return response;
  }).catch(()=>caches.match(event.request).then(async cached=>{
    if(!cached)return cached;
    const contentType=cached.headers.get('content-type')||'';
    if(contentType.includes('text/html'))return new Response(injectPortalShell(await cached.text()),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    return cached;
  })));
});