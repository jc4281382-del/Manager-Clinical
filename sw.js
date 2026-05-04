const CACHE_NAME = 'manager-clinic-v2';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Salvar cópia atualizada no cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
