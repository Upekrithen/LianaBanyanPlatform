// Liana Banyan PWA Service Worker — Wave 18 B1 + Wave 17 Performance
// Strategy:
//   - stale-while-revalidate for Vite hashed assets (/assets/*.js, /assets/*.css)
//   - cache-first for shell assets (logo, manifest, offline page)
//   - network-first for API endpoints
//   - navigation fallback: SPA root or offline page
// Wave 18 additions: all 16 initiative + 8 spinout + governance + economy routes pre-cached;
//   IndexedDB bounty-submission queue (background sync); push notification stubs.
// Wave 17 addition: stale-while-revalidate for immutable hashed chunk assets.

const CACHE_VERSION = 'lb-v3';
const SHELL_CACHE  = `${CACHE_VERSION}-shell`;
const API_CACHE    = `${CACHE_VERSION}-api`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// ─── Initiative + spinout + governance + economy routes (Wave 18) ─────────────

const INITIATIVE_ROUTES = [
  '/family-table',
  '/household-concierge',
  '/lets-go-shopping',
  '/rally-group',
  '/health-accords',
  '/jukebox',
  '/lets-make-bread',
  '/defense-klaus',
  '/didaskos',
  '/brass-tacks',
  '/power-to-the-people',
  '/hearth-initiative',
  '/map-and-compass',
  '/lets-make-dinner',
  '/lets-get-groceries',
  '/cai-bonfire',
];

const SPINOUT_ROUTES = [
  '/spinouts',
  '/spinout/harper-guild',
  '/spinout/mnemosyne',
  '/spinout/stand-in-the-gap',
  '/spinout/anchor',
  '/spinout/battery-dispatch',
  '/spinout/defense-klaus',
  '/frontier/marketplace',
  '/frontier/borrow',
];

const GOVERNANCE_ROUTES = [
  '/governance',
  '/governance/audit',
  '/governance/star-chamber',
  '/governance/pedestal',
  '/voting',
  '/pedestal/vote',
  '/pedestal/nominate',
  '/pedestal/browser',
  '/pedestal/stake',
  '/council/round-table',
];

const ECONOMY_ROUTES = [
  '/marks/redeem',
  '/bounty/feed',
  '/bounty/dispatch',
  '/member/dashboard',
  '/member/profile',
  '/proofs',
];

const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/LianaBanyanLogo.png',
  '/favicon.ico',
  '/manifest.json',
  ...INITIATIVE_ROUTES,
  ...SPINOUT_ROUTES,
  ...GOVERNANCE_ROUTES,
  ...ECONOMY_ROUTES,
];

// ─── Install: pre-cache shell + all new routes ────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => {
        // Use individual adds (not addAll) so one 404 doesn't abort the whole install
        return Promise.allSettled(
          SHELL_ASSETS.map((url) => cache.add(url).catch(() => { /* non-fatal per route */ }))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: prune old caches ──────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const KEEP = new Set([SHELL_CACHE, API_CACHE, STATIC_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !KEEP.has(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: routing strategy ──────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // API calls — network-first, cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Navigation — serve cached SPA root or offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Wave 17: Vite hashed assets (/assets/*.js, /assets/*.css) — stale-while-revalidate.
  // These filenames contain a content hash so stale copies are always coherent.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Everything else — cache-first (logo, manifest, images, etc.)
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

// ─── Background Sync: bounty submission queue ─────────────────────────────────
// Tag: 'sync-bounty-submissions' — flush pending IndexedDB bounty queue

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bounty-submissions') {
    event.waitUntil(flushBountyQueue());
  }
  if (event.tag === 'sync-data') {
    event.waitUntil(flushBountyQueue());
  }
});

// ─── Push Notifications: grocery reminders + bounty alerts ───────────────────

self.addEventListener('push', (event) => {
  let payload = { title: 'Liana Banyan', body: 'You have a new update.', tag: 'lb-general' };
  try {
    const data = event.data ? event.data.json() : {};
    if (data.title) payload.title = data.title;
    if (data.body) payload.body = data.body;
    if (data.tag) payload.tag = data.tag;
  } catch { /* malformed payload — use defaults */ }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: '/LianaBanyanLogo.png',
      badge: '/LianaBanyanLogo.png',
      data: payload,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tag = event.notification.tag;
  let targetUrl = '/';
  if (tag === 'lb-grocery') targetUrl = '/lets-get-groceries';
  if (tag === 'lb-bounty') targetUrl = '/bounty/feed';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// ─── SKIP_WAITING message (from update prompt in usePWA.tsx) ─────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Wave 17: stale-while-revalidate — serve from cache immediately (fast),
// then fetch in background to refresh the cache for next load.
// Ideal for Vite hashed chunks: hash changes on new deploy, so stale is safe.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { cacheName });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { cacheName });
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    // Try the specific route first (pre-cached), then root shell, then offline page
    const url = new URL(request.url);
    const specificRoute = await caches.match(url.pathname);
    if (specificRoute) return specificRoute;
    const cached = await caches.match('/') || await caches.match('/offline.html');
    return cached || new Response('<h1>Offline</h1>', {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
    });
  }
}

// ─── IndexedDB bounty submission queue ────────────────────────────────────────

const IDB_DB_NAME = 'lb-offline-queue';
const IDB_STORE_NAME = 'bounty-submissions';

function openQueueDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function flushBountyQueue() {
  let db;
  try {
    db = await openQueueDb();
  } catch {
    console.warn('[SW] Could not open IndexedDB queue');
    return;
  }

  const items = await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readonly');
    const store = tx.objectStore(IDB_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });

  for (const item of items) {
    try {
      const resp = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (resp.ok) {
        // Remove successfully synced item
        await new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
          const store = tx.objectStore(IDB_STORE_NAME);
          const req = store.delete(item.id);
          req.onsuccess = resolve;
          req.onerror = (e) => reject(e.target.error);
        });
      }
    } catch {
      // Will retry on next sync event
    }
  }
}
