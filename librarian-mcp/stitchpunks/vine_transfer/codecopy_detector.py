"""
Component 2 — Codecopy Auto-Detect + Auto-Read (KN023)

Scans the Founder's codecopy directory for the most recent transcript file
(BishopClaudeCode<NNN>.txt). Selects the highest-numbered file with mtime
greater than prior-session-end-timestamp. Falls back to "ask Founder" if
detection is ambiguous.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Optional, Tuple

CODECOPY_DIR = Path("C:/Users/Administrator/Documents/LianaBanyanKNIGHT")
CODECOPY_PATTERN = re.compile(r"BishopClaudeCode(\d+)\.txt$", re.IGNORECASE)
CHUNK_SIZE = 250  # lines per read chunk


def detect_latest_codecopy(
    directory: Path = CODECOPY_DIR,
    after_ts: Optional[float] = None,
) -> Tuple[Optional[Path], str]:
    """
    Scan directory for BishopClaudeCode<NNN>.txt files.

    Returns (path, status) where status is:
      - "found": unique latest file detected
      - "ambiguous": multiple files updated after after_ts
      - "missing": directory empty or no matching files
      - "ask_founder": fallback — surface to Founder for confirmation
    """
    if not directory.exists():
        return None, "missing"

    candidates = []
    for f in directory.iterdir():
        m = CODECOPY_PATTERN.match(f.name)
        if not m:
            continue
        num = int(m.group(1))
        mtime = f.stat().st_mtime
        candidates.append((num, mtime, f))

    if not candidates:
        return None, "missing"

    # Sort by number descending
    candidates.sort(key=lambda x: x[0], reverse=True)

    # If after_ts: filter to files updated after prior session end
    if after_ts is not None:
        fresh = [(num, mtime, f) for num, mtime, f in candidates if mtime > after_ts]
        if len(fresh) == 0:
            # Nothing newer — take the highest-numbered file anyway
            return candidates[0][2], "found"
        if len(fresh) > 1:
            return fresh[0][2], "ambiguous"
        return fresh[0][2], "found"

    # No timestamp filter — return highest-numbered
    return candidates[0][2], "found"


def read_codecopy_chunked(path: Path, chunk_lines: int = CHUNK_SIZE) -> list[str]:
    """
    Read a codecopy file in chunks of chunk_lines lines.
    Returns list of chunk strings. Handles large files (>100K tokens).
    """
    chunks = []
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        for i in range(0, len(lines), chunk_lines):
            chunk = "\n".join(lines[i : i + chunk_lines])
            chunks.append(chunk)
    except Exception as e:
        chunks = [f"[codecopy_detector] ERROR reading {path}: {e}"]
    return chunks


def get_codecopy_summary(
    directory: Path = CODECOPY_DIR,
    after_ts: Optional[float] = None,
) -> dict:
    """
    High-level summary for Vine Landing Receipt integration.

    Returns {status, path, file_name, chunk_count, ask_founder_prompt}
    """
    path, status = detect_latest_codecopy(directory, after_ts)
    if status == "missing" or path is None:
        return {
            "status": "missing",
            "path": None,
            "file_name": None,
            "chunk_count": 0,
            "ask_founder_prompt": "No BishopClaudeCode*.txt files found in codecopy directory.",
        }
    if status == "ambiguous":
        return {
            "status": "ambiguous",
            "path": str(path),
            "file_name": path.name,
            "chunk_count": 0,
            "ask_founder_prompt": (
                f"Multiple recent codecopy files detected. "
                f"Using highest-numbered: {path.name}. "
                f"Please confirm or redirect."
            ),
        }
    chunks = read_codecopy_chunked(path)
    return {
        "status": "found",
        "path": str(path),
        "file_name": path.name,
        "chunk_count": len(chunks),
        "ask_founder_prompt": None,
    }
