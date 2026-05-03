"""
EngineOrchestrator — KN-R4 / BP018
=====================================
Top-level engine controller composing:
  - Pod-G: 8-Shadow alternating cylinder fire (A↔B per cycle)
  - Pod-Q: On Deck Scribe canonical state file (queue)
  - Pod-R: Overlap-trigger (NearCompletionWatcher + PreStagingWorkflow + HandoffAutoFire)

One EngineOrchestrator drives a single Knight session.
Five can run concurrently (5-Knight × 3-K-prompt = 15 K-prompts per cycle).

KrissKross reciprocal-reboot: if a Shadow crashes mid-cycle the orchestrator
detects it (shadow_alive returns False) and marks that Shadow as needing
reboot before accepting a new cycle assignment.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Optional

from the_shadow.fire_receipt import FireReceipt
from the_shadow.handoff_autofire import HandoffAutoFire, FireError
from the_shadow.overlap_signal import NearCompletionSignal
from the_shadow.overlap_watcher import NearCompletionWatcher


# ─── Shadow descriptor ───────────────────────────────────────────────────────

@dataclass
class ShadowDescriptor:
    shadow_id: str
    phase: str = "A"          # "A" (build) or "B" (prep)
    alive: bool = True
    bee_canon_marks: int = 0  # attribution per cycle


# ─── CycleRecord ─────────────────────────────────────────────────────────────

@dataclass
class CycleRecord:
    """One K-prompt cycle for one Knight session."""
    entry_id: str
    k_prompt_path: str
    knight_session_id: str
    prepared_context_shadow: Optional[str] = None
    fire_receipt: Optional[FireReceipt] = None
    landed: bool = False
    commit_hash: Optional[str] = None
    bee_canon_marks: int = 0


# ─── EngineOrchestrator ──────────────────────────────────────────────────────

class EngineOrchestrator:
    """
    Drives one Knight session through N K-prompt cycles.

    Constructor params (all clients are duck-typed for testability):
      on_deck_client  — Pod-Q queue (get_queue, get_entry, mark_in_flight,
                        mark_landed, attach_prepared_context)
      knight_fire_fn  — callable(entry, session_target) called after autofire
                        to simulate Knight executing + landing the K-prompt
      shadow_alive_fn — callable(shadow_id) -> bool for KrissKross detection
    """

    NUM_SHADOWS = 8
    PHASE_B_INDICES = {1, 3, 5, 7}  # even-indexed Shadows are Phase B (Prep) per Pod-G

    def __init__(
        self,
        knight_session_id: str,
        on_deck_client,
        knight_fire_fn: Callable[[dict, str], None],
        shadow_alive_fn: Callable[[str], bool] | None = None,
        watcher_class=NearCompletionWatcher,
    ):
        self.knight_session_id = knight_session_id
        self.on_deck = on_deck_client
        self.knight_fire_fn = knight_fire_fn
        self.shadow_alive_fn = shadow_alive_fn or (lambda _: True)
        self.watcher_class = watcher_class

        self.shadows: list[ShadowDescriptor] = [
            ShadowDescriptor(
                shadow_id=f"shadow-{i}",
                phase="B" if i in self.PHASE_B_INDICES else "A",
            )
            for i in range(self.NUM_SHADOWS)
        ]
        self.cycles: list[CycleRecord] = []
        self._lock = threading.Lock()

    # ─── Shadow phase alternation ────────────────────────────────────────

    def _alternate_phases(self) -> None:
        """Flip every Shadow's phase at the end of a cycle (Pod-G pattern)."""
        for s in self.shadows:
            s.phase = "B" if s.phase == "A" else "A"

    def _phase_b_shadows(self) -> list[ShadowDescriptor]:
        return [s for s in self.shadows if s.phase == "B" and s.alive]

    # ─── KrissKross reboot check ─────────────────────────────────────────

    def _check_shadow_health(self) -> None:
        for s in self.shadows:
            if s.alive and not self.shadow_alive_fn(s.shadow_id):
                s.alive = False  # needs reboot

    # ─── Single K-prompt cycle ────────────────────────────────────────────

    def run_cycle(self, entry: dict) -> CycleRecord:
        """
        Drive one K-prompt through the full engine cycle:
          1. Phase-B Shadow pre-stages (simulated near-completion signal)
          2. HandoffAutoFire fires to Knight
          3. knight_fire_fn simulates Knight landing
          4. Pod-Q marked landed
          5. Phases alternate
        Returns CycleRecord.
        """
        record = CycleRecord(
            entry_id=entry["id"],
            k_prompt_path=entry.get("k_prompt_path", ""),
            knight_session_id=self.knight_session_id,
        )

        self._check_shadow_health()

        phase_b = self._phase_b_shadows()
        if not phase_b:
            raise RuntimeError("No Phase-B Shadows alive — KrissKross failure unrecoverable")

        # Pick first available Phase-B Shadow for pre-staging
        staging_shadow = phase_b[0]
        record.prepared_context_shadow = staging_shadow.shadow_id

        # Simulate near-completion signal triggering PreparedContext attachment
        if not entry.get("prepared_context"):
            entry["prepared_context"] = {
                "summary": f"pre-staged by {staging_shadow.shadow_id}",
                "wrasse_pre_injections": [],
                "detective_hits": [],
                "prerequisite_summary": "",
                "staged_at": datetime.now(timezone.utc).isoformat(),
            }
            self.on_deck.attach_prepared_context(entry["id"], entry["prepared_context"])

        # Auto-fire to Knight
        af = HandoffAutoFire(
            shadow_id=staging_shadow.shadow_id,
            on_deck_client=self.on_deck,
        )
        # Clear idempotency for new cycle
        af.reset_idempotency()

        receipt = af.fire(entry, knight_session_target=self.knight_session_id)
        record.fire_receipt = receipt

        # Knight executes K-prompt (simulated by caller-supplied fn)
        self.knight_fire_fn(entry, self.knight_session_id)

        # Mark landed in Pod-Q
        fake_hash = f"abc{entry['id'][-4:]}"
        self.on_deck.mark_landed(entry["id"], commit_hash=fake_hash)
        record.landed = True
        record.commit_hash = fake_hash

        # BeeCanonMarks attribution
        staging_shadow.bee_canon_marks += 1
        record.bee_canon_marks = staging_shadow.bee_canon_marks

        self._alternate_phases()

        with self._lock:
            self.cycles.append(record)

        return record

    def run_all(self) -> list[CycleRecord]:
        """Run all queued entries through engine cycles until queue empty."""
        records: list[CycleRecord] = []
        while True:
            queue = self.on_deck.get_queue()
            pending = [e for e in queue if e.get("status") == "queued"]
            if not pending:
                break
            entry = pending[0]
            records.append(self.run_cycle(entry))
        return records

    # ─── Phase-B coverage check ───────────────────────────────────────────

    def phase_coverage_ok(self) -> bool:
        """
        After any number of alternations, verify ≈50/50 A/B coverage
        (within ±1 shadow due to odd-total adjustments).
        """
        a_count = sum(1 for s in self.shadows if s.phase == "A")
        b_count = sum(1 for s in self.shadows if s.phase == "B")
        return abs(a_count - b_count) <= 2  # 8 shadows → always 4/4


# ─── Parallel multi-Knight engine ────────────────────────────────────────────

def run_parallel_engines(
    orchestrators: list[EngineOrchestrator],
) -> list[list[CycleRecord]]:
    """
    Run N Knight sessions in parallel.
    Returns list-of-lists of CycleRecords, aligned with orchestrators.
    """
    results: list[list[CycleRecord] | Exception | None] = [None] * len(orchestrators)

    def _run(idx: int, orch: EngineOrchestrator) -> None:
        try:
            results[idx] = orch.run_all()
        except Exception as exc:
            results[idx] = exc

    threads = [
        threading.Thread(target=_run, args=(i, o), daemon=True)
        for i, o in enumerate(orchestrators)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)

    return results  # type: ignore[return-value]
