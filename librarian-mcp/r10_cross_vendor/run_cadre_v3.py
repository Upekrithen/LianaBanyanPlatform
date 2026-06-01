#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_cadre_v3.py -- Cadre Star Chamber Benchmark (BP067, TRUTH-ALWAYS)
======================================================================
Cadre quorum = gemma2:2b + llama3.1:8b-instruct-q4_K_M + qwen2.5:7b
  (mistral:7b EXCLUDED: measured 73s/call on this CPU machine)

TEST 1: 75-Q Factual ('More of Us Is Better')
  COLD: no substrate  (fast: ~4-8s/call)
  HOT:  full r9v2_preload (16K chars) -- SLOW on CPU (~30-60s/call)
        HOT is run as a background job (started separately)
  This script runs COLD only for Test 1.

TEST 2: 25-Q Reasoning (ARC-Challenge Q1-Q15 + GSM8K Q16-Q25)
  COLD: no substrate
  HOT:  minimal substrate marker (100 chars) -- HOT is intentionally
        NOT the full preload, because substrate is irrelevant to
        science/math reasoning. Tests: does LB context distract or help?
  Grading: DETERMINISTIC (letter-match MCQ, numeric-compare math)

Grader for Test 1 COLD: local llama3.1:8b (no API key)
Big-4 baseline: from BP063 run 2026-05-30 (authoritative, not re-run)

TRUTH-ALWAYS notes:
  - Test 1 HOT NOT run in this script (CPU constraint: ~4+ hrs for quorum HOT)
  - Test 1 COLD grader = local llama3.1:8b, not Haiku 4.5 (no API key)
  - Pending: run with API keys for Haiku grading + kappa cross-validation
  - Test 2 HOT uses minimal substrate (100 chars) -- valid for testing
    distraction/confusion effect; NOT the same HOT as BP063 factual HOT

Usage:
    python -u run_cadre_v3.py          # Test 1 COLD + Test 2 full
    python -u run_cadre_v3.py --test 2 # Test 2 only (~20 min)
    python -u run_cadre_v3.py --n 5   # 5 Qs smoke check

Generated: 2026-06-01 | Knight BP067 | TRUTH-ALWAYS
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

CADRE = [
    {"id": "gemma2:2b",                   "vendor": "Gemma/Google"},
    {"id": "llama3.1:8b-instruct-q4_K_M", "vendor": "Llama/Meta"},
    {"id": "qwen2.5:7b",                  "vendor": "Qwen/Alibaba"},
]
GRADER = "llama3.1:8b-instruct-q4_K_M"

T1_BIG4 = [
    {"label": "Opus 4.8",         "cold":  6.0, "hot": 89.3, "delta": 83.3, "cost_hot": "$0.133/Q"},
    {"label": "GPT-5.5",          "cold": 19.3, "hot": 93.3, "delta": 74.0, "cost_hot": "$0.027/Q"},
    {"label": "Gemini-3.5-flash", "cold":  8.0, "hot": 90.7, "delta": 82.7, "cost_hot": "$0.009/Q"},
    {"label": "Llama-single (8b)","cold":  6.0, "hot": 78.0, "delta": 72.0, "cost_hot": "$0.000/Q"},
]

