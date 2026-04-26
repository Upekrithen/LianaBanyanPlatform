#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_local_llm_k511.py — K511 Local-LLM Cathedral Effect Empirical Test
========================================================================
K511 / Bishop B125 / Dispatched 2026-04-26

Purpose:
  Replicate the R13 Cathedral Effect measurement on a LOCAL LLM (Ollama,
  Llama 3.3 70B Q4) using the same sealed Cranewell question bank and
  Cranewell corpus used in R13_K499.  Provides Layer-6 defense evidence
  that the Cathedral Effect persists under local inference (no vendor lock,
  no internet dependency, no API key).

Matrix: 1 model × 2 conditions × 50 questions = 100 LLM calls
  Model:   llama3.1:8b-instruct-q4_K_M  (Ollama local)
  Cold:    model alone, no Cathedral substrate
  Cathedral: model + full R12 Cranewell corpus (same protocol as R13)

Question bank: R12_QUESTION_BANK_CRANEWELL_SEALED.json (50 Qs, same as R13)
Corpus: r12_cranewell_corpus.md (same as R13)
Grading: HOT/HIT/MISS deterministic (same three-tier substring rubric)

Cloud cost: $0 (all local)
Active Knight work: ~6-10 hr  |  Wallclock: ~12-24 hr

Tag-on-close: v-local-llm-cathedral-test-K511

Usage:
    # Full run (both conditions, all 50 questions):
    python run_local_llm_k511.py

    # Smoke test (5 questions, both conditions):
    python run_local_llm_k511.py --n 5

    # Cold only:
    python run_local_llm_k511.py --condition cold

    # Cathedral only:
    python run_local_llm_k511.py --condition cathedral

    # Dry-run (no calls, just plan):
    python run_local_llm_k511.py --dry-run

    # Resume partial run (default — auto-skips completed question IDs):
    python run_local_llm_k511.py

    # Force fresh start:
    python run_local_llm_k511.py --no-resume

    # Custom model:
    python run_local_llm_k511.py --model llama3.1:8b

Prerequisites:
    - Ollama running at http://localhost:11434
    - Model pulled: ollama pull llama3.1:8b-instruct-q4_K_M
    - Python 3.9+ (no extra packages; uses stdlib only for Ollama calls)

Output: librarian-mcp/r10_cross_vendor/results_local_llm_k511/
  - local_llama33_cold.jsonl
  - local_llama33_cathedral.jsonl
  - cost_log.csv
  - results_summary_local_llm_k511.json  (written at end)
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR  = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

RESULTS_DIR = SCRIPT_DIR / "results_local_llm_k511"
BANK_FILE   = SCRIPT_DIR / "R12_QUESTION_BANK_CRANEWELL_SEALED.json"
CORPUS_FILE = SCRIPT_DIR / "r12_cranewell_corpus.md"

# ─── Model config ─────────────────────────────────────────────────────────────

DEFAULT_MODEL = "llama3.1:8b-instruct-q4_K_M"
MODEL_LABEL   = "Llama 3.1 8B Q4"
VENDOR_LABEL  = "ollama_local"

CONDITIONS = ["cold", "cathedral"]

RETRY_MAX    = 3
RETRY_BASE_S = 5.0   # local model: longer delays between retries

COLD_SYSTEM_PROMPT = (
    "You are a helpful assistant. Answer the user's question to the best of your ability. "
    "Be specific and include all relevant details. "
    "If you don't know the answer, say so clearly."
)

CATHEDRAL_HEADER = (
    "[Knight-Cathedral | Scribe: R12Cranewell | mode: full-corpus | benchmark: K511_LocalLLM]\n\n"
    "The following is authoritative reference material from a canonical local knowledge base. "
    "It represents the ground truth for the domain. "
    "Use these sources as the primary basis for your answer. "
    "If the sources do not contain the answer, say so. "
    "Do NOT supplement with web search if the sources are sufficient.\n\n"
    "=== BEGIN AUTHORITATIVE SOURCES ===\n\n"
)
CATHEDRAL_FOOTER = "\n\n=== END AUTHORITATIVE SOURCES ==="

# ─── Grading (deterministic HOT/HIT/MISS — identical to R13 rubric) ──────────

def grade_response(response_text: str, required_elements: list[str]) -> str:
    """Three-tier substring rubric: HOT=all elements, HIT>=ceil(n/2), MISS=rest."""
    if not required_elements:
        return "ungraded"
    t = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in t)
    n = len(required_elements)
    if hits == n:
        return "HOT"
    if hits >= math.ceil(n / 2):
        return "HIT"
    return "MISS"


# ─── Bank / corpus loading ────────────────────────────────────────────────────

