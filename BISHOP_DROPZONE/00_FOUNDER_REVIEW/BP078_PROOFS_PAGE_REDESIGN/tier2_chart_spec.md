# Tier 2 Chart Specification

## Chart: RoseBush vs Paid Flagships (Multi-Dimension Grouped Bar)

**Title:** RoseBush (Free Gemma 4 12B + Mnem-DRT + mesh) vs Paid Flagship AI — Five Dimensions

**Chart type:** Grouped bar chart (one group per dimension, one bar per model)

**Models (bars within each group):**
1. RoseBush (local, free -- Gemma 4 12B + Mnem-DRT + mesh)
2. Claude 4 Opus (Anthropic)
3. GPT-4o (OpenAI)
4. Gemini 2.5 Pro (Google)
5. Llama 3.1 405B self-hosted

**Dimensions (groups):**

### Dimension 1: Factual Attribution Score (0-100)

| Model | Value | Source | Status |
|---|---|---|---|
| RoseBush | 98.0 | Phase 7 FINAL v6, BMV mean, N=50 | VERIFIED |
| Claude 4 Opus | PLACEHOLDER | Requires head-to-head run on same harness | UNVERIFIED |
| GPT-4o | PLACEHOLDER | Requires head-to-head run on same harness | UNVERIFIED |
| Gemini 2.5 Pro | PLACEHOLDER | Requires head-to-head run on same harness | UNVERIFIED |
| Llama 3.1 405B | PLACEHOLDER | Requires head-to-head run on same harness | UNVERIFIED |

**Pawn-fact-check action:** Run each flagship against `bp077_phase7_q50_bank.json` using equivalent factual-key grading. The BMV harness is not available for external models; a simplified factual-key-match grading (gate_fact only) is acceptable as a comparable proxy.

**Known public proxy (MMLU-Pro leaderboard, 2025-2026):**
- Claude 3.5 Sonnet / 3 Opus: ~73-80 on MMLU-Pro (source: MMLU-Pro paper leaderboard, scale.ai evals hub; Pawn-verify date before publishing)
- GPT-4o: ~73-76 on MMLU-Pro (source: OpenAI evals page 2025; Pawn-verify)
- Gemini 1.5 Pro: ~75 on MMLU-Pro (source: Google tech report 2025; Pawn-verify)
- Llama 3.1 405B: ~73 on MMLU-Pro (source: Meta AI blog 2024; Pawn-verify)

**CRITICAL NOTE:** MMLU-Pro and Phase 7 BMV are not the same measurement. Do not put MMLU-Pro numbers in the same bar as Phase 7 BMV numbers without a clear axis label distinction and caveat. Option A: leave UNVERIFIED bars as hatched/empty placeholder. Option B: show MMLU-Pro in a separate adjacent group labeled "MMLU-Pro (different harness)" with explicit caveat. Option B is more honest but more complex visually. Founder decides.

### Dimension 2: Monthly Cost (normalized, lower is better)

| Model | Value (USD/month, typical use) | Source | Status |
|---|---|---|---|
| RoseBush | 0 | Free, runs locally | VERIFIED |
| Claude 4 Opus | 200 to 400 | Anthropic API pricing, claude.ai Pro ~$20-$200; Opus API ~$15/MTok input; Pawn-verify current | PAWN-VERIFY |
| GPT-4o | 20 to 200 | OpenAI API pricing + ChatGPT Plus $20/mo; Pawn-verify current | PAWN-VERIFY |
| Gemini 2.5 Pro | 20 to 200 | Google AI Studio / Vertex pricing; Pawn-verify current | PAWN-VERIFY |
| Llama 3.1 405B self-hosted | 0 to 50 | Self-hosted = electricity only; hosted inference varies | PAWN-VERIFY |

**Visual treatment for cost:** Invert axis (lower = better) OR use absolute value bars with label "Lower is better" clearly marked. Show $0 bar for RoseBush in distinct green color.

### Dimension 3: Privacy Posture (categorical, not numerical)

Not suitable for a bar chart axis. Represent as color-coded icon column or table column adjacent to the chart:

| Model | Data leaves your machine? |
|---|---|
| RoseBush | No |
| Claude 4 Opus | Yes (Anthropic servers) |
| GPT-4o | Yes (OpenAI servers) |
| Gemini 2.5 Pro | Yes (Google servers) |
| Llama 3.1 405B self-hosted | No (if truly self-hosted) |

### Dimension 4: Latency (seconds, first complete response)

| Model | Value | Source | Status |
|---|---|---|---|
| RoseBush | 18.8 s mean | Phase 7 FINAL v6, includes full retrieval+synthesis | VERIFIED |
| Claude 4 Opus | 2 to 5 s | Anecdotal/community benchmarks; Pawn-verify with api-response-time.com or similar | PAWN-VERIFY |
| GPT-4o | 1 to 4 s | Anecdotal/community benchmarks; Pawn-verify | PAWN-VERIFY |
| Gemini 2.5 Pro | 1 to 3 s | Anecdotal/community benchmarks; Pawn-verify | PAWN-VERIFY |
| Llama 3.1 405B | 5 to 30 s | Hardware-dependent; Pawn-verify | PAWN-VERIFY |

**Caveat on latency:** RoseBush latency includes multi-source retrieval (5 to 25 sources consulted). Flagship API latency is network + inference only. These are different measurements. Label clearly or omit this dimension if confusion risk is high.

### Dimension 5: Mesh Shared Knowledge (binary)

| Model | Mesh capability | Value for bar |
|---|---|---|
| RoseBush | Yes, 20/20 hash-verified | 1 |
| Claude 4 Opus | No | 0 |
| GPT-4o | No | 0 |
| Gemini 2.5 Pro | No | 0 |
| Llama 3.1 405B | No (base model; could be added) | 0 |

**Visual treatment for mesh:** Binary indicator column or simple YES/NO table. Not a bar dimension.

---

## Recommended Simplified Chart (for production)

Given the heterogeneous measurement types, the cleanest production chart is:

**Two-panel chart:**

Panel A (bar): Factual Attribution Score (0-100 axis)
- RoseBush: 98.0 (solid bar, verified)
- Flagships: PLACEHOLDER hatched bars OR MMLU-Pro proxy with caveat label

Panel B (icon grid): Cost + Privacy + Mesh
- Rows: 5 models
- Columns: Cost tier ($0 / $20 / $200), Privacy (local / cloud icon), Mesh (Y/N)

**Caption:** "Phase 7 BMV (RoseBush) vs MMLU-Pro (flagships) are different benchmarks on different question sets. The BMV score reflects factual attribution with full retrieval; MMLU-Pro reflects multiple-choice reasoning. Direct numeric comparison is informative but not apples-to-apples. See caveat block."

---

## Pawn-Fact-Check Checklist

Before publishing Tier 2 chart:

- [ ] Verify Claude 4 Opus / Sonnet current API pricing ($/MTok)
- [ ] Verify GPT-4o current API pricing
- [ ] Verify Gemini 2.5 Pro current API pricing
- [ ] Verify MMLU-Pro scores for current flagship versions (not 2024 snapshots)
- [ ] Confirm flagship latency numbers from a consistent published source
- [ ] Confirm Llama 3.1 405B self-hosted cost/latency are documented from Meta or reputable benchmark source
- [ ] Decision: MMLU-Pro as proxy (Panel A, labeled) OR leave UNVERIFIED (Founder decides)
