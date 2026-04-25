#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analyze_r13_k499.py — Phase E Analysis for R13 Cross-Vendor Benchmark
======================================================================
K499 / B123-late

Reads grading_summary_R13_K499.json (from Phase D) and produces:
  1. Per-model Cold-vs-Cathedral lift (Mush Index)
  2. Cross-vendor cost-equalization (cost per HOT answer)
  3. Tier-equalization within vendor (does Cathedral close cheaper-to-top gap?)
  4. Headline numbers with confidence intervals on HOT rates
  5. Comparison to R10 baseline (prior-gen models)

Outputs:
  - results_R13_K499/analysis_R13_K499.json  (machine-readable)
  - Prints formatted analysis tables for report

Usage:
    python analyze_r13_k499.py
    python analyze_r13_k499.py --vs-r10  # include R10 baseline comparison
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR  = Path(__file__).resolve().parent
RESULTS_DIR = SCRIPT_DIR / "results_R13_K499"

# R10 baseline (prior-gen models, B111 K423)
R10_BASELINE = {
    "headline_hot_lift_pp": 86.1,
    "cohens_kappa": 0.883,
    "models": {
        "gpt-4o":         {"cold_hot_pct": 5.3,  "hot_hot_pct": 73.3},
        "gpt-4o-mini":    {"cold_hot_pct": 2.7,  "hot_hot_pct": 60.0},
        "claude-opus-4-7":{"cold_hot_pct": 9.3,  "hot_hot_pct": 84.0},
        "claude-haiku-4-5-20251001": {"cold_hot_pct": 4.0, "hot_hot_pct": 70.7},
        "gemini-2.5-pro": {"cold_hot_pct": 6.7,  "hot_hot_pct": 81.3},
        "gemini-2.5-flash":{"cold_hot_pct": 2.7, "hot_hot_pct": 61.3},
        "sonar-pro":      {"cold_hot_pct": 4.0,  "hot_hot_pct": 58.7},
        "sonar":          {"cold_hot_pct": 1.3,  "hot_hot_pct": 42.7},
    },
}


