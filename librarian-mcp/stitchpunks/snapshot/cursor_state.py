"""
Cursor Context-Budget Watcher — Component 3: Cursor State Extractor
KN012 / A&A #2293

Reads Cursor IDE filesystem footprint to estimate:
  - context_budget_percent  (proxy: current session transcript size / max_size)
  - active_files            (from ide_state.json recentlyViewedFiles)
  - tool_call_count         (inferred from ai-code-tracking.db hash entries)
  - session_id              (most-recently-modified agent-transcript UUID)

Falls back gracefully to {"available": false} if Cursor schema changes.

Context-budget proxy rationale:
  Cursor's 128K context ≈ ~640KB of JSONL transcript (5 bytes/token avg).
  We measure current-session transcript JSONL size and divide by a configurable
  max_context_bytes (default 640KB).  This underestimates early and overestimates
  late — but tracks the shape of context consumption empirically.

Sunset path: when Cursor exposes native context-% via filesystem or MCP,
replace this extractor without changing the watcher or Herder schema.

Toolsmith log: TS-CURSOR-CONTEXT-BUDGET-WATCHER-KN012-BP002
"""

from __future__ import annotations

import json
import os
import platform
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ── Cursor filesystem paths ───────────────────────────────────────────────────

def _cursor_root() -> Path:
    """Platform-appropriate ~/.cursor path."""
    home = Path.home()
    return home / ".cursor"


def _projects_root() -> Path:
    return _cursor_root() / "projects"


def _find_project_dir(workspace_path: Optional[Path] = None) -> Optional[Path]:
    """
    Find the Cursor project state dir for the given workspace.
    Falls back to newest modified project dir if workspace_path not specified.
    """
    projects = _projects_root()
    if not projects.exists():
        return None

    if workspace_path:
        # Convert workspace path to Cursor project ID format
        # e.g. C:/Users/Admin/Documents/Proj -> c-Users-Admin-Documents-Proj
        try:
            normalized = str(workspace_path).replace("\\", "/").replace(":", "").replace("/", "-").lower()
            candidate = projects / normalized
            if candidate.exists():
                return candidate
        except Exception:
            pass

    # Fall back to most recently modified project dir
    try:
        subdirs = [p for p in projects.iterdir() if p.is_dir()]
        if subdirs:
            return max(subdirs, key=lambda p: p.stat().st_mtime)
    except Exception:
        pass

    return None


def _find_current_transcript(project_dir: Path) -> Optional[Path]:
    """
    Find the current (most recently modified) agent transcript JSONL.
    Returns None if no transcripts found.
    """
    transcripts_dir = project_dir / "agent-transcripts"
    if not transcripts_dir.exists():
        return None

    try:
        jsonl_files = list(transcripts_dir.rglob("*.jsonl"))
        if not jsonl_files:
            return None
        return max(jsonl_files, key=lambda p: p.stat().st_mtime)
    except Exception:
        return None


def _estimate_context_percent(
    transcript_path: Optional[Path],
    max_context_bytes: int = 640_000,
) -> Optional[float]:
    """
    Estimate context-budget % from transcript JSONL file size.
    Returns None if transcript unavailable.
    """
    if transcript_path is None or not transcript_path.exists():
        return None
    try:
        size = transcript_path.stat().st_size
        # A very large transcript means summarization has occurred;
        # treat sizes over 2x max as 95% to signal near-limit.
        if size >= 2 * max_context_bytes:
            return 95.0
        pct = min(99.9, (size / max_context_bytes) * 100.0)
        return round(pct, 1)
    except Exception:
        return None


def _read_ide_state(cursor_root: Optional[Path] = None) -> List[str]:
    """Read recentlyViewedFiles from ide_state.json."""
    root = cursor_root or _cursor_root()
    ide_state_path = root / "ide_state.json"
    try:
        with ide_state_path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        return data.get("recentlyViewedFiles", [])
    except Exception:
        return []


def _count_recent_tool_calls(
    db_path: Optional[Path] = None,
    session_id: Optional[str] = None,
    limit: int = 100,
) -> int:
    """
    Count recent AI tool invocations from ai-code-tracking.db.
    Returns 0 on any error.
    """
    db_path = db_path or (_cursor_root() / "ai-tracking" / "ai-code-tracking.db")
    if not db_path.exists():
        return 0
    try:
        conn = sqlite3.connect(str(db_path), timeout=3.0)
        cur = conn.cursor()
        if session_id:
            cur.execute(
                "SELECT COUNT(*) FROM ai_code_hashes WHERE conversationId = ? LIMIT ?",
                (session_id, limit),
            )
        else:
            cur.execute(
                "SELECT COUNT(*) FROM ai_code_hashes ORDER BY timestamp DESC LIMIT ?",
                (limit,),
            )
        count = cur.fetchone()[0]
        conn.close()
        return int(count)
    except Exception:
        return 0


def _extract_session_id(transcript_path: Optional[Path]) -> Optional[str]:
    """Extract session UUID from the transcript file path."""
    if transcript_path is None:
        return None
    # Agent transcript paths are: <uuid>/<uuid>.jsonl
    # The parent dir is the session UUID
    try:
        return transcript_path.parent.name
    except Exception:
        return None


def extract_cursor_state(
    workspace_path: Optional[Path] = None,
    max_context_bytes: int = 640_000,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Extract Cursor IDE state for context-budget monitoring.

    Returns:
    {
        "available": bool,
        "context_budget_percent": float | None,
        "active_files": list[str],
        "tool_call_count": int,
        "session_id": str | None,
        "transcript_size_bytes": int | None,
        "max_context_bytes": int,
        "extracted_at": str,
        "source": "transcript_size_proxy" | "unavailable",
    }
    """
    extracted_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        project_dir = _find_project_dir(workspace_path)
        if project_dir is None:
            return {
                "available": False,
                "context_budget_percent": None,
                "active_files": [],
                "tool_call_count": 0,
                "session_id": None,
                "transcript_size_bytes": None,
                "max_context_bytes": max_context_bytes,
                "extracted_at": extracted_at,
                "source": "unavailable",
                "note": "No Cursor project directory found",
            }

        transcript = _find_current_transcript(project_dir)
        session_id = _extract_session_id(transcript)
        context_pct = _estimate_context_percent(transcript, max_context_bytes)
        active_files = _read_ide_state()
        tool_calls = _count_recent_tool_calls(db_path=db_path, session_id=session_id)
        transcript_size = transcript.stat().st_size if transcript and transcript.exists() else None

        return {
            "available": context_pct is not None,
            "context_budget_percent": context_pct,
            "active_files": active_files[:20],
            "tool_call_count": tool_calls,
            "session_id": session_id,
            "transcript_size_bytes": transcript_size,
            "max_context_bytes": max_context_bytes,
            "extracted_at": extracted_at,
            "source": "transcript_size_proxy" if context_pct is not None else "unavailable",
        }

    except Exception as e:
        return {
            "available": False,
            "context_budget_percent": None,
            "active_files": [],
            "tool_call_count": 0,
            "session_id": None,
            "transcript_size_bytes": None,
            "max_context_bytes": max_context_bytes,
            "extracted_at": extracted_at,
            "source": "unavailable",
            "error": str(e),
        }


if __name__ == "__main__":
    state = extract_cursor_state()
    print(json.dumps(state, indent=2))
