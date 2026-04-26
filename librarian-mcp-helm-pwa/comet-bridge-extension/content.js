/**
 * Comet Bridge — ISOLATED World Bridge (K508 / B125 / v0.2.2)
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
 * v0.2.2: injected.js is injected via a <script> tag appended to the DOM.
 * This bypasses both the declarative world:"MAIN" manifest key and the
 * programmatic chrome.scripting API — both silently fail in Comet's MV3 fork.
 * Script-tag execution is genuine MAIN world with zero dependency on world: field.
 *
 * K508 / B125 — Replaces K485A keydown-intercept approach
 */

'use strict';

// Confirmation that content.js (isolated world) is injecting on this page.
// If you see this line but NOT the injected.js TOP-OF-FILE line, check that
// web_accessible_resources lists injected.js and that Comet allows DOM script injection.
console.log('[CometBridge] content.js v0.2.2 loaded (isolated world) on', window.location.hostname);

// ── Script-tag injection into MAIN world ──────────────────────────────────────
// Appends injected.js as a <script src="..."> element. The browser fetches and
// executes it in the page's own JavaScript context (MAIN world), bypassing any
// MV3 world: field handling entirely. Works in every Chromium fork.
// documentElement is always present at document_start; head may not be yet.
(function injectMainWorldScript() {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('injected.js');
  s.onload  = () => s.remove(); // clean up after execution
  s.onerror = () => console.error('[CometBridge] content.js — failed to load injected.js via script tag; check web_accessible_resources');
  (document.head || document.documentElement).appendChild(s);
}());

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
