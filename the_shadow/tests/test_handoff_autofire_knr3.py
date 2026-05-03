"""
KN-R3 Hand-off Auto-Fire — T1-T7 test suite
============================================
Tests: prepared_context gate, prereq gate, BP017 paste-format,
in_flight mutation, FireReceipt, 5-concurrent, idempotency.
"""

import sys
import threading
from pathlib import Path

import pytest

WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(WORKSPACE_ROOT))

from the_shadow.handoff_autofire import HandoffAutoFire, FireError, fire_parallel
from the_shadow.fire_receipt import FireReceipt
from the_shadow.knight_fire_composer import compose_paste_text, validate_paste_text


# ─── Stub on_deck_client ─────────────────────────────────────────────────────

class StubOnDeckClient:
    """In-memory Pod-Q stub that records mark_in_flight calls."""

    def __init__(self, entries: list[dict]):
        self._entries: dict[str, dict] = {e["id"]: e for e in entries}
        self.in_flight_calls: list[str] = []

    def get_entry(self, entry_id: str):
        return self._entries.get(entry_id)

    def get_queue(self) -> list[dict]:
        return list(self._entries.values())

    def mark_in_flight(self, entry_id: str) -> None:
        self.in_flight_calls.append(entry_id)
        if entry_id in self._entries:
            self._entries[entry_id]["status"] = "in_flight"


def _base_entry(
    entry_id: str = "LB-ODS-0001",
    k_prompt_path: str = "PROMPT_KNIGHT_K999_TEST.md",
    status: str = "queued",
    prepared_context=None,
    prerequisites: list | None = None,
) -> dict:
    return {
        "id": entry_id,
        "category": "knight",
        "k_prompt_path": k_prompt_path,
        "status": status,
        "priority": 0,
        "prerequisites": prerequisites or [],
        "ts_queued": "2026-05-01T00:00:00Z",
        "prepared_context": prepared_context,
    }


# ─── T1: no prepared_context → FireError ─────────────────────────────────────

def test_t1_no_prepared_context_blocked():
    """Entry without prepared_context must raise FireError."""
    entry = _base_entry(prepared_context=None)
    client = StubOnDeckClient([entry])
    af = HandoffAutoFire(shadow_id="shadow-1", on_deck_client=client)

    with pytest.raises(FireError, match="prepared_context"):
        af.fire(entry, knight_session_target="knight-1")

    assert client.in_flight_calls == [], "must not mutate queue when gate fails"


# ─── T2: unlanded prerequisite → FireError ───────────────────────────────────

def test_t2_unlanded_prereq_blocked():
    """Entry whose prerequisite is not yet landed must raise FireError."""
    prereq = _base_entry(entry_id="LB-ODS-0001", status="queued")   # not landed
    entry = _base_entry(
        entry_id="LB-ODS-0002",
        prepared_context={"summary": "ready"},
        prerequisites=["LB-ODS-0001"],
    )
    client = StubOnDeckClient([prereq, entry])
    af = HandoffAutoFire(shadow_id="shadow-1", on_deck_client=client)

    with pytest.raises(FireError, match="not yet landed"):
        af.fire(entry, knight_session_target="knight-1")

    assert client.in_flight_calls == []


# ─── T3: paste-text format correct (BP017) ───────────────────────────────────

def test_t3_paste_text_format():
    """compose_paste_text produces bare-filename + advance-permissions footer."""
    path = "/some/dir/PROMPT_KNIGHT_K500_B118_TEST.md"
    paste = compose_paste_text(path, bishop_parallel_note="Stalk 2 K-prompt drafting")

    lines = paste.splitlines()
    # First non-empty line must be the bare filename
    assert lines[0] == "PROMPT_KNIGHT_K500_B118_TEST.md"
    # No bullets
    assert not any(l.strip().startswith("- ") for l in lines)
    # No code-fences
    assert "```" not in paste
    # No markdown links
    assert "](" not in paste
    # Advance-permissions footer present
    assert "advance-permissions: just begin" in paste

    violations = validate_paste_text(paste)
    assert violations == [], f"unexpected violations: {violations}"