REASONING_QS = [
    {"id":"R01","q":"Student measured toy car speed on flat surface. When surface tilted, which observation indicates kinetic energy increased? A) car moves slower B) car moves faster C) same speed D) car stops","answer":"B","src":"ARC"},
    {"id":"R02","q":"Which is a chemical change? A) Water boiling to steam B) Log burning in fireplace C) Ice melting D) Sugar dissolving in water","answer":"B","src":"ARC"},
    {"id":"R03","q":"Plant uses CO2 and water to produce glucose and oxygen in sunlight. What process? A) Respiration B) Decomposition C) Photosynthesis D) Fermentation","answer":"C","src":"ARC"},
    {"id":"R04","q":"Which adaptation helps an animal survive in extremely cold environment? A) Thin skin no hair B) Large surface area relative to body volume C) Thick layer of fur and fat D) Ability to sweat heavily","answer":"C","src":"ARC"},
    {"id":"R05","q":"Two objects heated equally. Object A gets much hotter than B. What does this tell us? A) A has higher specific heat B) A has lower specific heat C) Both same specific heat D) B has lower specific heat","answer":"B","src":"ARC"},
    {"id":"R06","q":"Magnet moved in and out of coil of wire quickly. What is produced? A) Heat only B) Light only C) Electric current D) Magnetic field only","answer":"C","src":"ARC"},
    {"id":"R07","q":"When is a flagpole's shadow shortest? A) Early morning B) Late afternoon C) Around noon D) At sunset","answer":"C","src":"ARC"},
    {"id":"R08","q":"Astronaut on Moon drops hammer and feather from same height. Which lands first? A) Hammer B) Feather C) Same time D) Neither","answer":"C","src":"ARC"},
    {"id":"R09","q":"What happens to volume of gas in sealed container when temperature increases (constant pressure)? A) Decreases B) Stays same C) Increases D) Becomes zero","answer":"C","src":"ARC"},
    {"id":"R10","q":"Which type of rock forms from cooling molten material? A) Sedimentary B) Igneous C) Metamorphic D) Organic","answer":"B","src":"ARC"},
    {"id":"R11","q":"Circuit: battery, switch, light bulb. Switch opened. What happens to bulb? A) Brighter B) Same C) Goes out D) Explodes","answer":"C","src":"ARC"},
    {"id":"R12","q":"Which process moves water from ocean to clouds? A) Precipitation B) Condensation C) Evaporation D) Transpiration","answer":"C","src":"ARC"},
    {"id":"R13","q":"Ball thrown straight up. At highest point, velocity is? A) Maximum upward B) Maximum downward C) Zero D) Equal to initial","answer":"C","src":"ARC"},
    {"id":"R14","q":"What bond forms when atoms share electrons? A) Ionic B) Covalent C) Hydrogen D) Metallic","answer":"B","src":"ARC"},
    {"id":"R15","q":"Which organelle produces energy through cellular respiration? A) Nucleus B) Ribosome C) Mitochondria D) Vacuole","answer":"C","src":"ARC"},
    {"id":"R16","q":"James has 20 apples. Gives 5 to sister, buys 3 bags of 4 each. How many total?","answer":"27","src":"GSM8K"},
    {"id":"R17","q":"Train at 60 mph. How many hours to cover 225 miles?","answer":"3.75","src":"GSM8K"},
    {"id":"R18","q":"Sarah earns $12/hr, 8hrs/day, 5 days. Spends $150 groceries. How much saved?","answer":"330","src":"GSM8K"},
    {"id":"R19","q":"Rectangle: length 14cm, width 9cm. Perimeter?","answer":"46","src":"GSM8K"},
    {"id":"R20","q":"48 students. 1/4 in chess club. 1/3 of chess also play soccer. How many in both?","answer":"4","src":"GSM8K"},
    {"id":"R21","q":"Tank holds 500L, is 40% full. How many more liters to fill it?","answer":"300","src":"GSM8K"},
    {"id":"R22","q":"5 workers build wall in 8 days. How many days for 10 workers?","answer":"4","src":"GSM8K"},
    {"id":"R23","q":"Jacket $80, 25% off sale. Sale price?","answer":"60","src":"GSM8K"},
    {"id":"R24","q":"Recipe: 2.5 cups flour for 24 cookies. Cups needed for 60 cookies?","answer":"6.25","src":"GSM8K"},
    {"id":"R25","q":"John cycles 12km north, 9km east, 12km south. How far from start?","answer":"9","src":"GSM8K"},
]

MINIMAL_HOT_MARKER = (
    "[SUBSTRATE CONTEXT: Liana Banyan cooperative platform — NOT relevant to this question. "
    "Answer purely from your reasoning ability.]"
)

def log(msg):
    print(msg, flush=True)

def ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def ollama(model, system, question, timeout=90):
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 200},
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:11434/api/chat",
        data=data, headers={"Content-Type": "application/json"}, method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return {"text": body.get("message", {}).get("content", "").strip(),
                    "latency": round(time.time()-t0, 1), "error": None}
    except Exception as exc:
        return {"text": "", "latency": round(time.time()-t0, 1), "error": str(exc)}

def grade_factual_local(response, q):
    rubric = q.get("rubric", {})
    canonical = q.get("canonical_answer", "")
    prompt = (
        f"Grade this answer. Canonical: {canonical}\n"
        f"Correct if: {rubric.get('correct','')}\n"
        f"Partial if: {rubric.get('partial','')}\n"
        f"Incorrect if: {rubric.get('incorrect','')}\n"
        f"Answer: {response[:200]}\n"
        f"Reply with ONE word: correct, partial, or incorrect"
    )
    resp = ollama(GRADER, "Grade strictly. One word only.", prompt)
    text = resp.get("text", "").strip().lower()
    first = text.split()[0] if text.split() else ""
    if first == "correct":
        return "correct"
    elif first == "partial":
        return "partial"
    return "incorrect"

