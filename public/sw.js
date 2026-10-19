// FloraHearth Service Worker - Version Controlled Cache
const APP_VERSION = 'v2.5.0';
const CACHE_NAME = `florahearth-static-${APP_VERSION}`;
const DATA_CACHE_NAME = `florahearth-data-${APP_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './apple-touch-icon.png',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png'
];

// Install: precache foundational shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    })
  );
  // Do not automatically skipWaiting if we want user-controlled updates, but allow message
});

// Activate: clean up older version caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log(`[SW ${APP_VERSION}] Removing legacy cache:`, key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Network-first for navigation/HTML, Stale-while-revalidate for JS/CSS/Assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignore chrome-extension or external telemetry
  if (url.protocol.startsWith('chrome-extension')) return;

  // Navigation requests (HTML document) -> Network first with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('./index.html') || await caches.match('./');
          if (fallback) return fallback;
          return new Response('Offline: FloraHearth cached page not available', {
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Google Fonts or static assets -> Cache first with network fallback
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || req.destination === 'font' || req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // Other sites (weather API, the user's sync Worker) -> don't intercept.
  // Caching those would keep copies of personal backups in Cache Storage,
  // and the weather service keeps its own short-lived cache.
  if (url.origin !== self.location.origin) return;

  // Application script & style chunks -> Network first with cache fallback
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response('', { status: 404 });
      })
  );
});

// Message handling: Hard reset, version checks, skipWaiting
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'HARD_RESET_CACHES') {
    // Purge ALL caches registered under this origin
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true, version: APP_VERSION });
      }
    });
  }

  if (event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        version: APP_VERSION,
        cacheName: CACHE_NAME,
        timestamp: new Date().toISOString()
      });
    }
  }
});
