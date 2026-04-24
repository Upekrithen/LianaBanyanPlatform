#!/usr/bin/env python3
"""
K455b Mode A — Pawn (Perplexity API) Attribution-Isolation Benchmark
======================================================================
Runs 50 R11 questions through the Perplexity Sonar API to test whether
Cathedral-effect lift is attributable to Cathedral content alone, with NO
ambient Librarian/LB infrastructure in the call path.

Architecture:
  - Perplexity API has no MCP support — Cathedral content can only reach
    the model via explicit in-prompt inclusion. No ghost-help possible.
  - Arm 1 (control):  25 questions, bare (no Cathedral content)
  - Arm 2 (treatment): 25 questions, Cathedral paste as system prompt

Attribution isolation: if HOT lift reproduces here, Cathedral contribution
is isolated, clean, and unambiguous (no ambient LB infrastructure needed).

Results: BISHOP_DROPZONE/K455b_playbook/results/
         → K455b_log.jsonl        (per-question raw responses + grades)
         → K455b_summary.json     (aggregate HOT/HIT/MISS per arm + lift)

Usage:
    python run_r11_k455b.py [--dry-run] [--model sonar-pro]

Env:
    PERPLEXITY_API_KEY  (from Asteroid-ProofVault/LockBox/SDS.env or DOUBLESECRET.env)
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent
sys.path.insert(0, str(SCRIPT_DIR))
sys.path.insert(0, str(SCRIPT_DIR / "r11_adapters"))

QUESTION_BANK_PATH = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED.json"
SNAPSHOT_PATH = WORKSPACE_ROOT / "BISHOP_DROPZONE" / "K455b_playbook" / "pawn_cathedral_snapshot.md"
RESULTS_DIR = WORKSPACE_ROOT / "BISHOP_DROPZONE" / "K455b_playbook" / "results"
LOG_PATH = RESULTS_DIR / "K455b_log.jsonl"
SUMMARY_PATH = RESULTS_DIR / "K455b_summary.json"

SESSION = "K455b"
MODEL_DEFAULT = "sonar-pro"

PRICING = {
    "sonar":               {"input": 1.00,  "output": 1.00},
    "sonar-pro":           {"input": 3.00,  "output": 15.00},
    "sonar-reasoning":     {"input": 1.00,  "output": 5.00},
    "sonar-reasoning-pro": {"input": 2.00,  "output": 8.00},
}
DEFAULT_PRICING = {"input": 3.00, "output": 15.00}

# Attribution-isolation system prompts
CATHEDRAL_SYSTEM_TEMPLATE = """\
You are Pawn, a cooperative member of Liana Banyan, with access to your Cathedral of Scribes.
The content below is from your Cathedral. Use ONLY this reference material to answer questions.
Do NOT search the web for supplementary information. If the answer is in your Cathedral, reproduce
the exact values precisely. If the answer is NOT in your Cathedral, say "I don't know."

