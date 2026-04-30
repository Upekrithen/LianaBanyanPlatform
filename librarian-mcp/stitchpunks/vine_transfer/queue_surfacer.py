"""
Component 6 — Carry-Forward Queue Surfacer (KN023)

Queries Sweeper / Herder / Chronos for pending items and produces a
prioritized digest. Knight-fire-blockers are ranked highest.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

_SWEEPER_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/stitchpunks/sweeper"
)
_HERDER_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/stitchpunks/herder"
)
_CHRONOS_DIR = Path.home() / ".claude" / "state" / "chroniclers"


def _load_json_safe(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def get_sweeper_pending(sweeper_dir: Path = _SWEEPER_DIR) -> list[dict]:
    """Return list of pending items from Sweeper Scribe."""
    results = []
    if not sweeper_dir.exists():
        return results
    for f in sweeper_dir.glob("*.json"):
        data = _load_json_safe(f)
        if isinstance(data, dict) and data.get("status") == "pending":
            results.append({
                "source": "sweeper",
                "id": data.get("id", f.stem),
                "description": data.get("description", ""),
                "priority": data.get("priority", 50),
                "is_knight_blocker": data.get("is_knight_blocker", False),
            })
    return results


def get_herder_queue_summary(herder_dir: Path = _HERDER_DIR) -> dict:
    """Return Herder model state summary for queue context."""
    pheromone = herder_dir / "models" / "pheromone_index.json"
    data = _load_json_safe(pheromone)
    if not data:
        return {"available": False, "note": "Herder pheromone index not found"}
    return {
        "available": True,
        "n_observations": data.get("latest_n_observations", 0),
        "r_squared": data.get("latest_r_squared", 0.0),
        "model_version": data.get("latest_model_version", "unknown"),
        "note": "Herder model available for bean-cost predictions",
    }


def get_chronos_pending_deadlines(
    chronos_dir: Path = _CHRONOS_DIR,
    within_days: int = 7,
) -> list[dict]:
    """Return deadlines within within_days from Chronos chronicler tablets."""
    import time
    cutoff = time.time() + within_days * 86400
    deadlines = []

    if not chronos_dir.exists():
        return deadlines

    for tablet in chronos_dir.glob("augur_*.jsonl"):
        try:
            lines = tablet.read_text(encoding="utf-8").strip().splitlines()
            for line in lines[-50:]:  # Last 50 entries per tablet
                entry = json.loads(line)
                deadline_ts = entry.get("deadline_ts")
                if deadline_ts and float(deadline_ts) < cutoff:
                    deadlines.append({
                        "augur_id": entry.get("augur_id", ""),
                        "description": entry.get("reason_snippet", ""),
                        "deadline_ts": deadline_ts,
                    })
        except Exception:
            continue

    return sorted(deadlines, key=lambda x: float(x.get("deadline_ts", 0)))


def surface_queue(
    session_id: Optional[str] = None,
    sweeper_dir: Path = _SWEEPER_DIR,
    herder_dir: Path = _HERDER_DIR,
) -> dict:
    """
    Assemble prioritized queue digest.

    Returns {
        knight_blockers, pending_items, herder_summary,
        total_pending, formatted_digest
    }
    """
    pending = get_sweeper_pending(sweeper_dir)
    herder = get_herder_queue_summary(herder_dir)

    knight_blockers = [p for p in pending if p.get("is_knight_blocker")]
    other_pending = [p for p in pending if not p.get("is_knight_blocker")]

    # Sort by priority descending
    knight_blockers.sort(key=lambda x: x.get("priority", 50), reverse=True)
    other_pending.sort(key=lambda x: x.get("priority", 50), reverse=True)

    lines = [f"**Queue Surface** (session: {session_id or 'unknown'})"]
    if knight_blockers:
        lines.append(f"  🔴 Knight-fire-blockers ({len(knight_blockers)}):")
        for item in knight_blockers[:5]:
            lines.append(f"    - {item['id']}: {item['description'][:80]}")
    else:
        lines.append("  ✓ No Knight-fire-blockers")

    if other_pending:
        lines.append(f"  Pending items: {len(other_pending)}")
    lines.append(
        f"  Herder: {herder.get('n_observations', 0)} obs / "
        f"R²={herder.get('r_squared', 0):.4f}"
    )

    return {
        "knight_blockers": knight_blockers,
        "pending_items": other_pending,
        "herder_summary": herder,
        "total_pending": len(pending),
        "formatted_digest": "\n".join(lines),
    }
