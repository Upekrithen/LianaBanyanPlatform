/**
 * LB Test Frame — MAIN World Fetch Interceptor (Perplexity)
 *
 * Intercepts outgoing Perplexity API requests before they leave the browser.
 * Instead of transparently injecting (Comet Bridge approach), this extension
 * pauses the request and sends a CB_LTF_ENRICH_REQUEST to content.js (isolated
 * world), which shows the Cathedral Injection overlay to the user. The user
 * clicks "Send with LB context" or "Send original", and content.js resolves the
 * pause via CB_LTF_ENRICH_RESPONSE, allowing the (possibly enriched) request
 * to proceed.
 *
 * This script runs only on Perplexity. Other AI vendors (Claude, ChatGPT,
 * Gemini, Copilot) still use the keydown intercept in content.js because their
 * DOM structures are more stable and the consent overlay requires button-click
 * submission, which works better with the DOM approach on those platforms.
 *
 * Phase A diagnostic mode:
 *   Keep DEBUG = true until Phase A confirms the exact Perplexity API endpoint.
 *   All POST body keys + extracted query are logged to DevTools Console.
 *
 * K508 / B125 — fixes Perplexity injection for LB Test Frame
 */

(function () {
  'use strict';

  const DEBUG = true;

  const INTERCEPT_PATH = /\/(api|rest|ask|query|perplexity)/i;
  const ENRICH_TIMEOUT_MS = 15000; // Match LB Test Frame overlay's 15s auto-dismiss

  let _nextId = 0;
  const _pending = new Map(); // requestId → { resolve, timer }

  // ── Receive responses from content.js ─────────────────────────────────────────

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.__lbtf !== 'response') return;

    const { requestId, enrichedQuery, useOriginal } = event.data;
    const pending = _pending.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timer);
    _pending.delete(requestId);
    pending.resolve({ enrichedQuery, useOriginal: !!useOriginal });
  });

  // ── Fetch override ─────────────────────────────────────────────────────────────

  const _originalFetch = window.fetch.bind(window);

  window.fetch = async function lbtfFetch(input, init) {
    const url =
      typeof input === 'string' ? input
      : input instanceof URL   ? input.href
      : input?.url             ?? '';

    const method = (
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();

    if (DEBUG) {
      console.log('[LBTestFrame] fetch %s %s', method, url.replace(/^https?:\/\/[^/]+/, '') || '/');
    }

    if (method !== 'POST' || !INTERCEPT_PATH.test(url)) {
      return _originalFetch(input, init);
    }

    // Parse body
    let bodyText = null;
    let bodyObj  = null;
    try {
      if (init?.body) {
        bodyText = typeof init.body === 'string' ? init.body
          : init.body instanceof Blob ? await init.body.text()
          : init.body instanceof ArrayBuffer ? new TextDecoder().decode(init.body)
          : null;
      } else if (input instanceof Request) {
        bodyText = await input.clone().text();
      }
      if (bodyText) bodyObj = JSON.parse(bodyText);
    } catch {
      return _originalFetch(input, init);
    }

    if (!bodyObj) return _originalFetch(input, init);

    if (DEBUG) {
      const keys = Object.keys(bodyObj).join(', ');
      const q = extractQuery(bodyObj);
      console.log(q
        ? `[LBTestFrame] ✓ body keys: [${keys}] query: "${q.slice(0, 100)}…"`
        : `[LBTestFrame] ✗ no query field — keys: [${keys}]`
      );
    }

    const query = extractQuery(bodyObj);
    if (!query || query.trim().length < 3) return _originalFetch(input, init);

    // Pause request and ask content.js to show the consent overlay
    const requestId = ++_nextId;

    const result = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        _pending.delete(requestId);
        if (DEBUG) console.log('[LBTestFrame] Overlay timeout — sending original query');
        resolve({ enrichedQuery: query, useOriginal: true });
      }, ENRICH_TIMEOUT_MS);

      _pending.set(requestId, { resolve, timer });

      window.postMessage({
        __lbtf: 'request',
        requestId,
        query,
      }, '*');
    });

    if (result.useOriginal) {
      return _originalFetch(input, init);
    }

    // Rebuild request with enriched query
    const enrichedBody = injectQuery(bodyObj, result.enrichedQuery);
    if (DEBUG) console.log('[LBTestFrame] ✓ Enriched body injected, length:', result.enrichedQuery.length);

    const newInit = {
      ...(init ?? {}),
      body: JSON.stringify(enrichedBody),
      headers: { ...(init?.headers ?? {}), 'Content-Type': 'application/json' },
    };
    const newInput = (typeof input === 'string' || input instanceof URL) ? input : url;
    return _originalFetch(newInput, newInit);
  };

  // ── Query extraction / injection (mirrors Comet Bridge) ───────────────────────

  function extractQuery(body) {
    if (typeof body !== 'object' || !body) return null;
    if (typeof body.query === 'string' && body.query.length > 0) return body.query;
    if (Array.isArray(body.messages)) {
      for (let i = body.messages.length - 1; i >= 0; i--) {
        const m = body.messages[i];
        if (m?.role === 'user' && typeof m.content === 'string') return m.content;
      }
    }
    if (typeof body.prompt === 'string') return body.prompt;
    if (typeof body.params?.query === 'string') return body.params.query;
    if (typeof body.search_query === 'string') return body.search_query;
    return null;
  }

  function injectQuery(body, enrichedQuery) {
    if (typeof body.query === 'string') return { ...body, query: enrichedQuery };
    if (Array.isArray(body.messages)) {
      const messages = [...body.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user') {
          messages[i] = { ...messages[i], content: enrichedQuery };
          return { ...body, messages };
        }
      }
    }
    if (typeof body.prompt === 'string') return { ...body, prompt: enrichedQuery };
    if (typeof body.search_query === 'string') return { ...body, search_query: enrichedQuery };
    return body;
  }

  if (DEBUG) {
    console.log('[LBTestFrame] MAIN world fetch interceptor loaded (Perplexity) on', window.location.hostname);
  }
})();
