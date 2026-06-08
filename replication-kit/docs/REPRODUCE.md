# Reproduction Guide -- BP077 Substrate Benchmark

**Canonical URL:** https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/bp077-substrate-proof-v1
**Date:** 2026-06-07

---

## 1. System requirements

| Requirement | Minimum | Tested configuration |
|---|---|---|
| Operating system | Windows 10 / Linux / macOS | Windows 10 (26200) |
| Python | 3.11+ | 3.13 |
| Ollama | 0.3.0+ | latest |
| RAM | 16 GB | 32 GB |
| Disk | 10 GB free | 20 GB |
| GPU | Optional (CPU fallback) | NVIDIA RTX series |

No external pip packages are required. The benchmark uses Python standard library only.

---

## 2. Install steps

### Step 1: Get the kit

```bash
git clone https://github.com/Upekrithen/LianaBanyanPlatform.git
cd LianaBanyanPlatform/replication-kit
```

Or download the release archive and unzip it:
```
https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/bp077-substrate-proof-v1
```

### Step 2: Verify Python version

```bash
python --version
# Must be >= 3.11
```

### Step 3: Install Ollama

Download from https://ollama.com and install for your platform.

### Step 4: Pull the model

```bash
ollama pull gemma2:12b
```

For a lighter test (less accurate, faster):
```bash
ollama pull llama3.1:8b
```

### Step 5: Verify Ollama is running

```bash
curl http://localhost:11434/api/tags
```

On Windows PowerShell:
```powershell
Invoke-WebRequest http://localhost:11434/api/tags | Select-Object -ExpandProperty Content
```

---

## 3. Run command

```bash
python run_n50_swarm_bp077.py --batch-mode --gap 15
```

### Flags explained

| Flag | Default | Meaning |
|---|---|---|
| `--batch-mode` | off | Forces `MIN_TIER=2` for all questions (more Operators per Q, more robust to rate limits) |
| `--gap 15` | 15.0 | 15-second inter-question pause (reduces rate-limit pressure) |
| `--output PATH` | `runs/BP077_GIANTS/results_bp077_phase7_swarm.jsonl` | Output JSONL path |
| `--start N` | 0 | Start at question index N (0-indexed) |
| `--end N` | 49 | End at question index N (0-indexed, inclusive) |
| `--verbose` | off | Verbose per-Operator output |
| `--dry-run` | off | Print questions that would run; no pipeline calls |

### Dry run first (recommended)

```bash
python run_n50_swarm_bp077.py --dry-run
```

This prints all 50 questions without making any API calls.

### Partial run (first 10 questions)

```bash
python run_n50_swarm_bp077.py --batch-mode --gap 15 --start 0 --end 9
```

---

## 4. Reading the results

### Output location

Results appear in `runs/BP077_GIANTS/` as they are generated:
- `results_bp077_phase7_swarm.jsonl` -- primary per-question JSONL output
- `giants_trace_*.txt` -- detailed per-question pipeline traces

### Per-question JSONL schema

Each line is a JSON object:
```json
{
  "q_idx": 1,
  "question": "Who wrote 'No Man Is an Island'?",
  "domain": "literary",
  "run_ts": "2026-06-07T00:00:00+00:00",
  "ts": "2026-06-07T00:00:01+00:00",
  "pipeline": "staggered_swarm",
  "tier": 2,
  "bmv": 87.5,
  "concordance": "ABSOLUTE",
  "latency": 18.3,
  "all_pass": true,
  "gate_fact": true,
  "gate_conc": true,
  "gate_bmv": true,
  "gate_latency": true,
  "operator_count": 8,
  "active_count_peak": 5,
  "new_eblets_from_swarm": 12,
  "eblet_count": 15,
  "cluster_count": 4,
  "error": null
}
```

### Gate definitions (4 gates for all_pass=true)

| Gate | Key | Threshold | Meaning |
|---|---|---|---|
| G1 | `gate_fact` | concordance != "UNKNOWN" | Swarm reached a factual answer |
| G2 | `gate_conc` | concordance in {"ABSOLUTE","HIGH","MEDIUM"} | Multiple clusters agree |
| G3 | `gate_bmv` | bmv >= 60 | Banyan Metric Value meets quality floor |
| G4 | `gate_latency` | latency <= 45.0 | Completed within 45-second wall-clock budget |

### Summary statistics

Run this Python snippet to summarize results:
```python
import json
from pathlib import Path

results_file = Path("runs/BP077_GIANTS/results_bp077_phase7_swarm.jsonl")
rows = [json.loads(line) for line in results_file.read_text().splitlines() if line.strip()]
passed = sum(1 for r in rows if r.get("all_pass"))
print(f"PASS: {passed}/{len(rows)} ({100*passed/len(rows):.1f}%)")

by_domain = {}
for r in rows:
    d = r.get("domain", "unknown")
    by_domain.setdefault(d, {"pass": 0, "total": 0})
    by_domain[d]["total"] += 1
    if r.get("all_pass"):
        by_domain[d]["pass"] += 1

for domain, stats in sorted(by_domain.items()):
    pct = 100 * stats["pass"] / stats["total"] if stats["total"] else 0
    print(f"  {domain:20s}: {stats['pass']}/{stats['total']} ({pct:.0f}%)")
```

---

## 5. Rate-limit guidance

The `--gap 15` flag inserts a 15-second pause between questions. This is recommended for production runs to avoid rate-limit bursts from the Ollama local server. If you see repeated `ERROR` rows in your JSONL, increase the gap:
```bash
python run_n50_swarm_bp077.py --batch-mode --gap 30
```

---

## 6. Variance tolerance

Results are expected to match published receipts within:
- **5-10% tolerance** on per-domain accuracy (rate-limit variance, model temperature)
- **BMV scores** within +/- 10 points per question
- **Concordance level** identical on unambiguous questions (literary, geodata, etc.)

High-variance domains: `mathematical`, `physics_constant` (numeric precision sensitivity)
Low-variance domains: `literary`, `art`, `music` (deterministic historical attribution)

---

## 7. Comparing to receipts

Compare your run to the published receipts in `receipts/`:
- `swarm_proof_*.json` -- gate-level summaries from the original BP077 runs
- `results_bp077_phase7_close_50_50.jsonl` -- full 50-Q phase 7 close results

---

## 8. Contact / issues

File issues at the canonical repository:
https://github.com/Upekrithen/LianaBanyanPlatform/issues

Tag issues with `bp077-replication` for triage.
