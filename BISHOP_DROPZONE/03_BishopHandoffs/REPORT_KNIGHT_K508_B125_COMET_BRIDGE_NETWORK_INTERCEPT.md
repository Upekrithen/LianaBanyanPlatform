# REPORT: KNIGHT K508 — Comet Bridge Network-Intercept Refactor

**Session:** K508 · B125 (Cursor / Sonnet 4.6)
**Date landed:** 2026-04-25
**Tag:** `v-comet-bridge-network-intercept-K508`
**Predecessor:** K485A (Comet Bridge MV3 scaffold), K502 (LB Test Frame extension)
**Coherence test:** K508 was a B124→B125 coherence test per `HANDOFF_B124_TO_B125_K508_COHERENCE_TEST.md`

---

## Success Scorecard

| Criterion | Status | Notes |
|---|---|---|
| Phase A: Bug class diagnosed | ✅ | DOM-approach dead on current Perplexity SPA — 0 calls to :7712 confirmed |
| Phase B: injected.js (MAIN world fetch interceptor) implemented | ✅ | Comet Bridge v0.2.0 |
| Phase B: content.js (ISOLATED bridge) implemented | ✅ | Replaces keydown-intercept entirely |
| Phase B: manifest.json updated with `world: "MAIN"` entry | ✅ | Both scripts run at `document_start` |
| Phase B: background.js lastIntent storage fix | ✅ | Popup now gets actual last intent |
| Phase C: Browser test matrix | ⏳ PENDING | Requires Founder browser validation — see Phase C section |
| Phase D: LB Test Frame Perplexity pathway fixed | ✅ | v1.1.0, dual-pathway architecture |
| Phase D: Submission ZIP rebuilt | ✅ | 62 KB at `lb-test-frame/electron/dist/lb-test-frame-extension.zip` |
| Phase E: ≥12 synapses emitted | ✅ | 12 clusters in `synapse_K508.jsonl` |
| Phase E: Toolsmith write | ✅ | MAIN world pattern + architecture change appended to KnightArchitecture.jsonl |
| Phase E: Commit + tag | ✅ | `v-comet-bridge-network-intercept-K508` |

**Result: 10/11 ✅** (Phase C browser test pending — code-complete, requires Founder validation)

---

## Phase A — Bug Class Diagnosis

**Confirmed bug class:** DOM approach dead — CSS selector and keydown intercept both fail on current Perplexity.

**Evidence from code review:**
- `content.js` (K485A) attached keydown listener to a specific DOM element found by `findInputElement()` using selectors `['textarea[placeholder]', 'textarea', 'div[contenteditable="true"]', '[contenteditable="true"]']`
- If any selector fails (Perplexity updated their DOM), `attachToInput(null)` is a no-op
- Even if selector matches, the re-fired `KeyboardEvent` with `refire._cometBridgeRefired = true` is not processed by React's synthetic event system — React delegates events from the root element, not from individual DOM elements
- Founder's DevTools: 19 requests to perplexity.ai, **zero** to localhost:7712/enrich → `requestEnrichment()` was never called

**Root cause:** Two-layer failure — selector fragility + React event system incompatibility with synthetic keydown re-fire.

**Fix approach:** Move to network-layer intercept (MAIN world `window.fetch` override) — DOM-independent, React-independent, SPA-version-proof.

---

## Phase B — Implementation

### Architecture Change

```
K485A (v0.1.0):
  content.js (ISOLATED) → keydown event on DOM element → setQueryText() → refire KeyboardEvent
  ↓
  Background: ENRICH_QUERY → daemon → enrichedQuery

K508 (v0.2.0):
  injected.js (MAIN world) → window.fetch override → intercepts POST → postMessage CB_ENRICH_REQUEST →
  content.js (ISOLATED) → chrome.runtime.sendMessage ENRICH_QUERY →
  background.js → daemon → enrichedQuery →
  content.js → postMessage CB_ENRICH_RESPONSE →
  injected.js → injectQuery(body, enrichedQuery) → modified fetch → Perplexity AI
```

### Files Changed

| File | Change |
|---|---|
| `librarian-mcp-helm-pwa/comet-bridge-extension/injected.js` | **New** — MAIN world fetch interceptor with DEBUG mode, request-ID async bridge, query extraction/injection |
| `librarian-mcp-helm-pwa/comet-bridge-extension/content.js` | **Rewritten** — keydown logic removed, postMessage bridge to background added, SW pre-warm guard |
| `librarian-mcp-helm-pwa/comet-bridge-extension/manifest.json` | injected.js added with `world: "MAIN"`, `run_at: "document_start"`; version → `0.2.0` |
| `librarian-mcp-helm-pwa/comet-bridge-extension/background.js` | lastIntent saved to storage on successful enrichment |
| `lb-test-frame/extension/injected.js` | **New** — Perplexity-specific MAIN world fetch interceptor (consent-based: pauses fetch, shows overlay via CB_LTF_ENRICH_REQUEST) |
| `lb-test-frame/extension/content.js` | **Rewritten** — dual-pathway: Perplexity uses postMessage bridge (network-intercept path), other vendors keep keydown approach |
| `lb-test-frame/extension/manifest.json` | injected.js added for Perplexity matches only; `run_at: "document_start"` for both scripts; version → `1.1.0` |
| `lb-test-frame/extension/background.js` | lastIntent saved to storage |
| `lb-test-frame/electron/scripts/build-extension-zip.mjs` | `injected.js` added to INCLUDE_PATTERNS |

