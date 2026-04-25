#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_r13_k499.py — R13 Cross-Vendor Benchmark (Current-Frontier Models)
=======================================================================
K499 / Bishop B123-late / Dispatched 2026-04-26

Matrix: 8 models × 2 conditions × 50 questions = 800 LLM calls
  Vendors: OpenAI (gpt-5.5, gpt-5.4-mini)
           Anthropic (claude-opus-4-7, claude-sonnet-4-6-20260301, claude-haiku-4-5-20251001)
           Google (gemini-3.1-pro-preview, gemini-3.1-flash-lite-preview)
           Perplexity (sonar-pro)

Conditions:
  cold      — model alone, no Cathedral substrate
  cathedral — model + full R12 Cranewell corpus (K477 Iter-C full-corpus pathway)

Question bank: R12_QUESTION_BANK_CRANEWELL_SEALED.json (50 Qs, pure synthetic)
Grading: HOT/HIT/MISS deterministic (same three-tier substring rubric as R10/R12)

Strategic purpose: Opening Gambit launch (April 29, 2026) splash benchmark.
Demonstrates Cathedral Effect persists at current-frontier-model tier.

Budget: $80 hard cap ($60 pause threshold).

Usage:
    # Full run (all 8 models, both conditions, 50 questions):
    python run_r13_k499.py

    # Single vendor/model dry-run:
    python run_r13_k499.py --dry-run --vendor openai

    # Resume partial run:
    python run_r13_k499.py  (auto-resumes from existing JSONL files)

    # Force fresh:
    python run_r13_k499.py --no-resume

    # Single model test (5 questions):
    python run_r13_k499.py --model gpt-5.5 --n 5

Environment variables required:
    ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY (or GOOGLE_API_KEY), PERPLEXITY_API_KEY
    (Load from SDS.env before running)

Output: librarian-mcp/r10_cross_vendor/results_R13_K499/
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
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

RESULTS_DIR = SCRIPT_DIR / "results_R13_K499"

BANK_FILE = SCRIPT_DIR / "R12_QUESTION_BANK_CRANEWELL_SEALED.json"
COVENANT_BANK_FILE = SCRIPT_DIR / "R12_QUESTION_BANK_COVENANT_SEALED.json"
CORPUS_FILE = SCRIPT_DIR / "r12_cranewell_corpus.md"
COVENANT_CORPUS_FILE = SCRIPT_DIR / "r12_covenant_corpus.md"

# ─── Model matrix ─────────────────────────────────────────────────────────────

MODEL_MATRIX = [
    # (vendor, model_id, tier, label)
    ("openai",      "gpt-5.5",                       "top",   "GPT-5.5"),
    ("openai",      "gpt-5.4-mini",                  "mid",   "GPT-5.4-mini"),
    ("anthropic",   "claude-opus-4-7",               "top",   "Opus 4.7"),
    ("anthropic",   "claude-sonnet-4-6",             "mid",   "Sonnet 4.6"),
    ("anthropic",   "claude-haiku-4-5-20251001",     "cheap", "Haiku 4.5"),
    ("google",      "gemini-3.1-pro-preview",        "top",   "Gemini 3.1 Pro"),
    ("google",      "gemini-3.1-flash-lite-preview", "mid",   "Gemini 3.1 Flash"),
    ("perplexity",  "sonar-pro",                     "top",   "Sonar Pro"),
]

VENDOR_LABELS = {
    "openai":      "OpenAI",
    "anthropic":   "Anthropic",
    "google":      "Google",
    "perplexity":  "Perplexity",
}

ENV_KEYS = {
    "openai":     "OPENAI_API_KEY",
    "anthropic":  "ANTHROPIC_API_KEY",
    "google":     ("GEMINI_API_KEY", "GOOGLE_API_KEY"),
    "perplexity": "PERPLEXITY_API_KEY",
}

CONDITIONS = ["cold", "cathedral"]

