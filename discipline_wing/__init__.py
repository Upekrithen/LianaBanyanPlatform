"""
discipline_wing — Bishop Discipline Wing (K514 / A&A #2295 Tier 3)

Five Augurs, one Squadron, one Wing, one Consensus Layer.
"""

from discipline_wing.engine import evaluate, EvaluationResult, ToolCall
from discipline_wing.consensus import AugurResult, ConsensusDecision, ConsensusLayer

__all__ = [
    "evaluate",
    "EvaluationResult",
    "ToolCall",
    "AugurResult",
    "ConsensusDecision",
    "ConsensusLayer",
]
