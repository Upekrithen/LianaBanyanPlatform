"""
the_shadow — Iron E-Giant + Alternating Cylinder Fire Package
=============================================================
(KN090/BP011 watcher-class, extended by KN-G/BP016 to build/compile-class)

8 Shadows in the LIGHTHOUSE, each with a Greek-letter scribe-id
(R11_shadow_alpha through R11_shadow_theta).

KN090 / BP011 entry points:
    iron_egiant_promotion  — run at spawn; drives full promotion ceremony
    handshake_invoker      — wraps LB Frame Handshake 5-phase ritual
    iron_tablet_attach     — Python-native Iron Tablet protocol (KN089 compatible)
    lifecycle              — continuous-organism heartbeat + Bishop-refresh re-attach

KN-G / BP016 entry points (alternating-cylinder-fire extension):
    build_compile          — Phase A: build/compile capability
    prep_phase             — Phase B: prep capability
    cycle_phase_coordinator — 8-cylinder alternation scheduler + phase query
    empirical_comparison   — Founder hypothesis empirical test harness

Each Shadow follows the continuous-organism lifecycle (KN090) and now also
alternates A↔B phase per cycle (KN-G): 4 Shadows in build/compile, 4 in prep,
continuously. Cycle period: 45 minutes (Founder-ratified).

Crown-Jewel-class velocity-amplification primitive per BP016 Founder direct.
Non-weaponization semantics (BP011): cooperative pledge.
"""

from .iron_egiant_promotion import promote, LIGHTHOUSE_POSITIONS, SCRIBE_IDS
from .handshake_invoker import run_full_handshake, HandshakeReceipt
from .iron_tablet_attach import IronTabletAttach
from .lifecycle import ShadowLifecycle

# KN-G alternating-cylinder-fire extension
from .build_compile import BuildCompilePhase, BuildResult, KPromptContext
from .prep_phase import PrepPhase, PrepResult, PrepContext
from .cycle_phase_coordinator import (
    CyclePhaseCoordinator,
    get_phase_at_cycle,
    get_current_cycle_snapshot,
    read_phase_state_latest,
    ALL_SHADOWS,
)
from .empirical_comparison import (
    AlternationVsSpecializationHarness,
    EmpiricalReceipt,
    ComparisonReport,
)

__all__ = [
    # KN090 / BP011
    "promote",
    "LIGHTHOUSE_POSITIONS",
    "SCRIBE_IDS",
    "run_full_handshake",
    "HandshakeReceipt",
    "IronTabletAttach",
    "ShadowLifecycle",
    # KN-G / BP016
    "BuildCompilePhase",
    "BuildResult",
    "KPromptContext",
    "PrepPhase",
    "PrepResult",
    "PrepContext",
    "CyclePhaseCoordinator",
    "get_phase_at_cycle",
    "get_current_cycle_snapshot",
    "read_phase_state_latest",
    "ALL_SHADOWS",
    "AlternationVsSpecializationHarness",
    "EmpiricalReceipt",
    "ComparisonReport",
]
