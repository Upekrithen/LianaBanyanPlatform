"""
K491 — Predictions 3 + 4: Forgetting Curve + Selective Attention

Prediction 3 — Forgetting curve / aging:
  Biological: unused memories decay; demoted to slower-access stores (Ebbinghaus).
  LB analog: cold Eblets (unaccessed for long periods) show resolution-latency penalty
             OR are systematically deprioritized in Eblet-relevance matching.
  Test: group Eblets by recency-of-creation (cold/medium/recent).
        Run queries that should naturally hit cold content.
        Measure resolution behavior of cold vs recent Eblets.
  Predicted: cold Eblets show latency penalty OR deprioritized in relevance.
  Honest expectation: TF-IDF has no time component. Cold Eblets are equally accessible.
                      The forgetting curve does NOT hold natively in TF-IDF.

Prediction 4 — Selective attention:
  Biological: attention modulates which memories activate; attended memory = faster + more accurate.
  LB analog: Seer's Eblet-relevance matching preferentially resolves Eblets matching
             current query-context; attention-modulation analog observable.
  Test: 5 query pairs — primed vs unprimed (same target, different context framing).
        Compare Seer's Eblet-resolution patterns across contextually-primed vs unprimed.
  Predicted: primed queries show concentrated Eblet-resolution on primed-domain Eblets.

REF Staff discipline: observational only.
"""

from __future__ import annotations

import json
import math
import sys
import time
from collections import Counter, defaultdict
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
    concentration_entropy,
    recency_distribution,
    classify_eblet_recency,
    RESULTS_DIR,
)
from empirical_tests.panels import (
    PREDICTION_3_PANEL,
    PREDICTION_4_PAIRS,
    RECENCY_BINS,
)


# ---------------------------------------------------------------------------
# Prediction 3 — Forgetting Curve
# ---------------------------------------------------------------------------

def analyze_cold_retrieval(records: list[dict], seer: InstrumentedSeer) -> dict:
    """
    Analyze whether cold Eblets are deprioritized in retrieval vs recent ones.

    For each query in P3 panel:
    - Identify which Eblets appeared in top-K
    - Classify each by recency (cold/medium/recent)
    - Compute mean rank of cold vs recent Eblets
    - Compute mean relevance score of cold vs recent Eblets
    """
    cold_ranks: list[int] = []
    medium_ranks: list[int] = []
    recent_ranks: list[int] = []

    cold_scores: list[float] = []
    medium_scores: list[float] = []
    recent_scores: list[float] = []

    for record in records:
        ids = record["top_eblet_ids"]
        scores = record["top_eblet_scores"]
        for rank, (eid, score) in enumerate(zip(ids, scores), 1):
            recency = classify_eblet_recency(
                next((eb for eb in seer._eblets if eb.eblet_id == eid), None)
                or type("_", (), {"eblet_id": eid})()
            )
            if recency == "cold":
                cold_ranks.append(rank)
                cold_scores.append(score)
            elif recency == "medium":
                medium_ranks.append(rank)
                medium_scores.append(score)
            elif recency == "recent":
                recent_ranks.append(rank)
                recent_scores.append(score)

    def _mean(lst):
        return round(sum(lst) / len(lst), 4) if lst else None

    mean_cold_rank = _mean(cold_ranks)
    mean_recent_rank = _mean(recent_ranks)
    mean_cold_score = _mean(cold_scores)
    mean_recent_score = _mean(recent_scores)

    # Prediction: cold Eblets have HIGHER rank number (lower priority) or lower scores
    cold_deprioritized = (
        mean_cold_rank is not None and mean_recent_rank is not None
        and mean_cold_rank > mean_recent_rank
    )
    cold_lower_score = (
        mean_cold_score is not None and mean_recent_score is not None
        and mean_cold_score < mean_recent_score
    )

    return {
        "n_cold_appearances": len(cold_ranks),
        "n_medium_appearances": len(medium_ranks),
        "n_recent_appearances": len(recent_ranks),
        "mean_cold_rank": mean_cold_rank,
        "mean_medium_rank": _mean(medium_ranks),
        "mean_recent_rank": mean_recent_rank,
        "mean_cold_score": mean_cold_score,
        "mean_medium_score": _mean(medium_scores),
        "mean_recent_score": mean_recent_score,
        "cold_deprioritized_by_rank": cold_deprioritized,
        "cold_deprioritized_by_score": cold_lower_score,
        "prediction_holds": cold_deprioritized or cold_lower_score,
        "honest_note": (
            "TF-IDF has no time-decay component. Cold Eblets are retrieved with equal "
            "efficiency to recent ones for equivalent content queries. Any rank/score "
            "differences reflect CONTENT relevance, not temporal decay. "
            "The biological forgetting curve does NOT have a native analog in TF-IDF."
        ),
        "recency_bin_definitions": RECENCY_BINS,
    }


