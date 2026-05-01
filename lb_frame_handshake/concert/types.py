"""
KN091 In-Concert Protocol — Shared Types
=========================================
DecisionEnvelope  — wraps a KN050 Pheromone decision for cross-org routing
FurnaceReceipt    — result of cross-org Furnace gear-tooth-fit verification
ConflictReport    — surfaced when content-hash divergence is detected
CohortState       — live state of the Bishop+Knight cohort

Federation members (11 organisms):
  bishop_prime, knight_prime, pawn_prime
  R11_shadow_alpha … R11_shadow_theta (8 LIGHTHOUSE positions, Greek-letter convention)

KN091 / BP011 Pod W Bean 3 — Founder-ratified.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Optional


# ── Organism ID constants ─────────────────────────────────────────────────────

ORGANISM_BISHOP = "bishop_prime"
ORGANISM_KNIGHT = "knight_prime"
ORGANISM_PAWN = "pawn_prime"

SHADOW_SCRIBE_IDS: list[str] = [
    "R11_shadow_alpha",    # LIGHTHOUSE position 1
    "R11_shadow_beta",     # LIGHTHOUSE position 2
    "R11_shadow_gamma",    # LIGHTHOUSE position 3
    "R11_shadow_delta",    # LIGHTHOUSE position 4
    "R11_shadow_epsilon",  # LIGHTHOUSE position 5
    "R11_shadow_zeta",     # LIGHTHOUSE position 6
    "R11_shadow_eta",      # LIGHTHOUSE position 7
    "R11_shadow_theta",    # LIGHTHOUSE position 8
]

ALL_ORGANISM_IDS: list[str] = (
    [ORGANISM_BISHOP, ORGANISM_KNIGHT, ORGANISM_PAWN] + SHADOW_SCRIBE_IDS
)

FEDERATION_SIZE: int = len(ALL_ORGANISM_IDS)  # 11


# ── DecisionEnvelope ──────────────────────────────────────────────────────────

@dataclass
class DecisionEnvelope:
    """
    Cross-org wrapper for a KN050 Pheromone-Anchored Decision.

    Carries anchor_hash for Iron Tablet verification before consumption.
    Before acting on a cross-org decision, consuming organisms must validate
    anchor_hash against the canonical Iron Tablet (KN089).  Divergence → Furnace.

    meta_decision=True marks higher-order cross-org consensus records with full
    dependency chain.
    """
    decision_id: str
    decider_scribe_id: str
    anchor_hash: str                       # SHA-256 of Iron Tablet content this decision anchors to
    dependencies: list[str] = field(default_factory=list)   # prior decision_ids depended on
    payload: dict[str, Any] = field(default_factory=dict)   # free-form decision payload
    emitted_at: str = ""
    meta_decision: bool = False            # True → cross-org consensus meta-decision

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# ── FurnaceReceipt ────────────────────────────────────────────────────────────

@dataclass
class FurnaceReceipt:
    """
    Result of cross-org Furnace gear-tooth-fit verification.

    Rubric: does the proposing organism's Eblet engage with the consuming
    organism's substrate correctly?  Scored 0.0–1.0.

    Pass threshold: 0.65 (mid-tier per KN088 Bounty Furnace pattern).
    On fail: do NOT consume; emit ConflictReport; fall back to Stone Tablet ledger.
    """
    decision_id: str
    proposing_organism: str
    consuming_organism: str
    score: float                           # 0.0–1.0; >= 0.65 = PASS
    passed: bool
    rejection_reason: str = ""
    verified_at: str = ""
    fallback_to_stone: bool = False        # True if Furnace failed → Stone Tablet fallback active


# ── ConflictReport ────────────────────────────────────────────────────────────

@dataclass
class ConflictReport:
    """
    Surfaced when content-hash divergence is detected between an organism's
    local Eblet view and the canonical Iron Tablet.

    Resolution: Stone Tablet ledger is always authoritative (Stone Tablet Imperative).
    Reports are flagged surface_at_session_open=True so the next session sees them.
    """
    audit_id: str
    scribe_id: str
    eblet_path: str
    local_hash: str               # hash from organism's local / cached view
    canonical_hash: str           # hash from canonical Iron Tablet
    stone_sequence: int           # canonical Stone Tablet sequence number (authoritative)
    resolution: str = "stone_canonical"
    detected_at: str = ""
    surface_at_session_open: bool = True


# ── CohortState ───────────────────────────────────────────────────────────────

@dataclass
class CohortState:
    """
    Live state of the Bishop+Knight cohort for overlap-refresh coordination.

    Invariants:
      - At most one organism refreshes at a time (Stone Tablet mutex).
      - The other organism holds (emits "cohort_holding" Pheromone; keeps Iron Tablet locks).
      - Both-refresh-simultaneously → serialize; lexicographically earlier goes first.
      - degradation_mode=True when Knight is unavailable:
          Bishop solo-mode + 1 Shadow-E-Giant pair takes over Knight's cohort role.
      - pawn_active=True when Pawn has been dispatched:
          pawn_shadow_proxy is the designated Shadow-E-Giant ground-truth proxy.
    """
    bishop_active: bool = True
    knight_active: bool = True
    holding_organism: Optional[str] = None       # who is "holding" while partner refreshes
    refresh_mutex_holder: Optional[str] = None   # who holds mutex during simultaneous refresh
    pawn_active: bool = False
    pawn_shadow_proxy: Optional[str] = None      # Shadow acting as Pawn's ground-truth proxy
    degradation_mode: bool = False               # True when Knight unavailable
    degradation_proxy: Optional[str] = None      # Shadow acting as Knight's cohort role
