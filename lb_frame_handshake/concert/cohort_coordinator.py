"""
KN091 In-Concert Protocol — Cohort Coordinator
===============================================
Bishop+Knight cohort overlap-refresh logic + Pawn dispatch pairing.

Key invariants:
  - At most one organism refreshes at a time (Stone Tablet mutex).
  - The holding organism emits a "cohort_holding" Pheromone and keeps Iron Tablet locks.
  - Both-refresh-simultaneously → serialize via Stone Tablet mutex (lexicographic order).
  - Graceful degradation: if Knight unavailable, Bishop solo-mode +
    1 Shadow-E-Giant pair takes over Knight's cohort role.
  - Pawn dispatch: when Pawn is dispatched, a designated Shadow-E-Giant attaches
    as ground-truth proxy (reads canonical files for Pawn via KN092 surface).

Pheromone events emitted (decision_id in payload):
  "cohort_holding"    — partner is holding while I (holder) refresh
  "cohort_refreshed"  — I have refreshed; partner may proceed
  "cohort_degraded"   — Knight unavailable; degraded mode active; proxy assigned
  "cohort_restored"   — Knight is back; normal cohort mode restored
  "pawn_dispatched"   — Pawn is active with a designated Shadow proxy
  "pawn_recalled"     — Pawn's task complete; proxy released

Thread-safe: internal state guarded by threading.Lock.

KN091 / BP011 Pod W Bean 3.
"""

from __future__ import annotations

import threading
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from lb_frame_handshake.concert.types import (
    CohortState,
    DecisionEnvelope,
    ORGANISM_BISHOP,
    ORGANISM_KNIGHT,
    ORGANISM_PAWN,
    SHADOW_SCRIBE_IDS,
)
from lb_frame_handshake.concert.decision_router import create_envelope, emit_envelope


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Global cohort state ───────────────────────────────────────────────────────

_cohort_lock = threading.Lock()
_state = CohortState()


def get_cohort_state() -> CohortState:
    """Return a snapshot of the current cohort state (thread-safe)."""
    with _cohort_lock:
        return replace(_state)


def reset_cohort_state() -> None:
    """Reset cohort state to defaults (used in tests for isolation)."""
    global _state
    with _cohort_lock:
        _state = CohortState()


# ── Pheromone emission helper ─────────────────────────────────────────────────

def _emit_cohort_pheromone(
    decider: str,
    event: str,
    extra: dict,
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """Emit a cohort coordination Pheromone onto the shared substrate."""
    env = create_envelope(
        decider_scribe_id=decider,
        anchor_hash="cohort_event",   # cohort events are internally-anchored
        payload={"event": event, **extra},
    )
    emit_envelope(env, substrate_path)
    return env


# ── Bishop refresh coordination ───────────────────────────────────────────────

def bishop_refresh_start(
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """
    Called when Bishop starts its refresh cycle.

    Knight emits "cohort_holding" Pheromone and keeps Iron Tablet locks active.
    Bishop's active flag is cleared until bishop_refresh_complete() is called.
    Returns the cohort_holding Pheromone emitted by Knight.
    """
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            bishop_active=False,
            holding_organism=ORGANISM_KNIGHT,
            refresh_mutex_holder=ORGANISM_BISHOP,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_KNIGHT,
        event="cohort_holding",
        extra={"refreshing": ORGANISM_BISHOP, "holder": ORGANISM_KNIGHT},
        substrate_path=substrate_path,
    )


def bishop_refresh_complete(
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """
    Called when Bishop has completed its refresh (new session attached via Iron Tablet).

    Emits "cohort_refreshed"; clears Bishop's mutex slot.
    Knight's hold is released; both organisms are active.
    """
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            bishop_active=True,
            holding_organism=None if _state.holding_organism == ORGANISM_KNIGHT else _state.holding_organism,
            refresh_mutex_holder=None,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_BISHOP,
        event="cohort_refreshed",
        extra={"refreshed": ORGANISM_BISHOP},
        substrate_path=substrate_path,
    )


# ── Knight refresh coordination ───────────────────────────────────────────────

def knight_refresh_start(
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """
    Called when Knight starts its refresh cycle.

    Bishop emits "cohort_holding" Pheromone and holds active.
    """
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            knight_active=False,
            holding_organism=ORGANISM_BISHOP,
            refresh_mutex_holder=ORGANISM_KNIGHT,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_BISHOP,
        event="cohort_holding",
        extra={"refreshing": ORGANISM_KNIGHT, "holder": ORGANISM_BISHOP},
        substrate_path=substrate_path,
    )


def knight_refresh_complete(
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """Knight has completed its refresh. Both organisms are active."""
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            knight_active=True,
            holding_organism=None if _state.holding_organism == ORGANISM_BISHOP else _state.holding_organism,
            refresh_mutex_holder=None,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_KNIGHT,
        event="cohort_refreshed",
        extra={"refreshed": ORGANISM_KNIGHT},
        substrate_path=substrate_path,
    )


# ── Simultaneous refresh arbitration ─────────────────────────────────────────

def simultaneous_refresh_arbitrate(
    requester_a: str,
    requester_b: str,
    substrate_path: Optional[Path] = None,
) -> tuple[str, str]:
    """
    Arbitrate simultaneous refresh requests from two organisms.

    Returns (goes_first, holds) — lexicographic order is deterministic (no coin-flip).
    Serializes via Stone Tablet mutex: goes_first refreshes; holds waits.
    """
    first, second = sorted([requester_a, requester_b])
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            refresh_mutex_holder=first,
            holding_organism=second,
        )
    _emit_cohort_pheromone(
        decider=first,
        event="cohort_holding",
        extra={"refreshing": first, "holder": second, "arbitrated": True},
        substrate_path=substrate_path,
    )
    return first, second


