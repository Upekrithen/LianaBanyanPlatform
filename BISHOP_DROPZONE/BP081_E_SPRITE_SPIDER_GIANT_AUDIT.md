---
audit: BP081_E_SPRITE_SPIDER_GIANT_AUDIT
composed_at: 2026-06-13
composed_by: Bishop SEG (Sonnet 4.6)
purpose: assess readiness of mesh for domain-scattered "get-it-right-the-last-time" Plow learning
---

# E-Sprite / E-Spider / E-Giant Audit · BP081

## §1 Spider registry — current state

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\spider_registry.ts`

Header declares: `// Shadow E-Spider Registry — Bushel 60 Phase C (BP030)`

**Exported types / functions:**
- `SpiderRequest` — drift traversal config (anchor_id, drift_budget, attach_threshold, uncertainty_low/high, per_round_topk, frame_target)
- `SpiderReceipt` — termination receipt (drift rounds, candidates probed, anchors attached, pheromone links written/reinforced, similarity distribution)
- `PheromoneLink` — per-link JSON substrate record (source/dest anchor, similarity, access_count, chronos_pane)
- `SpiderDispatchInput` — simplified dispatch facade
- `runSpider(req)` — full drift-traversal core (FAISS sidecar via `http://127.0.0.1:8765/similar`)
- `dispatchSpider(input)` — registry facade entry point
- `reinforcePheromoneLink(args)` — write-or-reinforce pheromone links
- `listPheromoneLinks()` — read all persisted links
- `ensureSpiderSubstrateLayout()` — creates `~/.lb_substrate/spider_web/links/` etc.

**SEG-4 hook (v0.1.56):** On completed drift with attached anchors → calls `writeVerifiedEblet()`. Confirmed shipped.

**Architecture:** FAISS Python sidecar (sentence-transformers) + filesystem substrate bus. Drift traversal is deterministic top-K cosine (v1). Uncertainty band 0.55–0.70: v1 abstains and counts skips (Sonnet-small adjudication is promotion-path, NOT shipped).

**No per-domain routing inside spider_registry.ts.** Single-anchor dispatch; no domain parameter.

---

## §2 Sprite registry — current state

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\sprite_registry.ts`

Header declares: `// Shadow E-Sprite Registry — Bushel 60 Phase B (BP030)`

**Exported types / functions:**
- `SpriteDispatch` — dispatch record (dispatch_id, package_path, source/destination_cluster, lock_signature, destination_path_pattern, redundancy_count, candidate_dropzones)
- `SpriteDeliveryReceipt` — delivery outcome (first_delivery_timestamp, delivery_success, redundant_recall_count)
- `ColdStartReceipt` — cold-start canary gate
- `UpdateReceipt` — in-flight dispatch update
- `SpriteRegistry` (class) — queue watcher, `dispatchSprites()`, `coldStartHandshake()`, `updateDispatch()`, `recall()`
- `getSpriteRegistry()` — singleton accessor
- `computeLockSignature()`, `verifyLockSignature()` — two-factor pattern match
- `ensureSubstrateLayout()` — creates `~/.lb_substrate/sprite_queue/`, `sprite_active/`, `receipts/sprite/`

**SEG-4 hook (v0.1.56):** Delivery race winner → `writeVerifiedEblet()`. Confirmed shipped.

**Architecture:** First-success-wins with file-flag recall. N parallel sprite workers per dispatch (default redundancy_count). Deterministic shuffle per sprite (LCG seeded by index). Substrate IS the bus — no SSE, no broker.

**No per-domain routing inside sprite_registry.ts.** Cluster-to-cluster courier; domain concept absent.

---

## §3 E-variant existence — Spider / Sprite / Giant

### E-Spider
**Status: PRESENT (as "Shadow E-Spider")**

Files:
- `src\main\spider_registry.ts` — header: "Shadow E-Spider Registry" (the operational BP030 registry)
- `src\main\pantheon\personas\shadow_spiders.ts` — `ShadowSpidersPersona` (`displayName: 'Shadow E-Spiders'`); implements deep recursive crawl → Iron Tablets persona for Pantheon agent panel

No separate `e_spider_*.ts` file exists with that exact naming. The "E-Spider" IS `spider_registry.ts` (the Shadow E-Spider).

