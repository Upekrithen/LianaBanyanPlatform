/**
 * LB Test Frame — Background Service Worker (MV3)
 *
 * Extends K485A Comet Bridge with:
 *   - Three-persona state management (casual / developer / member)
 *   - AI vendor session detection
 *   - Verification demo mode coordination
 *   - opt_in_share telemetry (with explicit consent)
 *   - Discipline Rule Engine (K513 / B126 — A&A #2294)
 *
 * K502 / B124 — updated K513 / B126
 */

import { handleDisciplineMessage } from './discipline_engine.js';

const ENRICH_ENDPOINT = 'http://127.0.0.1:7712/enrich';
const DAEMON_TIMEOUT_MS = 5000;

// ── Persona state ─────────────────────────────────────────────────────────────

const DEFAULT_PREFS = {
  injectionEnabled: true,
  persona: 'casual',           // 'casual' | 'developer' | 'member'
  selectedAI: null,            // 'claude' | 'chatgpt' | 'gemini' | 'perplexity' | 'copilot'
  onboardingComplete: false,
  membershipVerified: false,
  apiKeys: {},                 // { vendor: encryptedKey } — developer mode only
  verifyResults: null,         // last verification run results
  sharePreference: 'private',  // 'private' | 'anonymous' | 'public'
  lbMemberId: null,
};

async function getPrefs() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_PREFS, resolve);
  });
}

async function setPrefs(partial) {
  return new Promise((resolve) => {
    chrome.storage.local.set(partial, resolve);
  });
}

// ── Cathedral enrichment ──────────────────────────────────────────────────────

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
    if (!resp.ok) return { enrichedQuery: query, intent: null, daemonAlive: false };
    const data = await resp.json();
    return { enrichedQuery: data.enriched_query ?? query, intent: data.intent ?? null, daemonAlive: true };
  } catch {
    clearTimeout(timer);
    return { enrichedQuery: query, intent: null, daemonAlive: false };
  }
}

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

// ── AI vendor detection ───────────────────────────────────────────────────────

const AI_VENDOR_PATTERNS = {
  claude:      { urlPattern: /claude\.ai/,                  name: 'Claude (Anthropic)',    signupUrl: 'https://claude.ai/login' },
  chatgpt:     { urlPattern: /chatgpt\.com/,                name: 'ChatGPT (OpenAI)',      signupUrl: 'https://chat.openai.com' },
  gemini:      { urlPattern: /gemini\.google\.com/,         name: 'Gemini (Google)',       signupUrl: 'https://gemini.google.com' },
  perplexity:  { urlPattern: /perplexity\.ai/,              name: 'Perplexity',            signupUrl: 'https://perplexity.ai' },
  copilot:     { urlPattern: /copilot\.microsoft\.com/,     name: 'Copilot (Microsoft)',   signupUrl: 'https://copilot.microsoft.com' },
};

async function detectAISessions() {
  const tabs = await chrome.tabs.query({});
  const detected = {};

  for (const [vendor, config] of Object.entries(AI_VENDOR_PATTERNS)) {
    const matchingTabs = tabs.filter((tab) => tab.url && config.urlPattern.test(tab.url));
    if (matchingTabs.length > 0) {
      detected[vendor] = {
        name: config.name,
        tabCount: matchingTabs.length,
        signupUrl: config.signupUrl,
        // Login detection is best-effort via tab title heuristics;
        // We present the result as tentative per B.1 spec
        likelyLoggedIn: matchingTabs.some((t) => t.title && !t.title.toLowerCase().includes('sign in')),
      };
    }
  }

  return detected;
}

// ── Onboarding: open onboarding page on install ───────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const prefs = await getPrefs();
    if (!prefs.onboardingComplete) {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/onboarding.html') });
    }
  }
});

// ── Telemetry: opt-in share to LB ────────────────────────────────────────────

