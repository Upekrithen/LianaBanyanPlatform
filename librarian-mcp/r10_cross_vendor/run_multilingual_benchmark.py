#!/usr/bin/env python3
"""
Multilingual Eyewitness Probe — K435 / B116 / April 2026
=========================================================
4 models × 2 languages (EN, ES) × 75 questions × HOT + COLD = 1,200 calls.
Budget cap: $20.

Usage:
    python run_multilingual_benchmark.py                  # Full run
    python run_multilingual_benchmark.py --n 5 --dry-run  # Dry run with 5 questions
    python run_multilingual_benchmark.py --vendor anthropic --lang es --condition hot

Models: Haiku 4.5, Opus 4.7, gpt-4o-mini, gemini-2.5-flash
    (spans cheap+premium across 3 vendors; enough to prove parity)
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

COST_HARD_CAP = 20.00
VENDOR_COST_CAP = 8.00
RETRY_MAX = 3
RETRY_BASE_DELAY = 2.0

MODEL_MATRIX = {
    "anthropic": {
        "cheap": "claude-haiku-4-5-20251001",
        "premium": "claude-opus-4-7",
    },
    "openai": {
        "cheap": "gpt-4o-mini",
    },
    "google": {
        "cheap": "gemini-2.5-flash",
    },
}

VENDOR_LABELS = {
    "anthropic": "Anthropic",
    "google": "Google",
    "openai": "OpenAI",
}

ENV_KEYS = {
    "anthropic": "ANTHROPIC_API_KEY",
    "google": ("GOOGLE_API_KEY", "GEMINI_API_KEY"),
    "openai": "OPENAI_API_KEY",
}

LANGUAGES = ["en", "es"]
CONDITIONS = ["hot", "cold"]

COLD_SYSTEM_PROMPT_EN = (
    "You are a helpful assistant. Answer the user's question to the best of your ability. "
    "If you don't know the answer, say so."
)

COLD_SYSTEM_PROMPT_ES = (
    "Eres un asistente útil. Responde la pregunta del usuario lo mejor que puedas. "
    "Si no sabes la respuesta, dilo."
)

PRELOAD_PUBLIC_DIR = SCRIPT_DIR.parent.parent / "librarian-mcp-public" / "preload"


def load_questions(lang: str, n: int | None = None) -> list[dict]:
    filename = "questions_es.json" if lang == "es" else "questions.json"
    path = SCRIPT_DIR / filename
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    questions = data["questions"]
    if n and n < len(questions):
        questions = questions[:n]
    return questions


def load_preload(lang: str) -> str:
    if lang == "es":
        path = PRELOAD_PUBLIC_DIR / "r9v2_base_es.md"
    else:
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
    else:
        raise ValueError(f"Unknown vendor: {vendor}")


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


def run_single_call(adapter, model: str, system_prompt: str, question: str) -> dict:
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
    parser = argparse.ArgumentParser(description="Multilingual Eyewitness Probe (K435/B116)")
    parser.add_argument("--vendor", type=str, choices=list(MODEL_MATRIX.keys()))
    parser.add_argument("--model", type=str)
    parser.add_argument("--condition", type=str, choices=CONDITIONS)
    parser.add_argument("--lang", type=str, choices=LANGUAGES)
    parser.add_argument("--n", type=int)
    parser.add_argument("--out", type=str)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--grade", action="store_true", default=True)
    parser.add_argument("--no-grade", action="store_true")
    args = parser.parse_args()

    if args.no_grade:
        args.grade = False

    vendors = [args.vendor] if args.vendor else list(MODEL_MATRIX.keys())
    conditions = [args.condition] if args.condition else CONDITIONS
    languages = [args.lang] if args.lang else LANGUAGES

    missing = check_env_keys(vendors)
    if missing and not args.dry_run:
        print("ERROR: Missing required environment variables:")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)

    preloads = {}
    question_banks = {}
    for lang in languages:
        preloads[lang] = load_preload(lang) if not args.dry_run else ""
        question_banks[lang] = load_questions(lang, args.n)
    n_questions = len(question_banks[languages[0]])

    run_plan = []
    for lang in languages:
        for vendor in vendors:
            models_to_run = {}
            if args.model:
                models_to_run["custom"] = args.model
            else:
                models_to_run = MODEL_MATRIX[vendor]
            for tier, model in models_to_run.items():
                for condition in conditions:
                    for q in question_banks[lang]:
                        run_plan.append({
                            "vendor": vendor,
                            "model": model,
                            "tier": tier,
                            "condition": condition,
                            "lang": lang,
                            "question": q,
                        })

    total_calls = len(run_plan)
    print(f"Multilingual Eyewitness Probe — K435/B116")
    print(f"Run plan: {total_calls} inference calls")
    print(f"  Vendors: {', '.join(vendors)}")
    print(f"  Languages: {', '.join(languages)}")
    print(f"  Conditions: {', '.join(conditions)}")
    print(f"  Questions: {n_questions}")
    print(f"  Budget cap: ${COST_HARD_CAP}")

    if args.dry_run:
        print("\n=== DRY RUN ===")
        for lang in languages:
            for vendor in vendors:
                models = MODEL_MATRIX[vendor] if not args.model else {"custom": args.model}
                for tier, model in models.items():
                    for cond in conditions:
                        print(f"  {lang.upper()} / {VENDOR_LABELS.get(vendor, vendor)} / {model} / {cond.upper()}: {n_questions} calls")
        print(f"\nTotal: {total_calls} calls")
        return

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    out_dir = Path(args.out) if args.out else (SCRIPT_DIR / "results" / f"multilingual_{timestamp}")
    out_dir.mkdir(parents=True, exist_ok=True)

    cost_log_path = out_dir / "cost_log.csv"
    if not cost_log_path.exists():
        with open(cost_log_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp", "vendor", "model", "condition", "lang",
                "question_id", "input_tokens", "output_tokens",
                "cost_usd", "cumulative_total_usd",
            ])

    cumulative_cost = 0.0
    vendor_costs: dict[str, float] = {}
    all_results: list[dict] = []
    skipped_vendors: set[str] = set()
    vendor_consecutive_errors: dict[str, int] = {}
    aborted = False
    abort_reason = ""

    print(f"\n{'='*60}")
    print(f"STARTING MULTILINGUAL PROBE — {timestamp}")
    print(f"Output: {out_dir}")
    print(f"{'='*60}\n")

    t_start = time.perf_counter()

    for i, item in enumerate(run_plan):
        vendor = item["vendor"]
        model = item["model"]
        condition = item["condition"]
        lang = item["lang"]
        q = item["question"]

        if cumulative_cost >= COST_HARD_CAP:
            aborted = True
            abort_reason = f"Cumulative cost ${cumulative_cost:.2f} >= ${COST_HARD_CAP} cap"
            break

        if vendor in skipped_vendors:
            continue

        cold_prompt = COLD_SYSTEM_PROMPT_ES if lang == "es" else COLD_SYSTEM_PROMPT_EN
        system_prompt = preloads[lang] if condition == "hot" else cold_prompt
        adapter = get_adapter(vendor)

        progress = f"[{i+1}/{total_calls}]"
        print(f"{progress} {lang.upper()} / {VENDOR_LABELS.get(vendor, vendor)} / {model} / {condition.upper()} / {q['id']}...", end=" ", flush=True)

        result = run_single_call(adapter, model, system_prompt, q["question"])

        cumulative_cost += result["cost_usd"]
        vendor_costs[vendor] = vendor_costs.get(vendor, 0.0) + result["cost_usd"]

        status = "OK" if not result["error"] else f"ERR: {result['error'][:40]}"
        print(f"${result['cost_usd']:.4f} ({result['latency_s']:.1f}s) [{status}] [cum: ${cumulative_cost:.2f}]")

        if result["error"]:
            vendor_consecutive_errors[vendor] = vendor_consecutive_errors.get(vendor, 0) + 1
            if vendor_consecutive_errors[vendor] >= 5:
                skipped_vendors.add(vendor)
                print(f"\n  !!! SKIPPING {VENDOR_LABELS.get(vendor, vendor)}: 5 consecutive errors !!!\n")
        else:
            vendor_consecutive_errors[vendor] = 0

        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vendor": vendor,
            "model": model,
            "tier": item["tier"],
            "condition": condition,
            "lang": lang,
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

        with open(cost_log_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                record["timestamp"], vendor, model, condition, lang, q["id"],
                result["input_tokens"], result["output_tokens"],
                result["cost_usd"], cumulative_cost,
            ])

        jsonl_name = f"{lang}_{vendor}_{model}_{condition}.jsonl".replace("/", "_")
        jsonl_path = out_dir / jsonl_name
        with open(jsonl_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    t_end = time.perf_counter()
    wall_time = t_end - t_start

    if aborted:
        abort_path = out_dir / "ABORTED_reason.md"
        with open(abort_path, "w", encoding="utf-8") as f:
            f.write(f"# Multilingual Probe ABORTED\n\n**Reason:** {abort_reason}\n")
            f.write(f"**Cumulative cost:** ${cumulative_cost:.2f}\n")
            f.write(f"**Calls completed:** {len(all_results)} / {total_calls}\n")
        print(f"\n!!! ABORTED: {abort_reason}")

    # --- Grading phase ---
    grade_results = []
    if args.grade and all_results:
        print(f"\n{'='*60}")
        print("GRADING PHASE — Claude Haiku 4.5 (single-blind)")
        print(f"{'='*60}\n")

        from grader import grade_single, GRADER_MODEL

        en_questions = {q["id"]: q for q in load_questions("en", args.n)}

        for i, r in enumerate(all_results):
            if r.get("error"):
                grade_results.append({
                    **r,
                    "grade": "INCORRECT",
                    "score": 0.0,
                    "grade_rationale": "Skipped -- inference error",
                    "grader_model": GRADER_MODEL,
                    "grade_cost_usd": 0.0,
                })
                continue

            q = en_questions.get(r["question_id"])
            if not q:
                continue

            print(f"  Grading [{i+1}/{len(all_results)}] {r['lang']}/{r['vendor']}/{r['model']}/{r['condition']}/{r['question_id']}...", end=" ", flush=True)
            gr = grade_single(q, r["response_text"])
            cumulative_cost += gr.cost_usd
            print(f"{gr.grade} (${gr.cost_usd:.4f}) [cum: ${cumulative_cost:.2f}]")

            if cumulative_cost >= 25.0:
                print("\n!!! Grading cost pushed past $25 total — stopping grader !!!")
                break

            grade_results.append({
                **r,
                "grade": gr.grade,
                "score": gr.score,
                "grade_rationale": gr.rationale,
                "grader_model": gr.grader_model,
                "grade_cost_usd": gr.cost_usd,
            })

        graded_path = out_dir / "all_graded.jsonl"
        with open(graded_path, "w", encoding="utf-8") as f:
            for gr in grade_results:
                f.write(json.dumps(gr, ensure_ascii=False) + "\n")

    # --- Summary ---
    _write_summary(out_dir, all_results, grade_results, n_questions, cumulative_cost, wall_time, aborted, abort_reason)

    print(f"\n{'='*60}")
    print(f"MULTILINGUAL PROBE COMPLETE")
    print(f"  Total cost:  ${cumulative_cost:.2f}")
    print(f"  Wall time:   {wall_time:.1f}s ({wall_time/60:.1f} min)")
    print(f"  Results:     {out_dir}")
    print(f"{'='*60}")


def _write_summary(
    out_dir: Path,
    all_results: list[dict],
    grade_results: list[dict],
    n_questions: int,
    total_cost: float,
    wall_time: float,
    aborted: bool,
    abort_reason: str,
):
    groups: dict[str, list[dict]] = {}
    source = grade_results if grade_results else all_results
    for r in source:
        key = f"{r['lang']}|{r['vendor']}|{r['model']}|{r['condition']}"
        groups.setdefault(key, []).append(r)

    lines = [
        "# Multilingual Eyewitness Probe — K435/B116 Results",
        "",
        f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
        f"**Total cost:** ${total_cost:.2f}",
        f"**Wall time:** {wall_time:.0f}s ({wall_time/60:.1f} min)",
        f"**Questions per language:** {n_questions}",
        f"**Models:** Haiku 4.5, Opus 4.7, gpt-4o-mini, gemini-2.5-flash",
        f"**Languages:** EN, ES",
        "",
    ]

    if aborted:
        lines.append(f"**STATUS: ABORTED** — {abort_reason}")
        lines.append("")

    lines.append("## Results Table")
    lines.append("")
    lines.append("| Language | Vendor | Model | Tier | HOT accuracy | COLD accuracy | \u0394 (HOT\u2212COLD) | HOT cost/Q | HOT $/correct | HOT p50 latency |")
    lines.append("|---|---|---|---|---:|---:|---:|---:|---:|---:|")

    table_rows = []
    lang_hot_accuracies: dict[str, list[float]] = {"en": [], "es": []}

    seen_models = set()
    for key in sorted(groups.keys()):
        items = groups[key]
        parts = key.split("|")
        lang, vendor, model, condition = parts[0], parts[1], parts[2], parts[3]
        model_key = f"{lang}_{vendor}_{model}"

        if model_key in seen_models:
            continue

        hot_key = f"{lang}|{vendor}|{model}|hot"
        cold_key = f"{lang}|{vendor}|{model}|cold"
        hot_items = groups.get(hot_key, [])
        cold_items = groups.get(cold_key, [])

        if hot_items or cold_items:
            seen_models.add(model_key)

            tier = "—"
            for v, models in MODEL_MATRIX.items():
                for t, m in models.items():
                    if m == model:
                        tier = t

            hot_acc = 0.0
            cold_acc = 0.0
            hot_cost_q = 0.0
            hot_p50 = 0.0
            hot_cost_correct = 0.0

            if hot_items:
                scores = [it.get("score", 0.0) for it in hot_items]
                hot_acc = (sum(scores) / len(scores) * 100) if scores else 0.0
                costs = [it.get("cost_usd", 0.0) for it in hot_items]
                hot_cost_q = sum(costs) / len(costs) if costs else 0.0
                latencies = sorted([it.get("latency_s", 0.0) for it in hot_items])
                hot_p50 = latencies[len(latencies) // 2] if latencies else 0.0
                correct_count = sum(1 for s in scores if s >= 1.0)
                total_cost_hot = sum(costs)
                hot_cost_correct = total_cost_hot / correct_count if correct_count > 0 else 0.0
                lang_hot_accuracies[lang].append(hot_acc)

            if cold_items:
                scores = [it.get("score", 0.0) for it in cold_items]
                cold_acc = (sum(scores) / len(scores) * 100) if scores else 0.0

            delta = hot_acc - cold_acc

            lines.append(
                f"| {lang.upper()} "
                f"| {VENDOR_LABELS.get(vendor, vendor)} "
                f"| {model} "
                f"| {tier} "
                f"| {hot_acc:.1f}% "
                f"| {cold_acc:.1f}% "
                f"| +{delta:.1f} "
                f"| ${hot_cost_q:.4f} "
                f"| ${hot_cost_correct:.4f} "
                f"| {hot_p50:.2f}s |"
            )

    lines.append("")

    en_mean = sum(lang_hot_accuracies["en"]) / len(lang_hot_accuracies["en"]) if lang_hot_accuracies["en"] else 0
    es_mean = sum(lang_hot_accuracies["es"]) / len(lang_hot_accuracies["es"]) if lang_hot_accuracies["es"] else 0
    delta_lang = es_mean - en_mean

    lines.append(f"**Mean ES-HOT: {es_mean:.1f}%, Mean EN-HOT: {en_mean:.1f}%, "
                 f"\u0394 (ES\u2013EN): {delta_lang:+.1f}pp.** "
                 f"Same 75 questions, translated. "
                 f"{len(MODEL_MATRIX)} vendors \u00d7 2 languages \u00d7 {n_questions} Qs \u00d7 HOT+COLD "
                 f"= {len(source)} graded calls. Study cost: ${total_cost:.2f}.")
    lines.append("")
    lines.append("**Grading:** Single-rater (Claude Haiku 4.5). "
                 "One-rater grading acceptable for this scaled probe scope (smaller than R10). "
                 "Spanish responses graded with English rubric (correct answer content evaluated regardless of response language).")
    lines.append("")

    pass_criterion = es_mean >= 85.0 and abs(delta_lang) <= 10.0
    if pass_criterion:
        lines.append(f"**PASS:** Mean ES-HOT {es_mean:.1f}% >= 85% threshold, "
                     f"within 10pp of EN-HOT ({abs(delta_lang):.1f}pp gap). "
                     f"Mellon criterion met.")
    else:
        reasons = []
        if es_mean < 85.0:
            reasons.append(f"ES-HOT {es_mean:.1f}% < 85% threshold")
        if abs(delta_lang) > 10.0:
            reasons.append(f"|ES-EN| = {abs(delta_lang):.1f}pp > 10pp allowed gap")
        lines.append(f"**FAIL:** {'; '.join(reasons)}. Founder review required before Phase D.")

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
    lines.append("*Multilingual Eyewitness Probe — K435 / B116 / SP-19*")

    summary_path = out_dir / "results_multilingual_b116_summary.md"
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    raw_path = out_dir / "results_multilingual_b116.json"
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump({
            "benchmark": "Multilingual Eyewitness Probe",
            "session": "K435/B116",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_calls": len(source),
            "total_cost_usd": round(total_cost, 2),
            "wall_time_s": round(wall_time, 1),
            "en_hot_mean_pct": round(en_mean, 1),
            "es_hot_mean_pct": round(es_mean, 1),
            "delta_es_en_pp": round(delta_lang, 1),
            "pass_criterion": pass_criterion,
            "aborted": aborted,
        }, f, indent=2)

    print(f"\n  Summary: {summary_path.name}")
    print(f"  Raw JSON: {raw_path.name}")


if __name__ == "__main__":
    main()
