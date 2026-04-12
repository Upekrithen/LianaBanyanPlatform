"""
Predicate: response_received_within
======================================
Checks whether a response_received event exists in the TouchStone ledger
for a given letter recipient within max_hours of the dispatched_at timestamp.

Args:
    letter_recipient (str): name or slug of the recipient
    max_hours (int): deadline window from dispatched_at
    dispatched_at (str): ISO-8601 timestamp of dispatch (optional — falls back to ledger)
"""

import json
from pathlib import Path
from datetime import datetime, timezone, timedelta

TOUCHSTONE_DIR = Path(__file__).resolve().parents[1]
LEDGER_PATH = TOUCHSTONE_DIR / "ledger.jsonl"


def _read_ledger_events(event_type: str = None, recipient: str = None) -> list:
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
        if event_type and entry.get("event_type") != event_type:
            continue
        if recipient:
            details = entry.get("details", {})
            entry_recipient = (
                details.get("recipient_name", "")
                or details.get("letter_recipient", "")
            ).lower()
            if recipient.lower() not in entry_recipient and entry_recipient not in recipient.lower():
                continue
        entries.append(entry)
    return entries


def check(args: dict) -> dict:
    letter_recipient = args.get("letter_recipient", "")
    max_hours = int(args.get("max_hours", 72))
    dispatched_at_str = args.get("dispatched_at", "")

    if not letter_recipient:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required arg: letter_recipient",
        }

    if dispatched_at_str:
        try:
            dispatched_at = datetime.fromisoformat(dispatched_at_str.replace("Z", "+00:00"))
        except ValueError:
            return {
                "passed": False,
                "observed": None,
                "message": f"Invalid dispatched_at timestamp: {dispatched_at_str}",
            }
    else:
        dispatch_events = _read_ledger_events("letter_dispatched", letter_recipient)
        if not dispatch_events:
            return {
                "passed": False,
                "observed": None,
                "message": f"No letter_dispatched event found for '{letter_recipient}' — cannot compute deadline",
            }
        last_dispatch = dispatch_events[-1]
        ts = last_dispatch.get("details", {}).get("dispatched_at") or last_dispatch.get("timestamp", "")
        try:
            dispatched_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except ValueError:
            return {
                "passed": False,
                "observed": None,
                "message": f"Could not parse dispatch timestamp: {ts}",
            }

    deadline = dispatched_at + timedelta(hours=max_hours)
    response_events = _read_ledger_events("response_received", letter_recipient)

    for evt in response_events:
        evt_ts_str = evt.get("details", {}).get("received_at") or evt.get("timestamp", "")
        try:
            evt_ts = datetime.fromisoformat(evt_ts_str.replace("Z", "+00:00"))
        except ValueError:
            continue
        if evt_ts <= deadline:
            elapsed = evt_ts - dispatched_at
            elapsed_hours = elapsed.total_seconds() / 3600
            return {
                "passed": True,
                "observed": round(elapsed_hours, 1),
                "message": f"Response from '{letter_recipient}' received {round(elapsed_hours, 1)}h after dispatch (within {max_hours}h deadline)",
            }

    now = datetime.now(timezone.utc)
    if now > deadline:
        overdue_hours = (now - deadline).total_seconds() / 3600
        return {
            "passed": False,
            "observed": round(overdue_hours, 1),
            "message": f"No response from '{letter_recipient}' — {round(overdue_hours, 1)}h past {max_hours}h deadline",
        }

    remaining_hours = (deadline - now).total_seconds() / 3600
    return {
        "passed": False,
        "observed": round(remaining_hours, 1),
        "message": f"No response from '{letter_recipient}' yet — {round(remaining_hours, 1)}h remaining in {max_hours}h window",
    }
