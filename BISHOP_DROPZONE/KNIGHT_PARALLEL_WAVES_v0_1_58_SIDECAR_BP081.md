---
backlog: KNIGHT_PARALLEL_WAVES_v0_1_58_SIDECAR_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: TWO additional waves Knight can run in PARALLEL with the v0.1.58 main wave — zero merge-conflict risk. Velocity multiplier per Founder ASAP-to-v0.1.60 statement.
status: ACTIVE — Founder ratified BP081 2026-06-13 · Knight loads when ready
parent_backlog: KNIGHT_BACKLOG_FULL_PLOW_LOOP_v0_1_58_THROUGH_v0_1_60_BP081.md
parallel_with: v0.1.58 main wave (currently the next Knight wave queued)
merge_conflict_analysis:
  - "WAVE A (this doc) touches: src/renderer/components/SubstrateStatsTab.tsx (NEW FILE), src/renderer/components/MnemosyneTabView.tsx (add tab entry — single line addition)"
  - "WAVE B (this doc) touches: lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/ (NEW FILES), no existing source files"
  - "v0.1.58 main wave touches: src/main/plow/giant_concordance.ts (NEW), src/main/spider_registry.ts (R3), src/main/sprite_registry.ts (R3), src/main/mnem_eblet_store.ts (R3), src/renderer/components/TestItOutTab.tsx (concordance call), src/renderer/components/LeanAskTab.tsx (stale-message clear), src/main/index.ts (onboarding auto-flip)"
  - "OVERLAP: ONLY src/renderer/components/MnemosyneTabView.tsx — and only WAVE A adds a single TABS-array entry. Knight can serialize the merge of that single line."
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER."
  - "Forward-pressure ≠ verified-ratify (BP080)"
  - "Caithedral spelling enforced"
  - "Every-click visible feedback (BP078)"
  - "Long-running heartbeat (BP078)"
  - "Disk-backed canon (BP080) — for Wave B per-domain Q banks: NO Phase-10-P-style phantom claims. If a bank can't be built for a domain in this wave, surface explicitly and queue."
---

# Knight Parallel Waves · v0.1.58 Sidecar · BP081

Knight — Bishop. Founder wants velocity. These two waves run IN PARALLEL with your v0.1.58 main wave. Open two additional Cursor tabs (or worker sessions). Each tab fires Sonnet 4.6 SEGs on its scope. Zero merge conflict because the surfaces don't overlap with v0.1.58 main beyond a single line.

---

# §A — Wave A: Substrate Stats Tab (UI-only sidecar)

**Theme:** add a read-only dashboard tab so Founder + users can SEE their substrate growing in real time. Pure renderer, reads from existing eblet store (R1 already shipping). Zero touch on Plow loop / Giant / Spider / Sprite code paths v0.1.58 is changing.

**Why now:** today Founder has no visibility into the substrate accumulator. He installs MnemosyneC, runs Ask, runs Test It Out, but doesn't SEE the eblets accumulating. A visible dashboard makes the "Free + Accurate + Fast" claim tangible — and gives the marketing surface for the v0.1.60 Deep Test results.

## SEG-A1 · SubstrateStatsTab.tsx component (P0, **Sonnet 4.6**)

**Goal:** new tab in MnemosyneC that displays substrate stats live.

**Scope:**
- New file: `src/renderer/components/SubstrateStatsTab.tsx`
- Add single entry to TABS array in `src/renderer/components/MnemosyneTabView.tsx` (e.g., Tab 18, label "📊 Substrate")
- IPC handler in `src/main/index.ts`: `get-substrate-stats` — reads from eblet store (already exists from v0.1.56 SEG-4 R1)
- Preload binding: `window.amplify.getSubstrateStats()`
- Component renders:
  - **Total eblets** (count)
  - **Verified-correct count** (from R1 metadata)
  - **Last write** (relative time: "12 minutes ago")
  - **Top domains** (table: domain · eblet count · last write — for v0.1.59+ domain-tagged eblets)
  - **Recent writes** (list of last 10 with: question excerpt · provenance source · timestamp)
  - **Growth trend** (simple line chart: eblets added per day, last 30 days)
- Refresh button + auto-refresh every 30s when tab is visible
- Every-click visible feedback canon

