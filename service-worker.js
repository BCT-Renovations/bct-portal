// BCT V46 iPhone Home Screen fix
// Purpose: stop the service worker from taking over the live page, injecting old hotfixes,
// or serving stale cached startup/icon behavior during Safari Add to Home Screen.
const BCT_CACHE_PREFIX = 'bct-portal-shell-';
const BCT_CACHE_NAME = 'bct-portal-shell-v37-ios-pass-through';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(BCT_CACHE_PREFIX))
        .map(key => caches.delete(key))
    );

    // Take control only long enough to clear the bad/stale cache state, then behave as pass-through.
    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => {
      client.postMessage({
        type: 'BCT_IOS_PASS_THROUGH_SERVICE_WORKER_ACTIVE',
        cacheName: BCT_CACHE_NAME
      });
    });
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'BCT_CLEAR_STARTUP_CACHES') {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(BCT_CACHE_PREFIX))
          .map(key => caches.delete(key))
      ))
    );
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept the actual app shell or iPhone icon/manifest files.
  // Safari must see the real live page and real current icon, not a patched cached copy.
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname.includes('bct-app-icon') ||
    url.pathname.includes('apple-touch-icon')
  ) {
    return;
  }

  // Default: do not take over requests. Let the network/Vercel serve the real live files.
});
