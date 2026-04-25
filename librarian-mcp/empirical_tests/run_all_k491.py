"""
K491 — Master Runner: All Four Predictions + Wheelbarrow Replication

Runs all phases in order:
  Phase B (Prediction 1) — Sleep-stage consolidation
  Phase C (Prediction 2) — Spaced repetition
  Phase D (Predictions 3+4) — Forgetting + attention
  Phase E — Wheelbarrow Empirical replication at scale

Outputs:
  empirical_tests/results/pred1_*.jsonl
  empirical_tests/results/pred2_*.jsonl
  empirical_tests/results/pred3_*.jsonl
  empirical_tests/results/pred4_*.jsonl
  empirical_tests/results/wheelbarrow_replication.jsonl
  empirical_tests/results/k491_master_summary.jsonl

Usage:
  cd librarian-mcp
  python -m empirical_tests.run_all_k491

Or run individual predictions:
  python -m empirical_tests.pred1_sleep_stage
  python -m empirical_tests.pred2_spaced_rep
  python -m empirical_tests.pred34_forgetting_attention
  python -m empirical_tests.wheelbarrow_replication
"""

from __future__ import annotations

import json
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

from empirical_tests.harness import save_jsonl, RESULTS_DIR


def run_all(verbose: bool = True) -> dict:
    """Run all K491 empirical tests. Returns master summary."""
    total_start = time.time()
    print("\n" + "="*70, flush=True)
    print("K491 — BRAIN-PATTERN EMPIRICAL TESTS: FULL RUN", flush=True)
    print(f"Started: {datetime.now(timezone.utc).isoformat()}", flush=True)
    print("="*70, flush=True)

    results = {}

    # Phase B — Prediction 1
    print("\n[K491] Running Phase B: Prediction 1 (Sleep-Stage Consolidation)...", flush=True)
    try:
        from empirical_tests.pred1_sleep_stage import run as run_p1
        results["prediction_1"] = run_p1(verbose=verbose)
    except Exception as exc:
        print(f"[K491] ERROR in Prediction 1: {exc}", flush=True)
        results["prediction_1"] = {"error": str(exc), "verdict": "ERROR"}

    # Phase C — Prediction 2
    print("\n[K491] Running Phase C: Prediction 2 (Spaced Repetition)...", flush=True)
    try:
        from empirical_tests.pred2_spaced_rep import run as run_p2
        results["prediction_2"] = run_p2(verbose=verbose)
    except Exception as exc:
        print(f"[K491] ERROR in Prediction 2: {exc}", flush=True)
        results["prediction_2"] = {"error": str(exc), "verdict": "ERROR"}

    # Phase D — Predictions 3 + 4
    print("\n[K491] Running Phase D: Predictions 3+4 (Forgetting + Attention)...", flush=True)
    try:
        from empirical_tests.pred34_forgetting_attention import run as run_p34
        p3, p4 = run_p34(verbose=verbose)
        results["prediction_3"] = p3
        results["prediction_4"] = p4
    except Exception as exc:
        print(f"[K491] ERROR in Predictions 3+4: {exc}", flush=True)
        results["prediction_3"] = {"error": str(exc), "verdict": "ERROR"}
        results["prediction_4"] = {"error": str(exc), "verdict": "ERROR"}

    # Phase E — Wheelbarrow Replication
    print("\n[K491] Running Phase E: Wheelbarrow Empirical Replication...", flush=True)
    try:
        from empirical_tests.wheelbarrow_replication import run as run_wb
        results["wheelbarrow"] = run_wb(verbose=verbose)
    except Exception as exc:
        print(f"[K491] ERROR in Wheelbarrow: {exc}", flush=True)
        results["wheelbarrow"] = {"error": str(exc)}

    # Master summary
    verdicts = {
        "prediction_1": results.get("prediction_1", {}).get("verdict", "ERROR"),
        "prediction_2": results.get("prediction_2", {}).get("verdict", "ERROR"),
        "prediction_3": results.get("prediction_3", {}).get("verdict", "ERROR"),
        "prediction_4": results.get("prediction_4", {}).get("verdict", "ERROR"),
    }

    confirmed_count = sum(
        1 for v in verdicts.values()
        if v in ("CONFIRMED", "PARTIALLY-CONFIRMED")
    )

    wheelbarrow_comparable = results.get("wheelbarrow", {}).get("comparable_measurement", False)
    wheelbarrow_rate = results.get("wheelbarrow", {}).get("keystone_anchor_rate", 0.0)

    # Success criteria from K491 prompt:
    # 1. All 4 predictions tested ✅/❌
    # 2. >= 2 of 4 empirically supported ✅/❌
    # 3. Wheelbarrow comparable measurement ✅/❌
    # 4. Virtual Memory paper §7 updated ✅/❌ (Phase F)
    # 5. Wheelbarrow Empirical paper §5 updated ✅/❌ (Phase F)
    # 6. Test infrastructure preserved ✅/❌

    master_summary = {
        "session": "K491",
        "bishop_session": "B123",
        "run_at": datetime.now(timezone.utc).isoformat(),
        "wall_time_s": round(time.time() - total_start, 1),
        "verdicts": verdicts,
        "confirmed_count": confirmed_count,
        "wheelbarrow_comparable": wheelbarrow_comparable,
        "wheelbarrow_keystone_rate": wheelbarrow_rate,
        "success_criteria": {
            "1_all_predictions_tested": all(v != "ERROR" for v in verdicts.values()),
            "2_at_least_2_confirmed": confirmed_count >= 2,
            "3_wheelbarrow_comparable": wheelbarrow_comparable,
            "4_virtual_memory_paper_updated": False,  # Phase F — not yet
            "5_wheelbarrow_empirical_paper_updated": False,  # Phase F — not yet
            "6_test_infrastructure_preserved": True,  # empirical_tests/ exists
        },
        "criteria_met": sum([
            all(v != "ERROR" for v in verdicts.values()),
            confirmed_count >= 2,
            wheelbarrow_comparable,
            False,  # paper updates — Phase F
            False,  # paper updates — Phase F
            True,  # infrastructure preserved
        ]),
        "session_status": "PARTIAL — Phase F (papers + synapse + commit) pending",
        "p1_detail": {
            "baseline_hot_rate": results.get("prediction_1", {}).get("baseline_hot_rate"),
            "post_hot_rate": results.get("prediction_1", {}).get("post_hot_rate"),
            "hot_delta": results.get("prediction_1", {}).get("hot_rate_delta"),
            "consolidation_generated": results.get("prediction_1", {}).get("consolidation_generated"),
        },
        "p2_detail": {
            "n_queries": 10,
            "latency_decreased": results.get("prediction_2", {}).get("threshold_met"),
        },
        "p3_detail": {
            "cold_deprioritized": results.get("prediction_3", {}).get("direction_correct"),
        },
        "p4_detail": {
            "focus_rate": results.get("prediction_4", {}).get("focus_rate"),
            "mean_entropy_delta": results.get("prediction_4", {}).get("mean_entropy_delta"),
        },
    }

    save_jsonl([master_summary], "k491_master_summary.jsonl")

    print("\n" + "="*70, flush=True)
    print("K491 MASTER SUMMARY", flush=True)
    print(f"  P1 (Sleep-stage): {verdicts['prediction_1']}", flush=True)
    print(f"  P2 (Spaced rep):  {verdicts['prediction_2']}", flush=True)
    print(f"  P3 (Forgetting):  {verdicts['prediction_3']}", flush=True)
    print(f"  P4 (Attention):   {verdicts['prediction_4']}", flush=True)
    print(f"  Confirmed: {confirmed_count}/4", flush=True)
    print(f"  Wheelbarrow: {wheelbarrow_rate*100:.1f}% (comparable: {wheelbarrow_comparable})", flush=True)
    print(f"  Criteria met: {master_summary['criteria_met']}/6", flush=True)
    print(f"  Total wall time: {master_summary['wall_time_s']:.0f}s", flush=True)
    print("="*70, flush=True)

    return master_summary


if __name__ == "__main__":
    summary = run_all(verbose=True)
    print("\n=== MASTER SUMMARY ===")
    print(json.dumps(summary, indent=2))
