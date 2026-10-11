// BCT V46 iPhone Home Screen icon fix
// This service worker intentionally removes itself.
// Reason: iPhone Safari was seeing the icon first, then losing it after service-worker startup.
// The live app must be served directly by Vercel while Add to Home Screen builds the icon preview.

const BCT_CACHE_PREFIX = 'bct-portal-shell-';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(BCT_CACHE_PREFIX))
        .map(key => caches.delete(key))
    );

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    // Remove this service worker so it cannot affect Safari's Add to Home Screen icon capture.
    await self.registration.unregister();

    // Reload open BCT tabs once so they are no longer controlled by a worker.
    clients.forEach(client => {
      try {
        client.navigate(client.url);
      } catch (_) {}
    });
  })());
});

self.addEventListener('fetch', () => {
  // No interception. The network serves every file directly.
});
