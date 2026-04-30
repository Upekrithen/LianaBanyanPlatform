"""
Scavenger Scribe — Orphaned Canon Finder
KN016 / A&A #2328 candidate

Detects two orphan classes:
  1. referenced-but-missing — a file is referenced in index/canon but not on disk
  2. written-but-not-indexed — a file exists on disk but does not appear in any index

Composes with Sweeper scan_orphaned for full orphan detection pipeline.

Toolsmith log: TS-BISHOP-SWEEPER-SCAVENGER-KN016-BP002
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def find_referenced_but_missing(
    index: Dict[str, str],
) -> List[Dict[str, Any]]:
    """
    Given an index of { id -> file_path }, return items where file_path does not exist.

    Returns list of { id, expected_path, class: 'orphaned', subclass: 'referenced_but_missing' }
    """
    results = []
    for item_id, file_path in index.items():
        p = Path(file_path)
        if not p.exists():
            results.append({
                "id": item_id,
                "expected_path": file_path,
                "class": "orphaned",
                "subclass": "referenced_but_missing",
                "severity": "high",
                "detected_at": _iso_now(),
            })
    return results


def find_written_but_not_indexed(
    scan_roots: List[Path],
    index: Dict[str, str],
    extensions: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Find files in scan_roots that are not referenced in any index value.

    Returns list of { path, class: 'orphaned', subclass: 'written_but_not_indexed' }
    """
    if extensions is None:
        extensions = [".md", ".json", ".jsonl"]

    indexed_paths = {str(Path(v).resolve()) for v in index.values()}
    results = []

    for root in scan_roots:
        root = Path(root)
        if not root.exists():
            continue
        for file_path in root.rglob("*"):
            if file_path.is_file() and file_path.suffix in extensions:
                resolved = str(file_path.resolve())
                if resolved not in indexed_paths:
                    results.append({
                        "path": str(file_path),
                        "class": "orphaned",
                        "subclass": "written_but_not_indexed",
                        "severity": "low",
                        "detected_at": _iso_now(),
                    })

    return results


def run_scavenger(
    index: Dict[str, str],
    scan_roots: List[Path],
    extensions: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Run full scavenger scan: both orphan classes.
    Returns combined results.
    """
    missing = find_referenced_but_missing(index)
    not_indexed = find_written_but_not_indexed(scan_roots, index, extensions)
    all_items = missing + not_indexed
    return {
        "scan_timestamp": _iso_now(),
        "referenced_but_missing_count": len(missing),
        "written_but_not_indexed_count": len(not_indexed),
        "total_orphans": len(all_items),
        "items": all_items,
    }
