const CACHE_NAME = 'cuadre-negocio-v2.3';
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
// FETCH - ESTRATEGIA "STALE WHILE REVALIDATE"
// ============================================

self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Si es navegación, devolver index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function() {
        return caches.match('/cuadre-negocio/index.html');
      })
    );
    return;
  }

  // Estrategia: Caché primero, pero actualizar en segundo plano
  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      // Si está en caché, devolverlo
      if (cachedResponse) {
        // Actualizar la caché en segundo plano
        fetch(request).then(function(networkResponse) {
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, networkResponse);
          });
        }).catch(function() {
          // Si falla la red, ignorar
        });
        return cachedResponse;
      }

      // Si no está en caché, ir a la red
      return fetch(request).then(function(networkResponse) {
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, networkResponse.clone());
        });
        return networkResponse;
      });
    })
  );
});