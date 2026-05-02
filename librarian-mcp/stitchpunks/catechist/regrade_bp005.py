#!/usr/bin/env python3
"""
regrade_bp005.py — F4 KN100 BP015 regrade migration.

Re-runs bishop_catechist_grader.py against all historical BP005 grade.json
files using the UPDATED R02 rule (KN059 BP-number auto-detect+announce fix).

Most BP005 grades flip FAIL/WARN → PASS on R02.

Usage:
    python regrade_bp005.py [--dry-run]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Catechist module paths
CATECHIST_DIR = Path(__file__).parent
STATE_CATECHIST = Path(r"C:\Users\Administrator\.claude\state\catechist")
PROJECTS_DIR = Path(r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents")

sys.path.insert(0, str(CATECHIST_DIR))

from bishop_catechist_rules import RULES
from bishop_catechist_grader import aggregate, write_grade
from bishop_catechist_jsonl_reader import read_turns


def find_bp005_grade_files() -> list[Path]:
    """Return all grade.json files with BP005 in their name."""
    return sorted(STATE_CATECHIST.glob("*BP005*_grade.json"))


def regrade_one(grade_path: Path, dry_run: bool = False) -> dict:
    """Re-run the grader against one grade.json file. Returns result summary."""
    try:
        with grade_path.open("r", encoding="utf-8-sig") as fh:  # utf-8-sig strips BOM
            old_grade = json.load(fh)
    except Exception as e:
        return {"file": grade_path.name, "status": "READ_ERROR", "error": str(e)}

    session_jsonl_str = old_grade.get("session_jsonl", "")
    session_id = old_grade.get("session_id", "unknown")
    session_name = old_grade.get("session_name", "BP005")

    # Strip BOM from session_name if present
    session_name = session_name.lstrip("\ufeff").strip()

    # Locate JSONL transcript
    jsonl_path: Path | None = None
    if session_jsonl_str:
        candidate = Path(session_jsonl_str)
        if candidate.is_file():
            jsonl_path = candidate

    if jsonl_path is None:
        # Try to find by session_id in PROJECTS_DIR
        if session_id and session_id != "unknown":
            candidate2 = PROJECTS_DIR / f"{session_id}.jsonl"
            if candidate2.is_file():
                jsonl_path = candidate2

    if jsonl_path is None:
        return {
            "file": grade_path.name,
            "status": "JSONL_NOT_FOUND",
            "session_id": session_id,
            "old_grade": old_grade.get("grade"),
        }

    # Read turns and re-run rules
    turns_result = read_turns(jsonl_path, n=15)  # use 15 for better coverage
    turns = turns_result["turns"]
    insufficient = turns_result["insufficient_data"]

    rule_results = []
    if not insufficient:
        for rule_name, rule_fn in RULES:
            result = rule_fn(turns)
            result["rule"] = rule_name
            rule_results.append(result)

    new_grade_dict = aggregate(
        rule_results=rule_results,
        session_id=session_id,
        session_name=session_name,
        checked_at_turn=turns_result.get("total_lines_read", 0),
        insufficient_data=insufficient,
        session_jsonl=str(jsonl_path),
        agent="bishop",
    )

    old_g = old_grade.get("grade", "?")
    new_g = new_grade_dict.get("grade", "?")

    if not dry_run:
        write_grade(new_grade_dict, session_id, session_name)

    return {
        "file": grade_path.name,
        "status": "REGRADED",
        "old_grade": old_g,
        "new_grade": new_g,
        "flipped": old_g != new_g,
        "dry_run": dry_run,
    }


def main():
    dry_run = "--dry-run" in sys.argv
    grade_files = find_bp005_grade_files()

    if not grade_files:
        print("No BP005 grade.json files found.")
        return

    print(f"Found {len(grade_files)} BP005 grade.json files.")
    if dry_run:
        print("[DRY RUN — no files will be overwritten]")
    print()

    results = []
    for gf in grade_files:
        r = regrade_one(gf, dry_run=dry_run)
        results.append(r)
        status = r.get("status", "?")
        old_g = r.get("old_grade", "?")
        new_g = r.get("new_grade", "?")
        flipped = r.get("flipped", False)
        flip_marker = " ** FLIPPED **" if flipped else ""
        print(f"  {r['file'][:50]:<50}  {old_g} -> {new_g}  [{status}]{flip_marker}")

    # Summary
    regraded = [r for r in results if r["status"] == "REGRADED"]
    flipped = [r for r in regraded if r["flipped"]]
    errors = [r for r in results if r["status"] not in ("REGRADED",)]

    print()
    print(f"Summary: {len(regraded)}/{len(results)} regraded, "
          f"{len(flipped)} flipped grade, {len(errors)} skipped/errors.")

    if errors:
        print("Skipped/errors:")
        for r in errors:
            print(f"  {r['file']}: {r['status']} — {r.get('error', r.get('session_id', ''))}")


if __name__ == "__main__":
    main()
