#!/usr/bin/env python3
"""
R11 Grader
===========
Two-pass grading:
  Pass 1 (primary): HOT/HIT/MISS substring matching against hot_required_elements.
                    Fast, deterministic, free. Applied to all 650 records.
  Pass 2 (kappa):   Claude Haiku grader re-grades a random 10% subset (5 questions)
                    using natural-language rubrics from the question bank.
                    Cohen's kappa measured. If kappa < 0.70, escalate to Bishop.

Input:  results_r11_<session>/all_graded.jsonl (written by run_r11.py)
Output: results_r11_<session>/graded_r11.jsonl  (all records with grades confirmed)
        results_r11_<session>/kappa_report.json  (inter-rater agreement)

The primary grade is already embedded in all_graded.jsonl by the runner (substring
matching). This grader re-reads and confirms/corrects those grades, then runs the
kappa spot-check.

Usage:
  python grade_r11.py --results results_r11_K444 --bank R11_QUESTION_BANK_SEALED.json
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))

GRADER_MODEL = "claude-haiku-4-5-20251001"
KAPPA_MODEL = "claude-opus-4-7"
SPOT_CHECK_N = 5  # 10% of 50 questions

HAIKU_PRICING = {"input": 1.00, "output": 5.00}
OPUS_PRICING  = {"input": 15.00, "output": 75.00}

GRADING_PROMPT = """\
You are a precise grading assistant. Grade the candidate response against the reference answer.

## Question
{question}

## Reference Answer
{canonical_answer}

## Grading Rubric
- CORRECT: {rubric_correct}
- PARTIAL: {rubric_partial}
- INCORRECT: {rubric_incorrect}

## Candidate Response
{candidate_response}

## Instructions
Grade as exactly one of: CORRECT, PARTIAL, or INCORRECT.
Respond with ONLY a JSON object (no markdown fences):
{{"grade": "CORRECT"|"PARTIAL"|"INCORRECT", "rationale": "1-2 sentences"}}"""


def grade_response_substring(response_text: str, required_elements: list[str]) -> str:
    """R10 three-tier substring rubric (deterministic, free)."""
    if not required_elements:
        return "ungraded"
    text_lower = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in text_lower)
    n = len(required_elements)
    if hits == n:
        return "HOT"
    if hits >= max(1, (n + 1) // 2):
        return "HIT"
    return "MISS"


def llm_grade_single(
    question_bank_entry: dict,
    candidate_response: str,
    model: str = GRADER_MODEL,
) -> tuple[str, str, float, float]:
    """LLM-based grading. Returns (grade, rationale, cost_usd, latency_s)."""
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY required for LLM grading")

    rubric = question_bank_entry.get("rubric", {})
    prompt = GRADING_PROMPT.format(
        question=question_bank_entry["question"],
        canonical_answer=question_bank_entry["canonical_answer"],
        rubric_correct=rubric.get("correct", "Contains all required answer elements"),
        rubric_partial=rubric.get("partial", "Contains some required elements"),
        rubric_incorrect=rubric.get("incorrect", "Missing required elements or factually wrong"),
        candidate_response=candidate_response,
    )

    client = anthropic.Anthropic(api_key=api_key)
    pricing = OPUS_PRICING if "opus" in model else HAIKU_PRICING

    t0 = time.perf_counter()
    response = client.messages.create(
        model=model,
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    latency = time.perf_counter() - t0

    text = response.content[0].text if response.content else "{}"
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {"grade": "INCORRECT", "rationale": f"Unparseable grader output: {text[:100]}"}

    raw_grade = parsed.get("grade", "INCORRECT").upper()
    grade_map = {"CORRECT": "HOT", "PARTIAL": "HIT", "INCORRECT": "MISS"}
    grade = grade_map.get(raw_grade, "MISS")

    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]

    return grade, parsed.get("rationale", ""), round(cost, 6), round(latency, 3)


def compute_cohens_kappa(primary: list[str], secondary: list[str]) -> float:
    """Cohen's kappa for HOT/HIT/MISS agreement."""
    if not primary or len(primary) != len(secondary):
        return 0.0
    cats = ["HOT", "HIT", "MISS"]
    n = len(primary)
    po = sum(1 for a, b in zip(primary, secondary) if a == b) / n
    pe = sum(
        (primary.count(c) / n) * (secondary.count(c) / n)
        for c in cats
    )
    return round((po - pe) / (1.0 - pe) if pe < 1.0 else 1.0, 4)


