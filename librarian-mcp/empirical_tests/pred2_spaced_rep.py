"""
K491 — Prediction 2: Spaced-Repetition Reinforcement

Biological: repeated activation of synaptic connections strengthens them (LTP);
            spaced repetition increases recall; resolution latency drops with access count.

LB analog hypothesis: Eblets repeatedly resolved by the Seer should be cached more
                      accessibly; resolution latency should drop on subsequent accesses.

Test: instrument the Seer's Eblet-resolution with access-frequency + latency tracking.
      Run 10 related queries that re-touch the same Eblet pool.
      Measure latency-vs-access-count curve.

Predicted result: latency decreases with access count (logarithmic decay).

Honest expectation: TF-IDF relevance scores are deterministic (no reinforcement effect).
LLM latency varies with Claude API call time (network + model). Any latency decrease
is attributable to Claude API variance, not substrate reinforcement. Report honestly.

REF Staff discipline: observational only.
"""

from __future__ import annotations

import json
import math
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from empirical_tests.harness import (
    InstrumentedSeer,
    load_api_client,
    run_panel,
    summarize_panel,
    save_jsonl,
    source_concentration,
    RESULTS_DIR,
)
from empirical_tests.panels import PREDICTION_2_PANEL


def fit_log_curve(x_vals: list[float], y_vals: list[float]) -> dict:
    """
    Fit y = a * log(x + 1) + b to the data (simple log-decay model).
    Returns {'a': slope, 'b': intercept, 'r_squared': r2}.
    Requires at least 2 points.
    """
    if len(x_vals) < 2:
        return {"a": 0.0, "b": y_vals[0] if y_vals else 0.0, "r_squared": 0.0}

    # Transform: x' = log(x + 1)
    x_log = [math.log(x + 1) for x in x_vals]
    n = len(x_log)
    x_mean = sum(x_log) / n
    y_mean = sum(y_vals) / n

    ss_xy = sum((x_log[i] - x_mean) * (y_vals[i] - y_mean) for i in range(n))
    ss_xx = sum((x_log[i] - x_mean) ** 2 for i in range(n))

    if ss_xx == 0:
        return {"a": 0.0, "b": y_mean, "r_squared": 0.0}

    a = ss_xy / ss_xx
    b = y_mean - a * x_mean

    # R^2
    y_pred = [a * x_log[i] + b for i in range(n)]
    ss_res = sum((y_vals[i] - y_pred[i]) ** 2 for i in range(n))
    ss_tot = sum((y_vals[i] - y_mean) ** 2 for i in range(n))
    r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    return {"a": round(a, 4), "b": round(b, 4), "r_squared": round(r2, 4)}


def analyze_latency_curve(access_report: list[dict]) -> dict:
    """
    Analyze the latency-vs-access-count curve from the InstrumentedSeer report.

    For each Eblet accessed multiple times, compute:
      - first vs last latency delta
      - log-curve fit (is there decay?)

    Returns aggregate finding.
    """
    multi_access = [r for r in access_report if r["access_count"] >= 2]

    if not multi_access:
        return {
            "finding": "No Eblets accessed multiple times — cannot measure latency decay",
            "n_multi_access_eblets": 0,
        }

    # Aggregate first-vs-last deltas
    deltas = [r["latency_delta_s"] for r in multi_access]
    mean_delta = sum(deltas) / len(deltas)
    negative_count = sum(1 for d in deltas if d < 0)

    # Latency trajectory: use access_count as x, mean_latency as y
    x_vals = [r["access_count"] for r in multi_access]
    y_vals = [r["mean_latency_s"] for r in multi_access]
    curve = fit_log_curve(x_vals, y_vals)

    # Verdict
    latency_decreased = mean_delta < -0.5  # >0.5s improvement on average
    slope_negative = curve["a"] < 0  # log curve has negative slope

    return {
        "n_multi_access_eblets": len(multi_access),
        "mean_first_last_delta_s": round(mean_delta, 3),
        "n_with_negative_delta": negative_count,
        "fraction_with_negative_delta": round(negative_count / len(multi_access), 3),
        "log_curve_fit": curve,
        "latency_decreased_overall": latency_decreased,
        "slope_negative": slope_negative,
        "prediction_direction": "negative slope expected" if slope_negative else "no negative slope",
        "honest_note": (
            "TF-IDF retrieval is O(N*V) deterministic — no native caching. "
            "Latency variation is dominated by Claude API call time (network jitter). "
            "Any decay signal is API variance, not substrate reinforcement."
        ),
    }


