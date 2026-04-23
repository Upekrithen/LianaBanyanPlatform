"""
B078 hash-duplicate archival helper.

Reads `data/archivist_report.json` hash duplicate groups and moves duplicate files
to `archive/hash_duplicates_b078/`, preserving relative paths.
"""

from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
ARCHIVIST_REPORT = DATA_DIR / "archivist_report.json"
DEST_ROOT = WORKSPACE / "archive" / "hash_duplicates_b078"
MANIFEST_PATH = DATA_DIR / "move_archive_manifest.json"


def choose_keep_path(group: dict) -> str | None:
    keep = (group.get("keep_recommendation") or "").strip()
    if keep:
        return keep
    files = group.get("files") or []
    if not files:
        return None
    files_sorted = sorted(
        files,
        key=lambda f: (
            len(str(f.get("path", "")).split("\\")),
            len(str(f.get("filename", ""))),
            str(f.get("modified", "")),
        ),
        reverse=True,
    )
    return str(files_sorted[0].get("path", "")).strip() or None


def safe_resolve_workspace(path_str: str) -> Path | None:
    rel = path_str.replace("/", "\\").lstrip("\\")
    candidate = (WORKSPACE / rel).resolve()
    try:
        candidate.relative_to(WORKSPACE.resolve())
    except Exception:
        return None
    return candidate


def run() -> dict:
    if not ARCHIVIST_REPORT.exists():
        raise FileNotFoundError(f"Missing report: {ARCHIVIST_REPORT}")

    report = json.loads(ARCHIVIST_REPORT.read_text(encoding="utf-8"))
    groups = report.get("hash_duplicates", [])
    DEST_ROOT.mkdir(parents=True, exist_ok=True)

    moved_files = 0
    skipped_missing = 0
    skipped_keep = 0
    skipped_invalid = 0
    groups_processed = 0
    groups_with_moves = 0
    move_records = []

    for group in groups:
        files = group.get("files") or []
        if len(files) < 2:
            continue
        groups_processed += 1
        keep_path = choose_keep_path(group)
        moved_in_group = 0

        for item in files:
            rel_path = str(item.get("path", "")).strip()
            if not rel_path:
                skipped_invalid += 1
                continue
            if keep_path and rel_path == keep_path:
                skipped_keep += 1
                continue

            src = safe_resolve_workspace(rel_path)
            if not src:
                skipped_invalid += 1
                continue
            if not src.exists():
                skipped_missing += 1
                continue

            dest = (DEST_ROOT / rel_path.replace("/", "\\")).resolve()
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists():
                # Already moved in prior run (idempotent rerun).
                skipped_missing += 1
                continue

            shutil.move(str(src), str(dest))
            moved_files += 1
            moved_in_group += 1
            move_records.append(
                {
                    "hash": group.get("hash"),
                    "from": rel_path,
                    "to": str(dest.relative_to(WORKSPACE)).replace("\\", "/"),
                }
            )

        if moved_in_group > 0:
            groups_with_moves += 1

    summary = {
        "timestamp": datetime.now().isoformat(),
        "phase": "B078_hash_duplicate_archive",
        "groups_total": len(groups),
        "groups_processed": groups_processed,
        "groups_with_moves": groups_with_moves,
        "files_moved": moved_files,
        "skipped_keep": skipped_keep,
        "skipped_missing_or_already_moved": skipped_missing,
        "skipped_invalid": skipped_invalid,
        "destination": str(DEST_ROOT),
    }

    existing = {}
    if MANIFEST_PATH.exists():
        try:
            existing = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            existing = {}

    existing["B078"] = summary
    existing["B078_moves"] = move_records
    MANIFEST_PATH.write_text(json.dumps(existing, indent=2), encoding="utf-8")

    return summary


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, indent=2))
