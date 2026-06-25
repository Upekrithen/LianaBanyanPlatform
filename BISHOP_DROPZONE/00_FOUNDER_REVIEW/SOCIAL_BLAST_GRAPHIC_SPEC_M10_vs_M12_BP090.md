# SOCIAL BLAST GRAPHIC SPEC — M10 vs M12 Comparison
## File: SOCIAL_BLAST_GRAPHIC_SPEC_M10_vs_M12_BP090.md
## Status: SPEC ONLY — render after M12 42Q LONGHAUL receipt seals (~03:00–06:00 Central 2026-06-22)
## Bishop SEG: Sonnet 4.6 · BP090 · TRUTH-ALWAYS

---

## TARGET OUTPUT

- **Format:** PNG, square social
- **Dimensions:** 1200 × 1200 px (Instagram/LinkedIn/X compatible)
- **Background:** Dark substrate (#0d1117) — cooperative brand palette
- **Accent colors:** Cooperative green (#3fb950), amber (#e3b341), muted red (#f85149)
- **Font stack:** JetBrains Mono (numbers/code) + Inter (prose) — both open-source

---

## VISUAL SECTIONS (6 TOTAL)

### Section 1 — HEADLINE
**Position:** Top band, centered, ~15% height
**Text:**
```
Plow Loop 12 Mesh — v0.5.16
Individual Domain Pattern
```
**Style:** Inter Bold 48px, white on dark, 2-line stack

---

### Section 2 — SUB-HEADLINE
**Position:** Below headline, centered, ~8% height
**Text:**
```
{{ M12_ENSEMBLE }}% on MMLU-Pro 42Q stratified
4-peer LAN+WAN Dragon Harness · free local AI · zero paid API
```
**Style:** Inter Regular 28px, cooperative green (#3fb950)
**Placeholder:** `{{ M12_ENSEMBLE }}` — final ensemble accuracy % from M12 receipt

---

### Section 3 — SIDE-BY-SIDE ACCURACY BARS
**Position:** Upper-center block, ~20% height
**Layout:** Two large horizontal bars, labeled M10 (left) and M12 (right)

| Bar | Label | Value | Color |
|-----|-------|-------|-------|
| Left | M10 · 300s flat timeout | 59.5% | Amber (#e3b341) |
| Right | M12 · per-domain timeout + escalation | `{{ M12_ENSEMBLE }}`% | Green (#3fb950) |

- Bar fill proportional to value (max scale = 100%)
- Large numeral overlay on each bar: "59.5%" and "{{ M12_ENSEMBLE }}%"
- Thin annotation line at 60% threshold labeled "Pass A threshold"
- Sub-label under M10: "25/42 correct"
- Sub-label under M12: "{{ M12_CORRECT_OF_42 }}/42 correct"

**Placeholders:**
- `{{ M12_ENSEMBLE }}` — % accuracy
- `{{ M12_CORRECT_OF_42 }}` — raw correct count (integer, derive from receipt)

---

### Section 4 — PER-DOMAIN BREAKDOWN TABLE
**Position:** Center block, ~30% height
**Layout:** 14-row table, 4 columns

| Domain | M10 % | M12 % | Delta |
|--------|-------|-------|-------|
| math | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.math }}` | ± |
| physics | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.physics }}` | ± |
| chemistry | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.chemistry }}` | ± |
| biology | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.biology }}` | ± |
| computer_science | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.computer_science }}` | ± |
| engineering | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.engineering }}` | ± |
| economics | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.economics }}` | ± |
| business | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.business }}` | ± |
| law | (from M10 receipt) | `{{ M12_PER_DOMAIN_BENCHMARK.law }}` | ± |
| psychology | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.psychology }}` | ± |
| health | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.health }}` | ± |
| history | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.history }}` | ± |
| philosophy | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.philosophy }}` | ± |
| other | (from M10 receipt) | `{{ M12_PER_DOMAIN_BREAKDOWN.other }}` | ± |

**Delta column color coding:** green if M12 > M10, red if M12 < M10, gray if equal
**Font:** JetBrains Mono 18px for numbers, Inter 16px for domain names
**Table border:** subtle #30363d lines

**Placeholder:** `{{ M12_PER_DOMAIN_BREAKDOWN }}` — 14-key map keyed by MMLU-Pro domain slug, values are % accuracy strings

---

### Section 5 — PLOW LOOP ITERATION HISTOGRAM
**Position:** Lower-center block, ~18% height
**Layout:** Side-by-side grouped bar chart — M10 (amber) vs M12 (green) per iteration bucket

**M10 known distribution (hardcoded):**
| Iteration | M10 Count |
|-----------|-----------|
| 1 | 157 |
| 2 | 2 |
| 3 | 2 |
| 6 | 2 |
| 8 | 3 |
| 10 | 1 |
| 12 | 1 |

**M12 distribution (placeholder):**
`{{ M12_PLOW_LOOP_HISTOGRAM }}` — map of {iteration_number: question_count} from receipt

**Annotations:**
- Arrow + label at M10 iter=12 bar: "Full Plow fired (timeout starved)"
- Arrow + label at M12 iter=12 bar (if count > M10): "Escalation path now completing"
- X-axis: Iteration number (1–12)
- Y-axis: Questions reaching that iteration (log scale if M10 iter=1 bar (157) dwarfs others)

**Placeholder:** `{{ M12_PLOW_LOOP_HISTOGRAM }}` — keyed map from receipt

---

### Section 6 — BOTTOM ATTRIBUTION ROW
**Position:** Footer band, ~9% height
**Layout:** Three columns