def run_prediction3(api_client, verbose: bool = True) -> dict:
    """Full Prediction 3 run."""
    print("\n" + "="*60, flush=True)
    print("PREDICTION 3 — FORGETTING CURVE / AGING", flush=True)
    print(f"Panel: {len(PREDICTION_3_PANEL)} queries targeting cold-region (K475/K482) Eblets", flush=True)
    print("="*60, flush=True)

    start = time.time()

    seer = InstrumentedSeer(api_client=api_client, seer_id="Seer-P3-forgetting")
    print(f"Seer loaded: {seer.eblet_count} Eblets", flush=True)

    # Show Eblet recency distribution
    recency_counts: Counter = Counter(classify_eblet_recency(eb) for eb in seer._eblets)
    print(f"Eblet recency bins: {dict(recency_counts)}", flush=True)

    records = run_panel(seer, PREDICTION_3_PANEL, label="P3-forgetting", verbose=verbose)
    summary = summarize_panel(records, label="P3-forgetting")

    save_jsonl(records, "pred3_records.jsonl")
    save_jsonl([summary], "pred3_summary.jsonl")

    cold_analysis = analyze_cold_retrieval(records, seer)
    save_jsonl([cold_analysis], "pred3_cold_analysis.jsonl")

    if verbose:
        print(f"\n[P3] Cold Eblet mean rank: {cold_analysis['mean_cold_rank']}", flush=True)
        print(f"[P3] Recent Eblet mean rank: {cold_analysis['mean_recent_rank']}", flush=True)
        print(f"[P3] Cold deprioritized: {cold_analysis['prediction_holds']}", flush=True)

    verdict = {
        "prediction": "Prediction 3 — Forgetting Curve / Aging",
        "n_questions": len(records),
        "summary": summary,
        "cold_retrieval_analysis": cold_analysis,
        "eblet_recency_distribution": dict(recency_counts),
        "direction_correct": cold_analysis["prediction_holds"],
        "threshold_met": cold_analysis["cold_deprioritized_by_score"],
        "verdict": (
            "PARTIALLY-CONFIRMED" if cold_analysis["prediction_holds"]
            else "UNCONFIRMED"
        ),
        "confidence": "LOW (N=5; content-similarity drives TF-IDF, not temporal decay; architectural fact)",
        "wall_time_s": round(time.time() - start, 1),
        "run_at": datetime.now(timezone.utc).isoformat(),
        "architectural_note": cold_analysis["honest_note"],
    }

    save_jsonl([verdict], "pred3_verdict.jsonl")

    print("\n" + "="*60, flush=True)
    print(f"PREDICTION 3 VERDICT: {verdict['verdict']}", flush=True)
    print(f"  Cold deprioritized by rank: {cold_analysis['cold_deprioritized_by_rank']}", flush=True)
    print(f"  Cold deprioritized by score: {cold_analysis['cold_deprioritized_by_score']}", flush=True)
    print(f"  Wall time: {verdict['wall_time_s']:.0f}s", flush=True)
    print("="*60, flush=True)

    return verdict


# ---------------------------------------------------------------------------
# Prediction 4 — Selective Attention
# ---------------------------------------------------------------------------

def run_attention_pair(
    seer: InstrumentedSeer,
    pair,
    verbose: bool = True,
) -> dict:
    """
    Run one primed/unprimed query pair.
    Returns concentration analysis.
    """
    if verbose:
        print(f"\n  [P4-{pair.pair_id}] UNPRIMED: {pair.unprimed.question[:70]}...", flush=True)
    unprimed_result = seer.query(pair.unprimed.question, verbose_provenance=False)
    unprimed_conc = source_concentration(unprimed_result.top_eblets)
    unprimed_entropy = concentration_entropy(unprimed_conc)

    if verbose:
        print(f"  [P4-{pair.pair_id}] PRIMED:   {pair.primed.question[:70]}...", flush=True)
    primed_result = seer.query(pair.primed.question, verbose_provenance=False)
    primed_conc = source_concentration(primed_result.top_eblets)
    primed_entropy = concentration_entropy(primed_conc)

    # Expected concentrated source appears more in primed?
    expected_src = pair.expected_concentrated_source
    primed_target_count = primed_conc.get(expected_src, 0)
    unprimed_target_count = unprimed_conc.get(expected_src, 0)

    attention_focused = (
        primed_entropy < unprimed_entropy  # lower entropy = more concentrated
        or primed_target_count > unprimed_target_count  # more from expected source
    )

    if verbose:
        print(
            f"  -> Unprimed entropy={unprimed_entropy:.4f}, "
            f"Primed entropy={primed_entropy:.4f} "
            f"({'CONCENTRATED' if attention_focused else 'no concentration'})",
            flush=True,
        )

    return {
        "pair_id": pair.pair_id,
        "expected_concentrated_source": expected_src,
        "unprimed_qid": pair.unprimed.qid,
        "primed_qid": pair.primed.qid,
        "unprimed_concentration": unprimed_conc,
        "primed_concentration": primed_conc,
        "unprimed_entropy": unprimed_entropy,
        "primed_entropy": primed_entropy,
        "entropy_delta": round(primed_entropy - unprimed_entropy, 4),
        "unprimed_target_count": unprimed_target_count,
        "primed_target_count": primed_target_count,
        "target_count_delta": primed_target_count - unprimed_target_count,
        "attention_focused": attention_focused,
        "unprimed_top_eblets": [eb.eblet_id for eb, _ in unprimed_result.top_eblets[:4]],
        "primed_top_eblets": [eb.eblet_id for eb, _ in primed_result.top_eblets[:4]],
        "unprimed_cost_usd": unprimed_result.cost_usd_est,
        "primed_cost_usd": primed_result.cost_usd_est,
    }


