/**
 * Comet Bridge — MAIN World Fetch Interceptor
 *
 * Replaces the K485A DOM-replacement + keydown approach with a network-level
 * intercept. Overrides window.fetch in the page's own JavaScript context so
 * that outgoing Perplexity API requests are caught regardless of how the user
 * submits their query (Enter key, button click, voice, drag-and-drop, etc.).
 *
 * Why MAIN world:
 *   Content scripts in the default ISOLATED world cannot override window.fetch
 *   as seen by page code. MAIN world injection shares the page's JS context,
 *   so our fetch wrapper is what the page's own code calls.
 *
 * Communication bridge (MAIN world ↔ ISOLATED world):
 *   MAIN world scripts cannot access chrome.* APIs directly. We use
 *   window.postMessage to relay to content.js (isolated), which calls
 *   chrome.runtime.sendMessage → background.js → localhost:7712/enrich.
 *
 * Data flow:
 *   Page fetch() → [intercepted here] → postMessage CB_ENRICH_REQUEST →
 *   content.js → chrome.runtime → background → daemon →
 *   content.js → postMessage CB_ENRICH_RESPONSE →
 *   [resolve here] → modified fetch → Perplexity AI
 *
 * Phase A diagnostic mode:
 *   Keep DEBUG = true on first install. Every POST request URL and body shape
 *   is logged to console. Use DevTools → Console on Perplexity tab to identify
 *   the exact API endpoint and request body structure. Then narrow
 *   INTERCEPT_HOSTS and update extractQuery / injectQuery field paths.
 *   Set DEBUG = false for production.
 *
 * K508 / B125 — Replaces K485A content.js keydown approach
 */

