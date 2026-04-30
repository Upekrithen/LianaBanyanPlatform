"""
Brainscan Capture — KN027 Component 2

Brainscan = named artifact for any single captured thinking-block.
Naming convention: Brainscan-<bean_id>-<phase>-<slug>

Brainscan IDs are deterministically generated from (session_id, bean_id, slug, wall_time).

Toolsmith log: TS-STENOGRAPHER-SCRIBE-KN027-BP003
"""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Optional


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def make_brainscan_name(bean_id: str, phase: str, slug: str) -> str:
    """
    Canonical Brainscan name.
    Format: Brainscan-<bean_id>-<phase>-<slug>
    Example: Brainscan-KN027-Phase-C-design-decisions
    """
    safe_phase = phase.replace(" ", "-").replace("/", "-")
    safe_slug = slug.replace(" ", "-").replace("/", "-").lower()
    return f"Brainscan-{bean_id}-{safe_phase}-{safe_slug}"


def make_brainscan_id(session_id: str, bean_id: str, slug: str) -> str:
    """
    Unique, reproducible Brainscan ID.
    Format: BS-<bean_id>-<8hexchars>
    """
    seed = f"{session_id}:{bean_id}:{slug}:{_iso_now()}"
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return f"BS-{bean_id}-{digest[:8]}"


def make_note_id(session_id: str, bean_id: str) -> str:
    """
    Unique Liner Note ID.
    Format: LN-<bean_id>-<8hexchars>
    """
    seed = f"{session_id}:{bean_id}:liner:{_iso_now()}"
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return f"LN-{bean_id}-{digest[:8]}"


def classify_brainscan_significance(content: str) -> str:
    """
    Classify a brainscan's significance class by content length + keyword presence.
    Returns: "major" | "minor" | "routine"
    """
    lower = content.lower()
    if len(content) > 800 or any(
        kw in lower
        for kw in ("invalidat", "falsif", "defer", "blocker", "critical", "discovery")
    ):
        return "major"
    if len(content) > 300 or any(
        kw in lower for kw in ("decision", "tradeoff", "rationale", "choice", "approach")
    ):
        return "minor"
    return "routine"
