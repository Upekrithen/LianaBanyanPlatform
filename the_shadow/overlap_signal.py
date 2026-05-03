"""
NearCompletionSignal Dataclass — KN-R1 / BP018
===============================================
Carries the detection event from NearCompletionWatcher to PreStagingWorkflow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class NearCompletionSignal:
    """Emitted by NearCompletionWatcher when Knight session nears completion."""

    knight_session_id: str
    shadow_id: str                       # Which Phase-B Shadow emitted this
    detected_at: str                     # ISO-8601
    detection_method: str                # "context_pct" | "phase_e_commit" | "test_pass" | "git_commit"

    context_pct: Optional[float] = None  # If triggered by context threshold
    phase_detected: Optional[str] = None # If triggered by Phase-E detection
    commit_hash: Optional[str] = None    # If triggered by git commit

    knight_session_index: int = 1
    knight_session_total: int = 1

    @classmethod
    def from_context_pct(
        cls,
        knight_session_id: str,
        shadow_id: str,
        context_pct: float,
        knight_session_index: int = 1,
        knight_session_total: int = 1,
    ) -> "NearCompletionSignal":
        return cls(
            knight_session_id=knight_session_id,
            shadow_id=shadow_id,
            detected_at=datetime.now(timezone.utc).isoformat(),
            detection_method="context_pct",
            context_pct=context_pct,
            knight_session_index=knight_session_index,
            knight_session_total=knight_session_total,
        )

    @classmethod
    def from_phase_e(
        cls,
        knight_session_id: str,
        shadow_id: str,
        commit_hash: Optional[str] = None,
        knight_session_index: int = 1,
        knight_session_total: int = 1,
    ) -> "NearCompletionSignal":
        return cls(
            knight_session_id=knight_session_id,
            shadow_id=shadow_id,
            detected_at=datetime.now(timezone.utc).isoformat(),
            detection_method="phase_e_commit",
            phase_detected="E",
            commit_hash=commit_hash,
            knight_session_index=knight_session_index,
            knight_session_total=knight_session_total,
        )

    @classmethod
    def from_git_commit(
        cls,
        knight_session_id: str,
        shadow_id: str,
        commit_hash: str,
        knight_session_index: int = 1,
        knight_session_total: int = 1,
    ) -> "NearCompletionSignal":
        return cls(
            knight_session_id=knight_session_id,
            shadow_id=shadow_id,
            detected_at=datetime.now(timezone.utc).isoformat(),
            detection_method="git_commit",
            commit_hash=commit_hash,
            knight_session_index=knight_session_index,
            knight_session_total=knight_session_total,
        )

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items() if v is not None}
