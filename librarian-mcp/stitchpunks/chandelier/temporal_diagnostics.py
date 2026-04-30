"""
Temporal Diagnostic Engine — KN009 / A&A #2291

Receipts are temporally indexed via Chronos Chroniclers (Property 1 + Property 5).
This module produces per-hour / per-day / per-week / continuous-stretch /
substrate-state-correlation reports from the same temporal index.

Per Founder articulation (BP002 turn 13):
  "What were the most productive hours of the day for producing Crown Jewels?"

Supported queries:
  query_temporal(time_grain, primitive_filter, metric)
    time_grain: "hour" | "day" | "week" | "month" | "continuous_stretch"
  substrate_state_correlation(metric, time_range)
    → which primitives were active during peak-productivity periods

Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

from .chronos_chandelier_bridge import ReceiptIndex, build_index, load_all_receipts


# ── Temporal helpers ───────────────────────────────────────────────────────────

def _parse_ts(ts: str) -> Optional[datetime]:
    """Parse ISO timestamp to UTC datetime."""
    if not ts:
        return None
    try:
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        return datetime.fromisoformat(ts)
    except (ValueError, TypeError):
        return None


def _bucket_key(dt: datetime, grain: str) -> str:
    """Convert datetime to bucket key string for a given grain."""
    if grain == "hour":
        return dt.strftime("%Y-%m-%dT%H:00")
    elif grain == "day":
        return dt.strftime("%Y-%m-%d")
    elif grain == "week":
        iso = dt.isocalendar()
        return f"{iso.year}-W{iso.week:02d}"
    elif grain == "month":
        return dt.strftime("%Y-%m")
    else:
        return dt.strftime("%Y-%m-%d")


def _receipt_ts(receipt: Dict[str, Any]) -> Optional[datetime]:
    """Extract Chronos temporal anchor as datetime."""
    sig = receipt.get("chronos_signature", {})
    ts_str = sig.get("temporal_anchor") or receipt.get("timestamp", "")
    return _parse_ts(ts_str)


# ── Bucket aggregation ─────────────────────────────────────────────────────────

def _aggregate_by_grain(
    receipts: List[Dict[str, Any]],
    grain: str,
    primitive_filter: Optional[List[str]] = None,
    metric: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Aggregate receipts into time-grain buckets.

    Returns:
      buckets: {bucket_key: {count, total_delta, avg_delta, receipt_ids, primitives_seen}}
      sorted_keys: bucket keys in chronological order
      grain: the grain used
    """
    if primitive_filter:
        primitive_set = set(primitive_filter)
        receipts = [
            r for r in receipts
            if any(pid in primitive_set for pid in r.get("primitive_ids", []))
        ]
    if metric:
        receipts = [r for r in receipts if r.get("metric") == metric]

    buckets: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "count": 0,
        "total_delta": 0.0,
        "receipt_ids": [],
        "primitives_seen": set(),
    })

    for r in receipts:
        dt = _receipt_ts(r)
        if dt is None:
            continue
        key = _bucket_key(dt, grain)
        b = buckets[key]
        b["count"] += 1
        delta = r.get("delta", 0.0) or 0.0
        b["total_delta"] += delta
        b["receipt_ids"].append(r.get("receipt_id", ""))
        for pid in r.get("primitive_ids", []):
            b["primitives_seen"].add(pid)

    # Serialise sets for JSON compatibility
    result_buckets = {}
    for key, b in sorted(buckets.items()):
        avg = round(b["total_delta"] / b["count"], 6) if b["count"] > 0 else 0.0
        result_buckets[key] = {
            "count": b["count"],
            "total_delta": round(b["total_delta"], 6),
            "avg_delta": avg,
            "receipt_ids": b["receipt_ids"],
            "primitives_seen": sorted(b["primitives_seen"]),
        }

    return {
        "grain": grain,
        "buckets": result_buckets,
        "sorted_keys": sorted(result_buckets.keys()),
        "total_receipts": len(receipts),
    }


# ── Continuous-stretch analysis ────────────────────────────────────────────────

def _continuous_stretch(
    receipts: List[Dict[str, Any]],
    gap_threshold_hours: float = 8.0,
) -> Dict[str, Any]:
    """
    Identify the longest gap-free productive span.

    A "stretch" is a sequence of receipts where consecutive receipts
    are separated by ≤ gap_threshold_hours.

    Returns:
      stretches: list of {start, end, duration_hours, count, receipt_ids}
      longest_stretch: the stretch with highest count
    """
    times_with_id = []
    for r in receipts:
        dt = _receipt_ts(r)
        if dt is not None:
            times_with_id.append((dt, r.get("receipt_id", "")))

    times_with_id.sort(key=lambda x: x[0])

    if not times_with_id:
        return {"stretches": [], "longest_stretch": None}

    stretches: List[Dict[str, Any]] = []
    current: List[Tuple[datetime, str]] = [times_with_id[0]]

    for i in range(1, len(times_with_id)):
        prev_dt, _ = times_with_id[i - 1]
        curr_dt, curr_id = times_with_id[i]
        gap = (curr_dt - prev_dt).total_seconds() / 3600.0
        if gap <= gap_threshold_hours:
            current.append(times_with_id[i])
        else:
            stretches.append(_stretch_summary(current))
            current = [times_with_id[i]]

    if current:
        stretches.append(_stretch_summary(current))

    longest = max(stretches, key=lambda s: s["count"]) if stretches else None
    return {"stretches": stretches, "longest_stretch": longest}