COST_HARD_CAP  = 80.00
COST_PAUSE_AT  = 60.00
RETRY_MAX      = 3
RETRY_BASE_S   = 2.0

COLD_SYSTEM_PROMPT = (
    "You are a helpful assistant. Answer the user's question to the best of your ability. "
    "Be specific and include all relevant details. "
    "If you don't know the answer, say so clearly."
)

CATHEDRAL_HEADER = (
    "[Knight-Cathedral | Scribe: R12Cranewell | mode: full-corpus | benchmark: R13_K499]\n\n"
    "The following is authoritative reference material from a canonical local knowledge base. "
    "It represents the ground truth for the domain. "
    "Use these sources as the primary basis for your answer. "
    "If the sources do not contain the answer, say so. "
    "Do NOT supplement with web search if the sources are sufficient.\n\n"
    "=== BEGIN AUTHORITATIVE SOURCES ===\n\n"
)
CATHEDRAL_FOOTER = "\n\n=== END AUTHORITATIVE SOURCES ==="

# ─── Grading (deterministic HOT/HIT/MISS) ─────────────────────────────────────

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

def load_bank(universe: str = "cranewell") -> list[dict]:
    path = BANK_FILE if universe == "cranewell" else COVENANT_BANK_FILE
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    return d["questions"]


def load_corpus_text(universe: str = "cranewell") -> str:
    path = CORPUS_FILE if universe == "cranewell" else COVENANT_CORPUS_FILE
    return path.read_text(encoding="utf-8")


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


def get_jsonl_path(vendor: str, model_id: str, condition: str) -> Path:
    safe_model = model_id.replace("/", "_").replace(":", "_")
    return RESULTS_DIR / f"{vendor}_{safe_model}_{condition}.jsonl"


def append_record(path: Path, record: dict) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ─── API adapters ─────────────────────────────────────────────────────────────

def get_adapter(vendor: str):
    if vendor == "anthropic":
        from adapters import anthropic_adapter
        return anthropic_adapter
    elif vendor == "google":
        from adapters import google_adapter
        return google_adapter
    elif vendor == "openai":
        from adapters import openai_adapter
        return openai_adapter
    elif vendor == "perplexity":
        from adapters import perplexity_adapter
        return perplexity_adapter
    else:
        raise ValueError(f"Unknown vendor: {vendor}")


def run_one_call(adapter, model_id: str, system_prompt: str, question: str) -> dict:
    """Call adapter with exponential-backoff retries on errors."""
    last_error = None
    for attempt in range(1, RETRY_MAX + 1):
        try:
            resp = adapter.call(model_id, system_prompt, question)
            return {
                "text": resp.text,
                "input_tokens": resp.input_tokens,
                "output_tokens": resp.output_tokens,
                "cost_usd": resp.cost_usd,
                "latency_s": resp.latency_s,
                "error": None,
                "attempts": attempt,
            }
        except Exception as e:
            last_error = str(e)
            if attempt < RETRY_MAX:
                delay = RETRY_BASE_S * (2 ** (attempt - 1))
                print(f"    [retry {attempt}/{RETRY_MAX}] {last_error[:80]}… waiting {delay:.0f}s", flush=True)
                time.sleep(delay)
    return {
        "text": "",
        "input_tokens": 0,
        "output_tokens": 0,
        "cost_usd": 0.0,
        "latency_s": 0.0,
        "error": last_error,
        "attempts": RETRY_MAX,
    }


# ─── API key validation ───────────────────────────────────────────────────────

def check_env_keys(vendors: list[str]) -> list[str]:
    missing = []
    for v in vendors:
        keys = ENV_KEYS.get(v)
        if not keys:
            continue
        if isinstance(keys, tuple):
            if not any(os.environ.get(k) for k in keys):
                missing.append(f"{' or '.join(keys)} (for {VENDOR_LABELS.get(v, v)})")
        elif not os.environ.get(keys):
            missing.append(f"{keys} (for {VENDOR_LABELS.get(v, v)})")
    return missing


