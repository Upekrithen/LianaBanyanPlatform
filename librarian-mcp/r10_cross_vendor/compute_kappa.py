#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
compute_kappa.py -- Cohen's Kappa for Cadre Benchmark Inter-Model Agreement
BP067/BP068 | Knight | TRUTH-ALWAYS

Reads existing CADRE_V4_TEST2_BP067 JSON and computes:
  - Pairwise Cohen's kappa between the 3 Cadre models (binary: correct/incorrect)
  - Average inter-model kappa (grader-agreement metric)
  - Per-condition (COLD / HOT)

Cohen's kappa formula:
  kappa = (P_o - P_e) / (1 - P_e)
  P_o = observed agreement proportion
  P_e = expected agreement by chance = P(A=C)*P(B=C) + P(A=I)*P(B=I)
"""

import json, os, sys
from pathlib import Path
from itertools import combinations

SCRIPT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = SCRIPT_DIR / "results"

def find_test2_json():
    candidates = sorted(RESULTS_DIR.glob("CADRE_V4_TEST2_*.json"), reverse=True)
    if not candidates:
        raise FileNotFoundError(f"No CADRE_V4_TEST2 JSON found in {RESULTS_DIR}")
    return candidates[0]

def grade_to_bin(grade: str) -> int:
    """correct -> 1, partial -> 1 (benefit of doubt), incorrect -> 0"""
    return 1 if grade in ("correct", "partial") else 0

def cohen_kappa_binary(labels_a: list, labels_b: list) -> dict:
    """
    Binary Cohen's kappa.
    labels_a, labels_b: lists of 0/1 integers (same length).
    Returns dict with kappa, P_o, P_e, contingency table.
    """
    n = len(labels_a)
    assert len(labels_b) == n, "lists must be same length"

    # Contingency table: a_val x b_val
    table = {(0,0): 0, (0,1): 0, (1,0): 0, (1,1): 0}
    for a, b in zip(labels_a, labels_b):
        table[(a, b)] += 1

    p_o = (table[(0,0)] + table[(1,1)]) / n

    # Marginals
    p_a1 = (table[(1,0)] + table[(1,1)]) / n   # P(A=correct)
    p_a0 = 1 - p_a1
    p_b1 = (table[(0,1)] + table[(1,1)]) / n   # P(B=correct)
    p_b0 = 1 - p_b1

    p_e = p_a1 * p_b1 + p_a0 * p_b0

    if (1 - p_e) < 1e-9:
        kappa = 1.0 if p_o >= 1.0 else float('nan')
    else:
        kappa = (p_o - p_e) / (1 - p_e)

    return {
        "kappa": round(kappa, 4),
        "p_o": round(p_o, 4),
        "p_e": round(p_e, 4),
        "n": n,
        "table": {"both_correct": table[(1,1)], "both_incorrect": table[(0,0)],
                  "a_correct_b_wrong": table[(1,0)], "a_wrong_b_correct": table[(0,1)]},
    }

def kappa_rater_vs_quorum(q_results: list, rater_model: str) -> dict:
    """Kappa between a single model (as rater) and the quorum verdict."""
    labels_rater = [grade_to_bin(qr["grades"][rater_model]) for qr in q_results]
    labels_quorum = [grade_to_bin(qr["quorum"]) for qr in q_results]
    return cohen_kappa_binary(labels_rater, labels_quorum)

def run_kappa_analysis(json_path: Path) -> dict:
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    models = data["cadre_models"]
    results = {}

    for condition in ["cold", "hot"]:
        q_results = data["test2"][condition]["q_results"]
        cond_results = {}

        # Pairwise between models
        pairwise = {}
        for m_a, m_b in combinations(models, 2):
            labels_a = [grade_to_bin(qr["grades"][m_a]) for qr in q_results]
            labels_b = [grade_to_bin(qr["grades"][m_b]) for qr in q_results]
            k = cohen_kappa_binary(labels_a, labels_b)
            key = f"{m_a.split(':')[0]} vs {m_b.split(':')[0]}"
            pairwise[key] = k
        cond_results["pairwise"] = pairwise

        # Each model vs quorum
        vs_quorum = {}
        for m in models:
            k = kappa_rater_vs_quorum(q_results, m)
            vs_quorum[m.split(":")[0]] = k
        cond_results["vs_quorum"] = vs_quorum

        # Average pairwise kappa
        avg_kappa = sum(v["kappa"] for v in pairwise.values()) / len(pairwise)
        cond_results["avg_pairwise_kappa"] = round(avg_kappa, 4)

        # Average vs-quorum kappa
        avg_vq = sum(v["kappa"] for v in vs_quorum.values()) / len(vs_quorum)
        cond_results["avg_vs_quorum_kappa"] = round(avg_vq, 4)

        results[condition] = cond_results

    return {"source": str(json_path.name), "models": models, "conditions": results}

def print_kappa_report(analysis: dict):
    print(f"\n{'='*70}")
    print("COHEN'S KAPPA -- Cadre Benchmark Inter-Model Agreement")
    print(f"Source: {analysis['source']}")
    print(f"Models: {' | '.join(analysis['models'])}")
    print(f"{'='*70}")

    for condition, cr in analysis["conditions"].items():
        print(f"\n  [{condition.upper()}]")
        print(f"  {'-'*60}")
        print(f"  Pairwise kappa (inter-model grader agreement):")
        for pair, k in cr["pairwise"].items():
            stars = ""
            if k["kappa"] >= 0.8:
                stars = " ← almost perfect"
            elif k["kappa"] >= 0.6:
                stars = " ← substantial"
            elif k["kappa"] >= 0.4:
                stars = " ← moderate"
            elif k["kappa"] >= 0.2:
                stars = " ← fair"
            else:
                stars = " ← slight/poor"
            print(f"    {pair:<35} κ = {k['kappa']:+.4f}  (P_o={k['p_o']:.3f}, P_e={k['p_e']:.3f}){stars}")
            print(f"      contingency: both_C={k['table']['both_correct']}  both_I={k['table']['both_incorrect']}  "
                  f"A_only={k['table']['a_correct_b_wrong']}  B_only={k['table']['a_wrong_b_correct']}")

        print(f"\n  Average pairwise κ = {cr['avg_pairwise_kappa']:+.4f}")

        print(f"\n  Each model vs Quorum:")
        for m, k in cr["vs_quorum"].items():
            print(f"    {m:<20} κ = {k['kappa']:+.4f}  (P_o={k['p_o']:.3f}, P_e={k['p_e']:.3f})")
        print(f"\n  Average vs-quorum κ = {cr['avg_vs_quorum_kappa']:+.4f}")

    cold_avg = analysis["conditions"]["cold"]["avg_pairwise_kappa"]
    hot_avg  = analysis["conditions"]["hot"]["avg_pairwise_kappa"]
    print(f"\n{'='*70}")
    print(f"  HEADLINE KAPPA (avg pairwise COLD): {cold_avg:+.4f}")
    print(f"  HEADLINE KAPPA (avg pairwise HOT):  {hot_avg:+.4f}")
    print(f"{'='*70}")
    print(f"\n  Interpretation guide (Landis & Koch 1977):")
    print(f"    <0.00  = Poor (less than chance)")
    print(f"    0.00-0.20 = Slight")
    print(f"    0.21-0.40 = Fair")
    print(f"    0.41-0.60 = Moderate")
    print(f"    0.61-0.80 = Substantial")
    print(f"    0.81-1.00 = Almost Perfect")
    print(f"\n  NOTE: Low kappa here reflects GENUINE MODEL DISAGREEMENT, not grader")
    print(f"  unreliability. The deterministic grader (letter-match + numeric-compare)")
    print(f"  has kappa=1.0 with itself. Low inter-model kappa validates D-5 Star Chamber")
    print(f"  escalation: quorum fails exactly when model capability variance is wide.")
    print(f"\n  FOR THE KEEP.")

def main():
    json_path = find_test2_json()
    print(f"Loading: {json_path}")
    analysis = run_kappa_analysis(json_path)
    print_kappa_report(analysis)

    # Save JSON
    out_path = RESULTS_DIR / "kappa_analysis_BP067.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    print(f"\n[SAVED] {out_path}")
    return analysis

if __name__ == "__main__":
    main()
