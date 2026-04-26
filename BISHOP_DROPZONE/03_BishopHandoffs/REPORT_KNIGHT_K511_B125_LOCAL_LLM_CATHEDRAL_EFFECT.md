# REPORT: K511 — Local-LLM Cathedral Effect Empirical Test
**Knight session:** K511 | **Bishop session:** B125 | **Date:** 2026-04-26

---

## Status

**Phase A — Environment Setup:** COMPLETE ✓ (GPU enabled via Vulkan)
**Phase B — Harness Fork:** COMPLETE ✓ (commit b4b0e4a)
**Phase C — Full Benchmark Run:** IN PROGRESS ✓ (100 calls, ~11-15 hr wallclock)
**Phase D — Grading + Comparison:** PENDING (runs after Phase C)
**Phase E — Report + Tag:** PENDING

---

## ✓ HARDWARE RESOLVED — GPU ACTIVE via Vulkan

~~## ⚠ HARDWARE BLOCKER — ACTION REQUIRED FROM FOUNDER~~

**Finding:** Initial Ollama startup defaulted to `100% CPU`. Root cause: AMD ROCm (bundled in Ollama) does NOT support gfx1201 (RDNA 4, RX 9070 XT). Both GPU devices "failed to fully initialize" in ROCm mode. HSA_OVERRIDE_GFX_VERSION attempts (11.0.0, 12.0.1) did not resolve ROCm initialization.

**Resolution:** Ollama's **experimental Vulkan backend** (`OLLAMA_VULKAN=1`) successfully detects and uses the RX 9070 XT via AMD's Vulkan driver (which has full RDNA 4 support). GPU active with 13.4 GiB available VRAM.

| Setting | Value |
|---|---|
| OLLAMA_VULKAN | 1 |
| GGML_VK_VISIBLE_DEVICES | 0 (discrete GPU only — prevents iGPU split) |
| OLLAMA_KEEP_ALIVE | 60m |
| Processor split | 69% CPU / 31% GPU (partial offload) |
| VRAM used | ~13 GiB of 15.8 GiB dedicated VRAM |

**Startup script committed:** `librarian-mcp/r10_cross_vendor/start_ollama_gpu_k511.ps1`

