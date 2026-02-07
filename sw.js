self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Just a pass-through to keep the app "live"
  e.respondWith(fetch(e.request));
});
