"""
Session-Position Classifier — KN025/BP003

Maps (bean_ordinal_in_pod, cumulative_pp_at_start, pod_size) to a
session_position_class: one of {pod_first, pod_warm, pod_deep_warm, pod_late}.

Empirical motivation (PAPER 004 Part 2 / BP003):
  - KN019 (large, position 3 of 3 in pod H, composes_on_warm_infrastructure):
    measured ~15pp vs predicted 22-28pp → warm-engine compression ~50-60%
  - KN021 (medium, position 8 of 9 in 3-pod chain):
    measured ~8pp vs predicted 12-15pp → late-session amortization ~30-40%
  - Within Pod H+I: beans 1-3 climbed 13/20/15pp; beans 4-6 decreased 12/8/5pp

Position class definitions:
  pod_first:      bean ordinal 1 in its pod (fresh start within pod)
  pod_warm:       bean ordinal 2 in its pod (warm substrate, not peaked)
  pod_deep_warm:  bean ordinal 3+ in its pod (substrate fully loaded)
  pod_late:       cumulative pp > 60% of budget OR cross-pod position > 6

KN025 / Toolsmith: TS-HERDER-SESSION-POSITION-CLASS-ENHANCEMENT-KN025-BP003
"""

from __future__ import annotations

from typing import Literal

SessionPositionClass = Literal["pod_first", "pod_warm", "pod_deep_warm", "pod_late"]

_BUDGET_LATE_THRESHOLD = 60.0  # cumulative pp% above which we treat as pod_late
_CROSS_POD_LATE_ORDINAL = 7    # bean position in cross-pod sequence above which = pod_late


def classify_session_position(
    bean_ordinal_in_pod: int,
    cumulative_pp_at_start: float = 0.0,
    cross_pod_ordinal: int = 0,
    budget_pp: float = 100.0,
) -> SessionPositionClass:
    """
    Classify the session position of a bean being executed.

    Args:
        bean_ordinal_in_pod: 1-based position within current pod (1=first, 2=second, etc.)
        cumulative_pp_at_start: context% consumed before this bean starts
        cross_pod_ordinal: 1-based position in the full cross-pod sequence (0 if unknown)
        budget_pp: total budget in percentage points (default 100)

    Returns:
        SessionPositionClass
    """
    # Late override: cumulative consumption above threshold OR very deep cross-pod position
    if cumulative_pp_at_start >= _BUDGET_LATE_THRESHOLD:
        return "pod_late"
    if cross_pod_ordinal >= _CROSS_POD_LATE_ORDINAL:
        return "pod_late"

    # Standard pod-position classification
    if bean_ordinal_in_pod <= 1:
        return "pod_first"
    elif bean_ordinal_in_pod == 2:
        return "pod_warm"
    else:
        return "pod_deep_warm"


def position_cost_multiplier(position_class: SessionPositionClass) -> float:
    """
    Return the cost multiplier for a given position class.

    Based on Pod G+H+I empirical measurements:
      pod_first:     1.0 (baseline)
      pod_warm:      0.85 (warm substrate reduces cost ~15%)
      pod_deep_warm: 0.75 (infrastructure loaded, compose-on-warm effect)
      pod_late:      0.60 (late-session amortization ~30-40%)
    """
    return {
        "pod_first": 1.00,
        "pod_warm": 0.85,
        "pod_deep_warm": 0.75,
        "pod_late": 0.60,
    }[position_class]


def get_all_position_classes() -> list[SessionPositionClass]:
    """Return all valid session position classes."""
    return ["pod_first", "pod_warm", "pod_deep_warm", "pod_late"]
