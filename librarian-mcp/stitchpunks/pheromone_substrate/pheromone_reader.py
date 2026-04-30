#!/usr/bin/env python3
"""
pheromone_reader.py — Pheromone Substrate read API (KN038 / #2314)

Provides:
  get_latest_write_ts() -> float | None
    Returns Unix timestamp of the most-recent Pheromone substrate write event,
    or None if the JSONL is absent / unreadable.

Stone Tablet Imperative: index.jsonl is append-only; we scan from the tail for speed.
Brick Wall: any I/O failure returns None; caller falls back to TTL gracefully.

Filed: KN038 / BP004, 2026-04-30
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Canonical path post-K523
PHEROMONE_JSONL = Path(__file__).parent / "index.jsonl"

# Tail-scan limit — read at most this many bytes from the end of the JSONL
# to find the latest ts without loading the entire file (typically 1+ MB).
_TAIL_BYTES = 8192


def _iso_to_unix(ts_str: str) -> Optional[float]:
    """Parse an ISO-8601 string to a Unix float. Returns None on failure."""
    try:
        # Python 3.7+ fromisoformat; handle trailing Z
        ts_clean = ts_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(ts_clean)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp()
    except (ValueError, AttributeError):
        return None


def get_latest_write_ts(jsonl_path: Path = PHEROMONE_JSONL) -> Optional[float]:
    """
    Return Unix timestamp of the most-recent entry in the Pheromone JSONL,
    or None if the file is absent or all entries lack a parseable ts.

    Strategy: tail-scan the file (last _TAIL_BYTES) to avoid loading the
    entire substrate into memory on every gate-check.
    """
    try:
        if not jsonl_path.exists():
            return None

        file_size = jsonl_path.stat().st_size
        if file_size == 0:
            return None

        # Read tail chunk — enough to cover several complete JSONL lines
        seek_pos = max(0, file_size - _TAIL_BYTES)
        with jsonl_path.open("rb") as fh:
            fh.seek(seek_pos)
            raw = fh.read()

        # Decode and split into lines; drop the first (may be partial)
        text = raw.decode("utf-8", errors="replace")
        lines = text.splitlines()
        if seek_pos > 0 and lines:
            lines = lines[1:]  # discard potentially truncated first line

        # Walk lines in reverse; return first parseable ts found
        for line in reversed(lines):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            ts_val = obj.get("ts")
            if ts_val:
                parsed = _iso_to_unix(str(ts_val))
                if parsed is not None:
                    return parsed

        # Tail scan found nothing — fall back to full-file last-line scan
        return _full_scan_latest_ts(jsonl_path)

    except Exception:  # noqa: BLE001  — Brick Wall
        return None


def _full_scan_latest_ts(jsonl_path: Path) -> Optional[float]:
    """Full-file scan fallback: return ts from last parseable entry."""
    try:
        latest: Optional[float] = None
        with jsonl_path.open(encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                ts_val = obj.get("ts")
                if ts_val:
                    parsed = _iso_to_unix(str(ts_val))
                    if parsed is not None:
                        latest = parsed
        return latest
    except Exception:  # noqa: BLE001  — Brick Wall
        return None
