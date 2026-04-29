#!/usr/bin/env python3
"""
Wrasse Registry v1 → v2 Migration — K-Wrasse-Wiring-Hardening / B133

Adds `last_verified_ts` and `verification_count` fields to any entry that
lacks them (baseline values for mechanical completeness — not a substantive
verification claim).

Stone Tablet Imperative: Does NOT edit the registry in-place.
- Reads: wrasse_registry.jsonl  (v1)
- Writes: wrasse_registry_v2.jsonl  (verified alongside)
- Renames on confirmed v2 integrity: v1 → wrasse_registry_v1_backup.jsonl,
  v2 → wrasse_registry.jsonl

Usage:
    python migrate_v1_v2.py [--dry-run]
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

WRASSE_DIR = Path(__file__).parent
V1_PATH = WRASSE_DIR / "wrasse_registry.jsonl"
V2_PATH = WRASSE_DIR / "wrasse_registry_v2.jsonl"
V1_BACKUP_PATH = WRASSE_DIR / "wrasse_registry_v1_backup.jsonl"

BASELINE_TS = "2026-04-29T00:00:00Z"
BASELINE_VERIFICATION_COUNT = 1


def migrate(dry_run: bool = False) -> dict:
    """
    Run the v1→v2 migration.

    Returns a summary dict with: total, already_had_both, patched, errors.
    """
    if not V1_PATH.exists():
        print(f"[migrate] ERROR: Source file not found: {V1_PATH}")
        sys.exit(1)

    rows_out = []
    stats = {"total": 0, "header": 0, "already_had_both": 0, "patched": 0, "errors": 0}

    with open(V1_PATH, "r", encoding="utf-8") as fh:
        for lineno, raw in enumerate(fh, 1):
            raw = raw.strip()
            if not raw:
                continue
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError as exc:
                print(f"[migrate] WARN line {lineno}: JSON decode error — {exc}; skipping")
                stats["errors"] += 1
                continue

            if obj.get("type") == "header":
                rows_out.append(obj)
                stats["header"] += 1
                continue

            stats["total"] += 1
            patched = False

            if "last_verified_ts" not in obj:
                obj["last_verified_ts"] = BASELINE_TS
                patched = True

            if "verification_count" not in obj:
                obj["verification_count"] = BASELINE_VERIFICATION_COUNT
                patched = True

            if patched:
                stats["patched"] += 1
            else:
                stats["already_had_both"] += 1

            rows_out.append(obj)

    # Verify every non-header entry now has both fields
    missing = [
        r.get("trigger_id", "?")
        for r in rows_out
        if r.get("type") != "header"
        and ("last_verified_ts" not in r or "verification_count" not in r)
    ]
    if missing:
        print(f"[migrate] ERROR: Post-migration verification failed for: {missing}")
        sys.exit(1)

    print(f"[migrate] Summary: {stats}")
    print(f"[migrate] v2 row count: {len(rows_out)} ({stats['header']} header + {stats['total']} entries)")
    print(f"[migrate] Patched: {stats['patched']} / Already complete: {stats['already_had_both']}")

    if dry_run:
        print("[migrate] DRY-RUN — no files written.")
        return stats

    # Write v2 alongside v1
    with open(V2_PATH, "w", encoding="utf-8") as fh:
        for obj in rows_out:
            fh.write(json.dumps(obj, ensure_ascii=False) + "\n")
    print(f"[migrate] Wrote {V2_PATH}")

    # Final integrity check on written file
    written_count = 0
    with open(V2_PATH, "r", encoding="utf-8") as fh:
        for raw in fh:
            raw = raw.strip()
            if not raw:
                continue
            obj = json.loads(raw)
            if obj.get("type") != "header":
                written_count += 1
    if written_count != stats["total"]:
        print(f"[migrate] ERROR: Written count mismatch: expected {stats['total']}, got {written_count}")
        sys.exit(1)

    # Rename v1 → backup, v2 → canonical
    V1_PATH.rename(V1_BACKUP_PATH)
    V2_PATH.rename(V1_PATH)
    print(f"[migrate] Renamed {V1_PATH.name} → {V1_BACKUP_PATH.name}")
    print(f"[migrate] Renamed {V2_PATH.name} → {V1_PATH.name}")
    print("[migrate] Migration complete.")

    return stats


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    result = migrate(dry_run=dry_run)
    if result["errors"] > 0:
        sys.exit(1)
