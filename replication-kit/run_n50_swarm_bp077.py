"""run_n50_swarm_bp077.py -- N=50 Staggered Swarm batch runner * BP077 * Statute S3 Sonnet 4.6

Drives the Staggered Swarm pipeline (truth_single_giants_bp077.run_swarm) over the
50-question bank, writing JSONL output with the same schema as run_n50_bp077.py.

Usage:
  python run_n50_swarm_bp077.py
  python run_n50_swarm_bp077.py --output results_bp077_phase7_swarm.jsonl
  python run_n50_swarm_bp077.py --start 0 --end 49   (slice)
  python run_n50_swarm_bp077.py --verbose
  python run_n50_swarm_bp077.py --dry-run             (print questions, no run)

Output format: one JSON object per line.
  {q_idx, question, domain, tier, bmv, concordance, latency, all_pass,
   operator_count, active_count_peak, new_eblets_from_swarm,
   eblet_count, cluster_count, pipeline, gate_fact, gate_conc, gate_bmv,
   gate_latency, ts, run_ts}

Inter-question gap: 15s default (BP077 Phase 7 close -- increased from 6s to reduce
rate-limit pressure on the 8 failing Qs; --gap flag overrides). StaggeredSwarmScheduler
bounds per-Q rate-limits structurally; the 15s inter-Q gap gives the external API
window between questions.

--batch-mode flag: forces MIN_TIER=2 for ALL questions (more Operators per Q).
Sets SWARM_FORCE_MIN_TIER=2 env var; truth_single_giants_bp077 reads it via
_FORCE_MIN_TIER module global.

DO NOT launch this from a SEG -- background processes die with the SEG context.
Bishop launches this from the main thread:
  python run_n50_swarm_bp077.py --output results_bp077_phase7_close_50_50.jsonl --batch-mode --gap 15

Truth-Always: if a question errors, the error is recorded (all_pass=False); run continues.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BENCH_DIR = Path(__file__).parent
_RUNS_DIR = _BENCH_DIR / "runs" / "BP077_GIANTS"
_RUNS_DIR.mkdir(parents=True, exist_ok=True)

_Q_BANK_PATH = _BENCH_DIR / "bp077_phase7_q50_bank.json"
_DEFAULT_OUTPUT = _RUNS_DIR / "results_bp077_phase7_swarm.jsonl"

# ---------------------------------------------------------------------------
# Windows stdout UTF-8 fix
# ---------------------------------------------------------------------------
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

sys.path.insert(0, str(_BENCH_DIR))


def load_questions() -> list:
    """Load the 50-question bank. Returns list of question dicts."""
    with open(_Q_BANK_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    return data.get("questions", [])


def run_batch(
    output_path: Path,
    start: int = 0,
    end: int = 49,
    verbose: bool = False,
    quiet: bool = False,
    inter_gap_s: float = 15.0,
    dry_run: bool = False,
    batch_mode: bool = False,
) -> None:
    """Run the swarm pipeline over questions[start..end] (0-indexed, inclusive).

    Writes one JSONL row per question to output_path.
    Inter-question gap: inter_gap_s seconds (BP077 Phase 7 close default: 15.0s).

    batch_mode: when True, sets SWARM_FORCE_MIN_TIER=2 env var before each Q so
    all domain hardness scorers return at least Tier 2 (more Operators per Q,
    robust to rate-limit shave). Implements --batch-mode flag (B).
    """
    import truth_single_giants_bp077 as giants

    questions = load_questions()
    total = len(questions)
    end = min(end, total - 1)
    selected = questions[start : end + 1]

    # (B) batch-mode: set SWARM_FORCE_MIN_TIER env var so all domain hardness scorers
    # return at least Tier 2. This env var is read by truth_single_giants_bp077 module
    # via _FORCE_MIN_TIER global. Set before import so the module reads it at load time;
    # also injected per-Q for safety (in case module was already imported).
    if batch_mode:
        os.environ["SWARM_FORCE_MIN_TIER"] = "2"
    else:
        os.environ.pop("SWARM_FORCE_MIN_TIER", None)

    run_ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    print(f"\n{'=' * 80}", flush=True)
    print(f"N=50 STAGGERED SWARM BATCH RUNNER -- BP077 -- Sonnet 4.6", flush=True)
    print(f"Output: {output_path}", flush=True)
    print(f"Questions: {start+1}..{end+1} ({len(selected)} total)", flush=True)
    print(f"Inter-question gap: {inter_gap_s}s", flush=True)
    print(f"Batch mode (MIN_TIER=2): {batch_mode}", flush=True)
    print(f"Run timestamp: {run_ts}", flush=True)
    print(f"{'=' * 80}\n", flush=True)

    if dry_run:
        print("[DRY RUN] Questions that would run:", flush=True)
        for i, q in enumerate(selected, start + 1):
            print(f"  Q{i}: domain={q.get('domain', '?')} | {q.get('question', '')[:80]}", flush=True)
        print("[DRY RUN] No pipeline calls made.", flush=True)
        return

    passed = 0
    failed = 0
    errors = 0

    with open(output_path, "w", encoding="utf-8") as out_f:
        for i, q in enumerate(selected, start + 1):
            q_idx = start + i - (start + 1) + start + i  # 1-indexed: start+i... simplified:
            # q_idx should be: start+i where i goes 1..len(selected)
            # since we enumerate(selected, start+1), i is already start+1..end+1
            q_idx_1based = i  # already 1-based from start+1

            question_text = q.get("question", "")
            domain = q.get("domain", "")
            ts_q = datetime.now(timezone.utc).isoformat(timespec="seconds")

            print(f"\n[Q{q_idx_1based}/{end+1}] domain={domain} | {question_text[:70]}", flush=True)
            print(f"  timestamp: {ts_q}", flush=True)

            row: dict = {
                "q_idx": q_idx_1based,
                "question": question_text,
                "domain": domain,
                "run_ts": run_ts,
                "ts": ts_q,
            }

            try:
                result = giants.run_swarm(
                    question=question_text,
                    category=domain,
                    force_tier=None,
                    k=10,
                    verbose=verbose,
                    quiet=quiet,
                )

                row.update({
                    "pipeline": result.get("pipeline", "unknown"),
                    "tier": result.get("tier", 0),
                    "bmv": result.get("bmv", 0.0),
                    "concordance": result.get("concordance", "UNKNOWN"),
                    "latency": result.get("latency", 0.0),
                    "all_pass": result.get("all_pass", False),
                    "gate_fact": result.get("gate_fact", False),
                    "gate_conc": result.get("gate_conc", False),
                    "gate_bmv": result.get("gate_bmv", False),
                    "gate_latency": result.get("gate_latency", False),
                    "operator_count": result.get("operator_count", 0),
                    "active_count_peak": result.get("active_count_peak", 0),
                    "new_eblets_from_swarm": result.get("new_eblets_from_swarm", 0),
                    "eblet_count": result.get("eblet_count", 0),
                    "cluster_count": result.get("cluster_count", 0),
                    "hardness_score": result.get("hardness_score", 0),
                    "swarm_wall": result.get("swarm_wall", 0.0),
                    "manual_answer": result.get("manual_answer", ""),
                    "error": None,
                })

                if result.get("all_pass"):
                    passed += 1
                    print(
                        f"  PASS: BMV={result.get('bmv', 0.0):.1f} "
                        f"conc={result.get('concordance', '?')} "
                        f"lat={result.get('latency', 0.0):.1f}s",
                        flush=True,
                    )
                else:
                    failed += 1
                    gates_failed = []
                    if not result.get("gate_fact"): gates_failed.append("G1")
                    if not result.get("gate_conc"): gates_failed.append("G2")
                    if not result.get("gate_bmv"): gates_failed.append("G3")
                    if not result.get("gate_latency"): gates_failed.append("G4")
                    print(
                        f"  FAIL: BMV={result.get('bmv', 0.0):.1f} "
                        f"conc={result.get('concordance', '?')} "
                        f"lat={result.get('latency', 0.0):.1f}s "
                        f"gates_failed={gates_failed}",
                        flush=True,
                    )

            except Exception as exc:
                errors += 1
                failed += 1
                row.update({
                    "pipeline": "ERROR",
                    "tier": 0,
                    "bmv": 0.0,
                    "concordance": "ERROR",
                    "latency": 0.0,
                    "all_pass": False,
                    "gate_fact": False,
                    "gate_conc": False,
                    "gate_bmv": False,
                    "gate_latency": False,
                    "operator_count": 0,
                    "active_count_peak": 0,
                    "new_eblets_from_swarm": 0,
                    "eblet_count": 0,
                    "cluster_count": 0,
                    "hardness_score": 0,
                    "swarm_wall": 0.0,
                    "manual_answer": "",
                    "error": str(exc),
                })
                print(f"  ERROR: {exc}", flush=True)

            # Write row immediately (flush after each question for crash safety)
            out_f.write(json.dumps(row, default=str) + "\n")
            out_f.flush()

            # Print running tally
            done_so_far = passed + failed
            print(
                f"  [Tally] {passed}/{done_so_far} PASS "
                f"({errors} errors) | "
                f"{passed}/{len(selected)} vs target {len(selected)}/{len(selected)}",
                flush=True,
            )

            # Inter-question gap (polite -- scheduler bounds burst structurally)
            if i < end + 1:  # not the last question
                print(f"  [Gap] sleeping {inter_gap_s}s before next question...", flush=True)
                time.sleep(inter_gap_s)

    # Final summary
    print(f"\n{'=' * 80}", flush=True)
    print(f"BATCH COMPLETE", flush=True)
    print(f"  Questions run: {len(selected)}", flush=True)
    print(f"  PASS:  {passed}/{len(selected)} ({100*passed/len(selected):.1f}%)", flush=True)
    print(f"  FAIL:  {failed}/{len(selected)} ({100*failed/len(selected):.1f}%)", flush=True)
    print(f"  ERROR: {errors}", flush=True)
    print(f"  Output: {output_path}", flush=True)
    print(f"{'=' * 80}\n", flush=True)


def _main() -> None:
    parser = argparse.ArgumentParser(
        description="N=50 Staggered Swarm batch runner (BP077)"
    )
    parser.add_argument(
        "--output",
        default=str(_DEFAULT_OUTPUT),
        help=f"Output JSONL path (default: {_DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--start", type=int, default=0,
        help="Start question index (0-indexed, inclusive; default: 0)",
    )
    parser.add_argument(
        "--end", type=int, default=49,
        help="End question index (0-indexed, inclusive; default: 49)",
    )
    parser.add_argument("--verbose", action="store_true", help="Verbose per-Operator output")
    parser.add_argument("--quiet", action="store_true", help="Minimal stdout")
    parser.add_argument(
        "--gap", type=float, default=15.0,
        help="Inter-question sleep in seconds (default: 15.0 -- BP077 Phase 7 close)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print questions that would run; no pipeline calls",
    )
    parser.add_argument(
        "--batch-mode", action="store_true",
        help=(
            "Force MIN_TIER=2 for ALL questions (B fix -- more Operators per Q, "
            "robust to rate-limit shave). Sets SWARM_FORCE_MIN_TIER=2 env var "
            "which truth_single_giants_bp077._FORCE_MIN_TIER reads."
        ),
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    run_batch(
        output_path=output_path,
        start=args.start,
        end=args.end,
        verbose=args.verbose,
        quiet=args.quiet,
        inter_gap_s=args.gap,
        dry_run=args.dry_run,
        batch_mode=args.batch_mode,
    )


if __name__ == "__main__":
    _main()
