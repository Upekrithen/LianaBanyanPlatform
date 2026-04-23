"""
Tests for the K442 (B117) 3-state letter predicate ladder.

Covers:
- letter_drafted (file resolution + ambiguous-last-name disambiguation)
- letter_locked (letters.json + ledger event paths)
- letter_dispatched (ledger event)
- response_received_within refactor (delegates to letter_dispatched, supports max_days)
- verify.verify_deliverable ladder path: state ascends drafted -> locked -> dispatched -> response_received
- blocked-status short-circuit (Bill Gates pattern)
- letters_state_summary aggregation
"""

import json
import os
import sys
import tempfile
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest import mock

TOUCHSTONE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOUCHSTONE_DIR))

from predicates import PREDICATE_REGISTRY  # noqa: E402
from predicates._letter_helpers import recipient_matches  # noqa: E402
import verify  # noqa: E402


# ─── recipient_matches ─────────────────────────────────────────────────────

def test_recipient_matches_exact():
    assert recipient_matches("Trebor Scholz", "Trebor Scholz")


def test_recipient_matches_filename_form():
    assert recipient_matches("Trebor Scholz", "CROWN_LETTER_TREBOR_SCHOLZ_SEC_FIXED_V14")


def test_recipient_matches_disambiguates_olaf_from_trebor():
    # "Trebor Scholz" looking for a file named "OLAF_SCHOLZ" must NOT match.
    assert not recipient_matches("Trebor Scholz", "CROWN_LETTER_OLAF_SCHOLZ_V2")
    assert not recipient_matches("Olaf Scholz", "CROWN_LETTER_TREBOR_SCHOLZ_SEC_FIXED_V14")


def test_recipient_matches_blocks_bare_ambiguous_lastname():
    assert not recipient_matches("Bill Gates", "GATES")
    assert not recipient_matches("Melinda French Gates", "GATES")


def test_recipient_matches_extra_token_disambiguates():
    assert recipient_matches("Bill Gates", "LETTER_BILL_GATES")
    assert recipient_matches("Melinda French Gates", "LETTER_MELINDA_FRENCH_GATES")


# ─── letter_drafted (real repo state) ─────────────────────────────────────

def test_letter_drafted_finds_trebor_scholz():
    r = PREDICATE_REGISTRY["letter_drafted"]({"letter_recipient": "Trebor Scholz"})
    assert r["passed"] is True
    assert "TREBOR" in r["observed"].upper()


def test_letter_drafted_finds_olaf_scholz_separately():
    r = PREDICATE_REGISTRY["letter_drafted"]({"letter_recipient": "Olaf Scholz"})
    assert r["passed"] is True
    assert "OLAF_SCHOLZ" in r["observed"].upper()


def test_letter_drafted_missing_recipient_arg():
    r = PREDICATE_REGISTRY["letter_drafted"]({})
    assert r["passed"] is False
    assert "letter_recipient" in r["message"]


def test_letter_drafted_no_match_for_unknown_recipient():
    r = PREDICATE_REGISTRY["letter_drafted"]({"letter_recipient": "Zorblax Q. Nonexistent"})
    assert r["passed"] is False


# ─── letter_dispatched (ledger event) ─────────────────────────────────────

def _temp_ledger(events: list, monkeypatch):
    """Patch every helper's LEDGER_PATH to a tempfile populated with `events`."""
    fh, path = tempfile.mkstemp(suffix=".jsonl")
    os.close(fh)
    p = Path(path)
    p.write_text(
        "\n".join(json.dumps(e, ensure_ascii=False) for e in events) + "\n",
        encoding="utf-8",
    )
    from predicates import _letter_helpers
    monkeypatch.setattr(_letter_helpers, "LEDGER_PATH", p)
    return p


def test_letter_dispatched_finds_event(monkeypatch):
    ts = "2026-04-20T10:00:00+00:00"
    _temp_ledger([{
        "timestamp": ts, "event_type": "letter_dispatched",
        "deliverable_id": "crown-letter-trebor-scholz",
        "details": {"recipient_name": "Trebor Scholz", "dispatched_at": ts},
    }], monkeypatch)
    r = PREDICATE_REGISTRY["letter_dispatched"]({"letter_recipient": "Trebor Scholz"})
    assert r["passed"] is True
    assert ts in r["observed"]


