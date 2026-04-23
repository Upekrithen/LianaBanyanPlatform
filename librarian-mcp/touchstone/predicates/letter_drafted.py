"""
Predicate: letter_drafted
=========================
Passes when a letter file matching the deliverable's recipient exists in the
Founder-review folders (BISHOP_DROPZONE/00_FOUNDER_REVIEW/, _APPROVED/, 06_Letters/).

Args:
    letter_recipient (str): recipient name (e.g. "Trebor Scholz")
    search_dirs (list[str], optional): override search directories (relative to repo root)

Returns standard predicate dict {passed, observed, message}; on pass, `observed`
is the resolved relative file path (the first match wins) and `message` lists
how many candidate files were found.

Disambiguation: ambiguous last names (Scholz, Gates, Scott, Khan, Simon)
require an additional shared token to match — see _letter_helpers.AMBIGUOUS_LAST_NAMES.

Introduced for K442 (B117). Replaces the file-existence heuristic that previously
flagged 45 files in approved-folders as "POSSIBLY COMPLETED".
"""

from pathlib import Path

from ._letter_helpers import (
    REPO_ROOT,
    LETTERS_DIRS,
    find_drafted_letter_files,
)


def check(args: dict) -> dict:
    recipient = args.get("letter_recipient", "")
    if not recipient:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required arg: letter_recipient",
        }

    override_dirs = args.get("search_dirs")
    if isinstance(override_dirs, list):
        dirs = [REPO_ROOT / d for d in override_dirs]
    else:
        dirs = LETTERS_DIRS

    matches = find_drafted_letter_files(recipient, dirs)
    if not matches:
        return {
            "passed": False,
            "observed": 0,
            "message": f"No drafted letter file found for '{recipient}' in Founder-review folders",
        }

    rel = [str(m.relative_to(REPO_ROOT)).replace("\\", "/") for m in matches]
    return {
        "passed": True,
        "observed": rel[0],
        "message": (
            f"Drafted letter for '{recipient}' found at {rel[0]}"
            + (f" (+{len(rel) - 1} additional candidates)" if len(rel) > 1 else "")
        ),
    }
