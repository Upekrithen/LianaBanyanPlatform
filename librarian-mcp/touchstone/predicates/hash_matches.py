"""Predicate: hash_matches — SHA-256 of a file against an expected hash."""

import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def check(args: dict) -> dict:
    rel_path = args.get("path", "")
    expected_hash = args.get("expected", "")

    if not rel_path or not expected_hash:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required args: path, expected",
        }

    full_path = REPO_ROOT / rel_path
    if not full_path.exists():
        return {
            "passed": False,
            "observed": None,
            "message": f"File not found: {rel_path}",
        }

    try:
        actual_hash = hashlib.sha256(full_path.read_bytes()).hexdigest()
    except OSError as e:
        return {
            "passed": False,
            "observed": str(e),
            "message": f"Failed to read file for hashing: {e}",
        }

    if actual_hash == expected_hash.lower():
        return {
            "passed": True,
            "observed": actual_hash,
            "message": f"Hash matches: {actual_hash[:16]}...",
        }
    else:
        return {
            "passed": False,
            "observed": actual_hash,
            "message": f"Hash mismatch: expected {expected_hash[:16]}..., got {actual_hash[:16]}...",
        }
