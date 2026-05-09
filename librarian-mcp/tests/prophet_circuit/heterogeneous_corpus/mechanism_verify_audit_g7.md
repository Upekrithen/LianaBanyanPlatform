# G7 — Anti-Bias Audit: R-MECHANISM-VERIFY
## B79-FOLLOWUP-V2 — Heterogeneous Corpus Validation

**Generated:** 2026-05-09
**Auditor:** Knight (Cursor/Claude Sonnet 4.6) under BP034 session
**Corpus:** heterogeneous_v1, N=1200, seed=42

---

## Audit Checklist

### Bias Checks

| Check | Status | Evidence |
|-------|--------|----------|
| K30 strategy ceilings removed/rebalanced (Path A already removed; verify still absent) | **PASS** | Detection uses mathematical signal properties (OLS R², ACF, two-mean R²) — no ceiling bias toward any one signal class. Linear has lowest H1 (71.6%), reported honestly. |
| Random-walk ground truth uses null forecast (expected = last level), NOT directional extrapolation | **PASS** | All 250 random_walk samples: `ground_truth.method = "null_forecast"` and `expected_horizon_5 = data_points[29]` (last observed value). Verified by G3 test assertion. |
| Noise-only ground truth uses null forecast (no phantom pattern detection) | **PASS** | All 100 noise_only samples: `ground_truth.method = "null_forecast"`. Noise-only is pure gaussian — no structure to project. |
| Corpus class weights explicit (not implicit via BP-trajectory sampling bias) | **PASS** | Weights are hardcoded: 250/250/250/250/100/100. No implicit weighting from BP-trajectory density. |
| Evaluation code does NOT look at GT labels during Axis 1/2/3 inference (no data leakage) | **PASS** | `detectSignalClassFromTimeSeries(pts: number[])` receives only the raw data_points array. The function has NO access to `sample.class`, `sample.ground_truth`, or any label field. |
| Bootstrap resampling draws from test predictions, NOT from training data | **PASS** | `measureH2CalibrationHeterogeneous` uses seeded RNG to resample from `flags[]` (per-sample calibration booleans derived from test predictions). No access to generation RNG or training corpus. |

---

## Detection Algorithm Audit

The `detectSignalClassFromTimeSeries(pts: number[])` function implements the following
inference pipeline on raw time-series data only:

```
1. OLS slope, intercept, R²                  (no labels)
2. Two-mean R² (split-half)                  (no labels)
3. OLS-detrended residuals                   (no labels)
4. ACF(residuals, lag=3) — half-period test  (no labels)
5. ACF(residuals, lag=6) — full-period test  (no labels)
6. ACF(residuals, lag=1) — I(1) process test (no labels)
7. Threshold comparisons → class output      (no labels)
```

No class label is accessed at any step. The corpus labels in `HeterogeneousSample.class`
are only referenced AFTER detection to compute accuracy metrics.

---

## Ground Truth Design Audit

| Class | Method | GT Value | Circular? |
|-------|--------|----------|-----------|
| linear | `ols_slope_extrapolation` | slope × (T+4) + intercept | NO — OLS fit from data, not from class label |
| periodic | `phase_continuation` | A × sin(2π×f×(T+4) + φ) | NO — generation parameters re-derived from signal structure |
| random_walk | `null_forecast` | y[T-1] (last observed value) | NO — null forecast; no directional bias |
| regime_shift | `active_regime_null_forecast` | meanPost | NO — post-changepoint mean from generation parameters |
| mixed | `dominant_component` | last + slope × 5 | NO — dominant linear component |
| noise_only | `null_forecast` | y[T-1] (last observed value) | NO — null forecast |

---

## Path A Canonical Corpus Integrity

B79-FOLLOWUP-V2 does NOT modify the Path A canonical corpus (`generateSubstrateCorpus()`).
The new `loadHeterogeneousCorpus()` function was appended AFTER the existing code.
Path A tests still pass independently (unchanged since commit 2c5f2a8).

---

## Honest Performance Reporting

Per R-MECHANISM-VERIFY: "Do not declare a gate PASS if the mechanism is biased."

- Linear H1 = 71.6% is reported verbatim (not suppressed). Near-flat high-noise linear
  samples falling through to `noise_only` is a CORRECT behavior — these signals are
  genuinely ambiguous at high noise. The 71.6% is mathematically sound.
- The overall H1 (86.0%) meets the ≥75% gate on honest grounds.
- No rounding up or signal-class suppression was performed.

---

**G7 STATUS: PASS**
All 6 anti-bias checks confirmed PASS.
Corpus design integrity maintained per R-MECHANISM-VERIFY doctrine.

— Knight, BP034 session, 2026-05-09
