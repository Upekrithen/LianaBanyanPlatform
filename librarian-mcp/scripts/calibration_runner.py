"""
SUBSTRATE SAVINGS CALIBRATION RUNNER — K506 Phase E
=====================================================
Reads substrate_savings_log.jsonl and computes empirical cold multipliers
from actual accumulated data. Intended to run every 30 days (cron or
GitHub Action). Writes calibration results to substrate_savings_calibration_log.jsonl.
Updates dashboard's multiplier status from 'provisional' toward 'calibrated'.

Usage:
    python librarian-mcp/scripts/calibration_runner.py [--write] [--min-sessions N]

Options:
    --write         Commit calibration results to calibration_log.jsonl (default: dry-run)
    --min-sessions N  Minimum sessions per agent required to emit calibrated value (default: 5)
    --window-days N   How many days of data to use for calibration (default: 90)
    --verbose       Print per-agent detail

HONEST MATH:
    empirical_multiplier = mean(counterfactual_cost / actual_cost) per agent
    This is tautological from current records (records were WRITTEN using the
    provisional multiplier). So Phase E calibration is only meaningful when we
    have PAIRED sessions: some with-substrate, some without-substrate (control).

    Until paired control data is available:
    - The runner computes consistency metrics (variance of reported multipliers,
      session count, estimated-vs-measured ratio) and flags calibration confidence.
    - It does NOT change the dashboard multipliers yet.
    - When paired control data accumulates (from R14/R15 quarterly runs or from
      Test Frame members who run cold vs. hot comparisons), the empirical
      multiplier will be computed from the ACTUAL cold/hot ratio.

    This is the honest Phase E. We ship the infrastructure; we don't manufacture
    empirical confidence we don't yet have.

Output schema (calibration_log.jsonl):
    {
      "ts": "...",
      "calibration_run": "2026-Q2",
      "by_agent": {
        "BISHOP": {
          "sessions": N, "measured_sessions": M, "estimated_sessions": E,
          "mean_actual_cost": X, "mean_counterfactual_cost": Y,
          "provisional_multiplier": 3.0,
          "empirical_multiplier": null (until paired control available),
          "calibration_status": "provisional|needs_control_data|calibrated",
          "variance_note": "...",
          "confidence": "low|medium|high"
        },
        ...
      },
      "control_pairs_available": false,
      "next_calibration_due": "...",
      "note": "..."
    }
"""

import argparse
import json
import math
import statistics
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

SCRIPT_DIR = Path(__file__).parent.resolve()
LIBRARIAN_ROOT = SCRIPT_DIR.parent
SAVINGS_LOG = LIBRARIAN_ROOT / "stitchpunks" / "data" / "substrate_savings_log.jsonl"
CALIBRATION_LOG = LIBRARIAN_ROOT / "stitchpunks" / "data" / "substrate_savings_calibration_log.jsonl"

PROVISIONAL_MULTIPLIERS = {
    "BISHOP": 3.0,
    "KNIGHT": 2.5,
    "PAWN":   3.5,
    "ROOK":   2.5,
}

CONFIDENCE_THRESHOLDS = {
    "high":   10,  # 10+ sessions → high confidence
    "medium":  5,  # 5-9 sessions → medium confidence
    "low":     1,  # 1-4 sessions → low confidence
}


def read_log() -> list[dict]:
    if not SAVINGS_LOG.exists():
        return []
    raw = SAVINGS_LOG.read_text("utf-8").strip()
    if not raw:
        return []
    return [json.loads(l) for l in raw.splitlines() if l.strip()]


def filter_by_window(records: list[dict], days: int) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = []
    for r in records:
        try:
            ts = datetime.fromisoformat(r["ts"])
            if ts >= cutoff:
                result.append(r)
        except Exception:
            pass
    return result


def confidence_label(n: int) -> str:
    if n >= CONFIDENCE_THRESHOLDS["high"]:
        return "high"
    if n >= CONFIDENCE_THRESHOLDS["medium"]:
        return "medium"
    return "low"


def analyze_agent(agent: str, records: list[dict]) -> dict:
    recs = [r for r in records if r.get("agent") == agent]
    if not recs:
        return {
            "sessions": 0,
            "status": "no_data",
            "provisional_multiplier": PROVISIONAL_MULTIPLIERS.get(agent, 2.5),
            "empirical_multiplier": None,
            "calibration_status": "no_data",
            "confidence": "none",
        }

    measured = [r for r in recs if not r.get("estimated", False)]
    estimated = [r for r in recs if r.get("estimated", False)]

    actual_costs = [r.get("actual_cost_usd", 0) for r in recs]
    counterfactual_costs = [r.get("counterfactual_cost_usd", 0) for r in recs]
    reported_multipliers = [r.get("cold_multiplier", PROVISIONAL_MULTIPLIERS.get(agent, 2.5)) for r in recs]

    mean_actual = statistics.mean(actual_costs) if actual_costs else 0
    mean_counterfactual = statistics.mean(counterfactual_costs) if counterfactual_costs else 0
    mean_reported_mult = statistics.mean(reported_multipliers) if reported_multipliers else 0

    # Variance of reported multipliers (should be near 0 since they're all provisional)
    mult_variance = statistics.variance(reported_multipliers) if len(reported_multipliers) > 1 else 0.0

    # Empirical multiplier: ratio of mean counterfactual to mean actual.
    # NOTE: Tautological until paired control data available — because counterfactual
    # was COMPUTED from actual × provisional_multiplier, not measured independently.
    ratio = mean_counterfactual / mean_actual if mean_actual > 0 else None
    empirical_status = "provisional"
    empirical_mult = None

    # We'll emit the ratio but flag it as tautological
    if ratio is not None:
        empirical_mult = round(ratio, 3)
        empirical_status = "tautological_until_control_pairs_available"

    n = len(recs)
    conf = confidence_label(n)
    savings_total = sum(r.get("session_savings_usd", 0) for r in recs)

    return {
        "sessions": n,
        "measured_sessions": len(measured),
        "estimated_sessions": len(estimated),
        "mean_actual_cost_usd": round(mean_actual, 4),
        "mean_counterfactual_cost_usd": round(mean_counterfactual, 4),
        "reported_multiplier_mean": round(mean_reported_mult, 3),
        "reported_multiplier_variance": round(mult_variance, 6),
        "provisional_multiplier": PROVISIONAL_MULTIPLIERS.get(agent, 2.5),
        "empirical_multiplier": empirical_mult,
        "empirical_multiplier_note": empirical_status,
        "total_savings_usd": round(savings_total, 4),
        "calibration_status": empirical_status,
        "confidence": conf,
    }


