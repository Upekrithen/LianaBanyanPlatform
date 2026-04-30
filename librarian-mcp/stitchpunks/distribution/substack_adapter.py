"""
substack_adapter.py — KN020/BP002

Stub adapter for Substack distribution. API placeholder awaiting Founder fire.
PUBLICATION GATE HARD: every publish call requires a valid approval token.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import datetime

from distribution_fire_control import FireControlGate, FireControlError


@dataclass
class SubstackPost:
    title: str
    body: str
    canonical_url: Optional[str] = None
    tags: Optional[list] = None
    audience: str = "everyone"  # substack audience arg


class SubstackAdapter:
    """
    Stub Substack adapter. publish() is gated by Founder approval token.
    Full activation requires:
      - SUBSTACK_PUBLICATION_ID env var
      - SUBSTACK_COOKIE / OAuth token (no public Substack API as of 2026)
    """

    CHANNEL = "substack"

    def __init__(self, publication_id: Optional[str] = None):
        self._publication_id = publication_id or "PLACEHOLDER_SUBSTACK_PUBLICATION_ID"
        self._gate = FireControlGate(channel=self.CHANNEL)

    def validate_post(self, post: SubstackPost) -> Dict[str, Any]:
        errors = []
        if not post.title or len(post.title) > 250:
            errors.append("title missing or too long (max 250 chars)")
        if not post.body or len(post.body) < 100:
            errors.append("body too short (min 100 chars)")
        if len(post.body) > 100_000:
            errors.append("body too long (max 100,000 chars)")
        return {"valid": not errors, "errors": errors}

    def publish(
        self,
        post: SubstackPost,
        approval_token: str,
        dry_run: bool = True,
    ) -> Dict[str, Any]:
        """
        Publish a post to Substack.
        dry_run=True (default) in stub mode — never fires real API without Founder override.
        """
        # FIRE CONTROL GATE
        self._gate.verify(approval_token)

        validation = self.validate_post(post)
        if not validation["valid"]:
            raise ValueError(f"Invalid post: {validation['errors']}")

        receipt = {
            "channel": self.CHANNEL,
            "status": "dry_run" if dry_run else "stub_no_api_key",
            "title": post.title,
            "published_at": datetime.datetime.utcnow().isoformat(),
            "publication_id": self._publication_id,
            "audience": post.audience,
            "approval_token_prefix": approval_token[:8],
        }

        if not dry_run:
            # Real publish: requires active SUBSTACK_COOKIE / OAuth
            receipt["status"] = "stub_no_api_key"
            receipt["note"] = (
                "Substack has no public API as of 2026. "
                "Founder must fire manually via Substack dashboard or unofficial client. "
                "Draft staged at BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Distribution/."
            )

        return receipt