def _stretch_summary(items: List[Tuple[datetime, str]]) -> Dict[str, Any]:
    start = items[0][0]
    end = items[-1][0]
    duration_h = round((end - start).total_seconds() / 3600.0, 2)
    return {
        "start": start.isoformat().replace("+00:00", "Z"),
        "end": end.isoformat().replace("+00:00", "Z"),
        "duration_hours": duration_h,
        "count": len(items),
        "receipt_ids": [r_id for _, r_id in items],
    }


# ── Substrate-state correlation ────────────────────────────────────────────────

def _substrate_state_correlation(
    receipts: List[Dict[str, Any]],
    metric: Optional[str] = None,
    top_n_periods: int = 5,
    grain: str = "day",
) -> Dict[str, Any]:
    """
    Which primitives were active during peak-productivity periods?
    (Property 1 + 2 + 5 composition)

    Ranks buckets by avg_delta, identifies primitives most present in top buckets.
    """
    agg = _aggregate_by_grain(receipts, grain=grain, metric=metric)
    buckets = agg["buckets"]

    if not buckets:
        return {"top_periods": [], "most_correlated_primitives": []}

    ranked = sorted(buckets.items(), key=lambda kv: kv[1]["avg_delta"], reverse=True)
    top_periods = ranked[:top_n_periods]

    prim_counts: Dict[str, int] = defaultdict(int)
    for _, b in top_periods:
        for pid in b["primitives_seen"]:
            prim_counts[pid] += 1

    most_correlated = sorted(prim_counts.items(), key=lambda kv: kv[1], reverse=True)

    return {
        "grain": grain,
        "top_periods": [
            {
                "bucket": k,
                "avg_delta": b["avg_delta"],
                "count": b["count"],
                "primitives_seen": b["primitives_seen"],
            }
            for k, b in top_periods
        ],
        "most_correlated_primitives": [
            {"primitive_id": pid, "top_period_appearances": cnt}
            for pid, cnt in most_correlated
        ],
    }


# ── Public API ─────────────────────────────────────────────────────────────────

class TemporalDiagnostics:
    """
    Temporal diagnostic engine backed by the Chandelier receipt Stone Tablet.
    """

    def __init__(self, index: Optional[ReceiptIndex] = None) -> None:
        self._index = index or build_index()

    def query_temporal(
        self,
        time_grain: str,
        primitive_filter: Optional[List[str]] = None,
        metric: Optional[str] = None,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Aggregate receipts by time grain.

        time_grain: "hour" | "day" | "week" | "month" | "continuous_stretch"

        Returns aggregation buckets (or stretch analysis if grain="continuous_stretch").
        """
        receipts = self._index.all_receipts()

        if time_range:
            start_ts, end_ts = time_range
            receipts = [
                r for r in receipts
                if start_ts <= r.get("chronos_signature", {}).get("temporal_anchor", "") <= end_ts
            ]

        if time_grain == "continuous_stretch":
            if primitive_filter:
                primitive_set = set(primitive_filter)
                receipts = [
                    r for r in receipts
                    if any(pid in primitive_set for pid in r.get("primitive_ids", []))
                ]
            if metric:
                receipts = [r for r in receipts if r.get("metric") == metric]
            return _continuous_stretch(receipts)

        return _aggregate_by_grain(
            receipts,
            grain=time_grain,
            primitive_filter=primitive_filter,
            metric=metric,
        )

    def substrate_state_correlation(
        self,
        metric: Optional[str] = None,
        grain: str = "day",
        top_n_periods: int = 5,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Which primitives were active during peak-productivity (highest avg_delta) periods?

        Composes Properties 1 + 2 + 5 of the Chandelier canon.
        """
        receipts = self._index.all_receipts()

        if time_range:
            start_ts, end_ts = time_range
            receipts = [
                r for r in receipts
                if start_ts <= r.get("chronos_signature", {}).get("temporal_anchor", "") <= end_ts
            ]

        return _substrate_state_correlation(
            receipts,
            metric=metric,
            top_n_periods=top_n_periods,
            grain=grain,
        )

    def session_productivity(
        self,
        session_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Per-session productivity: count receipts and total delta per session_id.
        Useful for comparing Knight sessions.
        """
        receipts = self._index.all_receipts()

        session_map: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            "count": 0,
            "total_delta": 0.0,
            "receipt_ids": [],
        })

        for r in receipts:
            sid = r.get("session_id", "")
            if session_ids and sid not in session_ids:
                continue
            session_map[sid]["count"] += 1
            session_map[sid]["total_delta"] += r.get("delta", 0.0) or 0.0
            session_map[sid]["receipt_ids"].append(r.get("receipt_id", ""))

        result = []
        for sid, data in sorted(session_map.items()):
            avg = round(data["total_delta"] / data["count"], 6) if data["count"] > 0 else 0.0
            result.append({
                "session_id": sid,
                "count": data["count"],
                "total_delta": round(data["total_delta"], 6),
                "avg_delta": avg,
                "receipt_ids": data["receipt_ids"],
            })

        return {
            "sessions": sorted(result, key=lambda x: x["total_delta"], reverse=True),
            "total_sessions": len(result),
        }
