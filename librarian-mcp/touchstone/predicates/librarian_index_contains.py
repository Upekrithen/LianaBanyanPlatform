"""Predicate: librarian_index_contains — checks a librarian index JSON for a key or substring."""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
INDEX_DIR = REPO_ROOT / "librarian-mcp" / "index"


def check(args: dict) -> dict:
    index_name = args.get("index", "")
    key = args.get("key", None)
    substring = args.get("substring", None)

    if not index_name:
        return {"passed": False, "observed": None, "message": "Missing required arg: index"}

    index_path = INDEX_DIR / f"{index_name}.json"
    if not index_path.exists():
        return {
            "passed": False,
            "observed": None,
            "message": f"Index file not found: {index_path.name}",
        }

    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        return {
            "passed": False,
            "observed": str(e),
            "message": f"Failed to parse index: {e}",
        }

    if key is not None:
        if isinstance(data, dict):
            found = key in data
        elif isinstance(data, list):
            found = any(
                (isinstance(item, dict) and key in item) or item == key
                for item in data
            )
        else:
            found = False

        return {
            "passed": found,
            "observed": f"key_exists={found}",
            "message": f"Key '{key}' {'found' if found else 'not found'} in {index_name}",
        }

    if substring is not None:
        raw_text = index_path.read_text(encoding="utf-8")
        found = substring in raw_text

        return {
            "passed": found,
            "observed": f"substring_found={found}",
            "message": f"Substring '{substring}' {'found' if found else 'not found'} in {index_name}",
        }

    return {
        "passed": False,
        "observed": None,
        "message": "Must provide either 'key' or 'substring' arg",
    }
