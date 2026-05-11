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

BP022 Founder-mandatory supersede (2026-05-03):
  Coffee (`~/.claude/state/bishop_coffee.md`) is now the SOLE authoritative
  source for the next-session BP number. .docx files in LianaBanyanKNIGHT/
  are Founder personal write-scratch and MUST NOT drive session detection.
  See feedback_trust_coffee_ignore_docx_session_detect_bp022.md.
  Founder direct: "TRUST THE COFFEE. it is ALWAYS RIGHT."

SR-017 ratification (BP037): next-BP detection is now code-enforced via a
3-step cascade. BP*.docx scanning for next-BP is permanently disabled.
  Priority 1: ~/.claude/state/bishop_next_bp.txt  (single line "BPNNN")
  Priority 2: Latest bishop_coffee.md.bpNNN_*_to_bpMMM  line 2 <!-- NEXT_BP: BPNNN -->
  Priority 3: Latest bishop_coffee.md.bpNNN_*_to_bpMMM  filename dest-number
  Genesis:    All sources missing → "UNKNOWN — ASK FOUNDER"
  Conflict:   txt vs Coffee header disagree → Coffee wins (BP022 trust-the-coffee).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional, Tuple

CODECOPY_DIR = Path("C:/Users/Administrator/Documents/LianaBanyanKNIGHT")

# SR-017 Priority 1: bishop_next_bp.txt — single line "BPNNN"
NEXT_BP_TXT_PATH = Path.home() / ".claude" / "state" / "bishop_next_bp.txt"

# SR-017 Priority 2 + 3: versioned Coffee files in ~/.claude/state/
COFFEE_STATE_DIR = Path.home() / ".claude" / "state"
# Matches: bishop_coffee.md.bpNNN_*_to_bpMMM
_VERSIONED_COFFEE_RE = re.compile(
    r"^bishop_coffee\.md\.bp(\d{3,4})_.*_to_bp(\d{3,4})$",
    re.IGNORECASE,
)
# Matches line 2 marker: <!-- NEXT_BP: BPNNN -->
_COFFEE_HEADER_NEXT_BP_RE = re.compile(
    r"<!--\s*NEXT_BP:\s*BP(\d{3,4})\s*-->",
    re.IGNORECASE,
)

# BP022 legacy path (flat bishop_coffee.md, pre-SR-017 format) — kept for reference
COFFEE_PATH = Path.home() / ".claude" / "state" / "bishop_coffee.md"
# Pre-SR-017 pattern in flat Coffee ("BPNNN (opens fresh next)") — no longer primary
COFFEE_NEXT_BP_PATTERN = re.compile(r"BP(\d{3,4})\s*\(opens\b", re.IGNORECASE)

# KN059: BP<NNN>.docx is the preferred BP005 format (codecopy file detection only)
BP_DOCX_PATTERN = re.compile(r"^BP(\d{3,4})\.docx$", re.IGNORECASE)
# Legacy format — still scanned as fallback for file detection
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


def _find_latest_versioned_coffee(coffee_dir: Path) -> Optional[Path]:
    """
    Find the latest bishop_coffee.md.bpNNN_*_to_bpMMM file in coffee_dir.

    'Latest' = highest destination-BP number (MMM). Tie-breaks by mtime.
    Brick Wall: never raises.
    """
    try:
        if not coffee_dir.exists():
            return None
        candidates = []
        for f in coffee_dir.iterdir():
            m = _VERSIONED_COFFEE_RE.match(f.name)
            if m:
                dest_bp = int(m.group(2))
                candidates.append((dest_bp, f.stat().st_mtime, f))
        if not candidates:
            return None
        candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
        return candidates[0][2]
    except Exception:  # noqa: BLE001
        return None


