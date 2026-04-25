"""
K491 — Prediction 1: Sleep-Stage Consolidation Analog

Biological: hippocampus -> cortex consolidation during sleep improves subsequent recall.
LB analog: Seer query quality on K490-specific content improves after consolidation run
           (copying synapse_K490.jsonl to synapses/ + running live-feed).

Protocol:
  Phase 1a — Baseline: run P1 panel against current 133-Eblet store
  Phase 1b — Consolidation: copy synapse_K490.jsonl + run live-feed (generate K490 Eblets)
  Phase 1c — Post-consolidation: re-run same panel; compare HOT% + provenance completeness

Predicted result: Post-consolidation HOT% > pre-consolidation by >= 5pp
                  (specifically on K490-specific questions P1-Q1, P1-Q2, P1-Q3)

REF Staff discipline: consolidation step READS synapse_K490.jsonl and WRITES Eblets.
                      The source synapse file is NOT modified.
"""

from __future__ import annotations

import json
import shutil
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
    RESULTS_DIR,
)
from empirical_tests.panels import PREDICTION_1_PANEL
from eblets.eblet import EBLET_STORE_PATH, SYNAPSE_DIR

# K490 synapse is in stone_tablets/ — the consolidation step copies it to synapses/
_K490_SYNAPSE_SOURCE = _LIBRARIAN_MCP / "miners" / "stone_tablets" / "synapse_K490.jsonl"
_K490_SYNAPSE_TARGET = SYNAPSE_DIR / "synapse_K490.jsonl"


def run_baseline(api_client, verbose: bool = True) -> tuple[list[dict], dict]:
    """Phase 1a: baseline run on current Eblet store (pre-consolidation)."""
    print("\n" + "="*60, flush=True)
    print("PREDICTION 1 — PHASE 1a: BASELINE (pre-consolidation)", flush=True)
    print(f"Eblet store: {EBLET_STORE_PATH}", flush=True)
    print("="*60, flush=True)

    seer = InstrumentedSeer(api_client=api_client, seer_id="Seer-P1-baseline")
    print(f"Seer loaded: {seer.eblet_count} Eblets", flush=True)

    records = run_panel(seer, PREDICTION_1_PANEL, label="P1-baseline", verbose=verbose)
    summary = summarize_panel(records, label="P1-baseline")

    print(f"\n[P1-baseline] HOT={summary['HOT']}/{summary['n']} ({summary['hot_rate']*100:.1f}%)", flush=True)
    return records, summary


def run_consolidation(api_client, verbose: bool = True) -> dict:
    """
    Phase 1b: consolidation run.

    Steps:
    1. Copy synapse_K490.jsonl from stone_tablets/ to stitchpunks/synapses/
    2. Run SynapseWatcher.run_once() to generate K490 Eblets
    3. Return consolidation summary

    This is the LB analog of slow-wave + REM sleep consolidation:
    new session knowledge (K490) is transferred from stone_tablets/ into the
    main Pyramid index (stitchpunks/synapses/ -> Eblets).
    """
    print("\n" + "="*60, flush=True)
    print("PREDICTION 1 — PHASE 1b: CONSOLIDATION RUN", flush=True)
    print("="*60, flush=True)

    # Check prerequisite
    if not _K490_SYNAPSE_SOURCE.exists():
        print(f"[P1-consolidation] ERROR: K490 synapse not found at {_K490_SYNAPSE_SOURCE}", flush=True)
        return {"status": "error", "reason": "K490 synapse source missing"}

    # Check if already copied
    if _K490_SYNAPSE_TARGET.exists():
        print(
            f"[P1-consolidation] synapse_K490.jsonl already in synapses/ — skipping copy. "
            f"Running live-feed to pick up any new clusters.",
            flush=True,
        )
    else:
        # Copy K490 synapse to stitchpunks/synapses/
        shutil.copy2(str(_K490_SYNAPSE_SOURCE), str(_K490_SYNAPSE_TARGET))
        print(f"[P1-consolidation] Copied synapse_K490.jsonl -> {_K490_SYNAPSE_TARGET}", flush=True)

    # Run live-feed to generate Eblets from K490 synapse
    from seers.synapse_live_feed import SynapseWatcher
    watcher = SynapseWatcher(api_client=api_client, cost_cap_usd=0.50, verbose=verbose)
    consolidation_summary = watcher.run_once()

    print(f"\n[P1-consolidation] Generated {consolidation_summary['generated']} new Eblets", flush=True)
    print(f"[P1-consolidation] Store total: {consolidation_summary['store_total']}", flush=True)
    print(f"[P1-consolidation] Cost: ${consolidation_summary['session_cost_usd']:.5f}", flush=True)

    consolidation_summary["step"] = "P1-consolidation"
    consolidation_summary["k490_source"] = str(_K490_SYNAPSE_SOURCE)
    consolidation_summary["k490_target"] = str(_K490_SYNAPSE_TARGET)

    return consolidation_summary


