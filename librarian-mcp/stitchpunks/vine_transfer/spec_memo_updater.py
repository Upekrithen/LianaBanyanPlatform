"""
Component 11 — Spec Memo Auto-Updater (KN023)

Appends new Prov 16 candidates to the Bishop-2 K-Prov-16 spec memo.
Produces updated paste-ready version. Idempotent (re-running adds no
duplicate candidates if already present).
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

_SPEC_MEMO_GLOB = "K-PROV-16*spec*.md"
_SPEC_MEMO_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/BISHOP_DROPZONE/03_BishopHandoffs"
)

_CANDIDATE_SECTION_RE = re.compile(
    r"(#+\s*Prov\.?\s*16\s*Candidates.*?)(?=#+|\Z)",
    re.DOTALL | re.IGNORECASE,
)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")[:19] + "Z"


def find_spec_memo(spec_memo_dir: Path = _SPEC_MEMO_DIR) -> Optional[Path]:
    """Find the Prov 16 spec memo file."""
    if not spec_memo_dir.exists():
        return None
    matches = list(spec_memo_dir.glob(_SPEC_MEMO_GLOB))
    if not matches:
        # Also try in subdirectories
        matches = list(spec_memo_dir.rglob(_SPEC_MEMO_GLOB))
    return matches[0] if matches else None


def get_existing_candidates(content: str) -> list[str]:
    """Extract existing candidate names from spec memo."""
    candidates = []
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith(("-", "*", "•")):
            candidates.append(stripped.lstrip("-*• ").strip())
    return candidates


def append_candidates(
    new_candidates: list[str],
    spec_memo_path: Optional[Path] = None,
    spec_memo_dir: Path = _SPEC_MEMO_DIR,
    dry_run: bool = False,
) -> dict:
    """
    Append new Prov 16 candidates to spec memo.
    Skips duplicates. Idempotent.

    Returns {updated, added_count, skipped_count, memo_path, dry_run}
    """
    if spec_memo_path is None:
        spec_memo_path = find_spec_memo(spec_memo_dir)

    if spec_memo_path is None or not spec_memo_path.exists():
        return {
            "updated": False,
            "added_count": 0,
            "skipped_count": 0,
            "memo_path": None,
            "dry_run": dry_run,
            "note": "Spec memo not found — no update performed",
        }

    content = spec_memo_path.read_text(encoding="utf-8")
    existing = get_existing_candidates(content)
    existing_lower = {c.lower() for c in existing}

    to_add = [c for c in new_candidates if c.lower() not in existing_lower]
    to_skip = [c for c in new_candidates if c.lower() in existing_lower]

    if not to_add:
        return {
            "updated": False,
            "added_count": 0,
            "skipped_count": len(to_skip),
            "memo_path": str(spec_memo_path),
            "dry_run": dry_run,
            "note": "All candidates already present",
        }

    if dry_run:
        return {
            "updated": False,
            "added_count": len(to_add),
            "skipped_count": len(to_skip),
            "memo_path": str(spec_memo_path),
            "dry_run": True,
            "note": f"Would add {len(to_add)} candidates: {to_add}",
        }

    # Append candidates with timestamp
    addition = f"\n\n### Auto-appended {_iso_now()} (Vine Transfer KN023)\n"
    for c in to_add:
        addition += f"- {c}\n"

    new_content = content.rstrip() + addition
    spec_memo_path.write_text(new_content, encoding="utf-8")

    return {
        "updated": True,
        "added_count": len(to_add),
        "skipped_count": len(to_skip),
        "memo_path": str(spec_memo_path),
        "dry_run": False,
        "note": f"Added {len(to_add)} candidates, skipped {len(to_skip)} duplicates",
    }
