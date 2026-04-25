/**
 * LB Test Frame — Content Script
 *
 * Intercepts query submission on supported AI platforms and wraps
 * with cathedral context when injection is enabled.
 *
 * GUARDRAIL: Never auto-types into AI input fields without member consent.
 * The extension intercepts on SUBMIT (not on keystroke), presents the
 * enriched query to the member, and requires member to click "Submit enriched"
 * or "Submit original" — they are always in control.
 *
 * K502 / B124
 */

const VENDOR_SELECTORS = {
  'claude.ai': {
    inputSelector: '[contenteditable="true"][data-testid="composer-input"], div[contenteditable="true"].ProseMirror',
    submitSelector: 'button[aria-label="Send message"], button[data-testid="send-button"]',
  },
  'chatgpt.com': {
    inputSelector: '#prompt-textarea, [data-id="root"] textarea',
    submitSelector: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
  },
  'gemini.google.com': {
    inputSelector: '.ql-editor[contenteditable="true"], [data-placeholder] p',
    submitSelector: 'button[aria-label="Send message"], button.send-button',
  },
  'perplexity.ai': {
    inputSelector: 'textarea[placeholder], .grow textarea',
    submitSelector: 'button[aria-label="Submit"], button.submit-button',
  },
  'copilot.microsoft.com': {
    inputSelector: '#searchbox, textarea[aria-label]',
    submitSelector: 'button[aria-label="Submit"], button[type="submit"]',
  },
};

const hostname = location.hostname.replace(/^www\./, '');
const vendorConfig = Object.entries(VENDOR_SELECTORS).find(([k]) => hostname.includes(k))?.[1];

if (!vendorConfig) {
  // Not a supported vendor page; content script no-ops
  console.debug('[LBTestFrame] No vendor config for', hostname);
} else {
  initCathedralInjection();
}

function initCathedralInjection() {
  let injectionEnabled = true;
  let pendingEnrichment = null;

  // Get initial pref
  chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    injectionEnabled = prefs?.injectionEnabled ?? true;
  });

  // Listen for pref changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.injectionEnabled) {
      injectionEnabled = changes.injectionEnabled.newValue;
    }
  });

  // Intercept form submit events
  document.addEventListener('keydown', async (e) => {
    if (!(e.key === 'Enter' && !e.shiftKey)) return;
    if (!injectionEnabled) return;

    const input = document.querySelector(vendorConfig.inputSelector);
    if (!input) return;

    const query = getInputText(input);
    if (!query || query.trim().length < 5) return;

    // Prevent default submission; we'll handle it
    e.stopImmediatePropagation();
    e.preventDefault();

    pendingEnrichment = { query, input };

    // Show the injection overlay
    showInjectionPrompt(query, input);
  }, true);
}

function getInputText(el) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    return el.value;
  }
  return el.innerText || el.textContent || '';
}

function setInputText(el, text) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } else {
    el.innerText = text;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
  }
}

function showInjectionPrompt(originalQuery, inputEl) {
  // Remove any existing overlay
  document.getElementById('lb-injection-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'lb-injection-overlay';
  overlay.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #0f1117; color: #e2e8f0; border: 1px solid #334155;
    border-radius: 12px; padding: 16px 20px; z-index: 999999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); max-width: 520px; width: 90%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px;
  `;

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <span style="font-size:16px;">⛩</span>
      <span style="font-weight:600;color:#60a5fa;">LB Test Frame</span>
      <span style="color:#475569;margin-left:auto;font-size:11px;">Cathedral Injection</span>
    </div>
    <div style="color:#94a3b8;margin-bottom:12px;">
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

  document.body.appendChild(overlay);

  // Request enrichment
  chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query: originalQuery }, (result) => {
    const enrichedBtn = overlay.querySelector('#lb-submit-enriched');
    if (result?.daemonAlive && result.enrichedQuery !== originalQuery) {
      enrichedBtn.disabled = false;
      enrichedBtn.style.opacity = '1';
      enrichedBtn.title = result.enrichedQuery;
      overlay.querySelector('div:nth-child(2)').textContent = '✓ Query enriched with LB cathedral context.';
    } else {
      overlay.querySelector('div:nth-child(2)').textContent = 'Daemon offline — sending original query.';
      enrichedBtn.textContent = 'Send (original)';
      enrichedBtn.disabled = false;
      enrichedBtn.style.opacity = '1';
    }
  });

  function submit(text) {
    overlay.remove();
    setInputText(inputEl, text);
    // Re-trigger form submission
    const submitBtn = document.querySelector(vendorConfig.submitSelector);
    if (submitBtn) {
      submitBtn.click();
    } else {
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  }

  overlay.querySelector('#lb-submit-original').addEventListener('click', () => submit(originalQuery));
  overlay.querySelector('#lb-submit-enriched').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query: originalQuery }, (result) => {
      submit(result?.enrichedQuery ?? originalQuery);
    });
  });

  // Auto-dismiss after 15 seconds → sends original
  setTimeout(() => { if (overlay.isConnected) submit(originalQuery); }, 15000);
}
