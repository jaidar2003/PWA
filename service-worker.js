// service-worker.js

const CACHE_NAME = 'pwa-demo-cache-v1';
// Archivos que componen el "app shell" (el cascarón de la app)
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/icon-192.png'
];

// Evento "install": Se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cacheando archivos del App Shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activa el SW inmediatamente
    );
});

// Evento "activate": Se dispara cuando el SW se activa.
// Aquí se suelen limpiar cachés viejos.
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Limpiando caché antiguo', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Toma control de las páginas abiertas
});

// Evento "fetch": Intercepta todas las peticiones de red (fetch).
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching', event.request.url);

    // Estrategia: "Cache first, falling back to network"
    // Intenta servir desde el caché. Si falla, va a la red.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en caché, lo devuelve
                if (response) {
                    return response;
                }
                // Si no, va a la red
                return fetch(event.request);
            })
            .catch(err => {
                // Manejo de error (ej. si estás offline y no está en caché)
                console.error('Fetch fallido:', err);
            })
    );
});