**Edge cases:**
- Empty store (fresh install) → friendly empty state: "Your substrate is empty. Use Ask or Test It Out to grow it."
- Eblet store malformed → graceful error + diagnostic link
- Quarantined eblets (from v0.1.58 SEG-2 R3 work) → show count separately

**Verify (runtime):**
- Install on M0, open Substrate tab
- Run 3 Ask queries → switch to Substrate tab → confirm count increases
- Run Test It Out → confirm growth trend updates
- Screenshot empty state + populated state + recent writes

## SEG-A2 · Stats IPC handler + eblet store query helper (P0, **Sonnet 4.6**)

**Goal:** the backend the Stats tab calls.

**Scope:**
- `src/main/index.ts`: `ipcMain.handle('get-substrate-stats', ...)` — reads eblet store JSONL, aggregates
- `src/main/mnem_eblet_store.ts`: add `queryStats(): SubstrateStats` helper — returns total / verified-count / last-write / top-domains / recent-writes / growth-trend
- Non-blocking, cached for 10s (avoid hammering JSONL read on every refresh)
- Returns structured JSON safe for renderer consumption

**Note:** this slightly extends `mnem_eblet_store.ts` which v0.1.58 SEG-2 (R3 Andon persistence) ALSO touches. To avoid conflict: this SEG adds a NEW function `queryStats()` — does NOT modify `writeVerifiedEblet()` or existing functions. Both can merge cleanly.

**Verify:** call `getSubstrateStats()` from a test harness, confirm structured response, confirm <50ms p95.

## SEG-A3 · Verify + ship Wave A inline (Sonnet 4.6)

Wave A is small enough to inline-verify within Knight's parallel tab session. No separate STAGING-UPLOAD — folds into next regular ship (v0.1.58 main wave OR v0.1.58.1 hotfix). Just confirm: TS clean, install renders Substrate tab, basic functionality works.

---

# §B — Wave B: 14 Per-Domain MMLU-Pro Q Banks (data-only sidecar)

**Theme:** the v0.1.59 SEG-2 scope IS data engineering, not code. Build the 14 per-domain Q banks IN PARALLEL with v0.1.58 main wave. Zero touch on any TypeScript source file. Pure data work in `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/`. When v0.1.59 fires its real wave, Spider fan-out + Andon re-plow have working data immediately.

**Why now:** per-domain Q bank construction is the slowest, most curation-heavy part of v0.1.59. Doing it in parallel WITH v0.1.58 saves a full Knight wave of wall-clock when v0.1.59 starts.

**Disk-backed canon binding (BP080):** every claim of "domain X bank exists" must have a verifiable disk path with sha256 receipt. NO Phase-10-P-style aspirational claims. If a domain can't be built in this wave (insufficient upstream Qs, curation failure, etc.), surface explicitly + queue separately.

## SEG-B1 · HuggingFace fetch + per-domain split (P0, **Sonnet 4.6**)

**Goal:** pull MMLU-Pro from upstream HuggingFace, split into 14 per-domain files.

**Scope:**
- Source: `TIGER-Lab/MMLU-Pro` on HuggingFace
- Fetch path: Python script in `lb-reproducibility-pack/scripts/build_mmlu_pro_per_domain.py` (NEW)
- Output: `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/questions_raw.json` (one file per domain, raw split)
- 14 domains per BP080 mesh test methodology lock canon: Math, Physics, Chemistry, Biology, Computer Science, Engineering, History, Philosophy, Law, Business, Economics, Psychology, Health, Other
- Per-Q schema: `{ question, options, correct_answer, source_id, source_category, source_url }`
- Verify: count of Qs per domain, log any domain with <20 Qs

**Edge cases:**
- HuggingFace API rate limits → batched fetch + retry-with-backoff
- Some domains may have <20 Qs → log + flag for SEG-B2 augmentation
- Schema drift from upstream → defensive parsing + fail-loud on unexpected fields

## SEG-B2 · Curation + Andon-vetting per domain (P0, **Sonnet 4.6**)

**Goal:** vet each raw Q for Andon discipline — correct answer locked, no ambiguity, no broken multiple-choice.

**Scope:**
- New script: `lb-reproducibility-pack/scripts/curate_mmlu_pro_per_domain.py`
- For each raw Q: run an automated correctness pre-check (Gemma cold-call with strict prompt; if Gemma confidently disagrees with the recorded correct answer, flag for human review)
- Output: `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/questions_curated.json`
- Per-Q add: `{ ..., curation_pass: bool, curation_notes: str }`
- Target: per-domain ≥20 curation_pass=true Qs; if shortfall, log explicitly for v0.1.60 augmentation