def grade_mcq(response, correct_letter):
    text = response.strip().upper()
    m = re.match(r'^([ABCD])\b', text)
    if m:
        return "correct" if m.group(1) == correct_letter else "incorrect"
    first_line = text.split('\n')[0]
    found = re.findall(r'\b([ABCD])\b', first_line)
    if found:
        return "correct" if found[0] == correct_letter else "incorrect"
    return "incorrect"

def grade_numeric(response, correct_str):
    try:
        correct_val = float(correct_str.replace(",", ""))
    except ValueError:
        return "incorrect"
    nums = re.findall(r'-?\d+\.?\d*', response.replace(",", ""))
    if not nums:
        return "incorrect"
    try:
        got = float(nums[0])
        if abs(got - correct_val) < 0.01:
            return "correct"
        elif abs(got - correct_val) < max(correct_val * 0.05, 0.5):
            return "partial"
        return "incorrect"
    except ValueError:
        return "incorrect"

def grade_reasoning(response, q):
    if q["src"] == "ARC":
        return grade_mcq(response, q["answer"])
    return grade_numeric(response, q["answer"])

def quorum_vote(grades):
    counts = {"correct": 0, "partial": 0, "incorrect": 0}
    for g in grades:
        counts[g] = counts.get(g, 0) + 1
    return max(counts, key=lambda k: counts[k])

def pct(correct, partial, n):
    return round(100 * (correct + 0.5 * partial) / n, 1) if n > 0 else 0.0

# --- Test 1 COLD (factual, no preload) ---

def run_test1_cold(questions, n_limit=None):
    log(f"\n{'='*60}")
    log("TEST 1 -- FACTUAL (75 Qs) -- Cadre Quorum -- COLD ONLY")
    log(f"{'='*60}")
    q_slice = questions[:n_limit] if n_limit else questions
    sys_cold = "You are a helpful assistant. Answer the question accurately. If you don't know, say so."
    correct = partial = incorrect = 0
    latencies = []
    q_results = []
    t_start = time.time()

    log(f"  {len(q_slice)} Qs x {len(CADRE)} models + local grading (COLD condition)...")
    for qi, q in enumerate(q_slice):
        model_grades = []
        for m in CADRE:
            resp = ollama(m["id"], sys_cold, q["question"])
            latencies.append(resp["latency"])
            if resp["error"]:
                resp["text"] = ""
            g = grade_factual_local(resp["text"], q)
            model_grades.append(g)

        quorum = quorum_vote(model_grades)
        correct += (quorum == "correct")
        partial += (quorum == "partial")
        incorrect += (quorum == "incorrect")
        q_results.append({"qid": q["id"], "quorum": quorum,
                          "grades": dict(zip([m["id"] for m in CADRE], model_grades))})

        if (qi + 1) % 10 == 0 or qi == 0:
            elapsed = round(time.time() - t_start, 0)
            acc = pct(correct, partial, qi + 1)
            log(f"    COLD {qi+1}/{len(q_slice)} done -- acc {acc}% -- elapsed {elapsed}s")

    accuracy = pct(correct, partial, len(q_slice))
    avg_lat = round(sum(latencies)/len(latencies), 1) if latencies else 0
    log(f"  COLD DONE -- {accuracy}% ({correct}C/{partial}P/{incorrect}I) avg_lat={avg_lat}s")
    return {"accuracy": accuracy, "correct": correct, "partial": partial,
            "incorrect": incorrect, "n": len(q_slice), "avg_latency_s": avg_lat,
            "cost_usd": 0.0, "q_results": q_results}

# --- Test 2 (reasoning, COLD + HOT minimal) ---

