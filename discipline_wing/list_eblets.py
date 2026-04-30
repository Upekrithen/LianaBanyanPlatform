"""
List-Eblets — KN001 / B134

CLI tool: list all pending Eblet scratch tablets awaiting promotion.

Usage:
    python -m discipline_wing.list_eblets [--session <session-id>] [--json]

Output:
    Table of pending Eblets with: session, eblet file, canonical destination, age

KN001 / B134
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_WORKSPACE = r"C:\Users\Administrator\Documents\LianaBanyanPlatform"
if _WORKSPACE not in sys.path:
    sys.path.insert(0, _WORKSPACE)

from discipline_wing.eblet_router import list_pending_eblets, get_eblet_root, cleanup_stale_eblets


def main() -> None:
    parser = argparse.ArgumentParser(
        description="List pending Eblet scratch tablets awaiting promotion.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m discipline_wing.list_eblets
  python -m discipline_wing.list_eblets --session B134
  python -m discipline_wing.list_eblets --json
  python -m discipline_wing.list_eblets --cleanup-stale
        """,
    )
    parser.add_argument("--session", default="", help="Filter by session ID (e.g. B134)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument(
        "--cleanup-stale",
        action="store_true",
        help="Delete Eblets older than auto_cleanup_days (from eblet_config.json)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="With --cleanup-stale: show what would be deleted without deleting",
    )
    args = parser.parse_args()

    eblet_root = get_eblet_root()

    if args.cleanup_stale:
        removed = cleanup_stale_eblets(dry_run=args.dry_run)
        if not removed:
            print("[list-eblets] No stale Eblets found.")
        else:
            label = "Would remove" if args.dry_run else "Removed"
            for p in removed:
                print(f"  {label}: {p}")
            print(f"[list-eblets] {label} {len(removed)} stale Eblet(s).")
        return

    eblets = list_pending_eblets(session_id=args.session or None)

    if not eblets:
        scope = f" for session {args.session}" if args.session else ""
        print(f"[list-eblets] No pending Eblets found{scope}.")
        print(f"  Eblet root: {eblet_root}")
        return

    if args.json:
        print(json.dumps(eblets, indent=2))
        return

    # Human-readable table
    print(f"\n{'─'*80}")
    print(f"  PENDING EBLETS — {len(eblets)} file(s)  [root: {eblet_root}]")
    print(f"{'─'*80}")

    col_w = 36  # eblet filename column width
    for e in eblets:
        eblet_name = Path(e["eblet_path"]).name
        canonical = e["canonical_path"]
        session = e["session_id"]
        age = e["age_days"]
        age_str = f"{age:.1f}d" if age < 1 else f"{age:.0f}d"

        # Truncate long paths for display
        if len(canonical) > 60:
            canonical = "..." + canonical[-57:]

        print(f"  [{session}] {eblet_name:<{col_w}} → {canonical}")
        print(f"  {'':>{len(session)+3}} Age: {age_str}   Created: {e['created_iso']}")
        print()

    print(f"{'─'*80}")
    print(
        f"  To promote: python -m discipline_wing.promote_eblet <eblet-path> --to <canonical-path>"
    )
    print(f"{'─'*80}\n")


if __name__ == "__main__":
    main()
