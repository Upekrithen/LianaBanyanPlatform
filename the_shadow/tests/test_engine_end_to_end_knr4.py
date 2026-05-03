"""
KN-R4 End-to-End Engine Integration Test — T1-T8
=================================================
Tests: 3-K-prompt cycle, 50/50 A/B coverage, PreparedContext at hand-off,
no cold-session between K-prompts, end-state all landed, BeeCanonMarks,
5-Knight×3-K-prompt scaling, KrissKross failure recovery.
"""

import sys
import threading
import time
from collections import Counter
from pathlib import Path

import pytest

WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(WORKSPACE_ROOT))

from the_shadow.engine_orchestrator import (
    EngineOrchestrator,
    ShadowDescriptor,
    CycleRecord,
    run_parallel_engines,
)
from the_shadow.fire_receipt import FireReceipt


# ─── In-memory Pod-Q stub ────────────────────────────────────────────────────

class InMemoryOnDeck:
    """Thread-safe in-memory On Deck Scribe for integration tests."""

    def __init__(self, entries: list[dict]):
        self._entries: dict[str, dict] = {e["id"]: dict(e) for e in entries}
        self._lock = threading.Lock()
        self.in_flight_calls: list[str] = []
        self.landed_calls: list[str] = []
        self.attach_calls: list[tuple[str, dict]] = []

    def get_queue(self) -> list[dict]:
        with self._lock:
            return list(self._entries.values())

    def get_entry(self, entry_id: str):
        with self._lock:
            return dict(self._entries[entry_id]) if entry_id in self._entries else None

    def mark_in_flight(self, entry_id: str) -> None:
        with self._lock:
            self.in_flight_calls.append(entry_id)
            if entry_id in self._entries:
                self._entries[entry_id]["status"] = "in_flight"

    def mark_landed(self, entry_id: str, commit_hash: str = "") -> None:
        with self._lock:
            self.landed_calls.append(entry_id)
            if entry_id in self._entries:
                self._entries[entry_id]["status"] = "landed"
                self._entries[entry_id]["commit_hash"] = commit_hash

    def attach_prepared_context(self, entry_id: str, ctx: dict) -> None:
        with self._lock:
            self.attach_calls.append((entry_id, ctx))
            if entry_id in self._entries:
                self._entries[entry_id]["prepared_context"] = ctx


def _make_entries(n: int, prefix: str = "K") -> list[dict]:
    return [
        {
            "id": f"LB-ODS-{prefix}{i:04d}",
            "category": "knight",
            "k_prompt_path": f"PROMPT_KNIGHT_{prefix}{i:03d}_TEST.md",
            "status": "queued",
            "priority": i,
            "prerequisites": [],
            "ts_queued": "2026-05-01T00:00:00Z",
            "prepared_context": None,
        }
        for i in range(1, n + 1)
    ]


def _noop_fire(entry: dict, session: str) -> None:
    """Simulated Knight execution — instant success."""
    pass


# ─── T1: 3-K-prompt cycle completes end-to-end ───────────────────────────────

def test_t1_three_kprompt_cycle():
    """Engine runs 3 K-prompts in sequence without manual intervention."""
    entries = _make_entries(3, "A")
    client = InMemoryOnDeck(entries)

    orch = EngineOrchestrator(
        knight_session_id="knight-alpha",
        on_deck_client=client,
        knight_fire_fn=_noop_fire,
    )
    records = orch.run_all()

    assert len(records) == 3, f"expected 3 cycles, got {len(records)}"
    for r in records:
        assert r.landed, f"entry {r.entry_id} did not land"
        assert r.fire_receipt is not None
        assert isinstance(r.fire_receipt, FireReceipt)


# ─── T2: 8 Shadows preserved 50/50 A/B coverage throughout ──────────────────

def test_t2_ab_coverage_maintained():
    """After 3 cycles the engine still has ≈4/4 A/B shadow coverage."""
    entries = _make_entries(3, "B")
    client = InMemoryOnDeck(entries)

    orch = EngineOrchestrator(
        knight_session_id="knight-beta",
        on_deck_client=client,
        knight_fire_fn=_noop_fire,
    )
    orch.run_all()

    assert orch.phase_coverage_ok(), (
        f"A/B coverage out of balance: "
        f"A={sum(1 for s in orch.shadows if s.phase=='A')}, "
        f"B={sum(1 for s in orch.shadows if s.phase=='B')}"
    )


# ─── T3: PreparedContext present at hand-off time ────────────────────────────

def test_t3_prepared_context_at_handoff():
    """Every fire_receipt has prepared_context_summary populated."""
    entries = _make_entries(3, "C")
    client = InMemoryOnDeck(entries)

    orch = EngineOrchestrator(
        knight_session_id="knight-gamma",
        on_deck_client=client,
        knight_fire_fn=_noop_fire,
    )
    records = orch.run_all()

    for r in records:
        assert r.fire_receipt is not None
        # shadow recorded
        assert r.prepared_context_shadow is not None
        # client received attach call for the entry
        attached_ids = [call[0] for call in client.attach_calls]
        assert r.entry_id in attached_ids, f"no attach_prepared_context call for {r.entry_id}"


