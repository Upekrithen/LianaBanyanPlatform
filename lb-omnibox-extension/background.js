/**
 * LB Omnibox — Background Service Worker
 *
 * K530 / B128 — Three-Class Substrate Sovereignty (#2315)
 *
 * Responsibilities:
 *  - Receive ENRICH_QUERY → call Helm daemon (127.0.0.1:7712/enrich) → return enriched query
 *  - Receive STORE_ENTRY → write Personal-Permanent entry to extension-scoped IndexedDB
 *  - Receive DELETE_ENTRY → delete entry + write audit-trail record (right-to-be-forgotten)
 *  - Receive PURGE_ALL → clear all entries + write audit-trail record ("Forget Everything")
 *  - Receive GET_ALL_ENTRIES / GET_ENTRY_COUNT → read from IndexedDB for popup/library
 *  - Prefs management via chrome.storage.local
 *  - Feature flag: OMNIBOX_EXTENSION_PUBLISHED (default false — publication gate)
 *
 * IndexedDB schema (extension-scoped — chrome-extension:// origin):
 *   DB: lb-omnibox-substrate  v1
 *   Store 'entries':
 *     { id, query, enriched_query, vendor, topic, category,
 *       scope, source, url, created_at }
 *   Store 'audit_trail':
 *     { id, type ('DELETE_ENTRY'|'PURGE_ALL'), target_id, entries_purged, created_at }
 *
 * K530 / B128 — Long Haul AND Fix Along the Way.
 */

// ── Publication gate (per K525 Conductor's Baton pattern) ────────────────────
// Default false. Founder flips to true only after Prov 14 fires.
// NO public landing page, NO Web Store submit, NO Crown Letter inclusion
// while this flag is false.
const OMNIBOX_EXTENSION_PUBLISHED = false;

const ENRICH_ENDPOINT   = 'http://127.0.0.1:7712/enrich';
const HEALTH_ENDPOINT   = 'http://127.0.0.1:7712/health';
const DAEMON_TIMEOUT_MS = 1200;
const DB_NAME    = 'lb-omnibox-substrate';
const DB_VERSION = 1;

// ── IndexedDB ─────────────────────────────────────────────────────────────────
let _db = null;

async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id' });
        store.createIndex('by_created', 'created_at');
        store.createIndex('by_vendor',  'vendor');
        store.createIndex('by_topic',   'topic');
      }

      if (!db.objectStoreNames.contains('audit_trail')) {
        db.createObjectStore('audit_trail', { keyPath: 'id' });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = ()  => reject(req.error);
  });
}

async function dbAdd(storeName, record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).add(record);
    tx.oncomplete = resolve;
    tx.onerror    = () => reject(tx.error);
  });
}

async function dbDeleteEntry(id) {
  const db = await openDB();
  const auditRecord = {
    id:             crypto.randomUUID(),
    type:           'DELETE_ENTRY',
    target_id:      id,
    entries_purged: null,
    created_at:     new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['entries', 'audit_trail'], 'readwrite');
    tx.objectStore('entries').delete(id);
    tx.objectStore('audit_trail').add(auditRecord);
    tx.oncomplete = resolve;
    tx.onerror    = () => reject(tx.error);
  });
}

async function dbPurgeAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // Count first, then clear
    const countReq = db.transaction('entries', 'readonly')
      .objectStore('entries').count();

    countReq.onsuccess = () => {
      const count = countReq.result;
      const auditRecord = {
        id:             crypto.randomUUID(),
        type:           'PURGE_ALL',
        target_id:      null,
        entries_purged: count,
        created_at:     new Date().toISOString(),
      };

      const tx = db.transaction(['entries', 'audit_trail'], 'readwrite');
      tx.objectStore('entries').clear();
      tx.objectStore('audit_trail').add(auditRecord);
      tx.oncomplete = () => resolve({ purged: count });
      tx.onerror    = () => reject(tx.error);
    };
    countReq.onerror = () => reject(countReq.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbCount(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Helm daemon enrichment ────────────────────────────────────────────────────
// vendorPreference: passed through to the daemon so it can route to the
// member's preferred vendor (Conductor's Baton #2277 routing layer).
async function fetchEnrichment(query, vendorPreference) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DAEMON_TIMEOUT_MS);
  try {
    const resp = await fetch(ENRICH_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query, vendor_preference: vendorPreference ?? 'auto' }),
      signal:  controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return { enrichedQuery: query, daemonAlive: false };
    const data = await resp.json();
    return {
      enrichedQuery: data.enriched_query ?? query,
      intent:        data.intent         ?? null,
      daemonAlive:   true,
    };
  } catch {
    clearTimeout(timer);
    return { enrichedQuery: query, daemonAlive: false };
  }
}

