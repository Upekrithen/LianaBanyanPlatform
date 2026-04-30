#!/usr/bin/env python3
"""
bishop_shutterbug_jsonl_parser.py — KN037 Shutterbug Bishop-CC JSONL context-% extractor.

Reads the most recent Bishop CC JSONL session and extracts the context %
from the latest assistant message's usage metadata.

Context % formula (per KN037 Phase A.5 investigation):
  pct = (input_tokens + output_tokens + cache_read_input_tokens) / TOTAL_CONTEXT_BUDGET * 100

TOTAL_CONTEXT_BUDGET = 200_000 for Claude Opus 4.7 (standard context window).
Note: The 1M extended context is separate; we use the standard 200K as the
practical budget for this session (most Bishop sessions stay well under).
Bishop CC JSONL lives at ~/.claude/projects/C--Users-Administrator-Documents/<session_id>.jsonl

Returns float percentage or None if not parseable.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

PROJECTS_DIR = Path(r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents")

# Claude Opus 4.7 standard context budget
# We use 200K as the working budget baseline; Founder may adjust via env var.
DEFAULT_CONTEXT_BUDGET = 200_000


def get_context_budget() -> int:
    """Allow env override: SHUTTERBUG_CONTEXT_BUDGET=1000000 for 1M extended."""
    import os
    try:
        val = os.environ.get("SHUTTERBUG_CONTEXT_BUDGET")
        return int(val) if val else DEFAULT_CONTEXT_BUDGET
    except (ValueError, TypeError):
        return DEFAULT_CONTEXT_BUDGET


def find_session_jsonl(session_id: Optional[str] = None) -> Optional[Path]:
    """Locate the JSONL for the given session_id, or the most recent one."""
    if not PROJECTS_DIR.is_dir():
        return None
    if session_id:
        candidate = PROJECTS_DIR / f"{session_id}.jsonl"
        if candidate.is_file():
            return candidate
    files = [p for p in PROJECTS_DIR.iterdir() if p.is_file() and p.suffix == ".jsonl"]
    if not files:
        return None
    return max(files, key=lambda p: p.stat().st_mtime)


def extract_context_pct(jsonl_path: Path) -> Optional[float]:
    """
    Scan the JSONL from the end to find the last assistant message with usage data.

    Returns context % as a float (0.0-100.0+), or None if not found.
    """
    budget = get_context_budget()
    last_usage: Optional[dict] = None

    try:
        with jsonl_path.open("r", encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()

        # Scan in reverse to find the most recent usage block
        for raw in reversed(lines):
            raw = raw.strip()
            if not raw:
                continue
            try:
                record = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg = record.get("message", {})
            if not isinstance(msg, dict):
                continue
            if msg.get("role") != "assistant":
                continue

            usage = msg.get("usage")
            if isinstance(usage, dict) and usage:
                last_usage = usage
                break

        if last_usage is None:
            return None

        input_t = last_usage.get("input_tokens", 0) or 0
        output_t = last_usage.get("output_tokens", 0) or 0
        cache_read = last_usage.get("cache_read_input_tokens", 0) or 0
        cache_write = last_usage.get("cache_creation_input_tokens", 0) or 0

        total_used = input_t + output_t + cache_read + cache_write
        if budget <= 0:
            return None

        pct = (total_used / budget) * 100.0
        return round(pct, 2)

    except Exception:
        return None


def extract_context_pct_from_session(session_id: Optional[str] = None) -> Optional[float]:
    """Convenience: find JSONL then extract context %."""
    path = find_session_jsonl(session_id)
    if path is None:
        return None
    return extract_context_pct(path)
