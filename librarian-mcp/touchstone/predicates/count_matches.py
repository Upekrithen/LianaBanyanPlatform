"""Predicate: count_matches — counts lines/bytes/rows against a threshold."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def check(args: dict) -> dict:
    rel_path = args.get("file", "")
    min_bytes = args.get("min_bytes", None)
    min_lines = args.get("min_lines", None)

    if not rel_path:
        return {"passed": False, "observed": None, "message": "Missing required arg: file"}

    full_path = REPO_ROOT / rel_path
    if not full_path.exists():
        return {
            "passed": False,
            "observed": None,
            "message": f"File not found: {rel_path}",
        }

    size = full_path.stat().st_size

    if min_bytes is not None:
        if size >= int(min_bytes):
            return {
                "passed": True,
                "observed": size,
                "message": f"File has {size} bytes (>= {min_bytes} threshold): {rel_path}",
            }
        else:
            return {
                "passed": False,
                "observed": size,
                "message": f"File has {size} bytes (< {min_bytes} threshold): {rel_path}",
            }

    if min_lines is not None:
        try:
            line_count = len(full_path.read_text(encoding="utf-8").splitlines())
        except OSError:
            line_count = 0

        if line_count >= int(min_lines):
            return {
                "passed": True,
                "observed": line_count,
                "message": f"File has {line_count} lines (>= {min_lines} threshold): {rel_path}",
            }
        else:
            return {
                "passed": False,
                "observed": line_count,
                "message": f"File has {line_count} lines (< {min_lines} threshold): {rel_path}",
            }

    return {
        "passed": True,
        "observed": size,
        "message": f"File exists with {size} bytes (no threshold specified): {rel_path}",
    }
