"""
Predicate: letter_dispatched
============================
Passes when the TouchStone ledger contains a `letter_dispatched` event for
the recipient. Dispatch = the physical send happened. The event is logged
manually by Founder via the dispatch CLI; this predicate is purely a read-side
check — it never auto-dispatches anything.

Args:
    letter_recipient (str): recipient name (e.g. "Trebor Scholz")

Introduced for K442 (B117). Split out of `response_received_within` so the
3-state ladder (drafted → locked → dispatched → response_received) can resolve
to the highest-passing state instead of failing wholesale on a missing
dispatch event.
"""

from ._letter_helpers import latest_event


def check(args: dict) -> dict:
    recipient = args.get("letter_recipient", "")
    if not recipient:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required arg: letter_recipient",
        }

    evt = latest_event("letter_dispatched", recipient)
    if not evt:
        return {
            "passed": False,
            "observed": None,
            "message": f"No letter_dispatched event found for '{recipient}'",
        }

    details = evt.get("details", {}) or {}
    ts = details.get("dispatched_at") or evt.get("timestamp", "")
    return {
        "passed": True,
        "observed": ts,
        "message": f"letter_dispatched event for '{recipient}' at {ts}",
    }
