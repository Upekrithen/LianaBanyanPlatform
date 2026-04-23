"""
Shared helpers for letter_drafted / letter_locked / letter_dispatched predicates.

Centralises:
- Ledger event scanning by event_type + recipient
- Recipient name normalisation and fuzzy matching
- letters.json loading (gracefully handles its absence)
- BISHOP_DROPZONE/00_FOUNDER_REVIEW file scan with disambiguation

Introduced for K442 — 3-state letter predicate refactor (B117).
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Iterable

TOUCHSTONE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = TOUCHSTONE_DIR.parents[1]
LEDGER_PATH = TOUCHSTONE_DIR / "ledger.jsonl"
LETTERS_JSON_PATH = REPO_ROOT / "librarian-mcp" / "letters.json"
FOUNDER_REVIEW_DIR = REPO_ROOT / "BISHOP_DROPZONE" / "00_FOUNDER_REVIEW"
LETTERS_DIRS = [
    FOUNDER_REVIEW_DIR,
    REPO_ROOT / "BISHOP_DROPZONE" / "00_FOUNDER_APPROVED",
    REPO_ROOT / "BISHOP_DROPZONE" / "06_Letters",
]

# Recipients whose last name alone is ambiguous in this corpus.
# Matching MUST require a token from the full name as well as the last name.
AMBIGUOUS_LAST_NAMES = {
    "scholz",   # Trebor Scholz vs Olaf Scholz
    "gates",    # Bill Gates vs Melinda French Gates
    "scott",    # MacKenzie Scott vs Adam Scott (etc.)
    "khan",     # Sal Khan vs Lina Khan vs Imran Khan
    "simon",    # Tom Simon vs Fred Simon
    "jin",      # generic
    "marx",     # Paris Marx (avoid Karl-collisions in any future copy)
}


def _normalise(s: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace/underscores into single space."""
    if not s:
        return ""
    s = s.lower()
    s = re.sub(r"[_\-./\\]+", " ", s)
    s = re.sub(r"[^a-z0-9\s]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def recipient_tokens(name: str) -> list[str]:
    """Return non-trivial tokens of a recipient name (length >= 2, dropping common particles)."""
    drop = {"de", "la", "del", "van", "von", "the", "and", "of"}
    return [t for t in _normalise(name).split() if len(t) >= 2 and t not in drop]


def recipient_matches(target: str, candidate: str) -> bool:
    """
    Symmetric fuzzy match between two recipient strings.

    Strategy:
    - Both sides normalised and tokenised.
    - All tokens of the SHORTER side must appear in the LONGER side.
    - If the only shared token is an ambiguous last name (e.g. 'scholz'),
      require at least one additional shared token to disambiguate.
    """
    t = recipient_tokens(target)
    c = recipient_tokens(candidate)
    if not t or not c:
        return False

    short, long_ = (t, c) if len(t) <= len(c) else (c, t)
    shared = [tok for tok in short if tok in long_]
    if not shared or len(shared) < len(short):
        return False

    if len(shared) == 1 and shared[0] in AMBIGUOUS_LAST_NAMES:
        # Single-token ambiguous match — refuse.
        return False
    return True


def filename_matches_recipient(filename: str, recipient: str) -> bool:
    """
    Extract recipient-like substrings from a filename and test against the recipient.

    A filename like 'CROWN_LETTER_TREBOR_SCHOLZ_SEC_FIXED_V14.md' contains
    'TREBOR SCHOLZ' once normalised. We test the whole stem; the same matching
    rule (all short-side tokens present, ambiguous-last-name guard) applies.
    """
    stem = Path(filename).stem
    return recipient_matches(recipient, stem)


def load_letters_json() -> dict:
    """Load librarian-mcp/letters.json. Returns {} when absent or malformed."""
    if not LETTERS_JSON_PATH.exists():
        return {}
    try:
        return json.loads(LETTERS_JSON_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def find_recipient_entry(letters_data: dict, recipient: str) -> tuple[str, dict] | tuple[None, None]:
    """
    Locate the recipient entry in letters.json. Supports several plausible shapes:
      {"<recipient>": {"status": "..."}}
      {"by_recipient": {"<recipient>": {...}}}
      {"letters": [{"recipient": "...", "status": "..."}, ...]}
    Returns (key_or_recipient, entry_dict) or (None, None).
    """
    if not letters_data:
        return None, None

    # Shape 1: direct top-level mapping
    for key, val in letters_data.items():
        if not isinstance(val, dict):
            continue
        if recipient_matches(recipient, key) or recipient_matches(recipient, val.get("recipient", "")):
            return key, val

    # Shape 2: by_recipient nested
    by_r = letters_data.get("by_recipient")
    if isinstance(by_r, dict):
        for key, val in by_r.items():
            if not isinstance(val, dict):
                continue
            if recipient_matches(recipient, key) or recipient_matches(recipient, val.get("recipient", "")):
                return key, val

    # Shape 3: list under "letters"
    arr = letters_data.get("letters")
    if isinstance(arr, list):
        for entry in arr:
            if not isinstance(entry, dict):
                continue
            if recipient_matches(recipient, entry.get("recipient", "")):
                return entry.get("recipient", ""), entry

    return None, None


def iter_ledger_events(event_type: str | None = None,
                      recipient: str | None = None) -> Iterable[dict]:
    """
    Yield events from ledger.jsonl, filtered by event_type and (fuzzy) recipient.

    A recipient filter matches against details.recipient_name OR
    details.letter_recipient (case-insensitive, ambiguous-last-name aware).
    """
    if not LEDGER_PATH.exists():
        return
    for line in LEDGER_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event_type and entry.get("event_type") != event_type:
            continue
        if recipient:
            details = entry.get("details", {}) or {}
            cand = details.get("recipient_name") or details.get("letter_recipient") or ""
            if not cand or not recipient_matches(recipient, cand):
                continue
        yield entry


def latest_event(event_type: str, recipient: str) -> dict | None:
    """Return the most-recent event of `event_type` for `recipient`, or None."""
    last = None
    for entry in iter_ledger_events(event_type, recipient):
        last = entry
    return last


def parse_iso(ts: str) -> datetime | None:
    """Parse an ISO-8601 timestamp leniently. Returns None on failure."""
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def find_drafted_letter_files(recipient: str,
                              search_dirs: list[Path] | None = None) -> list[Path]:
    """
    Walk search_dirs (default: BISHOP_DROPZONE letter folders) and return all
    files whose filename matches the recipient under the disambiguation rule.
    """
    dirs = search_dirs if search_dirs is not None else LETTERS_DIRS
    matches: list[Path] = []
    seen: set[Path] = set()
    for base in dirs:
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if not p.is_file():
                continue
            # Letter content files only — skip task / prompt scaffolding.
            name = p.name.upper()
            if name.startswith("PROMPT_") or name.startswith("TOUCHSTONE_"):
                continue
            if p.suffix.lower() not in {".md", ".txt", ".pdf", ".html"}:
                continue
            if filename_matches_recipient(p.name, recipient) and p not in seen:
                matches.append(p)
                seen.add(p)
    return matches