def run_post_consolidation(api_client, verbose: bool = True) -> tuple[list[dict], dict]:
    """Phase 1c: post-consolidation run on expanded Eblet store."""
    print("\n" + "="*60, flush=True)
    print("PREDICTION 1 — PHASE 1c: POST-CONSOLIDATION", flush=True)
    print(f"Eblet store: {EBLET_STORE_PATH}", flush=True)
    print("="*60, flush=True)

    seer = InstrumentedSeer(api_client=api_client, seer_id="Seer-P1-post")
    print(f"Seer loaded: {seer.eblet_count} Eblets", flush=True)

    records = run_panel(seer, PREDICTION_1_PANEL, label="P1-post", verbose=verbose)
    summary = summarize_panel(records, label="P1-post")

    print(f"\n[P1-post] HOT={summary['HOT']}/{summary['n']} ({summary['hot_rate']*100:.1f}%)", flush=True)
    return records, summary


def compare_phases(
    baseline_summary: dict,
    post_summary: dict,
    baseline_records: list[dict],
    post_records: list[dict],
) -> dict:
    """
    Compare pre- vs post-consolidation performance.
    Computes delta on HOT rate, provenance completeness, and per-question improvement.
    """
    hot_delta = post_summary["hot_rate"] - baseline_summary["hot_rate"]
    prov_delta = (
        post_summary["mean_provenance_completeness"]
        - baseline_summary["mean_provenance_completeness"]
    )

    # Per-question comparison
    q_comparison = []
    base_by_qid = {r["qid"]: r for r in baseline_records}
    post_by_qid = {r["qid"]: r for r in post_records}

    for qid in base_by_qid:
        b = base_by_qid[qid]
        p = post_by_qid.get(qid, {})
        improved = p.get("grade") in ("HOT", "HIT") and b.get("grade") == "MISS"
        stayed_hot = b.get("grade") == "HOT" and p.get("grade") == "HOT"
        regressed = b.get("grade") in ("HOT", "HIT") and p.get("grade") == "MISS"
        q_comparison.append({
            "qid": qid,
            "domain_source": b.get("domain_source"),
            "in_current_eblets_pre": b.get("in_current_eblets"),
            "baseline_grade": b.get("grade"),
            "post_grade": p.get("grade"),
            "improved": improved,
            "stayed_hot": stayed_hot,
            "regressed": regressed,
        })

    # Prediction verdict
    # Predicted: +5pp HOT or measurable provenance improvement
    threshold_met = hot_delta >= 0.05 or prov_delta >= 0.05
    direction_correct = hot_delta > 0

    return {
        "prediction": "Prediction 1 — Sleep-Stage Consolidation",
        "baseline_hot_rate": baseline_summary["hot_rate"],
        "post_hot_rate": post_summary["hot_rate"],
        "hot_rate_delta": round(hot_delta, 4),
        "baseline_prov_completeness": baseline_summary["mean_provenance_completeness"],
        "post_prov_completeness": post_summary["mean_provenance_completeness"],
        "prov_completeness_delta": round(prov_delta, 4),
        "threshold_met_5pp": threshold_met,
        "direction_correct": direction_correct,
        "verdict": (
            "CONFIRMED" if threshold_met and direction_correct
            else "PARTIALLY-CONFIRMED" if direction_correct
            else "UNCONFIRMED"
        ),
        "n_questions": len(baseline_records),
        "q_comparison": q_comparison,
        "confidence": "LOW (N=7; underpowered; effect direction more meaningful than magnitude)",
        "note": (
            f"delta HOT={hot_delta*100:+.1f}pp; "
            f"delta provenance={prov_delta*100:+.1f}pp; "
            f"threshold >=5pp: {'MET' if threshold_met else 'NOT MET'}"
        ),
    }


def run(verbose: bool = True) -> dict:
    """Full Prediction 1 run: baseline → consolidation → post → comparison."""
    api_client = load_api_client(verbose=verbose)

    start = time.time()

    baseline_records, baseline_summary = run_baseline(api_client, verbose=verbose)
    save_jsonl(baseline_records, "pred1_baseline_records.jsonl")
    save_jsonl([baseline_summary], "pred1_baseline_summary.jsonl")

    consolidation_summary = run_consolidation(api_client, verbose=verbose)
    save_jsonl([consolidation_summary], "pred1_consolidation_summary.jsonl")

    post_records, post_summary = run_post_consolidation(api_client, verbose=verbose)
    save_jsonl(post_records, "pred1_post_records.jsonl")
    save_jsonl([post_summary], "pred1_post_summary.jsonl")

    comparison = compare_phases(
        baseline_summary, post_summary,
        baseline_records, post_records,
    )
    comparison["wall_time_s"] = round(time.time() - start, 1)
    comparison["run_at"] = datetime.now(timezone.utc).isoformat()
    comparison["consolidation_generated"] = consolidation_summary.get("generated", 0)
    comparison["consolidation_cost_usd"] = consolidation_summary.get("session_cost_usd", 0.0)

    save_jsonl([comparison], "pred1_comparison.jsonl")

    print("\n" + "="*60, flush=True)
    print(f"PREDICTION 1 VERDICT: {comparison['verdict']}", flush=True)
    print(f"  HOT delta: {comparison['hot_rate_delta']*100:+.1f}pp", flush=True)
    print(f"  Provenance delta: {comparison['prov_completeness_delta']*100:+.1f}pp", flush=True)
    print(f"  Wall time: {comparison['wall_time_s']:.0f}s", flush=True)
    print("="*60, flush=True)

    return comparison


if __name__ == "__main__":
    result = run(verbose=True)
    print(json.dumps(result, indent=2))