{snapshot}
"""

BARE_SYSTEM = (
    "You are a helpful assistant. Answer the following question to the best of your ability "
    "using only your training knowledge. Do NOT invent facts. If you are uncertain, say so."
)


def load_question_bank() -> list[dict]:
    with open(QUESTION_BANK_PATH, encoding="utf-8") as f:
        bank = json.load(f)
    return bank["questions"]


def load_snapshot() -> str:
    if not SNAPSHOT_PATH.exists():
        raise FileNotFoundError(
            f"Cathedral snapshot not found at {SNAPSHOT_PATH}\n"
            "Run: node librarian-mcp/scripts/generate-pawn-snapshot.mjs"
        )
    return SNAPSHOT_PATH.read_text(encoding="utf-8")


def primary_grade(response_text: str, question_obj: dict) -> str:
    """HOT/HIT/MISS substring grading (same rubric as K455c/K455a)."""
    rt_lower = response_text.lower()
    hot_elements = question_obj.get("hot_required_elements", [])
    hit_elements = question_obj.get("hit_required_elements", [])

    # HOT: all required elements present
    if hot_elements and all(
        str(el).lower() in rt_lower for el in hot_elements
    ):
        return "HOT"

    # HIT: at least one partial element present
    if hit_elements and any(
        str(el).lower() in rt_lower for el in hit_elements
    ):
        return "HIT"

    return "MISS"


def call_perplexity(
    question: str,
    system_prompt: str,
    model: str,
    dry_run: bool = False,
) -> dict:
    """Call Perplexity API and return response details."""
    if dry_run:
        return {
            "text": f"[DRY-RUN] Would call {model} with question: {question[:80]}...",
            "input_tokens": 0,
            "output_tokens": 0,
            "cost_usd": 0.0,
            "latency_s": 0.0,
        }

    from openai import OpenAI

    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        raise EnvironmentError("PERPLEXITY_API_KEY not set.")

    client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
    pricing = PRICING.get(model, DEFAULT_PRICING)

    t0 = time.perf_counter()
    response = client.chat.completions.create(
        model=model,
        max_tokens=512,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
    )
    latency = time.perf_counter() - t0

    usage = response.usage
    input_tokens = usage.prompt_tokens if usage else 0
    output_tokens = usage.completion_tokens if usage else 0
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]

    choice = response.choices[0] if response.choices else None
    text = (choice.message.content or "") if choice else ""

    return {
        "text": text,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": round(cost, 6),
        "latency_s": round(latency, 3),
    }


def run_k455b(args: argparse.Namespace) -> None:
    print(f"\n{'='*60}")
    print(f"  K455b Mode A: Pawn Cathedral Attribution-Isolation Test")
    print(f"  Model: {args.model}  |  {'DRY-RUN' if args.dry_run else 'LIVE'}")
    print(f"{'='*60}\n")

    questions = load_question_bank()
    snapshot_text = load_snapshot()

    print(f"Loaded {len(questions)} questions from R11 question bank.")
    print(f"Snapshot length: {len(snapshot_text):,} chars (~{len(snapshot_text)//4:,} tokens)")

    # Split: questions[0:25] → Arm 1 (bare), questions[25:50] → Arm 2 (Cathedral)
    arm1_questions = questions[:25]
    arm2_questions = questions[25:]

    print(f"\nArm 1 (bare/control): {len(arm1_questions)} questions")
    print(f"Arm 2 (Cathedral/treatment): {len(arm2_questions)} questions")
    print()

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    total_cost = 0.0
    BUDGET_CAP_USD = 5.00  # K455b attribution test budget cap

    cathedral_system = CATHEDRAL_SYSTEM_TEMPLATE.format(snapshot=snapshot_text)

    def run_arm(questions_slice: list[dict], arm: str, system_prompt: str) -> None:
        nonlocal total_cost
        for i, q in enumerate(questions_slice, 1):
            q_num = i if arm == "control" else i + 25
            print(f"  [{arm.upper()} Q{q_num:02d}/{len(questions)}] {q['id']} — {q['question'][:60]}...")

            if total_cost >= BUDGET_CAP_USD:
                print(f"\n  BUDGET CAP ${BUDGET_CAP_USD:.2f} reached — stopping.")
                return

            resp = call_perplexity(
                question=q["question"],
                system_prompt=system_prompt,
                model=args.model,
                dry_run=args.dry_run,
            )

            grade = primary_grade(resp["text"], q)
            total_cost += resp["cost_usd"]

            record = {
                "question_id": q["id"],
                "arm": arm,
                "category": q.get("category"),
                "question_text": q["question"],
                "ground_truth": q.get("canonical_answer", ""),
                "pawn_response_text": resp["text"],
                "grade": grade,
                "input_tokens": resp["input_tokens"],
                "output_tokens": resp["output_tokens"],
                "cost_usd": resp["cost_usd"],
                "latency_s": resp["latency_s"],
                "model": args.model,
                "session": SESSION,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "screenshot_path": None,  # Mode A: no screenshots
                "notes": "",
            }
            results.append(record)

            grade_emoji = "[HOT]" if grade == "HOT" else ("[HIT]" if grade == "HIT" else "[MISS]")
            print(f"         {grade_emoji} {grade}  (cost: ${resp['cost_usd']:.4f}, lat: {resp['latency_s']:.2f}s)")

            if not args.dry_run:
                with open(LOG_PATH, "a", encoding="utf-8") as f:
                    f.write(json.dumps(record) + "\n")

            time.sleep(0.5)  # Rate-limit polite spacing

    print("--- ARM 1: BARE (no Cathedral) --------------------------")
    run_arm(arm1_questions, "control", BARE_SYSTEM)

    print(f"\n--- ARM 2: CATHEDRAL PASTE ------------------------------")
    run_arm(arm2_questions, "treatment", cathedral_system)

    # Aggregate results
    arm1_results = [r for r in results if r["arm"] == "control"]
    arm2_results = [r for r in results if r["arm"] == "treatment"]

    def grade_counts(records: list[dict]) -> dict:
        n = len(records)
        hot = sum(1 for r in records if r["grade"] == "HOT")
        hit = sum(1 for r in records if r["grade"] == "HIT")
        miss = sum(1 for r in records if r["grade"] == "MISS")
        return {
            "n": n,
            "HOT": hot,
            "HIT": hit,
            "MISS": miss,
            "hot_pct": round(100 * hot / n, 1) if n else 0,
            "hit_pct": round(100 * hit / n, 1) if n else 0,
            "miss_pct": round(100 * miss / n, 1) if n else 0,
        }

    arm1_stats = grade_counts(arm1_results)
    arm2_stats = grade_counts(arm2_results)

    hot_lift_pp = arm2_stats["hot_pct"] - arm1_stats["hot_pct"]

    # Cathedral Effect taxonomy (same as K455c/K455a)
    if hot_lift_pp >= 20:
        effect_class = "Strong"
    elif hot_lift_pp >= 10:
        effect_class = "Weak"
    elif hot_lift_pp >= -5:
        effect_class = "Null"
    else:
        effect_class = "Negative"

    # Attribution ratification
    if hot_lift_pp >= 10:
        attribution_verdict = (
            "CONFIRMED CLEAN: Cathedral-effect lift reproduced via Perplexity API "
            "with no ambient LB infrastructure in call path. Attribution is isolated."
        )
    elif hot_lift_pp >= 0:
        attribution_verdict = (
            "WEAK / INCONCLUSIVE: Some positive lift observed but below +10pp threshold "
            "for confident attribution. May be noise or smaller effect at Sonar-Pro scale."
        )
    else:
        attribution_verdict = (
            "NOT CONFIRMED: Negative or zero lift. K455c/K455a lift may have been "
            "environment-assisted. Requires further investigation."
        )

    total_cost_all = sum(r["cost_usd"] for r in results)
    total_input_tokens = sum(r["input_tokens"] for r in results)
    total_output_tokens = sum(r["output_tokens"] for r in results)
    avg_latency = (
        sum(r["latency_s"] for r in results) / len(results)
        if results else 0
    )

    summary = {
        "session": SESSION,
        "model": args.model,
        "mode": "A — Knight-automated Perplexity API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dry_run": args.dry_run,
        "arm1_control": arm1_stats,
        "arm2_treatment": arm2_stats,
        "hot_lift_pp": round(hot_lift_pp, 1),
        "cathedral_effect_class": effect_class,
        "attribution_verdict": attribution_verdict,
        "cost_summary": {
            "total_usd": round(total_cost_all, 4),
            "input_tokens": total_input_tokens,
            "output_tokens": total_output_tokens,
            "avg_latency_s": round(avg_latency, 3),
        },
    }

    if not args.dry_run:
        with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)

    # Print results
    print(f"\n{'='*60}")
    print(f"  K455b Mode A: RESULTS")
    print(f"{'='*60}")
    print(f"\n  Arm 1 (bare/control, n={arm1_stats['n']}):")
    print(f"    HOT: {arm1_stats['HOT']} ({arm1_stats['hot_pct']}%)")
    print(f"    HIT: {arm1_stats['HIT']} ({arm1_stats['hit_pct']}%)")
    print(f"    MISS: {arm1_stats['MISS']} ({arm1_stats['miss_pct']}%)")

    print(f"\n  Arm 2 (Cathedral paste, n={arm2_stats['n']}):")
    print(f"    HOT: {arm2_stats['HOT']} ({arm2_stats['hot_pct']}%)")
    print(f"    HIT: {arm2_stats['HIT']} ({arm2_stats['hit_pct']}%)")
    print(f"    MISS: {arm2_stats['MISS']} ({arm2_stats['miss_pct']}%)")

    sign = "+" if hot_lift_pp >= 0 else ""
    print(f"\n  Cathedral Effect HOT Lift: {sign}{hot_lift_pp}pp => {effect_class}")
    print(f"  Attribution Verdict: {attribution_verdict}")
    print(f"\n  Total cost: ${total_cost_all:.4f}")
    print(f"  Log: {LOG_PATH}")
    print(f"  Summary: {SUMMARY_PATH}")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="K455b Mode A: Pawn Cathedral Attribution-Isolation Benchmark")
    parser.add_argument("--dry-run", action="store_true", help="Dry run: no API calls, no writes")
    parser.add_argument("--model", default=MODEL_DEFAULT, help=f"Perplexity model to use (default: {MODEL_DEFAULT})")
    args = parser.parse_args()
    run_k455b(args)