### E-Sprite
**Status: PRESENT (as "Shadow E-Sprite")**

Files:
- `src\main\sprite_registry.ts` — header: "Shadow E-Sprite Registry" (the operational BP030 registry)
- `src\main\pantheon\personas\shadow_sprites.ts` — `ShadowSpritesPersona` (`displayName: 'Shadow E-Sprites'`); lightweight surface-skim persona

No separate `e_sprite_*.ts` file exists. The "E-Sprite" IS `sprite_registry.ts` (the Shadow E-Sprite).

### E-Giant
**Status: PRESENT (as "Iron E-Giant") — in `the_shadow/` Python layer; NOT wired into TypeScript Plow loop**

Files:
- `the_shadow\iron_egiant_promotion.py` — full Iron E-Giant promotion ceremony (KN090/BP011). Handles LIGHTHOUSE position assignment, Wrasse Registry registration, Pheromone emit, `ShadowLifecycle` continuous-organism startup. 8 positions (alpha→theta). Write authority: canonical-eblet OK, cross-org iron tablet OK, cathedral-export NOT.
- `librarian-mcp\tests\test_shadow_iron_egiant.mjs` — test for Iron E-Giant
- `the_shadow\tests\test_bushel_16_pod_g_shadow_egiant_autonomous_building_bp021.py` — BP021 autonomous building test
- `.git\refs\tags\bushel-16-pod-g-shadow-egiant-autonomous-building-landed-bp021` — git tag confirming it landed

**Giant-as-verifier for Plow concordance:** NOT wired. `iron_egiant_promotion.py` handles Shadow→Iron-E-Giant LIGHTHOUSE promotion (cooperative protocol, BP011). It does NOT implement concordance scoring, multi-vote adjudication, or Andon stop-when-wrong logic. That role is handled by the BMV (Benchmark Validity score) concordance logic in `benchmarks/test_plowed_bp078.py` and `benchmarks/replow_andon_bp078.py` — which are Python benchmarking scripts, NOT wired into the live TypeScript Plow loop.

**`replication-kit\truth_single_giants_bp077.py`** — file IS present on disk (the memory note that it "didn't exist" was incorrect). File is 526KB — too large to read in full. The BP078 Phase 11 receipt notes "Question banks (bp077_phase8_*_mmlu_pro_REAL.json) were NOT found" and that `truth_single_bp076.py` requires `drt_team.eblet` which is absent from benchmarks. This confirms the Giant-class concordance verifier from BP077 is a replication-kit artifact (research harness), not wired into the live application Plow loop.

---

## §4 Domain-scatter infrastructure

### Per-domain routing
No domain-routing layer exists in the TypeScript application. `spider_registry.ts` and `sprite_registry.ts` operate on individual anchors / packages with no domain parameter. The `mesh_test_runner.py` (`scripts/mesh_test_runner.py`) defines `PLOW_ALL_CATEGORIES` (12 categories: math, physics, chemistry, biology, health, psychology, history, law, philosophy, economics, business, engineering) and `PLOW_SKIPPED_CATEGORIES` (`["cs", "other"]`), but this is a standalone Python benchmark runner operating against the Ollama sidecar — NOT integrated into the live Electron application dispatch path.

### MMLU-Pro 14-domain handling
No 14-domain routing in the live application. The `mesh_test_runner.py` routes by `--dataset mmlu-pro` / `--shard` flag but is standalone. The benchmark Phase B receipt (`BP078_PHASE11_TEST_AGAINST_PLOWED_SUBSTRATE_RECEIPT.eblet.md`) explicitly states: "Question banks (bp077_phase8_*_mmlu_pro_REAL.json) were NOT found on disk." Those files do NOT exist in the repo.

### Question banks status
- **Smoke set (20 Q):** `lb-reproducibility-pack\datasets\smoke\questions_smoke.json` — PRESENT. Sealed K533. 6 categories (canonical_statistics, architecture_mechanics, economic_governance, member_journey, regulatory_compliance, historical_precedent). These are Liana-Banyan cooperative-platform-specific questions, NOT MMLU-Pro academic domains.
- **Per-domain MMLU-Pro banks (14 domains):** `bp077_phase8_*_mmlu_pro_REAL.json` — ABSENT from disk. The BP078 Phase B receipt confirms this explicitly.
- **Test It Out tab (v0.1.57 SEG-2):** `src\renderer\components\TestItOutTab.tsx` — PRESENT. Smoke test only: 5 questions from unspecified bank (comment says "MMLU-Pro / R11 diagnostic"). No per-domain selection. Correct answers write to verified_eblets.jsonl via R1 path. State machine: idle → running → complete | error. History persisted. This is a 5-question workout, not a 14-domain MMLU-Pro harness.

