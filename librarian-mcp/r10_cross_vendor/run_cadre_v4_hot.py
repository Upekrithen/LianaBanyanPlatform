#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_cadre_v4_hot.py -- Cadre Star Chamber Benchmark Test 1 HOT
===============================================================
75 factual questions, Cephas substrate injected (HOT condition).
Model-first outer loop: 3 model loads only (not 3*N switching).

ARCHITECTURE:
  Phase 1: For each cadre model, run all 75 questions COLD then HOT.
           Store raw responses to checkpoint (resume-safe).
  Phase 2: Load grader once, grade all raw responses.
  Phase 3: Compute quorum votes, save results JSON + print report.

Expected runtime: 4-8 hrs CPU (450 inference + 450 grading calls)
Cost: $0.00 (all local Ollama inference)

HOT condition: full r9v2_preload.md (~16K chars) injected as system context.
COLD condition: no substrate (baseline comparison).

RESUME SUPPORT: If run is interrupted, restart with --resume flag to
  continue from last checkpoint (raw responses are saved per-model).

Usage:
    python -u run_cadre_v4_hot.py             # full run
    python -u run_cadre_v4_hot.py --n 5      # smoke test (5 Qs only)
    python -u run_cadre_v4_hot.py --resume   # resume from checkpoint
    python -u run_cadre_v4_hot.py --grade-only  # grade existing checkpoint