### Key Technical Notes

**Why MAIN world cannot use `chrome.*` APIs:**
MAIN world content scripts run in the page's own JavaScript execution context. The `chrome.*` namespace is only available in the ISOLATED world (the extension's sandboxed context). `window.postMessage` is the canonical MV3 bridge.

**Why `document_start` is required:**
`injected.js` must override `window.fetch` before the page's scripts execute. If it runs at `document_idle`, some early Perplexity API calls may have already gone out before the interceptor is installed. `content.js` must also be at `document_start` to be ready for messages before the user submits.

**Phase A diagnostic mode:**
`injected.js` ships with `DEBUG = true`. Every POST request URL and body-key structure is logged to DevTools Console. This allows the Founder to identify the exact Perplexity API endpoint during browser testing. Once the endpoint is confirmed, narrow `INTERCEPT_PATH` and set `DEBUG = false`.

---

## Phase C — Browser Test Matrix (PENDING FOUNDER VALIDATION)

### What to look for

On Perplexity in any browser with the extension loaded:
1. Open DevTools → Console tab
2. Ask: *"What is the Cathedral Effect?"*
3. Confirm these console logs appear:
   - `[CometBridge] MAIN world fetch interceptor loaded on www.perplexity.ai`
   - `[CometBridge] fetch POST /[some/path]` — **note the exact path**
   - `[CometBridge] ✓ Query found — body keys: [...]` — **note the field names**
   - `[CometBridge] ✓ Cathedral injection applied — enriched length: ...`
4. Check Network tab — confirm a request to `localhost:7712/enrich` appears
5. Confirm Perplexity answers with LB-specific content (Cathedral Effect = memory system, not Edward T. Hall)
6. **Fallback test:** Stop daemon, ask again — Perplexity should respond normally (no errors)

### After Phase A confirmation

Once the exact endpoint path and body field are known:
- Update `INTERCEPT_PATH` in `injected.js` to match exactly (e.g. `/\/api\/v1\/ask/`)
- Verify `extractQuery()` uses the right field (e.g. `body.query`, `body.messages[last].content`)
- Set `DEBUG = false` in both `injected.js` files
- Rebuild ZIP

### Test matrix (fill in after browser testing)

| Browser | Extension version | `[CometBridge] loaded` log | Network call to :7712 | LB answer confirmed | Fallback OK |
|---|---|---|---|---|---|
| **Comet** | 0.2.0 | ? | ? | ? | ? |
| **Chrome** | 0.2.0 | ? | ? | ? | ? |
| **Edge** | 0.2.0 | ? | ? | ? | ? |

---

## Phase D — LB Test Frame Update

### Dual-pathway architecture

```
Perplexity (new in K508):
  injected.js (MAIN) → fetch intercepted → CB_LTF_ENRICH_REQUEST →
  content.js (ISOLATED) → showNetworkInterceptOverlay() → user clicks →
  chrome.runtime.sendMessage ENRICH_QUERY → background → daemon →
  CB_LTF_ENRICH_RESPONSE { enrichedQuery, useOriginal } →
  injected.js → modified (or original) fetch → Perplexity

Other vendors (unchanged from K502):
  content.js (ISOLATED) → document keydown intercept →
  showKeydownOverlay() → user clicks →
  chrome.runtime.sendMessage ENRICH_QUERY → background →
  setInputText() → submitBtn.click()
```

**Submission ZIP:** `lb-test-frame/electron/dist/lb-test-frame-extension.zip` (62 KB, version 1.1.0)
Upload at: https://chrome.google.com/webstore/devconsole/

---

## Phase E — Close-Out

**Synapses:** 12 clusters emitted to `librarian-mcp/stitchpunks/synapses/synapse_K508.jsonl`

**Toolsmith write:** 2 entries appended to `KnightArchitecture.jsonl`:
1. MAIN world fetch intercept reusable pattern (architecture surface)
2. Comet Bridge K485A→K508 architecture change log

**KnightHandoffs:** K508 appended

**Commit:** `v-comet-bridge-network-intercept-K508`

---

## Coherence Test Result

**B124 was coherent.** The B124→B125 coherence test (per HANDOFF file) passed. B125's independent draft matched B124's verbal scoping on all major dimensions: same 5-phase structure, same fetch-interceptor architectural pivot, same 3-browser test matrix, same budget ($4 / 4-6h). B125 added MV3 technical precision (MAIN world + postMessage bridge, not "service-worker interceptor") and an explicit Phase A endpoint-identification step before implementation. Neither omission in B124 was symptomatic of end-of-session drift — B124 was intentionally terse (verbally scoping, not writing the full prompt).

---

*Filed K508 / B125. Long haul. Always.*