async function pingDaemon() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const resp = await fetch(HEALTH_ENDPOINT, { signal: controller.signal });
    clearTimeout(timer);
    return resp.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

// ── Default preferences ───────────────────────────────────────────────────────
const DEFAULT_PREFS = {
  injectionEnabled:    true,
  curationEnabled:     true,
  vendorPreference:    'auto',
  sensitiveCategories: [],   // categories member opted into curation-prompting for
  isFirstRun:          true,
};

// ── Message router ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  // ── Enrichment ──────────────────────────────────────────────────────────
  if (message.type === 'ENRICH_QUERY') {
    chrome.storage.local.get(DEFAULT_PREFS, async (prefs) => {
      if (!prefs.injectionEnabled) {
        sendResponse({ enrichedQuery: message.query, daemonAlive: false, injectionEnabled: false });
        return;
      }
      // Pass vendor preference so the Helm daemon can route per Conductor's Baton (#2277)
      const result = await fetchEnrichment(message.query, prefs.vendorPreference ?? 'auto');
      sendResponse({ ...result, injectionEnabled: true });
    });
    return true; // async
  }

  // ── Store Personal-Permanent entry ──────────────────────────────────────
  if (message.type === 'STORE_ENTRY') {
    dbAdd('entries', message.entry)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => { console.error('[OmniBridge BG] STORE_ENTRY failed:', err); sendResponse({ ok: false }); });
    return true;
  }

  // ── Delete a single entry (right-to-be-forgotten) ───────────────────────
  if (message.type === 'DELETE_ENTRY') {
    dbDeleteEntry(message.id)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => { console.error('[OmniBridge BG] DELETE_ENTRY failed:', err); sendResponse({ ok: false }); });
    return true;
  }

  // ── Purge all entries ("Forget Everything") ─────────────────────────────
  if (message.type === 'PURGE_ALL') {
    dbPurgeAll()
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((err)   => { console.error('[OmniBridge BG] PURGE_ALL failed:', err); sendResponse({ ok: false }); });
    return true;
  }

  // ── Read all Personal-Permanent entries (library page) ──────────────────
  if (message.type === 'GET_ALL_ENTRIES') {
    dbGetAll('entries')
      .then((entries) => sendResponse({ entries }))
      .catch((err)    => { console.error('[OmniBridge BG] GET_ALL_ENTRIES failed:', err); sendResponse({ entries: [] }); });
    return true;
  }

  // ── Entry count (popup stats) ────────────────────────────────────────────
  if (message.type === 'GET_ENTRY_COUNT') {
    dbCount('entries')
      .then((count) => sendResponse({ count }))
      .catch(()     => sendResponse({ count: 0 }));
    return true;
  }

  // ── Daemon health check (popup status indicator) ─────────────────────────
  if (message.type === 'PING') {
    pingDaemon().then((alive) => sendResponse({ alive }));
    return true;
  }

  // ── Preferences ─────────────────────────────────────────────────────────
  if (message.type === 'GET_PREFS') {
    chrome.storage.local.get(DEFAULT_PREFS, sendResponse);
    return true;
  }

  if (message.type === 'SET_PREF') {
    chrome.storage.local.set({ [message.key]: message.value }, () => sendResponse({ ok: true }));
    return true;
  }

  // ── Feature flags ────────────────────────────────────────────────────────
  if (message.type === 'GET_FEATURE_FLAGS') {
    sendResponse({ OMNIBOX_EXTENSION_PUBLISHED });
    return false;
  }
});

// ── Install handler ───────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set(DEFAULT_PREFS);
    // Open first-run page on install (internal testers only pre-Prov-14)
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/firstrun.html') });
  }
});
