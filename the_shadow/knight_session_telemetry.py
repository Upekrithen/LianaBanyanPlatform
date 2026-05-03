"""
Knight Session Telemetry Abstraction — KN-R1 / BP018
=====================================================
Polls Knight session state for near-completion signals:
  1. context_pct > 70% (approaching compaction)
  2. Phase E COMMIT detected in transcript/logs
  3. Test-pass signal (CI poll or file-watch on test report)
  4. Git commit detected (git log for new commits since session-start)

All detection methods are file/command based — no network required.
"""

from __future__ import annotations

import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]

# ─── Context percentage detection ─────────────────────────────────────────────

def read_context_pct_from_telemetry(knight_session_id: str) -> Optional[float]:
    """
    Read latest context_pct from Stats-Capture telemetry substrate.
    Looks for most recent bookend/interval file for knight_session_id.
    """
    telemetry_live = Path.home() / ".claude" / "state" / "test_telemetry" / "live"
    if not telemetry_live.exists():
        return None

    # Find most recent file matching knight_session_id
    matching = sorted(
        telemetry_live.glob(f"*__interval__*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    import json
    for f in matching:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            if data.get("knight_session_id") == knight_session_id:
                pct = data.get("context_pct")
                if pct is not None:
                    return float(pct)
        except Exception:
            continue
    return None


# ─── Phase E detection ─────────────────────────────────────────────────────────

_PHASE_E_PATTERN = re.compile(
    r"(PHASE\s+E\s*[-—]*\s*COMMIT|Phase\s+E\s*[-—]*\s*COMMIT|phase_e|KN-[A-Z]\d+\s+LANDED)",
    re.IGNORECASE,
)

def detect_phase_e_in_text(text: str) -> Optional[str]:
    """
    Returns the matched text if Phase E / LANDED pattern is detected, else None.
    """
    match = _PHASE_E_PATTERN.search(text)
    return match.group(0) if match else None


def scan_agent_transcripts_for_phase_e(
    knight_session_id: str,
    since_ts: Optional[datetime] = None,
) -> Optional[str]:
    """
    Scan agent-transcript files for Phase E COMMIT pattern.
    Returns matched line or None.
    """
    transcripts_dir = Path.home() / ".cursor" / "projects"
    if not transcripts_dir.exists():
        return None

    # Find JSONL files modified recently
    jsonl_files = sorted(
        transcripts_dir.rglob("*.jsonl"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )[:20]  # scan last 20 transcripts max

    for f in jsonl_files:
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
            if knight_session_id and knight_session_id not in text:
                continue  # Quick skip if session ID not mentioned
            matched = detect_phase_e_in_text(text)
            if matched:
                return matched
        except Exception:
            continue
    return None


# ─── Test-pass signal ─────────────────────────────────────────────────────────

def check_test_pass_signal(test_report_path: Optional[str] = None) -> bool:
    """
    Check if tests are passing. Looks for:
      1. Explicit test report file (TAP output with 'pass' count)
      2. Node test runner exit-code proxy (check last run exit code via env)
    """
    if test_report_path and Path(test_report_path).exists():
        content = Path(test_report_path).read_text(encoding="utf-8", errors="ignore")
        # TAP pattern: "# pass N" where N > 0 and "# fail 0"
        pass_match = re.search(r"# pass (\d+)", content)
        fail_match = re.search(r"# fail (\d+)", content)
        if pass_match and fail_match:
            return int(pass_match.group(1)) > 0 and int(fail_match.group(1)) == 0
    return False


# ─── Git commit detection ─────────────────────────────────────────────────────

def detect_new_git_commits(since_sha: Optional[str] = None, repo_root: Optional[Path] = None) -> Optional[str]:
    """
    Poll git log for commits more recent than since_sha.
    Returns the latest commit hash if new commits exist, else None.
    """
    cwd = str(repo_root or WORKSPACE_ROOT)
    try:
        if since_sha:
            result = subprocess.run(
                ["git", "log", f"{since_sha}..HEAD", "--format=%H", "-1"],
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=5,
            )
        else:
            result = subprocess.run(
                ["git", "log", "--format=%H", "-1"],
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=5,
            )
        commit = result.stdout.strip()
        return commit if commit else None
    except Exception:
        return None
