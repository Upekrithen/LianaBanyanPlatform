#!/usr/bin/env python3
"""
R10 Cross-Vendor Replication Benchmark — Runner Script
=======================================================
Knight K423 / Bishop B111 / April 2026

Usage:
    python run_benchmark.py                              # Full run: 8 models × 75 Qs × 2 conditions
    python run_benchmark.py --vendor anthropic            # Single vendor
    python run_benchmark.py --vendor google --model gemini-2.5-flash --condition hot
    python run_benchmark.py --n 10 --dry-run              # Dry run with 10 questions
    python run_benchmark.py --out ./my_results            # Custom output directory

Environment variables required (set in .env or export):
    ANTHROPIC_API_KEY     — Anthropic (Claude models)
    GOOGLE_API_KEY        — Google AI Studio (Gemini models)
    OPENAI_API_KEY        — OpenAI direct (GPT models)
    PERPLEXITY_API_KEY    — Perplexity (Sonar models)

Budget: $80 total. Abort at $75 cumulative (leaves $5 for grader + spot-check).
"""

import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

COST_HARD_CAP = 75.00
VENDOR_COST_CAP = 25.00
RETRY_MAX = 3
RETRY_BASE_DELAY = 2.0

MODEL_MATRIX = {
    "anthropic": {
        "cheap": "claude-haiku-4-5-20251001",
        "premium": "claude-opus-4-7",
    },
    "google": {
        "cheap": "gemini-2.5-flash",
        "premium": "gemini-2.5-pro",
    },
    "openai": {
        "cheap": "gpt-4o-mini",
        "premium": "gpt-4o",
    },
    "perplexity": {
        "cheap": "sonar",
        "premium": "sonar-pro",
    },
}

VENDOR_LABELS = {
    "anthropic": "Anthropic",
    "google": "Google",
    "openai": "OpenAI (direct)",
    "perplexity": "Perplexity",
}

ENV_KEYS = {
    "anthropic": "ANTHROPIC_API_KEY",
    "google": ("GOOGLE_API_KEY", "GEMINI_API_KEY"),
    "openai": "OPENAI_API_KEY",
    "perplexity": "PERPLEXITY_API_KEY",
}

CONDITIONS = ["hot", "cold"]

COLD_SYSTEM_PROMPT = (
    "You are a helpful assistant. Answer the user's question to the best of your ability. "
    "If you don't know the answer, say so."
)


def load_questions(n: int | None = None) -> list[dict]:
    path = SCRIPT_DIR / "questions.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    questions = data["questions"]
    if n and n < len(questions):
        questions = questions[:n]
    return questions


def load_preload() -> str:
    path = SCRIPT_DIR / "r9v2_preload.md"
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


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


def check_env_keys(vendors: list[str]) -> list[str]:
    """Return list of missing env var names."""
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


def run_single_call(adapter, model: str, system_prompt: str, question: str) -> dict:
    """Call adapter with retries for API errors (not for low accuracy)."""
    last_error = None
    for attempt in range(1, RETRY_MAX + 1):
        try:
            resp = adapter.call(model, system_prompt, question)
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
                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                print(f"    Retry {attempt}/{RETRY_MAX} after error: {last_error[:80]}... waiting {delay}s")
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


