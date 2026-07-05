// ============================================
// SERVICE WORKER - VERSIÓN 1.0
// ============================================

const CACHE_NAME = 'evangelizacion-v1.0';
const urlsToCache = [
    'index.html',
    'icon-192.png',
    'icon-512.png',
    'icon-512-maskable.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ App instalada correctamente');
                return self.skipWaiting();
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 Eliminando cache vieja:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker activado');
            return self.clients.claim();
        })
    );
});

// Estrategia: Network First (primero red, luego caché)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la respuesta es válida, clonarla y guardar en caché
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, buscar en caché
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Si no está en caché, devolver una página offline
                        return caches.match('index.html');
                    });
            })
    );
});

// Evento para cuando la app se instala desde el navegador
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});