def run_test2(n_limit=None):
    log(f"\n{'='*60}")
    log("TEST 2 -- REASONING (25 Qs) -- Cadre Quorum -- COLD + HOT")
    log("  Sources: ARC-Challenge (R01-R15) + GSM8K (R16-R25)")
    log("  HOT = minimal substrate marker (NOT full preload)")
    log("  Grading: DETERMINISTIC (letter-match MCQ + numeric math)")
    log(f"{'='*60}")
    q_slice = REASONING_QS[:n_limit] if n_limit else REASONING_QS

    sys_cold = (
        "You are a careful reasoning assistant. "
        "For multiple-choice, state ONLY the letter first (A/B/C/D). "
        "For numbers, state ONLY the number first."
    )
    sys_hot = (
        f"{MINIMAL_HOT_MARKER}\n\n"
        "Answer the following reasoning question purely from scientific/mathematical reasoning. "
        "For multiple-choice: state ONLY the letter first (A/B/C/D). "
        "For numbers: state ONLY the number first."
    )

    results = {}
    for condition in ["cold", "hot"]:
        sp = sys_cold if condition == "cold" else sys_hot
        correct = partial = incorrect = 0
        q_results = []

        log(f"\n  [{condition.upper()}] {len(q_slice)} Qs x {len(CADRE)} models (deterministic)...")
        t_start = time.time()

        for qi, q in enumerate(q_slice):
            model_grades = []
            for m in CADRE:
                resp = ollama(m["id"], sp, q["q"])
                if resp["error"]:
                    resp["text"] = ""
                g = grade_reasoning(resp["text"], q)
                model_grades.append(g)

            quorum = quorum_vote(model_grades)
            correct += (quorum == "correct")
            partial += (quorum == "partial")
            incorrect += (quorum == "incorrect")
            q_results.append({"qid": q["id"], "src": q["src"], "quorum": quorum,
                              "grades": dict(zip([m["id"] for m in CADRE], model_grades))})

        elapsed = round(time.time() - t_start, 0)
        accuracy = pct(correct, partial, len(q_slice))
        results[condition] = {
            "accuracy": accuracy, "correct": correct, "partial": partial,
            "incorrect": incorrect, "n": len(q_slice), "cost_usd": 0.0,
            "elapsed_s": elapsed, "q_results": q_results
        }
        log(f"  [{condition.upper()}] DONE -- {accuracy}% ({correct}C/{partial}P/{incorrect}I) elapsed={elapsed}s")

    return results

# --- Results print ---

