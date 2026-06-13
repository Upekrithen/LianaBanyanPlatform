---
spec: BP081_FEATURE_SPEC_ASK_HEARTBEAT_AND_TOKEN_STREAMING
bp: BP081
composed_at: 2026-06-12
composed_by: Bishop Opus 4.7 (1M)
target_version: v0.1.57.1 (recommended hotfix) OR v0.1.58 carry-along (Knight choice)
purpose: Beef up Ask UX heartbeat for cold-start + ongoing inference; switch to Ollama streaming response so tokens render as they arrive instead of waiting for complete response
status: SPEC — Founder ratified BP081 2026-06-12 · Knight implements
ratification: Founder direct verbatim: "YES to these: During first-inference cold-start, show: 🧠 Gemma is loading into memory (first run, ~30–90s)... with elapsed-time counter. During subsequent inferences, show: Thinking... (Xs) with elapsed counter. Stream tokens as they arrive instead of waiting for complete response (Ollama API supports streaming)."
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs"
  - "Every-click visible feedback canon (BP078)"
  - "Long-running heartbeat canon (BP078) — anything >3s shows progress"
  - "Bishop-orchestrator / Knight-implementer (BP080)"
related_canons:
  - feedback_every_click_visible_feedback_canon_bp078
  - feedback_long_running_progress_heartbeat_canon_bp078
empirical_grounding:
  - "BP081 v0.1.57 first-launch Ask: 30+ second silent wait with only a blinking '|' cursor caused belief that the query had failed. Adversarial-test reality: Gemma was cold-loading 7.6 GB into RAM. The UX did not communicate this. Founder saw silence; canon says silence = broken."
---

# Feature Spec · Ask Cold-Start Heartbeat + Token Streaming

**Founder direct ratify BP081 2026-06-12:**

> *"YES to these: During first-inference cold-start, show: 🧠 Gemma is loading into memory (first run, ~30–90s)... with elapsed-time counter. During subsequent inferences, show: Thinking... (Xs) with elapsed counter. Stream tokens as they arrive instead of waiting for complete response (Ollama API supports streaming)."*

Three load-bearing UX improvements. Each closes a specific gap in the current Ask flow.

---

## §1 First-inference cold-start indicator

**Trigger:** the first time `aiDispatch.query` fires AFTER app launch where Ollama responds but inference latency >3s, OR detection that the model has not yet been loaded into Ollama's memory (`ollama ps` empty or model not listed in `loaded models`).

**UI:**
```
🧠 Gemma is loading into memory (first run, ~30–90s)... (12s)
```

- The emoji + text portion is static
- The elapsed counter increments every 1s starting from query-send time
- Displayed inside the assistant-response bubble where the answer will eventually render
- Replaces the current blinking `|` cursor for this case

**Detection of "cold-start":**
- Cheapest test: time since app launch < 60s AND no prior successful inference this session
- Better test (if cheap): call `GET http://127.0.0.1:11434/api/ps` before the inference; if model is not in `loaded models` list → cold-start; if in list → warm
- Even better: track per-app-session inference count; if count == 0 → cold-start

**Transition:** when the first token streams back (see §3), replace the loading message with the streaming tokens.

---

## §2 Subsequent-inference indicator

**Trigger:** every inference after the first one (or any inference when cold-start detection returns "warm").

**UI:**
```
Thinking... (4s)
```

- Static text "Thinking..."
- Elapsed counter increments every 1s starting from query-send time
- Displayed inside the assistant-response bubble where the answer will eventually render
- Hides as soon as the first token streams back

---

## §3 Token streaming via Ollama API

**Goal:** render tokens as they arrive instead of waiting for the complete response. Closes the perceived-latency gap; turns a 15s wait into a 1.5s start-to-first-token.

**Ollama API:** `/api/chat` supports `stream: true` (default). When streaming, Ollama returns NDJSON — one JSON object per line per token chunk.

**Implementation:**

- `ai_dispatch_ipc.ts` handler:
  - Use `fetch` with `body: JSON.stringify({ ..., stream: true })`
  - Read response body as a `ReadableStream` (Node-fetch's response.body is async iterable)
  - For each NDJSON chunk: parse, extract `message.content` delta, emit IPC progress event to renderer
  - Use the existing `onModelPullProgress` pattern from v0.1.56 SEG-2 (ModelPullProgress) — same shape, different event name (e.g. `ask-token-progress`)
  - On final chunk (`done: true`): emit `ask-token-complete` with the full assembled content + eblet-write hook (per substrate accumulator R1)

- `preload.ts`:
  - Add `onAskTokenProgress(handler)` and `onAskTokenComplete(handler)` to `aiDispatch` namespace
  - Same wiring pattern as `firstLaunchModelPull.onProgress`

- `LeanAskTab.tsx`:
  - On `aiDispatch.query` call, register handlers for `onAskTokenProgress` and `onAskTokenComplete`
  - On each progress event: append token to the in-flight response bubble
  - On complete event: finalize bubble + write to localStorage history
  - If query throws OR `onAskTokenComplete` fires with error field set → render error bubble (per existing catch path)

**Edge cases:**
- Network interruption mid-stream → finalize whatever was received + append `[stream interrupted]` marker
- User clicks "Send" again while a stream is in flight → cancel the in-flight stream (AbortController per v0.1.56 SEG-2 pattern) before starting the new one
- Eblet write (substrate accumulator R1) happens on `done: true` with the COMPLETE assembled content — not per-token

---

## §4 Verify (Sonnet 4.6 SEG)

- Install on M0 (or fresh-Ollama machine) → first Ask query shows cold-start indicator with counter → counter advances 1s/s
- Once Gemma loads: first token appears in bubble within 2s, subsequent tokens stream in
- Second Ask query (same session) shows `Thinking... (Xs)` not cold-start
- Verify Ollama server.log shows `/api/chat` request with `stream: true` body
- Verify eblet written to local store on `done: true` (R1 substrate write continues to work)
- Screenshot all three states (cold-start, streaming-in-progress, complete)

---

## §5 Out of scope for this spec (queued separately)

- **Stale-message auto-clear on app-version change** — Bishop recommends but awaiting Founder ratify. Without it, every upgrade will rehydrate ghost errors from prior versions' localStorage. The v0.1.55/v0.1.56/v0.1.57 belief-vs-binary trap will repeat at every upgrade for users who keep older message history.
- **Onboarding gate UX** — when SKU tier is `full` + Ollama healthy + Gemma present, auto-flip `mnemosynec_onboarding_complete` so users see the full 17-tab Advanced view immediately instead of LeanShell. Recommended; awaiting Founder ratify.
- **Cancel button on in-flight Ask** — every-click-feedback compliant cancellation. Recommended.

---

## §6 Recommended landing

**Knight choice:** ship as v0.1.57.1 hotfix (fastest, isolated) OR fold into v0.1.58 wave (alongside R3 Andon persistence + Post Results + Cue Deck Card share).

Bishop recommendation: **v0.1.57.1 hotfix** — small, focused, ships fast, immediate Founder-experience win. v0.1.58 stays clean for the R3 work without bloat.

— Bishop · BP081 · 2026-06-12
