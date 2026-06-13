# BP080 Mesh Test Launch Checklist
**Authored:** SEG-GPQA-INTEGRATION (Sonnet 4.6, Statute §3) · BP080 · 2026-06-11
**Purpose:** Three-pass benchmark schedule for M1/M2/M3 mesh COLD-vs-HOT test.
**Gate:** All three passes are gated on v0.1.46 Ollama bundle fix + clean-machine verify on M2 or M3.

No em-dashes anywhere in this document.

---

## Pre-flight (mandatory before any pass)

- [ ] v0.1.46 ships + Founder installs on clean machine (M2 or M3 -- no pre-existing Ollama)
- [ ] M2 and M3 confirm Gemma 4 12B reachable via Ollama (`ollama run gemma4:12b "hello"`)
- [ ] Substrate server running on M1 at `http://127.0.0.1:11480/substrate/query`
- [ ] M1 dataset cache exists:
  - `~/.mnemosynec/test-data/mmlu-pro/standard/mmlu_pro_standard.json` (12,032 questions)
  - `~/.mnemosynec/test-data/mmlu-pro/diamond/mmlu_pro_diamond.json` (2,782 questions)
  - `~/.mnemosynec/test-data/gpqa-diamond/gpqa_diamond.json` (~448 questions) -- see GPQA auth gate below
- [ ] All shard manifests generated (see shard commands below)

---

## GPQA Diamond Auth Gate

GPQA Diamond (`Idavidrein/gpqa`) is a gated dataset on Hugging Face. Download requires:

1. Create or log in to a Hugging Face account.
2. Visit `https://huggingface.co/datasets/Idavidrein/gpqa` and click "Access repository" to accept CC BY 4.0 + dataset terms.
3. Create a read token at `https://huggingface.co/settings/tokens`.
4. Authenticate: run `huggingface-cli login` OR pass `--token hf_YOUR_TOKEN` to the script.
5. Run: `python scripts/download_gpqa_diamond.py`

Script path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\scripts\download_gpqa_diamond.py`
Expected output: ~448 questions, ~600 KB, metadata.json with SHA-256.

Until this auth step is completed, Pass 2 (GPQA Diamond) cannot run.
Truth-Always: as of BP080, HF account is not authenticated on this machine.

---

## Shard Generation Commands

Run on M1 before each pass:

```
# Pass 1: MMLU-Pro standard
python scripts/mesh_shard.py --dataset mmlu-pro

# Pass 2: GPQA Diamond (requires download first)
python scripts/mesh_shard.py --dataset gpqa-diamond

# Pass 3: MMLU-Pro Diamond (internal subset)
python scripts/mesh_shard.py --dataset mmlu-pro-diamond
```

---

## Pass 1: MMLU-Pro Standard

| Field | Value |
|---|---|
| Dataset | MMLU-Pro standard (TIGER-Lab/MMLU-Pro, test split) |
| Questions | 12,032 |
| Est. wall-clock | ~5h at 3 nodes (4,010 questions per node) |
| Google target | 77.2% (Gemma 4 12B published accuracy) |
| Shard dir | `~/.mnemosynec/test-data/mmlu-pro/shards/` |
| Results dir | `~/.mnemosynec/test-data/mmlu-pro/results/` |
| Model | gemma4:12b |

Shard command: `python scripts/mesh_shard.py --dataset mmlu-pro`

Run command (per node):
```
# M1 (localhost)
python scripts/mesh_test_runner.py --shard ~/.mnemosynec/test-data/mmlu-pro/shards/shard_M1.json --node M1 --model gemma4:12b --dataset mmlu-pro

# M2
python scripts/mesh_test_runner.py --shard ~/.mnemosynec/test-data/mmlu-pro/shards/shard_M2.json --node M2 --model gemma4:12b --dataset mmlu-pro