def main():
    parser = argparse.ArgumentParser(description="R10 Cross-Vendor Replication Benchmark")
    parser.add_argument("--vendor", type=str, choices=list(MODEL_MATRIX.keys()),
                        help="Run only this vendor (default: all)")
    parser.add_argument("--model", type=str,
                        help="Run only this specific model (requires --vendor)")
    parser.add_argument("--condition", type=str, choices=CONDITIONS,
                        help="Run only this condition (default: both hot and cold)")
    parser.add_argument("--n", type=int,
                        help="Number of questions to run (default: all 75)")
    parser.add_argument("--out", type=str,
                        help="Output directory (default: results/run_{timestamp})")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print what would be done without calling APIs")
    parser.add_argument("--grade", action="store_true", default=True,
                        help="Run grading after inference (default: True)")
    parser.add_argument("--no-grade", action="store_true",
                        help="Skip grading (inference only)")
    parser.add_argument("--spot-check", action="store_true", default=True,
                        help="Run Opus spot-check after grading (default: True)")
    parser.add_argument("--checkpoint-after", type=int, default=2,
                        help="Produce interim table after this many vendors complete (default: 2)")
    args = parser.parse_args()

    if args.no_grade:
        args.grade = False
        args.spot_check = False

    # Determine run scope
    vendors = [args.vendor] if args.vendor else list(MODEL_MATRIX.keys())
    conditions = [args.condition] if args.condition else CONDITIONS

    # Check env keys
    missing = check_env_keys(vendors)
    if missing and not args.dry_run:
        print("ERROR: Missing required environment variables:")
        for m in missing:
            print(f"  - {m}")
        print("\nSet them in your environment or a .env file, then re-run.")
        sys.exit(1)

    # Load data
    questions = load_questions(args.n)
    preload = load_preload()
    print(f"Loaded {len(questions)} questions, preload is {len(preload):,} chars")

    # Build run plan
    run_plan = []
    for vendor in vendors:
        models_to_run = {}
        if args.model:
            models_to_run["custom"] = args.model
        else:
            models_to_run = MODEL_MATRIX[vendor]

        for tier, model in models_to_run.items():
            for condition in conditions:
                for q in questions:
                    run_plan.append({
                        "vendor": vendor,
                        "model": model,
                        "tier": tier,
                        "condition": condition,
                        "question": q,
                    })

    total_calls = len(run_plan)
    print(f"Run plan: {total_calls} inference calls")
    print(f"  Vendors: {', '.join(vendors)}")
    print(f"  Conditions: {', '.join(conditions)}")
    print(f"  Questions: {len(questions)}")
    print(f"  Budget cap: ${COST_HARD_CAP}")

    if args.dry_run:
        print("\n=== DRY RUN — no API calls will be made ===")
        for vendor in vendors:
            models = MODEL_MATRIX[vendor] if not args.model else {"custom": args.model}
            for tier, model in models.items():
                for cond in conditions:
                    print(f"  {VENDOR_LABELS.get(vendor, vendor)} / {model} / {cond.upper()}: {len(questions)} calls")
        print(f"\nTotal: {total_calls} calls")
        return

    # Setup output directory
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    if args.out:
        out_dir = Path(args.out)
    else:
        out_dir = SCRIPT_DIR / "results" / f"run_{timestamp}"
    out_dir.mkdir(parents=True, exist_ok=True)

    cost_log_path = out_dir / "cost_log.csv"
    summary_path = out_dir / "summary.json"

    # Initialize cost log (append if file already exists from a prior partial run)
    if not cost_log_path.exists():
        with open(cost_log_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp", "vendor", "model", "condition", "question_id",
                "input_tokens", "output_tokens", "cost_usd", "cumulative_total_usd",
            ])

    cumulative_cost = 0.0
    vendor_costs: dict[str, float] = {}
    all_results: list[dict] = []
    completed_vendors: set[str] = set()
    skipped_vendors: set[str] = set()
    vendor_consecutive_errors: dict[str, int] = {}
    VENDOR_SKIP_THRESHOLD = 5
    aborted = False
    abort_reason = ""

    print(f"\n{'='*60}")
    print(f"STARTING R10 BENCHMARK — {timestamp}")
    print(f"Output: {out_dir}")
    print(f"{'='*60}\n")

    t_start = time.perf_counter()

    for i, item in enumerate(run_plan):
        vendor = item["vendor"]
        model = item["model"]
        condition = item["condition"]
        q = item["question"]

        # --- Abort checks ---
        if cumulative_cost >= COST_HARD_CAP:
            aborted = True
            abort_reason = f"Cumulative cost ${cumulative_cost:.2f} >= ${COST_HARD_CAP} cap"
            break

        vc = vendor_costs.get(vendor, 0.0)
        calls_for_vendor = sum(1 for r in run_plan if r["vendor"] == vendor)
        calls_done_for_vendor = sum(1 for r in all_results if r["vendor"] == vendor)
        if calls_done_for_vendor > 0:
            avg_cost = vc / calls_done_for_vendor
            projected = avg_cost * calls_for_vendor
            if projected > VENDOR_COST_CAP:
                aborted = True
                abort_reason = (
                    f"Vendor {vendor} projected cost ${projected:.2f} > "
                    f"${VENDOR_COST_CAP} cap (after {calls_done_for_vendor} calls at ${avg_cost:.4f}/call)"
                )
                break

        # --- Vendor skip check (5 consecutive errors = skip) ---
        if vendor in skipped_vendors:
            continue

        # --- Run inference ---
        system_prompt = preload if condition == "hot" else COLD_SYSTEM_PROMPT
        adapter = get_adapter(vendor)

        progress = f"[{i+1}/{total_calls}]"
        print(f"{progress} {VENDOR_LABELS.get(vendor, vendor)} / {model} / {condition.upper()} / {q['id']}...", end=" ")

        result = run_single_call(adapter, model, system_prompt, q["question"])

        cumulative_cost += result["cost_usd"]
        vendor_costs[vendor] = vendor_costs.get(vendor, 0.0) + result["cost_usd"]

        status = "OK" if not result["error"] else f"ERR: {result['error'][:40]}"
        print(f"${result['cost_usd']:.4f} ({result['latency_s']:.1f}s) [{status}] [cum: ${cumulative_cost:.2f}]")

        # Track consecutive errors per vendor for skip logic
        if result["error"]:
            vendor_consecutive_errors[vendor] = vendor_consecutive_errors.get(vendor, 0) + 1
            if vendor_consecutive_errors[vendor] >= VENDOR_SKIP_THRESHOLD:
                skipped_vendors.add(vendor)
                print(f"\n  !!! SKIPPING {VENDOR_LABELS.get(vendor, vendor)}: "
                      f"{VENDOR_SKIP_THRESHOLD} consecutive errors. "
                      f"Last error: {result['error'][:80]} !!!\n")
        else:
            vendor_consecutive_errors[vendor] = 0

        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vendor": vendor,
            "model": model,
            "tier": item["tier"],
            "condition": condition,
            "question_id": q["id"],
            "question_text": q["question"],
            "response_text": result["text"],
            "input_tokens": result["input_tokens"],
            "output_tokens": result["output_tokens"],
            "cost_usd": result["cost_usd"],
            "latency_s": result["latency_s"],
            "error": result["error"],
            "attempts": result["attempts"],
        }
        all_results.append(record)

        # Append to cost log
        with open(cost_log_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                record["timestamp"], vendor, model, condition, q["id"],
                result["input_tokens"], result["output_tokens"],
                result["cost_usd"], cumulative_cost,
            ])

        # Write per-(vendor, model, condition) JSONL
        jsonl_name = f"{vendor}_{model}_{condition}.jsonl".replace("/", "_")
        jsonl_path = out_dir / jsonl_name
        with open(jsonl_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")

        # Track completed vendors for checkpoint (includes skipped)
        prev_completed = len(completed_vendors)
        for v in vendors:
            if v in completed_vendors:
                continue
            if v in skipped_vendors:
                completed_vendors.add(v)
                actual = sum(1 for r in all_results if r["vendor"] == v)
                print(f"\n  >>> Vendor {VENDOR_LABELS.get(v, v)} SKIPPED ({actual} calls before skip, ${vendor_costs.get(v, 0):.2f}) <<<\n")
                continue
            expected = sum(1 for p in run_plan if p["vendor"] == v)
            actual = sum(1 for r in all_results if r["vendor"] == v)
            if actual >= expected:
                completed_vendors.add(v)
                print(f"\n  >>> Vendor {VENDOR_LABELS.get(v, v)} COMPLETE ({actual} calls, ${vendor_costs.get(v, 0):.2f}) <<<\n")

        # Checkpoint after N vendors
        if len(completed_vendors) >= args.checkpoint_after and len(completed_vendors) > prev_completed:
            checkpoint_path = out_dir / f"INTERIM_{len(completed_vendors)}_VENDORS.md"
            _write_interim_table(checkpoint_path, all_results, questions, completed_vendors)
            print(f"  >>> Checkpoint written: {checkpoint_path.name} <<<\n")

    t_end = time.perf_counter()
    wall_time = t_end - t_start

    if aborted:
        abort_path = out_dir / "ABORTED_reason.md"
        with open(abort_path, "w", encoding="utf-8") as f:
            f.write(f"# R10 Benchmark ABORTED\n\n")
            f.write(f"**Reason:** {abort_reason}\n\n")
            f.write(f"**Cumulative cost at abort:** ${cumulative_cost:.2f}\n")
            f.write(f"**Calls completed:** {len(all_results)} / {total_calls}\n")
            f.write(f"**Wall time:** {wall_time:.1f}s\n")
        print(f"\n!!! ABORTED: {abort_reason}")
        print(f"    Partial results in {out_dir}")

    # --- Grading phase ---
    grade_results = []
    if args.grade and all_results:
        print(f"\n{'='*60}")
        print("GRADING PHASE — Claude Haiku 4.5 (single-blind)")
        print(f"{'='*60}\n")

        from grader import grade_single, select_spot_check_sample, compute_cohens_kappa, GRADER_MODEL, SPOT_CHECK_MODEL

        question_map = {q["id"]: q for q in questions}

        for i, r in enumerate(all_results):
            if r.get("error"):
                grade_results.append({
                    **r,
                    "grade": "INCORRECT",
                    "score": 0.0,
                    "grade_rationale": "Skipped — inference error",
                    "grader_model": GRADER_MODEL,
                    "grade_cost_usd": 0.0,
                })
                continue

            q = question_map.get(r["question_id"])
            if not q:
                continue

            print(f"  Grading [{i+1}/{len(all_results)}] {r['vendor']}/{r['model']}/{r['condition']}/{r['question_id']}...", end=" ")

            gr = grade_single(q, r["response_text"])
            cumulative_cost += gr.cost_usd

            print(f"{gr.grade} (${gr.cost_usd:.4f}) [cum: ${cumulative_cost:.2f}]")

            if cumulative_cost >= 80.0:
                print("\n!!! Grading cost pushed past $80 total cap — stopping grader !!!")
                break

            grade_results.append({
                **r,
                "grade": gr.grade,
                "score": gr.score,
                "grade_rationale": gr.rationale,
                "grader_model": gr.grader_model,
                "grade_cost_usd": gr.cost_usd,
            })

        # Write graded JSONL
        graded_path = out_dir / "all_graded.jsonl"
        with open(graded_path, "w", encoding="utf-8") as f:
            for gr in grade_results:
                f.write(json.dumps(gr) + "\n")

        # --- Spot-check phase ---
        kappa = None
        if args.spot_check and grade_results:
            print(f"\n{'='*60}")
            print(f"SPOT-CHECK — Claude Opus 4.7 (10% stratified sample)")
            print(f"{'='*60}\n")

            sample = select_spot_check_sample(grade_results)
            primary_grades = []
            spot_grades = []

            for s in sample:
                q = question_map.get(s["question_id"])
                if not q or s.get("error"):
                    continue

                print(f"  Spot-check {s['vendor']}/{s['model']}/{s['condition']}/{s['question_id']}...", end=" ")
                gr = grade_single(q, s["response_text"], model=SPOT_CHECK_MODEL)
                cumulative_cost += gr.cost_usd
                print(f"Primary={s['grade']} Opus={gr.grade} (${gr.cost_usd:.4f}) [cum: ${cumulative_cost:.2f}]")

                primary_grades.append(s["grade"])
                spot_grades.append(gr.grade)

                if cumulative_cost >= 80.0:
                    print("\n!!! Spot-check cost pushed past $80 total cap — stopping !!!")
                    break

            kappa = compute_cohens_kappa(primary_grades, spot_grades)
            print(f"\nCohen's kappa: {kappa:.3f} (n={len(primary_grades)})")

    # --- Summary ---
    summary = _build_summary(all_results, grade_results, questions, cumulative_cost, wall_time, aborted, abort_reason)
    if 'kappa' in dir() and kappa is not None:
        summary["cohens_kappa"] = round(kappa, 4)

    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    # --- Final comparison table ---
    table_path = out_dir / "EYEWITNESS_BENCHMARK_RESULTS_B111.md"
    _write_comparison_table(table_path, summary, grade_results, questions)

    # Copy to Bishop dropzone
    bishop_path = SCRIPT_DIR.parent.parent / "BISHOP_DROPZONE" / "00_FOUNDER_REVIEW" / "EYEWITNESS_BENCHMARK_RESULTS_B111.md"
    bishop_path.parent.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy2(table_path, bishop_path)

    print(f"\n{'='*60}")
    print(f"R10 BENCHMARK COMPLETE")
    print(f"  Total cost:  ${cumulative_cost:.2f}")
    print(f"  Wall time:   {wall_time:.1f}s ({wall_time/60:.1f} min)")
    print(f"  Results:     {out_dir}")
    print(f"  Summary:     {summary_path.name}")
    print(f"  Table:       {table_path.name}")
    print(f"  Bishop copy: {bishop_path}")
    print(f"{'='*60}")


def _build_summary(
    all_results: list[dict],
    grade_results: list[dict],
    questions: list[dict],
    total_cost: float,
    wall_time: float,
    aborted: bool,
    abort_reason: str,
) -> dict:
    """Build aggregate summary JSON."""
    summary: dict = {
        "benchmark": "R10 Cross-Vendor Replication",
        "version": "R10-v1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_inference_calls": len(all_results),
        "total_questions": len(questions),
        "total_cost_usd": round(total_cost, 2),
        "wall_time_seconds": round(wall_time, 1),
        "aborted": aborted,
        "abort_reason": abort_reason if aborted else None,
        "vendor_results": {},
    }

    if not grade_results:
        return summary

    # Group by vendor/model/condition
    groups: dict[str, list[dict]] = {}
    for gr in grade_results:
        key = f"{gr['vendor']}|{gr['model']}|{gr['condition']}"
        groups.setdefault(key, []).append(gr)

    for key, items in sorted(groups.items()):
        vendor, model, condition = key.split("|")
        scores = [it["score"] for it in items if "score" in it]
        costs = [it["cost_usd"] for it in items if it.get("cost_usd")]
        latencies = [it["latency_s"] for it in items if it.get("latency_s")]

        accuracy = (sum(scores) / len(scores) * 100) if scores else 0.0
        avg_cost = (sum(costs) / len(costs)) if costs else 0.0
        p50_latency = sorted(latencies)[len(latencies) // 2] if latencies else 0.0

        result_key = f"{vendor}_{model}_{condition}"
        summary["vendor_results"][result_key] = {
            "vendor": vendor,
            "vendor_label": VENDOR_LABELS.get(vendor, vendor),
            "model": model,
            "condition": condition,
            "n_questions": len(items),
            "accuracy_pct": round(accuracy, 1),
            "correct": sum(1 for s in scores if s == 1.0),
            "partial": sum(1 for s in scores if s == 0.5),
            "incorrect": sum(1 for s in scores if s == 0.0),
            "avg_cost_per_question": round(avg_cost, 5),
            "p50_latency_s": round(p50_latency, 2),
            "total_cost": round(sum(costs), 4),
        }

    return summary


def _write_comparison_table(path: Path, summary: dict, grade_results: list, questions: list):
    """Write the formatted comparison table for Founder review."""
    lines = [
        "# The Eyewitness Benchmark — R10 Cross-Vendor Replication Results",
        f"**Generated:** {summary['timestamp']}",
        f"**Total cost:** ${summary['total_cost_usd']:.2f}",
        f"**Wall time:** {summary['wall_time_seconds']:.0f}s ({summary['wall_time_seconds']/60:.1f} min)",
        f"**Questions:** {summary['total_questions']}",
        "",
    ]

    if summary.get("aborted"):
        lines.append(f"**STATUS: ABORTED** — {summary['abort_reason']}")
        lines.append("")

    lines.append("## Comparison Table")
    lines.append("")
    lines.append("| Vendor | Model | Tier | HOT accuracy | COLD accuracy | HOT cost/Q | COLD cost/Q | HOT latency p50 |")
    lines.append("|---|---|---|---:|---:|---:|---:|---:|")

    vr = summary.get("vendor_results", {})
    seen_models = set()
    for key in sorted(vr.keys()):
        r = vr[key]
        model_key = f"{r['vendor']}_{r['model']}"
        if model_key in seen_models:
            continue

        hot_key = f"{r['vendor']}_{r['model']}_hot"
        cold_key = f"{r['vendor']}_{r['model']}_cold"
        hot = vr.get(hot_key, {})
        cold = vr.get(cold_key, {})

        if hot or cold:
            seen_models.add(model_key)
            tier = r.get("tier", "—")
            # Determine tier from model matrix
            for v, models in MODEL_MATRIX.items():
                for t, m in models.items():
                    if m == r["model"]:
                        tier = t
                        break

            lines.append(
                f"| {r.get('vendor_label', r['vendor'])} "
                f"| {r['model']} "
                f"| {tier} "
                f"| {hot.get('accuracy_pct', '—')}% "
                f"| {cold.get('accuracy_pct', '—')}% "
                f"| ${hot.get('avg_cost_per_question', 0):.4f} "
                f"| ${cold.get('avg_cost_per_question', 0):.4f} "
                f"| {hot.get('p50_latency_s', '—')}s |"
            )

    lines.append("")
    lines.append("## Analysis")
    lines.append("")
    lines.append("*[Analysis to be written after reviewing results. See B111 prompt for what Bishop needs:*")
    lines.append("*2-3 paragraphs on what the cross-vendor picture shows, which vendors carry the R9 delta well,*")
    lines.append("*which don't, and any surprises. Be direct about poor performers.]*")
    lines.append("")

    has_kappa = summary.get("cohens_kappa") is not None
    has_cross = summary.get("cross_grader_kappa") is not None
    if has_kappa or has_cross:
        lines.append(f"## Inter-Rater Agreement")
        if has_kappa:
            lines.append(f"- **Haiku vs Opus spot-check kappa:** {summary['cohens_kappa']:.3f}")
        if has_cross:
            lines.append(f"- **Haiku vs Gemini Flash cross-grader kappa:** {summary['cross_grader_kappa']:.3f}")
        lines.append("")
        lines.append("*Primary grades: Claude Haiku 4.5 (canonical per B111). "
                      "Opus spot-check and Gemini cross-check run on independent 10% stratified samples.*")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Posture Disclosure (required, verbatim)")
    lines.append("")
    lines.append("> We include OpenAI in this study despite substantive concerns about their governance")
    lines.append("> trajectory, because a cross-vendor study that excludes the market leader is not a")
    lines.append("> cross-vendor study. Measurement is the contribution; endorsement is not conveyed by inclusion.")
    lines.append("")
    lines.append("---")
    lines.append("*The Eyewitness Benchmark — R10 Cross-Vendor Replication — K423 / B111 / SP-19*")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def _write_interim_table(path: Path, results: list, questions: list, completed_vendors: set):
    """Write an interim checkpoint table mid-run."""
    lines = [
        f"# R10 Interim Checkpoint — {len(completed_vendors)} Vendors Complete",
        f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
        f"**Vendors done:** {', '.join(sorted(completed_vendors))}",
        "",
        "| Vendor | Model | Condition | Calls | Avg Cost/Call |",
        "|---|---|---|---:|---:|",
    ]
    groups: dict[str, list] = {}
    for r in results:
        key = f"{r['vendor']}|{r['model']}|{r['condition']}"
        groups.setdefault(key, []).append(r)

    for key in sorted(groups.keys()):
        items = groups[key]
        vendor, model, condition = key.split("|")
        costs = [it["cost_usd"] for it in items]
        avg = sum(costs) / len(costs) if costs else 0
        lines.append(f"| {vendor} | {model} | {condition} | {len(items)} | ${avg:.5f} |")

    lines.append("")
    lines.append("*Checkpoint — grading has not yet been run on these results.*")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    main()
