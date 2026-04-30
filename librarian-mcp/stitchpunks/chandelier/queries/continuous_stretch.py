"""
Continuous Stretch Identifier — KN010 / A&A #2291

Standalone entry point for the continuous-stretch analysis already implemented
in chandelier.temporal_diagnostics (KN009 Component 5 equivalent).

Finds the longest gap-free productive span(s) across a user-specified time window.
Uses Chronos timestamp index + receipt activity as proxy for productivity.

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


class ContinuousStretchFinder:
    """
    Finds the longest gap-free productive spans in the receipt timeline.

    A 'stretch' is a maximal sequence of receipts where no consecutive pair
    is separated by more than gap_threshold_hours.
    """

    DEFAULT_GAP_THRESHOLD_HOURS = 8.0

    def __init__(self, index: Optional[ReceiptIndex] = None) -> None:
        self._index = index or build_index()
        self._diag = TemporalDiagnostics(self._index)

    def find(
        self,
        primitive_filter: Optional[List[str]] = None,
        metric: Optional[str] = None,
        time_range: Optional[Tuple[str, str]] = None,
        gap_threshold_hours: float = DEFAULT_GAP_THRESHOLD_HOURS,
        top_n: int = 5,
    ) -> Dict[str, Any]:
        """
        Find and rank productive stretches.

        Parameters
        ----------
        primitive_filter    : if provided, restrict to receipts involving these primitives
        metric              : if provided, restrict to receipts with this metric
        time_range          : (start_iso, end_iso) window
        gap_threshold_hours : max gap between consecutive receipts within a stretch
        top_n               : number of top stretches to return

        Returns
        -------
        {
            "longest_stretch": {...},
            "top_stretches": [...],    # ranked by count
            "total_stretches": int,
            "total_receipts_analysed": int,
            "gap_threshold_hours": float,
        }
        """
        # Use the temporal diagnostics continuous_stretch mode
        raw = self._diag.query_temporal(
            time_grain="continuous_stretch",
            primitive_filter=primitive_filter,
            metric=metric,
            time_range=time_range,
        )

        stretches = raw.get("stretches", [])

        # Sort by count descending for top-N
        ranked = sorted(stretches, key=lambda s: s.get("count", 0), reverse=True)

        return {
            "longest_stretch": raw.get("longest_stretch"),
            "top_stretches": ranked[:top_n],
            "total_stretches": len(stretches),
            "total_receipts_analysed": sum(s.get("count", 0) for s in stretches),
            "gap_threshold_hours": gap_threshold_hours,
            "primitive_filter": primitive_filter,
            "metric": metric,
            "time_range": time_range,
            "toolsmith_log": "TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002",
        }