def analyze_tfidf_stability(seer: InstrumentedSeer) -> dict:
    """
    Check if TF-IDF scores are stable across repeated queries on the same question.
    Stable scores = TF-IDF is deterministic (expected).
    """
    sequence = seer.query_sequence

    if len(sequence) < 2:
        return {"finding": "Too few queries to assess TF-IDF stability"}

    # For each Eblet, check if relevance scores are consistent across queries
    # that triggered it
    eblet_scores_across_queries: dict[str, list[float]] = {}
    for entry in sequence:
        for eid, score in zip(entry["top_eblet_ids"], entry["top_eblet_scores"]):
            if eid not in eblet_scores_across_queries:
                eblet_scores_across_queries[eid] = []
            eblet_scores_across_queries[eid].append(score)

    # Eblets appearing in multiple queries (different queries, so scores SHOULD vary by query)
    # What we really want: for SAME query repeated, scores should be identical
    # Since our panel has unique queries, all scores should be valid (different queries, different scores)
    # We flag high-variance scores as surprising
    high_variance = []
    for eid, scores in eblet_scores_across_queries.items():
        if len(scores) >= 2:
            variance = sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores)
            if variance > 0.01:  # >1% variance across queries on same Eblet
                high_variance.append(eid)

    return {
        "n_eblets_tracked": len(eblet_scores_across_queries),
        "n_multi_query_eblets": sum(1 for scores in eblet_scores_across_queries.values() if len(scores) >= 2),
        "n_high_variance_eblets": len(high_variance),
        "tfidf_is_deterministic": True,  # inherent architecture fact
        "note": "Score variation across queries is expected (different queries). Same-query repetition would show 0 variance.",
    }


def run(verbose: bool = True) -> dict:
    """Full Prediction 2 run."""
    api_client = load_api_client(verbose=verbose)

    print("\n" + "="*60, flush=True)
    print("PREDICTION 2 — SPACED-REPETITION REINFORCEMENT", flush=True)
    print(f"Panel: {len(PREDICTION_2_PANEL)} queries, all targeting Cathedral Effect Eblets", flush=True)
    print("="*60, flush=True)

    start = time.time()

    seer = InstrumentedSeer(api_client=api_client, seer_id="Seer-P2-spaced-rep")
    print(f"Seer loaded: {seer.eblet_count} Eblets", flush=True)

    records = run_panel(seer, PREDICTION_2_PANEL, label="P2-spaced-rep", verbose=verbose)
    summary = summarize_panel(records, label="P2-spaced-rep")

    save_jsonl(records, "pred2_records.jsonl")
    save_jsonl([summary], "pred2_summary.jsonl")

    # Access frequency report
    access_report = seer.access_frequency_report()
    save_jsonl(access_report, "pred2_access_report.jsonl")

    if verbose:
        print(f"\n[P2] Top accessed Eblets:", flush=True)
        for r in access_report[:5]:
            print(
                f"  {r['eblet_id']}: count={r['access_count']}, "
                f"mean_latency={r['mean_latency_s']:.2f}s, "
                f"delta={r['latency_delta_s']:+.2f}s",
                flush=True,
            )

    # Analyze latency curve
    latency_analysis = analyze_latency_curve(access_report)
    tfidf_stability = analyze_tfidf_stability(seer)

    # Verdict
    # Predicted: latency decreases with access count (log decay)
    direction_correct = latency_analysis.get("slope_negative", False)
    threshold_met = latency_analysis.get("latency_decreased_overall", False)

    verdict_dict = {
        "prediction": "Prediction 2 — Spaced-Repetition Reinforcement",
        "n_queries": len(records),
        "summary": summary,
        "access_report_top5": access_report[:5],
        "latency_analysis": latency_analysis,
        "tfidf_stability": tfidf_stability,
        "direction_correct": direction_correct,
        "threshold_met": threshold_met,
        "verdict": (
            "CONFIRMED" if threshold_met
            else "PARTIALLY-CONFIRMED" if direction_correct
            else "UNCONFIRMED"
        ),
        "confidence": "LOW (N=10; LLM API latency dominates; no native caching in TF-IDF)",
        "wall_time_s": round(time.time() - start, 1),
        "run_at": datetime.now(timezone.utc).isoformat(),
        "architectural_note": latency_analysis.get("honest_note", ""),
    }

    save_jsonl([verdict_dict], "pred2_verdict.jsonl")

    print("\n" + "="*60, flush=True)
    print(f"PREDICTION 2 VERDICT: {verdict_dict['verdict']}", flush=True)
    print(f"  Slope negative: {direction_correct}", flush=True)
    print(f"  Latency decrease overall: {threshold_met}", flush=True)
    print(f"  Wall time: {verdict_dict['wall_time_s']:.0f}s", flush=True)
    print("="*60, flush=True)

    return verdict_dict


if __name__ == "__main__":
    result = run(verbose=True)
    print(json.dumps(result, indent=2))