def wilson_ci(hot: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score confidence interval for a proportion."""
    if n == 0:
        return (0.0, 0.0)
    p = hot / n
    denom = 1 + z * z / n
    center = (p + z * z / (2 * n)) / denom
    margin = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom
    return (max(0, round((center - margin) * 100, 1)),
            min(100, round((center + margin) * 100, 1)))


def load_summary() -> dict:
    summary_path = RESULTS_DIR / "grading_summary_R13_K499.json"
    if not summary_path.exists():
        # Fall back to run summary
        summary_path = RESULTS_DIR / "results_summary_R13_K499.json"
    if not summary_path.exists():
        print("ERROR: No grading summary found. Run grade_r13_k499.py first.")
        sys.exit(1)
    with open(summary_path, encoding="utf-8") as f:
        return json.load(f)


def build_model_table(summary: dict) -> dict[str, dict]:
    """Build per-model dict with cold + cathedral stats.

    MCR keys are 'vendor|model_id|condition' — parse model_id from key
    since the data dict may not include a 'model' field.
    """
    mcr = summary.get("model_condition_results", {})
    models: dict[str, dict] = {}

    for key, data in mcr.items():
        parts = key.split("|")
        vendor_key = parts[0] if len(parts) >= 1 else "?"
        model_id   = parts[1] if len(parts) >= 2 else data.get("model", "?")
        condition  = parts[2] if len(parts) >= 3 else data.get("condition", "?")
        entry = models.setdefault(model_id, {
            "label": data.get("label", model_id),
            "tier": data.get("tier", "?"),
            "vendor": data.get("vendor", vendor_key),
            "model_id": model_id,
        })
        entry[condition] = data

    return models


def compute_lift(models: dict[str, dict]) -> list[dict]:
    """Compute Cathedral Effect lift per model."""
    lifts = []
    for model_id, m in models.items():
        cold = m.get("cold")
        cath = m.get("cathedral")
        if not cold or not cath:
            continue
        cold_hot = cold.get("hot_pct", 0)
        cath_hot = cath.get("hot_pct", 0)
        lift_pp = cath_hot - cold_hot

        n_cold = cold.get("n_graded", 1)
        n_cath = cath.get("n_graded", 1)
        ci_cold = wilson_ci(cold.get("HOT", 0), n_cold)
        ci_cath = wilson_ci(cath.get("HOT", 0), n_cath)

        lifts.append({
            "model_id": model_id,
            "label": m["label"],
            "tier": m["tier"],
            "vendor": m["vendor"],
            "cold_hot_pct": cold_hot,
            "cath_hot_pct": cath_hot,
            "lift_pp": round(lift_pp, 1),
            "ci_cold": ci_cold,
            "ci_cath": ci_cath,
            "cold_cost": cold.get("cost_usd", 0),
            "cath_cost": cath.get("cost_usd", 0),
        })

    lifts.sort(key=lambda x: -x["lift_pp"])
    return lifts


def compute_cost_equalization(models: dict[str, dict]) -> list[dict]:
    """Cost per HOT answer (cold vs cathedral) per model."""
    rows = []
    for model_id, m in models.items():
        for condition in ("cold", "cathedral"):
            data = m.get(condition)
            if not data:
                continue
            hot_count = data.get("HOT", 0)
            cost = data.get("cost_usd", 0)
            cost_per_hot = round(cost / max(1, hot_count), 4)
            rows.append({
                "model_id": model_id,
                "label": m["label"],
                "tier": m["tier"],
                "vendor": m["vendor"],
                "condition": condition,
                "hot_count": hot_count,
                "total_cost": cost,
                "cost_per_hot": cost_per_hot,
            })
    return rows


def compute_tier_equalization(models: dict[str, dict]) -> list[dict]:
    """Within-vendor: does Cathedral close the cheap-to-top HOT gap?"""
    rows = []
    vendors = set(m["vendor"] for m in models.values())

    for vendor in sorted(vendors):
        vendor_models = {mid: m for mid, m in models.items() if m["vendor"] == vendor}
        tiers = sorted(
            vendor_models.items(),
            key=lambda x: {"top": 0, "mid": 1, "cheap": 2}.get(x[1]["tier"], 9)
        )
        if len(tiers) < 2:
            continue

        top_model = next((m for _, m in tiers if m["tier"] == "top"), None)
        if not top_model:
            continue

        top_cold = top_model.get("cold", {}).get("hot_pct", 0)
        top_cath = top_model.get("cathedral", {}).get("hot_pct", 0)

        for _, cheaper_model in tiers[1:]:
            cheap_cold = cheaper_model.get("cold", {}).get("hot_pct", 0)
            cheap_cath = cheaper_model.get("cathedral", {}).get("hot_pct", 0)

            gap_cold = top_cold - cheap_cold
            gap_cath = top_cath - cheap_cath
            gap_reduction = gap_cold - gap_cath

            # Cost delta
            top_cost = top_model.get("cold", {}).get("cost_usd", 0) + top_model.get("cathedral", {}).get("cost_usd", 0)
            cheap_cost = cheaper_model.get("cold", {}).get("cost_usd", 0) + cheaper_model.get("cathedral", {}).get("cost_usd", 0)
            cost_ratio = round(top_cost / max(0.001, cheap_cost), 1)

            rows.append({
                "vendor": vendor,
                "top_label": top_model["label"],
                "cheap_label": cheaper_model["label"],
                "cheap_tier": cheaper_model["tier"],
                "top_cold_hot_pct": top_cold,
                "cheap_cold_hot_pct": cheap_cold,
                "top_cath_hot_pct": top_cath,
                "cheap_cath_hot_pct": cheap_cath,
                "gap_cold_pp": round(gap_cold, 1),
                "gap_cath_pp": round(gap_cath, 1),
                "gap_reduction_pp": round(gap_reduction, 1),
                "cost_ratio": cost_ratio,
            })

    return rows


def print_analysis(lifts: list[dict], cost_eq: list[dict], tier_eq: list[dict],
                   summary: dict) -> None:
    n = 50  # questions per condition

    print(f"\n{'='*75}")
    print("R13 K499 — CATHEDRAL EFFECT LIFT (Cold → Cathedral HOT%)")
    print(f"{'='*75}")
    print(f"{'Model':<36} {'Cold%':>6} {'Cath%':>6} {'Lift':>6}   {'CI Cold':^12} {'CI Cath':^12}  Tier")
    print(f"{'─'*75}")
    for r in lifts:
        ci_c = f"[{r['ci_cold'][0]:.0f}%–{r['ci_cold'][1]:.0f}%]"
        ci_k = f"[{r['ci_cath'][0]:.0f}%–{r['ci_cath'][1]:.0f}%]"
        print(f"{r['label']:<36} {r['cold_hot_pct']:>5.1f}% {r['cath_hot_pct']:>5.1f}% "
              f"{r['lift_pp']:>+5.1f}pp  {ci_c:^12} {ci_k:^12}  [{r['tier']}]")

    if lifts:
        all_lifts = [r["lift_pp"] for r in lifts]
        mean_lift = sum(all_lifts) / len(all_lifts)
        print(f"{'─'*75}")
        print(f"{'Cross-vendor mean Cathedral lift':<36} {'':>6} {'':>6} {mean_lift:>+5.1f}pp")
        print(f"{'R10 baseline (prior-gen models)':<36} {'':>6} {'':>6} {R10_BASELINE['headline_hot_lift_pp']:>+5.1f}pp")

    print(f"\n{'='*75}")
    print("COST-EQUALIZATION ($ per HOT answer)")
    print(f"{'='*75}")
    print(f"{'Model':<36} {'Cond':<10} {'HOT':>4} {'Cost':>7} {'$/HOT':>8}  Tier")
    print(f"{'─'*75}")
    for r in sorted(cost_eq, key=lambda x: (x["vendor"], x["tier"], x["condition"])):
        print(f"{r['label']:<36} {r['condition']:<10} {r['hot_count']:>4} "
              f"${r['total_cost']:>6.2f} ${r['cost_per_hot']:>7.4f}  [{r['tier']}]")

    print(f"\n{'='*75}")
    print("TIER EQUALIZATION (Cathedral closes cheap-to-top-tier HOT gap?)")
    print(f"{'='*75}")
    print(f"{'Pair':<50} {'Gap Cold':>9} {'Gap Cath':>9} {'Reduction':>10} {'Cost×':>6}")
    print(f"{'─'*75}")
    for r in tier_eq:
        pair = f"{r['vendor']}: {r['cheap_label']} vs {r['top_label']}"
        print(f"{pair:<50} {r['gap_cold_pp']:>+8.1f}pp {r['gap_cath_pp']:>+8.1f}pp "
              f"{r['gap_reduction_pp']:>+9.1f}pp {r['cost_ratio']:>5.1f}×")
        print(f"  [{r['cheap_tier']}] cold: top={r['top_cold_hot_pct']:.1f}% cheap={r['cheap_cold_hot_pct']:.1f}% → "
              f"cath: top={r['top_cath_hot_pct']:.1f}% cheap={r['cheap_cath_hot_pct']:.1f}%")

    kappa_info = summary.get("inter_rater_kappa", {})
    print(f"\n{'='*75}")
    print("INTER-RATER AGREEMENT (from Phase D)")
    print(f"{'='*75}")
    if kappa_info.get("deterministic_vs_haiku"):
        print(f"  Deterministic ↔ Haiku:   κ = {kappa_info['deterministic_vs_haiku']:.3f}")
    if kappa_info.get("deterministic_vs_gemini"):
        print(f"  Deterministic ↔ Gemini:  κ = {kappa_info['deterministic_vs_gemini']:.3f}")
    if kappa_info.get("haiku_vs_gemini"):
        print(f"  Haiku ↔ Gemini:          κ = {kappa_info['haiku_vs_gemini']:.3f}")
    print(f"  R10 baseline:            κ = {kappa_info.get('r10_baseline', 0.883):.3f}")
    print(f"  Sample n = {kappa_info.get('n_sample', '?')}")


def save_analysis(lifts, cost_eq, tier_eq, summary) -> dict:
    analysis: dict[str, Any] = {
        "benchmark": "R13_K499",
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "r10_baseline_hot_lift_pp": R10_BASELINE["headline_hot_lift_pp"],
        "lift_per_model": lifts,
        "cost_equalization": cost_eq,
        "tier_equalization": tier_eq,
        "inter_rater_kappa": summary.get("inter_rater_kappa", {}),
        "total_inference_cost_usd": summary.get("inference_cost_usd", 0),
        "total_grading_cost_usd": summary.get("grading_cost_usd", 0),
        "total_cost_usd": summary.get("total_cost_usd", 0),
    }

    # Compute headline numbers
    all_lifts = [r["lift_pp"] for r in lifts]
    if all_lifts:
        analysis["headline"] = {
            "mean_lift_pp": round(sum(all_lifts) / len(all_lifts), 1),
            "max_lift_pp": max(all_lifts),
            "min_lift_pp": min(all_lifts),
            "models_with_positive_lift": sum(1 for l in all_lifts if l > 0),
            "models_total": len(all_lifts),
            "r10_comparison": {
                "r10_mean_lift_pp": R10_BASELINE["headline_hot_lift_pp"],
                "r13_mean_lift_pp": round(sum(all_lifts) / len(all_lifts), 1),
                "delta_pp": round(sum(all_lifts) / len(all_lifts) - R10_BASELINE["headline_hot_lift_pp"], 1),
            },
        }

    path = RESULTS_DIR / "analysis_R13_K499.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2)
    print(f"\nAnalysis saved → {path}")
    return analysis


def main() -> None:
    parser = argparse.ArgumentParser(description="R13 K499 Phase E Analysis")
    parser.add_argument("--vs-r10", action="store_true",
                        help="Print R10 baseline comparison")
    args = parser.parse_args()

    summary = load_summary()
    models = build_model_table(summary)
    lifts = compute_lift(models)
    cost_eq = compute_cost_equalization(models)
    tier_eq = compute_tier_equalization(models)

    print_analysis(lifts, cost_eq, tier_eq, summary)
    analysis = save_analysis(lifts, cost_eq, tier_eq, summary)

    if args.vs_r10:
        print(f"\n{'='*75}")
        print("R10 vs R13 COMPARISON (prior-gen vs current-gen models)")
        print(f"{'='*75}")
        for model_id, baseline in R10_BASELINE["models"].items():
            print(f"  {model_id:<40} R10 cold={baseline['cold_hot_pct']:.1f}% → hot={baseline['hot_hot_pct']:.1f}%"
                  f"  lift=+{baseline['hot_hot_pct'] - baseline['cold_hot_pct']:.1f}pp")


if __name__ == "__main__":
    main()