| Left | Center | Right |
|------|--------|-------|
| MnemosyneC · SSPL Free Forever | mnemosynec.org | Liana Banyan Cooperative |

**Additional bottom metadata strip (smallest font, muted gray #8b949e, 14px):**
```
Wall-clock: M10 88.9 min · M12 {{ M12_WALL_CLOCK_MIN }} min
Escalations fired: {{ M12_ESCALATION_FIRED_COUNT }} questions
Timeouts hit: {{ M12_TIMEOUT_DISTRIBUTION }} questions
Peer participation: {{ M12_PER_PEER_PARTICIPATION }}
```

---

## TRUTH-ALWAYS FOOTER DISCLOSURES
*(Rendered in the bottom metadata strip, all required, verbatim)*

1. `"42Q stratified preview · full 70Q definitive fires 2026-06-25 per Trial 02d Founder lock"`
2. `"Per-peer participation distribution included in receipt"`
3. `"Free Gemma 4:12B + Llama 3.1 + Mistral on consumer hardware"`

---

## ALL `{{ M12_* }}` PLACEHOLDERS — MASTER LIST

| Placeholder | Source | Description |
|-------------|--------|-------------|
| `{{ M12_ENSEMBLE }}` | Receipt: top-level accuracy | Final ensemble % (e.g. "71.4") |
| `{{ M12_CORRECT_OF_42 }}` | Receipt: correct_count | Integer correct answers of 42 |
| `{{ M12_PER_DOMAIN_BREAKDOWN }}` | Receipt: per_domain map | 14-key map, domain slug → % string |
| `{{ M12_WALL_CLOCK_MIN }}` | Receipt: wall_clock_seconds ÷ 60 | Total run duration in minutes |
| `{{ M12_ESCALATION_FIRED_COUNT }}` | Receipt: escalation_events count | # questions where timeout-escalation activated |
| `{{ M12_TIMEOUT_DISTRIBUTION }}` | Receipt: timeout_hits | # questions where per-domain timeout was reached |
| `{{ M12_PER_PEER_PARTICIPATION }}` | Receipt: peer_participation map | Participation rate per peer UUID (4 peers) |
| `{{ M12_PLOW_LOOP_HISTOGRAM }}` | Receipt: ploop_iter_distribution | Map of {iter: count} across all 42 questions |

---

## RENDER PATHWAY RECOMMENDATION

**Primary: Python / matplotlib** (Bishop-executable, no Knight dependency)

Rationale:
- Bishop can generate PNG directly from receipt JSON in one script pass
- No Hugo build cycle, no Firebase deploy, no Knight lane required
- matplotlib + PIL = deterministic pixel output, no font rendering drift
- Script template below is self-contained

**Fallback: Hand to Knight (Hugo/HTML+CSS)**
- If matplotlib font rendering is unsatisfactory for social blast quality
- Knight renders via Puppeteer headless screenshot of Hugo template
- Bishop composes dispatch to BISHOP_DROPZONE with filled spec values

### Python matplotlib script outline (fill at M12 receipt seal)

```python
# render_m10_vs_m12.py
# Run after M12 receipt: python render_m10_vs_m12.py --receipt M12_RECEIPT.json

import json, sys, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.patches import FancyBboxPatch
import numpy as np

# --- LOAD RECEIPT ---
receipt = json.load(open(sys.argv[2]))
m12_ensemble    = receipt['accuracy_pct']          # float
m12_correct     = receipt['correct_count']          # int
m12_per_domain  = receipt['per_domain']             # dict
m12_wall_min    = receipt['wall_clock_seconds'] / 60
m12_escl_count  = receipt['escalation_events']
m12_timeout_ct  = receipt['timeout_hits']
m12_peer_part   = receipt['peer_participation']
m12_ploop_hist  = receipt['ploop_iter_distribution']

# --- M10 HARDCODED ANCHORS ---
M10_ENSEMBLE = 59.5
M10_WALL_MIN = 88.9
M10_PLOOP = {1:157, 2:2, 3:2, 6:2, 8:3, 10:1, 12:1}

# --- CANVAS ---
fig = plt.figure(figsize=(12, 12), facecolor='#0d1117')
gs  = gridspec.GridSpec(6, 1, figure=fig,
      height_ratios=[0.15, 0.08, 0.20, 0.30, 0.18, 0.09],
      hspace=0.04)

# Section 1: Headline  (ax0)
# Section 2: Sub-headline (ax1)
# Section 3: Accuracy bars (ax2)
# Section 4: Domain table  (ax3)
# Section 5: Plow histogram (ax4)
# Section 6: Footer (ax5)

# [implementation detail: fill each ax per spec above]

fig.savefig('M10_vs_M12_social_blast_1200x1200.png',
            dpi=100, bbox_inches='tight',
            facecolor='#0d1117')
print("Saved: M10_vs_M12_social_blast_1200x1200.png")
```

---

## BISHOP FILL CHECKLIST (run at M12 receipt seal)

- [ ] Load M12 receipt JSON
- [ ] Replace all `{{ M12_* }}` tokens with receipt values
- [ ] Verify 14-domain row count matches MMLU-Pro domain list
- [ ] Verify Truth-Always footer disclosures present verbatim
- [ ] Confirm per-domain Delta column color-coding logic (green/red/gray)
- [ ] Run `render_m10_vs_m12.py --receipt M12_RECEIPT.json`
- [ ] Inspect PNG output before social blast
- [ ] If font/layout unsatisfactory → dispatch to Knight with filled spec

---

*Spec sealed: 2026-06-22 · Bishop SEG BP090 · TRUTH-ALWAYS*
*Render blocked on: M12 42Q LONGHAUL receipt (~03:00–06:00 Central 2026-06-22)*
