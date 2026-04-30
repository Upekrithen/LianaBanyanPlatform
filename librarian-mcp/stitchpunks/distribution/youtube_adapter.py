"""
youtube_adapter.py — KN020/BP002

Stub adapter for YouTube distribution (mid-tier per B133).
6-Months-Jarvis documentary teaser is the primary candidate.
PUBLICATION GATE HARD: every publish call requires a valid approval token.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import datetime

from distribution_fire_control import FireControlGate


@dataclass
class YouTubeContent:
    title: str
    description: str
    video_file_path: Optional[str] = None  # path to video asset when available
    tags: Optional[list] = None
    category_id: str = "28"  # Science & Technology


class YouTubeAdapter:
    """
    Stub YouTube adapter. publish() is gated by Founder approval token.
    Full activation requires YouTube Data API v3 OAuth credentials.
    """

    CHANNEL = "youtube"

    def __init__(self):
        self._gate = FireControlGate(channel=self.CHANNEL)

    def validate_content(self, content: YouTubeContent) -> Dict[str, Any]:
        errors = []
        if not content.title or len(content.title) > 100:
            errors.append("title missing or > 100 chars")
        if not content.description:
            errors.append("description required")
        return {"valid": not errors, "errors": errors}

    def publish(
        self,
        content: YouTubeContent,
        approval_token: str,
        dry_run: bool = True,
    ) -> Dict[str, Any]:
        self._gate.verify(approval_token)

        validation = self.validate_content(content)
        if not validation["valid"]:
            raise ValueError(f"Invalid content: {validation['errors']}")

        return {
            "channel": self.CHANNEL,
            "status": "dry_run" if dry_run else "stub_no_oauth",
            "title": content.title,
            "published_at": datetime.datetime.utcnow().isoformat(),
            "approval_token_prefix": approval_token[:8],
            "note": "Requires YouTube Data API v3 OAuth + video file upload.",
        }