(function () {
  'use strict';

  // ── v0.2.2 world-probe (must be first — fires before any other code) ──────────
  // In MAIN world: typeof chrome === 'undefined'  ← correct
  // In ISOLATED world: typeof chrome === 'object' ← programmatic registration also failed
  console.log(
    '[CometBridge] injected.js TOP-OF-FILE v0.2.3 | world-probe: chrome=%s | href=%s',
    typeof chrome,
    window.location.href.slice(0, 80),
  );

  // ── Configuration ─────────────────────────────────────────────────────────────

  // Keep true until Phase A confirms exact endpoint; set false in production.
  const DEBUG = true;

  // Hosts where we should intercept fetches. The script only runs on these
  // pages (declared in manifest matches), but this guards against edge cases.
  const INTERCEPT_HOSTS = /perplexity\.ai|comet\.com/i;

  // Only intercept POST requests whose URL path matches this pattern.
  // Starts broad so Phase A can identify the real endpoint. Narrow after
  // Phase A diagnosis (e.g. to /api\/ask or /rest\/v2\/perplexity_ask).
  const INTERCEPT_PATH = /\/(api|rest|ask|query|perplexity)/i;

  // Enrichment timeout: if the daemon round-trip takes longer than this,
  // pass the original query through. 800ms matches K485A's content.js timeout.
  const ENRICH_TIMEOUT_MS = 800;

  // ── Request ID counter ────────────────────────────────────────────────────────

  let _nextId = 0;
  // Map from requestId → { resolve, timer }
  const _pending = new Map();

  // ── PostMessage bridge: receive responses from content.js ─────────────────────

  window.addEventListener('message', (event) => {
    // Only accept messages from this same window (not iframes, not other origins).
    if (event.source !== window) return;
    if (!event.data || event.data.__cometBridge !== 'response') return;

    const { requestId, enrichedQuery, daemonAlive, injectionEnabled } = event.data;
    const pending = _pending.get(requestId);
    if (!pending) return; // already timed out or duplicate

    clearTimeout(pending.timer);
    _pending.delete(requestId);
    pending.resolve({ enrichedQuery, daemonAlive, injectionEnabled });
  });

  // ── Preserve the original fetch ───────────────────────────────────────────────

  const _originalFetch = window.fetch.bind(window);

  // ── Fetch override ────────────────────────────────────────────────────────────

  window.fetch = async function cometBridgeFetch(input, init) {
    // Resolve the URL string regardless of input type
    const url =
      typeof input === 'string' ? input
      : input instanceof URL   ? input.href
      : input?.url             ?? '';

    const method = (
      init?.method
      ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();

    // Phase A: log every fetch so we can identify Perplexity's API pattern
    if (DEBUG) {
      const shortPath = url.replace(/^https?:\/\/[^/]+/, '') || '/';
      console.log('[CometBridge] fetch %s %s', method, shortPath);
    }

    // Only consider POST requests to matching hosts / paths
    if (
      method !== 'POST'
      || !INTERCEPT_HOSTS.test(url)
      || !INTERCEPT_PATH.test(url)
    ) {
      return _originalFetch(input, init);
    }

    // ── Parse request body ────────────────────────────────────────────────────

    let bodyText = null;
    let bodyObj  = null;
    try {
      if (init?.body) {
        if (typeof init.body === 'string') {
          bodyText = init.body;
        } else if (init.body instanceof Blob) {
          bodyText = await init.body.text();
        } else if (init.body instanceof ArrayBuffer) {
          bodyText = new TextDecoder().decode(init.body);
        }
      } else if (input instanceof Request) {
        bodyText = await input.clone().text();
      }
      if (bodyText) bodyObj = JSON.parse(bodyText);
    } catch {
      if (DEBUG) console.log('[CometBridge] Non-JSON body on %s — passing through', url);
      return _originalFetch(input, init);
    }

    if (!bodyObj) return _originalFetch(input, init);

    // Phase A: log the body keys and extracted query
    if (DEBUG) {
      const keys = Object.keys(bodyObj).join(', ');
      const q    = extractQuery(bodyObj);
      if (q) {
        console.log('[CometBridge] ✓ Query found — body keys: [%s] — query: "%s…"', keys, q.slice(0, 100));
      } else {
        console.log('[CometBridge] ✗ No query field — body keys: [%s] — sample: %s',
          keys, JSON.stringify(bodyObj).slice(0, 200));
      }
    }

    const query = extractQuery(bodyObj);
    if (!query || query.trim().length < 3) {
      return _originalFetch(input, init);
    }

    // ── Request enrichment via postMessage bridge ─────────────────────────────

    const requestId = ++_nextId;

    const enrichResult = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        _pending.delete(requestId);
        if (DEBUG) console.warn('[CometBridge] Enrichment timeout for request %d — using original', requestId);
        resolve({ enrichedQuery: query, daemonAlive: false, injectionEnabled: true });
      }, ENRICH_TIMEOUT_MS);

      _pending.set(requestId, { resolve, timer });

      window.postMessage({
        __cometBridge: 'request',
        requestId,
        query,
      }, '*');
    });

    // Fall back to original if daemon is down or injection disabled
    if (!enrichResult.daemonAlive || enrichResult.injectionEnabled === false) {
      if (DEBUG) {
        const reason = !enrichResult.daemonAlive ? 'daemon offline' : 'injection disabled';
        console.log('[CometBridge] Passing original — %s', reason);
      }
      return _originalFetch(input, init);
    }

    // ── Rebuild request with enriched query ───────────────────────────────────

    const enrichedBody = injectQuery(bodyObj, enrichResult.enrichedQuery);

    if (DEBUG) {
      console.log('[CometBridge] ✓ Cathedral injection applied — enriched length: %d chars',
        enrichResult.enrichedQuery.length);
    }

    const newInit = {
      ...(init ?? {}),
      body: JSON.stringify(enrichedBody),
      headers: {
        ...(init?.headers ?? {}),
        'Content-Type': 'application/json',
      },
    };

    // Reconstruct the URL-like first arg (avoid mutating a Request object)
    const newInput = (typeof input === 'string' || input instanceof URL) ? input : url;

    return _originalFetch(newInput, newInit);
  };

  // ── Query extraction ──────────────────────────────────────────────────────────
  // Covers known Perplexity body shapes. Update field paths after Phase A
  // confirms the actual structure via DevTools → Network → request body.

  function extractQuery(body) {
    if (typeof body !== 'object' || body === null) return null;

    // Direct .query field — most common Perplexity REST pattern
    if (typeof body.query === 'string' && body.query.length > 0) return body.query;

    // OpenAI-compatible messages array — Perplexity API-tier
    if (Array.isArray(body.messages)) {
      for (let i = body.messages.length - 1; i >= 0; i--) {
        const m = body.messages[i];
        if (m && m.role === 'user' && typeof m.content === 'string') return m.content;
      }
    }

    // .prompt field — older Perplexity SDK format
    if (typeof body.prompt === 'string' && body.prompt.length > 0) return body.prompt;

    // Nested params — Perplexity /api/v2/run uses params.query_str
    if (typeof body.params?.query_str === 'string' && body.params.query_str.length > 0) return body.params.query_str;
    if (typeof body.params?.query     === 'string' && body.params.query.length > 0)     return body.params.query;
    if (typeof body.data?.query       === 'string' && body.data.query.length > 0)       return body.data.query;

    // Perplexity search — some versions use { search_query: "..." }
    if (typeof body.search_query === 'string') return body.search_query;

    return null;
  }

  // ── Query injection ───────────────────────────────────────────────────────────

  function injectQuery(body, enrichedQuery) {
    if (typeof body.query === 'string') {
      return { ...body, query: enrichedQuery };
    }
    if (Array.isArray(body.messages)) {
      const messages = body.messages.map((m, i) => {
        if (i === body.messages.length - 1 && m.role === 'user') {
          return { ...m, content: enrichedQuery };
        }
        return m;
      });
      // If no user message found at end, still scan for last user msg
      const lastUserIdx = [...body.messages].reverse().findIndex((m) => m.role === 'user');
      if (lastUserIdx >= 0) {
        const realIdx = body.messages.length - 1 - lastUserIdx;
        messages[realIdx] = { ...body.messages[realIdx], content: enrichedQuery };
      }
      return { ...body, messages };
    }
    if (typeof body.prompt === 'string') {
      return { ...body, prompt: enrichedQuery };
    }
    if (typeof body.params?.query_str === 'string') {
      return { ...body, params: { ...body.params, query_str: enrichedQuery } };
    }
    if (typeof body.params?.query === 'string') {
      return { ...body, params: { ...body.params, query: enrichedQuery } };
    }
    if (typeof body.search_query === 'string') {
      return { ...body, search_query: enrichedQuery };
    }
    // Unknown body shape — log and return unmodified
    if (DEBUG) console.warn('[CometBridge] Could not find query field to inject in body');
    return body;
  }

  if (DEBUG) {
    console.log('[CometBridge] MAIN world fetch interceptor loaded on', window.location.hostname);
    console.log('[CometBridge] Watching for POST to hosts matching:', INTERCEPT_HOSTS.source);
    console.log('[CometBridge] Set DEBUG=false in injected.js after Phase A confirms endpoint pattern');
  }
})();
