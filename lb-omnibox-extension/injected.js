/**
 * LB Omnibox — MAIN World Substrate Injector
 *
 * K530 / B128 — Three-Class Substrate Sovereignty (#2315)
 *
 * Runs in MAIN world via declarative world:"MAIN" in manifest (standard Chrome).
 * Cannot access chrome.* APIs — uses window.postMessage to relay to content.js
 * (isolated world), which relays to background.js.
 *
 * Responsibilities:
 *  1. Receive init prefs from content.js (incognito status, user settings)
 *  2. Detect active vendor (search engine or AI vendor) from hostname
 *  3. For AI vendors: override window.fetch to intercept outgoing queries
 *     and inject Cathedral Effect substrate enrichment before the request fires
 *  4. For search engines: extract query from URL on DOMContentLoaded
 *  5. Show Three-Class curation overlay (B.3) after query detection
 *  6. Honor privacy-by-default:
 *     - Incognito: always ephemeral, overlay never shown
 *     - Sensitive categories: overlay suppressed unless member opted in
 *  7. Route store/delete/purge requests to background via postMessage bridge
 *
 * Three-Class contract (A&A #2315):
 *  - Default: Ephemeral (no storage, no overlay stored, query runs and is forgotten)
 *  - Personal-Permanent: member clicks "Save" → stored in extension IndexedDB
 *  - Shared-Permanent: future K531 (placeholder bridge in place)
 *
 * Message bridge namespace: __omniBridge
 * Direction: injected.js (MAIN) ↔ content.js (isolated) ↔ background.js (SW)
 *
 * K530 / B128 — Long Haul AND Fix Along the Way.
 */