**Calibration (first GPU call):**
- Q1 cold: MISS | **185.6s** | in=76 out=87 tokens (vs 228-733s on CPU-only)
- Estimated cold pass (50 Qs): ~2.5 hr
- Estimated cathedral pass (50 Qs, 15K-token input): ~8-12 hr
- **Total wallclock estimate: 11-15 hr** (within K511 spec's "12-24 hr")

---

---

## Phase A: Environment Setup

| Check | Result |
|---|---|
| Ollama installed | ✓ v0.21.2 (winget install Ollama.Ollama) |
| Ollama serve | ✓ Running at localhost:11434 |
| Disk available | ✓ 1,101 GB free (C:) |
| Model pull | ✓ `llama3.3:70b-instruct-q4_K_M` — 42 GB at ~100-110 MB/s (complete) |
| Dry-run harness | ✓ 50 questions × 2 conditions = 100 calls validated |
| Bank & corpus | ✓ `R12_QUESTION_BANK_CRANEWELL_SEALED.json` (50 Qs) + `r12_cranewell_corpus.md` (57,693 chars) |
| **GPU** | ✓ **AMD Radeon RX 9070 XT (gfx1201)** — active via Vulkan backend (not ROCm) |
| Processor split | 69% CPU / 31% GPU (partial offload, 13.4 GiB VRAM) |

**Ollama health check:** Passed (HTTP 200 at /api/tags)
**Model tag confirmation:** `llama3.3:70b-instruct-q4_K_M` (exact match to R13 prompt spec)

**GPU activation path:**
1. Initial: `100% CPU` (ROCm fails on gfx1201 RDNA 4)
2. Tried: `HSA_OVERRIDE_GFX_VERSION=11.0.0` → still fails ("didn't fully initialize")
3. Tried: `HSA_OVERRIDE_GFX_VERSION=12.0.1` → still fails
4. **Solution:** `OLLAMA_VULKAN=1` + `GGML_VK_VISIBLE_DEVICES=0` → `69%/31% CPU/GPU` ✓

**Smoke test (GPU, cold Q1):**

| Question | Condition | Grade | Latency | Tokens in/out |
|---|---|---|---|---|
| R12C-CS-01 | cold | MISS | 185.6s | 76/87 |

Phase C full run launched immediately after. All subsequent calls will use GPU Vulkan acceleration.

---

## Phase B: Harness Fork

Files created:
- `librarian-mcp/r10_cross_vendor/adapters/ollama_adapter.py` — Ollama HTTP adapter
  - Calls `/api/chat` (system + user message format, mirrors R13 cloud adapters)
  - Temperature 0.0, num_predict=800
  - Tracks `prompt_eval_count` / `eval_count` for token reporting
  - No API key required; `cost_usd = 0.0` (local compute)
  - `health_check()` and `list_models()` helpers for pre-run validation
- `librarian-mcp/r10_cross_vendor/run_local_llm_k511.py` — R13 harness fork, Ollama only
  - Same bank/corpus/grading as R13 (identical three-tier HOT/HIT/MISS rubric)
  - Output directory: `results_local_llm_k511/`
  - Resume support (auto-skips completed question IDs)
  - Progress report every 10 calls
  - Abort on 5 consecutive errors
  - Final summary prints lift vs cold + R13 reference comparison
- `librarian-mcp/r10_cross_vendor/grade_local_llm_k511.py` — Phase D grader
  - Deterministic stats from existing grades
  - LLM cross-check: Haiku 4.5 + Gemini 3.1 Flash Lite (100% of records, ~$0.10)
  - Cohen's kappa (det vs Haiku, det vs Gemini)
  - Side-by-side comparison vs R13 summary

**Commit:** `b4b0e4a` — `feat(k511): Phase B harness fork -- local LLM cathedral benchmark`

---

## Phase C: Full Benchmark Run

**Command:** `python run_local_llm_k511.py` (100 calls, both conditions)
**Start time:** _to be filled_
**Estimated completion:** _to be filled_
**Output path:** `librarian-mcp/r10_cross_vendor/results_local_llm_k511/`

**Smoke test (5 questions):**

| Question | Condition | Grade | Latency |
|---|---|---|---|
| _to be filled_ | cold | ___ | ___ s |
| _to be filled_ | cold | ___ | ___ s |
| _to be filled_ | cold | ___ | ___ s |
| _to be filled_ | cold | ___ | ___ s |
| _to be filled_ | cold | ___ | ___ s |
| _to be filled_ | cathedral | ___ | ___ s |
| _to be filled_ | cathedral | ___ | ___ s |
| _to be filled_ | cathedral | ___ | ___ s |
| _to be filled_ | cathedral | ___ | ___ s |
| _to be filled_ | cathedral | ___ | ___ s |

**Cold pass smoke verdict:** _to be filled (expect 0/5 HOT)_
**Cathedral pass smoke verdict:** _to be filled (expect ≥3/5 HOT to confirm Cathedral Effect)_

---

## Phase D: Results (to be filled)

### Deterministic Results (HOT/HIT/MISS)

| Condition | HOT% | HIT% | MISS% | N | Avg Latency |
|---|---|---|---|---|---|
| cold | ___ | ___ | ___ | 50 | ___ s |
| cathedral | ___ | ___ | ___ | 50 | ___ s |
| **Cathedral lift** | **+___ pp** | — | — | — | — |

### R13 Comparison (same Cranewell bank, 8 cloud models)

| Metric | R13 Mean (8 cloud) | K511 (Llama 3.3 70B Q4) |
|---|---|---|
| Cold HOT% | ~0% (sealed) | ___ % |
| Cathedral HOT% | ~86% (mean) | ___ % |
| Lift (pp) | +86.2 pp | +___ pp |

### LLM Cross-Check (Phase D grader)

| Metric | Value |
|---|---|
| Records graded | 100 |
| LLM grading cost | ~$0.10 |
| Kappa (det vs Haiku 4.5) | ___ |
| Kappa (det vs Gemini Flash) | ___ |
| Agreement (det vs Haiku) | ___ % |
| Agreement (det vs Gemini) | ___ % |

---

## Phase E: Synapse Emissions (to be filled)

<!--
At least 12 synapses required per K511 Phase E spec.
Write to librarian-mcp Toolsmith after grading is complete.
-->

```
[SYNAPSE PLACEHOLDER — fill after Phase D grading]
```

---

## Conclusions (to be filled)

**Cathedral Effect confirmed on local LLM?** YES / NO / PARTIAL

**Layer-6 defense value:** _to be filled_

**Key findings:**
1. _to be filled_
2. _to be filled_
3. _to be filled_

---

## Files Produced

| File | Description |
|---|---|
| `librarian-mcp/r10_cross_vendor/adapters/ollama_adapter.py` | Ollama HTTP adapter |
| `librarian-mcp/r10_cross_vendor/run_local_llm_k511.py` | K511 benchmark harness |
| `librarian-mcp/r10_cross_vendor/grade_local_llm_k511.py` | Phase D grader |
| `librarian-mcp/r10_cross_vendor/results_local_llm_k511/` | Results directory |
| `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K511_B125_LOCAL_LLM_CATHEDRAL_EFFECT.md` | This report |

---

## Pending Founder Actions

None — K511 is fully autonomous after Phase B. Founder can monitor:
- Pull completion: check terminal for Ollama pull status
- Phase C: `python run_local_llm_k511.py` (resume-safe; auto-restarts from last completed question)
- Phase D: `python grade_local_llm_k511.py` (after Phase C completes, requires SDS.env loaded)
- Phase E: Synapse + commit + tag `v-local-llm-cathedral-test-K511`

---

*FOR THE KEEP!*
