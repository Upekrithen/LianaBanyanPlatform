# PROMPT: KNIGHT K508 — Comet Bridge Network-Intercept Refactor

**Session:** K508 / B125
**Bishop:** B125 (Claude Sonnet 4.6, fresh session)
**Date:** 2026-04-25
**BRIDLE version:** v10.5 (all 10 rules + shell-pattern discipline)
**Estimated:** 4–6 hours Sonnet 4.6 (escalate to Opus only if MV3 network-intercept complexity warrants it)
**Budget cap:** $4
**Target tag:** `v-comet-bridge-network-intercept-K508`
**Upstream gates:** None — Founder greenlight is the only gate

---

## Background

The Comet Bridge Chrome extension (scaffolded in K485A/B123) is loaded into the Founder's Comet browser. The Helm PWA daemon is running on port 7711, the REST sidecar is healthy on port 7712, and the `/enrich` endpoint returns correct Cathedral substrate (4,416 tokens, intent correctly classified) when called directly via curl.

However, when the Founder asked Perplexity *"What is the Cathedral Effect? and How does the Wheelbarrow Empirical work?"*, Perplexity returned the generic environmental-psychology answer (Edward T. Hall's room-ceiling research) — Cathedral substrate was NOT injected. DevTools Network tab confirmed: 19 requests to perplexity.ai endpoints, **zero** requests to `localhost:7712/enrich`.

The daemon is healthy. The bug is in the extension's content-script layer.

---

## Root Cause Hypothesis

The current K485A `content.js` uses a **DOM-replacement + keydown-intercept approach**:

1. Scan DOM for textarea/contenteditable input element using CSS selectors
2. Attach a `keydown` event listener (capture phase)
3. On Enter, `preventDefault()`, call background for enrichment, set value on element, refire Enter

**Why this fails:** Perplexity is a React SPA that changes its DOM structure on each release. The current selectors (`textarea[placeholder]`, `div[contenteditable="true"]`, etc.) may not match the active input element Perplexity actually uses today. More critically, even if the selector matches, Perplexity may submit queries via a button click handler or an internal React synthetic event — not via a keydown on the textarea — meaning the intercept never fires.

Evidence: DevTools shows **zero** calls to the daemon. This means `requestEnrichment()` in `content.js` is never being called — the intercept path is dead, not just slow.

---

## Architecture Change: DOM-Intercept → Network-Intercept (MAIN World Fetch Override)

**The robust fix:** intercept Perplexity's outgoing API request at the network layer, before it leaves the browser. This approach is:

- **DOM-independent** — doesn't care how the user submits or which UI element is active
- **Version-proof** — Perplexity can rearrange their DOM at will; the API call pattern is more stable
- **MV3-compatible** — uses content script injection into the MAIN world (page context), which can override `window.fetch`

### How it works

1. A new content script (`injected.js`) runs in the **MAIN world** (declared in `manifest.json` with `world: "MAIN"`)
2. `injected.js` wraps `window.fetch` to intercept outgoing requests matching Perplexity's API pattern (the `perplexity_ask` or equivalent endpoint visible in DevTools)
3. When a matching request is detected, `injected.js` extracts the query text from the request body
4. It sends a `chrome.runtime.sendMessage({type: 'ENRICH_QUERY', query})` to the background service worker
5. The background service worker calls `localhost:7712/enrich` (existing code — no changes needed)
6. The enriched query is injected into the request body before the fetch proceeds
7. The existing content.js keydown logic is **removed or disabled** to eliminate the race condition

**Important MV3 note:** `chrome.runtime.sendMessage` IS accessible from MAIN-world content scripts in MV3 — the `world: "MAIN"` declaration in manifest doesn't remove runtime access. This is the clean path. Do NOT use `window.postMessage` as an intermediary unless runtime messaging fails.

---

## Files

| File | Action |
|---|---|
| `librarian-mcp-helm-pwa/comet-bridge-extension/manifest.json` | Add `injected.js` content script with `world: "MAIN"`, `run_at: "document_start"` |
| `librarian-mcp-helm-pwa/comet-bridge-extension/injected.js` | **New file** — MAIN-world fetch interceptor |
| `librarian-mcp-helm-pwa/comet-bridge-extension/content.js` | Disable/remove keydown-intercept logic (retain only as fallback or delete) |
| `librarian-mcp-helm-pwa/comet-bridge-extension/background.js` | No changes needed — existing `fetchEnrichment()` is correct |
| `librarian-mcp-helm-pwa/comet-bridge-extension/popup.html/.css/.js` | No changes needed |

---

## Phase A — Diagnose (30–60 min)

Before writing new code, confirm the exact failure mode:

1. Set `DEBUG = true` in the current `content.js` and reload the extension in Comet
2. Open Perplexity in Comet, open DevTools Console
3. Confirm whether `[CometBridge] Content script loaded on perplexity.ai` appears
   - If NO: content script isn't loading → check manifest `matches` pattern and Comet's content-script permissions
   - If YES: content script loads but intercept never fires → selector or event model mismatch
4. Open DevTools → Network tab → filter for `localhost:7712` — confirm zero hits when submitting a query
5. Open DevTools → Network tab → capture a Perplexity query submission, identify the exact API endpoint and request body structure (`perplexity_ask`, `perplexity_labs`, or whatever the current endpoint is)
6. Record findings in a short diagnostic note at the top of the K508 report

This Phase A diagnostic determines what "Perplexity's API request" looks like so Phase B can write the correct intercept pattern.

---

## Phase B — Implement Fetch Interceptor (2–3 hours)

### Step 1: Update `manifest.json`

Add `injected.js` as a MAIN-world content script running at `document_start`:

```json
{
  "content_scripts": [
    {
      "matches": ["*://*.perplexity.ai/*"],
      "js": ["injected.js"],
      "run_at": "document_start",
      "world": "MAIN"
    },
    {
      "matches": ["*://*.perplexity.ai/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

Also add `"host_permissions": ["*://*.perplexity.ai/*", "http://127.0.0.1:7712/*"]` if not already present.

Also run `git check-ignore` on `injected.js` before creating it (Step-0 BRIDLE requirement).

### Step 2: Create `injected.js` (MAIN world fetch interceptor)

```js
/**
 * Comet Bridge — MAIN World Fetch Interceptor
 *
 * Runs in the page's MAIN world before Perplexity's own scripts.
 * Overrides window.fetch to intercept outgoing Perplexity API requests
 * and inject Cathedral substrate into the query before the request proceeds.
 *
 * Why MAIN world: content-script world cannot override window.fetch as seen
 * by page code. MAIN world injection executes in the same JS context as the page.
 *
 * K508 / B125
 */

(function () {
  'use strict';

  const DEBUG = false;
  const PERPLEXITY_API_PATTERN = /perplexity_ask|\/api\/ask|\/rest\/perplexity/i;
  // Adjust PERPLEXITY_API_PATTERN based on Phase A diagnosis of actual endpoint URL

  const _originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input?.url ?? '';

    if (!PERPLEXITY_API_PATTERN.test(url)) {
      return _originalFetch.apply(this, arguments);
    }

    // Clone and parse the request body to extract the query
    let body;
    try {
      const rawBody = init?.body ?? (input instanceof Request ? await input.clone().text() : null);
      body = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      if (DEBUG) console.warn('[CometBridge] Could not parse request body — passing through');
      return _originalFetch.apply(this, arguments);
    }

    const query = extractQuery(body);
    if (!query || query.length < 3) {
      return _originalFetch.apply(this, arguments);
    }

    if (DEBUG) console.log('[CometBridge] Intercepted Perplexity request, query:', query.slice(0, 80));

    // Request enrichment from background service worker
    let enrichedQuery = query;
    try {
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('timeout')), 800);
        chrome.runtime.sendMessage({ type: 'ENRICH_QUERY', query }, (res) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(res);
        });
      });

      if (response?.daemonAlive && response?.injectionEnabled !== false) {
        enrichedQuery = response.enrichedQuery ?? query;
        if (DEBUG) console.log('[CometBridge] Cathedral substrate injected, length:', enrichedQuery.length);
      }
    } catch (err) {
      if (DEBUG) console.warn('[CometBridge] Enrichment failed, passing original query:', err.message);
    }

    // Rebuild request body with enriched query
    const enrichedBody = injectQuery(body, enrichedQuery);
    const newInit = {
      ...init,
      body: JSON.stringify(enrichedBody),
    };

    return _originalFetch.call(this, input, newInit);
  };

  /**
   * Extract the user query string from the Perplexity request body.
   * Adjust field paths based on Phase A diagnosis.
   */
  function extractQuery(body) {
    if (!body) return null;
    // Common patterns — adjust after Phase A confirms actual body shape
    return body?.query
      ?? body?.messages?.[body.messages.length - 1]?.content
      ?? body?.prompt
      ?? null;
  }

  /**
   * Inject the enriched query back into the request body.
   */
  function injectQuery(body, enrichedQuery) {
    if (body?.query !== undefined) {
      return { ...body, query: enrichedQuery };
    }
    if (Array.isArray(body?.messages)) {
      const messages = [...body.messages];
      const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
      if (lastUserIdx >= 0) {
        const realIdx = messages.length - 1 - lastUserIdx;
        messages[realIdx] = { ...messages[realIdx], content: enrichedQuery };
        return { ...body, messages };
      }
    }
    if (body?.prompt !== undefined) {
      return { ...body, prompt: enrichedQuery };
    }
    return body;
  }

  if (DEBUG) console.log('[CometBridge] MAIN world fetch interceptor active on', window.location.hostname);
})();
```

**Note:** The `PERPLEXITY_API_PATTERN` regex and the body field paths (`query`, `messages`, `prompt`) must be adjusted based on Phase A's DevTools capture of the actual Perplexity API call structure. Do not guess — capture first, then implement.

### Step 3: Disable `content.js` keydown logic

Either:
- Delete `content.js` entirely if the MAIN-world interceptor fully replaces it
- OR keep it as a fallback stub with all intercept logic disabled (add a top-level `return;` after the IIFE opens, or set `const INJECTION_ENABLED = false`)

Do NOT run both intercept strategies simultaneously — double-injection would corrupt the query.

---

## Phase C — Browser Test Matrix (30–60 min)

Test on all three browsers with Perplexity loaded:

| Browser | Test |
|---|---|
| **Comet** (primary) | Ask "What is the Cathedral Effect?" — confirm LB Cathedral response (not Edward T. Hall) |
| **Chrome** (reference) | Same test |
| **Edge** (secondary) | Same test |

For each browser:
1. Open DevTools → Network tab
2. Ask test query
3. Confirm request to `localhost:7712/enrich` appears in Network tab
4. Confirm Perplexity response contains LB-specific content (Cathedral Effect = K-sequence memory system, not room ceilings)
5. Confirm fallback works: stop the daemon, ask again — Perplexity should still respond (plain, non-enriched)

---

## Phase D — Update K502 Chrome Web Store Package (30 min)

K502 established the Chrome Web Store submission package. K508 changes the extension architecture, so the submission package must be updated:

1. Rebuild the extension zip from the K508 codebase
2. Update the version in `manifest.json` (bump to `1.1.0` or `0.2.0`)
3. Update the K502 submission package with the new zip and updated version notes
4. Update the store description if the "how it works" language referenced DOM-manipulation specifically

---

## Phase E — Close-Out (30 min)

**Synapse emission:** ≥ 12 clusters required (v10.2). Emit synapses for:
- Bug class confirmed (selector failure vs. timing race — Phase A answer)
- Architectural pivot: DOM-intercept → MAIN-world fetch-intercept
- `PERPLEXITY_API_PATTERN` regex value confirmed against live DevTools capture
- Body field paths confirmed (`query` / `messages` / `prompt`)
- Comet browser test result (injected vs. not)
- Chrome browser test result
- Edge browser test result
- Fallback behavior confirmed
- content.js disposition (deleted or disabled)
- manifest.json changes
- K502 package update status
- Any unexpected findings or failure modes

**Toolsmith write:** Required at session close per BRIDLE v10.3. Capture:
- The MAIN-world fetch intercept pattern (reusable for any extension that needs to intercept page network calls)
- The `chrome.runtime.sendMessage` from MAIN world pattern
- Perplexity API endpoint and body shape (as documented by Phase A)

**Commit:** Use `librarian-mcp/scripts/git_commit_message.ps1` for multi-line message.

Commit message structure:
```
feat(comet-bridge): K508 network-intercept refactor — DOM-replace → MAIN-world fetch override

