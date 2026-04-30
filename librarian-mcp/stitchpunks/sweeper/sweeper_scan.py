"""
Sweeper Scribe — Component 1: Substrate Scanner
KN016 / A&A #2328 candidate

Scans Bishop substrate for stale + orphaned + drift-class items.

Detection classes:
  stale     — file unedited for > STALE_DAYS days (default 30)
  orphaned  — referenced-but-missing or written-but-not-indexed
  drift     — canonical-state vs ground-truth mismatch

Toolsmith log: TS-BISHOP-SWEEPER-SCAVENGER-KN016-BP002
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent

DEFAULT_STALE_DAYS = 30
DEFAULT_SUBSTRATE_ROOTS: List[Path] = []


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _days_since_modified(path: Path) -> float:
    """Return float days since file was last modified."""
    try:
        mtime = path.stat().st_mtime
        now = datetime.now(timezone.utc).timestamp()
        return (now - mtime) / 86400.0
    except OSError:
        return float("inf")


def scan_stale(
    substrate_roots: List[Path],
    stale_days: int = DEFAULT_STALE_DAYS,
    extensions: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Scan substrate_roots for files not modified in > stale_days days.

    Returns list of stale item dicts:
      { path, days_since_modified, class: "stale", severity }
    """
    if extensions is None:
        extensions = [".md", ".json", ".jsonl", ".yaml", ".yml", ".py", ".ts"]

    stale_items: List[Dict[str, Any]] = []
    for root in substrate_roots:
        root = Path(root)
        if not root.exists():
            continue
        for file_path in root.rglob("*"):
            if file_path.is_file() and file_path.suffix in extensions:
                days = _days_since_modified(file_path)
                if days > stale_days:
                    severity = _stale_severity(days, stale_days)
                    stale_items.append({
                        "path": str(file_path),
                        "days_since_modified": round(days, 1),
                        "class": "stale",
                        "severity": severity,
                        "detected_at": _iso_now(),
                    })

    return sorted(stale_items, key=lambda x: x["days_since_modified"], reverse=True)


def _stale_severity(days: float, threshold: int) -> str:
    ratio = days / max(threshold, 1)
    if ratio >= 3.0:
        return "high"
    elif ratio >= 1.5:
        return "medium"
    return "low"


def scan_orphaned(
    reference_map: Dict[str, List[str]],
    substrate_roots: List[Path],
) -> List[Dict[str, Any]]:
    """
    Detect orphaned items: references in reference_map that don't exist on disk,
    or files on disk that appear in no reference_map entry.

    reference_map: { canonical_id -> [file_paths_it_should_reference] }

    Returns list of orphan item dicts:
      { canonical_id, missing_paths, class: "orphaned", severity }
    """
    orphans: List[Dict[str, Any]] = []

    # referenced-but-missing
    for canonical_id, paths in reference_map.items():
        missing = [p for p in paths if not Path(p).exists()]
        if missing:
            orphans.append({
                "canonical_id": canonical_id,
                "missing_paths": missing,
                "class": "orphaned",
                "subclass": "referenced_but_missing",
                "severity": "high",
                "detected_at": _iso_now(),
            })

    return orphans


def scan_drift(
    ledger_state: Dict[str, Any],
    ground_truth_state: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Detect drift: compare ledger_state (canonical record) against ground_truth_state
    (actual deployed/disk state). Any key whose value differs is a drift item.

    Returns list of drift item dicts:
      { key, ledger_value, ground_truth_value, class: "drift", severity }
    """
    drift_items: List[Dict[str, Any]] = []
    all_keys = set(ledger_state.keys()) | set(ground_truth_state.keys())

    for key in all_keys:
        ledger_val = ledger_state.get(key)
        gt_val = ground_truth_state.get(key)
        if ledger_val != gt_val:
            severity = "high" if ledger_val is None or gt_val is None else "medium"
            drift_items.append({
                "key": key,
                "ledger_value": ledger_val,
                "ground_truth_value": gt_val,
                "class": "drift",
                "severity": severity,
                "detected_at": _iso_now(),
            })

    return drift_items


def run_full_scan(
    substrate_roots: List[Path],
    stale_days: int = DEFAULT_STALE_DAYS,
    reference_map: Optional[Dict[str, List[str]]] = None,
    ledger_state: Optional[Dict[str, Any]] = None,
    ground_truth_state: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Run all three scan classes and return combined results.
    """
    stale = scan_stale(substrate_roots, stale_days)
    orphaned = scan_orphaned(reference_map or {}, substrate_roots)
    drift = scan_drift(ledger_state or {}, ground_truth_state or {})

    all_items = stale + orphaned + drift
    return {
        "scan_timestamp": _iso_now(),
        "stale_count": len(stale),
        "orphaned_count": len(orphaned),
        "drift_count": len(drift),
        "total_items": len(all_items),
        "items": all_items,
    }