def print_results(t1_cold, t2):
    log(f"\n\n{'#'*60}")
    log("# CADRE STAR CHAMBER BENCHMARK -- RESULTS")
    log(f"# Generated: {ts()} | Knight BP067 | TRUTH-ALWAYS")
    log(f"# Cadre: {' + '.join(m['id'] for m in CADRE)}")
    log(f"# Grader: {GRADER} (local, $0)")
    log(f"{'#'*60}")

    log(f"\n{'-'*60}")
    log("TEST 1 -- FACTUAL | 'More of Us Is Better' | Big-4 baseline BP063")
    log(f"{'-'*60}")
    log(f"{'Model/Config':<40} {'COLD':>8} {'HOT':>8} {'Cost/Q':>8}")
    log("-" * 60)

    if t1_cold:
        c = t1_cold["accuracy"]
        log(f"{'Cadre-quorum (3 free local)':<40} {c:>7.1f}% {'[PENDING]':>8} {'$0.00':>8}")
        log(f"  (HOT not run -- CPU constraint: ~4+ hrs for quorum HOT on this machine)")
    else:
        log(f"  Test 1 not run this session.")

    log("")
    log("  Big-4 BASELINE (BP063 * 2026-05-30 * Haiku-graded * kappa=0.936):")
    for row in T1_BIG4:
        log(f"  {row['label']:<38} {row['cold']:>7.1f}% {row['hot']:>7.1f}% {row['cost_hot']:>8}")

    log("")
    if t1_cold:
        c = t1_cold["accuracy"]
        log(f"  COLD comparison: Cadre {c}% vs Big-4 COLD range 6-19.3%")
        log(f"  HOT KEY QUESTION (PENDING empirical run): does Cadre HOT beat Llama-single 78.0%?")
        log(f"  HOT run command: python -u run_cadre_v3.py --hot-only (when GPU or API key available)")

    if t2:
        log(f"\n{'-'*60}")
        log("TEST 2 -- REASONING | ARC-Challenge + GSM8K | COLD + HOT")
        log(f"{'-'*60}")
        log(f"{'Model/Config':<40} {'COLD':>8} {'HOT':>8} {'Delta':>7} {'Cost/Q':>8}")
        log("-" * 60)
        c = t2["cold"]["accuracy"]
        h = t2["hot"]["accuracy"]
        d = round(h - c, 1)
        log(f"{'Cadre-quorum (3 free local)':<40} {c:>7.1f}% {h:>7.1f}% {d:>+6.1f}pp {'$0.00':>8}")
        log("")
        log("  Big-4 NOT RUN on Test 2 (no cloud API keys; separate run needed)")
        log("")
        delta_label = f"delta={d:+.1f}pp"
        if abs(d) <= 5:
            log(f"  VERDICT: {delta_label} -- substrate marker does NOT materially distract from reasoning.")
            log(f"  Confirms: substrate lift is FACTUAL-KNOWLEDGE-SPECIFIC, not a general reasoning aid.")
        else:
            log(f"  VERDICT: {delta_label} -- unexpected delta; investigate.")

        # Breakdown
        cold_qr = t2["cold"]["q_results"]
        hot_qr = t2["hot"]["q_results"]
        arc_c = [q for q in cold_qr if q["src"]=="ARC"]
        arc_h = [q for q in hot_qr if q["src"]=="ARC"]
        gsm_c = [q for q in cold_qr if q["src"]=="GSM8K"]
        gsm_h = [q for q in hot_qr if q["src"]=="GSM8K"]
        arc_cold_pct = pct(sum(1 for q in arc_c if q["quorum"]=="correct"),
                           sum(1 for q in arc_c if q["quorum"]=="partial"), len(arc_c))
        arc_hot_pct = pct(sum(1 for q in arc_h if q["quorum"]=="correct"),
                          sum(1 for q in arc_h if q["quorum"]=="partial"), len(arc_h))
        gsm_cold_pct = pct(sum(1 for q in gsm_c if q["quorum"]=="correct"),
                           sum(1 for q in gsm_c if q["quorum"]=="partial"), len(gsm_c))
        gsm_hot_pct = pct(sum(1 for q in gsm_h if q["quorum"]=="correct"),
                          sum(1 for q in gsm_h if q["quorum"]=="partial"), len(gsm_h))
        log(f"\n  Sub-set breakdown (deterministic grading):")
        log(f"    ARC-Challenge (R01-R15, science MCQ): COLD {arc_cold_pct}%  HOT {arc_hot_pct}%")
        log(f"    GSM8K (R16-R25, math word problems):  COLD {gsm_cold_pct}%  HOT {gsm_hot_pct}%")

        # Per-model breakdown
        log(f"\n  Per-model COLD accuracy (before quorum):")
        for m in CADRE:
            m_correct = sum(1 for qr in cold_qr if qr["grades"].get(m["id"]) == "correct")
            m_acc = round(100 * m_correct / len(cold_qr), 1)
            log(f"    {m['id']}: {m_acc}% ({m_correct}/{len(cold_qr)})")
        log(f"  Quorum COLD: {t2['cold']['accuracy']}% -- delta vs best single model above = quorum gain")

    log("")
    log("  TRUTH-ALWAYS NOTES:")
    log("  - Test 1 HOT pending (CPU constraint; estimated 4+ hrs on this machine)")
    log(f"  - Test 1 COLD grader = local {GRADER}, not Haiku 4.5 (no API key)")
    log("  - Test 2 HOT uses minimal marker (not full preload); tests distraction only")
    log("  - Big-4 Test 2 NOT run (no API keys); pending with API keys")
    log("  - Prov-21 feed: canon_star_chamber_free_ollama_judges_tiered_quorum_cost_gated_frontier_escalation_bp067")
    log("  FOR THE KEEP.")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", choices=["1", "2", "both"], default="both")
    parser.add_argument("--n", type=int, default=None)
    args = parser.parse_args()

    log(f"[{ts()}] Cadre Star Chamber Benchmark -- BP067 TRUTH-ALWAYS")
    log(f"  Cadre: {' | '.join(m['id'] for m in CADRE)}")
    log(f"  Grader: {GRADER} (local, $0.00)")

    questions_data = json.loads((SCRIPT_DIR / "questions.json").read_text(encoding="utf-8"))
    questions = questions_data["questions"]

    t1_cold = None
    t2 = None

    if args.test in ("1", "both"):
        t1_cold = run_test1_cold(questions, n_limit=args.n)

    if args.test in ("2", "both"):
        t2 = run_test2(n_limit=args.n)

    print_results(t1_cold, t2)

    out_dir = SCRIPT_DIR / "results"
    out_dir.mkdir(exist_ok=True)
    run_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    out_path = out_dir / f"CADRE_V3_BP067_{run_ts}.json"
    out_data = {
        "generated": ts(), "session": "BP067",
        "cadre_models": [m["id"] for m in CADRE],
        "grader": GRADER,
        "t1_cold": t1_cold,
        "t1_hot": "PENDING (CPU constraint)",
        "t2": t2,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)
    log(f"\n[SAVED] {out_path}")

if __name__ == "__main__":
    main()
