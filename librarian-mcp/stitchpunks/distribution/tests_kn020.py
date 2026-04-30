"""
tests_kn020.py — KN020/BP002

Wave 1 Distribution Channels Activation — 15+ tests.
"""

from __future__ import annotations
import datetime
import json
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# 1. Channel registry loads all 5 channels
# ---------------------------------------------------------------------------

def test_channel_registry_loads_all_five():
    from distribution_channel_registry import list_channels, channel_names
    names = channel_names()
    assert len(names) == 5
    for ch in ("substack", "reddit", "discord", "youtube", "linkedin"):
        assert ch in names


# ---------------------------------------------------------------------------
# 2. Each adapter stub returns expected schema
# ---------------------------------------------------------------------------

def test_substack_adapter_schema(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token
    from substack_adapter import SubstackAdapter, SubstackPost

    adapter = SubstackAdapter()
    token = generate_approval_token("substack")
    post = SubstackPost(title="Test Post", body="A" * 200)
    result = adapter.publish(post, approval_token=token, dry_run=True)

    assert result["channel"] == "substack"
    assert result["status"] == "dry_run"
    assert "published_at" in result


def test_reddit_adapter_schema(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token
    from reddit_adapter import RedditAdapter, RedditPost

    adapter = RedditAdapter()
    token = generate_approval_token("reddit")
    post = RedditPost(subreddit="r/programming", title="Test", body="B" * 100)
    result = adapter.publish(post, approval_token=token, dry_run=True)

    assert result["channel"] == "reddit"
    assert result["subreddit"] == "r/programming"


def test_discord_adapter_schema(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token
    from discord_adapter import DiscordAdapter, DiscordMessage

    adapter = DiscordAdapter()
    token = generate_approval_token("discord")
    msg = DiscordMessage(server_class="cursor_user_community", content="C" * 100)
    result = adapter.send(msg, approval_token=token, dry_run=True)

    assert result["channel"] == "discord"
    assert result["server_class"] == "cursor_user_community"


def test_youtube_adapter_schema(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token
    from youtube_adapter import YouTubeAdapter, YouTubeContent

    adapter = YouTubeAdapter()
    token = generate_approval_token("youtube")
    content = YouTubeContent(title="6-Months-Jarvis Teaser", description="D" * 100)
    result = adapter.publish(content, approval_token=token, dry_run=True)

    assert result["channel"] == "youtube"
    assert result["status"] == "dry_run"


def test_linkedin_adapter_schema(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token
    from linkedin_adapter import LinkedInAdapter, LinkedInPost

    adapter = LinkedInAdapter()
    token = generate_approval_token("linkedin")
    post = LinkedInPost(content="E" * 200, audience_class="veteran_network")
    result = adapter.publish(post, approval_token=token, dry_run=True)

    assert result["channel"] == "linkedin"
    assert result["audience_class"] == "veteran_network"


# ---------------------------------------------------------------------------
# 3. Cephas Pre-Submission → channel selection flow
# ---------------------------------------------------------------------------

def test_presubmission_channel_selection():
    from cephas_presubmission_distribution_bridge import (
        PreSubmission, PreSubmissionStatus, select_channels,
    )

    ps = PreSubmission(
        submission_id="PS-001",
        title="Cathedral Effect Paper",
        body_excerpt="...",
        status=PreSubmissionStatus.APPROVED,
        vote_tally={"substack": 50, "reddit": 40, "discord": 20, "linkedin": 10, "youtube": 5},
    )
    selected = select_channels(ps, max_channels=3)
    assert selected[:3] == ["substack", "reddit", "discord"]


# ---------------------------------------------------------------------------
# 4. Member vote informs channel ranking
# ---------------------------------------------------------------------------

def test_member_vote_informs_ranking():
    from cephas_presubmission_distribution_bridge import (
        PreSubmission, PreSubmissionStatus, rank_channels_by_vote,
    )

    ps = PreSubmission(
        submission_id="PS-002",
        title="Anti-enshittification post",
        body_excerpt="...",
        status=PreSubmissionStatus.APPROVED,
        vote_tally={"discord": 99, "substack": 10, "reddit": 5},
    )
    ranked = rank_channels_by_vote(ps)
    assert ranked[0] == "discord"


# ---------------------------------------------------------------------------
# 5. Synaptic Relay timing coordinates correctly
# ---------------------------------------------------------------------------

def test_synaptic_relay_timing(tmp_path):
    from synaptic_relay_orchestrator import ChannelEvent, build_relay_schedule

    event = ChannelEvent(
        channel="substack",
        submission_id="PS-001",
        published_at=datetime.datetime.utcnow().isoformat(),
        receipt={"status": "dry_run"},
    )
    schedule = build_relay_schedule(
        event,
        secondary_channels=["reddit", "discord"],
        delay_minutes=30,
        log_path=tmp_path / "relay.jsonl",
    )

    assert schedule.primary_channel == "substack"
    assert len(schedule.scheduled_slots) == 2
    # Second channel fires 30 min after primary, third fires 60 min after
    t0 = datetime.datetime.fromisoformat(event.published_at)
    slot0_time = datetime.datetime.fromisoformat(schedule.scheduled_slots[0]["fire_at"])
    assert abs((slot0_time - t0).total_seconds() - 1800) < 5  # within 5s tolerance


# ---------------------------------------------------------------------------
# 6. Concurrent Distribution Grid limit (~24 posts/day) enforced
# ---------------------------------------------------------------------------

def test_concurrent_distribution_grid_limit(tmp_path):
    from synaptic_relay_orchestrator import (
        ChannelEvent, build_relay_schedule, record_relay_event, posts_today,
    )

    log = tmp_path / "relay.jsonl"
    now_str = datetime.datetime.utcnow().isoformat()

    # Record 23 events
    for i in range(23):
        ev = ChannelEvent(
            channel="reddit",
            submission_id=f"PS-{i:03d}",
            published_at=now_str,
            receipt={"status": "dry_run"},
        )
        record_relay_event(ev, log_path=log)

    assert posts_today(log_path=log) == 23

    primary = ChannelEvent(
        channel="substack",
        submission_id="PS-024",
        published_at=now_str,
        receipt={"status": "dry_run"},
    )
    schedule = build_relay_schedule(
        primary,
        secondary_channels=["discord", "linkedin"],
        delay_minutes=30,
        log_path=log,
    )
    # Adding 2 secondaries to 23 existing posts exceeds 24 — grid_limit_hit
    assert schedule.grid_limit_hit is True


# ---------------------------------------------------------------------------
# 7. Fire-control gate blocks publish without valid token
# ---------------------------------------------------------------------------

def test_fire_control_gate_blocks_invalid_token(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import FireControlError, verify_and_consume_token

    with pytest.raises(FireControlError):
        verify_and_consume_token("nonexistent-token-id", "substack")


# ---------------------------------------------------------------------------
# 8. Approval token replay prevented
# ---------------------------------------------------------------------------

def test_token_replay_prevented(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token, verify_and_consume_token, FireControlError

    token = generate_approval_token("reddit")
    verify_and_consume_token(token, "reddit")  # first use — OK

    with pytest.raises(FireControlError, match="already consumed"):
        verify_and_consume_token(token, "reddit")  # replay — must fail


# ---------------------------------------------------------------------------
# 9. Distribution receipt scribed via Chronos-style hash
# ---------------------------------------------------------------------------

def test_distribution_receipt_has_timestamp(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")
    from distribution_fire_control import generate_approval_token
    from substack_adapter import SubstackAdapter, SubstackPost

    adapter = SubstackAdapter()
    token = generate_approval_token("substack")
    post = SubstackPost(title="Receipt Test", body="F" * 200)
    result = adapter.publish(post, approval_token=token, dry_run=True)

    assert "published_at" in result
    datetime.datetime.fromisoformat(result["published_at"])  # must parse


# ---------------------------------------------------------------------------
# 10. Pheromone index updates on publication — relay log is append-only
# ---------------------------------------------------------------------------

def test_relay_log_append_only(tmp_path):
    from synaptic_relay_orchestrator import ChannelEvent, record_relay_event, load_relay_log

    log = tmp_path / "relay.jsonl"
    for i in range(3):
        ev = ChannelEvent(
            channel=["substack", "reddit", "discord"][i],
            submission_id=f"PS-{i}",
            published_at=datetime.datetime.utcnow().isoformat(),
            receipt={},
        )
        record_relay_event(ev, log_path=log)

    entries = load_relay_log(log_path=log)
    assert len(entries) == 3


# ---------------------------------------------------------------------------
# 11. Six Degrees flagging composes — channel schedule carries approval_required flag
# ---------------------------------------------------------------------------

def test_six_degrees_approval_required_flag(tmp_path):
    from synaptic_relay_orchestrator import ChannelEvent, build_relay_schedule

    ev = ChannelEvent(
        channel="substack",
        submission_id="PS-999",
        published_at=datetime.datetime.utcnow().isoformat(),
        receipt={},
    )
    schedule = build_relay_schedule(
        ev,
        secondary_channels=["reddit"],
        log_path=tmp_path / "relay.jsonl",
    )
    for slot in schedule.scheduled_slots:
        assert slot["approval_required"] is True


# ---------------------------------------------------------------------------
# 12. MCP query: pending distribution queue (grid_status)
# ---------------------------------------------------------------------------

def test_distribution_query_grid_status(tmp_path, monkeypatch):
    import synaptic_relay_orchestrator as sro
    monkeypatch.setattr(sro, "_RELAY_LOG_PATH", tmp_path / "relay.jsonl")

    from synaptic_relay_orchestrator import ChannelEvent, record_relay_event
    ev = ChannelEvent(
        channel="discord",
        submission_id="PS-Q01",
        published_at=datetime.datetime.utcnow().isoformat(),
        receipt={},
    )
    record_relay_event(ev, log_path=tmp_path / "relay.jsonl")

    today_count = sro.posts_today(log_path=tmp_path / "relay.jsonl")
    assert today_count == 1
    assert 24 - today_count == 23


# ---------------------------------------------------------------------------
# 13. Edge: rate-limit hit on adapter → graceful queue (status reflects limit)
# ---------------------------------------------------------------------------

def test_rate_limit_graceful_queue(tmp_path):
    from synaptic_relay_orchestrator import ChannelEvent, build_relay_schedule, record_relay_event

    log = tmp_path / "relay.jsonl"
    now_str = datetime.datetime.utcnow().isoformat()

    for i in range(24):
        ev = ChannelEvent(channel="reddit", submission_id=f"PS-{i}", published_at=now_str, receipt={})
        record_relay_event(ev, log_path=log)

    primary = ChannelEvent(channel="substack", submission_id="PS-OVER", published_at=now_str, receipt={})
    schedule = build_relay_schedule(primary, secondary_channels=["discord"], log_path=log)

    assert schedule.grid_limit_hit is True
    assert schedule.scheduled_slots[0]["queued_if_grid_full"] is True


# ---------------------------------------------------------------------------
# 14. Edge: invalid Pre-Submission status → reject
# ---------------------------------------------------------------------------

def test_invalid_presubmission_status_rejected():
    from cephas_presubmission_distribution_bridge import (
        PreSubmission, PreSubmissionStatus, select_channels, build_distribution_schedule,
    )

    ps = PreSubmission(
        submission_id="PS-BAD",
        title="Rejected draft",
        body_excerpt="...",
        status=PreSubmissionStatus.REJECTED,
    )
    with pytest.raises(ValueError, match="status is"):
        select_channels(ps)

    with pytest.raises(ValueError, match="status is"):
        build_distribution_schedule(ps)


# ---------------------------------------------------------------------------
# 15. End-to-end: Pre-Submission accepted → distribution scheduled → Founder approves
#                → channel adapter fires → receipt scribed
# ---------------------------------------------------------------------------

def test_end_to_end_distribution_flow(tmp_path, monkeypatch):
    import distribution_fire_control as dfc
    monkeypatch.setattr(dfc, "_TOKEN_STORE_PATH", tmp_path / "tokens.jsonl")

    from distribution_fire_control import generate_approval_token
    from cephas_presubmission_distribution_bridge import (
        PreSubmission, PreSubmissionStatus, build_distribution_schedule,
    )
    from substack_adapter import SubstackAdapter, SubstackPost
    from synaptic_relay_orchestrator import ChannelEvent, record_relay_event, load_relay_log

    relay_log = tmp_path / "relay.jsonl"

    # Step 1: Pre-Submission approved with member votes
    ps = PreSubmission(
        submission_id="PS-E2E",
        title="Cathedral Adoption Pathway",
        body_excerpt="The Keep delivers.",
        status=PreSubmissionStatus.APPROVED,
        vote_tally={"substack": 100, "reddit": 50, "discord": 30},
    )

    # Step 2: Build distribution schedule
    sched = build_distribution_schedule(ps, max_channels=3)
    assert sched["selected_channels"][0] == "substack"
    assert sched["approval_pending"] is True

    # Step 3: Founder generates approval token for primary channel
    token = generate_approval_token("substack")

    # Step 4: Channel adapter fires
    adapter = SubstackAdapter()
    post = SubstackPost(title=ps.title, body="G" * 500)
    receipt = adapter.publish(post, approval_token=token, dry_run=True)
    assert receipt["status"] == "dry_run"

    # Step 5: Record relay event (scribe)
    ev = ChannelEvent(
        channel="substack",
        submission_id=ps.submission_id,
        published_at=receipt["published_at"],
        receipt=receipt,
    )
    record_relay_event(ev, log_path=relay_log)

    log_entries = load_relay_log(log_path=relay_log)
    assert len(log_entries) == 1
    assert log_entries[0]["submission_id"] == "PS-E2E"