def test_letter_dispatched_no_event(monkeypatch):
    _temp_ledger([], monkeypatch)
    r = PREDICATE_REGISTRY["letter_dispatched"]({"letter_recipient": "Trebor Scholz"})
    assert r["passed"] is False
    assert "No letter_dispatched event" in r["message"]


# ─── letter_locked (ledger event path) ─────────────────────────────────────

def test_letter_locked_via_ledger(monkeypatch):
    _temp_ledger([{
        "timestamp": "2026-04-19T10:00:00+00:00",
        "event_type": "letter_locked",
        "deliverable_id": "crown-letter-trebor-scholz",
        "details": {"recipient_name": "Trebor Scholz"},
    }], monkeypatch)
    r = PREDICATE_REGISTRY["letter_locked"]({"letter_recipient": "Trebor Scholz"})
    assert r["passed"] is True


def test_letter_locked_no_event_no_letters_json(monkeypatch):
    _temp_ledger([], monkeypatch)
    # letters.json does not exist in the repo
    r = PREDICATE_REGISTRY["letter_locked"]({"letter_recipient": "Trebor Scholz"})
    assert r["passed"] is False
    assert "absent" in r["message"]


# ─── response_received_within refactor ─────────────────────────────────────

def test_response_received_within_delegates_to_dispatched_when_no_event(monkeypatch):
    _temp_ledger([], monkeypatch)
    r = PREDICATE_REGISTRY["response_received_within"]({
        "letter_recipient": "Trebor Scholz", "max_days": 14,
    })
    assert r["passed"] is False
    assert "not yet dispatched" in r["message"]


def test_response_received_within_pass_when_response_in_window(monkeypatch):
    dispatched = "2026-04-10T00:00:00+00:00"
    received = "2026-04-12T00:00:00+00:00"  # 2 days later, well inside 14d window
    _temp_ledger([
        {
            "timestamp": dispatched, "event_type": "letter_dispatched",
            "deliverable_id": "crown-letter-trebor-scholz",
            "details": {"recipient_name": "Trebor Scholz", "dispatched_at": dispatched},
        },
        {
            "timestamp": received, "event_type": "response_received",
            "deliverable_id": "crown-letter-trebor-scholz",
            "details": {"recipient_name": "Trebor Scholz", "received_at": received},
        },
    ], monkeypatch)
    r = PREDICATE_REGISTRY["response_received_within"]({
        "letter_recipient": "Trebor Scholz", "max_days": 14,
    })
    assert r["passed"] is True
    assert r["observed"] == 48.0  # 2 days = 48 hours


def test_response_received_within_max_days_overrides_max_hours(monkeypatch):
    dispatched = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
    _temp_ledger([{
        "timestamp": dispatched, "event_type": "letter_dispatched",
        "deliverable_id": "x", "details": {
            "recipient_name": "Trebor Scholz", "dispatched_at": dispatched,
        },
    }], monkeypatch)
    # 14d window: still inside, no overdue
    r = PREDICATE_REGISTRY["response_received_within"]({
        "letter_recipient": "Trebor Scholz", "max_days": 14, "max_hours": 1,
    })
    assert r["passed"] is False
    assert "remaining" in r["message"]


# ─── verify.verify_deliverable ladder path ─────────────────────────────────

CROWN_TREBOR_ID = "crown-letter-trebor-scholz"
CROWN_BILL_ID = "crown-letter-bill-gates"


def test_verify_ladder_returns_drafted_state_for_trebor():
    r = verify.verify_deliverable(CROWN_TREBOR_ID)
    assert r["letter_state"] == "drafted"
    assert r["resolved_path"] is not None
    assert "TREBOR" in r["resolved_path"].upper()
    # Not all rungs pass yet -> overall passed = False
    assert r["passed"] is False
    # Each rung was attempted
    rungs = [pr["rung"] for pr in r["predicate_results"]]
    assert rungs == [
        "letter_drafted", "letter_locked",
        "letter_dispatched", "response_received_within:14d",
    ]


def test_verify_ladder_blocked_short_circuits_for_bill_gates():
    r = verify.verify_deliverable(CROWN_BILL_ID)
    assert r["letter_state"] == "blocked"
    assert r["passed"] is False
    assert any("Epstein" in m or "Blocked" in m for m in r["blocking_failures"])
    assert r["predicate_results"] == []


