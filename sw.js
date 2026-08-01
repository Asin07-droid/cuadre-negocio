// sw.js (en la raíz del proyecto)
// Service Worker para PWA y offline

const CACHE_NAME = 'cuadre-negocio-v1.6.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './CuadrePage.js',
  './HistorialPage.js',
  './InventarioPage.js',
  './descargaService.js',
  './licenciaService.js',
  './notificacionService.js',
  './tutorialService.js',
  './src/infrastructure/indexeddb/db.js',
  './src/infrastructure/indexeddb/productosRepository.js',
  './src/infrastructure/indexeddb/turnosRepository.js',
  './src/shared/constants/denominaciones.js',
  './main.css',
  './components.css',
  './logo-app.png',
  './logo-tecnoroutev.png',
  './icon-192.png',
  './icon-512.png',
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cacheando assets (uno por uno, sin bloquear por fallos individuales)...');
        return Promise.allSettled(
          ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('⚠️ No se pudo cachear:', url, err.message || err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error('❌ Falló el precache:', err))
  );
});

// ============================================
// ACTIVACIÓN
// ============================================

self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH (INTERCEPTAR PETICIONES)
// ============================================

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const esCodigoJS = url.endsWith('.js');

  if (esCodigoJS) {
    // Network-first para JS: siempre intenta la versión más reciente primero.
    // Solo usa la caché si no hay conexión, y si tampoco hay caché, responde
    // con un error controlado (nunca undefined).
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(async () => {
          const cacheada = await caches.match(event.request);
          if (cacheada) return cacheada;
          return new Response('// Offline: no se pudo cargar este archivo', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/javascript' }
          });
        })
    );
    return;
  }

  // Cache-first para el resto de assets (imágenes, css) — no cambian tan seguido
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          return new Response('Offline - Contenido no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});