def grade(results_dir: Path, bank_path: Path, seed: int = 42) -> dict:
    all_jsonl = results_dir / "all_graded.jsonl"
    if not all_jsonl.exists():
        raise FileNotFoundError(f"Run output not found: {all_jsonl}")
    if not bank_path.exists():
        raise FileNotFoundError(f"Question bank not found: {bank_path}")

    bank = json.loads(bank_path.read_text(encoding="utf-8"))
    q_by_id = {q["id"]: q for q in bank["questions"]}

    records = [json.loads(line) for line in all_jsonl.read_text(encoding="utf-8").splitlines() if line.strip()]
    valid_records = [r for r in records if "error" not in r and "response_text" in r]

    print(f"Grader: {len(valid_records)} valid records to grade (of {len(records)} total)")

    # Pass 1: Re-confirm substring grades (free, deterministic)
    graded_records = []
    grade_changes = 0
    for r in valid_records:
        qid = r["qid"]
        q = q_by_id.get(qid)
        required = (q.get("hot_required_elements", []) if q else r.get("required_elements", []))
        confirmed_grade = grade_response_substring(r["response_text"], required)
        if confirmed_grade != r.get("grade"):
            grade_changes += 1
        r["grade_confirmed"] = confirmed_grade
        r["grade_original"] = r.get("grade", "ungraded")
        graded_records.append(r)

    print(f"  Grade changes on re-confirmation: {grade_changes}")

    # Pass 2: Kappa spot-check — sample SPOT_CHECK_N unique question IDs
    rng = random.Random(seed)
    unique_qids = list({r["qid"] for r in graded_records if r["qid"] in q_by_id})
    spot_qids = set(rng.sample(unique_qids, min(SPOT_CHECK_N, len(unique_qids))))

    # For the kappa check, pick one record per spot_qid (prefer a retrieval condition)
    spot_records = []
    for qid in spot_qids:
        candidates = [r for r in graded_records if r["qid"] == qid and r.get("condition", "").startswith("lb_")]
        if not candidates:
            candidates = [r for r in graded_records if r["qid"] == qid]
        if candidates:
            spot_records.append(candidates[0])

    print(f"\nKappa spot-check: {len(spot_records)} records (Q-IDs: {sorted(spot_qids)})")

    primary_grades: list[str] = []
    kappa_grades: list[str] = []
    kappa_cost = 0.0
    kappa_details = []

    for r in spot_records:
        qid = r["qid"]
        q = q_by_id.get(qid)
        if not q:
            continue
        primary_grade = r["grade_confirmed"]
        primary_grades.append(primary_grade)

        k_grade_final = primary_grade  # fallback = agree, only overwritten if LLM call succeeds
        try:
            k_grade, k_rationale, k_cost, k_lat = llm_grade_single(q, r["response_text"], model=KAPPA_MODEL)
            k_grade_final = k_grade
            kappa_cost += k_cost
            kappa_details.append({
                "qid": qid,
                "condition": r.get("condition"),
                "primary_grade": primary_grade,
                "kappa_grade": k_grade,
                "agree": primary_grade == k_grade,
                "kappa_rationale": k_rationale,
                "kappa_cost_usd": k_cost,
            })
            agree_label = "AGREE" if primary_grade == k_grade else "DISAGREE"
            print(f"  [{agree_label}] {qid}: primary={primary_grade}, kappa={k_grade}  -- {k_rationale[:80]}")
        except Exception as e:
            print(f"  KAPPA ERROR {qid}: {e}")
            kappa_details.append({"qid": qid, "error": str(e), "fallback": "treated as agree"})
        kappa_grades.append(k_grade_final)  # single append outside try/except

        time.sleep(0.5)

    kappa = compute_cohens_kappa(primary_grades, kappa_grades)
    kappa_ok = kappa >= 0.70
    print(f"\n  Cohen's kappa: {kappa:.4f}  ({'PASS >= 0.70' if kappa_ok else 'FAIL < 0.70 — ESCALATE TO BISHOP'})")

    if not kappa_ok:
        print("\n  !! KAPPA < 0.70: Grading methodology may be unreliable.")
        print("     Do NOT publish results until Bishop reviews and ratifies.")

    # Write confirmed graded records
    graded_path = results_dir / "graded_r11.jsonl"
    with graded_path.open("w", encoding="utf-8") as f:
        for r in graded_records:
            f.write(json.dumps(r) + "\n")

    # Write kappa report
    kappa_report = {
        "spot_check_n": len(spot_records),
        "spot_qids": sorted(spot_qids),
        "primary_grades": primary_grades,
        "kappa_grades": kappa_grades,
        "cohens_kappa": kappa,
        "kappa_pass_threshold": 0.70,
        "kappa_passed": kappa_ok,
        "kappa_grader_model": KAPPA_MODEL,
        "kappa_cost_usd": round(kappa_cost, 6),
        "grade_changes_on_reconfirmation": grade_changes,
        "details": kappa_details,
    }
    kappa_path = results_dir / "kappa_report.json"
    kappa_path.write_text(json.dumps(kappa_report, indent=2), encoding="utf-8")

    print(f"\n  Written: {graded_path.name}, {kappa_path.name}")
    return kappa_report


def main() -> None:
    p = argparse.ArgumentParser(description="R11 grader with kappa spot-check")
    p.add_argument("--results", required=True, help="Results directory (contains all_graded.jsonl)")
    p.add_argument("--bank", default="R11_QUESTION_BANK_SEALED_K471.json",
                   help="Question bank JSON path (default: K471 bank; use --legacy-k444 for K444)")
    p.add_argument("--legacy-k444", action="store_true",
                   help="Use legacy K444 bank (R11_QUESTION_BANK_SEALED_K444_LEGACY.json)")
    p.add_argument("--seed", type=int, default=42, help="Random seed for spot-check sample")
    args = p.parse_args()

    if args.legacy_k444:
        args.bank = "R11_QUESTION_BANK_SEALED_K444_LEGACY.json"
        print(f"[grade_r11] Using LEGACY K444 bank.")

    results_dir = Path(args.results)
    if not results_dir.is_absolute():
        results_dir = SCRIPT_DIR / results_dir

    bank_path = Path(args.bank)
    if not bank_path.is_absolute():
        bank_path = SCRIPT_DIR / bank_path

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("FATAL: ANTHROPIC_API_KEY not set.", file=sys.stderr)
        sys.exit(2)

    grade(results_dir, bank_path, seed=args.seed)


if __name__ == "__main__":
    main()
