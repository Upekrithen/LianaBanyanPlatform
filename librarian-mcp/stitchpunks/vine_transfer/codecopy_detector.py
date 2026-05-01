"""
Component 2 — Codecopy Auto-Detect + Auto-Read (KN023)

Scans the Founder's codecopy directory for the most recent transcript file.

KN059 (BP005 naming convention): now detects BOTH file formats:
  - BP<NNN>.docx  (preferred — BP005 naming convention)
  - BishopClaudeCode<NNN>.txt  (legacy — still supported)

BP<NNN>.docx files take priority over BishopClaudeCode<NNN>.txt when both exist.
Selects the highest-numbered file with mtime >= prior-session-end-timestamp.
Falls back to "ask Founder" only if detection is ambiguous.

Also exposes compute_next_bp_number() so bishop_session_start can announce the
next-in-sequence BP number at SessionStart (KN059 auto-announce requirement).
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Optional, Tuple

CODECOPY_DIR = Path("C:/Users/Administrator/Documents/LianaBanyanKNIGHT")

# KN059: BP<NNN>.docx is the preferred BP005 format
BP_DOCX_PATTERN = re.compile(r"^BP(\d{3,4})\.docx$", re.IGNORECASE)
# Legacy format — still scanned as fallback
LEGACY_PATTERN = re.compile(r"^BishopClaudeCode(\d+)\.txt$", re.IGNORECASE)
# Combined alias (used externally — matches either format)
CODECOPY_PATTERN = BP_DOCX_PATTERN

CHUNK_SIZE = 250  # lines per read chunk


def _scan_directory(
    directory: Path,
    after_ts: Optional[float] = None,
) -> Tuple[list, list]:
    """
    Scan directory for BP<NNN>.docx AND BishopClaudeCode<NNN>.txt files.

    Returns (bp_candidates, legacy_candidates), each a sorted list of
    (num, mtime, path) tuples, sorted by num descending.
    """
    bp_candidates = []
    legacy_candidates = []

    if not directory.exists():
        return bp_candidates, legacy_candidates

    for f in directory.iterdir():
        m_bp = BP_DOCX_PATTERN.match(f.name)
        if m_bp:
            num = int(m_bp.group(1))
            mtime = f.stat().st_mtime
            bp_candidates.append((num, mtime, f))
            continue
        m_legacy = LEGACY_PATTERN.match(f.name)
        if m_legacy:
            num = int(m_legacy.group(1))
            mtime = f.stat().st_mtime
            legacy_candidates.append((num, mtime, f))

    bp_candidates.sort(key=lambda x: x[0], reverse=True)
    legacy_candidates.sort(key=lambda x: x[0], reverse=True)
    return bp_candidates, legacy_candidates


def compute_next_bp_number(directory: Path = CODECOPY_DIR) -> Optional[int]:
    """
    Return the next-in-sequence BP number based on the highest BP<NNN>.docx found.

    Returns None if no BP*.docx files exist (Founder has not yet created any).
    Used by bishop_session_start.py to auto-announce the next BP number.
    """
    bp_candidates, _ = _scan_directory(directory)
    if not bp_candidates:
        return None
    highest_num = bp_candidates[0][0]
    return highest_num + 1


def detect_latest_codecopy(
    directory: Path = CODECOPY_DIR,
    after_ts: Optional[float] = None,
) -> Tuple[Optional[Path], str]:
    """
    Scan directory for BP<NNN>.docx (preferred) or BishopClaudeCode<NNN>.txt (legacy).

    Priority: BP*.docx > BishopClaudeCode*.txt.

    Returns (path, status) where status is:
      - "found": unique latest file detected
      - "ambiguous": multiple files updated after after_ts
      - "missing": directory empty or no matching files
      - "ask_founder": fallback — surface to Founder for confirmation
    """
    if not directory.exists():
        return None, "missing"

    bp_candidates, legacy_candidates = _scan_directory(directory, after_ts)

    def _pick(candidates: list) -> Tuple[Optional[Path], str]:
        if not candidates:
            return None, "missing"
        if after_ts is not None:
            fresh = [(num, mtime, f) for num, mtime, f in candidates if mtime > after_ts]
            if len(fresh) == 0:
                return candidates[0][2], "found"
            if len(fresh) > 1:
                return fresh[0][2], "ambiguous"
            return fresh[0][2], "found"
        return candidates[0][2], "found"

    # Prefer BP*.docx; fall back to legacy
    if bp_candidates:
        return _pick(bp_candidates)
    if legacy_candidates:
        return _pick(legacy_candidates)
    return None, "missing"


def read_codecopy_chunked(path: Path, chunk_lines: int = CHUNK_SIZE) -> list[str]:
    """
    Read a codecopy file in chunks of chunk_lines lines.
    Returns list of chunk strings. Handles large files (>100K tokens).
    For .docx files, returns a single placeholder chunk (binary — cannot read as text).
    """
    chunks = []
    try:
        if path.suffix.lower() == ".docx":
            chunks = [f"[codecopy_detector] BP docx detected: {path.name} — Founder reads via Word."]
        else:
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

    Returns {status, path, file_name, chunk_count, ask_founder_prompt, next_bp_number}
    """
    path, status = detect_latest_codecopy(directory, after_ts)
    next_bp = compute_next_bp_number(directory)

    if status == "missing" or path is None:
        return {
            "status": "missing",
            "path": None,
            "file_name": None,
            "chunk_count": 0,
            "next_bp_number": next_bp,
            "ask_founder_prompt": (
                "No BP*.docx or BishopClaudeCode*.txt files found in codecopy directory."
            ),
        }
    if status == "ambiguous":
        return {
            "status": "ambiguous",
            "path": str(path),
            "file_name": path.name,
            "chunk_count": 0,
            "next_bp_number": next_bp,
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
        "next_bp_number": next_bp,
        "ask_founder_prompt": None,
    }
