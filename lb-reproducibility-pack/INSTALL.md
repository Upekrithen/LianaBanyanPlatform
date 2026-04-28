# Installation Guide — lb-reproducibility-pack

**Gate status:** Internal-only. Pre-Prov-14. Controlled-disclosure only.
Publication gate: `PACK_PUBLISHED=false` — no external distribution until Prov 14 + Founder fire.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.10+ | 3.11 or 3.12 recommended |
| pip | 22+ | `python -m pip install --upgrade pip` |
| Git | any | To clone the main repo |
| API keys | — | At least one vendor (Anthropic recommended for smoke) |

No Node.js required. The local Cathedral is pure Python.

---

## Step 1 — Navigate to the pack

```bash
# The pack lives in the main repo at the top level
cd lb-reproducibility-pack/
```

---

## Step 2 — Create a virtual environment (recommended)

```bash
python -m venv .venv

# macOS/Linux:
source .venv/bin/activate

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
```

---

## Step 3 — Install dependencies

```bash
python -m pip install -r requirements.txt
```

Dependencies: `anthropic`, `openai`, `google-generativeai`, `requests` (Perplexity).
All standard PyPI packages, pinned to tested versions.

---

## Step 4 — Configure API keys

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Required for smoke-test default conditions (cold_haiku, lb_cathedral_haiku):
ANTHROPIC_API_KEY=sk-ant-...

# Required for OpenAI conditions (cold_gpt4o_mini, chatgpt_memory, lb_cathedral_gpt4o_mini):
OPENAI_API_KEY=sk-...

# Required for Google conditions (cold_gemini_flash, gemini_gems, lb_cathedral_gemini_flash):
GOOGLE_API_KEY=...

# Required for Perplexity conditions (perplexity_spaces):
PERPLEXITY_API_KEY=pplx-...
```

**Minimum for smoke test:** `ANTHROPIC_API_KEY` only (smoke default uses 3 conditions:
`cold_haiku`, `claude_projects_sonnet`, `lb_cathedral_haiku` — all Anthropic).

---

## Step 5 — Generate reasonable tier dataset (first time only)

The reasonable tier corpus (75 facts) is extracted from the canonical full_k528 corpus
at setup time. Smoke and full tiers are pre-built and need no setup step.

```bash
python setup_datasets.py
```

Expected output:
```
=== Reasonable tier generation ===
Reading canonical corpus from datasets/full_k528/corpus_full_k528.md ...
  Parsed 150+ fact blocks from canonical corpus.
  Written 75 facts to datasets/reasonable/corpus_reasonable.md

=== Reasonable tier generation ===
  100 questions qualify for reasonable tier.
  Alignment check: all 100 questions verify against reasonable corpus. ✓
  Written 100 questions to datasets/reasonable/questions_reasonable.json

✓ Reasonable tier ready: 75 facts, 100 questions

Setup complete. Run `python run_benchmark.py --tier smoke` to verify installation.
```

---

## Step 6 — Run the smoke test

```bash
python run_benchmark.py --tier smoke --out results/smoke/
```

Expected output (with Anthropic key only):
```
=== lb-reproducibility-pack benchmark runner ===
  Tier:      smoke — 10 facts · 20 questions · ~$0.50-1.00 · ~5 min
  Corpus:    datasets/smoke/corpus_smoke.md (5,847 chars)
  Questions: datasets/smoke/questions_smoke.json (20 questions)
  Running 3 conditions: cold_haiku, claude_projects_sonnet, lb_cathedral_haiku

  Initializing local Cathedral client with corpus (5,847 chars)...
  Local Cathedral ready — 42 indexed segments.

--- cold_haiku (claude-haiku-4-5-20251001) ---
  [cold_haiku                     ] SMOKE-CS-01a    MISS  $0.00024
  ...

=== Results Summary ===
  cold_haiku                        HOT=  0.0%  cost=$0.0048  $/HOT=N/A
  claude_projects_sonnet            HOT= 75.0%  cost=$0.0890  $/HOT=0.006
  lb_cathedral_haiku                HOT= 70.0%  cost=$0.0062  $/HOT=0.000
  Total spend: $0.1000
```

**Smoke test passes if:**
- `cold_haiku` HOT% is 0-10% (cold baseline)
- `claude_projects_sonnet` HOT% is 60-90% (vendor-native corpus injection)
- `lb_cathedral_haiku` HOT% is 60-90% (local Cathedral retrieval)
- `lb_cathedral_haiku` $/HOT is 10-60× lower than `claude_projects_sonnet` $/HOT

---

## Verification checks

### C.2 — Smoke tier runs cleanly
```bash
python run_benchmark.py --tier smoke --conditions cold_haiku claude_projects_sonnet lb_cathedral_haiku --out results/c2_smoke/
```
Expected: results JSONL written, summary shows non-zero results.

### C.5 — Substitution flow (Acme example)
```bash
python run_benchmark.py --tier reasonable \
    --corpus sample_substitute_corpus/acme_corpus.md \
    --questions sample_substitute_corpus/acme_questions.json \
    --conditions cold_haiku lb_cathedral_haiku \
    --out results/c5_acme/
```
Expected: `lb_cathedral_haiku` HOT% significantly higher than `cold_haiku`.

### C.6 — Sovereignty contract (network trace)

**macOS/Linux:**
```bash
sudo tcpdump -n 'not (src host 127.0.0.1 and dst host 127.0.0.1)' -w sovereignty_trace.pcap &
TCPDUMP_PID=$!

python run_benchmark.py --tier smoke \
    --corpus sample_substitute_corpus/acme_corpus.md \
    --questions sample_substitute_corpus/acme_questions.json \
    --conditions lb_cathedral_haiku --out results/c6_sovereignty/

kill $TCPDUMP_PID
tcpdump -r sovereignty_trace.pcap -n | grep -E "lianabanyan|lb-server|telemetry"
# Expected: NO matches. Zero LB-server calls.
tcpdump -r sovereignty_trace.pcap -n | grep "api.anthropic.com"
# Expected: only Anthropic API calls
```

**Windows (PowerShell):**
```powershell
# Use Wireshark or netstat -b to monitor outbound connections
# Run benchmark, then filter log for any non-Anthropic destinations
Start-Process python -ArgumentList "run_benchmark.py --tier smoke --corpus sample_substitute_corpus\acme_corpus.md --questions sample_substitute_corpus\acme_questions.json --conditions lb_cathedral_haiku --out results\c6_sovereignty\" -Wait
# Inspect Windows Event Log or Wireshark capture
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| `ANTHROPIC_API_KEY not set` | Missing .env | Copy .env.example → .env, add key |
| `corpus not found` (reasonable tier) | setup_datasets.py not run | `python setup_datasets.py` |
| `429 Too Many Requests` | Rate limit | Increase `inter_query_sleep_s` in condition config |
| `chatgpt_memory BLOCKED` | OpenAI TPM ceiling | Known K528 finding — use `lb_cathedral_gpt4o_mini` instead |
| HOT% 0% for lb_cathedral | Local Cathedral empty | Verify `--corpus` path is correct |
| `ImportError: No module named 'anthropic'` | venv not activated | `source .venv/bin/activate` |

---

## Available conditions

```bash
python run_benchmark.py --list-conditions
```

---

*Gate: Internal-only until Prov 14 + Founder publish trigger. K533 / B131.*
