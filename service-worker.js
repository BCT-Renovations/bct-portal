// bct-app-icon-v46-hotfix refreshes the dedicated teal-green iPhone/PWA icon without replacing the master logo.
// bct-admin-login-hotfix; previous rollout marker: bct-portal-shell-v7-mobile-home-cleanup
// bct-command-center-hotfix keeps the V46 public/admin typeahead shell fresh on phones.
// bct-clean-signin-hotfix forces phones to load the minimal three-button sign-in screen.
// bct-wide-logo-hotfix forces phones to reload the wider signed-out logo header.
// bct-official-logo-hotfix forces phones to load the selected full official BCT logo.
// bct-portal-entry-hotfix forces installed/mobile clients to load repaired Contractor and Client portal entry rendering.
// bct-green-logo-band-hotfix forces installed/mobile clients to load the full-width mint logo band.
// bct-startup-cache-reset stops old cached HTML from replacing the correct V46 iPhone startup screen.
// bct-visible-landing-reset forces the final visible iPhone landing CSS and cache reset.
// bct-signup-home-nav-hotfix keeps Back to Home visible while a new client moves through the 7-step project form.
// bct-runtime-guardrails wires existing backend feature flags, authenticated client-error logging, and admin build visibility.
// bct-admin-mobile-controls-hotfix guarantees signed-in Admin touch targets and loads the Spanish Admin stability patch.
const CACHE_NAME='bct-portal-shell-v31-signup-mutation-stability';
const STATIC_ASSETS=['/bct-logo-master.png','/bct-app-icon-v46.png'];
const HTML_PATHS=new Set(['/','/index.html']);
const BCT_SIGNUP_HOME_NAV_PATCH=`
<style id="bct-signup-home-nav-hotfix-style">
body.bct-home-signup:not(.bct-authenticated) #customerProjectForm .bct-step-controls .bct-wizard-home-sticky{
  grid-column:1 / -1!important;
  order:-1;
  width:100%!important;
  min-height:48px;
  margin:0 0 2px!important;
  background:#fff!important;
  color:#0a5457!important;
  border:1px solid #cbdde0!important;
  box-shadow:none!important;
}
</style>
<script id="bct-signup-home-nav-hotfix-script">
(function(){
  const labels={en:'← Back to Home',es:'← Volver al inicio',fr:'← Retour à l’accueil',ht:'← Retounen lakay',pt:'← Voltar ao início',vi:'← Về trang chủ',zh:'← 返回主页',ar:'العودة إلى الصفحة الرئيسية ←',ru:'← На главную'};
  function lang(){return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}
  function ensure(){
    if(!document.body.classList.contains('bct-home-signup')||document.body.classList.contains('bct-authenticated'))return;
    const controls=document.querySelector('#customerProjectForm .bct-step-controls');
    if(!controls)return;
    let button=document.getElementById('bctWizardBackHomeSticky');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.id='bctWizardBackHomeSticky';
      button.className='secondary bct-wizard-home-sticky';
      button.addEventListener('click',function(event){
        event.preventDefault();
        if(typeof window.bctReturnToPublicLanding==='function')window.bctReturnToPublicLanding();
        else{document.body.classList.remove('bct-home-signup');location.hash='home';}
        requestAnimationFrame(()=>window.scrollTo(0,0));
      });
      controls.prepend(button);
    }
    const next=labels[lang()]||labels.en;
    if(button.textContent!==next)button.textContent=next;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
  document.addEventListener('click',()=>requestAnimationFrame(ensure),true);
  document.addEventListener('change',event=>{if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))requestAnimationFrame(ensure)});
  new MutationObserver(()=>requestAnimationFrame(ensure)).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
})();
<\/script>`;
const BCT_RUNTIME_GUARDRAIL_PATCH=`
<script id="bct-runtime-guardrails-20260929">
(function(){
  const BUILD='V46-2026.09.29-guardrails-1';
  const SAFE_MODE_KEY='bctAdminSafeMode';
  const OPTIONAL_FEATURES=['weather_external_provider_enabled','electronic_signatures_enabled','ai_estimating_external_engine_enabled'];
  let flags={};
  let lastErrorKey='';
  let lastErrorAt=0;
  window.BCT_BUILD=BUILD;
  window.BCT_FEATURE_FLAGS=flags;
  function safeMode(){try{return localStorage.getItem(SAFE_MODE_KEY)==='1'}catch(_){return false}}
  window.bctFeatureEnabled=function(name,fallback){
    const value=window.BCT_FEATURE_FLAGS&&Object.prototype.hasOwnProperty.call(window.BCT_FEATURE_FLAGS,name)?window.BCT_FEATURE_FLAGS[name]:!!fallback;
    return safeMode()&&OPTIONAL_FEATURES.includes(name)?false:!!value;
  };
  function statusBadge(on){return '<span class="badge '+(on?'good':'warn')+'">'+(on?'ON':'OFF')+'</span>'}
  function render(){
    const host=document.getElementById('launchControlList');
    if(!host)return;
    let card=document.getElementById('bctRuntimeGuardrailsCard');
    if(!card){
      card=document.createElement('div');
      card.id='bctRuntimeGuardrailsCard';
      card.className='card';
      host.prepend(card);
    }
    const f=window.BCT_FEATURE_FLAGS||{};
    const safe=safeMode();
    const api=f.frontend_api_version||'not loaded';
    const weather=window.bctFeatureEnabled('weather_external_provider_enabled',false);
    const errors=window.bctFeatureEnabled('client_error_tracking_enabled',true);
    const ai=window.bctFeatureEnabled('ai_estimating_enabled',true);
    card.innerHTML='<div class="toolbar"><div><h3>Runtime Safety & Build</h3><p class="muted">Protective controls only; this does not change project, payment, or approval data.</p></div><button type="button" class="secondary" id="bctToggleAdminSafeMode">'+(safe?'Turn Safe Mode Off':'Turn Safe Mode On')+'</button></div>'+
      '<div class="grid grid-2 section">'+
      '<div class="stage"><b>Build</b><br><small>'+BUILD+'<br>API '+String(api).replace(/[<>&]/g,'')+'</small></div>'+
      '<div class="stage"><b>Admin Safe Mode</b><br>'+statusBadge(safe)+'<br><small>On this device, optional integrations are held off while core portals remain available.</small></div>'+
      '<div class="stage"><b>AI Estimating</b><br>'+statusBadge(ai)+'</div>'+
      '<div class="stage"><b>Live Weather Provider</b><br>'+statusBadge(weather)+'<br><small>'+(f.weather_provider||'Provider not reported')+'</small></div>'+
      '<div class="stage"><b>Client Error Tracking</b><br>'+statusBadge(errors)+'</div>'+
      '<div class="stage"><b>External AI Engine</b><br>'+statusBadge(window.bctFeatureEnabled('ai_estimating_external_engine_enabled',false))+'</div>'+
      '</div>';
  }
  async function loadFlags(){
    try{
      if(typeof supabaseClient==='undefined'||!supabaseClient)return render();
      const result=await supabaseClient.rpc('bct_frontend_feature_flags');
      if(result.error)throw result.error;
      flags=result.data||{};
      window.BCT_FEATURE_FLAGS=flags;
    }catch(_){
      flags={};
      window.BCT_FEATURE_FLAGS=flags;
    }
    render();
  }
  async function logClientError(kind,message,code){
    try{
      if(!window.bctFeatureEnabled('client_error_tracking_enabled',true))return;
      if(typeof supabaseClient==='undefined'||!supabaseClient)return;
      const clean=String(message||'Unknown client error').slice(0,1000);
      const key=kind+'|'+clean+'|'+location.pathname;
      const now=Date.now();
      if(key===lastErrorKey&&now-lastErrorAt<15000)return;
      lastErrorKey=key;lastErrorAt=now;
      const userResult=await supabaseClient.auth.getUser();
      if(!userResult.data||!userResult.data.user)return;
      await supabaseClient.rpc('bct_log_client_error',{
        p_source:'frontend',
        p_severity:'error',
        p_error_code:String(code||kind).slice(0,120),
        p_message:clean,
        p_route:(location.pathname+location.hash).slice(0,300),
        p_action_name:null,
        p_context:{build:BUILD,online:navigator.onLine}
      });
    }catch(_){}
  }
  window.addEventListener('error',function(event){logClientError('window_error',event.message||event.error?.message||'Window error','window_error')});
  window.addEventListener('unhandledrejection',function(event){
    const reason=event.reason;
    logClientError('unhandled_rejection',reason&&reason.message?reason.message:String(reason||'Unhandled promise rejection'),'unhandled_rejection');
  });
  document.addEventListener('click',function(event){
    const button=event.target&&event.target.closest?event.target.closest('#bctToggleAdminSafeMode'):null;
    if(button){
      event.preventDefault();
      try{localStorage.setItem(SAFE_MODE_KEY,safeMode()?'0':'1')}catch(_){}
      render();
      return;
    }
    setTimeout(render,0);
  });
  window.addEventListener('pageshow',function(){loadFlags();render()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadFlags);else loadFlags();
})();
<\/script>`;
const BCT_ADMIN_MOBILE_PATCH=`
<style id="bct-admin-mobile-controls-hotfix-style">
body.bct-authenticated #view-admin:not(.hidden){position:relative!important;z-index:120!important;pointer-events:auto!important;isolation:isolate!important}
body.bct-authenticated #view-admin:not(.hidden) button,
body.bct-authenticated #view-admin:not(.hidden) a,
body.bct-authenticated #view-admin:not(.hidden) input,
body.bct-authenticated #view-admin:not(.hidden) select,
body.bct-authenticated #view-admin:not(.hidden) textarea{pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(15,95,99,.16)}
body.bct-authenticated #view-home.hidden,
body.bct-authenticated #view-admin-login.hidden{pointer-events:none!important}
</style>
<script id="bct-admin-mobile-controls-hotfix-script" src="/bct-admin-mobile-fix.js?v=20260930-1"><\/script>`;
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE_NAME)
    .then(cache=>cache.addAll(STATIC_ASSETS))
    .then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys
    .filter(key=>key.startsWith('bct-portal-shell-')&&key!==CACHE_NAME)
    .map(key=>caches.delete(key)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  clients.forEach(client=>client.postMessage({type:'BCT_V46_STARTUP_CACHE_RESET',cacheName:CACHE_NAME}));
})()));
self.addEventListener('message',event=>{
  if(event.data?.type==='BCT_CLEAR_STARTUP_CACHES'){
    event.waitUntil(caches.keys().then(keys=>Promise.all(
      keys.filter(key=>key.startsWith('bct-portal-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key))
    )));
  }
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  // Installed iPhone/PWA navigations must always prefer the newest V46 document.
  if(HTML_PATHS.has(url.pathname)){
    event.respondWith(fetch(new Request(event.request,{cache:'no-store'})).then(async response=>{
      if(!response.ok)return response;
      const type=response.headers.get('content-type')||'';
      if(!type.includes('text/html'))return response;
      let patched=await response.text();
      if(!patched.includes('bct-signup-home-nav-hotfix-script'))patched=patched.includes('</body>')?patched.replace('</body>',BCT_SIGNUP_HOME_NAV_PATCH+'\n</body>'):patched+BCT_SIGNUP_HOME_NAV_PATCH;
      if(!patched.includes('bct-runtime-guardrails-20260929'))patched=patched.includes('</body>')?patched.replace('</body>',BCT_RUNTIME_GUARDRAIL_PATCH+'\n</body>'):patched+BCT_RUNTIME_GUARDRAIL_PATCH;
      if(!patched.includes('bct-admin-mobile-controls-hotfix-script'))patched=patched.includes('</body>')?patched.replace('</body>',BCT_ADMIN_MOBILE_PATCH+'\n</body>'):patched+BCT_ADMIN_MOBILE_PATCH;
      const headers=new Headers(response.headers);
      headers.delete('content-length');
      headers.set('cache-control','no-store');
      return new Response(patched,{status:response.status,statusText:response.statusText,headers});
    }));
    return;
  }
  // Only safe static assets are cached. Never cache HTML, API responses, auth state, or private pages.
  if(!STATIC_ASSETS.includes(url.pathname)||url.search)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&response.type==='basic'){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
    }
    return response;
  }).catch(()=>caches.match(event.request)));
});
