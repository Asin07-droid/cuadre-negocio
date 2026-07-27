const CACHE_NAME = 'cuadre-negocio-v2.1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app.js',
  '/CuadrePage.js',
  '/HistorialPage.js',
  '/InventarioPage.js',
  '/licenciaService.js',
  '/tutorialService.js',
  '/main.css',
  '/components.css',
  '/logo-tecnoroutev.png',
  '/logo-app.png',
  '/libs/jspdf.umd.min.js',
  '/libs/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});