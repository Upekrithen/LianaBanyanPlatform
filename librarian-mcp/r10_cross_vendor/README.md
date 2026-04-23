# R10 Cross-Vendor Replication Benchmark

**SP-19 — Liana Banyan Eyewitness Benchmark**
K423 / B111 / April 2026

## What This Is

A benchmark measuring whether the R9 context-persistence architecture (the "Romulator 9000") produces accuracy gains across multiple AI vendors — not just Anthropic. Tests 8 models from 4 vendors on 75 questions about the Liana Banyan cooperative commerce platform.

## Quick Start

### 1. Install dependencies

```bash
cd librarian-mcp/r10_cross_vendor
pip install -r requirements.txt
```

Python 3.11+ required.

### 2. Set API keys

```bash
# Linux/Mac
export ANTHROPIC_API_KEY="sk-ant-..."
export GOOGLE_API_KEY="AI..."
export OPENAI_API_KEY="sk-..."
export PERPLEXITY_API_KEY="pplx-..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
$env:GOOGLE_API_KEY = "AI..."
$env:OPENAI_API_KEY = "sk-..."
$env:PERPLEXITY_API_KEY = "pplx-..."
```

### 3. Dry run (no API calls)

```bash
python run_benchmark.py --dry-run
```

### 4. Full run

```bash
python run_benchmark.py
```

Budget cap: $80 total. Auto-aborts at $75 cumulative to leave margin for grading.

## CLI Options

| Flag | Description | Default |
|---|---|---|
| `--vendor` | Run single vendor: anthropic, google, openai, perplexity | all |
| `--model` | Run specific model (requires --vendor) | both tiers |
| `--condition` | hot or cold only | both |
| `--n` | Number of questions (subset) | 75 |
| `--out` | Output directory | results/run_{timestamp} |
| `--dry-run` | Print plan without API calls | off |
| `--no-grade` | Skip grading (inference only) | grades by default |
| `--checkpoint-after` | Interim table after N vendors | 2 |

## Examples

```bash
# Single vendor test
python run_benchmark.py --vendor anthropic --n 5

# Quick smoke test (2 questions, dry run)
python run_benchmark.py --n 2 --dry-run

# Full Anthropic run, skip other vendors
python run_benchmark.py --vendor anthropic

# Inference only, grade later
python run_benchmark.py --no-grade
```

## Output Structure

```
results/run_{timestamp}/
├── anthropic_claude-haiku-4-5-20251001_hot.jsonl
├── anthropic_claude-haiku-4-5-20251001_cold.jsonl
├── anthropic_claude-opus-4-7_hot.jsonl
├── anthropic_claude-opus-4-7_cold.jsonl
├── google_gemini-2.5-flash_hot.jsonl
├── ... (one JSONL per vendor×model×condition)
├── all_graded.jsonl
├── cost_log.csv
├── summary.json
├── R10_RESULTS_B111.md          ← comparison table
├── INTERIM_2_VENDORS.md         ← checkpoint after first 2 vendors
└── ABORTED_reason.md            ← only if budget cap hit
```

## Model Matrix

| Vendor | Cheap Tier | Premium Tier |
|---|---|---|
| Anthropic | claude-haiku-4-5-20251001 | claude-opus-4-7 |
| Google | gemini-2.5-flash | gemini-2.5-pro |
| OpenAI | gpt-4o-mini | gpt-4o |
| Perplexity | sonar | sonar-pro |

## Grading

- Primary grader: Claude Haiku 4.5 (single-blind — no vendor info passed)
- Spot-check: Claude Opus 4.7 (10% stratified sample)
- Inter-rater agreement: Cohen's kappa reported in summary.json
- Rubric: Correct (1.0) / Partial (0.5) / Incorrect (0.0)

## Budget

| Threshold | Action |
|---|---|
| Cumulative $75 | Abort run |
| Single vendor projected >$25 | Abort that vendor |
| API down >30 min | Skip vendor, continue |

## Replication

This benchmark is designed to be run by someone other than the author:

1. Clone the repo
2. `pip install -r requirements.txt`
3. Set your own API keys as env vars
4. `python run_benchmark.py`
5. Your results JSONL format matches the canonical run for comparison

Total run time: ~4-6 hours depending on rate limits and model latency.
