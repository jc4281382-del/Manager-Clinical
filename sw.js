const CACHE_NAME = 'manager-clinic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/agenda.html',
  '/financeiro.html',
  '/pacientes.html',
  '/js/supabase.js',
  '/js/modal.js',
  '/js/sidebar.js',
  '/js/dashboard.js',
  '/js/agenda.js',
  '/js/financeiro.js',
  '/js/pacientes.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Fallback para network se não estiver no cache
        return response || fetch(event.request);
      })
  );
});