# ─── T4: Knight session never went cold between K-prompts ────────────────────

def test_t4_no_cold_session():
    """
    Simulate timing: each cycle completes without a 'gap' > threshold.
    Since our test uses instant fire, this checks no cycle record has
    fire_receipt=None (which would indicate a stall).
    """
    entries = _make_entries(3, "D")
    client = InMemoryOnDeck(entries)

    orch = EngineOrchestrator(
        knight_session_id="knight-delta",
        on_deck_client=client,
        knight_fire_fn=_noop_fire,
    )
    records = orch.run_all()

    for i, r in enumerate(records):
        assert r.fire_receipt is not None, f"cycle {i} had no fire_receipt (cold session)"
        # Each cycle must have been fired to the same session
        assert r.knight_session_id == "knight-delta"


# ─── T5: Pod-Q queue end-state all 3 entries marked landed ───────────────────

def test_t5_queue_end_state_all_landed():
    """After engine run, all 3 entries in Pod-Q are marked landed with commit_hash."""
    entries = _make_entries(3, "E")
    client = InMemoryOnDeck(entries)

    orch = EngineOrchestrator(
        knight_session_id="knight-epsilon",
        on_deck_client=client,
        knight_fire_fn=_noop_fire,
    )
    orch.run_all()

    final_queue = client.get_queue()
    for entry in final_queue:
        assert entry["status"] == "landed", f"{entry['id']} not landed: {entry['status']}"
        assert entry.get("commit_hash"), f"{entry['id']} missing commit_hash"


# ─── T6: BeeCanonMarks attribution recorded per K-prompt ─────────────────────

def test_t6_bee_canon_marks():
    """Each cycle increments BeeCanonMarks on the staging Shadow."""
    entries = _make_entries(3, "F")
    client = InMemoryOnDeck(entries)

    orch = EngineOrchestrator(
        knight_session_id="knight-zeta",
        on_deck_client=client,
        knight_fire_fn=_noop_fire,
    )
    records = orch.run_all()

    for r in records:
        assert r.bee_canon_marks > 0, f"cycle {r.entry_id} has no BeeCanonMarks"

    # At least one Shadow has cumulative marks ≥ 1
    total_marks = sum(s.bee_canon_marks for s in orch.shadows)
    assert total_marks >= 3, f"expected >=3 total marks, got {total_marks}"


# ─── T7: 5-Knight scaling — 15 K-prompts in parallel ────────────────────────

def test_t7_five_knight_parallel_scaling():
    """
    5 EngineOrchestrators × 3 K-prompts each = 15 K-prompts total.
    All land; no Shadow over-allocation (each orchestrator owns its own Shadows).
    """
    orchestrators = []
    for k in range(1, 6):
        entries = _make_entries(3, f"G{k}")
        client = InMemoryOnDeck(entries)
        orch = EngineOrchestrator(
            knight_session_id=f"knight-{k}",
            on_deck_client=client,
            knight_fire_fn=_noop_fire,
        )
        orchestrators.append(orch)

    all_results = run_parallel_engines(orchestrators)

    total_landed = 0
    for i, result in enumerate(all_results):
        assert isinstance(result, list), f"knight-{i+1} returned exception: {result}"
        assert len(result) == 3, f"knight-{i+1} completed {len(result)} cycles, expected 3"
        for r in result:
            assert r.landed
        total_landed += len(result)

    assert total_landed == 15, f"expected 15 total landed K-prompts, got {total_landed}"


# ─── T8: KrissKross failure recovery — Shadow crash mid-cycle ────────────────

def test_t8_krisskross_shadow_crash_recovery():
    """
    Inject Shadow crash on shadow-1 after first cycle.
    KrissKross detects via shadow_alive_fn; engine continues with remaining Shadows.
    """
    entries = _make_entries(3, "H")
    client = InMemoryOnDeck(entries)
    crashed = {"shadow-1"}

    crash_after: list[int] = [0]  # crash shadow-1 after first cycle

    call_count = [0]

    def shadow_alive(shadow_id: str) -> bool:
        # shadow-1 goes down after the first cycle completes
        if shadow_id in crashed and call_count[0] > 0:
            return False
        return True

    def counting_fire(entry: dict, session: str) -> None:
        call_count[0] += 1

    orch = EngineOrchestrator(
        knight_session_id="knight-eta",
        on_deck_client=client,
        knight_fire_fn=counting_fire,
        shadow_alive_fn=shadow_alive,
    )
    records = orch.run_all()

    # All 3 K-prompts still land despite crash
    assert len(records) == 3, f"expected 3 cycles, got {len(records)}"
    for r in records:
        assert r.landed

    # shadow-1 eventually marked not alive
    dead_shadows = [s for s in orch.shadows if not s.alive]
    assert len(dead_shadows) >= 1, "expected at least 1 dead shadow after crash injection"
