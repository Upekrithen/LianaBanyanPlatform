"""
Consensus Layer — Bishop Discipline Wing (K514 / A&A #2295 Tier 3)

Arbitrates per-action when multiple Augurs signal.

Voting rules (configurable via bishop_wing_augurs.json):
  - CRITICAL class Augurs: any single signal BLOCKS (critical-override)
  - ADVISORY class Augurs: any signal WARNS (majority or any, configurable)
  - No Augur signals: ALLOW

Design principle: Augur authors retain authority over their own rules.
Wing composes without modifying individual Augur logic.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class AugurResult:
    """Result from a single Augur evaluation."""
    augur_id: str
    augur_name: str
    augur_class: str          # "critical" | "advisory"
    triggered: bool           # True if this Augur's trigger matched
    signal: Optional[str]     # "block" | "warn" | "enrich" | None
    reason: str               # human-readable explanation
    failure_action: str       # the Augur's configured failure_action
    elapsed_ms: int = 0


@dataclass
class ConsensusDecision:
    """Final arbitrated decision from the Consensus Layer."""
    decision: str             # "block" | "warn" | "enrich" | "allow"
    message: str              # primary message (from blocking/warning Augur)
    triggered_augurs: List[str] = field(default_factory=list)
    all_results: List[AugurResult] = field(default_factory=list)
    consensus_reason: str = ""


class ConsensusLayer:
    """
    Arbitrates multiple Augur signals into a single Wing decision.

    Rules (per A&A #2295 Tier 3):
      1. Critical-class Augur fires → BLOCK regardless of advisory signals.
      2. Advisory-class Augur fires → WARN (configurable: any or majority).
      3. No Augur fires → ALLOW.

    Priority hierarchy: block > warn > enrich > allow
    """

    PRIORITY = {"block": 4, "warn": 3, "enrich": 2, "allow": 1}

    def __init__(self, consensus_rules: dict):
        self.rules = consensus_rules

    def arbitrate(self, results: List[AugurResult]) -> ConsensusDecision:
        """Given a list of Augur results, return the consensus decision."""
        triggered = [r for r in results if r.triggered]

        if not triggered:
            return ConsensusDecision(
                decision="allow",
                message="",
                triggered_augurs=[],
                all_results=results,
                consensus_reason="No Augur signaled.",
            )

        critical_signals = [r for r in triggered if r.augur_class == "critical"]
        advisory_signals = [r for r in triggered if r.augur_class == "advisory"]

        # Critical-override: any critical signal blocks regardless of advisory
        if critical_signals:
            # Pick highest-priority critical signal (should all be block, but respect config)
            lead = max(critical_signals, key=lambda r: self.PRIORITY.get(r.failure_action, 0))
            all_triggered = [r.augur_id for r in triggered]
            extra = ""
            if len(critical_signals) > 1:
                others = [r.augur_name for r in critical_signals if r.augur_id != lead.augur_id]
                extra = f"\n[Also triggered: {', '.join(others)}]"
            if advisory_signals:
                adv_names = [r.augur_name for r in advisory_signals]
                extra += f"\n[Advisory also flagged: {', '.join(adv_names)}]"
            return ConsensusDecision(
                decision=lead.failure_action,
                message=lead.reason + extra,
                triggered_augurs=all_triggered,
                all_results=results,
                consensus_reason=f"Critical-override: {lead.augur_id} dominates.",
            )

        # Advisory-only path
        if advisory_signals:
            # Configurable: "any" advisory fires → warn; "majority" requires > 50%
            advisory_strategy = self.rules.get("advisory_any_action", "warn")
            lead = max(advisory_signals, key=lambda r: self.PRIORITY.get(r.failure_action, 0))
            all_triggered = [r.augur_id for r in triggered]
            extra = ""
            if len(advisory_signals) > 1:
                others = [r.augur_name for r in advisory_signals if r.augur_id != lead.augur_id]
                extra = f"\n[Also flagged: {', '.join(others)}]"
            return ConsensusDecision(
                decision=advisory_strategy,
                message=lead.reason + extra,
                triggered_augurs=all_triggered,
                all_results=results,
                consensus_reason=f"Advisory signal from: {', '.join(r.augur_id for r in advisory_signals)}.",
            )

        # Fallback (should not reach here given triggered check above)
        return ConsensusDecision(
            decision="allow",
            message="",
            triggered_augurs=[],
            all_results=results,
            consensus_reason="Fallback allow (no actionable signals).",
        )
