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
const CACHE_NAME='bct-portal-shell-v28-signup-home-nav';
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
    button.textContent=labels[lang()]||labels.en;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
  document.addEventListener('click',()=>requestAnimationFrame(ensure),true);
  document.addEventListener('change',event=>{if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))requestAnimationFrame(ensure)});
  new MutationObserver(()=>requestAnimationFrame(ensure)).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
})();
<\/script>`;
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
      const html=await response.text();
      const patched=html.includes('bct-signup-home-nav-hotfix-script')?html:(html.includes('</body>')?html.replace('</body>',BCT_SIGNUP_HOME_NAV_PATCH+'\n</body>'):html+BCT_SIGNUP_HOME_NAV_PATCH);
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
