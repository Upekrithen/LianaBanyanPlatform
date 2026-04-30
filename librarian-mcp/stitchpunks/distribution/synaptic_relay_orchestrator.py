"""
synaptic_relay_orchestrator.py — KN020/BP002

Coordinates cross-channel propagation timing per #2141 Concurrent Distribution Grid.
Synaptic Relay: when one channel publishes, propagate receipt to adjacent channels at
controlled cadence (max ~24 posts/day across all channels combined per #2141).

This is the canonical Wave 1 Synaptic Relay surface per WAVE_1_DISPATCH_DISTRIBUTION_CHANNELS_B133.md.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import datetime
import json
from pathlib import Path

from distribution_channel_registry import list_channels

# #2141 Concurrent Distribution Grid hard limit
CONCURRENT_DISTRIBUTION_GRID_MAX_PER_DAY = 24

_RELAY_LOG_PATH = Path(__file__).parent / "synaptic_relay_log.jsonl"


@dataclass
class ChannelEvent:
    channel: str
    submission_id: str
    published_at: str
    receipt: Dict[str, Any]


@dataclass
class RelaySchedule:
    primary_channel: str
    submission_id: str
    secondary_channels: List[str]
    delay_minutes_between_channels: int = 30
    posts_already_today: int = 0
    scheduled_slots: List[Dict[str, Any]] = field(default_factory=list)
    grid_limit_hit: bool = False


def load_relay_log(log_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    path = log_path or _RELAY_LOG_PATH
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def posts_today(log_path: Optional[Path] = None) -> int:
    """Count posts already recorded today across all channels."""
    today = datetime.date.today().isoformat()
    log = load_relay_log(log_path)
    return sum(1 for entry in log if entry.get("published_at", "").startswith(today))


def check_grid_capacity(posts_so_far: int, new_posts: int) -> bool:
    """Return True if adding new_posts would stay within the #2141 grid limit."""
    return (posts_so_far + new_posts) <= CONCURRENT_DISTRIBUTION_GRID_MAX_PER_DAY


def build_relay_schedule(
    primary_event: ChannelEvent,
    secondary_channels: List[str],
    delay_minutes: int = 30,
    log_path: Optional[Path] = None,
) -> RelaySchedule:
    """
    Build a propagation schedule for secondary channels after primary publish.
    Enforces #2141 daily grid cap.
    """
    already_today = posts_today(log_path)
    total_proposed = 1 + len(secondary_channels)  # primary already fired + secondaries
    capacity_ok = check_grid_capacity(already_today, len(secondary_channels))

    schedule = RelaySchedule(
        primary_channel=primary_event.channel,
        submission_id=primary_event.submission_id,
        secondary_channels=secondary_channels,
        delay_minutes_between_channels=delay_minutes,
        posts_already_today=already_today,
        grid_limit_hit=not capacity_ok,
    )

    base_time = datetime.datetime.fromisoformat(primary_event.published_at)
    for i, ch in enumerate(secondary_channels):
        fire_at = base_time + datetime.timedelta(minutes=delay_minutes * (i + 1))
        schedule.scheduled_slots.append(
            {
                "channel": ch,
                "fire_at": fire_at.isoformat(),
                "slot_index": i + 1,
                "approval_required": True,
                "queued_if_grid_full": not capacity_ok,
            }
        )

    return schedule


def record_relay_event(event: ChannelEvent, log_path: Optional[Path] = None) -> None:
    path = log_path or _RELAY_LOG_PATH
    entry = {
        "channel": event.channel,
        "submission_id": event.submission_id,
        "published_at": event.published_at,
        "receipt_hash": hash(json.dumps(event.receipt, sort_keys=True)),
    }
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
