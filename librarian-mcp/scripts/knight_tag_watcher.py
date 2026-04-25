"""
KNIGHT TAG WATCHER — K506 Phase B.3
=====================================
Daemon that watches for new git tags matching `v-*-K\\d+` and auto-logs
Knight substrate savings when a new tag appears.

Usage:
    python librarian-mcp/scripts/knight_tag_watcher.py [--interval 60]

Options:
    --interval N    Polling interval in seconds (default: 60)
    --once          Run once (check current tags), log any unrecorded, then exit
    --daemon        Run continuously until interrupted (default)

The watcher:
  1. Polls `git tag -l 'v-*-K*'` every N seconds
  2. Detects newly-appeared tags since last poll
  3. For each new tag: extracts K-session number
  4. Checks if this session already has a log entry in substrate_savings_log.jsonl
  5. If not: auto-logs an estimated record (same heuristics as post-commit hook)
  6. Writes the set of seen tags to a state file to survive restarts

Install as background service:
  On Windows: see install-task-scheduler.ps1 for Task Scheduler registration
  On macOS/Linux: add to crontab or run as a screen/tmux session
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
LIBRARIAN_ROOT = SCRIPT_DIR.parent
REPO_ROOT = LIBRARIAN_ROOT.parent
SAVINGS_LOG = LIBRARIAN_ROOT / "stitchpunks" / "data" / "substrate_savings_log.jsonl"
WATCHER_STATE = LIBRARIAN_ROOT / "stitchpunks" / "data" / "k506_tag_watcher_state.json"

COLD_MULTIPLIER = 2.5
VENDOR_PRICING = {"anthropic": (3.00, 15.00)}

# Default token estimate when no diff data is available at tag-time
DEFAULT_INPUT_TOKENS = 120_000
DEFAULT_OUTPUT_TOKENS = 30_000


def run(cmd: list[str]) -> str:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=REPO_ROOT)
        return result.stdout.strip()
    except Exception:
        return ""


def get_tags() -> set[str]:
    raw = run(["git", "tag", "-l", "v-*"])
    return {t for t in raw.splitlines() if re.search(r"K\d{3,4}", t)}


def extract_session_from_tag(tag: str) -> str | None:
    m = re.search(r"K(\d{3,4})", tag)
    return f"K{m.group(1)}" if m else None


def read_state() -> dict:
    if WATCHER_STATE.exists():
        try:
            return json.loads(WATCHER_STATE.read_text("utf-8"))
        except Exception:
            pass
    return {"seen_tags": []}


def write_state(state: dict):
    WATCHER_STATE.parent.mkdir(parents=True, exist_ok=True)
    WATCHER_STATE.write_text(json.dumps(state, indent=2), "utf-8")


def already_logged(session_id: str) -> bool:
    if not SAVINGS_LOG.exists():
        return False
    raw = SAVINGS_LOG.read_text("utf-8").strip()
    return any(
        json.loads(l).get("session_id") == session_id
        for l in raw.splitlines()
        if l.strip()
    )


def get_tag_diff_stats(tag: str) -> tuple[int, int]:
    """Attempt to get diff stats for the tag's commit vs its predecessor."""
    tag_sha = run(["git", "rev-list", "-n", "1", tag])
    if not tag_sha:
        return 0, 0
    stat = run(["git", "diff", f"{tag_sha}~1", tag_sha, "--shortstat"])
    added = deleted = 0
    m_add = re.search(r"(\d+) insertion", stat)
    m_del = re.search(r"(\d+) deletion", stat)
    if m_add:
        added = int(m_add.group(1))
    if m_del:
        deleted = int(m_del.group(1))
    return added, deleted


def log_savings(session_id: str, tag: str):
    added, deleted = get_tag_diff_stats(tag)
    if added + deleted > 0:
        est_chars = (added + deleted) * 45
        input_tokens = max(int(est_chars * 4 / 4), DEFAULT_INPUT_TOKENS)
        output_tokens = max(int(est_chars / 4), DEFAULT_OUTPUT_TOKENS)
    else:
        input_tokens = DEFAULT_INPUT_TOKENS
        output_tokens = DEFAULT_OUTPUT_TOKENS

    inp_rate, out_rate = VENDOR_PRICING["anthropic"]
    m = 1_000_000
    actual = (input_tokens / m) * inp_rate + (output_tokens / m) * out_rate
    counterfactual = actual * COLD_MULTIPLIER
    net = counterfactual - actual

    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": "KNIGHT",
        "session_id": session_id,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "substrate_overhead_tokens": 0,
        "substrate_injection_count": 0,
        "vendor": "anthropic",
        "model": "claude-sonnet-4-6",
        "actual_cost_usd": round(actual, 4),
        "counterfactual_cost_usd": round(counterfactual, 4),
        "session_savings_usd": round(net, 4),
        "cold_multiplier": COLD_MULTIPLIER,
        "friction_confirmations": 0,
        "multiplier_provisional": True,
        "estimated": True,
        "estimation_basis": f"tag_watcher: diff +{added}/-{deleted} lines or defaults" if added+deleted > 0 else "tag_watcher: default_heuristic",
        "notes": f"auto-logged via K506 tag-watcher; tag={tag}",
    }

    SAVINGS_LOG.parent.mkdir(parents=True, exist_ok=True)
    existing = SAVINGS_LOG.read_text("utf-8").strip() if SAVINGS_LOG.exists() else ""
    lines = existing.split("\n") if existing else []
    lines.append(json.dumps(record))
    SAVINGS_LOG.write_text("\n".join(lines) + "\n", "utf-8")
    n = len(lines)

    print(f"[tag-watcher] Logged savings for {session_id} (tag: {tag})")
    print(f"  Tokens: {input_tokens:,} in / {output_tokens:,} out [estimated]")
    print(f"  Net savings: ${net:.4f} [provisional] — log entries: {n}")


def poll_once(state: dict) -> dict:
    seen = set(state.get("seen_tags", []))
    current = get_tags()
    new_tags = current - seen

    for tag in sorted(new_tags):
        session_id = extract_session_from_tag(tag)
        if session_id and not already_logged(session_id):
            log_savings(session_id, tag)
        seen.add(tag)

    state["seen_tags"] = list(seen)
    state["last_poll_ts"] = datetime.now(timezone.utc).isoformat()
    return state


def main():
    parser = argparse.ArgumentParser(description="K506 Knight tag watcher daemon")
    parser.add_argument("--interval", type=int, default=60, help="Poll interval seconds")
    parser.add_argument("--once", action="store_true", help="Poll once then exit")
    parser.add_argument("--daemon", action="store_true", help="Run continuously (default if --once not set)")
    args = parser.parse_args()

    state = read_state()
    print(f"[tag-watcher] Starting K506 Knight tag watcher (interval={args.interval}s)")
    print(f"  Repo: {REPO_ROOT}")
    print(f"  Log:  {SAVINGS_LOG}")
    print(f"  State: {WATCHER_STATE}")

    if args.once:
        state = poll_once(state)
        write_state(state)
        print("[tag-watcher] Done (--once mode).")
        return

    try:
        while True:
            state = poll_once(state)
            write_state(state)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n[tag-watcher] Interrupted. State saved.")
        write_state(state)


if __name__ == "__main__":
    main()
