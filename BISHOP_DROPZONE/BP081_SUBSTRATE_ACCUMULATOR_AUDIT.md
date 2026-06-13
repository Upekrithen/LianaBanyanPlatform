# Substrate Accumulator Audit — v0.1.55 Wave · BP081
Generated: 2026-06-12

## R1: Plow loop writes eblets on accept
**Status:** GAP
**File(s):**
- `src\main\spider_registry.ts` lines 409–437 (writes `SpiderReceipt` + pheromone link JSON under `~/.lb_substrate/spider_web/links/`, not verified-answer eblets)
- `src\main\sprite_registry.ts` lines 488–515 (Sprite "accept" = courier delivery race winner; writes delivery/recall receipts, not Q&A eblets)
- `src\main\mnem_eblet_store.ts` lines 1–109 (read-only BM25 reader; **no write API**)
- `src\main\substrate_router.ts` lines 329–339 (auto-writes unverified Ollama answers to `substrate_cache.jsonl` on AI-burst miss — **not** plow accept)
- `src\main\substrate_api.ts` lines 716–746 (`POST /substrate/write` — external write with no verified-correct gate)
- `src\main\pantheon\orchestrator.ts` lines 116–124 (writes folder-mined tablets via `tablet_store`, not plow-verified answers)

**Current state:** Spider/Sprite registries implement courier/pheromone infrastructure (BP030), not a plow accept → verified-answer eblet pipeline. There is no accept handler that takes a specialist-verified answer and persists it to the Mnem eblet store or a canonical verified-answer path. Closest write paths are: (a) Pantheon folder mining → `~/.lb_substrate/tablets/`, (b) `SubstratedFolderWatcher` minting from file changes, (c) `substrate_router` caching raw Ollama output — none gated on plow/SEG/Andon accept.

**Recommended version:** v0.1.55

---

## R2: Gemma prompt retrieves eblets BEFORE answering (HOT path)
**Status:** GAP (partial dead-code scaffold exists)
**File(s):**
- **GAP — primary Lean Ask HOT path:** `src\renderer\components\LeanAskTab.tsx` lines 54–66 (direct `fetch('http://127.0.0.1:11434/api/generate')` with no substrate/eblet prepend)
- **GAP — first-run / try-it:** `src\main\ollama_manager.ts` lines 657–691 (`askFloorModel` — raw Ollama generate, no retrieval)
- **GAP — Hearth Conjunction:** `src\main\hearth\conjunction\backend_adapters\ollama_adapter.ts` lines 23–38 (raw `/api/generate`, no retrieval)
- **GAP — no renderer consumer:** grep across `src/renderer/**` finds zero uses of `aiDispatch` / `ai-dispatch:query` despite preload exposure at `src\main\preload.ts` lines 822–832
- **PARTIAL — unwired IPC path:** `src\main\ai_dispatch_ipc.ts` lines 161–191 (`queryEbletStore(userMessage)` before `/api/chat` when Mnem-DRT enabled)
- **PARTIAL — benchmark HOT only:** `src\main\index.ts` lines 3033–3079 (`run-mesh-test` COLD-vs-HOT: `substrateQuery()` before HOT Ollama call)
- **NOT USED:** `pheromone_query` — no references under `src/main/`; only in `librarian-mcp/`

**Current state:** The only pre-inference eblet retrieval is in `ai_dispatch_ipc.ts` (`queryEbletStore`, not `pheromone_query`), but no UI routes through it. Product-facing paths (Lean Ask tab, `askFloorModel`, Conjunction Ollama adapter) all hit Ollama directly with the user prompt only. Mesh-test HOT path queries `substrate_router` cache (`/substrate/query`), not `mnem_eblet_store`.

**Recommended version:** v0.1.55

---

## R3: Andon discipline persists across sessions
**Status:** GAP
**File(s):**
- `src\main\substrate_router.ts` lines 329–339 (writes **every** successful Ollama response to disk with no verification check)
- `src\main\mnem_eblet_store.ts` lines 1–109 (read-only; no write gate at all)
- `src\main\ai_dispatch_ipc.ts` lines 29–32, 132–133 (`filtration_pipeline_enabled` persisted to `ai_dispatch_settings.json` but **never read** in query handler lines 147–228)
- `src\main\substrate_api.ts` lines 727–729 (write gate checks `degraded_mode` only, not verified-correct)
- `src\main\substrate_api.ts` lines 224–267 (`degradedMode` is in-memory; set from auth at `src\main\index.ts` lines 3941–3942)
- `src\main\services\SubstratedFolderWatcher.ts` lines 210–244 (mints eblets on any file event; no correctness gate; log persists to `substrated_eblet_log.json`)

**Current state:** No mechanism rejects failed/unverified answers before caching. Worse: `substrate_router` actively caches unverified Ollama output to `%APPDATA%/AMPLIFY Computer/substrate/substrate_cache.jsonl` (persists across restarts). `filtration_pipeline_enabled` is a UI toggle with no backend enforcement. Andon-style "failed answers MUST NOT cache" is not implemented.

