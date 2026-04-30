"""
Falsification Test Runner — KN010 / A&A #2291

Given a claimed effect (primitive X improves metric M by Δ_claimed),
runs a replay against Chandelier receipts and returns:

  CONFIRMED  : empirical_Δ ≥ claimed_Δ * (1 - tolerance)
  WEAK       : empirical_Δ > 0 but < claimed_Δ * (1 - tolerance)
  FALSIFIED  : empirical_Δ ≤ 0 (or no receipts found)
  INSUFFICIENT_DATA : fewer than min_receipts receipts found

This is the empirical-proof-check for A&A claims.
If a claim doesn't survive falsification, it shouldn't be filed.

Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
"""

from __future__ import annotations

import sys
import statistics
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent.parent
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import ReceiptIndex, build_index


# ── Verdict constants ──────────────────────────────────────────────────────────

CONFIRMED = "CONFIRMED"
WEAK = "WEAK"
FALSIFIED = "FALSIFIED"
INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


# ── Statistical helpers ────────────────────────────────────────────────────────

def _mean(values: List[float]) -> float:
    return statistics.mean(values) if values else 0.0


def _stdev(values: List[float]) -> Optional[float]:
    return statistics.stdev(values) if len(values) >= 2 else None


def _confidence_interval_95(values: List[float]) -> Optional[Tuple[float, float]]:
    """
    95% CI using t-distribution approximation (z=1.96 for n≥30, else t-critical ~2.0).
    Returns (lower, upper) or None if insufficient data.
    """
    n = len(values)
    if n < 2:
        return None
    mean = _mean(values)
    sd = _stdev(values)
    if sd is None or sd == 0:
        return (mean, mean)
    z = 1.96 if n >= 30 else 2.0  # approximate
    margin = z * sd / (n ** 0.5)
    return (round(mean - margin, 6), round(mean + margin, 6))


# ── Main falsification runner ──────────────────────────────────────────────────

class FalsificationTestRunner:
    """
    Runs falsification tests against the Chandelier receipt Stone Tablet.

    A falsification test is the empirical complement to an A&A claim:
    if we CLAIM 'primitive X lifts metric M by Δ', the test asks
    'do the receipts confirm, weaken, or falsify this claim?'
    """

    DEFAULT_TOLERANCE = 0.10      # ±10% tolerance on claimed delta
    DEFAULT_MIN_RECEIPTS = 1      # minimum receipts to pass INSUFFICIENT_DATA gate

    def __init__(self, index: Optional[ReceiptIndex] = None) -> None:
        self._index = index or build_index()

    def test(
        self,
        primitive_ids: List[str],
        metric: str,
        claimed_delta: float,
        tolerance: float = DEFAULT_TOLERANCE,
        min_receipts: int = DEFAULT_MIN_RECEIPTS,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Run a falsification test for a claimed effect.

        Parameters
        ----------
        primitive_ids   : the primitive(s) whose effect is claimed
        metric          : the metric being claimed to improve
        claimed_delta   : the claimed improvement (e.g. 0.411 for 41.1pp lift)
        tolerance       : fractional tolerance (default 10%)
        min_receipts    : minimum receipts required for non-INSUFFICIENT verdict
        time_range      : (start_iso, end_iso) filter

        Returns
        -------
        {
            "verdict": "CONFIRMED" | "WEAK" | "FALSIFIED" | "INSUFFICIENT_DATA",
            "claimed_delta": float,
            "empirical_delta": float | None,
            "empirical_delta_all": [float],
            "confidence_interval_95": (float, float) | None,
            "n_receipts": int,
            "receipt_ids": [str],
            "threshold_for_confirmed": float,
            "verdict_rationale": str,
            "provenance": [str],        # receipt_ids supporting verdict
        }
        """
        receipts = self._index.query(primitive_ids, metric=metric, time_range=time_range)
        n = len(receipts)

        receipt_ids = [r.get("receipt_id", "") for r in receipts]
        deltas = [r["delta"] for r in receipts if r.get("delta") is not None]

        if n < min_receipts or not deltas:
            return {
                "verdict": INSUFFICIENT_DATA,
                "claimed_delta": claimed_delta,
                "empirical_delta": None,
                "empirical_delta_all": deltas,
                "confidence_interval_95": None,
                "n_receipts": n,
                "receipt_ids": receipt_ids,
                "threshold_for_confirmed": round(claimed_delta * (1 - tolerance), 6),
                "verdict_rationale": (
                    f"Only {n} receipt(s) found (min_receipts={min_receipts}). "
                    "Run L1/LN measurements first."
                ),
                "provenance": receipt_ids,
                "toolsmith_log": "TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002",
            }

        empirical_delta = round(_mean(deltas), 6)
        ci = _confidence_interval_95(deltas)
        threshold = round(claimed_delta * (1 - tolerance), 6)

        if empirical_delta >= threshold:
            verdict = CONFIRMED
            rationale = (
                f"Empirical Δ={empirical_delta:.4f} ≥ threshold={threshold:.4f} "
                f"(claimed={claimed_delta:.4f}, tolerance={tolerance*100:.0f}%). "
                f"Claim CONFIRMED across {n} receipt(s)."
            )
        elif empirical_delta > 0:
            verdict = WEAK
            gap = round(threshold - empirical_delta, 6)
            rationale = (
                f"Empirical Δ={empirical_delta:.4f} > 0 but below threshold={threshold:.4f} "
                f"(gap={gap:.4f}). Claim is WEAK — effect exists but understates reality."
            )
        else:
            verdict = FALSIFIED
            rationale = (
                f"Empirical Δ={empirical_delta:.4f} ≤ 0. "
                f"Claimed Δ={claimed_delta:.4f} is FALSIFIED by receipts."
            )

        return {
            "verdict": verdict,
            "claimed_delta": claimed_delta,
            "empirical_delta": empirical_delta,
            "empirical_delta_all": deltas,
            "confidence_interval_95": list(ci) if ci else None,
            "n_receipts": n,
            "receipt_ids": receipt_ids,
            "threshold_for_confirmed": threshold,
            "verdict_rationale": rationale,
            "provenance": receipt_ids,
            "toolsmith_log": "TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002",
        }

    def batch_test(
        self,
        claims: List[Dict[str, Any]],
        tolerance: float = DEFAULT_TOLERANCE,
        min_receipts: int = DEFAULT_MIN_RECEIPTS,
    ) -> List[Dict[str, Any]]:
        """
        Run multiple falsification tests in sequence.

        Each claim dict must have: primitive_ids, metric, claimed_delta.
        Optional: tolerance, min_receipts, time_range.

        Returns list of test result dicts.
        """
        results = []
        for claim in claims:
            result = self.test(
                primitive_ids=claim["primitive_ids"],
                metric=claim["metric"],
                claimed_delta=claim["claimed_delta"],
                tolerance=claim.get("tolerance", tolerance),
                min_receipts=claim.get("min_receipts", min_receipts),
                time_range=claim.get("time_range"),
            )
            result["claim_label"] = claim.get("label", "")
            results.append(result)
        return results
