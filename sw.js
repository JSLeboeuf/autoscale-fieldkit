/* AutoScale AI Fieldkit — Service Worker for Offline D2D */
var CACHE_NAME = 'fieldkit-v1';
var ASSETS = [
  'pitch.html',
  'quick-start.html',
  'pay.html',
  'scripts-dental.html',
  'sale-confirmed.html',
  'call-snippet.mp3',
  'logo.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (response) {
        /* Cache HTML pages on first visit */
        if (e.request.url.endsWith('.html')) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function () {
        /* Offline fallback for HTML — serve pitch.html */
        if (e.request.mode === 'navigate') {
          return caches.match('pitch.html');
        }
      });
    })
  );
});
