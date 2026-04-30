"""
Component 3 — Graceful Degradation Policy Engine
KN026 / #2299 / BP003

Watches live context % vs Herder predictions at each bean-boundary.
Per D.2: surfaces defer-vs-continue decision to operator when threshold is approached.
Does NOT auto-defer — operator decision required (mandatory pause-and-confirm).

Policy:
  if current_context_pct + predicted_next_pp + SAFETY_MARGIN > 90.0:
      → SURFACE operator decision (defer vs push-through)
  if current_context_pct >= 90.0:
      → HARD STOP — context budget exhausted

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional

_DEFAULT_SAFETY_MARGIN = 5.0   # pp buffer added to predicted cost when checking headroom
_HARD_STOP_THRESHOLD = 90.0    # context% at or above which hard-stop fires
_SOFT_WARN_THRESHOLD = 90.0    # effective threshold (current + predicted + margin > this)


class DegradationDecision(Enum):
    CONTINUE = "continue"
    SURFACE_OPERATOR = "surface_operator"
    HARD_STOP = "hard_stop"


@dataclass(frozen=True)
class PolicyResult:
    decision: DegradationDecision
    current_context_pct: float
    predicted_next_pp: float
    projected_after_pp: float
    safety_margin: float
    message: str
    operator_prompt: Optional[str] = None


def check_bean_boundary(
    current_context_pct: float,
    predicted_next_pp: float,
    bean_id: str = "",
    pod_id: str = "",
    safety_margin: float = _DEFAULT_SAFETY_MARGIN,
    hard_stop_threshold: float = _HARD_STOP_THRESHOLD,
) -> PolicyResult:
    """
    Evaluate degradation policy at a bean-boundary.

    Args:
        current_context_pct: live context % BEFORE the next bean starts.
        predicted_next_pp: Herder's predicted cost for the next bean (pp).
        bean_id: identifier of the next bean (for surfaced message).
        pod_id: identifier of the current pod.
        safety_margin: additional pp buffer beyond prediction (default 5pp).
        hard_stop_threshold: context% at which hard-stop fires (default 90%).

    Returns:
        PolicyResult with decision + operator-facing message.
    """
    projected = current_context_pct + predicted_next_pp + safety_margin
    bean_label = bean_id or "next bean"
    pod_label = f" (pod {pod_id})" if pod_id else ""

    # Hard stop — context already exhausted
    if current_context_pct >= hard_stop_threshold:
        return PolicyResult(
            decision=DegradationDecision.HARD_STOP,
            current_context_pct=current_context_pct,
            predicted_next_pp=predicted_next_pp,
            projected_after_pp=projected,
            safety_margin=safety_margin,
            message=(
                f"HARD STOP{pod_label}: context at {current_context_pct:.1f}% >= "
                f"{hard_stop_threshold:.0f}% ceiling. Cannot start {bean_label}."
            ),
        )

    # Soft warn — projected would exceed threshold
    if projected > hard_stop_threshold:
        return PolicyResult(
            decision=DegradationDecision.SURFACE_OPERATOR,
            current_context_pct=current_context_pct,
            predicted_next_pp=predicted_next_pp,
            projected_after_pp=projected,
            safety_margin=safety_margin,
            message=(
                f"[DEGRADATION-POLICY] Approaching budget ceiling{pod_label}. "
                f"Current: {current_context_pct:.1f}% | "
                f"Predicted next ({bean_label}): +{predicted_next_pp:.1f}pp | "
                f"Safety margin: +{safety_margin:.1f}pp | "
                f"Projected: {projected:.1f}% vs ceiling {hard_stop_threshold:.0f}%."
            ),
            operator_prompt=(
                f"OPERATOR DECISION REQUIRED: "
                f"Starting '{bean_label}' may push context past {hard_stop_threshold:.0f}%. "
                f"(Projected: {projected:.1f}%). "
                f"Options: [D]efer bean to next session | [P]ush through | [R]eevaluate"
            ),
        )

    # Safe to continue
    headroom = hard_stop_threshold - projected
    return PolicyResult(
        decision=DegradationDecision.CONTINUE,
        current_context_pct=current_context_pct,
        predicted_next_pp=predicted_next_pp,
        projected_after_pp=projected,
        safety_margin=safety_margin,
        message=(
            f"CONTINUE{pod_label}: headroom {headroom:.1f}pp after {bean_label}. "
            f"(Current {current_context_pct:.1f}% + "
            f"predicted {predicted_next_pp:.1f}pp + "
            f"margin {safety_margin:.1f}pp = {projected:.1f}% vs {hard_stop_threshold:.0f}% ceiling)"
        ),
    )


def assert_operator_decided(decision: str, bean_id: str = "") -> None:
    """
    Assert that operator has explicitly chosen DEFER or PUSH-THROUGH
    when SURFACE_OPERATOR was returned.

    decision must be one of: 'defer', 'push_through'.
    Raises ValueError if neither.
    """
    normalized = decision.strip().lower().replace("-", "_")
    if normalized not in ("defer", "push_through"):
        raise ValueError(
            f"[#2298/D.2] Invalid operator decision '{decision}' for bean '{bean_id}'. "
            f"Must be 'defer' or 'push_through'."
        )
