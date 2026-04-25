"""
POST-COMMIT SAVINGS HOOK — K506 Phase B
========================================
Git post-commit hook that auto-logs estimated Knight substrate savings on
every commit that references a K-session number in the commit message.

Install:
    python librarian-mcp/scripts/install_git_hooks.py

How it works:
1. Reads the latest commit message (git log -1 --format=%B)
2. Extracts K-session number (e.g. K506)
3. Gets diff stats (lines added/removed) as token proxy
4. Estimates tokens: (lines_added + lines_removed) × avg_line_chars / 4
5. Appends a substrate_savings_log.jsonl record with estimated: true flag
6. Also reads current session MCP-call count from a per-session counter file
   (written by the MCP server at the timestamp of last tool call)

HONEST SCOPING:
- Token counts are ESTIMATED from diff stats, not measured.
- The record carries multiplier_provisional: true AND estimated: true.
- These are distinct from measured: true entries from manual invocation.
- Calibration data accumulates; estimates improve over time.

BRIDLE compliance: overhead subtracted, provisional + estimated flags visible.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT = SCRIPT_DIR.parent.parent
LIBRARIAN_ROOT = SCRIPT_DIR.parent
SAVINGS_LOG = LIBRARIAN_ROOT / "stitchpunks" / "data" / "substrate_savings_log.jsonl"
SESSION_COUNTER_FILE = LIBRARIAN_ROOT / "stitchpunks" / "data" / "k506_session_counter.json"

# Rough heuristics: average chars per line of code, chars per token
AVG_CHARS_PER_LINE = 45
CHARS_PER_TOKEN = 4
COLD_MULTIPLIER = 2.5  # Knight, R13-derived
VENDOR_PRICING = {"anthropic": (3.00, 15.00)}  # (input, output) per 1M tokens


def run(cmd: list[str]) -> str:
    """Run a git command and return stdout, empty string on error."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=REPO_ROOT)
        return result.stdout.strip()
    except Exception:
        return ""


def get_commit_message() -> str:
    return run(["git", "log", "-1", "--format=%B"])


def extract_session_id(msg: str) -> str | None:
    """Return first K### found in commit message, or None."""
    m = re.search(r"\bK(\d{3,4})\b", msg)
    return f"K{m.group(1)}" if m else None


def get_diff_stats() -> tuple[int, int]:
    """Return (lines_added, lines_deleted) from the latest commit."""
    stat = run(["git", "diff", "HEAD~1", "--shortstat"])
    if not stat:
        # Initial commit or first-parent; use diff against empty tree
        stat = run(["git", "diff", "--shortstat", "--cached"])
    added = deleted = 0
    m_add = re.search(r"(\d+) insertion", stat)
    m_del = re.search(r"(\d+) deletion", stat)
    if m_add:
        added = int(m_add.group(1))
    if m_del:
        deleted = int(m_del.group(1))
    return added, deleted


def read_session_counter() -> dict:
    """Read the MCP server's per-session injection counter if present."""
    if SESSION_COUNTER_FILE.exists():
        try:
            return json.loads(SESSION_COUNTER_FILE.read_text("utf-8"))
        except Exception:
            pass
    return {}


def compute_savings(input_tokens: int, output_tokens: int, overhead_tokens: int = 0) -> dict:
    inp_rate, out_rate = VENDOR_PRICING["anthropic"]
    m = 1_000_000
    actual = (input_tokens / m) * inp_rate + (output_tokens / m) * out_rate
    overhead = (overhead_tokens / m) * inp_rate
    counterfactual = actual * COLD_MULTIPLIER
    net = counterfactual - actual - overhead
    return {
        "actual_cost_usd": round(actual, 4),
        "counterfactual_cost_usd": round(counterfactual, 4),
        "session_savings_usd": round(net, 4),
    }


def append_record(record: dict) -> int:
    SAVINGS_LOG.parent.mkdir(parents=True, exist_ok=True)
    existing = SAVINGS_LOG.read_text("utf-8").strip() if SAVINGS_LOG.exists() else ""
    lines = existing.split("\n") if existing else []
    # Deduplicate: skip if same session_id + agent already has an 'estimated' entry
    # from today (allow one per commit session to avoid double-logging on amend).
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    already = any(
        json.loads(l).get("session_id") == record["session_id"]
        and json.loads(l).get("ts", "").startswith(today)
        and json.loads(l).get("estimated", False)
        for l in lines
        if l.strip()
    )
    if already:
        print(f"[post-commit-savings] Skipped duplicate estimated entry for {record['session_id']} ({today})")
        return len(lines)
    lines.append(json.dumps(record))
    SAVINGS_LOG.write_text("\n".join(lines) + "\n", "utf-8")
    return len(lines)


def main():
    msg = get_commit_message()
    session_id = extract_session_id(msg)
    if not session_id:
        # No K-session reference — nothing to log
        sys.exit(0)

    added, deleted = get_diff_stats()
    if added + deleted == 0:
        sys.exit(0)

    # Estimate tokens from diff size
    total_lines = added + deleted
    est_chars = total_lines * AVG_CHARS_PER_LINE
    # Input ≈ context read (lines viewed ≈ 4× diff lines as heuristic)
    input_tokens = max(int(est_chars * 4 / CHARS_PER_TOKEN), 1000)
    output_tokens = max(int(est_chars / CHARS_PER_TOKEN), 500)

    # Pull MCP injection count from counter file if available
    counter = read_session_counter()
    injection_count = counter.get("injection_count", 0)
    overhead_estimate = counter.get("overhead_tokens_estimate", 0)

    savings = compute_savings(input_tokens, output_tokens, overhead_estimate)
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": "KNIGHT",
        "session_id": session_id,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "substrate_overhead_tokens": overhead_estimate,
        "substrate_injection_count": injection_count,
        "vendor": "anthropic",
        "model": "claude-sonnet-4-6",
        "actual_cost_usd": savings["actual_cost_usd"],
        "counterfactual_cost_usd": savings["counterfactual_cost_usd"],
        "session_savings_usd": savings["session_savings_usd"],
        "cold_multiplier": COLD_MULTIPLIER,
        "friction_confirmations": 0,
        "multiplier_provisional": True,
        "estimated": True,
        "estimation_basis": f"diff_stats: +{added}/-{deleted} lines → ~{input_tokens:,} in / {output_tokens:,} out tokens",
        "notes": f"auto-logged via K506 post-commit hook; commit: {msg[:80].strip()}",
    }

    n = append_record(record)
    print(f"[post-commit-savings] Logged estimated Knight savings for {session_id}:")
    print(f"  Diff: +{added}/-{deleted} lines → ~{input_tokens:,} in / {output_tokens:,} out tokens")
    print(f"  Actual: ${savings['actual_cost_usd']:.4f}  Counterfactual: ${savings['counterfactual_cost_usd']:.4f}")
    print(f"  Net savings: ${savings['session_savings_usd']:.4f} [estimated, provisional]")
    print(f"  Log entries: {n}")


if __name__ == "__main__":
    main()
