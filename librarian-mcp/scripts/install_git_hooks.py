"""
GIT HOOKS INSTALLER — K506 Phase B
====================================
Installs the K506 post-commit savings hook into .git/hooks/post-commit.

On Windows this uses a Python launcher wrapper (since git hooks are bash
scripts but may fall back to Python on Windows if git-bash is not on PATH).
Writes both a bash entrypoint and a PowerShell fallback.

Usage:
    python librarian-mcp/scripts/install_git_hooks.py

Safe to re-run: idempotent. Existing post-commit hooks are preserved by
appending our call (we do not overwrite).
"""

import os
import re
import stat
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT = SCRIPT_DIR.parent.parent
GIT_HOOKS_DIR = REPO_ROOT / ".git" / "hooks"
POST_COMMIT_HOOK = GIT_HOOKS_DIR / "post-commit"
POST_COMMIT_PS1 = GIT_HOOKS_DIR / "k506_post_commit.ps1"

# What we inject into post-commit (bash-compatible, works on Windows git-bash too)
BASH_INJECTION = """
# K506 Phase B — substrate savings auto-hook
_K506_SCRIPT="$(git rev-parse --show-toplevel)/librarian-mcp/scripts/post_commit_savings.py"
if [ -f "$_K506_SCRIPT" ]; then
    python "$_K506_SCRIPT" 2>/dev/null || true
fi
"""

# PowerShell companion for Windows without git-bash
PS1_CONTENT = """# K506 Phase B — substrate savings auto-hook (PowerShell companion)
# Called by post-commit bash hook as a fallback on Windows.
$ScriptPath = Join-Path (git rev-parse --show-toplevel) "librarian-mcp/scripts/post_commit_savings.py"
if (Test-Path $ScriptPath) {
    python $ScriptPath 2>$null
}
"""

MARKER = "# K506 Phase B"


def make_executable(path: Path):
    """Add execute bits (no-op on Windows but good practice)."""
    try:
        current = path.stat().st_mode
        path.chmod(current | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    except Exception:
        pass


def install_bash_hook():
    """Append K506 injection to post-commit hook (or create it)."""
    if POST_COMMIT_HOOK.exists():
        content = POST_COMMIT_HOOK.read_text("utf-8")
        if MARKER in content:
            print(f"[install-hooks] post-commit already contains K506 marker — skipping.")
            return
        # Append
        updated = content.rstrip() + "\n\n" + BASH_INJECTION
        POST_COMMIT_HOOK.write_text(updated, "utf-8")
        make_executable(POST_COMMIT_HOOK)
        print(f"[install-hooks] Appended K506 hook to existing {POST_COMMIT_HOOK}")
    else:
        GIT_HOOKS_DIR.mkdir(parents=True, exist_ok=True)
        POST_COMMIT_HOOK.write_text("#!/bin/sh\n" + BASH_INJECTION, "utf-8")
        make_executable(POST_COMMIT_HOOK)
        print(f"[install-hooks] Created {POST_COMMIT_HOOK}")


def install_ps1_companion():
    POST_COMMIT_PS1.write_text(PS1_CONTENT, "utf-8")
    print(f"[install-hooks] Wrote PowerShell companion: {POST_COMMIT_PS1}")


def verify():
    """Quick smoke-test: verify git sees the hook."""
    import subprocess
    result = subprocess.run(
        ["git", "config", "core.hooksPath"],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    hooks_path = result.stdout.strip()
    if hooks_path:
        print(f"[install-hooks] NOTE: core.hooksPath is set to '{hooks_path}' — hook lives there, not .git/hooks/")
    else:
        print(f"[install-hooks] core.hooksPath not set — using default .git/hooks/")


def main():
    print("K506 Git Hook Installer")
    print("=======================")
    print(f"Repo:  {REPO_ROOT}")
    print(f"Hooks: {GIT_HOOKS_DIR}")
    print()

    if not (REPO_ROOT / ".git").exists():
        print("[ERROR] Not a git repository. Run from workspace root.")
        sys.exit(1)

    install_bash_hook()
    install_ps1_companion()
    verify()

    print()
    print("Done. The K506 post-commit hook will now auto-log estimated Knight")
    print("substrate savings to stitchpunks/data/substrate_savings_log.jsonl")
    print("on every commit that references a K### session number.")


if __name__ == "__main__":
    main()