**Recommended version:** v0.1.55

---

## R4: Mesh sharing opt-in per eblet
**Status:** GAP
**File(s):**
- `src\renderer\components\SettingsTab.tsx` lines 1126–1150 (global `federation_exchange_enabled` ON/OFF toggle)
- `src\main\ai_dispatch_ipc.ts` lines 31, 134 (setting persisted; **never consumed** by federation code)
- `src\main\federation_client.ts` lines 141–145, 269–296 (`queueWrite` / `_flushPendingWrites` — batches all records to LB cooperative API with no per-record share flag or settings check)
- `src\main\substrate_api.ts` line 745 (`this.federation?.queueWrite(record)` on every `/substrate/write`)
- `src\shared\federation-protocol.ts` lines 41–42, 83–89 (`sync_request` / `sync_response` — record bulk exchange, no per-eblet share field)
- `src\shared\federation-protocol.ts` line 60 (`assist_state_mirror` — STUBBED)
- `src\main\federation\relay-client.ts` lines 85–94 (routes envelopes; no eblet share semantics)
- `src\main\federation\peer-discovery.ts` lines 1–10 (transport discovery only)
- **Folder-level only (not mesh per-eblet UI):** `src\main\pantheon\types.ts` lines 22–23, 58 (`sharing_scope: 'private' | 'federation'` stamped at dispatch time, not per-eblet toggle in federation protocol)

**Current state:** Sharing is either all-or-nothing (global settings toggle, unwired) or folder-level Pantheon dispatch scope. Federation sync exchanges whole `SubstrateRecord` batches without per-eblet opt-in in the wire protocol. No per-eblet share toggle in mesh UI or relay path.

**Recommended version:** v0.1.56

---

## R5: Test It Out grows local substrate
**Status:** v0.1.57 scope (not a v0.1.55 gap)
**File(s):**
- No component named "Test It Out" in `src/renderer/**`
- Nearest scaffolding: `src\renderer\components\Bp067FirstRunSpine.tsx` lines 87–119 (`try-it` step calls `askFloorModel`, no eblet write-back)
- `src\renderer\components\Layer2ProveIt.tsx` (proof/benchmark UI; marketing copy references substrate; no eblet write IPC)
- `src\main\index.ts` lines 3066–3103 (`run-mesh-test` writes results JSON to `~/.mnemosynec/test-data/mmlu-pro/results/`, not eblet store)
- `src\renderer\components\GauntletProofStep.tsx` line 213 (calls `runMeshTest`; no accept → eblet pipeline)

**Current state:** "Test It Out" scaffolding from BP080 product vision is absent. Existing try-it / Prove It / mesh-test flows measure or demo AI but do not write accepted answers back to local verified eblet store.

**Recommended version:** v0.1.57 — not a v0.1.55 gap.

---

## Orthogonal drift caught

| Issue | Location | Impact |
|-------|----------|--------|
| **Two disconnected substrate stores** | `mnem_eblet_store.ts` (hardcoded `Asteroid-ProofVault`) vs `substrate_router.ts` (`%APPDATA%/AMPLIFY Computer/substrate/`) vs Pantheon (`~/.lb_substrate/tablets/`) | Retrieval and accumulation paths don't share one store |
| **Hardcoded Founder path** | `mnem_eblet_store.ts` line 13 | Packaged installs return `[]` (lines 6–9, 94–95) — accumulator non-functional for end users |
| **Settings flags are UI-only** | `filtration_pipeline_enabled`, `federation_exchange_enabled`, `mnem_drt_specialists` in `ai_dispatch_ipc.ts` / `SettingsTab.tsx` | Toggles persist but don't change runtime behavior |
| **`ai_dispatch` IPC orphaned** | Preload lines 822–832; zero renderer callers | Pre-inference retrieval exists only as dead code |
| **Unverified auto-cache contradicts Andon** | `substrate_router.ts` 329–339 | Failed/wrong answers can enter persistent substrate on AI burst |
| **Version drift** | `package.json` line 3: `"version": "0.1.53"` | Codebase is two minor versions behind wave label |
| **Spider "accept" ≠ plow accept** | `spider_registry.ts` 419–420 | `pheromone_links_written` counts graph links, not verified Q&A eblets |
| **Federation mirror stubbed** | `federation-protocol.ts` line 60 | `assist_state_mirror` documented as STUBBED — no partner eblet replication |

---

## Summary matrix

| Req | Status | v0.1.55 blocker? |
|-----|--------|-----------------|
| R1 Plow accept → eblet write | **GAP** | Yes |
| R2 Pre-inference eblet retrieval on HOT path | **GAP** | Yes |
| R3 Andon gate persisted | **GAP** | Yes |
| R4 Per-eblet mesh share toggle | **GAP** | No (v0.1.56) |
| R5 Test It Out write-back | **v0.1.57 scope** | No |
