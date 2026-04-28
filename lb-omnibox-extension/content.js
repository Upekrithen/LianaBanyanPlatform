/**
 * LB Omnibox — Isolated World Bridge
 *
 * K530 / B128 — Three-Class Substrate Sovereignty (#2315)
 *
 * Runs in the default ISOLATED world — has access to chrome.* APIs.
 * injected.js runs in MAIN world (declarative world:"MAIN") — cannot access chrome.*.
 *
 * This script is the relay between:
 *   injected.js (MAIN world, window.postMessage) ↔ background.js (chrome.runtime)
 *
 * Message protocol:
 *   MAIN → ISOLATED: window.postMessage({ __omniBridge: 'enrich_request', requestId, query })
 *   ISOLATED → BG:   chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query })
 *   BG → ISOLATED:   callback { enrichedQuery, daemonAlive, injectionEnabled }
 *   ISOLATED → MAIN: window.postMessage({ __omniBridge: 'enrich_response', requestId, ... })
 *
 *   MAIN → ISOLATED: window.postMessage({ __omniBridge: 'store_entry', entry })
 *   ISOLATED → BG:   chrome.runtime.sendMessage({ type: 'STORE_ENTRY', entry })
 *
 *   MAIN → ISOLATED: window.postMessage({ __omniBridge: 'delete_entry', id })
 *   ISOLATED → BG:   chrome.runtime.sendMessage({ type: 'DELETE_ENTRY', id })
 *
 *   MAIN → ISOLATED: window.postMessage({ __omniBridge: 'purge_all' })
 *   ISOLATED → BG:   chrome.runtime.sendMessage({ type: 'PURGE_ALL' })
 *
 * Init flow (on load):
 *   1. GET_PREFS from background → send 'init' to MAIN world with prefs + isIncognito
 *   2. PING to background → pre-warm service worker
 *
 * K530 / B128 — Long Haul AND Fix Along the Way.
 */

'use strict';

const NS = '__omniBridge';

console.log('[OmniBridge] content.js v0.1.0 loaded (isolated world) on', window.location.hostname);

// ── Init: send prefs to MAIN world ───────────────────────────────────────────
// Fetch prefs from background and relay to MAIN world as the 'init' message.
// injected.js listens for this message to apply user preferences.
chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
  if (chrome.runtime.lastError) {
    // Background not ready — send defaults so MAIN world can proceed
    window.postMessage({
      [NS]: 'init',
      prefs: {
        injectionEnabled:    true,
        curationEnabled:     true,
        isIncognito:         false,
        sensitiveCategories: [],
        vendorPreference:    'auto',
      },
    }, '*');
    return;
  }

  // chrome.extension.inIncognitoContext is available in isolated world content scripts
  const isIncognito = !!(chrome.extension && chrome.extension.inIncognitoContext);

  window.postMessage({
    [NS]: 'init',
    prefs: {
      ...(prefs ?? {}),
      isIncognito,
    },
  }, '*');
});

// ── Pre-warm service worker ───────────────────────────────────────────────────
// MV3 service workers can be idle and take ~100ms to wake. Pre-warm so the
// first enrichment request doesn't stall on SW startup latency.
chrome.runtime.sendMessage({ type: 'PING' }, () => { void chrome.runtime.lastError; });

// ── Bridge: MAIN world → background ─────────────────────────────────────────
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || typeof msg[NS] !== 'string') return;

  // ── Enrichment request ──────────────────────────────────────────────────
  if (msg[NS] === 'enrich_request') {
    const { requestId, query } = msg;

    chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query }, (response) => {
      if (chrome.runtime.lastError) {
        window.postMessage({
          [NS]:             'enrich_response',
          requestId,
          enrichedQuery:    query,
          daemonAlive:      false,
          injectionEnabled: true,
        }, '*');
        return;
      }

      window.postMessage({
        [NS]:             'enrich_response',
        requestId,
        enrichedQuery:    response?.enrichedQuery    ?? query,
        daemonAlive:      response?.daemonAlive      ?? false,
        injectionEnabled: response?.injectionEnabled ?? true,
      }, '*');
    });
    return;
  }

  // ── Store Personal-Permanent entry ──────────────────────────────────────
  if (msg[NS] === 'store_entry') {
    chrome.runtime.sendMessage({ type: 'STORE_ENTRY', entry: msg.entry }, () => {
      void chrome.runtime.lastError;
    });
    return;
  }

  // ── Delete a single entry (right-to-be-forgotten) ───────────────────────
  if (msg[NS] === 'delete_entry') {
    chrome.runtime.sendMessage({ type: 'DELETE_ENTRY', id: msg.id }, () => {
      void chrome.runtime.lastError;
    });
    return;
  }

  // ── Purge all entries ("Forget Everything") ─────────────────────────────
  if (msg[NS] === 'purge_all') {
    chrome.runtime.sendMessage({ type: 'PURGE_ALL' }, () => {
      void chrome.runtime.lastError;
    });
    return;
  }
});
