"""
Crown Jewel Temporal Diagnostic — KN010 / A&A #2291

CJ production rate by time-of-day / day-of-week / month-of-year.

Data sources (per KN011 D.1):
  1. Innovation manifest (librarian-mcp/touchstone/manifest.json or similar)
  2. INNOVATION_THRESH_2*.md files in BISHOP_DROPZONE/12_Innovations_AA/
  3. Session codecopy mtimes in LianaBanyanKNIGHT/BishopClaudeCodeNNN.txt

Crown Jewels = innovations tagged #2NNN (with two-digit-or-more N after "2") that
have a "Crown Jewel" classification in their manifest entry.

This module:
  - Ingests CJ timestamps from all available sources
  - Produces per-hour / per-day-of-week / per-month histograms
  - Calls substrate_state_correlation from TemporalDiagnostics for peak analysis
  - Surfaces substrate-state at each CJ filing timestamp

Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent.parent  # librarian-mcp/stitchpunks/
_REPO_ROOT = _STITCH_DIR.parent.parent  # workspace root
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import ReceiptIndex, build_index


# ── CJ timestamp sources ───────────────────────────────────────────────────────

def _load_from_manifest() -> List[Tuple[str, str]]:
    """
    Load CJ timestamps from librarian-mcp/touchstone/manifest.json.

    Returns list of (innovation_id, iso_timestamp).
    """
    manifest_paths = [
        _STITCH_DIR.parent / "touchstone" / "manifest.json",
        _REPO_ROOT / "librarian-mcp" / "touchstone" / "manifest.json",
    ]
    results: List[Tuple[str, str]] = []
    for path in manifest_paths:
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                entries = data if isinstance(data, list) else data.get("innovations", [])
                for entry in entries:
                    iid = entry.get("id", "") or entry.get("aa_number", "")
                    ts = (
                        entry.get("ratified_at") or
                        entry.get("timestamp") or
                        entry.get("filed_at") or
                        ""
                    )
                    is_cj = (
                        entry.get("crown_jewel") or
                        entry.get("is_crown_jewel") or
                        "CJ" in str(entry.get("tags", "")) or
                        "Crown Jewel" in str(entry.get("classification", ""))
                    )
                    if iid and ts and is_cj:
                        results.append((str(iid), str(ts)))
            except Exception:
                pass
    return results


def _load_from_innovation_thresh_mds() -> List[Tuple[str, str]]:
    """
    Scan BISHOP_DROPZONE/12_Innovations_AA/INNOVATION_THRESH_2*.md files.
    Extract CJ markers + timestamps from file modification times as proxy.

    Returns list of (innovation_id, iso_timestamp).
    """
    search_dirs = [
        _REPO_ROOT / "BISHOP_DROPZONE" / "12_Innovations_AA",
    ]
    results: List[Tuple[str, str]] = []
    for search_dir in search_dirs:
        if not search_dir.exists():
            continue
        for md_file in sorted(search_dir.glob("INNOVATION_THRESH_2*.md")):
            try:
                mtime = os.path.getmtime(md_file)
                ts = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat().replace("+00:00", "Z")
                # Extract innovation ID from filename
                m = re.search(r"INNOVATION_THRESH_(#?\d+)", md_file.name)
                if m:
                    iid = m.group(1).lstrip("#")
                else:
                    iid = md_file.stem
                # Check for Crown Jewel markers in content
                content = md_file.read_text(encoding="utf-8", errors="ignore")
                if "Crown Jewel" in content or "crown_jewel" in content or "CJ" in content[:500]:
                    results.append((iid, ts))
            except Exception:
                pass
    return results


def _parse_iso(ts: str) -> Optional[datetime]:
    if not ts:
        return None
    try:
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        return datetime.fromisoformat(ts)
    except (ValueError, TypeError):
        return None


# ── Histogram builders ─────────────────────────────────────────────────────────

def _build_histograms(
    cj_timestamps: List[Tuple[str, str]],
) -> Dict[str, Any]:
    """
    Build per-hour-of-day, per-day-of-week, per-month-of-year histograms.

    cj_timestamps: list of (innovation_id, iso_timestamp)
    """
    hour_counts: Counter = Counter()
    dow_counts: Counter = Counter()
    month_counts: Counter = Counter()
    parsed_ok = 0
    missing_ts = 0

    for iid, ts in cj_timestamps:
        if not ts:
            missing_ts += 1
            continue
        dt = _parse_iso(ts)
        if dt is None:
            missing_ts += 1
            continue
        parsed_ok += 1
        hour_counts[dt.hour] += 1
        dow_counts[dt.weekday()] += 1  # 0=Monday, 6=Sunday
        month_counts[dt.month] += 1

    dow_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return {
        "total_cj": len(cj_timestamps),
        "parsed_ok": parsed_ok,
        "missing_ts": missing_ts,
        "hour_of_day": {
            str(h).zfill(2): hour_counts.get(h, 0) for h in range(24)
        },
        "day_of_week": {
            dow_names[d]: dow_counts.get(d, 0) for d in range(7)
        },
        "month_of_year": {
            month_names[m]: month_counts.get(m, 0) for m in range(1, 13)
        },
        "peak_hour": (
            max(hour_counts, key=lambda h: hour_counts[h])
            if hour_counts else None
        ),
        "peak_day": (
            dow_names[max(dow_counts, key=lambda d: dow_counts[d])]
            if dow_counts else None
        ),
        "peak_month": (
            month_names[max(month_counts, key=lambda m: month_counts[m])]
            if month_counts else None
        ),
    }


# ── Substrate-state at CJ timestamps ──────────────────────────────────────────

def _substrate_state_at_timestamps(
    cj_timestamps: List[Tuple[str, str]],
    index: ReceiptIndex,
) -> Dict[str, Any]:
    """
    For each CJ filing timestamp, determine which primitives had receipts
    filed BEFORE that timestamp (= substrate state at filing time).

    Returns ranked substrate states by CJ-production frequency.
    """
    all_receipts = index.all_receipts()

    # For each CJ timestamp, count which primitives were "live"
    state_counts: Counter = Counter()
    state_details: Dict[str, List[str]] = {}

    for iid, ts in cj_timestamps:
        if not ts:
            continue
        dt = _parse_iso(ts)
        if dt is None:
            continue

        ts_str = dt.isoformat().replace("+00:00", "Z")

        # Primitives with at least one receipt before this timestamp
        active_prims: set = set()
        for r in all_receipts:
            r_ts = (
                r.get("chronos_signature", {}).get("temporal_anchor", "") or
                r.get("timestamp", "")
            )
            if r_ts and r_ts < ts_str:
                for pid in r.get("primitive_ids", []):
                    active_prims.add(pid)

        state_key = "|".join(sorted(active_prims)) if active_prims else "<none>"
        state_counts[state_key] += 1
        if state_key not in state_details:
            state_details[state_key] = sorted(active_prims)

    ranked = [
        {
            "substrate_state": state_details.get(key, key.split("|")),
            "cj_count": count,
            "state_key": key,
        }
        for key, count in state_counts.most_common(10)
    ]

    return {
        "ranked_substrate_states": ranked,
        "caveat": (
            "Substrate state inferred from Chandelier receipt timestamps. "
            "If receipts are sparse, states may be over-simplified."
        ),
    }


# ── Public API ─────────────────────────────────────────────────────────────────

class CrownJewelTemporal:
    """
    CJ production rate temporal diagnostic.

    Ingests CJ timestamps from all available sources, builds histograms,
    and correlates with substrate state.
    """

    def __init__(self, index: Optional[ReceiptIndex] = None) -> None:
        self._index = index or build_index()

    def _load_all_timestamps(self) -> List[Tuple[str, str]]:
        """Union of all CJ timestamp sources, deduplicated by innovation_id."""
        seen: Dict[str, str] = {}
        for source in [_load_from_manifest, _load_from_innovation_thresh_mds]:
            for iid, ts in source():
                if iid not in seen or not seen[iid]:
                    seen[iid] = ts
        return [(iid, ts) for iid, ts in sorted(seen.items())]

    def run(
        self,
        include_substrate_correlation: bool = True,
    ) -> Dict[str, Any]:
        """
        Run full CJ temporal diagnostic.

        Returns histograms + substrate-state correlation + Right-Recipe pointer.
        """
        cj_timestamps = self._load_all_timestamps()
        histograms = _build_histograms(cj_timestamps)

        result: Dict[str, Any] = {
            "source_summary": {
                "total_cj_loaded": len(cj_timestamps),
                "sources_checked": ["manifest.json", "INNOVATION_THRESH_2*.md"],
            },
            "histograms": histograms,
            "toolsmith_log": "TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002",
        }

        if include_substrate_correlation:
            result["substrate_state_at_filing"] = _substrate_state_at_timestamps(
                cj_timestamps, self._index
            )

        caveats = []
        if histograms["missing_ts"] > 0:
            caveats.append(
                f"{histograms['missing_ts']} CJ entries had no parseable timestamp — "
                "excluded from histograms."
            )
        if histograms["total_cj"] == 0:
            caveats.append(
                "No CJ timestamps found. Ensure manifest.json or "
                "INNOVATION_THRESH_2*.md files are in BISHOP_DROPZONE/12_Innovations_AA/."
            )
        result["caveats"] = caveats

        return result