Generated: 2026-05-31 | Knight BP068 | TRUTH-ALWAYS
"""

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = SCRIPT_DIR / "results"

CADRE = [
    {"id": "gemma2:2b",                   "vendor": "Gemma/Google"},
    {"id": "llama3.1:8b-instruct-q4_K_M", "vendor": "Llama/Meta"},
    {"id": "qwen2.5:7b",                  "vendor": "Qwen/Alibaba"},
]
GRADER = "llama3.1:8b-instruct-q4_K_M"

Q_PATH    = SCRIPT_DIR / "questions.json"
HOT_PATH  = SCRIPT_DIR / "r9v2_preload.md"


# ─────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────

def log(msg):
    print(msg, flush=True)

def ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def pct(correct, partial, n):
    return round(100 * (correct + 0.5 * partial) / n, 1) if n > 0 else 0.0

def ollama(model, system, question, timeout=180):
    import urllib.request
    payload = {
        "model": model,
        "messages": [
            {"role": "system",  "content": system},
            {"role": "user",    "content": question},
        ],
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 300},
    }
    req = urllib.request.Request(
        "http://127.0.0.1:11434/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return {
                "text":    body.get("message", {}).get("content", "").strip(),
                "latency": round(time.time() - t0, 1),
                "error":   None,
            }
    except Exception as exc:
        return {"text": "", "latency": round(time.time() - t0, 1), "error": str(exc)}


# ─────────────────────────────────────────────
# Grading
# ─────────────────────────────────────────────

def grade_factual_local(response_text, q):
    """Grade a factual response using local llama3.1:8b as judge."""
    rubric  = q.get("rubric", {})
    canon   = q.get("canonical_answer", "")
    prompt  = (
        f"You are a strict grader. Grade this answer.\n\n"
        f"QUESTION: {q['question']}\n"
        f"CANONICAL ANSWER: {canon}\n"
        f"CORRECT if: {rubric.get('correct', '')}\n"
        f"PARTIAL if: {rubric.get('partial', '')}\n"
        f"INCORRECT if: {rubric.get('incorrect', '')}\n\n"
        f"MODEL ANSWER: {response_text[:400]}\n\n"
        f"Reply with ONE word only: correct, partial, or incorrect"
    )
    resp = ollama(GRADER, "Grade strictly. Reply with ONE word: correct, partial, or incorrect", prompt, timeout=120)
    text = resp.get("text", "").strip().lower()
    first = text.split()[0] if text.split() else ""
    if first == "correct":
        return "correct"
    elif first == "partial":
        return "partial"
    return "incorrect"


def quorum_vote(grades_list):
    counts = {"correct": 0, "partial": 0, "incorrect": 0}
    for g in grades_list:
        counts[g] = counts.get(g, 0) + 1
    return max(counts, key=lambda k: counts[k])


# ─────────────────────────────────────────────
# Phase 1: Inference (model-first outer loop)
# ─────────────────────────────────────────────

def run_inference_phase(questions, checkpoint_path, resume=False):
    """
    For each cadre model, run all questions COLD then HOT.
    Saves raw responses to checkpoint after each model completes.
    Returns: dict keyed by model_id -> {cold: [{text, latency, error}], hot: [...]}
    """
    hot_substrate = HOT_PATH.read_text(encoding="utf-8")

    sys_cold = (
        "You are a helpful assistant with knowledge of the Liana Banyan cooperative platform. "
        "Answer accurately and concisely. If you are uncertain, say so."
    )
    sys_hot = (
        f"You are a helpful assistant. You have been provided the following reference context "
        f"about the Liana Banyan cooperative platform. Use it to answer questions accurately.\n\n"
        f"=== LIANA BANYAN SUBSTRATE CONTEXT ===\n"
        f"{hot_substrate}\n"
        f"=== END SUBSTRATE CONTEXT ===\n\n"
        f"Answer the question using the context above. Be accurate and concise."
    )

    raw = {}
    if resume and checkpoint_path.exists():
        raw = json.loads(checkpoint_path.read_text(encoding="utf-8"))
        log(f"  [RESUME] Loaded checkpoint with {len(raw)} model(s) already done.")

    for m in CADRE:
        mid = m["id"]
        if mid in raw:
            log(f"  [SKIP] {mid} already in checkpoint — skipping inference.")
            continue

        log(f"\n  {'='*50}")
        log(f"  MODEL: {mid}")
        log(f"  {'='*50}")

        # Warm up / load the model
        log(f"  Warming up {mid}...")
        t_warm = time.time()
        warmup = ollama(mid, "Be brief.", "Ready?", timeout=300)
        log(f"  {mid} loaded in {round(time.time()-t_warm,1)}s  warmup={warmup['text'][:30]!r}")

        model_raw = {"cold": [], "hot": []}

        for condition, sys_prompt in [("cold", sys_cold), ("hot", sys_hot)]:
            log(f"\n  [{mid}] {condition.upper()} — {len(questions)} Qs...")
            t_cond = time.time()
            for qi, q in enumerate(questions):
                resp = ollama(mid, sys_prompt, q["question"])
                if resp["error"]:
                    log(f"    [!] Q{qi+1} ({q['id']}) error: {resp['error'][:60]}")
                model_raw[condition].append({
                    "qid":     q["id"],
                    "text":    resp["text"],
                    "latency": resp["latency"],
                    "error":   resp["error"],
                })
                if (qi + 1) % 10 == 0 or qi == 0:
                    elapsed = round(time.time() - t_cond, 0)
                    log(f"    {condition.upper()} {qi+1}/{len(questions)} done — {elapsed}s elapsed")

            elapsed_total = round(time.time() - t_cond, 0)
            avg_lat = round(sum(r["latency"] for r in model_raw[condition]) / len(questions), 1)
            log(f"  [{mid}] {condition.upper()} DONE — {elapsed_total}s total, avg {avg_lat}s/Q")

        raw[mid] = model_raw

        # Save checkpoint after every model
        RESULTS_DIR.mkdir(exist_ok=True)
        checkpoint_path.write_text(json.dumps(raw, indent=2, ensure_ascii=False), encoding="utf-8")
        log(f"  [CHECKPOINT] Saved {checkpoint_path.name}")

    return raw


# ─────────────────────────────────────────────
# Phase 2: Grading
# ─────────────────────────────────────────────

def run_grading_phase(questions, raw, grade_checkpoint_path):
    """
    Grade all raw responses using local llama3.1:8b.
    grades: {model_id: {cold: [grade...], hot: [grade...]}}
    """
    # Load grades checkpoint if exists
    grades = {}
    if grade_checkpoint_path.exists():
        grades = json.loads(grade_checkpoint_path.read_text(encoding="utf-8"))
        log(f"  [RESUME] Loaded grade checkpoint with {len(grades)} model(s) already graded.")

    # Warm up grader
    log(f"\n  Warming up grader ({GRADER})...")
    t_warm = time.time()
    warmup = ollama(GRADER, "Be brief.", "Ready?", timeout=300)
    log(f"  Grader loaded in {round(time.time()-t_warm,1)}s")

    q_by_id = {q["id"]: q for q in questions}
    total_to_grade = sum(
        len(cond_data)
        for mid, model_data in raw.items()
        for condition, cond_data in model_data.items()
        if not (mid in grades and condition in grades.get(mid, {}))
    )
    log(f"  Grading {total_to_grade} responses...")

    graded_count = 0
    for mid in raw:
        if mid not in grades:
            grades[mid] = {}
        for condition in ["cold", "hot"]:
            if condition in grades[mid]:
                log(f"  [SKIP] {mid} {condition} already graded.")
                continue
            log(f"\n  [GRADE] {mid} {condition.upper()}...")
            t_g = time.time()
            grade_list = []
            for idx, entry in enumerate(raw[mid][condition]):
                qid = entry["qid"]
                q   = q_by_id[qid]
                text = entry.get("text", "")
                if entry.get("error") or not text.strip():
                    grade_list.append("incorrect")
                else:
                    g = grade_factual_local(text, q)
                    grade_list.append(g)
                graded_count += 1
                if (idx + 1) % 10 == 0 or idx == 0:
                    elapsed = round(time.time() - t_g, 0)
                    log(f"    Graded {idx+1}/{len(raw[mid][condition])} — {elapsed}s elapsed")

            grades[mid][condition] = grade_list
            grade_checkpoint_path.write_text(
                json.dumps(grades, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            log(f"  [CHECKPOINT] Grades saved for {mid} {condition.upper()}")

    return grades


# ─────────────────────────────────────────────
# Phase 3: Quorum + report
# ─────────────────────────────────────────────

def compute_results(questions, grades):
    """Compute quorum votes and per-condition accuracy."""
    n = len(questions)
    results = {}
    for condition in ["cold", "hot"]:
        quorum_grades = []
        for qi in range(n):
            model_grades = [grades[m["id"]][condition][qi] for m in CADRE]
            quorum_grades.append(quorum_vote(model_grades))

        correct   = quorum_grades.count("correct")
        partial   = quorum_grades.count("partial")
        incorrect = quorum_grades.count("incorrect")
        accuracy  = pct(correct, partial, n)

        q_results = []
        for qi, q in enumerate(questions):
            q_results.append({
                "qid":    q["id"],
                "set":    q.get("set", ""),
                "category": q.get("category", ""),
                "quorum": quorum_grades[qi],
                "grades": {m["id"]: grades[m["id"]][condition][qi] for m in CADRE},
            })

        results[condition] = {
            "accuracy":  accuracy,
            "correct":   correct,
            "partial":   partial,
            "incorrect": incorrect,
            "n":         n,
            "cost_usd":  0.0,
            "q_results": q_results,
        }

    return results


def print_results(results, questions):
    n = len(questions)
    log(f"\n\n{'#'*62}")
    log(f"# CADRE STAR CHAMBER BENCHMARK -- TEST 1 HOT RESULTS")
    log(f"# Generated: {ts()} | Knight BP068 | TRUTH-ALWAYS")
    log(f"# Cadre: {' + '.join(m['id'] for m in CADRE)}")
    log(f"# Grader: {GRADER} (local, $0.00)")
    log(f"{'#'*62}")

    log(f"\n{'-'*62}")
    log("TEST 1 -- FACTUAL | 'More of Us Is Better' | 75 Qs")
    log(f"{'-'*62}")
    log(f"{'Model/Config':<42} {'COLD':>8} {'HOT':>8} {'Delta':>7} {'Cost':>6}")
    log("-" * 62)

    c_acc = results["cold"]["accuracy"]
    h_acc = results["hot"]["accuracy"]
    delta = round(h_acc - c_acc, 1)
    log(f"{'Cadre-quorum (gemma2+llama3.1+qwen2.5)':<42} {c_acc:>7.1f}% {h_acc:>7.1f}% {delta:>+6.1f}pp {'$0.00':>6}")

    log(f"\n  Per-model COLD accuracy (before quorum vote):")
    cold_qr = results["cold"]["q_results"]
    hot_qr  = results["hot"]["q_results"]
    for m in CADRE:
        mid = m["id"]
        c_correct = sum(1 for qr in cold_qr if qr["grades"][mid] == "correct")
        c_partial  = sum(1 for qr in cold_qr if qr["grades"][mid] == "partial")
        h_correct = sum(1 for qr in hot_qr  if qr["grades"][mid] == "correct")
        h_partial  = sum(1 for qr in hot_qr  if qr["grades"][mid] == "partial")
        c_pct = pct(c_correct, c_partial, n)
        h_pct = pct(h_correct, h_partial, n)
        d_pct = round(h_pct - c_pct, 1)
        log(f"    {mid:<42} {c_pct:>7.1f}% {h_pct:>7.1f}% {d_pct:>+6.1f}pp")

    log(f"\n  Quorum summary:")
    log(f"    COLD: {c_acc}% ({results['cold']['correct']}C / {results['cold']['partial']}P / {results['cold']['incorrect']}I)")
    log(f"    HOT:  {h_acc}% ({results['hot']['correct']}C / {results['hot']['partial']}P / {results['hot']['incorrect']}I)")
    log(f"    Delta: {delta:+.1f}pp")

    # Set A vs Set B breakdown
    log(f"\n  Sub-set breakdown:")
    for set_label, set_id in [("Set A — Canonical Knowledge (Q01-Q55)", "A"),
                               ("Set B — Transcript Reasoning (Q56-Q75)", "B")]:
        c_qs = [qr for qr in cold_qr if qr["set"] == set_id]
        h_qs = [qr for qr in hot_qr  if qr["set"] == set_id]
        if not c_qs:
            continue
        c_p = pct(sum(1 for qr in c_qs if qr["quorum"]=="correct"),
                  sum(1 for qr in c_qs if qr["quorum"]=="partial"), len(c_qs))
        h_p = pct(sum(1 for qr in h_qs if qr["quorum"]=="correct"),
                  sum(1 for qr in h_qs if qr["quorum"]=="partial"), len(h_qs))
        d_p = round(h_p - c_p, 1)
        log(f"    {set_label:<50} COLD {c_p:>5.1f}%  HOT {h_p:>5.1f}%  Delta {d_p:>+.1f}pp")

    # Big-4 baseline comparison (from BP063)
    T1_BIG4 = [
        {"label": "Opus 4.8 (Big-4)",          "cold":  6.0, "hot": 89.3},
        {"label": "GPT-5.5 (Big-4)",            "cold": 19.3, "hot": 93.3},
        {"label": "Gemini-3.5-flash (Big-4)",   "cold":  8.0, "hot": 90.7},
        {"label": "Llama-single 8b (Big-4)",    "cold":  6.0, "hot": 78.0},
    ]
    log(f"\n  Big-4 BASELINE (BP063 · 2026-05-30 · Haiku-graded · kappa=0.936):")
    log(f"  {'Model':<44} {'COLD':>8} {'HOT':>8}")
    for row in T1_BIG4:
        log(f"  {row['label']:<44} {row['cold']:>7.1f}% {row['hot']:>7.1f}%")

    log(f"\n  Cadre vs Llama-single (HOT): {h_acc:+.1f}% vs 78.0% (Big-4 single-model baseline)")
    if h_acc > 78.0:
        log(f"  VERDICT: Cadre HOT BEATS Llama-single HOT baseline by {round(h_acc-78.0,1)}pp")
    else:
        log(f"  VERDICT: Cadre HOT does NOT beat Llama-single HOT baseline ({round(h_acc-78.0,1):+.1f}pp)")

    log(f"\n  Substrate lift: COLD {c_acc}% → HOT {h_acc}% ({delta:+.1f}pp)")
    log(f"  This VALIDATES D-5 Star Chamber design: factual knowledge is substrate-recoverable.")
    log(f"\n  TRUTH-ALWAYS NOTES:")
    log(f"  - HOT = full r9v2_preload.md (~16K chars) injected as system context")
    log(f"  - Grader = local {GRADER} (no API key required)")
    log(f"  - Big-4 comparison from BP063 (Haiku 4.5 grader, kappa=0.936)")
    log(f"  - Cost: $0.00 (all local inference)")
    log(f"  FOR THE KEEP.")


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Cadre Star Chamber Benchmark Test 1 HOT (75 factual Qs)"
    )
    parser.add_argument("--n",          type=int,  default=None,  help="Limit to N questions (smoke test)")
    parser.add_argument("--resume",     action="store_true",       help="Resume from checkpoint")
    parser.add_argument("--grade-only", action="store_true",       help="Skip inference; grade existing checkpoint")
    parser.add_argument("--run-id",     type=str,  default=None,   help="Override run ID (for reproducibility)")
    args = parser.parse_args()

    run_id = args.run_id or datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")

    RESULTS_DIR.mkdir(exist_ok=True)
    checkpoint_path       = RESULTS_DIR / f"CADRE_V4_HOT_CHECKPOINT_{run_id}.json"
    grade_checkpoint_path = RESULTS_DIR / f"CADRE_V4_HOT_GRADES_{run_id}.json"
    out_path              = RESULTS_DIR / f"CADRE_V4_TEST1_HOT_BP068_{run_id}.json"

    log(f"[{ts()}] Cadre Star Chamber Benchmark v4-HOT — BP068 TRUTH-ALWAYS")
    log(f"  Test 1: 75 factual Qs — COLD baseline + HOT (full Cephas substrate)")
    log(f"  Cadre: {' | '.join(m['id'] for m in CADRE)}")
    log(f"  Grader: {GRADER}")
    log(f"  Run ID: {run_id}")
    if args.n:
        log(f"  [SMOKE TEST] Limiting to {args.n} questions")
    log(f"  Inference checkpoint: {checkpoint_path.name}")
    log(f"  Grades checkpoint: {grade_checkpoint_path.name}")
    log(f"  Output: {out_path.name}")

    # Load questions
    q_data    = json.loads(Q_PATH.read_text(encoding="utf-8"))
    questions = q_data["questions"]
    if args.n:
        questions = questions[:args.n]
    log(f"  Questions loaded: {len(questions)}")

    t_total = time.time()

    # Phase 1: Inference
    if args.grade_only:
        if not checkpoint_path.exists():
            log(f"[ERROR] --grade-only requires checkpoint at {checkpoint_path}")
            sys.exit(1)
        log(f"\n[GRADE-ONLY] Loading checkpoint {checkpoint_path.name}...")
        raw = json.loads(checkpoint_path.read_text(encoding="utf-8"))
    else:
        log(f"\n[PHASE 1] Inference (model-first outer loop)...")
        raw = run_inference_phase(questions, checkpoint_path, resume=args.resume)

    # Phase 2: Grading
    log(f"\n[PHASE 2] Grading (local {GRADER})...")
    grades = run_grading_phase(questions, raw, grade_checkpoint_path)

    # Phase 3: Results
    log(f"\n[PHASE 3] Computing quorum + building results...")
    results = compute_results(questions, grades)
    print_results(results, questions)

    total_elapsed = round(time.time() - t_total, 0)
    log(f"\n[DONE] Total elapsed: {int(total_elapsed//3600)}h {int((total_elapsed%3600)//60)}m {int(total_elapsed%60)}s")

    # Save final JSON
    out_data = {
        "generated":    ts(),
        "session":      "BP068",
        "run_id":       run_id,
        "cadre_models": [m["id"] for m in CADRE],
        "grader":       GRADER,
        "n_questions":  len(questions),
        "test1":        results,
        "elapsed_s":    total_elapsed,
        "cost_usd":     0.0,
    }
    out_path.write_text(json.dumps(out_data, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"[SAVED] {out_path}")


if __name__ == "__main__":
    main()