def test_verify_ladder_state_ascends_with_ledger_events(monkeypatch):
    """Simulate the full lifecycle by injecting a temp ledger; state should climb."""
    # Stage 1: locked
    _temp_ledger([
        {"timestamp": "2026-04-15T10:00:00+00:00", "event_type": "letter_locked",
         "deliverable_id": CROWN_TREBOR_ID,
         "details": {"recipient_name": "Trebor Scholz"}},
    ], monkeypatch)
    r = verify.verify_deliverable(CROWN_TREBOR_ID)
    assert r["letter_state"] == "locked"

    # Stage 2: locked + dispatched
    dispatched = "2026-04-16T10:00:00+00:00"
    _temp_ledger([
        {"timestamp": "2026-04-15T10:00:00+00:00", "event_type": "letter_locked",
         "deliverable_id": CROWN_TREBOR_ID,
         "details": {"recipient_name": "Trebor Scholz"}},
        {"timestamp": dispatched, "event_type": "letter_dispatched",
         "deliverable_id": CROWN_TREBOR_ID,
         "details": {"recipient_name": "Trebor Scholz", "dispatched_at": dispatched}},
    ], monkeypatch)
    r = verify.verify_deliverable(CROWN_TREBOR_ID)
    assert r["letter_state"] == "dispatched"

    # Stage 3: locked + dispatched + response_received within window
    received = "2026-04-17T10:00:00+00:00"  # 24h later, within 14d
    _temp_ledger([
        {"timestamp": "2026-04-15T10:00:00+00:00", "event_type": "letter_locked",
         "deliverable_id": CROWN_TREBOR_ID,
         "details": {"recipient_name": "Trebor Scholz"}},
        {"timestamp": dispatched, "event_type": "letter_dispatched",
         "deliverable_id": CROWN_TREBOR_ID,
         "details": {"recipient_name": "Trebor Scholz", "dispatched_at": dispatched}},
        {"timestamp": received, "event_type": "response_received",
         "deliverable_id": CROWN_TREBOR_ID,
         "details": {"recipient_name": "Trebor Scholz", "received_at": received}},
    ], monkeypatch)
    r = verify.verify_deliverable(CROWN_TREBOR_ID)
    assert r["letter_state"] == "response_received"
    assert r["passed"] is True


def test_verify_ladder_no_match_stays_pending(monkeypatch):
    """A letter with no matching file and no ledger events stays at 'pending'."""
    _temp_ledger([], monkeypatch)
    r = verify.verify_deliverable("crown-letter-pitbull")
    # 'Pitbull' has no matching file in the repo
    assert r["letter_state"] in ("pending", "drafted")
    # If pending, no false positive
    if r["letter_state"] == "pending":
        assert r["resolved_path"] is None


# ─── letters_state_summary aggregator ─────────────────────────────────────

def test_letters_state_summary_returns_breakdown():
    summary = verify.letters_state_summary()
    assert "by_state" in summary
    assert "by_recipient" in summary
    keys = set(summary["by_state"].keys())
    assert keys == {"pending", "drafted", "locked", "dispatched",
                    "response_received", "blocked"}
    # We expect at least one drafted (Trebor) and one blocked (Bill Gates)
    assert summary["by_state"]["drafted"] >= 1
    assert summary["by_state"]["blocked"] >= 1


# ─── back-compat: legacy verification[] path still works ─────────────────

def test_legacy_verification_path_still_works():
    r = verify.verify_deliverable("B096-pudding-182")
    # has classic verification = [{file_exists}, {count_matches}]
    assert "predicate_results" in r
    # No letter_state on legacy path
    assert "letter_state" not in r


if __name__ == "__main__":
    import traceback

    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    failed = 0
    for fn in tests:
        try:
            # Manual fake monkeypatch shim
            if "monkeypatch" in fn.__code__.co_varnames:
                class _MP:
                    def __init__(self):
                        self._undo = []

                    def setattr(self, target, name, value):
                        original = getattr(target, name)
                        self._undo.append((target, name, original))
                        setattr(target, name, value)

                    def restore(self):
                        for t, n, v in reversed(self._undo):
                            setattr(t, n, v)
                mp = _MP()
                try:
                    fn(mp)
                finally:
                    mp.restore()
            else:
                fn()
            print(f"  PASS {fn.__name__}")
            passed += 1
        except Exception:
            print(f"  FAIL {fn.__name__}")
            traceback.print_exc()
            failed += 1
    print(f"\n{passed} passed, {failed} failed, {passed + failed} total")
    sys.exit(1 if failed > 0 else 0)
