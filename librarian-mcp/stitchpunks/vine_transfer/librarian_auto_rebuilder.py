"""
Component 5 — Librarian Auto-Rebuilder (KN023)

Checks drift threshold (>5 file changes since last rebuild) and triggers
`npm run rebuild` in background if needed. Designed to run concurrently
with Eblet auto-promoter (Component 3).
"""

from __future__ import annotations

import subprocess
import time
from pathlib import Path
from typing import Optional

_LIBRARIAN_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp"
)
_DRIFT_THRESHOLD = 5  # files changed


def _count_recent_changes(
    repo_root: Path,
    since_minutes: int = 120,
) -> int:
    """
    Count files changed in git repo since `since_minutes` ago.
    Returns 0 on any git error (fail-open).
    """
    try:
        since_ts = time.strftime(
            "%Y-%m-%dT%H:%M:%S",
            time.gmtime(time.time() - since_minutes * 60),
        )
        result = subprocess.run(
            ["git", "diff", "--name-only", f"@{{'{since_ts}'}}"],
            capture_output=True,
            text=True,
            cwd=str(repo_root),
            timeout=10,
        )
        if result.returncode != 0:
            # Try simpler git status count
            result2 = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                text=True,
                cwd=str(repo_root),
                timeout=10,
            )
            lines = [l for l in result2.stdout.splitlines() if l.strip()]
            return len(lines)
        lines = [l for l in result.stdout.splitlines() if l.strip()]
        return len(lines)
    except Exception:
        return 0


def should_rebuild(
    librarian_dir: Path = _LIBRARIAN_DIR,
    threshold: int = _DRIFT_THRESHOLD,
) -> tuple[bool, int]:
    """
    Check if Librarian rebuild is warranted.
    Returns (should_rebuild, file_change_count).
    """
    repo_root = librarian_dir.parent
    change_count = _count_recent_changes(repo_root)
    return change_count >= threshold, change_count


def trigger_rebuild(
    librarian_dir: Path = _LIBRARIAN_DIR,
    background: bool = True,
    timeout: Optional[int] = 120,
) -> dict:
    """
    Trigger `npm run rebuild` in librarian-mcp directory.

    background=True: fires subprocess and returns immediately.
    background=False: waits for completion (up to timeout seconds).

    Returns {triggered, background, returncode, stdout_snippet, error}
    """
    if not librarian_dir.exists():
        return {
            "triggered": False,
            "background": background,
            "returncode": None,
            "stdout_snippet": "",
            "error": f"Librarian directory not found: {librarian_dir}",
        }

    cmd = ["npm", "run", "rebuild"]
    try:
        if background:
            subprocess.Popen(
                cmd,
                cwd=str(librarian_dir),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return {
                "triggered": True,
                "background": True,
                "returncode": None,
                "stdout_snippet": "(running in background)",
                "error": None,
            }
        else:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(librarian_dir),
                timeout=timeout,
            )
            return {
                "triggered": True,
                "background": False,
                "returncode": result.returncode,
                "stdout_snippet": result.stdout[-500:] if result.stdout else "",
                "error": result.stderr[-200:] if result.returncode != 0 else None,
            }
    except Exception as e:
        return {
            "triggered": False,
            "background": background,
            "returncode": None,
            "stdout_snippet": "",
            "error": str(e),
        }


def auto_rebuild_if_needed(
    librarian_dir: Path = _LIBRARIAN_DIR,
    threshold: int = _DRIFT_THRESHOLD,
) -> dict:
    """
    Check drift threshold and trigger rebuild if needed.
    Returns full result including whether rebuild was triggered.
    """
    rebuild_needed, change_count = should_rebuild(librarian_dir, threshold)
    if not rebuild_needed:
        return {
            "triggered": False,
            "reason": f"Drift below threshold ({change_count} < {threshold} files changed)",
            "change_count": change_count,
        }

    result = trigger_rebuild(librarian_dir, background=True)
    result["change_count"] = change_count
    result["reason"] = f"Drift exceeded threshold ({change_count} >= {threshold} files changed)"
    return result
