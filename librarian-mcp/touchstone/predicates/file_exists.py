"""Predicate: file_exists — checks that a path exists and is non-empty."""

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def check(args: dict) -> dict:
    rel_path = args.get("path", "")
    non_empty = args.get("non_empty", True)
    full_path = REPO_ROOT / rel_path

    if not full_path.exists():
        return {
            "passed": False,
            "observed": None,
            "message": f"File not found: {rel_path}",
        }

    if non_empty and full_path.stat().st_size == 0:
        return {
            "passed": False,
            "observed": 0,
            "message": f"File exists but is empty: {rel_path}",
        }

    return {
        "passed": True,
        "observed": full_path.stat().st_size,
        "message": f"File exists ({full_path.stat().st_size} bytes): {rel_path}",
    }