**Verify:** count of curated Qs per domain matches or exceeds 20; log discrepancies.

## SEG-B3 · Sealed canonical Q banks + sha256 receipts (P0, **Sonnet 4.6**)

**Goal:** produce the FINAL sealed canonical Q bank files that Plow loop dispatches against, with disk-backed receipts.

**Scope:**
- New script: `lb-reproducibility-pack/scripts/seal_mmlu_pro_per_domain.py`
- For each domain: take curation_pass=true Qs → emit `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/questions.json` (final sealed format, matching schema of K533 smoke set)
- Generate sha256 receipt: `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/SEAL.sha256`
- Generate metadata: `<domain>/META.json` with: total_qs, curation_pass_count, seal_timestamp, seal_method, source_dataset_version
- Emit canon eblet receipt: `Asteroid-ProofVault/BP081_MMLU_PRO_PER_DOMAIN_SEALED_RECEIPT.eblet.md` with all 14 domain hashes

**Verify (disk-backed canon enforcement):**
- All 14 domain directories exist on disk with `questions.json` + `SEAL.sha256` + `META.json`
- Per-domain Q count ≥ 20 OR explicitly logged shortfall
- sha256 receipts verify when re-computed
- Canon eblet receipt written to ProofVault

## SEG-B4 · Plow runner adapter for per-domain dispatch (P1, **Sonnet 4.6**)

**Goal:** thin TypeScript helper that loads per-domain Q banks at runtime (used by v0.1.59 SEG-1 Spider fan-out + v0.1.60 Deep Test tab).

**Scope:**
- New file: `src/main/plow/per_domain_q_banks.ts`
- Functions: `loadDomainBank(domain): Question[]`, `getDomainList(): Domain[]`, `getDomainStats(domain): { qCount, lastSealHash }`
- Reads from `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/questions.json`
- Caches in-memory after first load

**Verify:** call `loadDomainBank('math')` from test harness, confirm Q list returned with expected schema.

---

## VERIFY / SHIP for Wave B

Wave B is data work + a thin TS loader. Verification = the disk-backed receipts pass sha256 check + the TS loader returns valid Q lists. No separate STAGING-UPLOAD; folds into v0.1.59 ship when that wave fires (the data is just READY by then).

---

# §C — Bishop notes on running these in parallel

## Conflict avoidance

The ONLY file both Wave A and v0.1.58 main wave touch is `src/renderer/components/MnemosyneTabView.tsx`:
- v0.1.58 SEG-4 (onboarding auto-flip) may touch this file to adjust tab visibility logic
- Wave A SEG-A1 adds a single TABS-array entry

**Knight resolution:** serialize the merge of MnemosyneTabView.tsx changes — finish v0.1.58 SEG-4 first, then merge Wave A's TABS entry on top. 30-second rebase, zero conflict.

Wave B touches NO files that v0.1.58 main wave touches. Independent.

## Velocity gain

- Without parallel waves: v0.1.58 → v0.1.59 → v0.1.60 serial. Each wave a few hours.
- With parallel waves: v0.1.58 main + Wave A + Wave B fire simultaneously. Wave A ships into v0.1.58.1 (a few hours after v0.1.58). Wave B's data is READY when v0.1.59 fires (saves the longest part of v0.1.59 wall-clock).
- Estimate: **2-3 days shaved off the v0.1.60 ship date.**

## Knight resource implication

- Open 3 Cursor tabs (or worker sessions)
- Each tab: explicit Sonnet 4.6 model selector (BP081 BLOOD STATUTE)
- Each tab: distinct SEG wave name in its yoke-returns ("v0.1.58 main", "Wave A Substrate Stats", "Wave B Per-Domain Banks")
- Bishop receives 3 independent yoke-return streams; Bishop sequences integration

## Founder action

- Paste path to this file to Knight for "open 2 more parallel tabs" instruction
- Knight loads + fires Wave A and Wave B parallel to v0.1.58 main
- When all three return GREEN, Knight serializes the MnemosyneTabView.tsx merge + sequences VERIFY + STAGING-UPLOAD for v0.1.58 main + folds Wave A into v0.1.58.1 staging
- Wave B data sits on disk waiting for v0.1.59 dispatch

— Bishop · BP081 · 2026-06-13