(function () {
  'use strict';

  // ── Feature flag (publication gate — K525 pattern) ────────────────────────
  // Default false. Founder flips to true only post-Prov-14.
  // injected.js always runs (enrichment + curation work internally),
  // but any public-facing surface checks this flag before rendering.
  const OMNIBOX_EXTENSION_PUBLISHED = false;

  // ── Debug mode ────────────────────────────────────────────────────────────
  // Set to false before any public distribution.
  const DEBUG = true;

  // ── Timing config ─────────────────────────────────────────────────────────
  const CURATION_DELAY_MS  = 2500; // show curation prompt N ms after detection
  const ENRICH_TIMEOUT_MS  = 1200; // max wait for Helm daemon enrichment
  const OVERLAY_AUTODISMISS_MS = 30000;

  // ── Message bridge namespace ──────────────────────────────────────────────
  const NS = '__omniBridge';

  // ── Vendor configuration table ────────────────────────────────────────────
  // type:'search' → extract query from URL parameter (navigation-based)
  // type:'ai'     → intercept fetch POST (API-based)
  const VENDORS = {
    'www.google.com':    { type: 'search', urlParam: 'q',    name: 'Google'      },
    'google.com':        { type: 'search', urlParam: 'q',    name: 'Google'      },
    'www.bing.com':      { type: 'search', urlParam: 'q',    name: 'Bing'        },
    'bing.com':          { type: 'search', urlParam: 'q',    name: 'Bing'        },
    'duckduckgo.com':    { type: 'search', urlParam: 'q',    name: 'DuckDuckGo'  },
    'perplexity.ai':     { type: 'ai', name: 'Perplexity', interceptPath: /\/(api|rest|ask|query|perplexity)/i },
    'www.perplexity.ai': { type: 'ai', name: 'Perplexity', interceptPath: /\/(api|rest|ask|query|perplexity)/i },
    'claude.ai':         { type: 'ai', name: 'Claude',     interceptPath: /\/api\//i                           },
    'chatgpt.com':       { type: 'ai', name: 'ChatGPT',   interceptPath: /\/(backend-api|backend-anon|conversation)\//i },
    'gemini.google.com': { type: 'ai', name: 'Gemini',    interceptPath: /\/(BardChatUi|_\/|rpc|batchexecute)/i        },
  };

  // ── Sensitive-category patterns (per A&A #2315 Claim 2) ──────────────────
  // If a query matches one of these AND the member hasn't opted in for that
  // category, the curation overlay is suppressed. The query still runs
  // (enrichment still applies), but the "make a book of this?" prompt is hidden.
  const SENSITIVE_PATTERNS = {
    medical:   /\b(symptom|diagnosis|doctor|hospital|treatment|medication|drug|cancer|HIV|AIDS|diabetes|depression|anxiety|suicid|overdose|therapy|mental health|disorder|prescription|rash|STD|STI|pregnant|pregnancy)\b/i,
    financial: /\b(bank account|credit card|routing number|social security|SSN|tax return|IRS|loan|mortgage|debt|bankruptcy|salary negotiat|wire transfer|payday)\b/i,
    legal:     /\b(lawsuit|attorney|lawyer|legal advice|court|criminal record|arrest|probation|DUI|restraining order|divorce|custody|indictment)\b/i,
    political: /\b(republican|democrat|Biden|Trump|Harris|election|vote|ballot|congress|senate|political party|partisan|polling|caucus)\b/i,
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let _prefs = {
    injectionEnabled:    true,
    curationEnabled:     true,
    isIncognito:         false,
    sensitiveCategories: [], // categories member has explicitly opted into prompting for
    vendorPreference:    'auto',
  };
  let _initReceived   = false;
  let _overlayShown   = false;
  let _curationTimer  = null;
  let _nextId         = 0;
  const _pending      = new Map(); // requestId → { resolve, timer }

  // ── PostMessage bridge: receive responses from content.js ─────────────────
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || typeof event.data[NS] !== 'string') return;

    const msg = event.data;

    if (msg[NS] === 'init') {
      _prefs = { ..._prefs, ...(msg.prefs ?? {}) };
      _initReceived = true;
      if (DEBUG) console.log('[OmniBridge] injected.js init received — prefs:', _prefs);
      return;
    }

    if (msg[NS] === 'enrich_response') {
      const pending = _pending.get(msg.requestId);
      if (!pending) return;
      clearTimeout(pending.timer);
      _pending.delete(msg.requestId);
      pending.resolve({
        enrichedQuery:    msg.enrichedQuery    ?? null,
        daemonAlive:      msg.daemonAlive      ?? false,
        injectionEnabled: msg.injectionEnabled ?? true,
      });
    }
  });

  // ── Bridge helpers ────────────────────────────────────────────────────────
  function requestEnrichment(query) {
    return new Promise((resolve) => {
      const requestId = ++_nextId;
      const timer = setTimeout(() => {
        _pending.delete(requestId);
        if (DEBUG) console.warn('[OmniBridge] Enrichment timeout for request', requestId);
        resolve({ enrichedQuery: query, daemonAlive: false, injectionEnabled: true });
      }, ENRICH_TIMEOUT_MS);

      _pending.set(requestId, { resolve, timer });
      window.postMessage({ [NS]: 'enrich_request', requestId, query }, '*');
    });
  }

  function storeEntry(entry) {
    window.postMessage({ [NS]: 'store_entry', entry }, '*');
  }

  function deleteEntry(id) {
    window.postMessage({ [NS]: 'delete_entry', id }, '*');
  }

  function purgeAll() {
    window.postMessage({ [NS]: 'purge_all' }, '*');
  }

  // ── Multi-vendor query extraction (fetch body) ────────────────────────────
  function extractQuery(body) {
    if (typeof body !== 'object' || body === null) return null;

    // OpenAI-compatible messages array (Claude, ChatGPT, Perplexity API-tier)
    if (Array.isArray(body.messages)) {
      for (let i = body.messages.length - 1; i >= 0; i--) {
        const m = body.messages[i];
        if (!m || m.role !== 'user') continue;
        if (typeof m.content === 'string' && m.content.length > 0) return m.content;
        if (Array.isArray(m.content)) {
          const textPart = m.content.find((b) => b && b.type === 'text' && typeof b.text === 'string');
          if (textPart) return textPart.text;
        }
      }
    }

    // Gemini-style contents array
    if (Array.isArray(body.contents)) {
      const last = body.contents[body.contents.length - 1];
      if (last?.parts?.[0]?.text) return last.parts[0].text;
    }

    // Direct query field (Perplexity REST, DuckDuckGo AI, various)
    if (typeof body.query         === 'string' && body.query.length > 0)              return body.query;
    if (typeof body.prompt        === 'string' && body.prompt.length > 0)             return body.prompt;
    if (typeof body.search_query  === 'string' && body.search_query.length > 0)       return body.search_query;
    if (typeof body.params?.query_str === 'string' && body.params.query_str.length > 0) return body.params.query_str;
    if (typeof body.params?.query     === 'string' && body.params.query.length > 0)     return body.params.query;
    if (typeof body.data?.query       === 'string' && body.data.query.length > 0)       return body.data.query;

    return null;
  }

  function injectQuery(body, enrichedQuery) {
    // OpenAI messages
    if (Array.isArray(body.messages)) {
      let lastUserIdx = -1;
      for (let i = body.messages.length - 1; i >= 0; i--) {
        if (body.messages[i]?.role === 'user') { lastUserIdx = i; break; }
      }
      if (lastUserIdx >= 0) {
        const messages = [...body.messages];
        const m = messages[lastUserIdx];
        if (typeof m.content === 'string') {
          messages[lastUserIdx] = { ...m, content: enrichedQuery };
        } else if (Array.isArray(m.content)) {
          const parts = m.content.map((b) => (b && b.type === 'text') ? { ...b, text: enrichedQuery } : b);
          messages[lastUserIdx] = { ...m, content: parts };
        }
        return { ...body, messages };
      }
    }

    // Gemini contents
    if (Array.isArray(body.contents) && body.contents.length > 0) {
      const contents = [...body.contents];
      const last = contents.length - 1;
      if (contents[last]?.parts) {
        contents[last] = { ...contents[last], parts: [{ text: enrichedQuery }] };
      }
      return { ...body, contents };
    }

    if (typeof body.query         === 'string') return { ...body, query:         enrichedQuery };
    if (typeof body.prompt        === 'string') return { ...body, prompt:        enrichedQuery };
    if (typeof body.search_query  === 'string') return { ...body, search_query:  enrichedQuery };
    if (typeof body.params?.query_str === 'string') return { ...body, params: { ...body.params, query_str: enrichedQuery } };

    if (DEBUG) console.warn('[OmniBridge] injectQuery: no known field found, returning unmodified body');
    return body;
  }

  // ── fetch override (AI vendors) ───────────────────────────────────────────
  const _originalFetch = window.fetch.bind(window);

  window.fetch = async function omniBridgeFetch(input, init) {
    const url =
      typeof input === 'string'   ? input
      : input instanceof URL      ? input.href
      : input?.url                ?? '';

    const method = (
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();

    if (DEBUG && method === 'POST') {
      const shortPath = url.replace(/^https?:\/\/[^/]+/, '') || '/';
      console.log('[OmniBridge] fetch POST %s', shortPath);
    }

    const vendor = VENDORS[window.location.hostname];
    if (!vendor || vendor.type !== 'ai') return _originalFetch(input, init);
    if (method !== 'POST')              return _originalFetch(input, init);
    if (!vendor.interceptPath.test(url)) return _originalFetch(input, init);
    if (!_prefs.injectionEnabled)        return _originalFetch(input, init);

    // ── Parse body ────────────────────────────────────────────────────────
    let bodyText = null;
    let bodyObj  = null;
    try {
      if (init?.body) {
        if (typeof init.body === 'string')          bodyText = init.body;
        else if (init.body instanceof Blob)         bodyText = await init.body.text();
        else if (init.body instanceof ArrayBuffer)  bodyText = new TextDecoder().decode(init.body);
      } else if (input instanceof Request) {
        bodyText = await input.clone().text();
      }
      if (bodyText) bodyObj = JSON.parse(bodyText);
    } catch {
      if (DEBUG) console.log('[OmniBridge] Non-JSON body — passing through');
      return _originalFetch(input, init);
    }

    if (!bodyObj) return _originalFetch(input, init);

    const query = extractQuery(bodyObj);
    if (!query || query.trim().length < 3) return _originalFetch(input, init);

    if (DEBUG) console.log('[OmniBridge] ✓ %s query: "%s…"', vendor.name, query.slice(0, 80));

    // Request Cathedral enrichment from Helm daemon via bridge
    const enrichResult = await requestEnrichment(query);
    const enrichedQuery = enrichResult.daemonAlive ? enrichResult.enrichedQuery : null;

    // Schedule the curation prompt AFTER enrichment resolves so enriched text
    // can be stored in the library entry if the member opts to save (B.4)
    scheduleCurationPrompt(query, vendor.name, url, enrichedQuery);

    if (!enrichResult.daemonAlive || enrichResult.enrichedQuery === query) {
      return _originalFetch(input, init);
    }

    const enrichedBody = injectQuery(bodyObj, enrichResult.enrichedQuery);

    if (DEBUG) {
      console.log('[OmniBridge] ✓ Cathedral injection applied — %d → %d chars',
        query.length, enrichResult.enrichedQuery.length);
    }

    const newInit = {
      ...(init ?? {}),
      body:    JSON.stringify(enrichedBody),
      headers: { ...(init?.headers ?? {}), 'Content-Type': 'application/json' },
    };
    const newInput = (typeof input === 'string' || input instanceof URL) ? input : url;
    return _originalFetch(newInput, newInit);
  };

  // ── Search engine: URL-based query extraction ─────────────────────────────
  function detectSearchEngineQuery() {
    const vendor = VENDORS[window.location.hostname];
    if (!vendor || vendor.type !== 'search') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(vendor.urlParam) || null;
  }

  async function initSearchEngine() {
    const query = detectSearchEngineQuery();
    if (!query) return;
    const vendor     = VENDORS[window.location.hostname];
    const vendorName = vendor?.name ?? window.location.hostname;

    if (DEBUG) console.log('[OmniBridge] Search engine query: "%s…"', query.slice(0, 80));

    // Request Cathedral enrichment from Helm daemon — even for search engines,
    // the enrichment call establishes the substrate-injection pipeline visible
    // in DevTools Network tab (POST to 127.0.0.1:7712/enrich). The enriched
    // query is stored in the library entry when the member opts to save it.
    // (Cannot re-inject into the search URL post-navigation, but the enriched
    // text is available for the member's Personal-Permanent corpus.)
    if (_prefs.injectionEnabled) {
      const enrichResult = await requestEnrichment(query);
      if (DEBUG && enrichResult.daemonAlive) {
        console.log('[OmniBridge] ✓ Search engine query enriched — %d → %d chars (stored in library entry on save)',
          query.length, enrichResult.enrichedQuery.length);
      }
      // Pass enriched query to curation prompt so it can be stored in library
      scheduleCurationPrompt(query, vendorName, window.location.href, enrichResult.enrichedQuery);
      return;
    }

    scheduleCurationPrompt(query, vendorName, window.location.href, null);
  }

  // ── Sensitive category detection ──────────────────────────────────────────
  function detectSensitiveCategories(query) {
    return Object.keys(SENSITIVE_PATTERNS).filter(
      (cat) => SENSITIVE_PATTERNS[cat].test(query)
    );
  }

  // ── Topic auto-suggestion ─────────────────────────────────────────────────
  function suggestTopic(query) {
    const q = query.toLowerCase();
    if (/recipe|cook|bake|meal|dinner|breakfast|lunch|food|ingredient/.test(q))    return 'Food & Recipes';
    if (/travel|flight|hotel|vacation|trip|destination|airbnb|cruise/.test(q))     return 'Travel';
    if (/code|program|javascript|python|software|bug|api|react|github|typescript/.test(q)) return 'Programming';
    if (/music|song|artist|album|band|playlist|concert|spotify|lyrics/.test(q))    return 'Music';
    if (/movie|film|actor|director|watch|series|show|netflix|streaming/.test(q))   return 'Entertainment';
    if (/game|gaming|play|steam|xbox|playstation|nintendo|rpg|fps|mmo/.test(q))    return 'Gaming';
    if (/research|study|paper|academic|science|journal|experiment|thesis/.test(q)) return 'Research';
    if (/buy|shop|price|review|best|cheap|discount|product|compare/.test(q))       return 'Shopping';
    if (/job|career|resume|salary|hire|interview|linkedin|recruiter/.test(q))      return 'Career';
    if (/history|war|historical|century|empire|civilization|ancient/.test(q))      return 'History';
    if (/design|art|creative|logo|ui|ux|photoshop|figma|illustrator/.test(q))      return 'Design & Art';
    if (/fitness|workout|exercise|gym|diet|nutrition|weight|run|yoga/.test(q))     return 'Health & Fitness';
    if (/tile|dungeon|tabletop|rpg|miniature|wargame|dnd|pathfinder/.test(q))      return 'Tabletop & Crafts';
    return 'General';
  }

  // ── ID generator (MAIN world has crypto.randomUUID) ───────────────────────
  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function escapeAttr(str) {
    return (str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Three-Class curation prompt scheduling (B.3) ──────────────────────────
  // enrichedQuery: the Cathedral-enriched version, stored in the library entry
  // if the member opts to save (null = enrichment unavailable or not attempted)
  function scheduleCurationPrompt(query, vendorName, pageUrl, enrichedQuery) {
    if (_overlayShown)            return; // already shown once this page
    if (_prefs.isIncognito)       return; // always ephemeral in private mode
    if (!_prefs.curationEnabled)  return; // member disabled prompts globally

    // Suppress for sensitive categories unless member opted in
    const sensitiveHits = detectSensitiveCategories(query);
    const blocked = sensitiveHits.filter(
      (cat) => !(_prefs.sensitiveCategories ?? []).includes(cat)
    );
    if (blocked.length > 0) {
      if (DEBUG) console.log('[OmniBridge] Curation prompt suppressed — sensitive:', blocked);
      return;
    }

    clearTimeout(_curationTimer);
    _curationTimer = setTimeout(() => {
      showCurationOverlay(query, vendorName, pageUrl, enrichedQuery ?? null);
    }, CURATION_DELAY_MS);
  }

  // ── Curation overlay DOM construction (B.3) ───────────────────────────────
  function showCurationOverlay(query, vendorName, pageUrl, enrichedQuery) {
    if (_overlayShown) return;
    if (document.getElementById('__lb-omni-overlay')) return;
    _overlayShown = true;

    const topic      = suggestTopic(query);
    const shortQuery = query.length > 90 ? query.slice(0, 87) + '…' : query;

    const overlay = document.createElement('div');
    overlay.id = '__lb-omni-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'LB Omnibox — Make a book of this search?');
    overlay.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'width:340px',
      'max-width:calc(100vw - 32px)',
      'background:#0a192f',
      'color:#e8e8e8',
      'border:1px solid #C8A951',
      'border-radius:12px',
      'padding:16px 18px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'font-size:14px',
      'line-height:1.5',
      'z-index:2147483647',
      'box-shadow:0 8px 32px rgba(0,0,0,0.55)',
      'transition:opacity 0.3s ease,transform 0.3s ease',
      'opacity:0',
      'transform:translateY(10px)',
    ].join(';');

    overlay.innerHTML = `
      <div style="display:flex;align-items:center;margin-bottom:10px;">
        <span style="font-size:16px;margin-right:8px;">📚</span>
        <strong style="color:#C8A951;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">Liana Banyan</strong>
        <span style="margin-left:6px;font-size:10px;color:#555;background:#112240;border:1px solid #1e3a5f;border-radius:3px;padding:1px 5px;">via ${escapeAttr(vendorName)}</span>
        <button id="__lb-omni-close" aria-label="Dismiss" style="margin-left:auto;background:none;border:none;color:#666;cursor:pointer;font-size:20px;padding:0;line-height:1;font-weight:300;">×</button>
      </div>

      <p style="margin:0 0 5px;color:#ccd6f6;font-size:13px;font-weight:500;">
        Make a book of this search?
      </p>
      <p style="margin:0 0 13px;color:#6a7899;font-size:11px;font-style:italic;word-break:break-word;">
        "${escapeAttr(shortQuery)}"
      </p>

      <div style="margin-bottom:12px;">
        <label for="__lb-omni-topic" style="font-size:11px;color:#8892b0;display:block;margin-bottom:4px;">Topic (editable)</label>
        <input
          id="__lb-omni-topic"
          type="text"
          value="${escapeAttr(topic)}"
          maxlength="60"
          style="width:100%;box-sizing:border-box;background:#112240;border:1px solid #1e3a5f;border-radius:6px;color:#e8e8e8;padding:6px 10px;font-size:12px;outline:none;font-family:inherit;"
        />
      </div>

      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <button id="__lb-omni-yes" style="flex:1;background:#C8A951;color:#0a192f;border:none;border-radius:8px;padding:9px 0;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;">
          Save to my library
        </button>
        <button id="__lb-omni-no" style="flex:1;background:#112240;color:#8892b0;border:1px solid #1e3a5f;border-radius:8px;padding:9px 0;cursor:pointer;font-size:13px;font-family:inherit;">
          Not now
        </button>
      </div>

      <p style="margin:0;font-size:10px;color:#3a4a6a;text-align:center;">
        Default: ephemeral. Saved entries are yours — delete any time.
      </p>
    `;

    // Inject into page — use documentElement if body not yet available
    (document.body || document.documentElement).appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.style.opacity   = '1';
      overlay.style.transform = 'translateY(0)';
    }));

    const autoDismiss = setTimeout(() => dismissOverlay(overlay), OVERLAY_AUTODISMISS_MS);

    const closeBtn = overlay.querySelector('#__lb-omni-close');
    const noBtn    = overlay.querySelector('#__lb-omni-no');
    const yesBtn   = overlay.querySelector('#__lb-omni-yes');
    const topicInput = overlay.querySelector('#__lb-omni-topic');

    closeBtn.addEventListener('click', () => { clearTimeout(autoDismiss); dismissOverlay(overlay); });
    noBtn.addEventListener('click',    () => { clearTimeout(autoDismiss); dismissOverlay(overlay); });

    yesBtn.addEventListener('click', () => {
      clearTimeout(autoDismiss);
      const chosenTopic = (topicInput.value || topic).trim().slice(0, 60) || topic;
      const entry = {
        id:             generateId(),
        query:          query,
        enriched_query: enrichedQuery ?? null,
        vendor:         vendorName,
        topic:          chosenTopic,
        category:       null,
        scope:          'personal-private',
        source:         'omnibox',
        url:            pageUrl,
        created_at:     new Date().toISOString(),
      };
      storeEntry(entry);
      showSaveConfirmation(overlay);
    });

    // Keyboard: Escape dismisses
    const keyHandler = (e) => {
      if (e.key === 'Escape') { clearTimeout(autoDismiss); dismissOverlay(overlay); document.removeEventListener('keydown', keyHandler); }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function showSaveConfirmation(overlay) {
    overlay.innerHTML = `
      <div style="text-align:center;padding:10px 0;">
        <div style="font-size:36px;margin-bottom:8px;">✓</div>
        <p style="color:#C8A951;font-weight:600;margin:0 0 4px;font-family:inherit;">Saved to your library</p>
        <p style="color:#8892b0;font-size:12px;margin:0 0 8px;font-family:inherit;">Stored in your Personal-Permanent collection.</p>
        <a href="https://lianabanyan.com/helm/library" target="_blank" rel="noopener"
           style="color:#C8A951;font-size:12px;font-family:inherit;text-decoration:underline;text-underline-offset:2px;">
          View in Helm →
        </a>
      </div>
    `;
    setTimeout(() => dismissOverlay(overlay), 4000);
  }

  function dismissOverlay(overlay) {
    overlay.style.opacity   = '0';
    overlay.style.transform = 'translateY(10px)';
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    _overlayShown = false;
  }

  // ── Init: detect vendor and set up appropriate interception ───────────────
  const activeVendor = VENDORS[window.location.hostname];

  if (activeVendor) {
    if (DEBUG) console.log('[OmniBridge] injected.js loaded — %s (%s) | PUBLISHED=%s',
      activeVendor.name, activeVendor.type, OMNIBOX_EXTENSION_PUBLISHED);

    if (activeVendor.type === 'search') {
      // Query is already in the URL — run after DOM is ready for overlay inject
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchEngine);
      } else {
        initSearchEngine();
      }
    }
    // For AI vendors: fetch override is already installed above (document_start)
  } else {
    if (DEBUG) console.log('[OmniBridge] injected.js: no vendor config for %s', window.location.hostname);
  }

  if (DEBUG) {
    console.log('[OmniBridge] MAIN world fetch override installed on %s', window.location.hostname);
    console.log('[OmniBridge] Three-Class default: EPHEMERAL. Overlay opt-up. Incognito guard active.');
  }
})();
