#!/usr/bin/env python3
"""
bishop_catechist_jsonl_reader.py — KN036 Catechist Scribe JSONL reader.

Reads the first N turns (user + assistant) from a Claude Code JSONL session
transcript and returns them as a normalized list of turn dicts.

D.2: Default N = 10 (override via CATECHIST_TURNS env var).
D.8: If < 3 turns present, emit INSUFFICIENT_DATA signal via empty list + flag.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

PROJECTS_DIR = Path(r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents")
DEFAULT_TURNS = 10


def get_turn_limit() -> int:
    """D.2: honour CATECHIST_TURNS env override."""
    try:
        return int(os.environ.get("CATECHIST_TURNS", DEFAULT_TURNS))
    except (ValueError, TypeError):
        return DEFAULT_TURNS


def find_session_jsonl(session_id: Optional[str] = None) -> Optional[Path]:
    """Locate the JSONL file for a given session_id, or the most recent one."""
    if not PROJECTS_DIR.is_dir():
        return None
    if session_id:
        candidate = PROJECTS_DIR / f"{session_id}.jsonl"
        if candidate.is_file():
            return candidate
    # Fallback: most recently modified JSONL
    files = [p for p in PROJECTS_DIR.iterdir() if p.is_file() and p.suffix == ".jsonl"]
    if not files:
        return None
    return max(files, key=lambda p: p.stat().st_mtime)


def read_turns(jsonl_path: Path, n: Optional[int] = None) -> dict:
    """
    Read first N user/assistant turns from jsonl_path.

    Returns:
        {
            "turns": [{"role": "user|assistant", "content": <any>}, ...],
            "insufficient_data": bool,  # True if < 3 turns present
            "total_lines_read": int,
            "session_jsonl": str,
        }
    """
    limit = n if n is not None else get_turn_limit()
    turns: list[dict] = []
    total_lines = 0

    try:
        with jsonl_path.open("r", encoding="utf-8", errors="replace") as fh:
            for raw in fh:
                raw = raw.strip()
                if not raw:
                    continue
                total_lines += 1
                try:
                    record = json.loads(raw)
                except json.JSONDecodeError:
                    continue

                msg = record.get("message", {})
                if not isinstance(msg, dict):
                    continue
                role = msg.get("role", "")
                if role not in ("user", "assistant"):
                    continue

                turns.append({
                    "role": role,
                    "content": msg.get("content", ""),
                    "timestamp": record.get("timestamp", ""),
                })
                if len(turns) >= limit:
                    break
    except Exception:
        pass

    return {
        "turns": turns,
        "insufficient_data": len(turns) < 3,  # D.8 guard
        "total_lines_read": total_lines,
        "session_jsonl": str(jsonl_path),
    }
