const CACHE_NAME = 'evank-v1';
const urlsToCache = [
  '/evank/',
  '/evank/index.html',
  '/evank/manifest.json',
  '/evank/icon-192.png',
  '/evank/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Archivos cacheados');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('❌ Error al cachear:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Cache antiguo eliminado:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si falla la red y no está en caché, mostrar página offline
          return new Response('⚠️ Sin conexión a internet', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
