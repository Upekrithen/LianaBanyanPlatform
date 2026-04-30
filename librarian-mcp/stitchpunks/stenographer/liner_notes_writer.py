"""
Liner Notes Writer — KN027 Component 1

Stone Tablet: fsync-append for all Liner Notes writes.
One JSONL file per session at: stenographer/sessions/<session_id>_liner_notes.jsonl

Record types:
  session_open   — fired at agent-spawn boundary
  bean_start     — fired when a bean begins
  liner_note     — agent-authored thinking-stream entry
  brainscan      — named thinking-block (significant reasoning moments)
  phase_change   — phase transition marker
  bean_end       — fired when a bean completes
  session_close  — fired at session teardown

Toolsmith log: TS-STENOGRAPHER-SCRIBE-KN027-BP003
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_SESSIONS_DIR = Path(__file__).parent / "sessions"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def get_session_path(session_id: str) -> Path:
    """Canonical path for a session's Liner Notes JSONL."""
    _SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = session_id.replace("/", "_").replace("\\", "_").replace(":", "-")
    return _SESSIONS_DIR / f"{safe_id}_liner_notes.jsonl"


def write_record(session_id: str, record: Dict[str, Any]) -> Path:
    """
    Stone Tablet: fsync-append a record to the session Liner Notes.

    Always adds wall_time_iso if not present. Returns the path written.
    Guaranteed non-raising: on any error, logs to stderr and returns path.
    """
    path = get_session_path(session_id)
    record.setdefault("wall_time_iso", _iso_now())
    record.setdefault("session_id", session_id)

    try:
        line = json.dumps(record, ensure_ascii=False) + "\n"
        with path.open("a", encoding="utf-8", buffering=1) as fh:
            fh.write(line)
            fh.flush()
            os.fsync(fh.fileno())
    except Exception as exc:
        import sys
        print(f"[Stenographer/Writer] Write error session={session_id}: {exc}", file=sys.stderr)

    return path


def load_session(session_id: str) -> List[Dict[str, Any]]:
    """Load all records for a session. Returns empty list if not found."""
    path = get_session_path(session_id)
    if not path.exists():
        return []
    records: List[Dict[str, Any]] = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return records


def load_records_by_type(session_id: str, record_type: str) -> List[Dict[str, Any]]:
    """Load all records of a specific type for a session."""
    return [r for r in load_session(session_id) if r.get("type") == record_type]


def list_sessions() -> List[str]:
    """List all session IDs with existing Liner Notes."""
    if not _SESSIONS_DIR.exists():
        return []
    sessions = []
    for p in sorted(_SESSIONS_DIR.iterdir()):
        if p.suffix == ".jsonl" and p.stem.endswith("_liner_notes"):
            sessions.append(p.stem[: -len("_liner_notes")])
    return sessions
