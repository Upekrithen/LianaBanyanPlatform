"""
cycle_phase_coordinator.py — 8-Cylinder Shadow Alternating Cycle Phase Coordinator
===================================================================================
(KN-G / BP016)

Coordinates 8 Shadow E-Giants alternating A↔B per cycle.

Staggered phasing ensures 4-in-A (build/compile) and 4-in-B (prep) at any moment:

  EVEN-group (alpha, gamma, epsilon, eta):
    cycle 0 → A (build), cycle 1 → B (prep), cycle 2 → A, ...

  ODD-group  (beta, delta, zeta, theta):
    cycle 0 → B (prep),  cycle 1 → A (build), cycle 2 → B, ...

This guarantees exactly 4-in-A and 4-in-B at any point in time (the "8-cylinder
shadow engine" in Aston Martin session-pistons terminology per B132 canon).

Cycle period: 45 minutes starter (Founder-ratified; configurable via CYCLE_PERIOD_MINUTES).

Observability: each Shadow's heartbeat is updated via the lifecycle.py heartbeat_loop
to include `cycle_phase` (A or B).  The `shadow_phase_query` MCP tool reads these
heartbeat eblets to report current phase across all 8 Shadows.

BRIDLE compliance:
  Rule 1: extend Shadow to alternating-cylinder-fire; nothing else
  Rule 3: no unasked scope
  Rule 4: surface to Founder if alternation proves less efficient than baseline
"""
from __future__ import annotations

import json
import sys
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

from .iron_tablet_attach import IronTabletAttach, WriteAuthority

# ─── Constants ────────────────────────────────────────────────────────────────

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
EBLET_BASE = Path.home() / ".claude" / "state" / "eblets"
FEDERATION_DIR = Path.home() / ".claude" / "state" / "federation"
PHASE_STATE_FILE = FEDERATION_DIR / "cylinder_phase_state.jsonl"

# Phase groups
EVEN_CYCLE_A_SHADOWS = frozenset({"alpha", "gamma", "epsilon", "eta"})
ODD_CYCLE_A_SHADOWS  = frozenset({"beta",  "delta",  "zeta",   "theta"})

ALL_SHADOWS = [
    "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
]

CyclePhase = Literal["A", "B"]


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class ShadowPhaseAssignment:
    shadow_id: str
    lighthouse_position: int  # 1-8
    cycle_number: int
    phase: CyclePhase
    phase_start_ts: str
    phase_end_ts: str = ""   # populated when cycle transitions


@dataclass
class CycleSnapshot:
    cycle_number: int
    ts: str
    assignments: list[ShadowPhaseAssignment]
    phase_a_count: int
    phase_b_count: int

    @property
    def balanced(self) -> bool:
        return self.phase_a_count == 4 and self.phase_b_count == 4

    def to_dict(self) -> dict:
        return {
            "cycle_number": self.cycle_number,
            "ts": self.ts,
            "balanced": self.balanced,
            "phase_a": [a.shadow_id for a in self.assignments if a.phase == "A"],
            "phase_b": [a.shadow_id for a in self.assignments if a.phase == "B"],
        }


# ─── Phase logic ──────────────────────────────────────────────────────────────

def get_phase_at_cycle(shadow_id: str, cycle_number: int) -> CyclePhase:
    """
    Deterministic phase assignment for a given shadow and cycle.

    EVEN group (alpha, gamma, epsilon, eta):
        even cycle → A (build), odd cycle → B (prep)
    ODD group (beta, delta, zeta, theta):
        even cycle → B (prep), odd cycle → A (build)

    This is the core invariant of the alternating-cylinder-fire architecture.
    """
    in_even_group = shadow_id in EVEN_CYCLE_A_SHADOWS
    if cycle_number % 2 == 0:
        return "A" if in_even_group else "B"
    else:
        return "B" if in_even_group else "A"


def get_current_cycle_snapshot(cycle_number: int) -> CycleSnapshot:
    """Return a full CycleSnapshot for the given cycle number."""
    ts = datetime.now(timezone.utc).isoformat()
    assignments = [
        ShadowPhaseAssignment(
            shadow_id=greek,
            lighthouse_position=i + 1,
            cycle_number=cycle_number,
            phase=get_phase_at_cycle(greek, cycle_number),
            phase_start_ts=ts,
        )
        for i, greek in enumerate(ALL_SHADOWS)
    ]
    phase_a_count = sum(1 for a in assignments if a.phase == "A")
    phase_b_count = sum(1 for a in assignments if a.phase == "B")
    return CycleSnapshot(
        cycle_number=cycle_number,
        ts=ts,
        assignments=assignments,
        phase_a_count=phase_a_count,
        phase_b_count=phase_b_count,
    )


