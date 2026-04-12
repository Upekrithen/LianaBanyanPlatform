"""Predicate: git_committed — checks file is tracked and clean in git."""

import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def check(args: dict) -> dict:
    rel_path = args.get("file", "")

    try:
        tracked = subprocess.run(
            ["git", "ls-files", rel_path],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=10,
        )
        if not tracked.stdout.strip():
            return {
                "passed": False,
                "observed": "untracked",
                "message": f"File is not tracked by git: {rel_path}",
            }

        diff = subprocess.run(
            ["git", "diff", "--name-only", rel_path],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=10,
        )
        is_dirty = bool(diff.stdout.strip())

        if is_dirty:
            return {
                "passed": False,
                "observed": "dirty",
                "message": f"File is tracked but has uncommitted changes: {rel_path}",
            }

        return {
            "passed": True,
            "observed": "clean",
            "message": f"File is tracked and clean: {rel_path}",
        }
    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "observed": "timeout",
            "message": f"Git command timed out for: {rel_path}",
        }
    except FileNotFoundError:
        return {
            "passed": False,
            "observed": "no_git",
            "message": "git executable not found",
        }
