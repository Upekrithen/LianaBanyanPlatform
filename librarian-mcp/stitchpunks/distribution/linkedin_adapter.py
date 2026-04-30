"""
linkedin_adapter.py — KN020/BP002

Stub adapter for LinkedIn distribution (mid-tier per B133).
Founder personal account (not brand). 400-800 word posts.
PUBLICATION GATE HARD: every publish call requires a valid approval token.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import datetime

from distribution_fire_control import FireControlGate

AUDIENCE_CLASSES = [
    "veteran_network",
    "cooperative_platform_researchers",
    "ai_mlops_practitioners",
    "tech_journalists",
    "wyoming_startup_ecosystem",
]


@dataclass
class LinkedInPost:
    content: str
    audience_class: str
    visibility: str = "PUBLIC"  # LinkedIn share visibility
    article_url: Optional[str] = None


class LinkedInAdapter:
    """
    Stub LinkedIn adapter. publish() is gated by Founder approval token.
    Full activation requires LinkedIn Marketing Solutions OAuth or personal access token.
    Founder personal account — not a brand page.
    """

    CHANNEL = "linkedin"

    def __init__(self):
        self._gate = FireControlGate(channel=self.CHANNEL)

    def validate_post(self, post: LinkedInPost) -> Dict[str, Any]:
        errors = []
        if not post.content or len(post.content) < 100:
            errors.append("content too short (min 100 chars)")
        if len(post.content) > 3000:
            errors.append("content > 3000 chars (LinkedIn limit)")
        if post.audience_class not in AUDIENCE_CLASSES:
            errors.append(f"audience_class {post.audience_class!r} not in seeded list")
        if post.visibility not in ("PUBLIC", "CONNECTIONS"):
            errors.append("visibility must be PUBLIC or CONNECTIONS")
        return {"valid": not errors, "errors": errors}

    def publish(
        self,
        post: LinkedInPost,
        approval_token: str,
        dry_run: bool = True,
    ) -> Dict[str, Any]:
        self._gate.verify(approval_token)

        validation = self.validate_post(post)
        if not validation["valid"]:
            raise ValueError(f"Invalid post: {validation['errors']}")

        return {
            "channel": self.CHANNEL,
            "audience_class": post.audience_class,
            "visibility": post.visibility,
            "status": "dry_run" if dry_run else "stub_no_oauth",
            "published_at": datetime.datetime.utcnow().isoformat(),
            "approval_token_prefix": approval_token[:8],
            "note": "Founder personal account — requires LinkedIn personal OAuth token.",
        }
