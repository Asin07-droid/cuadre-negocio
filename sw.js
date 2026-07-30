// sw.js (en la raíz del proyecto — NO en /public/)
// Service Worker para PWA y offline

const CACHE_NAME = 'cuadre-negocio-v1.5.2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/app.js',
  './src/ui/pages/CuadrePage.js',
  './src/ui/pages/HistorialPage.js',
  './src/ui/pages/InventarioPage.js',
  './src/ui/styles/main.css',
  './src/ui/styles/components.css',
  './src/ui/assets/logo-app.png',
  './src/ui/assets/logo-192.png',
  './src/ui/assets/logo-tecnoroutev.png',
  './public/libs/jspdf.umd.min.js',
  './public/libs/jspdf.plugin.autotable.min.js',
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cacheando assets...');
        return cache.addAll(ASSETS);
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
    // Solo usa la caché si no hay conexión.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first para el resto de assets (imágenes, css, libs) — no cambian tan seguido
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