"""
Chronicler — Per-Augur iterative-state tablet writer (K515 / A&A #2300)

Each Augur in the Bishop Wing gets a Chronicler tablet at:
  ~/.claude/state/chroniclers/augur_<id>.jsonl

Per Founder's articulation (B123-late):
  "Think of them like bacteria — we need them to be healthy, because they
   maintain balance in our gut. The VALUE of them is that Chronos, a
   specialized Scribe, can link to ALL of them within a Scope defined at
   invocation time, to READ THE COMBINED STATE."

Chronicler records an UpTick (new iterative entry) on every Augur evaluation
(signaled OR not). Chronos reads across all Chronicler tablets to answer
time-state aggregation queries.

Append-only. Never mutates historical state. Foundational for governance audit.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

CHRONICLER_DIR = Path(os.path.expanduser("~/.claude/state/chroniclers"))


def _tablet_path(augur_id: str) -> Path:
    return CHRONICLER_DIR / f"augur_{augur_id}.jsonl"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_chronicler(
    augur_id: str,
    augur_name: str,
    triggered: bool,
    signal: Optional[str],
    failure_action: str,
    consensus_decision: str,
    file_path: str,
    tool_name: str,
    elapsed_ms: int,
    reason: str = "",
    session: str = "",
) -> None:
    """
    Append one UpTick entry to the Augur's Chronicler tablet.

    Called from Wing engine after every Augur evaluation.
    Append-only — never modifies historical entries.
    Fail-safe: any write error is silently swallowed.
    """
    record = {
        "ts": _iso_now(),
        "augur_id": augur_id,
        "augur_name": augur_name,
        "triggered": triggered,
        "signal": signal,
        "failure_action": failure_action,
        "consensus_decision": consensus_decision,
        "tool_call": {"tool": tool_name, "file_path": file_path},
        "elapsed_ms": elapsed_ms,
        "reason_snippet": reason[:120] if reason else "",
        "session": session,
    }
    try:
        CHRONICLER_DIR.mkdir(parents=True, exist_ok=True)
        tablet = _tablet_path(augur_id)
        with open(tablet, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass  # Chronicler failure must never break the Wing


def read_tablet(augur_id: str, limit: int = 1000) -> List[Dict[str, Any]]:
    """
    Read the last `limit` entries from an Augur's Chronicler tablet.
    Returns entries in chronological order (oldest first).
    """
    tablet = _tablet_path(augur_id)
    if not tablet.exists():
        return []
    try:
        lines = tablet.read_text(encoding="utf-8").strip().split("\n")
        entries = []
        for line in lines:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except Exception:
                    pass
        return entries[-limit:]
    except Exception:
        return []


def tablet_stats(augur_id: str) -> Dict[str, Any]:
    """
    Returns aggregate stats for one Augur's Chronicler tablet.
    Used by Chronos to build time-state aggregates.
    """
    entries = read_tablet(augur_id)
    if not entries:
        return {
            "augur_id": augur_id,
            "total_evaluations": 0,
            "total_triggered": 0,
            "fire_rate": 0.0,
            "last_fire_ts": None,
            "last_evaluation_ts": None,
            "signal_counts": {},
        }

    triggered = [e for e in entries if e.get("triggered")]
    signal_counts: Dict[str, int] = {}
    for e in triggered:
        sig = e.get("signal") or e.get("failure_action", "unknown")
        signal_counts[sig] = signal_counts.get(sig, 0) + 1

    last_fire = triggered[-1]["ts"] if triggered else None
    last_eval = entries[-1]["ts"] if entries else None

    return {
        "augur_id": augur_id,
        "total_evaluations": len(entries),
        "total_triggered": len(triggered),
        "fire_rate": round(len(triggered) / len(entries), 4) if entries else 0.0,
        "last_fire_ts": last_fire,
        "last_evaluation_ts": last_eval,
        "signal_counts": signal_counts,
        "recent_fires": [
            {"ts": e["ts"], "signal": e.get("signal"), "file": e.get("tool_call", {}).get("file_path", "")}
            for e in triggered[-5:]
        ],
    }


def wing_chronos_query(
    augur_ids: Optional[List[str]] = None,
    since_ts: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Cross-Augur aggregate query (Chronos invocation surface).

    augur_ids: which Augurs to include (None = all known tablets)
    since_ts:  ISO timestamp filter — only entries after this time

    Returns Wing-wide rollup + per-Augur stats.
    """
    if augur_ids is None:
        # Auto-discover from tablet files
        if not CHRONICLER_DIR.exists():
            return {"augur_stats": [], "wing_totals": {}}
        tablet_files = sorted(CHRONICLER_DIR.glob("augur_*.jsonl"))
        augur_ids = [f.stem.removeprefix("augur_") for f in tablet_files]

    augur_stats = []
    total_evals = 0
    total_fires = 0

    for aid in augur_ids:
        entries = read_tablet(aid)

        if since_ts:
            entries = [e for e in entries if e.get("ts", "") >= since_ts]

        if not entries:
            augur_stats.append({"augur_id": aid, "total_evaluations": 0, "total_triggered": 0})
            continue

        triggered = [e for e in entries if e.get("triggered")]
        total_evals += len(entries)
        total_fires += len(triggered)

        fire_rate = round(len(triggered) / len(entries), 4) if entries else 0.0
        last_fire = triggered[-1]["ts"] if triggered else None

        augur_stats.append({
            "augur_id": aid,
            "total_evaluations": len(entries),
            "total_triggered": len(triggered),
            "fire_rate": fire_rate,
            "last_fire_ts": last_fire,
        })

    wing_fire_rate = round(total_fires / total_evals, 4) if total_evals else 0.0

    return {
        "query_ts": _iso_now(),
        "since_ts": since_ts,
        "augur_count": len(augur_ids),
        "augur_stats": augur_stats,
        "wing_totals": {
            "total_evaluations": total_evals,
            "total_triggered": total_fires,
            "wing_fire_rate": wing_fire_rate,
        },
    }