def compute_next_bp_from_txt(txt_path: Path = NEXT_BP_TXT_PATH) -> Optional[int]:
    """
    SR-017 Priority 1: parse next-BP from bishop_next_bp.txt.

    File format: single line "BPNNN" (case-insensitive, optional trailing newline).
    Brick Wall: never raises — returns None on any parse failure.
    """
    try:
        if not txt_path.exists():
            return None
        text = txt_path.read_text(encoding="utf-8", errors="replace").strip()
        m = re.match(r"^BP(\d{3,4})$", text, re.IGNORECASE)
        if m:
            return int(m.group(1))
        return None
    except Exception:  # noqa: BLE001
        return None


def compute_next_bp_from_coffee_header(coffee_dir: Path = COFFEE_STATE_DIR) -> Optional[int]:
    """
    SR-017 Priority 2: parse next-BP from line 2 of the latest versioned Coffee file.

    Expected line 2 format: <!-- NEXT_BP: BPNNN -->
    Brick Wall: never raises — returns None on any parse failure.
    """
    try:
        f = _find_latest_versioned_coffee(coffee_dir)
        if f is None:
            return None
        lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        if len(lines) < 2:
            return None
        m = _COFFEE_HEADER_NEXT_BP_RE.search(lines[1])
        if m:
            return int(m.group(1))
        return None
    except Exception:  # noqa: BLE001
        return None


def compute_next_bp_from_coffee_filename(coffee_dir: Path = COFFEE_STATE_DIR) -> Optional[int]:
    """
    SR-017 Priority 3: extract dest-BP number from latest versioned Coffee filename.

    Pattern: bishop_coffee.md.bpNNN_*_to_bpMMM — extracts MMM.
    Brick Wall: never raises — returns None on any parse failure.
    """
    try:
        f = _find_latest_versioned_coffee(coffee_dir)
        if f is None:
            return None
        m = _VERSIONED_COFFEE_RE.match(f.name)
        if m:
            return int(m.group(2))
        return None
    except Exception:  # noqa: BLE001
        return None


def compute_next_bp_from_coffee(coffee_path: Path = COFFEE_PATH) -> Optional[int]:
    """
    Legacy BP022 parser: reads flat bishop_coffee.md for "BPNNN (opens fresh next)".

    Retained for backward compatibility. Not used in SR-017 cascade.
    Prefer compute_next_bp_from_coffee_header() for post-SR-017 sessions.
    Brick Wall: never raises.
    """
    try:
        if not coffee_path.exists():
            return None
        text = coffee_path.read_text(encoding="utf-8", errors="replace")
        m = COFFEE_NEXT_BP_PATTERN.search(text)
        if m:
            return int(m.group(1))
        return None
    except Exception:  # noqa: BLE001
        return None


