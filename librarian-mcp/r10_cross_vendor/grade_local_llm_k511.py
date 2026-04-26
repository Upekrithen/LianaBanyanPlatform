#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
grade_local_llm_k511.py — Phase D Multi-Grader for K511 Local-LLM Benchmark
=============================================================================
K511 / B125

Grading protocol (mirrors grade_r13_k499.py):
  Primary:    Deterministic HOT/HIT/MISS (already computed by run_local_llm_k511.py)
  Cross-check: LLM judge on 100% of records (small N=100, so full grading is cheap)
    - Claude Haiku 4.5 (primary LLM judge)
    - Gemini 3.1 Flash Lite (independent cross-check for inter-rater agreement)
  Kappa:      Cohen's kappa between deterministic and each LLM judge
  Comparison: Side-by-side vs R13 results summary

Cloud cost for grading: ~100 records × 2 judges × ~$0.0005 ≈ $0.10

Outputs:
  - results_local_llm_k511/grading_summary_k511.json
  - results_local_llm_k511/llm_grades_k511.jsonl
  - Prints inter-rater agreement (Cohen's kappa)
  - Prints comparison table vs R13_K499

Usage:
    # Full grading (requires ANTHROPIC_API_KEY + GEMINI_API_KEY):
    python grade_local_llm_k511.py

    # Deterministic stats only (no LLM cross-check, no API keys needed):
    python grade_local_llm_k511.py --no-llm-check

    # Load SDS.env first:
    # PowerShell: Get-Content .../SDS.env | ForEach-Object { if ($_ -match "^([A-Z_]+)=(.+)$") { [Environment]::SetEnvironmentVariable($matches[1],$matches[2],"Process") } }
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR  = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

RESULTS_DIR = SCRIPT_DIR / "results_local_llm_k511"
R13_SUMMARY = SCRIPT_DIR / "results_R13_K499" / "results_summary_R13_K499.json"
BANK_FILE   = SCRIPT_DIR / "R12_QUESTION_BANK_CRANEWELL_SEALED.json"

HAIKU_MODEL  = "claude-haiku-4-5-20251001"
GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

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


# ─── Data loading ─────────────────────────────────────────────────────────────

def load_all_results() -> list[dict]:
    all_records: list[dict] = []
    for jsonl_file in sorted(RESULTS_DIR.glob("*.jsonl")):
        if jsonl_file.name.startswith("llm_grades"):
            continue
        with open(jsonl_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    all_records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return all_records


def load_bank_index() -> dict[str, dict]:
    with open(BANK_FILE, encoding="utf-8") as f:
        d = json.load(f)
    return {q["id"]: q for q in d["questions"]}


# ─── Deterministic grading stats ──────────────────────────────────────────────

def print_deterministic_summary(results: list[dict]) -> dict:
    """Compute and print stats from existing grade fields. Returns condition_results dict."""
    condition_results: dict[str, dict] = {}

    for condition in ["cold", "cathedral"]:
        items = [r for r in results if r.get("condition") == condition]
        graded = [r for r in items if r.get("grade") in ("HOT", "HIT", "MISS")]
        errors = [r for r in items if r.get("grade") == "error"]
        n = len(graded)
        hot  = sum(1 for r in graded if r["grade"] == "HOT")
        hit  = sum(1 for r in graded if r["grade"] == "HIT")
        miss = sum(1 for r in graded if r["grade"] == "MISS")
        latencies = [r.get("latency_s", 0) for r in items if r.get("latency_s")]
        avg_lat = sum(latencies) / max(1, len(latencies))
        input_toks  = sum(r.get("input_tokens", 0) for r in items)
        output_toks = sum(r.get("output_tokens", 0) for r in items)

        condition_results[condition] = {
            "n": n, "errors": len(errors),
            "HOT": hot, "HIT": hit, "MISS": miss,
            "hot_pct": round(100 * hot / max(1, n), 1),
            "hit_pct": round(100 * hit / max(1, n), 1),
            "miss_pct": round(100 * miss / max(1, n), 1),
            "avg_lat_s": round(avg_lat, 2),
            "total_input_tokens": input_toks,
            "total_output_tokens": output_toks,
        }

    cold = condition_results.get("cold", {})
    cath = condition_results.get("cathedral", {})

    print(f"\n{'='*65}")
    print(f"K511 DETERMINISTIC RESULTS  (Cranewell bank, n=50 per condition)")
    print(f"{'='*65}")
    print(f"{'Condition':<15} {'HOT%':>7}  {'HIT%':>6}  {'MISS%':>6}  {'N':>4}  {'Avg lat':>8}  {'Errors':>6}")
    print(f"{'─'*65}")
    for cond in ["cold", "cathedral"]:
        cr = condition_results[cond]
        print(
            f"{cond:<15} {cr['hot_pct']:>6.1f}%  {cr['hit_pct']:>5.1f}%  "
            f"{cr['miss_pct']:>5.1f}%  {cr['n']:>4}  {cr['avg_lat_s']:>7.1f}s  {cr['errors']:>6}"
        )
    if cold and cath:
        lift = round(cath["hot_pct"] - cold["hot_pct"], 1)
        print(f"{'─'*65}")
        print(f"Cathedral lift vs cold:           +{lift:.1f}pp HOT")

    # R13 comparison
    if R13_SUMMARY.exists():
        with open(R13_SUMMARY, encoding="utf-8") as f:
            r13 = json.load(f)
        cr_results = r13.get("model_condition_results", {})

        # Compute R13 mean cold/cathedral across all 8 models
        r13_cold_hots   = [v["hot_pct"] for k, v in cr_results.items() if v["condition"] == "cold"]
        r13_cath_hots   = [v["hot_pct"] for k, v in cr_results.items() if v["condition"] == "cathedral"]
        if r13_cold_hots and r13_cath_hots:
            r13_mean_cold  = round(sum(r13_cold_hots) / len(r13_cold_hots), 1)
            r13_mean_cath  = round(sum(r13_cath_hots) / len(r13_cath_hots), 1)
            r13_mean_lift  = round(r13_mean_cath - r13_mean_cold, 1)
            print(f"\n{'─'*65}")
            print(f"R13 comparison (8 cloud models, same Cranewell bank):")
            print(f"  R13 mean cold HOT%:       {r13_mean_cold:.1f}%")
            print(f"  R13 mean cathedral HOT%:  {r13_mean_cath:.1f}%")
            print(f"  R13 mean lift:            +{r13_mean_lift:.1f}pp")
    print(f"{'='*65}\n")

    return condition_results


# ─── LLM judge call helpers ───────────────────────────────────────────────────

def call_llm_judge(model: str, vendor: str, prompt: str, retries: int = 3) -> dict | None:
    from adapters import anthropic_adapter, google_adapter
    adapter = anthropic_adapter if vendor == "anthropic" else google_adapter

    for attempt in range(1, retries + 1):
        try:
            resp = adapter.call(model, "You are a grading assistant.", prompt)
            text = resp.text.strip()
            # Strip markdown fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            parsed = json.loads(text)
            if parsed.get("grade") not in ("HOT", "HIT", "MISS"):
                raise ValueError(f"Unexpected grade: {parsed.get('grade')}")
            parsed["cost_usd"] = resp.cost_usd
            parsed["latency_s"] = resp.latency_s
            return parsed
        except Exception as e:
            if attempt < retries:
                time.sleep(2 ** attempt)
            else:
                print(f"    [judge error] {vendor}/{model}: {e}", flush=True)
    return None


# ─── Cohen's kappa ────────────────────────────────────────────────────────────

def cohens_kappa(labels_a: list[str], labels_b: list[str]) -> float:
    """Cohen's kappa for two equal-length label lists."""
    cats = ["HOT", "HIT", "MISS"]
    n = len(labels_a)
    if n == 0:
        return float("nan")
    po = sum(1 for a, b in zip(labels_a, labels_b) if a == b) / n
    freq_a = {c: labels_a.count(c) / n for c in cats}
    freq_b = {c: labels_b.count(c) / n for c in cats}
    pe = sum(freq_a[c] * freq_b[c] for c in cats)
    return round((po - pe) / (1 - pe) if pe < 1 else 1.0, 4)


# ─── Main grading flow ────────────────────────────────────────────────────────

def run_grading(args: argparse.Namespace) -> None:
    results = load_all_results()
    if not results:
        print("ERROR: No results found in", RESULTS_DIR, file=sys.stderr)
        print("Run run_local_llm_k511.py first.", file=sys.stderr)
        sys.exit(1)

    print(f"\nLoaded {len(results)} records from {RESULTS_DIR}")
    condition_results = print_deterministic_summary(results)

    if args.no_llm_check:
        print("[--no-llm-check] Skipping LLM cross-check.")
        return

    # Check API keys
    missing = []
    if not os.environ.get("ANTHROPIC_API_KEY"):
        missing.append("ANTHROPIC_API_KEY")
    if not os.environ.get("GEMINI_API_KEY") and not os.environ.get("GOOGLE_API_KEY"):
        missing.append("GEMINI_API_KEY or GOOGLE_API_KEY")
    if missing:
        print(f"\nWARNING: Missing env vars for LLM grading: {missing}")
        print("Load SDS.env first, or use --no-llm-check for stats-only mode.")
        sys.exit(1)

    bank = load_bank_index()
    graded_records = [r for r in results if r.get("grade") in ("HOT", "HIT", "MISS")]

    print(f"\nLLM cross-check: {len(graded_records)} records (Haiku 4.5 + Gemini Flash)")
    llm_grades_path = RESULTS_DIR / "llm_grades_k511.jsonl"

    # Load already-graded IDs to support resume
    completed: set[str] = set()
    if llm_grades_path.exists():
        with open(llm_grades_path, encoding="utf-8") as f:
            for line in f:
                try:
                    rec = json.loads(line)
                    completed.add(f"{rec['question_id']}_{rec['condition']}")
                except Exception:
                    pass
    if completed:
        print(f"  [resume] {len(completed)} LLM grades already done")

    haiku_grades:  dict[str, str] = {}
    gemini_grades: dict[str, str] = {}
    deterministic: dict[str, str] = {}
    llm_cost = 0.0

    for i, rec in enumerate(graded_records, 1):
        key = f"{rec['question_id']}_{rec['condition']}"
        deterministic[key] = rec["grade"]

        if key in completed:
            # Reload from file for kappa computation
            with open(llm_grades_path, encoding="utf-8") as f:
                for line in f:
                    try:
                        lr = json.loads(line)
                        if f"{lr['question_id']}_{lr['condition']}" == key:
                            haiku_grades[key]  = lr.get("haiku_grade", "")
                            gemini_grades[key] = lr.get("gemini_grade", "")
                    except Exception:
                        pass
            continue

        q = bank.get(rec["question_id"], {})
        prompt = LLM_JUDGE_PROMPT.format(
            question=q.get("question", rec.get("question", "")),
            required_elements=json.dumps(q.get("hot_required_elements", [])),
            response_text=rec["response_text"][:3000],
        )

        print(f"  [{i}/{len(graded_records)}] {rec['question_id']}/{rec['condition']}…", end=" ", flush=True)

        haiku_result  = call_llm_judge(HAIKU_MODEL,  "anthropic", prompt)
        gemini_result = call_llm_judge(GEMINI_MODEL, "google",    prompt)

        hg = haiku_result["grade"]  if haiku_result  else "error"
        gg = gemini_result["grade"] if gemini_result else "error"
        haiku_grades[key]  = hg
        gemini_grades[key] = gg

        hc = haiku_result["cost_usd"]  if haiku_result  else 0.0
        gc = gemini_result["cost_usd"] if gemini_result else 0.0
        llm_cost += hc + gc

        llm_record = {
            "question_id":        rec["question_id"],
            "condition":          rec["condition"],
            "deterministic_grade": rec["grade"],
            "haiku_grade":        hg,
            "gemini_grade":       gg,
            "haiku_rationale":    haiku_result.get("rationale")  if haiku_result  else None,
            "gemini_rationale":   gemini_result.get("rationale") if gemini_result else None,
            "haiku_cost_usd":     round(hc, 6),
            "gemini_cost_usd":    round(gc, 6),
        }
        with open(llm_grades_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(llm_record, ensure_ascii=False) + "\n")

        agree_h = "✓" if hg == rec["grade"] else "✗"
        agree_g = "✓" if gg == rec["grade"] else "✗"
        print(f"det={rec['grade']} haiku={hg}{agree_h} gemini={gg}{agree_g}", flush=True)

    # Kappa computation
    keys_in_order = [
        f"{r['question_id']}_{r['condition']}"
        for r in graded_records
        if f"{r['question_id']}_{r['condition']}" in haiku_grades
    ]
    det_list    = [deterministic[k]  for k in keys_in_order]
    haiku_list  = [haiku_grades.get(k, "error") for k in keys_in_order]
    gemini_list = [gemini_grades.get(k, "error") for k in keys_in_order]

    # Filter out error grades for kappa
    valid_h = [(d, h) for d, h in zip(det_list, haiku_list)  if h in ("HOT", "HIT", "MISS")]
    valid_g = [(d, g) for d, g in zip(det_list, gemini_list) if g in ("HOT", "HIT", "MISS")]

    kappa_h = cohens_kappa([x[0] for x in valid_h], [x[1] for x in valid_h])
    kappa_g = cohens_kappa([x[0] for x in valid_g], [x[1] for x in valid_g])

    print(f"\n{'='*55}")
    print(f"LLM CROSS-CHECK SUMMARY")
    print(f"{'='*55}")
    print(f"Records graded: {len(keys_in_order)}")
    print(f"LLM grading cost: ${llm_cost:.4f}")
    print(f"Kappa (det vs Haiku 4.5):        {kappa_h:.4f}  (n={len(valid_h)})")
    print(f"Kappa (det vs Gemini Flash):      {kappa_g:.4f}  (n={len(valid_g)})")
    print(f"{'─'*55}")
    haiku_agree_pct  = 100 * sum(1 for a, b in valid_h if a == b) / max(1, len(valid_h))
    gemini_agree_pct = 100 * sum(1 for a, b in valid_g if a == b) / max(1, len(valid_g))
    print(f"Agreement (det vs Haiku):        {haiku_agree_pct:.1f}%")
    print(f"Agreement (det vs Gemini):       {gemini_agree_pct:.1f}%")
    print(f"{'='*55}\n")

    # Write grading summary
    summary = {
        "benchmark":         "K511_LocalLLM",
        "grading_run_at":    __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "records_graded":    len(keys_in_order),
        "llm_grading_cost_usd": round(llm_cost, 4),
        "kappa_det_vs_haiku":   kappa_h,
        "kappa_det_vs_gemini":  kappa_g,
        "agreement_pct_haiku":  round(haiku_agree_pct, 1),
        "agreement_pct_gemini": round(gemini_agree_pct, 1),
        "condition_results": condition_results,
    }
    summary_path = RESULTS_DIR / "grading_summary_k511.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"Grading summary → {summary_path}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="K511 Local-LLM Grader — Phase D"
    )
    parser.add_argument(
        "--no-llm-check", action="store_true",
        help="Skip LLM cross-check; print deterministic stats only",
    )
    args = parser.parse_args()
    run_grading(args)


if __name__ == "__main__":
    main()
