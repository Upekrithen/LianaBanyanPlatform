/**
 * Comet Bridge — Content Script
 *
 * Injected into Perplexity / Comet pages. Intercepts the user's query
 * submission, fetches Cathedral enrichment from the background worker,
 * and injects the enriched query before submission proceeds.
 *
 * User-experience design:
 *  - Transparent by default: user types → presses Enter → gets Cathedral-grade response.
 *  - No prompts, popups, or interruptions in V0.
 *  - Enrichment happens in the ~100ms between Enter keydown and form submit.
 *  - Debug logs to console when injection occurs (toggle via debug mode).
 *  - Falls back to plain submission if daemon is down or enrichment takes > 800ms.
 *
 * K485A / B123
 */

(function () {
  'use strict';

  const DEBUG = false; // set true to log enrichment details to console

  // ── Input field detection ─────────────────────────────────────────────────

  const INPUT_SELECTORS = [
    'textarea[placeholder]',
    'textarea',
    'div[contenteditable="true"]',
    '[contenteditable="true"]',
  ];

  function findInputElement() {
    for (const sel of INPUT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // ── Query extraction ───────────────────────────────────────────────────────

  function getQueryText(el) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value.trim();
    }
    // contenteditable
    return el.innerText.trim();
  }

  function setQueryText(el, text) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      // Native input value setter (React-compatible)
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable
      el.innerText = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ── Enrichment request ────────────────────────────────────────────────────

  let _enrichmentInProgress = false;

  async function requestEnrichment(originalQuery) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'ENRICH_QUERY', query: originalQuery },
        (response) => {
          if (chrome.runtime.lastError) {
            if (DEBUG) console.warn('[CometBridge] Runtime error:', chrome.runtime.lastError.message);
            resolve({ enrichedQuery: originalQuery, intent: null, daemonAlive: false });
            return;
          }
          resolve(response || { enrichedQuery: originalQuery, intent: null, daemonAlive: false });
        }
      );
    });
  }

  // ── Submit intercept ──────────────────────────────────────────────────────

  /**
   * Intercept the Enter keydown event on the input field.
   * Fetch enrichment, swap the query text, then let the event propagate
   * (allowing Perplexity's own submit handler to fire with the enriched text).
   *
   * We use the capturing phase (useCapture=true) to run BEFORE React's handlers.
   * We preventDefault(), enrich asynchronously, then re-fire a new Enter keydown
   * on the element after injection — this is the safest approach for React SPAs.
   */
  async function handleKeydown(event) {
    if (_enrichmentInProgress) return;

    const isEnter = event.key === 'Enter' || event.keyCode === 13;
    const isShift = event.shiftKey;
    if (!isEnter || isShift) return; // shift-enter = new line, don't intercept

    const inputEl = event.target;
    const query = getQueryText(inputEl);
    if (!query || query.length < 3) return; // don't enrich empty/tiny queries

    event.preventDefault();
    event.stopImmediatePropagation();

    _enrichmentInProgress = true;

    try {
      // Timeout guard: if enrichment takes > 800ms, fall back to original
      const enrichmentPromise = requestEnrichment(query);
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(
          () => resolve({ enrichedQuery: query, intent: null, daemonAlive: false, timedOut: true }),
          800
        )
      );

      const result = await Promise.race([enrichmentPromise, timeoutPromise]);

      if (result.injectionEnabled === false) {
        if (DEBUG) console.log('[CometBridge] Injection disabled — submitting original.');
      } else if (!result.daemonAlive || result.timedOut) {
        if (DEBUG) console.log('[CometBridge] Daemon down/timeout — submitting original.');
      } else {
        // Inject enriched query
        setQueryText(inputEl, result.enrichedQuery);
        if (DEBUG) {
          console.group('[CometBridge] Cathedral injection applied');
          console.log('Intent:', result.intent);
          console.log('Original:', query.slice(0, 100));
          console.log('Enriched length:', result.enrichedQuery.length, 'chars');
          console.groupEnd();
        }
      }
    } finally {
      _enrichmentInProgress = false;
    }

    // Re-fire Enter to allow Perplexity's submit handler to proceed
    const refire = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    // Mark as refired so we don't re-intercept it
    refire._cometBridgeRefired = true;
    inputEl.dispatchEvent(refire);
  }

  function isRefiredEvent(event) {
    return event._cometBridgeRefired === true;
  }

  // ── Observer: re-attach on SPA navigation ────────────────────────────────

  let _attachedElements = new WeakSet();

  function attachToInput(el) {
    if (!el || _attachedElements.has(el)) return;
    _attachedElements.add(el);

    el.addEventListener('keydown', (event) => {
      if (isRefiredEvent(event)) return; // skip refired events
      handleKeydown(event);
    }, true); // capture phase

    if (DEBUG) console.log('[CometBridge] Attached to input element:', el.tagName, el.className?.slice(0, 60));
  }

  function scanAndAttach() {
    const el = findInputElement();
    if (el) attachToInput(el);
  }

  // Initial scan
  scanAndAttach();

  // MutationObserver to handle SPA navigation (Perplexity is a React SPA)
  const observer = new MutationObserver(() => {
    scanAndAttach();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  if (DEBUG) console.log('[CometBridge] Content script loaded on', window.location.hostname);
})();