### Mesh test runner
`scripts\mesh_test_runner.py` — PRESENT. Runs COLD vs HOT comparison per question shard. Substrate query via `http://127.0.0.1:11480/substrate/query` (TODO note in code: "substrate retrieval not wired if substrate server is not running"). Methodology lock per BP080: mmlu-pro → 5-shot-cot, gpqa-diamond → 0-shot-cot. Progress emit to `/mesh/progress/update`. This is the closest thing to a domain-scattered Plow runner but it is a Python script requiring manual invocation, not a UI-driven mesh-ready workflow.

---

## §5 Plow loop requirements map (R1-R5 + extras)

| Requirement | Status | File path / evidence |
|---|---|---|
| R1 verified eblet write | GREEN | `src\main\mnem_eblet_store.ts` `writeVerifiedEblet()` · wired in `spider_registry.ts` (Spider accept) + `sprite_registry.ts` (Sprite delivery winner) · v0.1.56 SEG-4 shipped |
| R2 HOT retrieve before LLM inference | GREEN | `src\main\ai_dispatch_ipc.ts` line 181–202 · `queryVerifiedEblets()` called unconditionally before Ollama · verified hits injected as context · v0.1.57 SEG-1 shipped |
| R3 Andon cross-session persistence | PARTIAL | `mnem_eblet_store.ts` uses `app.getPath('userData')/substrate/verified_eblets.jsonl` (survives restart) · but startup integrity check (quarantine malformed lines, stats surface) queued v0.1.58 SEG-1 per backlog |
| R5 substrate-warming Test It Out | PARTIAL | `src\renderer\components\TestItOutTab.tsx` present and wired · 5-question smoke only · no 14-domain MMLU-Pro banks on disk · question bank is cooperative-platform-specific 20-Q K533 set, not academic MMLU-Pro |
| Spider parallel-prospect per domain | RED | `spider_registry.ts` dispatches single-anchor drift only · no domain parameter · no parallel fan-out by domain · `dispatchSpider()` takes one `anchor_path` |
| Sprite first-win delivery | GREEN | `sprite_registry.ts` `dispatchSprites()` → N parallel sprites, first-success-wins via `wx` flag-file race · recall broadcast to siblings · fully wired |
| Giant concordance verifier (live loop) | RED | No Giant-class verifier wired into TypeScript Plow loop · `iron_egiant_promotion.py` is LIGHTHOUSE promotion ceremony (BP011), not a concordance adjudicator · BMV/concordance logic lives only in Python benchmark scripts (`benchmarks/test_plowed_bp078.py`, `benchmarks/replow_andon_bp078.py`) · not integrated into ai_dispatch_ipc.ts or TestItOutTab |
| Andon stop-when-wrong + re-plow loop | PARTIAL | Andon discipline enforced: `writeVerifiedEblet()` requires `verified: true` structurally · wrong answers structurally excluded from eblet store · BUT the active re-plow loop (failed → Spider → Sprite → Specialist → Andon → re-plow until correct) exists only in Python benchmark harness (`replow_andon_bp078.py`) · NOT wired in live app |
| Per-domain Q banks (14 MMLU-Pro) | RED | `bp077_phase8_*_mmlu_pro_REAL.json` explicitly absent per BP078 Phase 11 receipt · smoke set (20Q K533) is cooperative-platform-specific, not MMLU-Pro academic domains |
| Concordance-override (2-of-3 verifiers) | RED | No multi-vote concordance in live app · concordance logic exists only in Python benchmark scripts (keyword overlap scoring, not 2-of-3 verifier voting) · no Specialist-class override wired |
| Staggered swarm dispatch | RED | No staggered swarm in live app · `spider_registry.ts` drift is sequential per frontier node (not parallel staggered swarm) · `sprite_registry.ts` spawns N simultaneous sprites (not staggered) · no domain-level stagger |

