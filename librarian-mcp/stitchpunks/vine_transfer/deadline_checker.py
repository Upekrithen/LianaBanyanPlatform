"""
Component 10 — Deadline Checker (KN023)

Queries Chronos for Founder-noted deadlines within 7-day window.
Surfaces only actionable near-term deadlines; ignores beyond-7-day items.

KN058: Deadline dates are now sourced from canonical_values.yaml (deadlines: section).
deadline_checker.py reads that file at runtime so a YAML edit is the single fix point.
Fallback to _HARDCODED_DEADLINES only when canonical_values.yaml is unreadable.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Optional

_CHRONICLER_DIR = Path.home() / ".claude" / "state" / "chroniclers"
_DEFAULT_WINDOW_DAYS = 7

# KN058: canonical source — edit canonical_values.yaml, not this list.
_CANONICAL_YAML = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/canonical_values.yaml"
)

# Hardcoded fallback (used only when canonical_values.yaml is missing/unreadable).
# KN058: these are intentionally kept as last-resort backup only.
_HARDCODED_DEADLINES = [
    {
        "description": "INDL-9 Geneva submission deadline (fallback — check canonical_values.yaml)",
        "deadline_iso": "2026-05-07T23:59:00Z",
        "source": "hardcoded_fallback",
    },
    {
        "description": "Patent conversion deadline (first provisional)",
        "deadline_iso": "2026-11-26T00:00:00Z",
        "source": "hardcoded_fallback",
    },
    {
        "description": "PCC Bangkok conference",
        "deadline_iso": "2026-11-01T00:00:00Z",
        "source": "hardcoded_fallback",
    },
]


def _load_canonical_deadlines() -> list[dict]:
    """
    Load deadlines from canonical_values.yaml deadlines: section.

    Returns list of {description, deadline_iso, source} dicts.
    Falls back to _HARDCODED_DEADLINES on any read/parse error.
    """
    try:
        text = _CANONICAL_YAML.read_text(encoding="utf-8")
        # Minimal YAML parser for the deadlines: block (avoids PyYAML dependency).
        # Reads key-value pairs under the "deadlines:" heading.
        in_deadlines = False
        pairs: dict = {}
        for line in text.splitlines():
            stripped = line.strip()
            if stripped == "deadlines:":
                in_deadlines = True
                continue
            if in_deadlines:
                if stripped.startswith("#"):
                    continue
                if stripped and not line.startswith(" ") and not line.startswith("\t"):
                    # New top-level section — stop
                    break
                if ":" in stripped and not stripped.startswith("#"):
                    k, _, v = stripped.partition(":")
                    pairs[k.strip()] = v.strip().strip('"')

        if not pairs:
            return _HARDCODED_DEADLINES

        deadlines = []
        # Pair up *_iso and *_description keys
        iso_keys = [k for k in pairs if k.endswith("_iso")]
        for iso_key in iso_keys:
            prefix = iso_key[: -len("_iso")]
            desc_key = f"{prefix}_description"
            desc = pairs.get(desc_key, prefix.replace("_", " ").title())
            iso = pairs[iso_key]
            if iso:
                deadlines.append({
                    "description": desc,
                    "deadline_iso": iso,
                    "source": "canonical_values_yaml",
                })
        return deadlines if deadlines else _HARDCODED_DEADLINES
    except Exception:
        return _HARDCODED_DEADLINES


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

    # Add canonical deadlines (from canonical_values.yaml, fallback to hardcoded)
    for d in _load_canonical_deadlines():
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