# ─── Coordinator ──────────────────────────────────────────────────────────────

class CyclePhaseCoordinator:
    """
    Manages 8 Shadow E-Giants alternating A↔B per cycle.

    The coordinator does NOT directly run Shadows — it is an authority layer
    that publishes the current phase assignment so each Shadow's own lifecycle
    thread can query it.  This mirrors the existing lifecycle/heartbeat design
    (lightweight, no dependency on external scheduler).

    Usage (single coordinator per cohort):

        coordinator = CyclePhaseCoordinator(session_id="BP016")
        coordinator.start()          # background thread; increments cycle every 45 min
        phase = coordinator.query_phase("alpha")   # → "A" or "B"
        coordinator.stop()

    The current cycle number is written to FEDERATION_DIR/cylinder_phase_state.jsonl
    so all 8 Shadow daemon processes can read it without IPC.
    """

    CYCLE_PERIOD_MINUTES: int = 45   # Founder-ratified starter (BP016 spec §Design)

    def __init__(
        self,
        session_id: str = "BP016",
        cycle_period_minutes: int = CYCLE_PERIOD_MINUTES,
        iron_tablet: Optional[IronTabletAttach] = None,
        initial_cycle: int = 0,
    ):
        self.session_id = session_id
        self.cycle_period_minutes = cycle_period_minutes
        self.iron_tablet = iron_tablet  # optional; used for receipt writes
        self._cycle_number: int = initial_cycle
        self._cycle_lock = threading.Lock()
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._ts_cycle_start: str = datetime.now(timezone.utc).isoformat()

    # ── Phase query ────────────────────────────────────────────────────────────

    def query_phase(self, shadow_id: str) -> CyclePhase:
        """Return the current phase for a given shadow_id."""
        with self._cycle_lock:
            cycle = self._cycle_number
        return get_phase_at_cycle(shadow_id, cycle)

    def query_snapshot(self) -> CycleSnapshot:
        """Return the full CycleSnapshot for the current cycle."""
        with self._cycle_lock:
            cycle = self._cycle_number
        return get_current_cycle_snapshot(cycle)

    @property
    def current_cycle(self) -> int:
        with self._cycle_lock:
            return self._cycle_number

    # ── Cycle advancement ──────────────────────────────────────────────────────

    def advance_cycle(self) -> CycleSnapshot:
        """
        Advance to the next cycle and publish the new state.

        Called by the background scheduler thread; also callable manually for
        testing or emergency override.
        """
        with self._cycle_lock:
            self._cycle_number += 1
            cycle = self._cycle_number
        self._ts_cycle_start = datetime.now(timezone.utc).isoformat()

        snapshot = get_current_cycle_snapshot(cycle)
        self._publish_phase_state(snapshot)

        sys.stderr.write(
            f"[CyclePhaseCoordinator] Cycle {cycle}: "
            f"A={[a.shadow_id for a in snapshot.assignments if a.phase == 'A']} "
            f"B={[a.shadow_id for a in snapshot.assignments if a.phase == 'B']}\n"
        )
        return snapshot

    def _publish_phase_state(self, snapshot: CycleSnapshot) -> None:
        """Write the current cycle state to federation directory."""
        FEDERATION_DIR.mkdir(parents=True, exist_ok=True)
        entry = {
            "ts": snapshot.ts,
            "session": self.session_id,
            **snapshot.to_dict(),
        }
        try:
            with open(str(PHASE_STATE_FILE), "a", encoding="utf-8") as fh:
                fh.write(json.dumps(entry) + "\n")
        except OSError as exc:
            sys.stderr.write(
                f"[CyclePhaseCoordinator] phase-state write error: {exc}\n"
            )

        # Optionally write a summary eblet to Iron Tablet
        if self.iron_tablet is not None:
            try:
                eblet_dir = EBLET_BASE / self.session_id
                eblet_dir.mkdir(parents=True, exist_ok=True)
                eblet_path = eblet_dir / "cylinder_phase_state.eblet.md"
                content = _snapshot_to_markdown(snapshot, self.session_id)
                self.iron_tablet.write(
                    eblet_path,
                    content,
                    decision_id=f"cycle_phase_{snapshot.cycle_number}",
                    scope=WriteAuthority.CANONICAL_EBLET,
                )
            except Exception as exc:
                sys.stderr.write(
                    f"[CyclePhaseCoordinator] Iron Tablet phase write error: {exc}\n"
                )

    # ── Scheduler loop ─────────────────────────────────────────────────────────

    def _scheduler_loop(self) -> None:
        """Background thread: advance cycle every cycle_period_minutes."""
        period_s = self.cycle_period_minutes * 60
        while not self._stop_event.is_set():
            self._stop_event.wait(timeout=period_s)
            if not self._stop_event.is_set():
                self.advance_cycle()

    # ── Public lifecycle interface ─────────────────────────────────────────────

    def start(self) -> None:
        """Start the background cycle scheduler; publish initial state."""
        snapshot = get_current_cycle_snapshot(self._cycle_number)
        self._publish_phase_state(snapshot)

        self._thread = threading.Thread(
            target=self._scheduler_loop,
            name="shadow-cycle-coordinator",
            daemon=True,
        )
        self._thread.start()
        sys.stderr.write(
            f"[CyclePhaseCoordinator] started — "
            f"period={self.cycle_period_minutes}min "
            f"initial_cycle={self._cycle_number}\n"
        )

    def stop(self) -> None:
        """Signal the scheduler to stop."""
        self._stop_event.set()

    def wait_for_stop(self, timeout: float = 5.0) -> None:
        if self._thread is not None:
            self._thread.join(timeout=timeout)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _snapshot_to_markdown(snapshot: CycleSnapshot, session_id: str) -> str:
    phase_a = [a.shadow_id for a in snapshot.assignments if a.phase == "A"]
    phase_b = [a.shadow_id for a in snapshot.assignments if a.phase == "B"]
    a_str = ", ".join(f"`{s}`" for s in phase_a)
    b_str = ", ".join(f"`{s}`" for s in phase_b)
    balance = "✅ 4/4" if snapshot.balanced else f"⚠ {snapshot.phase_a_count}/{snapshot.phase_b_count}"
    return (
        f"# Cylinder Phase State — Cycle {snapshot.cycle_number}\n\n"
        f"- **Session**: `{session_id}`\n"
        f"- **Cycle**: {snapshot.cycle_number}\n"
        f"- **Timestamp**: `{snapshot.ts}`\n"
        f"- **Balance**: {balance}\n\n"
        f"## Phase A (build/compile)\n\n{a_str or '_none_'}\n\n"
        f"## Phase B (prep)\n\n{b_str or '_none_'}\n\n"
        f"_KN-G · BP016 · Pod-G alternating-cylinder-fire_\n"
    )