---

## §6 Verdict

### Overall: PARTIAL

### What's shipped (GREEN):
1. **R1 — Verified eblet write** (`mnem_eblet_store.ts` + Spider accept + Sprite delivery winner) — v0.1.56 SEG-4
2. **R2 — HOT retrieve before LLM inference** (`ai_dispatch_ipc.ts` unconditional `queryVerifiedEblets()`) — v0.1.57 SEG-1
3. **Sprite first-win delivery** (`sprite_registry.ts` file-flag race, N-parallel workers, recall broadcast) — BP030 / v0.1.56
4. **E-Spider and E-Sprite registries** both PRESENT and wired as "Shadow E-Spider" and "Shadow E-Sprite" (BP030)
5. **Re-plow Andon loop (Python harness)** — `benchmarks/replow_andon_bp078.py` functional for offline runs
6. **Mesh test runner** — `scripts/mesh_test_runner.py` functional for COLD vs HOT measurement

### What's missing for domain-scattered "get-it-right-the-last-time":

**Gap 1 — Per-domain MMLU-Pro question banks absent (14 domains)**
- `bp077_phase8_*_mmlu_pro_REAL.json` do not exist on disk
- Only cooperative-platform-specific smoke set (20Q K533) exists
- Without question banks, domain-scattered learning cannot run
- **Recommendation:** Create `lb-reproducibility-pack\datasets\mmlu_pro\` with per-domain banks
- **Landing version: v0.1.59**

**Gap 2 — Giant concordance verifier not wired into live Plow loop**
- No concordance adjudicator in TypeScript application
- `iron_egiant_promotion.py` is LIGHTHOUSE promotion, not a concordance engine
- BMV/concordance scoring only exists in Python benchmark scripts
- The live `TestItOutTab.tsx` marks answers correct/wrong by exact-match against `correctAnswer` field — no multi-source concordance
- **Recommendation:** Wire concordance check (keyword-overlap or BM25 minimum viable) into `TestItOutTab.tsx` answer evaluation path; Giant-class proper (multi-vote) queues v0.1.60
- **Landing version (basic): v0.1.58; (multi-vote Giant): v0.1.60**

**Gap 3 — Spider parallel-prospect per domain absent**
- `spider_registry.ts` is single-anchor drift, no domain fan-out
- Domain-scattered Plow requires spawning one Spider per domain against relevant anchors
- **Recommendation:** Add `dispatchSpiderFanout(domains: string[], anchorsByDomain)` to `spider_registry.ts`; tie to mesh_test_runner domain categories
- **Landing version: v0.1.59**

**Gap 4 — Andon re-plow loop not wired in live app (close second-tier gap)**
- `replow_andon_bp078.py` exists but is a standalone Python benchmark script
- Live app has Andon discipline (no wrong-answer writes) but no re-plow trigger
- **Recommendation:** Port Andon re-plow to TypeScript and wire into `TestItOutTab.tsx` post-run
- **Landing version: v0.1.59**

**Gap 5 — R3 Andon cross-session persistence audit incomplete**
- App userData path is correct for persistence, but startup integrity check and stats surface not yet present
- **Landing version: v0.1.58 SEG-1** (already in backlog)

### Bishop estimate — version landing:
- **v0.1.58:** R3 Andon persistence audit (already queued) + minimal Giant concordance in TestItOutTab
- **v0.1.59:** Per-domain MMLU-Pro banks + Spider domain fan-out + Andon re-plow loop wired to live app
- **v0.1.60:** Multi-vote Giant concordance verifier (2-of-3) + staggered swarm dispatch + concordance-override

### On the E-prefix ("Excalibur-class" vs "Shadow-class"):
The E-prefix in context denotes **Shadow E-Spider** and **Shadow E-Sprite** — the operational BP030 registries. No separate "Excalibur-class" spider/sprite variant exists. The Iron E-Giant (BP011/KN090) is a separate LIGHTHOUSE-class entity in the Python Shadow layer, not an Excalibur variant. The "E-giant" for Plow concordance purposes is currently unbuilt in the live application.

---

*Bishop SEG · Sonnet 4.6 · BP081 · 2026-06-13*