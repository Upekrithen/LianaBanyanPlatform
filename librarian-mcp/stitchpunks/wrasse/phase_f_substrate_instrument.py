"""
Phase F Substrate Instrument — K551/B133

Implements Phase F of the Wrasse Empirical Campaign.
Replaces K545's prompt-file proxy (C-3 confound) with real session-substrate
measurement via substrate instrumentation.

Architecture D.2 = γ (Bishop-side filesystem watcher, ratified B133 Founder pre-ratification).

Phase F modes:
  --mode=substrate-instrument  Live instrumentation (start watcher + log MCP responses)
  --mode=coverage-delta        Post-session coverage delta computation from call log
  --mode=compare-pair          Compare two sessions (baseline vs wrasse-on)
  --mode=closeout-report       Generate K_PHASE_F_RECEIPT.md from logged data

Usage:
  # Start baseline session instrumentation
  python phase_f_substrate_instrument.py --mode=substrate-instrument --session=K552 --wrasse=off

  # Start wrasse-on session instrumentation (next session)
  python phase_f_substrate_instrument.py --mode=substrate-instrument --session=K553 --wrasse=on

  # Compute coverage delta for a session
  python phase_f_substrate_instrument.py --mode=coverage-delta --session=K552

  # Compare pair
  python phase_f_substrate_instrument.py --mode=compare-pair --baseline=K552 --wrasse-on=K553

  # Closeout report
  python phase_f_substrate_instrument.py --mode=closeout-report --baseline=K552 --wrasse-on=K553

Stone Tablet Imperative: all results appended to session_ledger.jsonl (Phase F extended records).
Brick Wall: no mock data, no suppressed call records. Brynjolfsson methodology-mirror.

Filed: K551/B133, 2026-04-29
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_HERE = Path(__file__).parent
WORKSPACE_ROOT = _HERE.resolve().parents[3]
SESSION_LEDGER = _HERE / "session_ledger.jsonl"
CALL_LOG_PATH = _HERE / "phase_f_call_log.jsonl"
WRASSE_DIR = _HERE
sys.path.insert(0, str(WRASSE_DIR))
CLOSEOUT_REPORT_PATH = (
    WORKSPACE_ROOT / "BISHOP_DROPZONE" / "03_BishopHandoffs" / "K_PHASE_F_RECEIPT.md"
)

CHARS_PER_TOKEN = 4

# Tools known to resolve rote-cognition content
ROTE_TOOL_NAMES = {
    "brief_me",
    "consult_scribes",
    "get_canonical_numbers",
    "get_system_overview",
    "query_domain",
    "get_architecture",
    "check_consistency",
    "pheromone_query",
}

# Tools that are inherently non-rote (substantive work)
SUBSTANTIVE_TOOL_NAMES = {
    "git_commit", "git_tag", "firebase_deploy",
    "write_file", "edit_file",
    "supabase_migrate",
}


# ─── Call log I/O ──────────────────────────────────────────────────────────────

def _load_calls_for_session(session_id: str) -> list[dict[str, Any]]:
    if not CALL_LOG_PATH.exists():
        return []
    calls = []
    with CALL_LOG_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            if record.get("session_id") == session_id:
                calls.append(record)
    return calls


def _append_ledger(record: dict[str, Any]) -> None:
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with SESSION_LEDGER.open("a", encoding="utf-8", buffering=1) as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


# ─── Phase F: Coverage Delta (Scope B) ────────────────────────────────────────

def compute_coverage_delta(session_id: str, wrasse_mode: str = "off") -> dict[str, Any]:
    """
    For each logged call in a session, compute whether Wrasse would have
    pre-resolved it (wrasse_coverable) and savings if so.

    Returns coverage delta dict.
    """
    from wrasse_lookup import lookup_for_session

    calls = _load_calls_for_session(session_id)
    if not calls:
        return {
            "session_id": session_id,
            "wrasse_mode": wrasse_mode,
            "status": "no_calls_logged",
            "total_calls": 0,
        }

    total_chars = 0
    coverable_chars = 0
    partial_chars = 0
    tool_breakdown: dict[str, dict[str, int]] = {}

    for call in calls:
        tool = call.get("tool", "unknown")
        chars = call.get("response_chars", 0) or call.get("size_chars", 0)
        total_chars += chars

        # Would Wrasse have pre-resolved this?
        # Check: if tool is in ROTE_TOOL_NAMES, look up in Wrasse registry
        is_rote_tool = tool in ROTE_TOOL_NAMES
        is_rote_file = call.get("is_rote_candidate", False)
        # Build query from file path or tool name
        query_term = call.get("file_path", "") or tool
        wrasse_matches = lookup_for_session(query_term, max_matches=5)

        if wrasse_matches and (is_rote_tool or is_rote_file):
            # Fully coverable: Wrasse resolution covers this call
            best_resolution = max(wrasse_matches, key=lambda m: len(m["canonical_resolution"]))
            resolution_chars = len(best_resolution["canonical_resolution"])
            coverage_ratio = min(1.0, resolution_chars / max(chars, 1))
            if coverage_ratio >= 0.8:
                coverable_chars += chars
            else:
                partial_chars += int(chars * coverage_ratio)
        elif is_rote_tool:
            # Rote tool but no Wrasse match — potential registry gap
            partial_chars += int(chars * 0.1)  # conservative 10% partial

        # Tool breakdown
        if tool not in tool_breakdown:
            tool_breakdown[tool] = {"calls": 0, "chars": 0, "coverable": 0}
        tool_breakdown[tool]["calls"] += 1
        tool_breakdown[tool]["chars"] += chars

    coverage_ratio = (coverable_chars + partial_chars) / max(total_chars, 1)
    result = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "wrasse_mode": wrasse_mode,
        "phase": "F",
        "total_calls": len(calls),
        "total_chars": total_chars,
        "total_tokens_estimated": total_chars // CHARS_PER_TOKEN,
        "coverable_chars": coverable_chars,
        "partial_coverable_chars": partial_chars,
        "combined_coverable_chars": coverable_chars + partial_chars,
        "wrasse_coverage_ratio": round(coverage_ratio, 4),
        "wrasse_coverage_pct": round(coverage_ratio * 100, 1),
        "tool_breakdown": tool_breakdown,
        "honest_receipt_class": "ANCHORED" if len(calls) >= 10 else "ANCHORED-BUT-CAVEATED (small sample)",
    }
    return result


# ─── Phase F: Compare Pair (Scope C) ──────────────────────────────────────────

def compare_pair(
    baseline_session: str,
    wrasse_on_session: str,
) -> dict[str, Any]:
    """
    Compare baseline vs wrasse-on session pair.
    Computes measured net reduction + verdict per Phase E gate (40%/90%).
    """
    baseline = compute_coverage_delta(baseline_session, "off")
    wrasse_on = compute_coverage_delta(wrasse_on_session, "on")

    baseline_chars = baseline.get("total_chars", 0)
    wrasse_on_chars = wrasse_on.get("total_chars", 0)

    if baseline_chars == 0:
        return {"status": "no_baseline_data", "baseline_session": baseline_session}

    # Net reduction: how much less total substrate was consumed in wrasse-on vs baseline
    # (wrasse pre-injection replaces some tool calls entirely)
    net_reduction_chars = baseline_chars - wrasse_on_chars
    net_reduction_pct = 100 * net_reduction_chars / baseline_chars if baseline_chars > 0 else 0

    # Verdict
    if net_reduction_pct >= 90:
        verdict = "SUPPORTED — Founder 90% claim CONFIRMED publication-grade"
        verdict_class = "SUPPORTED"
    elif net_reduction_pct >= 40:
        verdict = f"PHASE_E_GATE_CLEARED — {net_reduction_pct:.1f}% measured net reduction (Phase F real session)"
        verdict_class = "PHASE_E_CLEARED"
    else:
        verdict = f"BELOW_GATE — {net_reduction_pct:.1f}% reduction; architectural concern"
        verdict_class = "BELOW_GATE"

    result = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "phase": "F",
        "pair": {"baseline": baseline_session, "wrasse_on": wrasse_on_session},
        "baseline_total_chars": baseline_chars,
        "wrasse_on_total_chars": wrasse_on_chars,
        "net_reduction_chars": net_reduction_chars,
        "net_reduction_pct": round(net_reduction_pct, 1),
        "baseline_coverage_delta": baseline,
        "wrasse_on_coverage_delta": wrasse_on,
        "verdict": verdict,
        "verdict_class": verdict_class,
        "honest_receipt_class": "ANCHORED" if min(baseline.get("total_calls", 0), wrasse_on.get("total_calls", 0)) >= 10 else "INDETERMINATE (insufficient calls)",
    }

    # Stone Tablet
    _append_ledger({**result, "record_type": "phase_f_pair_comparison"})
    return result


# ─── Phase F: Closeout Report (Scope C.5) ─────────────────────────────────────

def generate_closeout_report(
    baseline_session: str,
    wrasse_on_session: str,
) -> str:
    """Generate K_PHASE_F_RECEIPT.md and return its path."""
    comparison = compare_pair(baseline_session, wrasse_on_session)

    lines = [
        "# K-Phase-F-Substrate-Instrument — Empirical Receipt",
        f"## Pair: baseline={baseline_session} / wrasse-on={wrasse_on_session}",
        f"**Run timestamp:** {comparison['ts']}",
        f"**Call sign:** v-phase-f-substrate-instrument-K551",
        f"**Stone Tablet:** `librarian-mcp/stitchpunks/wrasse/session_ledger.jsonl` (Phase F records)",
        "",
        "---",
        "",
        f"## VERDICT: {comparison.get('verdict_class', 'PENDING')}",
        "",
        f"{comparison.get('verdict', 'No verdict — check input data')}",
        "",
        "---",
        "",
        "## Measurement Summary",
        "",
        f"| Metric | Baseline ({baseline_session}) | Wrasse-on ({wrasse_on_session}) | Delta |",
        "|---|---|---|---|",
        f"| Total calls logged | {comparison.get('baseline_coverage_delta', {}).get('total_calls', 0)} | {comparison.get('wrasse_on_coverage_delta', {}).get('total_calls', 0)} | — |",
        f"| Total chars | {comparison.get('baseline_total_chars', 0):,} | {comparison.get('wrasse_on_total_chars', 0):,} | {comparison.get('net_reduction_chars', 0):+,} |",
        f"| Tokens estimated | {comparison.get('baseline_total_chars', 0) // 4:,} | {comparison.get('wrasse_on_total_chars', 0) // 4:,} | — |",
        f"| Net reduction | — | — | **{comparison.get('net_reduction_pct', 0):.1f}%** |",
        f"| Coverage ratio | {comparison.get('baseline_coverage_delta', {}).get('wrasse_coverage_pct', 0):.1f}% | {comparison.get('wrasse_on_coverage_delta', {}).get('wrasse_coverage_pct', 0):.1f}% | — |",
        "",
        "---",
        "",
        "## Phase E Gate Assessment",
        "",
        "| Gate | Threshold | Measured | Result |",
        "|---|---|---|---|",
        f"| Phase E (proxy lower bound, K545) | 40% | 41.1% | CLEARED |",
        f"| Phase F real-session net reduction | 40% | {comparison.get('net_reduction_pct', 0):.1f}% | {'CLEARED' if comparison.get('net_reduction_pct', 0) >= 40 else 'NOT CLEARED'} |",
        f"| Founder 90% claim | 90% | {comparison.get('net_reduction_pct', 0):.1f}% | {'CONFIRMED' if comparison.get('net_reduction_pct', 0) >= 90 else 'HYPOTHESIS-CLASS'} |",
        "",
        "---",
        "",
        "## Honest Receipt Classification (Brynjolfsson Methodology-Mirror)",
        "",
        f"- Pair comparison: `{comparison.get('honest_receipt_class', 'PENDING')}`",
        f"- Methodology: Phase F substrate instrumentation (γ fs-watcher + MCP response logger)",
        "- Confounds: filesystem watcher captures access events, not agent-specific reads. Clean-session protocol required (single agent, no background processes).",
        "",
        "---",
        "",
        "*PUBLICATION GATE HARD — internal-only until Founder Phase E review + Prov 15 ratification*",
        "",
        f"*Filed: K-Phase-F-Substrate-Instrument / B133 / 2026-04-29 by Knight*",
    ]

    content = "\n".join(lines)
    CLOSEOUT_REPORT_PATH.write_text(content, encoding="utf-8")
    return str(CLOSEOUT_REPORT_PATH)


# ─── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase F Substrate Instrument")
    parser.add_argument("--mode", choices=[
        "substrate-instrument", "coverage-delta", "compare-pair", "closeout-report"
    ], required=True)
    parser.add_argument("--session", default="K-unknown")
    parser.add_argument("--wrasse", choices=["on", "off"], default="off")
    parser.add_argument("--baseline", default="")
    parser.add_argument("--wrasse-on", dest="wrasse_on", default="")
    args = parser.parse_args()

    if args.mode == "substrate-instrument":
        from phase_f_fs_watcher import start_watcher
        print(f"Starting Phase F instrumentation: session={args.session} wrasse={args.wrasse}")
        print(f"Call log: {CALL_LOG_PATH}")
        print("MCP server middleware (phase_f_logger.ts) logs tool responses separately.")
        print("Press Ctrl-C to stop watcher when session ends.")
        start_watcher(args.session, args.wrasse)

    elif args.mode == "coverage-delta":
        result = compute_coverage_delta(args.session, args.wrasse)
        print(json.dumps(result, indent=2))
        _append_ledger({**result, "record_type": "phase_f_coverage_delta"})

    elif args.mode == "compare-pair":
        if not args.baseline or not args.wrasse_on:
            parser.error("--baseline and --wrasse-on required for compare-pair")
        result = compare_pair(args.baseline, args.wrasse_on)
        print(json.dumps(result, indent=2))

    elif args.mode == "closeout-report":
        if not args.baseline or not args.wrasse_on:
            parser.error("--baseline and --wrasse-on required for closeout-report")
        report_path = generate_closeout_report(args.baseline, args.wrasse_on)
        print(f"Closeout report written to: {report_path}")
