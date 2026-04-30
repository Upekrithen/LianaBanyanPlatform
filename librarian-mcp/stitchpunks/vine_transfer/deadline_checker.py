"""
Component 10 — Deadline Checker (KN023)

Queries Chronos for Founder-noted deadlines within 7-day window.
Surfaces only actionable near-term deadlines; ignores beyond-7-day items.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Optional

_CHRONICLER_DIR = Path.home() / ".claude" / "state" / "chroniclers"
_DEFAULT_WINDOW_DAYS = 7

# Static deadlines extracted from canonical memory (fallback when Chronos empty)
_STATIC_DEADLINES = [
    {
        "description": "INDL-9 Geneva submission deadline",
        "deadline_iso": "2026-04-30T23:59:00Z",
        "source": "canonical_memory",
    },
    {
        "description": "Patent conversion deadline (first provisional)",
        "deadline_iso": "2026-11-26T00:00:00Z",
        "source": "canonical_memory",
    },
    {
        "description": "PCC Bangkok conference",
        "deadline_iso": "2026-11-01T00:00:00Z",
        "source": "canonical_memory",
    },
]


def _iso_to_ts(iso: str) -> float:
    """Convert ISO timestamp to Unix float. Returns 0 on error."""
    import datetime
    try:
        dt = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.timestamp()
    except Exception:
        return 0.0


def get_deadlines_within_window(
    window_days: int = _DEFAULT_WINDOW_DAYS,
    chronicler_dir: Path = _CHRONICLER_DIR,
) -> list[dict]:
    """
    Return deadlines within window_days from now.
    Merges Chronos tablet entries with static canonical deadlines.
    """
    now = time.time()
    cutoff = now + window_days * 86400
    deadlines = []

    # Scan Chronos tablets for deadline records
    if chronicler_dir.exists():
        for tablet in chronicler_dir.glob("augur_*.jsonl"):
            try:
                lines = tablet.read_text(encoding="utf-8").strip().splitlines()
                for line in lines[-100:]:
                    entry = json.loads(line)
                    deadline_ts = entry.get("deadline_ts")
                    if deadline_ts:
                        ts = float(deadline_ts)
                        if now <= ts <= cutoff:
                            deadlines.append({
                                "description": entry.get("reason_snippet", ""),
                                "deadline_ts": ts,
                                "source": "chronos",
                            })
            except Exception:
                continue

    # Add static deadlines within window
    for d in _STATIC_DEADLINES:
        ts = _iso_to_ts(d.get("deadline_iso", ""))
        if ts and now <= ts <= cutoff:
            deadlines.append({
                "description": d["description"],
                "deadline_ts": ts,
                "source": d["source"],
            })

    # Sort by deadline ascending
    deadlines.sort(key=lambda x: x.get("deadline_ts", 0))
    return deadlines


def format_deadlines(deadlines: list[dict]) -> str:
    """Format deadline list for Vine Landing Receipt."""
    if not deadlines:
        return "**Deadlines (7-day window):** None"

    import datetime
    lines = [f"**Deadlines (7-day window):** {len(deadlines)} item(s)"]
    for d in deadlines:
        ts = d.get("deadline_ts", 0)
        dt_str = (
            datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")
            if ts else "unknown"
        )
        lines.append(f"  ⏰ {dt_str} — {d['description'][:80]}")
    return "\n".join(lines)


def check_deadlines(window_days: int = _DEFAULT_WINDOW_DAYS) -> dict:
    """
    Full deadline check.

    Returns {deadlines, count, formatted_summary}
    """
    deadlines = get_deadlines_within_window(window_days)
    return {
        "deadlines": deadlines,
        "count": len(deadlines),
        "formatted_summary": format_deadlines(deadlines),
    }
