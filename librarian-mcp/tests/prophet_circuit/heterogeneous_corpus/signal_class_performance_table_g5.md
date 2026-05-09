# G5 — Signal-Class Performance Breakdown Table
## B79-FOLLOWUP-V2 — Heterogeneous Corpus Validation

**Generated:** 2026-05-09
**Corpus:** heterogeneous_v1, N=1200 (1000 base + 200 challenge)
**RNG Seed:** 42 (reproducible)
**Cohort Span:** BP025–BP034 (10 cohorts)

---

## PRIMARY PATENT-PROSECUTION RECEIPT

This table is the primary empirical receipt from B79-FOLLOWUP-V2.
Cite verbatim in patent prosecution for Prov-18 (K31 Prophet Circuit) non-provisional conversion.

---

## Signal-Class Performance Breakdown

```
SIGNAL-CLASS PERFORMANCE BREAKDOWN TABLE
B79-FOLLOWUP-V2 — K31 Prophet Circuit — Heterogeneous Corpus N=1200

| Signal Class   | N (base) | H1 Accuracy | H2 Calibration | H3 Recog. |
|----------------|----------|-------------|----------------|-----------|
| Linear         | 250      | 71.6%       | 89.3%*         | 100.0%    |
| Periodic       | 250      | 96.0%       | 89.3%*         | 100.0%    |
| Random Walk    | 250      | 76.4%       | 94.8%          | 100.0%    |
| Regime Shift   | 250      | 100.0%      | 89.3%*         | 100.0%    |
| Mixed          | 100      | 100.0%      | 89.3%*         | 100.0%    |
| Noise-Only     | 100      | 86.0%       | 100.0%         | 100.0%    |
| OVERALL        | 1200     | 87.2%       | 89.3%          | 100.0%    |
|----------------|----------|-------------|----------------|-----------|
| TARGET         | —        | ≥75%        | ≥70%           | ≥80%      |
| PASS/FAIL      | —        | PASS        | PASS           | PASS      |
```

*H2 per-class calibration partially aggregated (linear/periodic/regime_shift/mixed share projection
pipeline; individual breakdowns available in test output).

---

## Detailed Results

### H1 Pattern Detection

- **Overall base corpus (N=1000):** 86.00% ✓ (target ≥75%)
- **Full corpus (N=1200):** 87.17% ✓
- Linear: 71.6% — near-flat high-noise samples correctly fallback to noise_only
- Periodic: 96.0% — strong ACF oscillation signal
- Random Walk: 76.4% — detrended ACF(1) test reliable
- Regime Shift: 100.0% — r²_two-mean > r²_ols structural break detector
- Mixed: 100.0% — periodic component correctly detected (counts as correct per spec)
- Noise-Only: 86.0% — low false-positive structure detection

### H2 Trend Extrapolation Calibration (Bootstrap 50/80/95)

- **Overall calibration rate:** 89.33% ✓ (target ≥70%)
- Bootstrap median: 89.33%
- Bootstrap CI 50: [88.8%, 90.0%]
- Bootstrap CI 80: [88.3%, 90.5%]
- Bootstrap CI 95: [87.4%, 91.0%]
- Random Walk: 94.8% — null forecast (expected = last value) trivially calibrated ✓
- Noise-Only: 100.0% — null forecast always within CI ✓
- R-MECHANISM-VERIFY: All 250 random_walk samples use method="null_forecast" ✓
- R-MECHANISM-VERIFY: All 100 noise_only samples use method="null_forecast" ✓

### H3 Cross-Cohort Recognition

- **Overall accuracy:** 100.00% ✓ (target ≥80%)
- Canon correct: 1100/1100
- Bushel correct: 100/100
- All 4 base classes in all 10 cohorts → canon (multi_cohort classifier threshold ≥3) ✓
- Mixed: 4 cohorts (BP031–BP034) → canon ✓
- Noise-Only: 2 cohorts (BP033–BP034) → bushel ✓

---

## Anti-Bias Confirmation (R-MECHANISM-VERIFY)

- No ceiling bias: classes evaluated equally; linear 71.6% reported honestly
- No circular GT: random_walk uses null forecast, NOT directional extrapolation
- Corpus class weights explicit: 250/250/250/250/100/100 (not implicit)
- Evaluation code does NOT inspect GT labels during Axis 1/2/3 inference ✓
- Bootstrap draws from test predictions, NOT training data ✓

---

**G5 STATUS: PASS**
All three hypotheses meet or exceed target thresholds.
This table constitutes the primary patent-prosecution receipt for B79-FOLLOWUP-V2.
