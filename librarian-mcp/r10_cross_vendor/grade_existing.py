#!/usr/bin/env python3
"""
Grade existing R10 inference results from JSONL files.
Use when inference is done but grading failed (e.g., Anthropic credit exhausted).

Usage:
    python grade_existing.py results/run_20260421_010021
    python grade_existing.py results/run_20260421_010021 --grader gemini
    python grade_existing.py results/run_20260421_010021 --spot-check
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from grader import (
    grade_single,
    select_spot_check_sample,
    compute_cohens_kappa,
    GRADER_MODEL,
    SPOT_CHECK_MODEL,
    GradeResult,
    GRADE_TO_SCORE,
)


def grade_with_gemini(question: dict, candidate_response: str, model: str = "gemini-2.5-flash"):
    """Grade using Gemini instead of Anthropic (fallback when Anthropic credit is exhausted)."""
    from adapters import google_adapter

    grading_prompt = f"""You are a precise grading assistant. Grade this response against a reference answer.

## Question
{question["question"]}

## Reference Answer
{question["canonical_answer"]}

## Grading Rubric
- CORRECT: {question["rubric"]["correct"]}
- PARTIAL: {question["rubric"]["partial"]}
- INCORRECT: {question["rubric"]["incorrect"]}

## Candidate Response
{candidate_response}

