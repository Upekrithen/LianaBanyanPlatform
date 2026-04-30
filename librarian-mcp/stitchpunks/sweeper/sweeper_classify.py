"""
Sweeper Scribe — Component 2: Item Classifier
KN016 / A&A #2328 candidate

Classifies scanned items by severity: low / medium / high.

Rules:
  stale   high   > 3× threshold days
  stale   medium 1.5× – 3× threshold days
  stale   low    threshold – 1.5× threshold days
  orphaned always high (missing references break substrate integrity)
  drift   high when one side is None (item absent from one state)
  drift   medium when values differ but both present

Toolsmith log: TS-BISHOP-SWEEPER-SCAVENGER-KN016-BP002
"""

from __future__ import annotations

from typing import Any, Dict, List

SEVERITY_ORDER = {"high": 3, "medium": 2, "low": 1}


def classify(item: Dict[str, Any]) -> str:
    """Return severity string for a scanned item."""
    return item.get("severity", "low")


def sort_by_severity(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort items by severity descending (high first)."""
    return sorted(
        items,
        key=lambda x: SEVERITY_ORDER.get(x.get("severity", "low"), 0),
        reverse=True,
    )


def filter_by_severity(
    items: List[Dict[str, Any]],
    min_severity: str = "low",
) -> List[Dict[str, Any]]:
    """Return items at or above min_severity level."""
    threshold = SEVERITY_ORDER.get(min_severity, 0)
    return [i for i in items if SEVERITY_ORDER.get(i.get("severity", "low"), 0) >= threshold]


def top_n(
    items: List[Dict[str, Any]],
    n: int = 5,
    min_severity: str = "low",
) -> List[Dict[str, Any]]:
    """Return the top N items by severity."""
    filtered = filter_by_severity(items, min_severity)
    return sort_by_severity(filtered)[:n]