def run_prediction4(api_client, verbose: bool = True) -> dict:
    """Full Prediction 4 run."""
    print("\n" + "="*60, flush=True)
    print("PREDICTION 4 — SELECTIVE ATTENTION", flush=True)
    print(f"Panel: {len(PREDICTION_4_PAIRS)} primed/unprimed pairs", flush=True)
    print("="*60, flush=True)

    start = time.time()

    seer = InstrumentedSeer(api_client=api_client, seer_id="Seer-P4-attention")
    print(f"Seer loaded: {seer.eblet_count} Eblets", flush=True)

    pair_results = []
    for pair in PREDICTION_4_PAIRS:
        pair_result = run_attention_pair(seer, pair, verbose=verbose)
        pair_results.append(pair_result)

    save_jsonl(pair_results, "pred4_pair_results.jsonl")

    # Aggregate: how many pairs showed attention focusing?
    n_focused = sum(1 for r in pair_results if r["attention_focused"])
    n_total = len(pair_results)
    focus_rate = n_focused / n_total if n_total > 0 else 0.0

    # Aggregate entropy deltas
    mean_entropy_delta = sum(r["entropy_delta"] for r in pair_results) / max(1, n_total)
    mean_target_count_delta = sum(r["target_count_delta"] for r in pair_results) / max(1, n_total)

    # Prediction: primed queries show concentrated Eblet-resolution (lower entropy)
    direction_correct = mean_entropy_delta < 0  # negative = more concentrated when primed
    threshold_met = n_focused >= math.ceil(n_total * 0.6)  # >=60% of pairs focused

    verdict = {
        "prediction": "Prediction 4 — Selective Attention",
        "n_pairs": n_total,
        "n_attention_focused": n_focused,
        "focus_rate": round(focus_rate, 4),
        "mean_entropy_delta": round(mean_entropy_delta, 4),
        "mean_target_count_delta": round(mean_target_count_delta, 3),
        "direction_correct": direction_correct,
        "threshold_met": threshold_met,
        "verdict": (
            "CONFIRMED" if threshold_met and direction_correct
            else "PARTIALLY-CONFIRMED" if direction_correct or n_focused >= 1
            else "UNCONFIRMED"
        ),
        "pair_results": pair_results,
        "confidence": "MEDIUM (N=5 pairs; TF-IDF naturally responds to query-term concentration — expected to hold)",
        "wall_time_s": round(time.time() - start, 1),
        "run_at": datetime.now(timezone.utc).isoformat(),
        "architectural_note": (
            "TF-IDF responds to query-term concentration by design: primed queries with "
            "session-specific terms (e.g., 'K475', 'cranewell') will naturally score K475 "
            "Eblets higher. This is the biological analog: attention = query-term priming."
        ),
    }

    save_jsonl([verdict], "pred4_verdict.jsonl")

    print("\n" + "="*60, flush=True)
    print(f"PREDICTION 4 VERDICT: {verdict['verdict']}", flush=True)
    print(f"  Pairs focused: {n_focused}/{n_total} ({focus_rate*100:.0f}%)", flush=True)
    print(f"  Mean entropy delta: {mean_entropy_delta:+.4f} (negative = more concentrated)", flush=True)
    print(f"  Wall time: {verdict['wall_time_s']:.0f}s", flush=True)
    print("="*60, flush=True)

    return verdict


def run(verbose: bool = True) -> tuple[dict, dict]:
    """Run both Prediction 3 and Prediction 4."""
    api_client = load_api_client(verbose=verbose)

    p3_result = run_prediction3(api_client, verbose=verbose)
    p4_result = run_prediction4(api_client, verbose=verbose)

    return p3_result, p4_result


if __name__ == "__main__":
    p3, p4 = run(verbose=True)
    print("\n=== P3 ===")
    print(json.dumps(p3, indent=2))
    print("\n=== P4 ===")
    print(json.dumps(p4, indent=2))
