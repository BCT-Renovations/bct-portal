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
const CACHE_NAME='bct-portal-shell-v27-app-icon-cache-reset';
const STATIC_ASSETS=['/bct-logo-master.png','/bct-app-icon-v46.png'];
const HTML_PATHS=new Set(['/','/index.html']);
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
    event.respondWith(fetch(new Request(event.request,{cache:'no-store'})));
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
