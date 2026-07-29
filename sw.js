// sw.js - Service Worker para PWA y offline

const CACHE_NAME = 'cuadre-negocio-v2.4';
const ASSETS = [
  '/cuadre-negocio/',
  '/cuadre-negocio/index.html',
  '/cuadre-negocio/manifest.json',
  '/cuadre-negocio/logo-app.png',
  '/cuadre-negocio/logo-tecnoroutev.png',
  '/cuadre-negocio/app.js',
  '/cuadre-negocio/CuadrePage.js',
  '/cuadre-negocio/HistorialPage.js',
  '/cuadre-negocio/InventarioPage.js',
  '/cuadre-negocio/licenciaService.js',
  '/cuadre-negocio/tutorialService.js',
  '/cuadre-negocio/notificacionService.js',
  '/cuadre-negocio/main.css',
  '/cuadre-negocio/components.css',
  '/cuadre-negocio/libs/jspdf.umd.min.js',
  '/cuadre-negocio/libs/jspdf.plugin.autotable.min.js'
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', function(event) {
  console.log('📦 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Cacheando assets...');
        return cache.addAll(ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVACIÓN - CON LÍMITE DE CACHÉ
// ============================================

self.addEventListener('activate', function(event) {
  console.log('⚡ Service Worker activado');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ============================================
// FETCH - INTERCEPTAR TODAS LAS PETICIONES
// ============================================

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = request.url;

  // ============================================
  // 1. NAVEGACIÓN (cuando el usuario recarga o abre la app)
  // ============================================
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function() {
        // Si falla la red, devolver index.html desde el caché
        return caches.match('/cuadre-negocio/index.html');
      })
    );
    return;
  }

  // ============================================
  // 2. ARCHIVOS JS, CSS Y JSON (primero red, luego caché)
  // ============================================
  if (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(function() {
          return caches.match(request);
        })
    );
    return;
  }

  // ============================================
  // 3. RESTO (imágenes, etc.) - caché primero
  // ============================================
  event.respondWith(
    caches.match(request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(request).catch(function() {
          // Si es imagen, devolver una imagen vacía
          if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.svg')) {
            return new Response('', { status: 404 });
          }
          // Si es HTML y no está en caché, devolver index.html
          if (url.endsWith('.html')) {
            return caches.match('/cuadre-negocio/index.html');
          }
          return new Response('Offline - Contenido no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});