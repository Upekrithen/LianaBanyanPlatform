"""
Substrate-State Correlator — KN010 / A&A #2291

Standalone entry point for substrate-state correlation analysis.

For any target metric peak window, identifies which substrate primitives
were most active. Surfaces correlation strength via:
  - Frequency: how often a primitive appears in top-N peak buckets
  - Top-period appearances / total-top-periods (0–1 score)

This wraps TemporalDiagnostics.substrate_state_correlation() and extends it
with a structured correlation-strength report.

Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent.parent
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import ReceiptIndex, build_index
from chandelier.temporal_diagnostics import TemporalDiagnostics


class SubstrateCorrelator:
    """
    Identifies which substrate primitives correlate with peak-productivity periods.

    Correlation strength = top_period_appearances / top_n_periods (0–1 scale).
    A primitive with score 1.0 was active in EVERY peak period for the query window.
    """

    def __init__(self, index: Optional[ReceiptIndex] = None) -> None:
        self._index = index or build_index()
        self._diag = TemporalDiagnostics(self._index)

    def correlate(
        self,
        metric: Optional[str] = None,
        grain: str = "day",
        top_n_periods: int = 5,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Run substrate-state correlation for a target metric.

        Parameters
        ----------
        metric          : metric to identify peak periods for (None = all metrics)
        grain           : time aggregation grain ("hour" | "day" | "week" | "month")
        top_n_periods   : how many peak periods to consider
        time_range      : (start_iso, end_iso) window

        Returns
        -------
        {
            "correlation_table": [
                {
                    "primitive_id": str,
                    "correlation_score": float,  # 0–1
                    "top_period_appearances": int,
                    "interpretation": str,
                }
            ],
            "top_periods": [...],
            "grain": str,
            "metric": str | None,
        }
        """
        raw = self._diag.substrate_state_correlation(
            metric=metric,
            grain=grain,
            top_n_periods=top_n_periods,
            time_range=time_range,
        )

        most_correlated = raw.get("most_correlated_primitives", [])
        top_periods = raw.get("top_periods", [])
        actual_top_n = len(top_periods)

        correlation_table: List[Dict[str, Any]] = []
        for entry in most_correlated:
            pid = entry.get("primitive_id", "")
            appearances = entry.get("top_period_appearances", 0)
            score = round(appearances / actual_top_n, 4) if actual_top_n > 0 else 0.0

            if score >= 0.8:
                interpretation = "Strong — present in most peak periods"
            elif score >= 0.5:
                interpretation = "Moderate — present in about half of peak periods"
            elif score > 0:
                interpretation = "Weak — present in few peak periods"
            else:
                interpretation = "Absent from peak periods"

            correlation_table.append({
                "primitive_id": pid,
                "correlation_score": score,
                "top_period_appearances": appearances,
                "interpretation": interpretation,
            })

        # Sort by correlation_score descending
        correlation_table.sort(key=lambda x: x["correlation_score"], reverse=True)

        return {
            "correlation_table": correlation_table,
            "top_periods": top_periods,
            "grain": grain,
            "metric": metric,
            "top_n_periods_analysed": actual_top_n,
            "caveat": (
                "Correlation ≠ causation. These primitives were active during peak "
                "periods, but may not be the cause of peak production. Use "
                "Right Recipe argmax for causal confirmation."
            ),
            "toolsmith_log": "TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002",
        }
