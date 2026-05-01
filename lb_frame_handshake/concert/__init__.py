"""
lb_frame_handshake.concert — KN091 In-Concert Coordination Protocol
====================================================================
Multi-organism in-concert coordination for the 11+ organism BP011 federation.

Composes:
  - BP005 KN050 Pheromone-Anchored Decisions
  - BP005 KN044/KN046 Furnace verification
  - BP011 KN089 Iron Tablets (fused Stone+Eblet)
  - BP011 KN090 Shadow-E-Giants (8 LIGHTHOUSE Shadows, Greek-letter scribe-ids)

Organisms in the federation:
  bishop_prime, knight_prime, pawn_prime
  R11_shadow_alpha … R11_shadow_theta (8 LIGHTHOUSE positions)

Public surface:
  types             — DecisionEnvelope, FurnaceReceipt, ConflictReport, CohortState
  decision_router   — emit, route, and meta-decide across the organism substrate
  furnace_cross_org — cross-org Furnace gear-tooth-fit verification (threshold 0.65)
  conflict_audit    — content-hash divergence detection + Stone-trump reconciliation
  cohort_coordinator— Bishop+Knight overlap-refresh; graceful degradation; Pawn dispatch
"""

from .types import (
    DecisionEnvelope,
    FurnaceReceipt,
    ConflictReport,
    CohortState,
    ORGANISM_BISHOP,
    ORGANISM_KNIGHT,
    ORGANISM_PAWN,
    SHADOW_SCRIBE_IDS,
    ALL_ORGANISM_IDS,
    FEDERATION_SIZE,
)

__all__ = [
    "DecisionEnvelope",
    "FurnaceReceipt",
    "ConflictReport",
    "CohortState",
    "ORGANISM_BISHOP",
    "ORGANISM_KNIGHT",
    "ORGANISM_PAWN",
    "SHADOW_SCRIBE_IDS",
    "ALL_ORGANISM_IDS",
    "FEDERATION_SIZE",
]
