"""
distribution_channel_registry.py — KN020/BP002

Registry of Wave 1 distribution channels and their adapter status.
PUBLICATION GATE HARD: Founder fire-control required on every publish action.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class ChannelStatus(str, Enum):
    STUB = "stub"           # Adapter built; API placeholder; awaits Founder fire
    ACTIVE = "active"       # Founder-fired; live publish enabled
    PAUSED = "paused"       # Temporarily suspended
    RATE_LIMITED = "rate_limited"  # Adapter hit rate cap; queued


class ChannelTier(str, Enum):
    TOP = "top"
    MID = "mid"


@dataclass
class ChannelSpec:
    name: str
    tier: ChannelTier
    status: ChannelStatus
    adapter_module: str
    post_format: str
    max_posts_per_day: int
    fire_control_required: bool = True
    notes: str = ""


# Wave 1 channel registry — per WAVE_1_DISPATCH_DISTRIBUTION_CHANNELS_B133.md
_CHANNELS: List[ChannelSpec] = [
    ChannelSpec(
        name="substack",
        tier=ChannelTier.TOP,
        status=ChannelStatus.STUB,
        adapter_module="substack_adapter",
        post_format="long_form_narrative",
        max_posts_per_day=3,
        notes="Target: Ruben Hassid + EmergingAI. Cathedral Effect framing. 2,000-3,000 words.",
    ),
    ChannelSpec(
        name="reddit",
        tier=ChannelTier.TOP,
        status=ChannelStatus.STUB,
        adapter_module="reddit_adapter",
        post_format="self_text",
        max_posts_per_day=8,
        notes="8 subreddits seeded. Tailored framing per community. 600-1,500 words.",
    ),
    ChannelSpec(
        name="discord",
        tier=ChannelTier.TOP,
        status=ChannelStatus.STUB,
        adapter_module="discord_adapter",
        post_format="server_intro_post",
        max_posts_per_day=5,
        notes="AI engineering / MCP servers / cooperative-platform research. 200-600 words.",
    ),
    ChannelSpec(
        name="youtube",
        tier=ChannelTier.MID,
        status=ChannelStatus.STUB,
        adapter_module="youtube_adapter",
        post_format="video_description_or_short",
        max_posts_per_day=2,
        notes="6-Months-Jarvis documentary teaser.",
    ),
    ChannelSpec(
        name="linkedin",
        tier=ChannelTier.MID,
        status=ChannelStatus.STUB,
        adapter_module="linkedin_adapter",
        post_format="founder_voice_professional",
        max_posts_per_day=2,
        notes="Founder personal account. 400-800 words. Career + cooperative-platform thesis.",
    ),
]

_REGISTRY: Dict[str, ChannelSpec] = {ch.name: ch for ch in _CHANNELS}


def get_channel(name: str) -> Optional[ChannelSpec]:
    return _REGISTRY.get(name)


def list_channels() -> List[ChannelSpec]:
    return list(_CHANNELS)


def list_by_tier(tier: ChannelTier) -> List[ChannelSpec]:
    return [ch for ch in _CHANNELS if ch.tier == tier]


def list_active() -> List[ChannelSpec]:
    return [ch for ch in _CHANNELS if ch.status == ChannelStatus.ACTIVE]


def channel_names() -> List[str]:
    return [ch.name for ch in _CHANNELS]


def set_channel_status(name: str, status: ChannelStatus) -> bool:
    if name in _REGISTRY:
        _REGISTRY[name].status = status
        return True
    return False
