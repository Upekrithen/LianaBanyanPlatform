"""
reddit_adapter.py — KN020/BP002

Stub adapter for Reddit distribution. 8-subreddit seed per B133.
PUBLICATION GATE HARD: every publish call requires a valid approval token.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import datetime

from distribution_fire_control import FireControlGate, FireControlError

SEEDED_SUBREDDITS = [
    "r/programming",
    "r/LocalLLaMA",
    "r/MachineLearning",
    "r/cooperatives",
    "r/sustainability",
    "r/PlatformCooperativism",
    "r/SmallBusiness",
    "r/EconomicCollapse",
]


@dataclass
class RedditPost:
    subreddit: str
    title: str
    body: str
    flair: Optional[str] = None


class RedditAdapter:
    """
    Stub Reddit adapter. publish() is gated by Founder approval token.
    Full activation requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET env vars (PRAW/PMAW).
    """

    CHANNEL = "reddit"

    def __init__(self):
        self._gate = FireControlGate(channel=self.CHANNEL)

    def validate_post(self, post: RedditPost) -> Dict[str, Any]:
        errors = []
        if post.subreddit not in SEEDED_SUBREDDITS:
            errors.append(f"subreddit {post.subreddit!r} not in seeded list — Founder must ratify")
        if not post.title or len(post.title) > 300:
            errors.append("title missing or > 300 chars")
        if not post.body or len(post.body) < 50:
            errors.append("body too short (min 50 chars)")
        return {"valid": not errors, "errors": errors}

    def publish(
        self,
        post: RedditPost,
        approval_token: str,
        dry_run: bool = True,
    ) -> Dict[str, Any]:
        self._gate.verify(approval_token)

        validation = self.validate_post(post)
        if not validation["valid"]:
            raise ValueError(f"Invalid post: {validation['errors']}")

        return {
            "channel": self.CHANNEL,
            "subreddit": post.subreddit,
            "status": "dry_run" if dry_run else "stub_no_api_key",
            "title": post.title,
            "published_at": datetime.datetime.utcnow().isoformat(),
            "approval_token_prefix": approval_token[:8],
        }
