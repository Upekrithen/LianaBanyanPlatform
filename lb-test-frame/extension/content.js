/**
 * LB Test Frame — Content Script
 *
 * Two injection pathways, chosen by hostname:
 *
 *   Perplexity (K508 fix):
 *     injected.js (MAIN world) intercepts the outgoing fetch request and posts
 *     a CB_LTF_ENRICH_REQUEST message here. This script shows the Cathedral
 *     Injection overlay, fetches enrichment from background, and posts a
 *     CB_LTF_ENRICH_RESPONSE back — either with the enriched query (user clicked
 *     "Send with LB context") or a useOriginal:true flag ("Send original").
 *     The actual network request is then modified (or not) by injected.js.
 *
 *   All other vendors (Claude, ChatGPT, Gemini, Copilot):
 *     Keydown intercept on document → overlay → user clicks → DOM manipulation
 *     + submit button click. This approach still works on those platforms
 *     because their DOM structures are more stable and they accept button.click()
 *     as a submission trigger.
 *
 * GUARDRAIL: Never auto-types into AI input fields without member consent.
 * The extension intercepts on SUBMIT, presents the enriched query to the
 * member, and requires member to click "Submit enriched" or "Submit original"
 * — they are always in control.
 *
 * K502 / B124 original — K508 / B125 Perplexity pathway refactored
 */

const hostname = location.hostname.replace(/^www\./, '');
const isPerplexity = hostname.includes('perplexity.ai');

// ── PATHWAY 1: Perplexity — network-intercept bridge ─────────────────────────
// injected.js (MAIN world) pauses the outgoing fetch and posts CB_LTF_ENRICH_REQUEST.
// We show the overlay, get user's choice, and resolve via CB_LTF_ENRICH_RESPONSE.

if (isPerplexity) {
  initPerplexityBridge();
} else {
  initKeydownInjection();
}

function initPerplexityBridge() {
  // Pre-warm the background service worker
  chrome.runtime.sendMessage({ type: 'PING_DAEMON' }, () => {
    void chrome.runtime.lastError;
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.__lbtf !== 'request') return;

    const { requestId, query } = event.data;
    if (typeof requestId !== 'number' || typeof query !== 'string') return;

    // Check injection preference before showing overlay
    chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
      if (chrome.runtime.lastError || !prefs?.injectionEnabled) {
        // Injection disabled — tell injected.js to use original
        window.postMessage({ __lbtf: 'response', requestId, enrichedQuery: query, useOriginal: true }, '*');
        return;
      }

      showNetworkInterceptOverlay(requestId, query);
    });
  });
}

/**
 * Show the Cathedral Injection overlay for Perplexity network-intercept path.
 * Resolves the paused fetch by posting CB_LTF_ENRICH_RESPONSE.
 */
function showNetworkInterceptOverlay(requestId, originalQuery) {
  document.getElementById('lb-injection-overlay')?.remove();

  const overlay = createOverlayShell();
  document.body.appendChild(overlay);

  const statusEl     = overlay.querySelector('[data-status]');
  const enrichedBtn  = overlay.querySelector('#lb-submit-enriched');
  const originalBtn  = overlay.querySelector('#lb-submit-original');

  function resolve(enrichedQuery, useOriginal) {
    overlay.remove();
    window.postMessage({
      __lbtf: 'response',
      requestId,
      enrichedQuery,
      useOriginal: !!useOriginal,
    }, '*');
  }

  originalBtn.addEventListener('click', () => resolve(originalQuery, true));

  // Fetch enrichment
  chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query: originalQuery }, (result) => {
    if (chrome.runtime.lastError || !result?.daemonAlive || result.enrichedQuery === originalQuery) {
      statusEl.textContent = result?.daemonAlive === false
        ? 'Daemon offline — send original query.'
        : 'No enrichment available — send original query.';
      enrichedBtn.textContent   = 'Send (original)';
      enrichedBtn.disabled      = false;
      enrichedBtn.style.opacity = '1';
      enrichedBtn.addEventListener('click', () => resolve(originalQuery, false));
    } else {
      statusEl.textContent      = '✓ Query enriched with LB Cathedral context.';
      enrichedBtn.disabled      = false;
      enrichedBtn.style.opacity = '1';
      enrichedBtn.addEventListener('click', () => resolve(result.enrichedQuery, false));
    }
  });

  // Auto-dismiss after 15 seconds → send original
  const autoDismiss = setTimeout(() => { if (overlay.isConnected) resolve(originalQuery, true); }, 15000);
  overlay.addEventListener('remove', () => clearTimeout(autoDismiss));
}

// ── PATHWAY 2: Other vendors — keydown intercept ──────────────────────────────

