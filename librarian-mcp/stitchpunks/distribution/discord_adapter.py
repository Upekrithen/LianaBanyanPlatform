"""
discord_adapter.py — KN020/BP002

Stub adapter for Discord distribution. 5-server-class seed per B133.
PUBLICATION GATE HARD: every publish call requires a valid approval token.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import datetime

from distribution_fire_control import FireControlGate

SEEDED_SERVER_CLASSES = [
    "ai_engineering_mcp_servers",
    "cursor_user_community",
    "cooperative_platform_research",
    "anthropic_claude_developer_discord",
    "oss_cooperative_tooling_discord",
]


@dataclass
class DiscordMessage:
    server_class: str
    content: str
    embed_title: Optional[str] = None
    embed_url: Optional[str] = None


class DiscordAdapter:
    """
    Stub Discord adapter. send() is gated by Founder approval token.
    Full activation requires DISCORD_BOT_TOKEN env var.
    """

    CHANNEL = "discord"

    def __init__(self):
        self._gate = FireControlGate(channel=self.CHANNEL)

    def validate_message(self, message: DiscordMessage) -> Dict[str, Any]:
        errors = []
        if message.server_class not in SEEDED_SERVER_CLASSES:
            errors.append(f"server_class {message.server_class!r} not in seeded list")
        if not message.content or len(message.content) > 2000:
            errors.append("content missing or > 2000 chars (Discord limit)")
        return {"valid": not errors, "errors": errors}

    def send(
        self,
        message: DiscordMessage,
        approval_token: str,
        dry_run: bool = True,
    ) -> Dict[str, Any]:
        self._gate.verify(approval_token)

        validation = self.validate_message(message)
        if not validation["valid"]:
            raise ValueError(f"Invalid message: {validation['errors']}")

        return {
            "channel": self.CHANNEL,
            "server_class": message.server_class,
            "status": "dry_run" if dry_run else "stub_no_bot_token",
            "published_at": datetime.datetime.utcnow().isoformat(),
            "approval_token_prefix": approval_token[:8],
        }
