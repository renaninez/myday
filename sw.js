const CACHE = 'myday-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll([
        '/myday/',
        '/myday/index.html',
        '/myday/manifest.json',
        '/myday/icon-192.png',
        '/myday/icon-512.png',
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (
          e.request.url.includes('fonts.gstatic.com') ||
          e.request.url.includes('fonts.googleapis.com') ||
          e.request.url.startsWith(self.location.origin)
        ) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('/myday/index.html');
      });
    })
  );
});