def compute_next_bp_full(
    directory: Path = CODECOPY_DIR,
    coffee_dir: Path = COFFEE_STATE_DIR,
    txt_path: Path = NEXT_BP_TXT_PATH,
) -> dict:
    """
    SR-017 3-step cascade for next-BP detection.

    Returns {value, source, conflict_drift, display}
      value:          int or None
      source:         'bishop_next_bp_txt' | 'coffee_header' |
                      'coffee_header_conflict_resolution' | 'coffee_filename' | 'none'
      conflict_drift: None or {txt_says, coffee_says, resolution, message}
      display:        'BPNNN' string or 'UNKNOWN — ASK FOUNDER'

    BP*.docx files are NEVER used for next-BP detection (SR-017/BP022 supersede).
    Conflict (txt vs Coffee header): Coffee wins per BP022 trust-the-coffee canon.
    Genesis (all sources missing): value=None, display='UNKNOWN — ASK FOUNDER'.
    """
    txt_value = compute_next_bp_from_txt(txt_path)
    coffee_header_value = compute_next_bp_from_coffee_header(coffee_dir)
    coffee_filename_value = compute_next_bp_from_coffee_filename(coffee_dir)

    # Conflict: (1) and (2) present but disagree → Coffee wins
    if (
        txt_value is not None
        and coffee_header_value is not None
        and txt_value != coffee_header_value
    ):
        conflict_drift = {
            "txt_says": f"BP{txt_value:03d}",
            "coffee_says": f"BP{coffee_header_value:03d}",
            "resolution": "coffee_wins",
            "message": (
                f"bishop_next_bp.txt says BP{txt_value:03d} but Coffee header says "
                f"BP{coffee_header_value:03d} — Coffee wins per BP022 trust-the-coffee canon."
            ),
        }
        return {
            "value": coffee_header_value,
            "source": "coffee_header_conflict_resolution",
            "conflict_drift": conflict_drift,
            "display": f"BP{coffee_header_value:03d}",
        }

    # Normal cascade — no conflict
    if txt_value is not None:
        return {
            "value": txt_value,
            "source": "bishop_next_bp_txt",
            "conflict_drift": None,
            "display": f"BP{txt_value:03d}",
        }
    if coffee_header_value is not None:
        return {
            "value": coffee_header_value,
            "source": "coffee_header",
            "conflict_drift": None,
            "display": f"BP{coffee_header_value:03d}",
        }
    if coffee_filename_value is not None:
        return {
            "value": coffee_filename_value,
            "source": "coffee_filename",
            "conflict_drift": None,
            "display": f"BP{coffee_filename_value:03d}",
        }

    # Genesis: all sources missing — R0 BEDROCK: do NOT fabricate
    return {
        "value": None,
        "source": "none",
        "conflict_drift": None,
        "display": "UNKNOWN — ASK FOUNDER",
    }


def compute_next_bp_number(
    directory: Path = CODECOPY_DIR,
    coffee_dir: Path = COFFEE_STATE_DIR,
    txt_path: Path = NEXT_BP_TXT_PATH,
) -> Optional[int]:
    """
    Return the next-in-sequence BP number for the current session.

    SR-017 PRIORITY ORDER (BP037 ratified):
      1. bishop_next_bp.txt  — single line 'BPNNN'
      2. Latest bishop_coffee.md.bpNNN_*_to_bpMMM  line 2: <!-- NEXT_BP: BPNNN -->
      3. Latest bishop_coffee.md.bpNNN_*_to_bpMMM  filename dest-number
    BP*.docx files are NEVER used for next-BP detection (SR-017/BP022 supersede).
    The `directory` param is retained for API backward compatibility only.
    Conflict (1 vs 2): Coffee wins. Genesis (all missing): returns None.

    See compute_next_bp_full() for source/conflict metadata.
    """
    return compute_next_bp_full(directory, coffee_dir, txt_path)["value"]


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
    coffee_dir: Path = COFFEE_STATE_DIR,
    txt_path: Path = NEXT_BP_TXT_PATH,
) -> dict:
    """
    High-level summary for Vine Landing Receipt integration.

    Returns:
      status, path, file_name, chunk_count, ask_founder_prompt,
      next_bp_number, next_bp_display, next_bp_source, next_bp_conflict_drift

    next_bp_display is the authoritative string for display ("BPNNN" or
    "UNKNOWN — ASK FOUNDER"). next_bp_number is the int value (or None).
    """
    path, status = detect_latest_codecopy(directory, after_ts)
    bp_full = compute_next_bp_full(directory, coffee_dir, txt_path)

    bp_base = {
        "next_bp_number": bp_full["value"],
        "next_bp_display": bp_full["display"],
        "next_bp_source": bp_full["source"],
        "next_bp_conflict_drift": bp_full["conflict_drift"],
    }

    if status == "missing" or path is None:
        return {
            "status": "missing",
            "path": None,
            "file_name": None,
            "chunk_count": 0,
            "ask_founder_prompt": (
                "No BP*.docx or BishopClaudeCode*.txt files found in codecopy directory."
            ),
            **bp_base,
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
            **bp_base,
        }
    chunks = read_codecopy_chunked(path)
    return {
        "status": "found",
        "path": str(path),
        "file_name": path.name,
        "chunk_count": len(chunks),
        "ask_founder_prompt": None,
        **bp_base,
    }
