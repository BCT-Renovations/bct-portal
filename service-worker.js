// bct-admin-login-hotfix; previous rollout marker: bct-portal-shell-v7-mobile-home-cleanup
// bct-command-center-hotfix keeps the V46 public/admin typeahead shell fresh on phones.
// bct-clean-signin-hotfix forces phones to load the minimal three-button sign-in screen.
// bct-wide-logo-hotfix forces phones to reload the wider signed-out logo header.
// bct-official-logo-hotfix forces phones to load the selected full official BCT logo.
// bct-portal-entry-hotfix forces installed/mobile clients to load repaired Contractor and Client portal entry rendering.
const CACHE_NAME='bct-portal-shell-v15-official-logo-refresh';
const APP_SHELL=['/','/index.html','/manifest.webmanifest','/bct-logo-master.png','/bct-homeowner-pages.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bct-portal-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  // Only the static shell is safe to cache. Never store API responses or private pages.
  if(!APP_SHELL.includes(url.pathname)||url.search)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&response.type==='basic'){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
    }
    return response;
  }).catch(()=>caches.match(event.request)));
});
