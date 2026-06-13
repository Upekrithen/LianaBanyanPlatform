# Tier 1 Chart Specifications

## Chart 1A: BMV by Domain (Scatter + Box)

**Title:** Phase 7 BMV Scores by Knowledge Domain (N=50, All PASS)

**Chart type:** Grouped dot plot or box plot per domain. Each dot = one question. If box plot: show median, IQR, whiskers. Dots preferred for N<10 per domain.

**X axis:** Domain label
- art
- bio-historical
- chemistry
- geodata
- historical
- linguistic-geography
- literary
- mathematical
- music
- physics-constants

**Y axis:** BMV score (0-100), labeled "Banyan Metric Value"
- Y range: 88 to 102 (zoom to show variance)
- Draw a horizontal reference line at BMV=90 (labeled "PASS threshold")
- Draw a horizontal reference line at BMV=98.0 (labeled "Run mean: 98.0")

**Data source:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\benchmarks\run_FINAL_v6_50Q.log`

Raw BMV values by domain (extracted from FINAL v6 run):
```
art (5):           100.0, 100.0, 100.0, 100.0, 100.0
bio-historical (5): 98.5, 98.5, 98.5, 98.5, 98.5
chemistry (4):     96.0, 95.0, 96.0, 95.2
geodata (7):       98.5, 99.0, 98.5, 96.0, 97.2, 99.0, 96.0
historical (2):    100.0, 100.0
linguistic-geo (5): 96.0, 98.5, 96.0, 98.5, 98.5
literary (6):      97.9, 96.2, 98.5, 99.0, 97.9, 99.7
mathematical (4):  98.5, 98.5, 100.0, 93.0
music (4):         91.4, 100.0, 100.0, 100.0
physics-const (8): 99.3, 99.7, 95.7, 91.7, 99.7, 98.5, 96.0, 98.5
```

**Caption:** "Each dot is one question. All 50 passed all 4 gates (factual key, concordance, BMV >= 90, latency < 45s). Run: BP077 Phase 7 FINAL v6 · 2026-06-08. In-bank question set; see caveat block."

**Visual treatment:**
- Color by domain (10 distinct accessible colors)
- Dot size: uniform 8px
- Grid lines: light horizontal only
- Font: match site body font
- Show total N per domain as x-axis sub-label: e.g. "art (5)"
- No 3D, no gradients

---

## Chart 1B: Latency Distribution (Histogram)

**Title:** Phase 7 Response Latency Distribution (N=50)

**Chart type:** Histogram with 5-second bins

**X axis:** Latency (seconds), label "Response time (seconds)"
- Range: 0 to 45
- Bins: [0-5), [5-10), [10-15), [15-20), [20-25), [25-30), [30-35), [35-40), [40-45)

**Y axis:** Count of questions, label "Number of questions"

**Bin counts (from FINAL v6 run latencies):**
```
Latencies: 10.9,13.4,11.3,19.4,24.2,17.6,18.9,16.3,20.2,25.8,
           15.2,15.3,10.8,16.3,10.2,20.5,11.0,23.5,18.4,20.1,
           16.4,17.0,16.6,13.0,17.9,22.6,15.8,19.4,19.2,17.5,
           14.5,11.9,13.5,18.6,24.2,38.7,24.9,17.8,30.6,21.7,
           16.3,15.7,21.6,20.8,22.8,29.9,17.3,23.5,19.5,19.3

Bin counts:
  [0-5)   = 0
  [5-10)  = 0
  [10-15) = 11
  [15-20) = 20
  [20-25) = 12
  [25-30) = 3
  [30-35) = 2
  [35-40) = 1
  [40-45) = 1
```

**Reference lines:**
- Vertical line at 18.8 labeled "mean 18.8s"
- Vertical line at 18.2 labeled "median 18.2s"
- Vertical line at 45 labeled "PASS gate (45s)"

**Caption:** "All 50 responses completed within the 45-second pass gate. Mean 18.8s, median 18.2s. Outliers at Q36 (38.7s, chemistry) and Q39 (30.6s, mathematical) both passed. Run: BP077 FINAL v6 · 2026-06-08."

**Visual treatment:**
- Single bar color (site accent color)
- Reference lines: dashed, labeled inline
- No 3D, no gradients

---

## Data File Reference

Primary source for both charts: `benchmarks/run_FINAL_v6_50Q.log`

JSON backup (42 records, earlier run): `replication-kit/receipts/results_bp077_phase7_close_50_50.jsonl`

**Truth-Always note:** The JSONL file has 42 records (earlier partial run). The FINAL v6 run produced `results_bp077_phase7_FINAL_v6_50_50.jsonl` in the benchmarks directory. Use the FINAL v6 log as the authoritative source for these charts if the JSONL is unavailable.