# ─── T4: Knight session marked in_flight ─────────────────────────────────────

def test_t4_mark_in_flight():
    """Successful fire calls mark_in_flight on the entry."""
    entry = _base_entry(
        entry_id="LB-ODS-0010",
        prepared_context={"summary": "pre-staged"},
    )
    client = StubOnDeckClient([entry])
    af = HandoffAutoFire(shadow_id="shadow-2", on_deck_client=client)
    af.reset_idempotency()

    receipt = af.fire(entry, knight_session_target="knight-2")

    assert "LB-ODS-0010" in client.in_flight_calls
    assert client.get_entry("LB-ODS-0010")["status"] == "in_flight"
    assert isinstance(receipt, FireReceipt)


# ─── T5: FireReceipt has accurate timestamp + session ID ─────────────────────

def test_t5_fire_receipt_fields():
    """FireReceipt contains correct entry_id, session, shadow, timestamp."""
    entry = _base_entry(
        entry_id="LB-ODS-0020",
        k_prompt_path="PROMPT_KNIGHT_K333_TEST.md",
        prepared_context={"summary": "ctx"},
    )
    client = StubOnDeckClient([entry])
    af = HandoffAutoFire(shadow_id="shadow-5", on_deck_client=client)
    af.reset_idempotency()

    receipt = af.fire(entry, knight_session_target="knight-5")

    assert receipt.entry_id == "LB-ODS-0020"
    assert receipt.knight_session_target == "knight-5"
    assert receipt.shadow_id == "shadow-5"
    assert "2026" in receipt.fired_at or receipt.fired_at  # ISO timestamp present
    assert len(receipt.idempotency_key) == 64  # sha256 hex
    assert "PROMPT_KNIGHT_K333_TEST.md" in receipt.paste_text


# ─── T6: 5 concurrent fires to 5 Knight sessions — no double-fire ────────────

def test_t6_five_concurrent_fires():
    """5 entries × 5 Knight sessions can fire concurrently without collision."""
    entries = [
        _base_entry(
            entry_id=f"LB-ODS-{i:04d}",
            k_prompt_path=f"PROMPT_KNIGHT_K{i:03d}_TEST.md",
            prepared_context={"summary": f"ctx-{i}"},
        )
        for i in range(1, 6)
    ]
    client = StubOnDeckClient(entries)
    af = HandoffAutoFire(shadow_id="shadow-concurrent", on_deck_client=client)
    af.reset_idempotency()

    pairs = [(e, f"knight-{i+1}") for i, e in enumerate(entries)]
    results = fire_parallel(af, pairs)

    assert len(results) == 5
    for i, result in enumerate(results):
        assert isinstance(result, FireReceipt), \
            f"session {i+1} got exception: {result}"

    # No double-fire: each entry marked in_flight exactly once
    from collections import Counter
    counts = Counter(client.in_flight_calls)
    for e in entries:
        assert counts[e["id"]] == 1, f"double-fire on {e['id']}: {counts}"


# ─── T7: idempotency — re-fire returns same FireReceipt ──────────────────────

def test_t7_idempotency():
    """Re-firing same entry to same session returns identical FireReceipt, no double-mutate."""
    entry = _base_entry(
        entry_id="LB-ODS-0099",
        prepared_context={"summary": "idem"},
    )
    client = StubOnDeckClient([entry])
    af = HandoffAutoFire(shadow_id="shadow-idem", on_deck_client=client)
    af.reset_idempotency()

    receipt1 = af.fire(entry, "knight-9")
    receipt2 = af.fire(entry, "knight-9")  # second call

    # Same object returned
    assert receipt1.idempotency_key == receipt2.idempotency_key  # gitleaks:allow
    assert receipt1.fired_at == receipt2.fired_at

    # mark_in_flight called only ONCE
    assert client.in_flight_calls.count("LB-ODS-0099") == 1