def load_bank() -> list[dict]:
    if not BANK_FILE.exists():
        print(f"ERROR: Question bank not found: {BANK_FILE}", file=sys.stderr)
        sys.exit(1)
    with open(BANK_FILE, encoding="utf-8") as f:
        d = json.load(f)
    return d["questions"]


def load_corpus_text() -> str:
    if not CORPUS_FILE.exists():
        print(f"ERROR: Corpus file not found: {CORPUS_FILE}", file=sys.stderr)
        sys.exit(1)
    return CORPUS_FILE.read_text(encoding="utf-8")


def build_cathedral_system_prompt(corpus_text: str) -> str:
    return CATHEDRAL_HEADER + corpus_text + CATHEDRAL_FOOTER


# ─── Resume helpers ───────────────────────────────────────────────────────────

def load_completed_ids(jsonl_path: Path) -> set[str]:
    if not jsonl_path.exists():
        return set()
    done: set[str] = set()
    with open(jsonl_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if rec.get("grade") in ("HOT", "HIT", "MISS", "error"):
                    done.add(rec["question_id"])
            except Exception:
                pass
    return done


def get_jsonl_path(condition: str, model: str) -> Path:
    safe_model = model.replace("/", "_").replace(":", "_")
    return RESULTS_DIR / f"local_{safe_model}_{condition}.jsonl"


def append_record(path: Path, record: dict) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ─── Ollama call with retry ───────────────────────────────────────────────────

def run_one_call(model: str, system_prompt: str, question: str) -> dict:
    """Call Ollama adapter with exponential-backoff retries."""
    from adapters import ollama_adapter
    last_error = None
    for attempt in range(1, RETRY_MAX + 1):
        try:
            resp = ollama_adapter.call(model, system_prompt, question)
            return {
                "text":         resp.text,
                "input_tokens": resp.input_tokens,
                "output_tokens": resp.output_tokens,
                "cost_usd":     resp.cost_usd,
                "latency_s":    resp.latency_s,
                "error":        None,
                "attempts":     attempt,
            }
        except Exception as e:
            last_error = str(e)
            if attempt < RETRY_MAX:
                delay = RETRY_BASE_S * (2 ** (attempt - 1))
                print(
                    f"    [retry {attempt}/{RETRY_MAX}] {last_error[:80]}… waiting {delay:.0f}s",
                    flush=True,
                )
                time.sleep(delay)
    return {
        "text":         "",
        "input_tokens": 0,
        "output_tokens": 0,
        "cost_usd":     0.0,
        "latency_s":    0.0,
        "error":        last_error,
        "attempts":     RETRY_MAX,
    }


# ─── Summary helpers ──────────────────────────────────────────────────────────

def _print_interim_summary(results: list[dict], call_num: int, total: int) -> None:
    print(f"\n{'─'*60}")
    print(f"  PROGRESS [{call_num}/{total} calls]")
    groups: dict[str, dict] = {}
    for r in results:
        key = f"{r['model']}/{r['condition']}"
        g = groups.setdefault(key, {"HOT": 0, "HIT": 0, "MISS": 0, "error": 0, "n": 0})
        g[r.get("grade", "error")] = g.get(r.get("grade", "error"), 0) + 1
        g["n"] += 1
    for key, g in sorted(groups.items()):
        n = g["n"]
        graded = max(1, n - g.get("error", 0))
        hot_pct = round(100 * g["HOT"] / graded, 1)
        print(f"    {key:<50} HOT={hot_pct:>5.1f}% ({g['HOT']}/{graded})")
    print(f"{'─'*60}\n", flush=True)


def _write_results_summary(
    results: list[dict],
    wall_time: float,
    aborted: bool,
    abort_reason: str,
    model: str,
) -> None:
    summary: dict = {
        "benchmark": "K511_LocalLLM",
        "protocol":  "Local-LLM Cathedral Effect Empirical Test",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model": model,
        "model_label": MODEL_LABEL,
        "vendor": VENDOR_LABEL,
        "total_calls":    len(results),
        "total_cost_usd": 0.0,   # local — $0
        "wall_time_s":    round(wall_time, 1),
        "aborted": aborted,
        "abort_reason": abort_reason if aborted else None,
        "condition_results": {},
    }

    for condition in CONDITIONS:
        items = [r for r in results if r["condition"] == condition]
        graded = [i for i in items if i.get("grade") in ("HOT", "HIT", "MISS")]
        errors = [i for i in items if i.get("grade") == "error"]
        n = len(graded)
        hot  = sum(1 for i in graded if i["grade"] == "HOT")
        hit  = sum(1 for i in graded if i["grade"] == "HIT")
        miss = sum(1 for i in graded if i["grade"] == "MISS")
        latencies = [i["latency_s"] for i in items if i.get("latency_s")]
        avg_lat = round(sum(latencies) / max(1, len(latencies)), 2)
        input_toks  = sum(i.get("input_tokens", 0)  for i in items)
        output_toks = sum(i.get("output_tokens", 0) for i in items)

        summary["condition_results"][condition] = {
            "condition":       condition,
            "n_graded":        n,
            "n_errors":        len(errors),
            "HOT":             hot,
            "HIT":             hit,
            "MISS":            miss,
            "hot_pct":         round(100 * hot / max(1, n), 1),
            "hit_pct":         round(100 * hit / max(1, n), 1),
            "miss_pct":        round(100 * miss / max(1, n), 1),
            "total_input_tokens":  input_toks,
            "total_output_tokens": output_toks,
            "avg_latency_s":   avg_lat,
        }

    # Compute lift vs cold
    cold = summary["condition_results"].get("cold", {})
    cath = summary["condition_results"].get("cathedral", {})
    if cold and cath:
        cold_hot_pct = cold["hot_pct"]
        cath_hot_pct = cath["hot_pct"]
        lift_pp = round(cath_hot_pct - cold_hot_pct, 1)
        summary["cathedral_lift_pp"] = lift_pp
        summary["cold_hot_pct"]      = cold_hot_pct
        summary["cathedral_hot_pct"] = cath_hot_pct

    summary_path = RESULTS_DIR / "results_summary_local_llm_k511.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"\nSummary written → {summary_path}")

    # Print compact final table
    print(f"\n{'='*65}")
    print(f"K511 LOCAL LLM RESULTS  —  {MODEL_LABEL}  —  Cranewell bank (n=50)")
    print(f"{'='*65}")
    print(f"{'Condition':<15} {'HOT%':>7}  {'HIT%':>6}  {'MISS%':>6}  {'N':>4}  {'Avg lat':>8}")
    print(f"{'─'*65}")
    for cond in CONDITIONS:
        cr = summary["condition_results"].get(cond)
        if cr:
            print(
                f"{cond:<15} {cr['hot_pct']:>6.1f}%  {cr['hit_pct']:>5.1f}%  "
                f"{cr['miss_pct']:>5.1f}%  {cr['n_graded']:>4}  {cr['avg_latency_s']:>7.1f}s"
            )
    if "cathedral_lift_pp" in summary:
        print(f"{'─'*65}")
        print(f"Cathedral lift vs cold: +{summary['cathedral_lift_pp']:.1f}pp HOT")
        # R13 reference
        print(f"R13 mean lift (8 cloud models):  +86.2pp HOT")
    print(f"{'='*65}")


# ─── Main benchmark runner ────────────────────────────────────────────────────

def run_benchmark(args: argparse.Namespace) -> None:
    from adapters import ollama_adapter

    model = args.model

    # Ollama health check
    if not args.dry_run:
        if not ollama_adapter.health_check(timeout=5):
            print(
                "\nERROR: Ollama is not running or not reachable at http://localhost:11434",
                file=sys.stderr,
            )
            print("Start Ollama with: ollama serve", file=sys.stderr)
            sys.exit(1)

        pulled = ollama_adapter.list_models()
        if model not in pulled:
            # Try partial match (e.g. llama3.3 without exact tag)
            matches = [m for m in pulled if m.startswith(model.split(":")[0])]
            if matches:
                print(f"  [info] Exact model '{model}' not found; using closest: {matches[0]}")
                model = matches[0]
            else:
                print(
                    f"\nERROR: Model '{model}' not found in Ollama. Pulled models: {pulled}",
                    file=sys.stderr,
                )
                print(f"Pull it with: ollama pull {model}", file=sys.stderr)
                sys.exit(1)

    conditions = [args.condition] if args.condition else CONDITIONS

    # Load bank and corpus
    questions = load_bank()
    if args.n:
        questions = questions[: args.n]

    corpus_text = load_corpus_text()
    cathedral_system_prompt = build_cathedral_system_prompt(corpus_text)

    total_calls = len(conditions) * len(questions)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    print(f"\n{'='*70}")
    print(f"K511 LOCAL-LLM CATHEDRAL BENCHMARK — {timestamp}")
    print(f"Model:      {model}")
    print(f"Conditions: {conditions}")
    print(f"Questions:  {len(questions)} | Total calls: {total_calls}")
    print(f"Corpus:     {len(corpus_text):,} chars → cathedral prompt {len(cathedral_system_prompt):,} chars")
    print(f"Output:     {RESULTS_DIR}")
    print(f"{'='*70}\n")

    if args.dry_run:
        print("=== DRY RUN — no API calls ===")
        for cond in conditions:
            sys_prompt = cathedral_system_prompt if cond == "cathedral" else COLD_SYSTEM_PROMPT
            print(f"  {model}/{cond}: {len(questions)} calls | system prompt {len(sys_prompt):,} chars")
        return

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    cost_log_path = RESULTS_DIR / "cost_log.csv"
    if not cost_log_path.exists():
        with open(cost_log_path, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow([
                "timestamp", "model", "condition", "question_id", "grade",
                "input_tokens", "output_tokens", "latency_s",
            ])

    all_results: list[dict] = []
    call_number = 0
    aborted = False
    abort_reason = ""
    consecutive_errors = 0

    t_start = time.perf_counter()
    last_progress_report = 0

    for condition in conditions:
        system_prompt = cathedral_system_prompt if condition == "cathedral" else COLD_SYSTEM_PROMPT
        jsonl_path = get_jsonl_path(condition, model)

        completed_ids: set[str] = set()
        if not args.no_resume:
            completed_ids = load_completed_ids(jsonl_path)
            if completed_ids:
                print(f"  [resume] {model}/{condition}: {len(completed_ids)} already done", flush=True)

        print(f"\n{'─'*70}")
        print(f"  {MODEL_LABEL} / {condition.upper()} | {model}", flush=True)
        print(f"  Questions: {len(questions)} | Completed: {len(completed_ids)}")

        for q in questions:
            q_id = q["id"]
            call_number += 1

            if q_id in completed_ids:
                continue

            progress = f"[{call_number}/{total_calls}]"
            print(f"{progress} {model}/{condition}/{q_id}…", end=" ", flush=True)

            result = run_one_call(model, system_prompt, q["question"])

            # Grade
            hot_elements = q.get("hot_required_elements", [])
            if result["error"]:
                grade = "error"
                consecutive_errors += 1
            else:
                grade = grade_response(result["text"], hot_elements)
                consecutive_errors = 0

            # Abort on 5 consecutive errors (Ollama unresponsive)
            if consecutive_errors >= 5:
                aborted = True
                abort_reason = f"5 consecutive errors — last: {result['error'][:120]}"
                print(f"\n!!! ABORTING: {abort_reason}", flush=True)
                break

            record: dict = {
                "timestamp":           datetime.now(timezone.utc).isoformat(),
                "vendor":              VENDOR_LABEL,
                "model":               model,
                "model_label":         MODEL_LABEL,
                "condition":           condition,
                "question_id":         q_id,
                "question":            q.get("question", ""),
                "hot_required_elements": hot_elements,
                "grade":               grade,
                "response_text":       result["text"],
                "input_tokens":        result["input_tokens"],
                "output_tokens":       result["output_tokens"],
                "cost_usd":            0.0,
                "latency_s":           result["latency_s"],
                "error":               result["error"],
                "attempts":            result["attempts"],
                "benchmark":           "K511_LocalLLM",
            }
            append_record(jsonl_path, record)
            all_results.append(record)

            with open(cost_log_path, "a", newline="", encoding="utf-8") as f:
                csv.writer(f).writerow([
                    record["timestamp"], model, condition, q_id, grade,
                    result["input_tokens"], result["output_tokens"], result["latency_s"],
                ])

            err_flag = f" [{result['error'][:30]}…]" if result["error"] else ""
            print(
                f"{grade}{err_flag} | {result['latency_s']:.1f}s | "
                f"in={result['input_tokens']} out={result['output_tokens']}",
                flush=True,
            )

            # Progress report every 10 calls
            if call_number - last_progress_report >= 10:
                last_progress_report = call_number
                _print_interim_summary(all_results, call_number, total_calls)

        if aborted:
            break

    wall_time = time.perf_counter() - t_start
    _write_results_summary(all_results, wall_time, aborted, abort_reason, model)

    print(f"\n{'='*70}")
    print(f"K511 BENCHMARK {'ABORTED' if aborted else 'COMPLETE'}")
    if aborted:
        print(f"  Reason: {abort_reason}")
    print(f"  Wall time: {wall_time:.0f}s ({wall_time/60:.1f} min)")
    print(f"  Calls done: {call_number}/{total_calls}")
    print(f"  Results:    {RESULTS_DIR}")
    print(f"{'='*70}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="K511 Local-LLM Cathedral Effect Benchmark (Ollama / Llama 3.3 70B Q4)"
    )
    parser.add_argument(
        "--model", default=DEFAULT_MODEL,
        help=f"Ollama model tag (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--condition", choices=CONDITIONS,
        help="Run only this condition (default: both)",
    )
    parser.add_argument(
        "--n", type=int,
        help="Limit to N questions (default: all 50)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print plan without calling Ollama",
    )
    parser.add_argument(
        "--no-resume", action="store_true",
        help="Ignore existing partial results; start fresh",
    )
    args = parser.parse_args()
    run_benchmark(args)


if __name__ == "__main__":
    main()
