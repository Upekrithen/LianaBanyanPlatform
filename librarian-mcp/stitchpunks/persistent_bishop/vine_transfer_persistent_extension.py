"""
Vine Transfer Persistent Extension — KN035 / A&A #2303

Extends the KN023 Vine Transfer SessionStart hook with Persistent-Bishop
sandbox attach/detach (D.3/D.4, per vine_transfer_hook.py Action 13 extension).

Per KN031, the vine_transfer_hook.py was extended with Action 13 to arm CheckBook.
This module extends that same pattern: the hook now ALSO attaches to the
active beanpole sandbox at session open.

New hook actions:
  Action 14 (attach): check for active beanpole, attach if present
  Action 15 (detach stub): called at session end (optional)

Integration: import and call sandbox_attach_action() from vine_transfer_hook.py
at Action 14 in the 15-step hook sequence.

Toolsmith log: TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional

_HERE = Path(__file__).parent
_STITCHPUNKS = _HERE.parent
if str(_STITCHPUNKS) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS))

# Active beanpole manifest — written by Bishop at beanpole open
_ACTIVE_BEANPOLE_FILE = _HERE / "active_beanpole.json"

import json


def get_active_beanpole_id() -> Optional[str]:
    """
    Read the active beanpole ID from active_beanpole.json.
    Returns None if not set (no active beanpole).
    """
    if not _ACTIVE_BEANPOLE_FILE.exists():
        return None
    try:
        data = json.loads(_ACTIVE_BEANPOLE_FILE.read_text(encoding="utf-8"))
        return data.get("beanpole_id")
    except Exception:
        return None


def set_active_beanpole(beanpole_id: str, owner_session: str = "") -> None:
    """Set the active beanpole ID (called by Bishop/Founder at beanpole open)."""
    data = {
        "beanpole_id": beanpole_id,
        "owner_session": owner_session,
    }
    _ACTIVE_BEANPOLE_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def clear_active_beanpole() -> None:
    """Clear the active beanpole (called at beanpole close)."""
    if _ACTIVE_BEANPOLE_FILE.exists():
        _ACTIVE_BEANPOLE_FILE.unlink()


def sandbox_attach_action(
    session_id: str,
    vendor: str = "claude_cli",
) -> Dict[str, Any]:
    """
    Vine Transfer Hook Action 14: attach to active beanpole sandbox.

    Called at session start (before Phase A of the first bean).
    Non-blocking: returns early with skip=True if no active beanpole.

    Returns attachment_result dict or skip dict.
    """
    beanpole_id = get_active_beanpole_id()

    if not beanpole_id:
        return {
            "action": "sandbox_attach",
            "skip": True,
            "reason": "No active beanpole configured (active_beanpole.json not found or empty)",
        }

    try:
        from persistent_bishop.attachment_protocol import attach
        result = attach(
            beanpole_id=beanpole_id,
            session_id=session_id,
            vendor=vendor,
        )
        result["action"] = "sandbox_attach"
        result["skip"] = False
        return result
    except Exception as exc:
        return {
            "action": "sandbox_attach",
            "skip": False,
            "success": False,
            "error": f"Attachment failed: {exc}",
            "beanpole_id": beanpole_id,
        }


def sandbox_detach_action(
    session_id: str,
    session_summary: str = "",
    delta_recent_eblets: Optional[list] = None,
) -> Dict[str, Any]:
    """
    Vine Transfer Hook Action 15 stub: detach from active beanpole sandbox.

    Called at session end (after final Phase E commit).
    Non-blocking: skip if no active beanpole.

    Returns detachment_result dict or skip dict.
    """
    beanpole_id = get_active_beanpole_id()

    if not beanpole_id:
        return {
            "action": "sandbox_detach",
            "skip": True,
            "reason": "No active beanpole",
        }

    try:
        from persistent_bishop.detachment_protocol import detach
        result = detach(
            beanpole_id=beanpole_id,
            session_id=session_id,
            delta_recent_eblets=delta_recent_eblets or [],
            session_summary=session_summary,
        )
        result["action"] = "sandbox_detach"
        result["skip"] = False
        return result
    except Exception as exc:
        return {
            "action": "sandbox_detach",
            "skip": False,
            "success": False,
            "error": f"Detachment failed: {exc}",
            "beanpole_id": beanpole_id,
        }
