"""
Knowledge Pump Empirical Test — Entry Point (Phase E gate, K538)

PUBLICATION GATE HARD:
  This script checks KNOWLEDGE_PUMP_TEST_ENABLED in librarian-mcp/config/knowledge_pump.json.
  If false (the default shipped by Knight), the script prints the gate message and exits.
  Founder flips to true ONLY after Phase E validation + ledger discipline confirmed.

  Knight builds. Founder fires.

Usage (after Founder flips the gate):
  python -m empirical_tests.run_kp_test2 [--dry-run] [--top-k 5] [--verbose]

Options:
  --dry-run    Run retrieval only (no LLM calls). Safe for infrastructure validation.
  --top-k N    Number of facts to retrieve per arm (default: 5).
  --verbose    Print per-query progress (default: True).
  --quiet      Suppress per-query output.

Output:
  empirical_tests/results/kp_test2_detail_<ts>.jsonl  — per-question Stone Tablets
  empirical_tests/results/kp_test2_summary_<ts>.jsonl — aggregate per-dollar-correctness

Call Sign: v-knowledge-pump-empirical-K538
Session: K538 / B132
Filed: 2026-04-28 by Knight (Cursor)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from empirical_tests.kp_harness import check_gate, run_test2
from empirical_tests.kp_panels import KP_TEST2_PANEL, panel_summary


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Knowledge Pump Test 2 — mastery-aware retrieval empirical test"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run retrieval only (no LLM calls). Safe before gate is opened.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of facts to retrieve per arm (default: 5).",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress per-query progress output.",
    )
    args = parser.parse_args()

    verbose = not args.quiet

    if verbose:
        print("=" * 70, flush=True)
        print("Knowledge Pump Empirical Test 2 — Mastery-Aware Retrieval", flush=True)
        print("Call Sign: v-knowledge-pump-empirical-K538", flush=True)
        print("Session: K538 / B132 / 2026-04-28", flush=True)
        print("Tagline V3 claim under test: 'doing what you already do'", flush=True)
        print("=" * 70, flush=True)

    # --- Infrastructure validation (always safe) ---
    if args.dry_run:
        print("\n[run_kp_test2] DRY-RUN mode — gate check bypassed for infra validation.", flush=True)
        import json
        print("\nPanel summary:")
        print(json.dumps(panel_summary(), indent=2), flush=True)
        records, summary = run_test2(
            KP_TEST2_PANEL,
            top_k=args.top_k,
            verbose=verbose,
            dry_run=True,
        )
        print("\n[run_kp_test2] Dry-run complete. Infrastructure validated.", flush=True)
        print("  To fire the empirical run:", flush=True)
        print("    1. Flip KNOWLEDGE_PUMP_TEST_ENABLED=true in librarian-mcp/config/knowledge_pump.json", flush=True)
        print("    2. Run: python -m empirical_tests.run_kp_test2", flush=True)
        return 0

    # --- PUBLICATION GATE CHECK ---
    if not check_gate():
        print(
            "\n[run_kp_test2] To fire the empirical run:\n"
            "  1. Confirm Phase E validation complete (B132 D.3 ratified)\n"
            "  2. Set KNOWLEDGE_PUMP_TEST_ENABLED=true in librarian-mcp/config/knowledge_pump.json\n"
            "  3. Re-run: python -m empirical_tests.run_kp_test2",
            flush=True,
        )
        return 1

    print("\n[run_kp_test2] GATE OPEN — proceeding with full empirical run.", flush=True)
    print("[run_kp_test2] Budget gate: $1,000 per-condition limit (B132 Both-Feet).", flush=True)

    records, summary = run_test2(
        KP_TEST2_PANEL,
        top_k=args.top_k,
        verbose=verbose,
        dry_run=False,
    )

    if verbose:
        print("\n" + "=" * 70, flush=True)
        if summary["publication_gate"]["passed"]:
            print("PUBLICATION GATE: PASSED", flush=True)
            print(f"  Reading C converts: HYPOTHESIS -> PUBLICATION-GRADE", flush=True)
            print(f"  Tagline V3 'doing what you already do' — EMPIRICALLY VALIDATED", flush=True)
        else:
            pdc = summary.get("per_dollar_correctness_lift")
            hot_d = summary.get("hot_delta_pp", 0)
            print("PUBLICATION GATE: NOT YET PASSED", flush=True)
            print(f"  PDC lift: {pdc} (need >= 1.20)", flush=True)
            print(f"  HOT delta: {hot_d:+.1f}pp (need >= +10pp)", flush=True)
            print("  Next steps: Bishop review + Phase E assessment", flush=True)
        print("=" * 70, flush=True)

    return 0


if __name__ == "__main__":
    sys.exit(main())
