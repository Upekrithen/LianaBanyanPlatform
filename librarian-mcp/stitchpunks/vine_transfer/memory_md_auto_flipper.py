"""
Component 4 — MEMORY.md Auto-Flipper (KN023)

Detects current MEMORY.md session boundary state; applies the canonical
session-boundary template at the top of the file; preserves all other
content. Emits diff for Founder review before any write. Idempotent.

Destructive action: surfaces "auto-action would do X; confirm or redirect"
per D.6 Founder override discipline.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

MEMORY_MD_PATH = Path.home() / ".claude" / "MEMORY.md"

_BOUNDARY_HEADER_RE = re.compile(
    r"^#+\s*Session Boundary.*?---\s*$",
    re.MULTILINE | re.DOTALL,
)

_BOUNDARY_TEMPLATE = """\
## Session Boundary — {session_id} (auto-flip {ts})

**Prior session:** {prior_session_id}
**Current session:** {session_id}
**Flip trigger:** Vine Transfer SessionStart hook

---

"""


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")[:19] + "Z"


def detect_current_state(memory_path: Path = MEMORY_MD_PATH) -> dict:
    """
    Inspect MEMORY.md and return flip state.

    Returns {
        exists, current_boundary_session, needs_flip, content_preview
    }
    """
    if not memory_path.exists():
        return {
            "exists": False,
            "current_boundary_session": None,
            "needs_flip": False,
            "content_preview": "",
        }
    content = memory_path.read_text(encoding="utf-8")
    match = _BOUNDARY_HEADER_RE.search(content)
    current = None
    if match:
        m2 = re.search(r"Session Boundary — (\S+)", match.group(0))
        if m2:
            current = m2.group(1)
    return {
        "exists": True,
        "current_boundary_session": current,
        "needs_flip": True,
        "content_preview": content[:200],
    }


def build_flip_diff(
    current_content: str,
    session_id: str,
    prior_session_id: str,
) -> tuple[str, str]:
    """
    Compute new MEMORY.md content with boundary header prepended.

    Returns (new_content, diff_summary).
    Idempotent: replaces existing boundary header if present.
    """
    ts = _iso_now()
    new_header = _BOUNDARY_TEMPLATE.format(
        session_id=session_id,
        prior_session_id=prior_session_id,
        ts=ts,
    )

    # Remove existing boundary block if present
    cleaned = _BOUNDARY_HEADER_RE.sub("", current_content).lstrip("\n")
    new_content = new_header + cleaned

    diff_summary = (
        f"INSERT session boundary header at top of MEMORY.md\n"
        f"  Prior: {prior_session_id} → Current: {session_id}\n"
        f"  Existing content preserved (lines: {len(cleaned.splitlines())})"
    )
    return new_content, diff_summary


def apply_flip(
    session_id: str,
    prior_session_id: str,
    memory_path: Path = MEMORY_MD_PATH,
    dry_run: bool = False,
) -> dict:
    """
    Apply MEMORY.md session-boundary flip.

    Returns {
        applied, dry_run, diff_summary, confirmation_prompt (if dry_run)
    }
    """
    state = detect_current_state(memory_path)

    if not state["exists"]:
        return {
            "applied": False,
            "dry_run": dry_run,
            "diff_summary": "MEMORY.md not found — skipping flip.",
            "confirmation_prompt": None,
        }

    current_content = memory_path.read_text(encoding="utf-8")
    new_content, diff_summary = build_flip_diff(
        current_content, session_id, prior_session_id
    )

    if dry_run:
        return {
            "applied": False,
            "dry_run": True,
            "diff_summary": diff_summary,
            "confirmation_prompt": (
                f"MEMORY.md flip would:\n{diff_summary}\n"
                f"Confirm to apply, or redirect."
            ),
        }

    memory_path.write_text(new_content, encoding="utf-8")
    return {
        "applied": True,
        "dry_run": False,
        "diff_summary": diff_summary,
        "confirmation_prompt": None,
    }