# ─── Cost estimation ──────────────────────────────────────────────────────────

def estimate_cost(questions: list[dict], corpus_chars: int) -> None:
    """Print pre-run cost estimate per model."""
    from adapters import openai_adapter, anthropic_adapter, google_adapter, perplexity_adapter

    adapter_map = {
        "openai": openai_adapter, "anthropic": anthropic_adapter,
        "google": google_adapter, "perplexity": perplexity_adapter,
    }

    # Rough token counts
    cold_input_tokens  = 120   # system prompt only
    cold_output_tokens = 400
    # Cathedral: corpus + overhead. Chars ≈ 4 chars/token
    cathedral_input_tokens  = (corpus_chars // 4) + 300
    cathedral_output_tokens = 400
    n = len(questions)

    print(f"\n{'─'*70}")
    print(f"{'Model':<38} {'Cold':>8} {'Cath':>9} {'Total':>8}  {'Tier':<6}")
    print(f"{'─'*70}")

    grand_total = 0.0
    for vendor, model_id, tier, label in MODEL_MATRIX:
        adapter = adapter_map.get(vendor)
        if adapter is None:
            continue
        pricing = adapter.PRICING.get(model_id, adapter.DEFAULT_PRICING)
        inp_rate = pricing["input"]   # $/M input tokens
        out_rate = pricing["output"]  # $/M output tokens

        cold_cost = n * (
            cold_input_tokens / 1_000_000 * inp_rate +
            cold_output_tokens / 1_000_000 * out_rate
        )
        cath_cost = n * (
            cathedral_input_tokens / 1_000_000 * inp_rate +
            cathedral_output_tokens / 1_000_000 * out_rate
        )
        total = cold_cost + cath_cost
        grand_total += total
        print(f"{label:<38} ${cold_cost:>6.2f}  ${cath_cost:>7.2f}  ${total:>6.2f}  {tier}")

    print(f"{'─'*70}")
    print(f"{'TOTAL (inference only)':<38} {'':>8}  {'':>9}  ${grand_total:>6.2f}")
    grading_est = grand_total * 0.15  # rough: grading is ~15% of inference cost
    print(f"{'+ grading est.':<38} {'':>8}  {'':>9}  ${grading_est:>6.2f}")
    print(f"{'GRAND TOTAL EST.':<38} {'':>8}  {'':>9}  ${grand_total + grading_est:>6.2f}")
    print(f"{'BUDGET CAP':<38} {'':>8}  {'':>9}  ${COST_HARD_CAP:>6.2f}")
    if grand_total + grading_est > COST_HARD_CAP:
        print(f"  ⚠  OVER BUDGET — reduce matrix or use cheaper models")
    else:
        headroom = COST_HARD_CAP - grand_total - grading_est
        print(f"  ✓  Headroom: ${headroom:.2f}")
    print()


# ─── Main benchmark runner ────────────────────────────────────────────────────

def run_benchmark(args: argparse.Namespace) -> None:
    # Select models to run
    matrix = MODEL_MATRIX
    if args.vendor:
        matrix = [(v, m, t, l) for v, m, t, l in matrix if v == args.vendor]
    if args.model:
        matrix = [(v, m, t, l) for v, m, t, l in matrix if m == args.model]
    if not matrix:
        print("ERROR: No models match filter.", flush=True)
        sys.exit(1)

    conditions = [args.condition] if args.condition else CONDITIONS
    vendors = list(dict.fromkeys(v for v, _, _, _ in matrix))

    # Env key check
    missing = check_env_keys(vendors)
    if missing and not args.dry_run:
        print("ERROR: Missing environment variables:")
        for m in missing:
            print(f"  • {m}")
        sys.exit(1)

    # Load bank
    questions = load_bank(args.universe)
    if args.n:
        questions = questions[: args.n]

    corpus_text = load_corpus_text(args.universe)

    # Cost estimate
    estimate_cost(questions, len(corpus_text))

    if args.dry_run:
        print("=== DRY RUN — no API calls ===")
        total_calls = len(matrix) * len(conditions) * len(questions)
        print(f"Would run: {len(matrix)} models × {len(conditions)} conditions × {len(questions)} questions = {total_calls} calls")
        for vendor, model_id, tier, label in matrix:
            for cond in conditions:
                print(f"  {vendor} / {model_id} / {cond}: {len(questions)} calls")
        return

    # Build system prompts
    cathedral_system_prompt = build_cathedral_system_prompt(corpus_text)
    print(f"Corpus loaded: {len(corpus_text):,} chars → cathedral system prompt {len(cathedral_system_prompt):,} chars")

    # Setup output
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    cost_log_path = RESULTS_DIR / "cost_log.csv"

    if not cost_log_path.exists():
        with open(cost_log_path, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow([
                "timestamp", "vendor", "model", "tier", "condition", "universe",
                "question_id", "grade", "input_tokens", "output_tokens",
                "cost_usd", "cumulative_usd", "latency_s",
            ])

    cumulative_cost = 0.0
    vendor_costs: dict[str, float] = {}
    vendor_consecutive_errors: dict[str, int] = {}
    skipped_vendors: set[str] = set()
    total_calls = len(matrix) * len(conditions) * len(questions)
    call_number = 0
    aborted = False
    abort_reason = ""
    all_results: list[dict] = []

    print(f"\n{'='*70}")
    print(f"R13 CROSS-VENDOR BENCHMARK — {timestamp}")
    print(f"Models: {len(matrix)} | Conditions: {len(conditions)} | Questions: {len(questions)} | Total calls: {total_calls}")
    print(f"Universe: {args.universe.upper()} | Budget cap: ${COST_HARD_CAP}")
    print(f"Output: {RESULTS_DIR}")
    print(f"{'='*70}\n")

    t_start = time.perf_counter()
    last_progress_report = 0

    for vendor, model_id, tier, label in matrix:
        adapter = get_adapter(vendor)

        for condition in conditions:
            system_prompt = cathedral_system_prompt if condition == "cathedral" else COLD_SYSTEM_PROMPT
            jsonl_path = get_jsonl_path(vendor, model_id, condition)

            completed_ids: set[str] = set()
            if not args.no_resume:
                completed_ids = load_completed_ids(jsonl_path)
                if completed_ids:
                    print(f"  [resume] {label}/{condition}: {len(completed_ids)} already done", flush=True)

            print(f"\n{'─'*70}")
            print(f"  {label} ({vendor}) / {condition.upper()} | {model_id}", flush=True)
            print(f"  Questions: {len(questions)} | Completed: {len(completed_ids)} | Skipped vendor: {vendor in skipped_vendors}")

            if vendor in skipped_vendors:
                print(f"  [SKIP] {vendor} skipped due to consecutive errors", flush=True)
                continue

            for q in questions:
                q_id = q["id"]
                call_number += 1

                # Abort check
                if cumulative_cost >= COST_HARD_CAP:
                    aborted = True
                    abort_reason = f"Cumulative cost ${cumulative_cost:.2f} >= ${COST_HARD_CAP} cap"
                    break

                # Pause check
                if cumulative_cost >= COST_PAUSE_AT and not args.skip_pause:
                    print(f"\n!!! PAUSE: Cumulative cost ${cumulative_cost:.2f} >= ${COST_PAUSE_AT} pause threshold !!!")
                    print("Continue? [y/N] ", end="", flush=True)
                    ans = sys.stdin.readline().strip().lower()
                    if ans != "y":
                        aborted = True
                        abort_reason = f"User paused at ${cumulative_cost:.2f}"
                        break
                    args.skip_pause = True  # Only pause once

                if q_id in completed_ids:
                    continue

                # Run call
                progress = f"[{call_number}/{total_calls}]"
                print(f"{progress} {label}/{condition}/{q_id}…", end=" ", flush=True)

                result = run_one_call(adapter, model_id, system_prompt, q["question"])

                cumulative_cost += result["cost_usd"]
                vendor_costs[vendor] = vendor_costs.get(vendor, 0.0) + result["cost_usd"]

                # Grade
                hot_elements = q.get("hot_required_elements", [])
                if result["error"]:
                    grade = "error"
                    vendor_consecutive_errors[vendor] = vendor_consecutive_errors.get(vendor, 0) + 1
                else:
                    grade = grade_response(result["text"], hot_elements)
                    vendor_consecutive_errors[vendor] = 0

                # Skip vendor on 5 consecutive errors
                if vendor_consecutive_errors.get(vendor, 0) >= 5:
                    skipped_vendors.add(vendor)
                    print(f"\n  !!! SKIPPING {vendor}: 5 consecutive errors — last: {result['error'][:80]} !!!", flush=True)

                record: dict[str, Any] = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "vendor": vendor,
                    "model": model_id,
                    "tier": tier,
                    "label": label,
                    "condition": condition,
                    "universe": args.universe,
                    "question_id": q_id,
                    "question": q.get("question", ""),
                    "hot_required_elements": hot_elements,
                    "grade": grade,
                    "response_text": result["text"],
                    "input_tokens": result["input_tokens"],
                    "output_tokens": result["output_tokens"],
                    "cost_usd": result["cost_usd"],
                    "cumulative_usd": round(cumulative_cost, 4),
                    "latency_s": result["latency_s"],
                    "error": result["error"],
                    "attempts": result["attempts"],
                    "benchmark": "R13_K499",
                }
                append_record(jsonl_path, record)
                all_results.append(record)

                # Cost log row
                with open(cost_log_path, "a", newline="", encoding="utf-8") as f:
                    csv.writer(f).writerow([
                        record["timestamp"], vendor, model_id, tier, condition, args.universe,
                        q_id, grade,
                        result["input_tokens"], result["output_tokens"],
                        result["cost_usd"], round(cumulative_cost, 4), result["latency_s"],
                    ])

                # Progress print
                err_flag = f" [{result['error'][:30]}…]" if result["error"] else ""
                print(f"{grade}{err_flag} | ${result['cost_usd']:.4f} | cum: ${cumulative_cost:.2f} | {result['latency_s']:.1f}s", flush=True)

                # Progress report every 50 calls
                if call_number - last_progress_report >= 50:
                    last_progress_report = call_number
                    _print_interim_summary(all_results, call_number, total_calls, cumulative_cost)

            if aborted:
                break
        if aborted:
            break

    wall_time = time.perf_counter() - t_start
    _write_results_summary(all_results, cumulative_cost, wall_time, aborted, abort_reason, args.universe)

    print(f"\n{'='*70}")
    print(f"R13 BENCHMARK {'ABORTED' if aborted else 'COMPLETE'}")
    if aborted:
        print(f"  Reason: {abort_reason}")
    print(f"  Total cost: ${cumulative_cost:.2f}")
    print(f"  Wall time:  {wall_time:.0f}s ({wall_time/60:.1f} min)")
    print(f"  Calls done: {call_number}/{total_calls}")
    print(f"  Results:    {RESULTS_DIR}")
    print(f"{'='*70}")


# ─── Summary helpers ──────────────────────────────────────────────────────────

def _print_interim_summary(results: list[dict], call_num: int, total: int, cumulative: float) -> None:
    print(f"\n{'─'*60}")
    print(f"  PROGRESS CHECKPOINT [{call_num}/{total} calls | ${cumulative:.2f}]")
    # Group by model + condition
    groups: dict[str, dict] = {}
    for r in results:
        key = f"{r['label']}/{r['condition']}"
        g = groups.setdefault(key, {"HOT": 0, "HIT": 0, "MISS": 0, "error": 0, "n": 0})
        g[r.get("grade", "error")] = g.get(r.get("grade", "error"), 0) + 1
        g["n"] += 1
    for key, g in sorted(groups.items()):
        n = g["n"]
        hot_pct = round(100 * g["HOT"] / max(1, n - g.get("error", 0)), 1)
        print(f"    {key:<45} HOT={hot_pct:>5.1f}% ({g['HOT']}/{n - g.get('error', 0)})")
    print(f"{'─'*60}\n", flush=True)


def _write_results_summary(
    results: list[dict],
    total_cost: float,
    wall_time: float,
    aborted: bool,
    abort_reason: str,
    universe: str,
) -> None:
    summary: dict[str, Any] = {
        "benchmark": "R13_K499",
        "protocol": "Cross-Vendor Frontier-Model Benchmark",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "universe": universe,
        "total_calls": len(results),
        "total_cost_usd": round(total_cost, 4),
        "wall_time_s": round(wall_time, 1),
        "aborted": aborted,
        "abort_reason": abort_reason if aborted else None,
        "model_condition_results": {},
    }

    groups: dict[str, list[dict]] = {}
    for r in results:
        key = f"{r['vendor']}|{r['model']}|{r['condition']}"
        groups.setdefault(key, []).append(r)

    for key, items in sorted(groups.items()):
        vendor, model_id, condition = key.split("|")
        graded = [i for i in items if i.get("grade") in ("HOT", "HIT", "MISS")]
        hot = sum(1 for i in graded if i["grade"] == "HOT")
        hit = sum(1 for i in graded if i["grade"] == "HIT")
        miss = sum(1 for i in graded if i["grade"] == "MISS")
        errors = sum(1 for i in items if i.get("grade") == "error")
        n = len(graded)
        cost_usd = round(sum(i.get("cost_usd", 0) for i in items), 4)
        avg_latency = round(sum(i.get("latency_s", 0) for i in items) / max(1, len(items)), 2)

        label = next((l for v, m, t, l in MODEL_MATRIX if m == model_id), model_id)
        tier = next((t for v, m, t, l in MODEL_MATRIX if m == model_id), "?")

        summary["model_condition_results"][key] = {
            "vendor": vendor,
            "model": model_id,
            "label": label,
            "tier": tier,
            "condition": condition,
            "n_graded": n,
            "n_errors": errors,
            "HOT": hot,
            "HIT": hit,
            "MISS": miss,
            "hot_pct": round(100 * hot / max(1, n), 1),
            "hit_pct": round(100 * hit / max(1, n), 1),
            "miss_pct": round(100 * miss / max(1, n), 1),
            "cost_usd": cost_usd,
            "avg_latency_s": avg_latency,
        }

    summary_path = RESULTS_DIR / "results_summary_R13_K499.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"\nSummary written → {summary_path}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="R13 Cross-Vendor Frontier-Model Benchmark (K499/B123)"
    )
    parser.add_argument("--vendor", choices=["openai", "anthropic", "google", "perplexity"],
                        help="Run only this vendor")
    parser.add_argument("--model", help="Run only this specific model ID")
    parser.add_argument("--condition", choices=CONDITIONS,
                        help="Run only this condition (default: both)")
    parser.add_argument("--universe", choices=["cranewell", "covenant"], default="cranewell",
                        help="Question bank universe (default: cranewell)")
    parser.add_argument("--n", type=int,
                        help="Limit questions (default: all 50)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print plan + cost estimate without calling APIs")
    parser.add_argument("--no-resume", action="store_true",
                        help="Ignore existing partial results; start fresh")
    parser.add_argument("--skip-pause", action="store_true",
                        help=f"Skip the ${COST_PAUSE_AT} pause checkpoint")
    args = parser.parse_args()
    run_benchmark(args)


if __name__ == "__main__":
    main()