- Phase A: confirmed bug class (selector/timing failure in content.js keydown approach)
- Phase B: new injected.js in MAIN world overrides window.fetch, intercepts Perplexity API
- Phase C: tested on Comet + Chrome + Edge — Cathedral substrate injection confirmed
- Phase D: K502 Chrome Web Store package updated with K508 architecture

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Tag:** `v-comet-bridge-network-intercept-K508`

**Report:** File as `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K508_B125_COMET_BRIDGE_NETWORK_INTERCEPT.md`

Include in report:
- Phase A bug-class diagnosis result
- Confirmed Perplexity API endpoint and body shape
- What changed and why
- Browser test matrix results (pass/fail per browser)
- Fallback test result
- Any architectural observations (e.g., whether `chrome.runtime.sendMessage` from MAIN world worked cleanly, or if a postMessage bridge was needed)
- Coherence note: this prompt was drafted by B125 as a fresh coherence test; compare to B124's verbal scoping in the handoff file

---

## Constraints

- **BRIDLE v10.5** — all 10 rules enforced
- **Step-0** — `git check-ignore injected.js` before creating the file
- **No AI impersonation** — the injected query must be the real request Perplexity receives; do NOT fake-inject or simulate. If the intercept doesn't work, report failure honestly
- **Fallback guarantee** — if daemon is down, Perplexity must continue to work normally (pass original request unmodified)
- **No upstream gates** — this is greenlit by Founder on K508 dispatch; start immediately

---

## Success Criteria

- [ ] Phase A: Bug class confirmed with DevTools evidence (selector failure vs. timing race vs. script not loading)
- [ ] Phase B: `injected.js` implemented with correct API pattern and body field paths (confirmed from Phase A)
- [ ] Phase C: Cathedral substrate injection confirmed in Comet — Perplexity answers "What is the Cathedral Effect?" with LB Cathedral content, not Edward T. Hall
- [ ] Phase C: Chrome and Edge also pass
- [ ] Phase C: Fallback test passes (daemon down → plain Perplexity response, no errors)
- [ ] Phase D: K502 Chrome Web Store package updated
- [ ] Phase E: ≥12 synapses emitted, Toolsmith write filed, commit with BRIDLE message, tag applied, report filed

---

*K508 / B125 — Drafted fresh per Founder-directed coherence test (see HANDOFF_B124_TO_B125_K508_COHERENCE_TEST.md). Long haul. Always.*