const VENDOR_SELECTORS = {
  'claude.ai': {
    inputSelector:  '[contenteditable="true"][data-testid="composer-input"], div[contenteditable="true"].ProseMirror',
    submitSelector: 'button[aria-label="Send message"], button[data-testid="send-button"]',
  },
  'chatgpt.com': {
    inputSelector:  '#prompt-textarea, [data-id="root"] textarea',
    submitSelector: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
  },
  'gemini.google.com': {
    inputSelector:  '.ql-editor[contenteditable="true"], [data-placeholder] p',
    submitSelector: 'button[aria-label="Send message"], button.send-button',
  },
  'copilot.microsoft.com': {
    inputSelector:  '#searchbox, textarea[aria-label]',
    submitSelector: 'button[aria-label="Submit"], button[type="submit"]',
  },
};

function initKeydownInjection() {
  const vendorConfig = Object.entries(VENDOR_SELECTORS).find(([k]) => hostname.includes(k))?.[1];

  if (!vendorConfig) {
    console.debug('[LBTestFrame] No vendor config for', hostname);
    return;
  }

  let injectionEnabled = true;

  chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    injectionEnabled = prefs?.injectionEnabled ?? true;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.injectionEnabled) injectionEnabled = changes.injectionEnabled.newValue;
  });

  document.addEventListener('keydown', async (e) => {
    if (!(e.key === 'Enter' && !e.shiftKey)) return;
    if (!injectionEnabled) return;

    const input = document.querySelector(vendorConfig.inputSelector);
    if (!input) return;

    const query = getInputText(input);
    if (!query || query.trim().length < 5) return;

    e.stopImmediatePropagation();
    e.preventDefault();

    showKeydownOverlay(query, input, vendorConfig);
  }, true);
}

/**
 * Show the Cathedral Injection overlay for keydown-intercept path (non-Perplexity).
 * Resolves by manipulating the DOM and clicking the submit button.
 */
function showKeydownOverlay(originalQuery, inputEl, vendorConfig) {
  document.getElementById('lb-injection-overlay')?.remove();

  const overlay   = createOverlayShell();
  const statusEl  = overlay.querySelector('[data-status]');
  const enrichBtn = overlay.querySelector('#lb-submit-enriched');
  const origBtn   = overlay.querySelector('#lb-submit-original');

  document.body.appendChild(overlay);

  function submit(text) {
    overlay.remove();
    setInputText(inputEl, text);
    const submitBtn = document.querySelector(vendorConfig.submitSelector);
    if (submitBtn) {
      submitBtn.click();
    } else {
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  }

  origBtn.addEventListener('click', () => submit(originalQuery));

  chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query: originalQuery }, (result) => {
    if (result?.daemonAlive && result.enrichedQuery !== originalQuery) {
      statusEl.textContent      = '✓ Query enriched with LB Cathedral context.';
      enrichBtn.disabled        = false;
      enrichBtn.style.opacity   = '1';
      enrichBtn.title           = result.enrichedQuery;
      enrichBtn.addEventListener('click', () => submit(result.enrichedQuery));
    } else {
      statusEl.textContent    = 'Daemon offline — sending original query.';
      enrichBtn.textContent   = 'Send (original)';
      enrichBtn.disabled      = false;
      enrichBtn.style.opacity = '1';
      enrichBtn.addEventListener('click', () => submit(originalQuery));
    }
  });

  setTimeout(() => { if (overlay.isConnected) submit(originalQuery); }, 15000);
}

// ── Shared overlay factory ────────────────────────────────────────────────────

function createOverlayShell() {
  const overlay = document.createElement('div');
  overlay.id = 'lb-injection-overlay';
  overlay.style.cssText = [
    'position:fixed', 'bottom:20px', 'left:50%', 'transform:translateX(-50%)',
    'background:#0f1117', 'color:#e2e8f0', 'border:1px solid #334155',
    'border-radius:12px', 'padding:16px 20px', 'z-index:999999',
    'box-shadow:0 8px 32px rgba(0,0,0,0.5)', 'max-width:520px', 'width:90%',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', 'font-size:13px',
  ].join(';');

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <span style="font-size:16px;">⛩</span>
      <span style="font-weight:600;color:#60a5fa;">LB Test Frame</span>
      <span style="color:#475569;margin-left:auto;font-size:11px;">Cathedral Injection</span>
    </div>
    <div data-status style="color:#94a3b8;margin-bottom:12px;">
      Enriching your query with LB context…
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="lb-submit-original" style="
        padding:6px 14px;border-radius:6px;border:1px solid #334155;
        background:transparent;color:#94a3b8;cursor:pointer;font-size:12px;
      ">Send original</button>
      <button id="lb-submit-enriched" disabled style="
        padding:6px 14px;border-radius:6px;border:1px solid #3b82f6;
        background:#1d4ed8;color:white;cursor:pointer;font-size:12px;opacity:0.6;
      ">Send with LB context</button>
    </div>
  `;
  return overlay;
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function getInputText(el) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value;
  return el.innerText || el.textContent || '';
}

function setInputText(el, text) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const setter =
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      ?? Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (setter) {
      setter.call(el, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } else {
    el.innerText = text;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
  }
}