def run_calibration(min_sessions: int, window_days: int) -> dict:
    all_records = read_log()
    windowed = filter_by_window(all_records, window_days) if window_days > 0 else all_records

    agents = ["BISHOP", "KNIGHT", "PAWN", "ROOK"]
    by_agent = {agent: analyze_agent(agent, windowed) for agent in agents}

    # Check if any agent has enough sessions for meaningful calibration
    has_enough = any(
        v.get("sessions", 0) >= min_sessions for v in by_agent.values()
    )

    # Compute overall
    total_sessions = sum(v.get("sessions", 0) for v in by_agent.values())
    total_savings = sum(v.get("total_savings_usd", 0) for v in by_agent.values())

    next_due = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d")

    result = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "calibration_run": datetime.now(timezone.utc).strftime("calibration-%Y-%m-%d"),
        "window_days": window_days,
        "total_records_available": len(all_records),
        "records_in_window": len(windowed),
        "total_sessions": total_sessions,
        "total_savings_usd": round(total_savings, 4),
        "by_agent": by_agent,
        "has_minimum_data": has_enough,
        "control_pairs_available": False,
        "control_pairs_note": (
            "Empirical multiplier calibration requires paired sessions: some with-substrate, "
            "some without (cold control). Until R14/R15 quarterly runs or Test Frame cold-vs-hot "
            "pairs accumulate, reported multipliers are tautological (computed from provisional). "
            "This is honest — we flag it clearly rather than manufacturing false precision."
        ),
        "next_calibration_due": next_due,
        "dashboard_multiplier_status": "provisional" if not has_enough else "provisional (data accumulating)",
    }

    return result


def append_calibration_record(record: dict):
    CALIBRATION_LOG.parent.mkdir(parents=True, exist_ok=True)
    existing = CALIBRATION_LOG.read_text("utf-8").strip() if CALIBRATION_LOG.exists() else ""
    lines = existing.split("\n") if existing else []
    lines.append(json.dumps(record))
    CALIBRATION_LOG.write_text("\n".join(lines) + "\n", "utf-8")
    return len(lines)


def main():
    parser = argparse.ArgumentParser(description="K506 Phase E substrate savings calibration runner")
    parser.add_argument("--write", action="store_true", help="Commit results to calibration_log.jsonl (default: dry-run)")
    parser.add_argument("--min-sessions", type=int, default=5, dest="min_sessions",
                        help="Minimum sessions per agent for calibrated status")
    parser.add_argument("--window-days", type=int, default=90, dest="window_days",
                        help="Days of data to use (0 = all-time)")
    parser.add_argument("--verbose", action="store_true", help="Print per-agent detail")
    args = parser.parse_args()

    print("K506 Phase E — Substrate Savings Calibration Runner")
    print("====================================================")
    print(f"  Log: {SAVINGS_LOG}")
    print(f"  Window: {args.window_days}d  Min sessions: {args.min_sessions}")
    print(f"  Mode: {'WRITE' if args.write else 'DRY-RUN (pass --write to commit)'}")
    print()

    if not SAVINGS_LOG.exists():
        print("[calibration] No savings log yet. Run some sessions first.")
        return

    result = run_calibration(args.min_sessions, args.window_days)

    print(f"  Records available: {result['total_records_available']} ({result['records_in_window']} in {args.window_days}d window)")
    print(f"  Total sessions:    {result['total_sessions']}")
    print(f"  Total savings:     ${result['total_savings_usd']:.4f}")
    print(f"  Control pairs:     {result['control_pairs_available']} (required for true empirical calibration)")
    print(f"  Dashboard status:  {result['dashboard_multiplier_status']}")
    print()

    for agent, data in result["by_agent"].items():
        n = data.get("sessions", 0)
        if n == 0:
            continue
        print(f"  {agent}: {n} sessions ({data['measured_sessions']} measured, {data['estimated_sessions']} estimated)")
        if args.verbose:
            print(f"    Provisional mult:  {data['provisional_multiplier']}×")
            print(f"    Empirical mult:    {data['empirical_multiplier']} [{data['empirical_multiplier_note']}]")
            print(f"    Confidence:        {data['confidence']}")
            print(f"    Total savings:     ${data['total_savings_usd']:.4f}")

    if args.write:
        n = append_calibration_record(result)
        print(f"\n[calibration] Written to {CALIBRATION_LOG} ({n} total calibration records)")
    else:
        print("\n[calibration] Dry-run complete. Pass --write to commit to calibration_log.jsonl")


if __name__ == "__main__":
    main()
