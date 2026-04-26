/**
 * Comet Bridge — ISOLATED World Bridge (K508 / B125)
 *
 * Bridges between the MAIN world fetch interceptor (injected.js) and
 * the extension background service worker. This script runs in the
 * extension's ISOLATED world and can access chrome.* APIs.
 *
 * Why a bridge is needed:
 *   MAIN world scripts (injected.js) share the page's JavaScript context and
 *   therefore CANNOT access chrome.* APIs (chrome.runtime, chrome.storage, etc.).
 *   This isolated script receives requests via window.postMessage, relays them
 *   to the background service worker, and posts results back to injected.js.
 *
 * Message protocol:
 *   injected.js  →  window.postMessage({ __cometBridge: 'request', requestId, query })
 *   content.js   ←  window.addEventListener('message', ...)
 *   content.js   →  chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query })
 *   background   ←  ENRICH_QUERY handler
 *   background   →  response { enrichedQuery, intent, daemonAlive, injectionEnabled }
 *   content.js   →  window.postMessage({ __cometBridge: 'response', requestId, ... })
 *   injected.js  ←  window.addEventListener('message', ...)
 *
 * The K485A keydown intercept + DOM-replacement approach is REMOVED. It failed
 * because: (a) Perplexity's DOM structure changed and CSS selectors no longer
 * match the active input element, and (b) the re-fired synthetic KeyboardEvent
 * is not processed by React's event system. The network-intercept approach in
 * injected.js is DOM-independent and version-proof.
 *
 * K508 / B125 — Replaces K485A keydown-intercept approach
 */

'use strict';

// ── PostMessage bridge ────────────────────────────────────────────────────────

window.addEventListener('message', (event) => {
  // Only accept messages from this same window (same origin, not iframes)
  if (event.source !== window) return;
  if (!event.data || event.data.__cometBridge !== 'request') return;

  const { requestId, query } = event.data;
  if (typeof requestId !== 'number' || typeof query !== 'string' || !query) return;

  chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query }, (response) => {
    // Handle background service worker unavailable (e.g. SW sleeping in MV3)
    if (chrome.runtime.lastError) {
      window.postMessage({
        __cometBridge:    'response',
        requestId,
        enrichedQuery:    query,
        daemonAlive:      false,
        injectionEnabled: true,
      }, '*');
      return;
    }

    window.postMessage({
      __cometBridge:    'response',
      requestId,
      enrichedQuery:    response?.enrichedQuery    ?? query,
      daemonAlive:      response?.daemonAlive      ?? false,
      injectionEnabled: response?.injectionEnabled ?? true,
    }, '*');
  });
});

// ── Service-worker wake-up guard ──────────────────────────────────────────────
// MV3 service workers can go idle and take ~100ms to wake. Pre-warm it so
// the first enrichment request doesn't stall.
chrome.runtime.sendMessage({ type: 'PING_DAEMON' }, () => {
  void chrome.runtime.lastError; // swallow "no listener" error during SW start
});