## Instructions
Grade as exactly one of: CORRECT, PARTIAL, or INCORRECT. Apply the rubric strictly.
Respond with ONLY a JSON object (no markdown fences):
{{"grade": "CORRECT"|"PARTIAL"|"INCORRECT", "rationale": "brief explanation (1-2 sentences)"}}"""

    t0 = time.perf_counter()
    resp = google_adapter.call(model, "", grading_prompt)
    latency = time.perf_counter() - t0

    text = resp.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {"grade": "INCORRECT", "rationale": f"Grader output unparseable: {text[:200]}"}

    grade = parsed.get("grade", "INCORRECT").upper()
    if grade not in GRADE_TO_SCORE:
        grade = "INCORRECT"

    return GradeResult(
        question_id=question["id"],
        grade=grade,
        score=GRADE_TO_SCORE[grade],
        rationale=parsed.get("rationale", ""),
        grader_model=model,
        input_tokens=resp.input_tokens,
        output_tokens=resp.output_tokens,
        cost_usd=resp.cost_usd,
        latency_s=round(latency, 3),
    )


def main():
    parser = argparse.ArgumentParser(description="Grade existing R10 benchmark results")
    parser.add_argument("run_dir", type=str, help="Path to the results/run_* directory")
    parser.add_argument("--grader", type=str, choices=["anthropic", "gemini"], default="anthropic",
                        help="Which vendor to use for grading (default: anthropic/Haiku)")
    parser.add_argument("--spot-check", action="store_true",
                        help="Also run Opus spot-check (requires anthropic grader)")
    parser.add_argument("--cross-grader", action="store_true",
                        help="Grade a 10%% sample with Gemini Flash for cross-grader kappa")
    args = parser.parse_args()

    run_dir = Path(args.run_dir)
    if not run_dir.exists():
        print(f"ERROR: {run_dir} does not exist")
        sys.exit(1)

    # Load questions
    questions_path = SCRIPT_DIR / "questions.json"
    with open(questions_path, "r", encoding="utf-8") as f:
        question_map = {q["id"]: q for q in json.load(f)["questions"]}

    # Load all inference results from JSONL files
    all_results = []
    for jsonl_file in sorted(run_dir.glob("*.jsonl")):
        if jsonl_file.name == "all_graded.jsonl":
            continue
        with open(jsonl_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    all_results.append(json.loads(line))

    print(f"Loaded {len(all_results)} inference results from {run_dir}")
    non_error = [r for r in all_results if not r.get("error")]
    print(f"  Non-error results to grade: {len(non_error)}")
    error_results = [r for r in all_results if r.get("error")]
    print(f"  Error results (auto-INCORRECT): {len(error_results)}")

    # Grade
    grade_results = []
    cumulative_cost = 0.0

    if args.grader == "gemini":
        print(f"\nGRADING with Gemini Flash (fallback — Anthropic credit exhausted)")
        print(f"NOTE: B111 spec requires Haiku for canonical grading. Re-grade with --grader anthropic when credit is available.\n")
        grade_fn = lambda q, resp: grade_with_gemini(q, resp)
    else:
        print(f"\nGRADING with Claude Haiku 4.5 (canonical grader per B111)\n")
        grade_fn = lambda q, resp: grade_single(q, resp)

    for i, r in enumerate(all_results):
        if r.get("error"):
            grade_results.append({
                **r,
                "grade": "INCORRECT",
                "score": 0.0,
                "grade_rationale": "Skipped — inference error",
                "grader_model": args.grader,
                "grade_cost_usd": 0.0,
            })
            continue

        q = question_map.get(r["question_id"])
        if not q:
            continue

        print(f"  [{i+1}/{len(all_results)}] {r['vendor']}/{r['model']}/{r['condition']}/{r['question_id']}...", end=" ", flush=True)

        try:
            gr = grade_fn(q, r["response_text"])
            cumulative_cost += gr.cost_usd
            print(f"{gr.grade} (${gr.cost_usd:.4f}) [cum: ${cumulative_cost:.2f}]")

            grade_results.append({
                **r,
                "grade": gr.grade,
                "score": gr.score,
                "grade_rationale": gr.rationale,
                "grader_model": gr.grader_model,
                "grade_cost_usd": gr.cost_usd,
            })
        except Exception as e:
            print(f"GRADER ERROR: {str(e)[:80]}")
            grade_results.append({
                **r,
                "grade": "INCORRECT",
                "score": 0.0,
                "grade_rationale": f"Grader error: {str(e)[:200]}",
                "grader_model": args.grader,
                "grade_cost_usd": 0.0,
            })

    # Write graded results
    graded_path = run_dir / "all_graded.jsonl"
    with open(graded_path, "w", encoding="utf-8") as f:
        for gr in grade_results:
            f.write(json.dumps(gr) + "\n")
    print(f"\nGraded results written to {graded_path}")

    # Spot-check
    kappa = None
    if args.spot_check and args.grader == "anthropic":
        print(f"\nSPOT-CHECK with Claude Opus 4.7 (10% stratified sample)")
        sample = select_spot_check_sample(grade_results)
        primary_grades = []
        spot_grades = []

        for s in sample:
            q = question_map.get(s["question_id"])
            if not q or s.get("error"):
                continue
            gr = grade_single(q, s["response_text"], model=SPOT_CHECK_MODEL)
            cumulative_cost += gr.cost_usd
            print(f"  {s['vendor']}/{s['question_id']} Primary={s['grade']} Opus={gr.grade}")
            primary_grades.append(s["grade"])
            spot_grades.append(gr.grade)

        kappa = compute_cohens_kappa(primary_grades, spot_grades)
        print(f"\nCohen's kappa: {kappa:.3f} (n={len(primary_grades)})")

    # Cross-grader check: Gemini Flash on a stratified sample for Haiku-vs-Gemini kappa
    cross_kappa = None
    if args.cross_grader and grade_results:
        print(f"\nCROSS-GRADER CHECK — Gemini Flash on 10% stratified sample")
        cross_sample = select_spot_check_sample(grade_results, seed=99)
        haiku_grades = []
        gemini_grades = []

        for s in cross_sample:
            q = question_map.get(s["question_id"])
            if not q or s.get("error"):
                continue
            print(f"  Cross-check {s['vendor']}/{s['model']}/{s['condition']}/{s['question_id']}...", end=" ", flush=True)
            try:
                gr = grade_with_gemini(q, s["response_text"])
                cumulative_cost += gr.cost_usd
                print(f"Haiku={s['grade']} Gemini={gr.grade} (${gr.cost_usd:.4f})")
                haiku_grades.append(s["grade"])
                gemini_grades.append(gr.grade)
            except Exception as e:
                print(f"CROSS-GRADER ERROR: {str(e)[:80]}")

        cross_kappa = compute_cohens_kappa(haiku_grades, gemini_grades)
        print(f"\nCross-grader kappa (Haiku vs Gemini Flash): {cross_kappa:.3f} (n={len(haiku_grades)})")

    # Build summary
    from run_benchmark import _build_summary, _write_comparison_table, VENDOR_LABELS, MODEL_MATRIX
    summary = _build_summary(all_results, grade_results, list(question_map.values()), cumulative_cost, 0, False, "")
    if kappa is not None:
        summary["cohens_kappa"] = round(kappa, 4)
    if cross_kappa is not None:
        summary["cross_grader_kappa"] = round(cross_kappa, 4)
    summary["grader_vendor"] = args.grader

    summary_path = run_dir / "summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    table_path = run_dir / "EYEWITNESS_BENCHMARK_RESULTS_B111.md"
    _write_comparison_table(table_path, summary, grade_results, list(question_map.values()))

    # Copy to Bishop dropzone
    bishop_path = SCRIPT_DIR.parent.parent / "BISHOP_DROPZONE" / "00_FOUNDER_REVIEW" / "EYEWITNESS_BENCHMARK_RESULTS_B111.md"
    bishop_path.parent.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy2(table_path, bishop_path)

    print(f"\n{'='*60}")
    print(f"GRADING COMPLETE")
    print(f"  Grader: {args.grader}")
    print(f"  Total grading cost: ${cumulative_cost:.2f}")
    print(f"  Results: {graded_path}")
    print(f"  Summary: {summary_path}")
    print(f"  Table: {table_path}")
    print(f"  Bishop copy: {bishop_path}")
    if kappa is not None:
        print(f"  Haiku-Opus kappa: {kappa:.3f}")
    if cross_kappa is not None:
        print(f"  Haiku-Gemini kappa: {cross_kappa:.3f}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
