"""
TouchStone v1 — Append-Only Ledger
====================================
Every event is logged. Never edited. Never deleted.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone

TOUCHSTONE_DIR = Path(__file__).resolve().parent
LEDGER_PATH = TOUCHSTONE_DIR / "ledger.jsonl"

VALID_EVENT_TYPES = frozenset([
    "created",
    "assigned",
    "started",
    "predicate_run",
    "completed",
    "failed",
    "blocked",
    "escalated_to_founder",
    "letter_dispatched",
    "response_received",
    "followup_sent",
])


def log_event(event_type: str, deliverable_id: str, details: dict = None) -> dict:
    """Append to ledger.jsonl. Never edit or delete."""
    if event_type not in VALID_EVENT_TYPES:
        return {"logged": False, "reason": f"Invalid event_type: {event_type}"}

    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        "deliverable_id": deliverable_id,
        "details": details or {},
    }

    with open(LEDGER_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    return {"logged": True, "entry": entry}


def read_ledger(deliverable_id: str = None, event_type: str = None, limit: int = 50) -> list:
    """Read ledger entries, optionally filtered."""
    if not LEDGER_PATH.exists():
        return []

    entries = []
    for line in LEDGER_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue

        if deliverable_id and entry.get("deliverable_id") != deliverable_id:
            continue
        if event_type and entry.get("event_type") != event_type:
            continue

        entries.append(entry)

    return entries[-limit:]


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        result = log_event(sys.argv[1], sys.argv[2],
                          json.loads(sys.argv[3]) if len(sys.argv) > 3 else {})
        print(json.dumps(result, indent=2))
    else:
        entries = read_ledger(limit=20)
        for e in entries:
            print(json.dumps(e))
