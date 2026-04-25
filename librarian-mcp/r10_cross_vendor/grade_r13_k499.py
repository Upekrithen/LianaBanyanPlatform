#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
grade_r13_k499.py — Phase D Multi-Grader for R13 Cross-Vendor Benchmark
========================================================================
K499 / B123-late

Grading protocol:
  Primary: Deterministic HOT/HIT/MISS (substring rubric on hot_required_elements)
           Already computed during run_r13_k499.py — this script reads those results.
  Cross-check: LLM judge on a 10% stratified sample
    - Haiku 4.5 (primary LLM judge)
    - Gemini 3.1 Flash (independent cross-check for inter-rater agreement)
    - Opus 4.7 (borderline review on MISS/HIT disagreements)

Outputs:
  - results_R13_K499/grading_summary_R13_K499.json
  - results_R13_K499/llm_grades_sample_R13_K499.jsonl
  - Prints inter-rater agreement (Cohen's kappa)

Usage:
    python grade_r13_k499.py
    python grade_r13_k499.py --sample-pct 0.15  # grade 15% sample
    python grade_r13_k499.py --no-llm-check      # skip LLM cross-check (stats only)
"""
from __future__ import annotations

import argparse
import json
import math
import os
import random
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

RESULTS_DIR = SCRIPT_DIR / "results_R13_K499"
BANK_FILE   = SCRIPT_DIR / "R12_QUESTION_BANK_CRANEWELL_SEALED.json"

GRADER_MODEL      = "claude-haiku-4-5-20251001"
CROSS_CHECK_MODEL = "gemini-3.1-flash-lite-preview"
OPUS_MODEL        = "claude-opus-4-7"

HAIKU_PRICING  = {"input": 1.00, "output": 5.00}
GEMINI_PRICING = {"input": 0.25, "output": 1.50}
OPUS_PRICING   = {"input": 15.00, "output": 75.00}

LLM_JUDGE_PROMPT = """You are a precise grading assistant for a factual knowledge benchmark.

## Question
{question}

## Required factual elements (the response must mention ALL of these to earn HOT)
{required_elements}

## Candidate Response
{response_text}

## Task
Determine whether the candidate response correctly mentions the required elements.

Scoring:
- HOT: The response explicitly mentions ALL required elements listed above.
- HIT: The response mentions AT LEAST HALF (rounded up) of the required elements.
- MISS: The response mentions fewer than half the required elements, or refuses to answer.

Respond with ONLY valid JSON (no markdown fences):
{{"grade": "HOT"|"HIT"|"MISS", "elements_found": ["..."], "rationale": "1-2 sentences"}}"""


def load_all_results() -> list[dict]:
    """Load all results, deduplicating by (vendor, model, condition, question_id).

    Keeps the LAST entry per key — in case of session-boundary duplicate writes
    (see TS-024), the later entry is preferred as it reflects the completed run.
    """
    raw: dict[str, dict] = {}
    for jsonl_path in sorted(RESULTS_DIR.glob("*.jsonl")):
        if "llm_grades" in jsonl_path.name:
            continue
        with open(jsonl_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                    key = f"{r.get('vendor','?')}|{r.get('model','?')}|{r.get('condition','?')}|{r.get('question_id','?')}"
                    raw[key] = r
                except Exception:
                    pass
    results = list(raw.values())
    return results


def load_bank() -> dict[str, dict]:
    with open(BANK_FILE, encoding="utf-8") as f:
        d = json.load(f)
    return {q["id"]: q for q in d["questions"]}


def compute_stats(results: list[dict]) -> dict:
    """Compute per-(model, condition) HOT/HIT/MISS stats from deterministic grades."""
    groups: dict[str, dict] = {}
    for r in results:
        key = f"{r.get('vendor', '?')}|{r.get('model', '?')}|{r.get('condition', '?')}"
        g = groups.setdefault(key, {
            "vendor": r.get("vendor"), "model": r.get("model"),
            "label": r.get("label"), "tier": r.get("tier"),
            "condition": r.get("condition"),
            "HOT": 0, "HIT": 0, "MISS": 0, "error": 0, "n": 0,
            "cost_usd": 0.0,
        })
        grade = r.get("grade", "error")
        if grade in ("HOT", "HIT", "MISS"):
            g[grade] += 1
        else:
            g["error"] += 1
        g["n"] += 1
        g["cost_usd"] = round(g["cost_usd"] + r.get("cost_usd", 0), 4)

    for g in groups.values():
        n_graded = g["HOT"] + g["HIT"] + g["MISS"]
        g["n_graded"] = n_graded
        g["hot_pct"] = round(100 * g["HOT"] / max(1, n_graded), 1)
        g["hit_pct"] = round(100 * g["HIT"] / max(1, n_graded), 1)
        g["miss_pct"] = round(100 * g["MISS"] / max(1, n_graded), 1)

    return groups


def print_results_table(groups: dict) -> None:
    print(f"\n{'='*80}")
    print(f"R13 K499 — DETERMINISTIC GRADING RESULTS (HOT/HIT/MISS Substring Rubric)")
    print(f"{'='*80}")
    print(f"{'Model':<38} {'Cond':<10} {'HOT%':>6} {'HIT%':>6} {'MISS%':>6} {'N':>4} {'$':>6}  {'Tier'}")
    print(f"{'─'*80}")

    for key in sorted(groups.keys()):
        g = groups[key]
        label = g.get("label") or g.get("model", "?")
        cond  = g.get("condition", "?")
        tier  = g.get("tier", "?")
        print(
            f"{label:<38} {cond:<10} {g['hot_pct']:>5.1f}% {g['hit_pct']:>5.1f}% "
            f"{g['miss_pct']:>5.1f}% {g['n_graded']:>4} ${g['cost_usd']:>5.2f}  {tier}"
        )
    print(f"{'─'*80}")

    # Cathedral lift per model
    print(f"\n{'─'*60}")
    print("Cathedral Effect Lift (Cathedral HOT% - Cold HOT%):")
    # Group by model
    by_model: dict[str, dict] = {}
    for key, g in groups.items():
        m = g.get("model", "?")
        by_model.setdefault(m, {})
        by_model[m][g.get("condition", "?")] = g
    for model_id, conds in sorted(by_model.items()):
        cold_hot = conds.get("cold", {}).get("hot_pct", None)
        cath_hot = conds.get("cathedral", {}).get("hot_pct", None)
        label = conds.get("cold", conds.get("cathedral", {})).get("label", model_id)
        tier  = conds.get("cold", conds.get("cathedral", {})).get("tier", "?")
        if cold_hot is not None and cath_hot is not None:
            lift = cath_hot - cold_hot
            print(f"  {label:<38} cold={cold_hot:>5.1f}%  cath={cath_hot:>5.1f}%  lift={lift:>+6.1f}pp  [{tier}]")


def select_stratified_sample(results: list[dict], fraction: float, seed: int = 42) -> list[dict]:
    """Stratified sample by vendor × condition, skipping errors."""
    rng = random.Random(seed)
    strata: dict[str, list[dict]] = {}
    for r in results:
        if r.get("grade") not in ("HOT", "HIT", "MISS"):
            continue
        if not r.get("hot_required_elements"):
            continue
        key = f"{r.get('vendor', '?')}_{r.get('condition', '?')}"
        strata.setdefault(key, []).append(r)

    sample = []
    for key, items in strata.items():
        k = max(1, math.ceil(len(items) * fraction))
        sample.extend(rng.sample(items, min(k, len(items))))
    return sample


def llm_grade_one(
    model: str,
    question: str,
    hot_elements: list[str],
    response_text: str,
    vendor: str = "anthropic",
) -> dict:
    """Call LLM to grade one response. Returns grade + rationale + cost."""
    prompt = LLM_JUDGE_PROMPT.format(
        question=question,
        required_elements="\n".join(f"  • {e}" for e in hot_elements),
        response_text=response_text[:6000],  # trim for grader budget
    )

    t0 = time.perf_counter()
    if vendor == "anthropic":
        import anthropic
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model=model, max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        text = resp.content[0].text if resp.content else "{}"
        in_tok = resp.usage.input_tokens
        out_tok = resp.usage.output_tokens
        pricing = OPUS_PRICING if "opus" in model else HAIKU_PRICING
    elif vendor == "google":
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        client = genai.Client(api_key=api_key)
        gresp = client.models.generate_content(
            model=model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(max_output_tokens=256),
        )
        text = gresp.text or "{}"
        usage = gresp.usage_metadata
        in_tok = usage.prompt_token_count or 0
        out_tok = usage.candidates_token_count or 0
        pricing = GEMINI_PRICING
    else:
        raise ValueError(f"Unsupported vendor for LLM grader: {vendor}")

    latency = time.perf_counter() - t0

    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
    try:
        parsed = json.loads(text)
    except Exception:
        parsed = {"grade": "MISS", "rationale": f"parse error: {text[:100]}"}

    grade = parsed.get("grade", "MISS").upper()
    if grade not in ("HOT", "HIT", "MISS"):
        grade = "MISS"

    cost = (in_tok / 1_000_000) * pricing["input"] + (out_tok / 1_000_000) * pricing["output"]

    return {
        "llm_grade": grade,
        "llm_rationale": parsed.get("rationale", ""),
        "elements_found": parsed.get("elements_found", []),
        "grader_model": model,
        "grader_vendor": vendor,
        "input_tokens": in_tok,
        "output_tokens": out_tok,
        "cost_usd": round(cost, 6),
        "latency_s": round(latency, 3),
    }


def compute_kappa(grades1: list[str], grades2: list[str]) -> float:
    """Cohen's kappa between two grade lists."""
    categories = ["HOT", "HIT", "MISS"]
    n = len(grades1)
    if n == 0:
        return 0.0
    po = sum(1 for a, b in zip(grades1, grades2) if a == b) / n
    pe = sum(
        (grades1.count(c) / n) * (grades2.count(c) / n)
        for c in categories
    )
    return (po - pe) / (1.0 - pe) if pe < 1.0 else 1.0


def run_grading(args: argparse.Namespace) -> None:
    results = load_all_results()
    if not results:
        print("ERROR: No result files found in results_R13_K499/. Run run_r13_k499.py first.")
        sys.exit(1)

    bank = load_bank()
    print(f"Loaded {len(results)} result records from {RESULTS_DIR}")

    # Phase D.1 — Deterministic stats
    groups = compute_stats(results)
    print_results_table(groups)

    total_cost = sum(r.get("cost_usd", 0) for r in results)
    print(f"\n  Total inference cost: ${total_cost:.2f}")

    if args.no_llm_check:
        print("\n[--no-llm-check] Skipping LLM cross-check.")
        _save_grading_summary(groups, [], [], 0.0, 0.0, 0.0, total_cost)
        return

    # Phase D.2 — LLM cross-check on stratified sample
    sample = select_stratified_sample(results, args.sample_pct)
    print(f"\n{'─'*60}")
    print(f"LLM cross-check sample: {len(sample)} records ({args.sample_pct*100:.0f}% stratified)")
    print(f"  Haiku primary grader: {GRADER_MODEL}")
    print(f"  Gemini cross-check:   {CROSS_CHECK_MODEL}")

    llm_sample_path = RESULTS_DIR / "llm_grades_sample_R13_K499.jsonl"
    haiku_grades: list[str] = []
    gemini_grades: list[str] = []
    deterministic_grades: list[str] = []
    cumulative_grade_cost = 0.0

    GRADE_COST_CAP = 15.00  # Don't spend more than $15 on grading

    with open(llm_sample_path, "w", encoding="utf-8") as out_f:
        for i, r in enumerate(sample):
            q = bank.get(r["question_id"])
            if not q:
                continue

            deterministic_grade = r.get("grade", "MISS")
            question_text = r.get("question", q.get("question", ""))
            hot_elements = r.get("hot_required_elements", q.get("hot_required_elements", []))
            response_text = r.get("response_text", "")

            print(f"  [{i+1}/{len(sample)}] {r['question_id']} det={deterministic_grade}…", end=" ", flush=True)

            if cumulative_grade_cost >= GRADE_COST_CAP:
                print("  [GRADE CAP REACHED — stopping LLM cross-check]")
                break

            # Haiku grade
            try:
                haiku_result = llm_grade_one(GRADER_MODEL, question_text, hot_elements, response_text, "anthropic")
                cumulative_grade_cost += haiku_result["cost_usd"]
                haiku_grade = haiku_result["llm_grade"]
            except Exception as e:
                print(f"[Haiku ERR: {e}] ", end="", flush=True)
                haiku_grade = "MISS"
                haiku_result = {"llm_grade": "MISS", "error": str(e), "cost_usd": 0}

            # Gemini cross-check
            try:
                gemini_result = llm_grade_one(CROSS_CHECK_MODEL, question_text, hot_elements, response_text, "google")
                cumulative_grade_cost += gemini_result["cost_usd"]
                gemini_grade = gemini_result["llm_grade"]
            except Exception as e:
                print(f"[Gemini ERR: {e}] ", end="", flush=True)
                gemini_grade = "MISS"
                gemini_result = {"llm_grade": "MISS", "error": str(e), "cost_usd": 0}

            print(f"haiku={haiku_grade} gemini={gemini_grade} | ${cumulative_grade_cost:.3f}", flush=True)

            haiku_grades.append(haiku_grade)
            gemini_grades.append(gemini_grade)
            deterministic_grades.append(deterministic_grade)

            grade_record = {
                **{k: r[k] for k in ("question_id", "vendor", "model", "condition", "grade")},
                "deterministic_grade": deterministic_grade,
                "haiku_grade": haiku_result,
                "gemini_grade": gemini_result,
            }
            out_f.write(json.dumps(grade_record, ensure_ascii=False) + "\n")

    # Phase D.3 — Inter-rater agreement
    print(f"\n{'─'*60}")
    print("INTER-RATER AGREEMENT")
    if haiku_grades:
        kappa_det_haiku = compute_kappa(deterministic_grades, haiku_grades)
        kappa_det_gemini = compute_kappa(deterministic_grades, gemini_grades)
        kappa_haiku_gemini = compute_kappa(haiku_grades, gemini_grades)
        print(f"  Deterministic ↔ Haiku:      κ = {kappa_det_haiku:.3f}  (n={len(haiku_grades)})")
        print(f"  Deterministic ↔ Gemini:     κ = {kappa_det_gemini:.3f}  (n={len(gemini_grades)})")
        print(f"  Haiku ↔ Gemini:             κ = {kappa_haiku_gemini:.3f}  (n={len(haiku_grades)})")
        print(f"\n  Grading cost: ${cumulative_grade_cost:.4f}")

        if kappa_det_haiku >= 0.80:
            print(f"  ✓ κ(det,haiku)={kappa_det_haiku:.3f} ≥ 0.80 threshold (R10 baseline: 0.883)")
        else:
            print(f"  ⚠  κ(det,haiku)={kappa_det_haiku:.3f} < 0.80 — investigate disagreements")
    else:
        print("  (no LLM grades computed)")
        kappa_det_haiku = kappa_det_gemini = kappa_haiku_gemini = None

    _save_grading_summary(groups, haiku_grades, gemini_grades,
                          kappa_det_haiku, kappa_det_gemini, kappa_haiku_gemini,
                          total_cost, cumulative_grade_cost)
    print(f"\nGrading summary written → {RESULTS_DIR / 'grading_summary_R13_K499.json'}")


def _save_grading_summary(
    groups, haiku_grades, gemini_grades,
    kappa_dh, kappa_dg, kappa_hg,
    inference_cost, grading_cost=0.0,
):
    summary = {
        "benchmark": "R13_K499",
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "inference_cost_usd": round(inference_cost, 4),
        "grading_cost_usd": round(grading_cost, 4),
        "total_cost_usd": round(inference_cost + grading_cost, 4),
        "inter_rater_kappa": {
            "deterministic_vs_haiku": round(kappa_dh, 4) if kappa_dh else None,
            "deterministic_vs_gemini": round(kappa_dg, 4) if kappa_dg else None,
            "haiku_vs_gemini": round(kappa_hg, 4) if kappa_hg else None,
            "n_sample": len(haiku_grades),
            "r10_baseline": 0.883,
        },
        "model_condition_results": {
            k: {
                "label": g.get("label"), "tier": g.get("tier"),
                "condition": g.get("condition"), "vendor": g.get("vendor"),
                "n_graded": g["n_graded"], "n_errors": g.get("error", 0),
                "HOT": g["HOT"], "HIT": g["HIT"], "MISS": g["MISS"],
                "hot_pct": g["hot_pct"], "hit_pct": g["hit_pct"], "miss_pct": g["miss_pct"],
                "cost_usd": g.get("cost_usd", 0),
            }
            for k, g in groups.items()
        },
    }
    path = RESULTS_DIR / "grading_summary_R13_K499.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="R13 K499 Phase D Grader")
    parser.add_argument("--sample-pct", type=float, default=0.10,
                        help="Fraction of results to LLM cross-check (default: 0.10)")
    parser.add_argument("--no-llm-check", action="store_true",
                        help="Skip LLM cross-check; only compute deterministic stats")
    args = parser.parse_args()
    run_grading(args)


if __name__ == "__main__":
    main()