async function submitVerifyResults(results, sharePreference, memberId) {
  if (sharePreference === 'private') return { submitted: false };
  try {
    const body = {
      ai_vendor: results.vendor,
      cold_hot_pct: results.coldHotPct,
      cathedral_hot_pct: results.cathedralHotPct,
      lift_pp: results.liftPp,
      questions_completed: results.questionsCompleted,
      share_preference: sharePreference,
      member_id: sharePreference === 'public' ? memberId : null,
      client_timestamp: new Date().toISOString(),
    };
    const resp = await fetch('https://api.lianabanyan.com/test_frame_results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { submitted: resp.ok };
  } catch {
    return { submitted: false, error: 'network_error' };
  }
}

// ── Message router ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'ENRICH_QUERY': {
      chrome.storage.local.get({ injectionEnabled: true, persona: 'casual' }, async (prefs) => {
        if (!prefs.injectionEnabled) {
          sendResponse({ enrichedQuery: message.query, intent: null, daemonAlive: false, injectionEnabled: false });
          return;
        }
        const result = await fetchEnrichment(message.query);
        if (result.daemonAlive && result.intent) {
          chrome.storage.local.set({ lastIntent: result.intent });
        }
        sendResponse({ ...result, injectionEnabled: true });
      });
      return true;
    }

    case 'PING_DAEMON': {
      pingDaemon().then((alive) => sendResponse({ alive }));
      return true;
    }

    case 'GET_PREFS': {
      getPrefs().then(sendResponse);
      return true;
    }

    case 'SET_PREF': {
      setPrefs({ [message.key]: message.value }).then(() => sendResponse({ ok: true }));
      return true;
    }

    case 'SET_PREFS': {
      setPrefs(message.prefs).then(() => sendResponse({ ok: true }));
      return true;
    }

    case 'DETECT_AI_SESSIONS': {
      detectAISessions().then(sendResponse);
      return true;
    }

    case 'SUBMIT_VERIFY_RESULTS': {
      getPrefs().then((prefs) => {
        submitVerifyResults(message.results, prefs.sharePreference, prefs.lbMemberId)
          .then(sendResponse);
      });
      return true;
    }

    case 'OPEN_VERIFY_TAB': {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/verify.html') });
      sendResponse({ ok: true });
      return false;
    }

    case 'OPEN_DISCIPLINE_RULES': {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/discipline-rules.html') });
      sendResponse({ ok: true });
      return false;
    }

    // ── Discipline engine messages (K513) ────────────────────────────────────
    case 'DISCIPLINE_CHECK':
    case 'DISCIPLINE_GET_RULES':
    case 'DISCIPLINE_SAVE_RULE':
    case 'DISCIPLINE_DELETE_RULE':
    case 'DISCIPLINE_INSTALL_STARTER':
    case 'DISCIPLINE_GET_AUDIT':
    case 'DISCIPLINE_MARK_CONSULTED': {
      handleDisciplineMessage(message, sendResponse);
      return true;
    }

    // ── Wing control messages (K518) ──────────────────────────────────────────
    case 'WING_ENABLED_GET':
    case 'WING_ENABLED_SET':
    case 'WING_GET_DASHBOARD':
    case 'WING_EXPORT':
    case 'WING_IMPORT':
    case 'WING_INSTALL_STARTERS': {
      handleDisciplineMessage(message, sendResponse);
      return true;
    }

    case 'OPEN_WING_DASHBOARD': {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/wing-dashboard.html') });
      sendResponse({ ok: true });
      return false;
    }

    // ── NAF federation messages (K519) ────────────────────────────────────────
    case 'NAF_FEDERATE_GET':
    case 'NAF_FEDERATE_SET':
    case 'NAF_EMIT_AGGREGATE':
    case 'NAF_SUBMIT_CANDIDATE':
    case 'NAF_GET_DEFAULTS':
    case 'NAF_INSTALL_DEFAULT':
    case 'NAF_IGNORE_DEFAULT': {
      handleDisciplineMessage(message, sendResponse);
      return true;
    }

    case 'OPEN_NAF_ADMIN': {
      chrome.tabs.create({ url: 'http://127.0.0.1:7712/naf/admin' });
      sendResponse({ ok: true });
      return false;
    }
  }
});
