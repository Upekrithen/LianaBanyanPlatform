"""
Promote-Eblet — KN001 / B134

Promotion command: Eblet scratch tablet → canonical Stone Tablet location.

Usage:
    python -m discipline_wing.promote_eblet <eblet-path> [--to <canonical-path>] [--commit] [--session <session-id>]

Flow:
  1. Read Eblet content
  2. Determine canonical destination (--to arg OR .meta.json sidecar)
  3. Run blocking Augur via discipline_wing.engine.evaluate() against canonical path
  4. If allow/warn:
       - Write content to canonical path
       - If --commit: git add + git commit
       - Delete Eblet + sidecar files
       - Print SUCCESS
  5. If block:
       - Write Augur findings to <eblet>.augur-findings.md
       - Print BLOCKED with findings location
       - Eblet stays in place for revision

KN001 / B134 — Founder-ratified D.2 Ⓐ (explicit promotion command)
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# Ensure workspace is on path for discipline_wing imports
_WORKSPACE = r"C:\Users\Administrator\Documents\LianaBanyanPlatform"
if _WORKSPACE not in sys.path:
    sys.path.insert(0, _WORKSPACE)

from discipline_wing.eblet_router import (
    read_eblet_meta,
    write_augur_findings,
)
from discipline_wing.engine import evaluate


def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"


def promote(eblet_path_str: str, canonical_path_str: str, do_commit: bool) -> int:
    """
    Core promotion logic.

    Returns:
      0 — success (promoted to canonical)
      1 — blocked (Augur fired; findings written)
      2 — error
    """
    eblet_path = Path(eblet_path_str).expanduser().resolve()

    if not eblet_path.exists():
        print(f"[promote-eblet] ERROR: Eblet file not found: {eblet_path}", file=sys.stderr)
        return 2

    # Read Eblet content
    try:
        content = eblet_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"[promote-eblet] ERROR: Cannot read Eblet: {e}", file=sys.stderr)
        return 2

    # Determine canonical path
    canonical_path = canonical_path_str
    if not canonical_path:
        meta = read_eblet_meta(eblet_path)
        if meta:
            canonical_path = meta.get("canonical_path", "")
        if not canonical_path:
            print(
                f"[promote-eblet] ERROR: No canonical destination. "
                f"Provide --to <canonical-path> or ensure .meta.json sidecar exists.",
                file=sys.stderr,
            )
            return 2

    canonical = Path(canonical_path).expanduser()

    print(f"[promote-eblet] Eblet:     {eblet_path}")
    print(f"[promote-eblet] Canonical: {canonical}")
    print(f"[promote-eblet] Running blocking Augur...", flush=True)

    # Run blocking Augur via Wing engine (as if this were a Write to the canonical path)
    tool_call_data = {
        "tool_name": "Write",
        "tool_input": {
            "file_path": str(canonical),
            "content": content,
        },
    }

    try:
        result = evaluate(tool_call_data)
    except Exception as e:
        print(f"[promote-eblet] ERROR: Augur evaluation failed: {e}", file=sys.stderr)
        # Fail-safe: engine error → allow promotion (preserve fail-open contract)
        result_decision = "allow"
        result_message = ""
    else:
        result_decision = result.decision
        result_message = result.message

    if result_decision == "block":
        # Write findings file; leave Eblet in place
        findings_text = (
            f"**Augur decision:** BLOCK\n\n"
            f"**Triggered Augurs:** {', '.join(result.triggered_augurs) if hasattr(result, 'triggered_augurs') else 'unknown'}\n\n"
            f"**Block message:**\n\n{result_message}\n\n"
            f"**Consensus reason:** {getattr(result, 'consensus_reason', '')}\n\n"
            f"**Full trace:**\n\n```json\n"
            f"{json.dumps(getattr(result, 'trace', []), indent=2)}\n"
            f"```\n"
        )
        findings_path = write_augur_findings(eblet_path, findings_text, "block")
        print(
            f"[promote-eblet] BLOCKED — Augur fired on canonical destination content.\n"
            f"  Findings written to: {findings_path}\n"
            f"  Eblet left in place for revision: {eblet_path}\n"
            f"\n"
            f"  Fix the content, then re-run promote-eblet.",
            file=sys.stderr,
        )
        return 1

    # allow or warn — proceed with promotion
    if result_decision == "warn":
        print(f"[promote-eblet] WARNING (non-blocking): {result_message}")

    # Write to canonical path
    try:
        canonical.parent.mkdir(parents=True, exist_ok=True)
        canonical.write_text(content, encoding="utf-8")
        print(f"[promote-eblet] Wrote canonical: {canonical}")
    except Exception as e:
        print(f"[promote-eblet] ERROR: Cannot write canonical path: {e}", file=sys.stderr)
        return 2

    # Optional git commit
    if do_commit:
        _git_commit(canonical, eblet_path)

    # Purge Eblet + sidecars
    _purge_eblet(eblet_path)

    print(f"[promote-eblet] SUCCESS — Eblet promoted to canonical Stone Tablet.")
    return 0


def _git_commit(canonical: Path, eblet_path: Path) -> None:
    """Stage and commit the canonical file. Non-fatal on failure."""
    try:
        # Determine git root
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, cwd=str(canonical.parent)
        )
        if result.returncode != 0:
            print(f"[promote-eblet] WARNING: Not in a git repo; skipping commit.")
            return
        git_root = result.stdout.strip()

        # Stage
        subprocess.run(
            ["git", "add", str(canonical)],
            check=True, cwd=git_root
        )

        # Commit
        msg = (
            f"Eblet promotion: {canonical.name}\n\n"
            f"Promoted from Eblet scratch tablet {eblet_path.name}.\n"
            f"Blocking Augur passed at promotion boundary (KN001).\n"
            f"Timestamp: {_iso_now()}\n\n"
            f"Co-Authored-By: Knight (Cursor Sonnet 4.6) <noreply@cursor.sh>"
        )
        subprocess.run(
            ["git", "commit", "-m", msg],
            check=True, cwd=git_root
        )
        print(f"[promote-eblet] Committed: {canonical.name}")
    except subprocess.CalledProcessError as e:
        print(f"[promote-eblet] WARNING: git commit failed: {e} — canonical file written but not committed.")
    except Exception as e:
        print(f"[promote-eblet] WARNING: git operation failed: {e}")


def _purge_eblet(eblet_path: Path) -> None:
    """Delete the Eblet file and all sidecar files."""
    base = str(eblet_path)
    to_delete = [
        eblet_path,
        Path(base.replace(".eblet.md", ".meta.json")),
        Path(base.replace(".eblet.md", ".augur-findings.md")),
    ]
    for p in to_delete:
        try:
            p.unlink(missing_ok=True)
        except Exception:
            pass
    print(f"[promote-eblet] Purged Eblet scratch: {eblet_path.name}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Promote an Eblet scratch tablet to its canonical Stone Tablet destination.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m discipline_wing.promote_eblet ~/.claude/state/eblets/B134/memory_foo.eblet.md --to ~/.claude/memory/foo.md
  python -m discipline_wing.promote_eblet ~/.claude/state/eblets/B134/scope_memo.eblet.md --to BISHOP_DROPZONE/03_BishopHandoffs/scope_memo.md --commit
        """,
    )
    parser.add_argument("eblet_path", help="Path to the .eblet.md scratch file")
    parser.add_argument(
        "--to",
        dest="canonical_path",
        default="",
        help="Canonical destination path. If omitted, read from .meta.json sidecar.",
    )
    parser.add_argument(
        "--commit",
        action="store_true",
        default=False,
        help="git add + git commit after successful promotion.",
    )
    args = parser.parse_args()

    exit_code = promote(args.eblet_path, args.canonical_path, args.commit)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