# M3
python scripts/mesh_test_runner.py --shard ~/.mnemosynec/test-data/mmlu-pro/shards/shard_M3.json --node M3 --model gemma4:12b --dataset mmlu-pro
```

Checklist:
- [ ] Shards generated
- [ ] M1 started
- [ ] M2 started
- [ ] M3 started
- [ ] All three nodes complete
- [ ] `mesh_aggregate_results.py` run
- [ ] COLD accuracy vs 77.2% recorded
- [ ] HOT accuracy delta vs COLD recorded

---

## Pass 2: GPQA Diamond (real dataset -- apples-to-apples vs Google 78.8%)

| Field | Value |
|---|---|
| Dataset | GPQA Diamond (Idavidrein/gpqa, gpqa_diamond config) -- REAL dataset |
| Questions | ~448 (PhD-level Biology / Chemistry / Physics, Google-proof) |
| Est. wall-clock | ~30min at 3 nodes (~149 questions per node) |
| Google target | 78.8% (Gemma 4 12B published accuracy -- apples-to-apples comparison) |
| License | CC BY 4.0 |
| Source | https://huggingface.co/datasets/Idavidrein/gpqa |
| Shard dir | `~/.mnemosynec/test-data/gpqa-diamond/shards/` |
| Results dir | `~/.mnemosynec/test-data/gpqa-diamond/results/` |
| Model | gemma4:12b |
| Auth gate | HF login required + dataset terms accepted (see GPQA Auth Gate section above) |

Shard command: `python scripts/mesh_shard.py --dataset gpqa-diamond`

Run command (per node):
```
python scripts/mesh_test_runner.py --shard ~/.mnemosynec/test-data/gpqa-diamond/shards/shard_M1.json --node M1 --model gemma4:12b --dataset gpqa-diamond
```

Checklist:
- [ ] HF auth completed + `download_gpqa_diamond.py` ran successfully
- [ ] Row count ~448, metadata.json SHA-256 recorded
- [ ] Shards generated
- [ ] All three nodes complete
- [ ] Aggregate results computed
- [ ] COLD accuracy vs 78.8% recorded
- [ ] HOT accuracy delta vs COLD recorded
- [ ] Result inserted into Six Easy Steps L10 placeholder (Bishop dispatches insertion SEG once result lands)

---

## Pass 3: MMLU-Pro Diamond (optional -- internal high-difficulty subset)

| Field | Value |
|---|---|
| Dataset | MMLU-Pro Diamond (internal high-difficulty subset -- NOT the real GPQA Diamond) |
| Questions | 2,782 (filtered from MMLU-Pro by source prefix: professional + theoremQA + college) |
| Est. wall-clock | ~1.2h at 3 nodes (~927 questions per node) |
| Google target | No direct Google anchor for this subset; internal comparison only |
| Shard dir | `~/.mnemosynec/test-data/mmlu-pro/shards-diamond/` |
| Results dir | `~/.mnemosynec/test-data/mmlu-pro/results-diamond/` |
| Model | gemma4:12b |
| Note | This is an INTERNAL subset derived from MMLU-Pro. It is NOT GPQA Diamond. Do not conflate. |

Shard command: `python scripts/mesh_shard.py --dataset mmlu-pro-diamond`

Run command (per node):
```
python scripts/mesh_test_runner.py --shard ~/.mnemosynec/test-data/mmlu-pro/shards-diamond/shard_M1.json --node M1 --model gemma4:12b --dataset mmlu-pro-diamond
```

Checklist:
- [ ] Shards generated
- [ ] All three nodes complete
- [ ] Aggregate results computed
- [ ] Results labeled clearly as "MMLU-Pro Diamond (internal subset)" in any public claim

---

## Truth-Always Dataset Disambiguation

These are three distinct datasets. NEVER conflate them:

| Label | Source | Questions | Google anchor | Notes |
|---|---|---|---|---|
| MMLU-Pro standard | TIGER-Lab/MMLU-Pro (HF) | 12,032 | 77.2% Gemma 4 12B | Cached at mmlu-pro/standard/ |
| MMLU-Pro Diamond (internal subset) | Derived from MMLU-Pro via src_prefix filter | 2,782 | None (internal) | Cached at mmlu-pro/diamond/ -- NOT GPQA Diamond |
| GPQA Diamond (real) | Idavidrein/gpqa (HF, gated) | ~448 | 78.8% Gemma 4 12B | PhD-level Bio/Chem/Physics -- apples-to-apples with Google |

Prior mistake corrected: `mmlu_pro_diamond.json` was previously mislabeled "GPQA Diamond" in BP079 Coffee and related documents. That file is the MMLU-Pro internal subset, not the real GPQA dataset.

---

## Aggregate Results (fill in after each pass)

| Pass | Dataset | COLD accuracy | HOT accuracy | Delta | vs Google target | Date run |
|---|---|---|---|---|---|---|
| 1 | MMLU-Pro 12K | PENDING | PENDING | PENDING | target: 77.2% | -- |
| 2 | GPQA Diamond ~448 | PENDING | PENDING | PENDING | target: 78.8% | -- |
| 3 | MMLU-Pro Diamond 2.8K | PENDING | PENDING | PENDING | no anchor | -- |

---

*Staged for Bishop/Founder use. Not a public document.*
