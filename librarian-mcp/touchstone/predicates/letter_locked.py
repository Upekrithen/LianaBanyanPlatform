"""
Predicate: letter_locked
========================
Passes when EITHER:
  (a) librarian-mcp/letters.json contains a recipient entry whose `status` is
      "locked", OR
  (b) the TouchStone ledger (ledger.jsonl) contains a `letter_locked` event
      for the recipient.

Locked = Founder has ratified the draft and it is ready-to-send. Distinct
from drafted (file exists) and dispatched (physical send happened).

Args:
    letter_recipient (str): recipient name (e.g. "Trebor Scholz")

`letters.json` is optional — if absent, only (b) is consulted. This avoids
false-failures during the K442 rollout window before the letters.json index
is populated.

Introduced for K442 (B117).
"""

from ._letter_helpers import (
    load_letters_json,
    find_recipient_entry,
    latest_event,
)


def check(args: dict) -> dict:
    recipient = args.get("letter_recipient", "")
    if not recipient:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required arg: letter_recipient",
        }

    # (a) letters.json
    letters_data = load_letters_json()
    key, entry = find_recipient_entry(letters_data, recipient)
    if entry and isinstance(entry, dict):
        status = (entry.get("status") or "").lower()
        if status == "locked":
            return {
                "passed": True,
                "observed": "letters.json",
                "message": f"letters.json marks '{recipient}' as locked",
            }

    # (b) ledger event
    evt = latest_event("letter_locked", recipient)
    if evt:
        ts = evt.get("timestamp", "")
        return {
            "passed": True,
            "observed": ts,
            "message": f"letter_locked event for '{recipient}' at {ts}",
        }

    src = "letters.json present but recipient not locked" if letters_data else "letters.json absent"
    return {
        "passed": False,
        "observed": None,
        "message": f"No locked state for '{recipient}' ({src}, no letter_locked ledger event)",
    }
