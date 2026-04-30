"""
Component 3 — Eblet Auto-Promoter (KN023)

Invokes discipline_wing.promote_eblet for each .eblet.md in the prior-session
directory. Reports successes and Augur-blocked items without aborting on
individual failures. Runs concurrently with librarian_auto_rebuilder (Component 5).
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Optional

_WORKSPACE = r"C:\Users\Administrator\Documents\LianaBanyanPlatform"


def promote_session_eblets(
    session_id: str,
    eblet_root: Optional[Path] = None,
    commit: bool = False,
    dry_run: bool = False,
) -> dict:
    """
    Promote all pending Eblets from a given session.

    Returns {
        session_id,
        total_found,
        promoted,
        blocked,
        errors,
        blocked_names,
        promoted_names,
    }
    """
    if eblet_root is None:
        eblet_root = Path.home() / ".claude" / "state" / "eblets"

    session_dir = eblet_root / session_id
    if not session_dir.exists():
        return {
            "session_id": session_id,
            "total_found": 0,
            "promoted": 0,
            "blocked": 0,
            "errors": 0,
            "blocked_names": [],
            "promoted_names": [],
            "note": f"Session directory not found: {session_dir}",
        }

    eblet_files = sorted(session_dir.glob("*.eblet.md"))
    total = len(eblet_files)

    if total == 0:
        return {
            "session_id": session_id,
            "total_found": 0,
            "promoted": 0,
            "blocked": 0,
            "errors": 0,
            "blocked_names": [],
            "promoted_names": [],
            "note": "No Eblets found in session directory (graceful skip).",
        }

    promoted_names = []
    blocked_names = []
    error_names = []

    for eblet_path in eblet_files:
        if dry_run:
            promoted_names.append(f"[DRY-RUN] {eblet_path.name}")
            continue

        cmd = [
            sys.executable, "-m", "discipline_wing.promote_eblet",
            str(eblet_path),
        ]
        if commit:
            cmd.append("--commit")
        cmd.extend(["--session", session_id])

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=_WORKSPACE,
                timeout=60,
            )
            if result.returncode == 0:
                promoted_names.append(eblet_path.name)
            elif result.returncode == 1:
                blocked_names.append(eblet_path.name)
            else:
                error_names.append(eblet_path.name)
        except subprocess.TimeoutExpired:
            error_names.append(f"{eblet_path.name} [timeout]")
        except Exception as e:
            error_names.append(f"{eblet_path.name} [{e}]")

    return {
        "session_id": session_id,
        "total_found": total,
        "promoted": len(promoted_names),
        "blocked": len(blocked_names),
        "errors": len(error_names),
        "blocked_names": blocked_names,
        "promoted_names": promoted_names,
        "error_names": error_names,
    }


def format_promotion_summary(result: dict) -> str:
    """Format promotion result as Vine Landing Receipt section."""
    lines = [
        f"**Eblet Auto-Promotion** (session {result['session_id']})",
        f"  Found: {result['total_found']} | Promoted: {result['promoted']} | "
        f"Blocked: {result['blocked']} | Errors: {result['errors']}",
    ]
    if result.get("promoted_names"):
        lines.append(f"  ✓ Promoted: {', '.join(result['promoted_names'])}")
    if result.get("blocked_names"):
        lines.append(f"  ✗ Blocked (Augur): {', '.join(result['blocked_names'])}")
    if result.get("error_names"):
        lines.append(f"  ! Errors: {', '.join(result['error_names'])}")
    if result.get("note"):
        lines.append(f"  Note: {result['note']}")
    return "\n".join(lines)