def read_phase_state_latest() -> Optional[dict]:
    """
    Read the most recent cycle state from the federation directory.

    Used by the `shadow_phase_query` MCP tool and observability scripts.
    """
    if not PHASE_STATE_FILE.exists():
        return None
    lines = [l.strip() for l in PHASE_STATE_FILE.read_text(encoding="utf-8").splitlines() if l.strip()]
    if not lines:
        return None
    try:
        return json.loads(lines[-1])
    except json.JSONDecodeError:
        return None


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="KN-G Cycle Phase Coordinator CLI"
    )
    sub = parser.add_subparsers(dest="cmd")

    q = sub.add_parser("query", help="Query current phase for one or all Shadows")
    q.add_argument("--shadow", default="", help="Shadow name (e.g. alpha); empty = all")
    q.add_argument("--cycle", type=int, default=-1, help="Cycle override (-1 = read from file)")

    _ = sub.add_parser("snapshot", help="Print current full snapshot")
    args = parser.parse_args()

    if args.cmd == "query":
        # Determine cycle
        if args.cycle >= 0:
            cycle = args.cycle
        else:
            state = read_phase_state_latest()
            cycle = state["cycle_number"] if state else 0

        if args.shadow:
            phase = get_phase_at_cycle(args.shadow, cycle)
            print(f"{args.shadow} @ cycle {cycle}: Phase {phase}")
        else:
            snapshot = get_current_cycle_snapshot(cycle)
            for a in snapshot.assignments:
                print(f"  {a.shadow_id:8s} (pos {a.lighthouse_position}): Phase {a.phase}")
            print(f"\nBalance: {'✅ 4/4' if snapshot.balanced else '⚠ unbalanced'}")

    elif args.cmd == "snapshot":
        state = read_phase_state_latest()
        if state:
            print(json.dumps(state, indent=2))
        else:
            print("No phase state found. Run coordinator first.")
    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
