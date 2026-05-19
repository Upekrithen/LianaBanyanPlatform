"""
Prerequisite Context Builder — KN-R2 / BP018
=============================================
Reads commits + test reports for prerequisite K-prompt entries.
Produces a summary string that becomes PreparedContext.prerequisite_context_summary.

Composes with:
  - KN-R1 k_prompt_parser — parsed manifest provides prerequisite_tags
  - Pod-Q OnDeckScribe    — queue entries provide commit_hash for landed prereqs
  - git log + test report files
"""

from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]


def build_prerequisite_context(
    prerequisite_entry_ids: list[str],
    prerequisite_tags: list[str],
    repo_root: Optional[Path] = None,
) -> str:
    """
    Build a textual summary of:
      1. Git commits for each prerequisite tag
      2. Test report files mentioning each entry_id
    Returns a markdown summary string.
    """
    repo = repo_root or WORKSPACE_ROOT
    parts: list[str] = []

    # Git commit summaries for prerequisite tags
    if prerequisite_tags:
        parts.append("### Prerequisite Git Commits")
        for tag in prerequisite_tags:
            commit_summary = _git_commit_summary(tag, repo)
            parts.append(f"- `{tag}`: {commit_summary}")

    # Pod-Q queue state for landed prerequisites
    if prerequisite_entry_ids:
        parts.append("\n### Prerequisite Queue State")
        queue_path = Path.home() / ".claude" / "state" / "on_deck_scribe" / "queue.jsonl"
        landed = _read_landed_entries(queue_path, prerequisite_entry_ids)
        for entry_id, status, commit_hash in landed:
            parts.append(f"- `{entry_id}`: status={status}" + (f" commit={commit_hash}" if commit_hash else ""))

    if not parts:
        parts.append("No prerequisite context available.")

    return "\n".join(parts)


def _git_commit_summary(sha_or_tag: str, repo: Path) -> str:
    """Run git show --oneline for a SHA/tag. Returns summary string."""
    try:
        result = subprocess.run(
            ["git", "show", "--oneline", "--no-patch", sha_or_tag],
            cwd=str(repo),
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.stdout.strip()[:120] or "no output"
    except Exception as e:
        return f"git error: {e}"


def _read_landed_entries(queue_path: Path, entry_ids: list[str]) -> list[tuple[str, str, Optional[str]]]:
    """Read queue.jsonl and return (entry_id, status, commit_hash) for each entry_id."""
    if not queue_path.exists():
        return []

    # Latest-per-id reduction
    merged: dict[str, dict] = {}
    try:
        for line in queue_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                eid = entry.get("id", "")
                if eid in entry_ids:
                    if eid not in merged:
                        merged[eid] = entry
                    else:
                        merged[eid].update({k: v for k, v in entry.items() if v not in ("", None)})
            except Exception:
                continue
    except Exception:
        return []

    results = []
    for eid in entry_ids:
        if eid in merged:
            e = merged[eid]
            results.append((eid, str(e.get("status", "unknown")), e.get("commit_hash")))
        else:
            results.append((eid, "not_found", None))
    return results
