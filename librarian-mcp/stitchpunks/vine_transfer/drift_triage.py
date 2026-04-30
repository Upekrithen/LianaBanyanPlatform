"""
Component 9 — Drift Triage (KN023)

Reads brief_me Scrambler-C output (if available from substrate cache) and
flags load-bearing vs deferrable drift items.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

_SUBSTRATE_CACHE = Path.home() / ".lb-session" / "substrate_cache.json"
_WING_TELEMETRY = Path.home() / ".claude" / "state" / "wing_telemetry.jsonl"

# Patterns that indicate load-bearing drift (must resolve this session)
_LOAD_BEARING_KEYWORDS = [
    "stale", "drift", "out of sync", "reconcil", "mismatch",
    "CRITICAL", "canonical", "BLOCKED", "gate", "conversion deadline",
]

# Patterns that indicate deferrable drift (can queue for later)
_DEFERRABLE_KEYWORDS = [
    "minor", "cosmetic", "style", "formatting", "advisory",
    "optional", "enhancement",
]


def _load_substrate_cache() -> Optional[dict]:
    try:
        return json.loads(_SUBSTRATE_CACHE.read_text(encoding="utf-8-sig"))
    except Exception:
        return None


def _load_recent_telemetry(limit: int = 20) -> list[dict]:
    if not _WING_TELEMETRY.exists():
        return []
    try:
        lines = _WING_TELEMETRY.read_text(encoding="utf-8").strip().splitlines()
        results = []
        for line in lines[-limit:]:
            try:
                results.append(json.loads(line))
            except Exception:
                pass
        return results
    except Exception:
        return []


def classify_drift_item(text: str) -> str:
    """
    Classify a drift item as 'load_bearing' or 'deferrable'.
    Returns 'unknown' if neither pattern matches.
    """
    text_lower = text.lower()
    for kw in _LOAD_BEARING_KEYWORDS:
        if kw.lower() in text_lower:
            return "load_bearing"
    for kw in _DEFERRABLE_KEYWORDS:
        if kw.lower() in text_lower:
            return "deferrable"
    return "unknown"


def triage_drift(
    substrate_cache: Optional[dict] = None,
    telemetry_entries: Optional[list] = None,
) -> dict:
    """
    Produce drift triage report from substrate cache + recent telemetry.

    Returns {
        load_bearing, deferrable, unknown, telemetry_fires,
        formatted_summary
    }
    """
    if substrate_cache is None:
        substrate_cache = _load_substrate_cache() or {}
    if telemetry_entries is None:
        telemetry_entries = _load_recent_telemetry()

    load_bearing = []
    deferrable = []
    unknown_items = []

    # Check substrate cache for drift indicators
    drift_notes = substrate_cache.get("drift_notes", [])
    if isinstance(drift_notes, list):
        for note in drift_notes:
            cls = classify_drift_item(str(note))
            (load_bearing if cls == "load_bearing"
             else deferrable if cls == "deferrable"
             else unknown_items).append(note)

    # Check recent wing telemetry for fires
    recent_fires = [
        e for e in telemetry_entries
        if e.get("decision") in ("block", "warn")
    ]

    lines = ["**Drift Triage**"]
    if load_bearing:
        lines.append(f"  🔴 Load-bearing drift ({len(load_bearing)}):")
        for item in load_bearing[:3]:
            lines.append(f"    - {str(item)[:80]}")
    else:
        lines.append("  ✓ No load-bearing drift detected")

    if deferrable:
        lines.append(f"  🟡 Deferrable drift ({len(deferrable)})")
    if recent_fires:
        lines.append(f"  🔶 Recent Augur fires: {len(recent_fires)}")

    return {
        "load_bearing": load_bearing,
        "deferrable": deferrable,
        "unknown": unknown_items,
        "telemetry_fires": len(recent_fires),
        "formatted_summary": "\n".join(lines),
    }
