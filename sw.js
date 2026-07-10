const CACHE = 'misfinanzas-v1';
const ASSETS = [
  '/mis-finanzas/',
  '/mis-finanzas/index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Para Firebase y Google: siempre red
  if (e.request.url.includes('firebase') || 
      e.request.url.includes('google') ||
      e.request.url.includes('gstatic')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Para el resto: red primero, cache como fallback
  e.respondWith(
    fetch(e.request)
      .then(r => { 
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