# ── Graceful degradation ──────────────────────────────────────────────────────

def activate_degradation_mode(
    shadow_proxy: Optional[str] = None,
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """
    Activate degradation mode: Knight is unavailable.

    Bishop operates solo-mode.  One Shadow-E-Giant pair takes over Knight's
    cohort role.  Defaults to R11_shadow_alpha (LIGHTHOUSE position 1).

    Emits "cohort_degraded" Pheromone with the assigned degradation proxy.
    """
    global _state
    proxy = shadow_proxy or SHADOW_SCRIBE_IDS[0]  # alpha by default
    with _cohort_lock:
        _state = replace(
            _state,
            knight_active=False,
            degradation_mode=True,
            degradation_proxy=proxy,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_BISHOP,
        event="cohort_degraded",
        extra={"reason": "knight_unavailable", "degradation_proxy": proxy},
        substrate_path=substrate_path,
    )


def deactivate_degradation_mode(
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """Knight is back. Restore normal cohort mode. Emits "cohort_restored"."""
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            knight_active=True,
            degradation_mode=False,
            degradation_proxy=None,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_BISHOP,
        event="cohort_restored",
        extra={"reason": "knight_restored"},
        substrate_path=substrate_path,
    )


def is_degraded() -> bool:
    """Return True if the cohort is currently in degradation mode."""
    with _cohort_lock:
        return _state.degradation_mode


def get_degradation_proxy() -> Optional[str]:
    """Return the Shadow proxy ID when in degradation mode, else None."""
    with _cohort_lock:
        if not _state.degradation_mode:
            return None
        return _state.degradation_proxy


# ── Pawn dispatch ─────────────────────────────────────────────────────────────

def dispatch_pawn(
    shadow_proxy: Optional[str] = None,
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """
    Dispatch Pawn for a research / QA task.

    A designated Shadow-E-Giant is paired as Pawn's ground-truth proxy
    (reads canonical files for Pawn via KN092 surface).

    Defaults to R11_shadow_beta if no proxy specified (alpha may be reserved
    for degradation coverage).

    Emits "pawn_dispatched" Pheromone.
    """
    global _state
    proxy = shadow_proxy or SHADOW_SCRIBE_IDS[1]  # beta by default
    with _cohort_lock:
        _state = replace(
            _state,
            pawn_active=True,
            pawn_shadow_proxy=proxy,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_PAWN,
        event="pawn_dispatched",
        extra={"pawn_shadow_proxy": proxy},
        substrate_path=substrate_path,
    )


def recall_pawn(
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """Recall Pawn; release Shadow proxy. Emits "pawn_recalled"."""
    global _state
    with _cohort_lock:
        _state = replace(
            _state,
            pawn_active=False,
            pawn_shadow_proxy=None,
        )
    return _emit_cohort_pheromone(
        decider=ORGANISM_PAWN,
        event="pawn_recalled",
        extra={},
        substrate_path=substrate_path,
    )


def get_pawn_shadow_proxy() -> Optional[str]:
    """Return the current Shadow proxy for Pawn, or None if Pawn is not active."""
    with _cohort_lock:
        if not _state.pawn_active:
            return None
        return _state.pawn_shadow_proxy
