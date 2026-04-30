"""
cephas_presubmission_distribution_bridge.py — KN020/BP002

Connects KN006 Cephas Pre-Submission Voting + Rewards (#2288) to channel selection.
Member votes inform which distribution channels each Pre-Submission goes to.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

from distribution_channel_registry import (
    ChannelSpec,
    ChannelTier,
    list_channels,
)


class PreSubmissionStatus(str, Enum):
    PENDING = "pending"
    VOTING = "voting"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISTRIBUTED = "distributed"


@dataclass
class PreSubmission:
    submission_id: str
    title: str
    body_excerpt: str
    status: PreSubmissionStatus = PreSubmissionStatus.PENDING
    vote_tally: Dict[str, int] = field(default_factory=dict)
    # {"substack": 42, "reddit": 38, "discord": 21, "linkedin": 10, "youtube": 5}
    selected_channels: List[str] = field(default_factory=list)
    distribution_receipt: Optional[Dict[str, Any]] = None


def _invalid_status_error(submission: PreSubmission) -> Optional[str]:
    if submission.status not in (PreSubmissionStatus.APPROVED, PreSubmissionStatus.VOTING):
        return (
            f"Pre-Submission {submission.submission_id!r} status is "
            f"{submission.status!r} — only APPROVED or VOTING submissions may be distributed"
        )
    return None


def rank_channels_by_vote(submission: PreSubmission) -> List[str]:
    """Return channel names ordered by member vote tally (descending)."""
    if not submission.vote_tally:
        # No votes yet: default to tier ordering (top channels first)
        return [ch.name for ch in list_channels() if ch.tier == ChannelTier.TOP] + [
            ch.name for ch in list_channels() if ch.tier != ChannelTier.TOP
        ]
    return sorted(submission.vote_tally, key=lambda ch: submission.vote_tally[ch], reverse=True)


def select_channels(
    submission: PreSubmission,
    max_channels: int = 3,
) -> List[str]:
    """
    Select up to max_channels distribution targets for a Pre-Submission.
    Raises ValueError if submission status does not allow distribution.
    """
    err = _invalid_status_error(submission)
    if err:
        raise ValueError(err)

    ranked = rank_channels_by_vote(submission)
    return ranked[:max_channels]


def build_distribution_schedule(
    submission: PreSubmission,
    max_channels: int = 3,
) -> Dict[str, Any]:
    """
    Build a distribution schedule for Founder review.
    Returns a dict with selected channels, ranked order, and approval-pending status.
    """
    err = _invalid_status_error(submission)
    if err:
        raise ValueError(err)

    selected = select_channels(submission, max_channels)
    return {
        "submission_id": submission.submission_id,
        "title": submission.title,
        "status": submission.status,
        "vote_tally": submission.vote_tally,
        "selected_channels": selected,
        "approval_pending": True,
        "note": "PUBLICATION GATE HARD — Founder approval token required per channel before dispatch.",
    }
