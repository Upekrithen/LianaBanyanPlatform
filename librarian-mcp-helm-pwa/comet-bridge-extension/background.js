/**
 * Comet Bridge — Background Service Worker (MV3)
 *
 * Responsibilities:
 *  - Receive ENRICH_QUERY messages from content scripts
 *  - Fetch Cathedral enrichment from local Helm daemon (127.0.0.1:7712/enrich)
 *  - Return the enriched query (or original on daemon-down fallback)
 *  - Expose PING_DAEMON for the popup status check
 *
 * K485A / B123
 */

const ENRICH_ENDPOINT = 'http://127.0.0.1:7712/enrich';
const DAEMON_TIMEOUT_MS = 5000;

/**
 * Fetch enriched query from local daemon.
 * Returns { enrichedQuery, intent, daemonAlive }.
 * Falls back to original query on any error (daemon-down safety guarantee).
 */
async function fetchEnrichment(query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DAEMON_TIMEOUT_MS);

  try {
    const resp = await fetch(ENRICH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!resp.ok) {
      console.warn('[CometBridge] Daemon returned non-200:', resp.status);
      return { enrichedQuery: query, intent: null, daemonAlive: false };
    }

    const data = await resp.json();
    return {
      enrichedQuery: data.enriched_query ?? query,
      intent: data.intent ?? null,
      daemonAlive: true,
    };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn('[CometBridge] Daemon request timed out');
    } else {
      console.warn('[CometBridge] Daemon unreachable:', err.message);
    }
    return { enrichedQuery: query, intent: null, daemonAlive: false };
  }
}

/**
 * Ping daemon — used by popup to show live/dead status.
 */
async function pingDaemon() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const resp = await fetch('http://127.0.0.1:7712/health', { signal: controller.signal });
    clearTimeout(timer);
    return resp.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

// ── Message router ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ENRICH_QUERY') {
    // Check injection is enabled (defaults to true)
    chrome.storage.local.get({ injectionEnabled: true }, async (prefs) => {
      if (!prefs.injectionEnabled) {
        sendResponse({ enrichedQuery: message.query, intent: null, daemonAlive: false, injectionEnabled: false });
        return;
      }

      const result = await fetchEnrichment(message.query);
      // Persist last intent for popup display
      if (result.daemonAlive && result.intent) {
        chrome.storage.local.set({ lastIntent: result.intent });
      }
      sendResponse({ ...result, injectionEnabled: true });
    });
    return true; // keep message channel open for async response
  }

  if (message.type === 'PING_DAEMON') {
    pingDaemon().then((alive) => sendResponse({ alive }));
    return true;
  }

  if (message.type === 'GET_PREFS') {
    chrome.storage.local.get({ injectionEnabled: true }, (prefs) => sendResponse(prefs));
    return true;
  }

  if (message.type === 'SET_PREF') {
    chrome.storage.local.set({ [message.key]: message.value }, () => sendResponse({ ok: true }));
    return true;
  }
});
