"""
Component 9 — Reconciliation Report Generator
KN026 / #2299 / BP003

Produces PAPER Part 2 scaffold:
  - Predicted vs measured tables (per-bean and aggregate)
  - Scenario verdict (A/B/C per #2298 pre-registration)
  - Residuals (measured - predicted per bean)
  - Falsification check (did hypothesis survive?)

Per #2298: discrepancies between prediction and measurement are FEATURES,
not bugs. Surface them honestly.

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _compute_residuals(beans_landed: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Compute residuals (measured - predicted) per bean.

    Beans without measured_pp are skipped.
    """
    residuals = []
    for bean in beans_landed:
        measured = bean.get("measured_pp")
        predicted = bean.get("predicted_pp")
        if measured is not None and predicted is not None:
            residuals.append({
                "bean_id": bean.get("bean_id", "?"),
                "pod_id": bean.get("pod_id", "?"),
                "predicted_pp": float(predicted),
                "measured_pp": float(measured),
                "residual_pp": round(float(measured) - float(predicted), 2),
                "pct_error": round(
                    (float(measured) - float(predicted)) / max(float(predicted), 0.01) * 100, 1
                ),
            })
    return residuals


def _scenario_verdict(
    scenarios: List[Any],
    residuals: List[Dict[str, Any]],
    falsification_criteria: List[str],
    total_measured_pp: float,
    total_predicted_pp: float,
) -> Dict[str, Any]:
    """
    Determine which scenario (A/B/C) the test result maps to.

    By convention in #2298 papers:
      Scenario A = hypothesis confirmed (measured within predicted CI)
      Scenario B = hypothesis partially confirmed (mixed results)
      Scenario C = hypothesis falsified (significant deviation)

    Falsification check: if any falsification criterion is triggered,
    scenario = C.
    """
    if not residuals:
        return {"verdict": "inconclusive", "reason": "No measured beans."}

    mean_residual = sum(r["residual_pp"] for r in residuals) / len(residuals)
    max_abs_residual = max(abs(r["residual_pp"]) for r in residuals)
    total_error_pct = abs(total_measured_pp - total_predicted_pp) / max(total_predicted_pp, 0.01) * 100

    # Determine scenario
    if total_error_pct <= 20.0 and max_abs_residual <= 5.0:
        scenario_label = "A"
        scenario_desc = "Hypothesis confirmed: measured within 20% of predicted aggregate and <=5pp max per-bean deviation."
    elif total_error_pct <= 40.0 or max_abs_residual <= 10.0:
        scenario_label = "B"
        scenario_desc = "Hypothesis partially confirmed: aggregate deviation 20-40% or per-bean deviation 5-10pp."
    else:
        scenario_label = "C"
        scenario_desc = "Hypothesis falsified: aggregate deviation >40% or per-bean deviation >10pp."

    return {
        "verdict": scenario_label,
        "description": scenario_desc,
        "total_measured_pp": round(total_measured_pp, 2),
        "total_predicted_pp": round(total_predicted_pp, 2),
        "total_error_pct": round(total_error_pct, 1),
        "mean_residual_pp": round(mean_residual, 2),
        "max_abs_residual_pp": round(max_abs_residual, 2),
        "falsification_criteria_checked": falsification_criteria,
        "hypothesis_falsified": scenario_label == "C",
    }


def generate_reconciliation_report(
    prereg_doc: Dict[str, Any],
    beans_landed: List[Dict[str, Any]],
    deferrals: List[str],
    test_mode: str,
    test_run_id: str,
    session_id: str = "",
    extra: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate a #2298 Part 2 reconciliation report.

    Args:
        prereg_doc: the locked pre-registration document.
        beans_landed: list of bean result dicts with measured_pp + predicted_pp.
        deferrals: list of deferred bean IDs.
        test_mode: "gamma" | "delta" | "epsilon".
        test_run_id: unique test run identifier (must match pre-reg signing).
        session_id: Bishop/Knight session ID.
        extra: additional mode-specific metrics (e.g., epsilon_metrics).

    Returns:
        Reconciliation report dict (not yet signed — caller signs via chronos_test_signer).
    """
    residuals = _compute_residuals(beans_landed)

    total_measured = sum(r["measured_pp"] for r in residuals)
    total_predicted = sum(r["predicted_pp"] for r in residuals)

    scenarios = prereg_doc.get("scenarios", ["A", "B", "C"])
    falsification_criteria = prereg_doc.get("falsification_criteria", [])

    verdict = _scenario_verdict(
        scenarios=scenarios,
        residuals=residuals,
        falsification_criteria=falsification_criteria,
        total_measured_pp=total_measured,
        total_predicted_pp=total_predicted,
    )

    per_bean_table = [
        {
            "bean_id": r["bean_id"],
            "pod_id": r["pod_id"],
            "predicted_pp": r["predicted_pp"],
            "measured_pp": r["measured_pp"],
            "residual_pp": r["residual_pp"],
            "pct_error": r["pct_error"],
        }
        for r in residuals
    ]

    report: Dict[str, Any] = {
        "reconciliation_type": "#2298_part_2",
        "test_mode": test_mode,
        "test_run_id": test_run_id,
        "session_id": session_id,
        "reconciled_at": _iso_now(),
        "pre_reg_content_hash": prereg_doc.get("content_hash_lock", ""),
        "pre_reg_hypothesis": prereg_doc.get("hypothesis", ""),
        "falsification_criteria": falsification_criteria,
        "beans_executed": len(beans_landed),
        "beans_measured": len(residuals),
        "deferrals": deferrals,
        "per_bean_table": per_bean_table,
        "aggregate": {
            "total_measured_pp": round(total_measured, 2),
            "total_predicted_pp": round(total_predicted, 2),
            "total_residual_pp": round(total_measured - total_predicted, 2),
        },
        "scenario_verdict": verdict,
        "paper_part_2_scaffold": (
            f"# PAPER Part 2 — {test_mode.upper()} Test Reconciliation\n\n"
            f"**Hypothesis:** {prereg_doc.get('hypothesis', '[not set]')}\n\n"
            f"**Scenario Verdict: {verdict.get('verdict', '?')}** — "
            f"{verdict.get('description', '')}\n\n"
            f"**Aggregate:** predicted {round(total_predicted, 1)}pp | "
            f"measured {round(total_measured, 1)}pp | "
            f"error {verdict.get('total_error_pct', 0):.1f}%\n\n"
            f"**Beans executed:** {len(beans_landed)} | "
            f"**Deferrals:** {len(deferrals)}\n"
        ),
        "harness_id": "KN026-rd-battery-test-infrastructure",
    }

    if extra:
        report.update(extra)

    return report
