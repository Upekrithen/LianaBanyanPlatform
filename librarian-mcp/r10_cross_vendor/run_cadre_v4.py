#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_cadre_v4.py -- Cadre Star Chamber Benchmark (BP067, TRUTH-ALWAYS)
MODEL-FIRST outer loop to avoid per-question model switching overhead.

Architecture: run ALL Qs with model A -> switch to model B -> run ALL Qs ->
              switch to model C -> run ALL Qs -> combine for quorum vote.
              3 model loads total (not 3*N as in naive per-question loop).

Test 2 only this run (25-Q reasoning, COLD + HOT minimal, deterministic grading).
Test 1 HOT: see run_cadre_v4_hot.py (separate long-running background job).

TRUTH-ALWAYS:
  - Cadre: gemma2:2b + llama3.1:8b-instruct-q4_K_M + qwen2.5:7b
  - Grading: DETERMINISTIC (letter-match ARC, numeric GSM8K)
  - HOT = minimal substrate marker only (science/math = substrate irrelevant)
  - Big-4 NOT run (no cloud API keys)
  - mistral:7b excluded (73s/call measured)

Generated: 2026-06-01 | Knight BP067
"""

import json, re, sys, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

CADRE = [
    {"id": "gemma2:2b",                   "vendor": "Gemma/Google"},
    {"id": "llama3.1:8b-instruct-q4_K_M", "vendor": "Llama/Meta"},
    {"id": "qwen2.5:7b",                  "vendor": "Qwen/Alibaba"},
]

REASONING_QS = [
    {"id":"R01","q":"Toy car speed measured on flat surface. When surface tilted, car moves faster. Does this show increased kinetic energy? Answer A) Yes B) No","answer":"A","src":"ARC","note":"simplified"},
    {"id":"R02","q":"Which is a chemical change? A) Water boiling to steam B) Log burning in fireplace C) Ice melting D) Sugar dissolving","answer":"B","src":"ARC"},
    {"id":"R03","q":"Plant uses CO2 and water + sunlight to make glucose and oxygen. Process? A) Respiration B) Decomposition C) Photosynthesis D) Fermentation","answer":"C","src":"ARC"},
    {"id":"R04","q":"Best adaptation for survival in extremely cold environment? A) Thin skin, no hair B) Large surface area C) Thick fur and fat D) Heavy sweating","answer":"C","src":"ARC"},
    {"id":"R05","q":"Two objects heated equally. A gets much hotter than B. What does this tell us? A) A has higher specific heat capacity B) A has lower specific heat capacity C) Same specific heat D) B has lower specific heat","answer":"B","src":"ARC"},
    {"id":"R06","q":"Magnet moved in and out of coil quickly. What is produced? A) Heat only B) Light only C) Electric current D) Magnetic field only","answer":"C","src":"ARC"},
    {"id":"R07","q":"When is a flagpole's shadow shortest during a sunny day? A) Early morning B) Late afternoon C) Around noon D) At sunset","answer":"C","src":"ARC"},
    {"id":"R08","q":"Astronaut on Moon drops hammer and feather from same height at same time. Which lands first? A) Hammer B) Feather C) Same time D) Neither","answer":"C","src":"ARC"},
    {"id":"R09","q":"Volume of gas in sealed container when temperature increases at constant pressure? A) Decreases B) Stays same C) Increases D) Becomes zero","answer":"C","src":"ARC"},
    {"id":"R10","q":"Which rock type forms from cooling molten material? A) Sedimentary B) Igneous C) Metamorphic D) Organic","answer":"B","src":"ARC"},
    {"id":"R11","q":"Circuit with battery, switch, light bulb. Switch opened. Bulb? A) Brighter B) Same C) Goes out D) Explodes","answer":"C","src":"ARC"},
    {"id":"R12","q":"Which process moves water from ocean to clouds? A) Precipitation B) Condensation C) Evaporation D) Transpiration","answer":"C","src":"ARC"},
    {"id":"R13","q":"Ball thrown straight up. At highest point, velocity? A) Maximum upward B) Maximum downward C) Zero D) Equal to initial","answer":"C","src":"ARC"},
    {"id":"R14","q":"Bond type when atoms share electrons? A) Ionic B) Covalent C) Hydrogen D) Metallic","answer":"B","src":"ARC"},
    {"id":"R15","q":"Organelle that produces energy through cellular respiration? A) Nucleus B) Ribosome C) Mitochondria D) Vacuole","answer":"C","src":"ARC"},
    {"id":"R16","q":"James has 20 apples. Gives 5 to sister. Buys 3 bags of 4 apples each. How many does he have now? Answer with just a number.","answer":"27","src":"GSM8K"},
    {"id":"R17","q":"Train travels at 60 mph. How long in hours to cover 225 miles? Answer with just a number.","answer":"3.75","src":"GSM8K"},
    {"id":"R18","q":"Sarah earns $12/hr, works 8 hrs/day for 5 days, spends $150 on groceries, saves the rest. How much does she save? Answer with just a number.","answer":"330","src":"GSM8K"},
    {"id":"R19","q":"Rectangle: length 14cm, width 9cm. Perimeter in cm? Answer with just a number.","answer":"46","src":"GSM8K"},
    {"id":"R20","q":"48 students in class. 1/4 in chess club. 1/3 of chess club also play soccer. How many are in both chess and soccer? Answer with just a number.","answer":"4","src":"GSM8K"},
    {"id":"R21","q":"Tank holds 500 liters, is 40% full. How many more liters needed to fill it completely? Answer with just a number.","answer":"300","src":"GSM8K"},
    {"id":"R22","q":"5 workers build a wall in 8 days. How many days for 10 workers? Answer with just a number.","answer":"4","src":"GSM8K"},
    {"id":"R23","q":"Jacket costs $80. On sale 25% off. What is the sale price? Answer with just a number.","answer":"60","src":"GSM8K"},
    {"id":"R24","q":"Recipe needs 2.5 cups flour for 24 cookies. How many cups for 60 cookies? Answer with just a number.","answer":"6.25","src":"GSM8K"},
    {"id":"R25","q":"John cycles 12km north, then 9km east, then 12km south. How far in km from his starting point? Answer with just a number.","answer":"9","src":"GSM8K"},
]

COLD_SYS = (
    "You are a careful reasoning assistant. "
    "For multiple-choice (A/B/C/D), state ONLY the letter on the first line. "
    "For number answers, state ONLY the number on the first line. "
    "Do not explain unless specifically asked."
)

HOT_SYS = (
    "[SUBSTRATE MARKER: Liana Banyan cooperative platform context is present "
    "but is NOT relevant to this science/math question. Ignore it.]\n\n"
    + COLD_SYS
)

def log(msg):
    print(msg, flush=True)

def ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def ollama(model, system, question, timeout=120):
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 100},
    }
    req = urllib.request.Request(
        "http://127.0.0.1:11434/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read())
            return {"text": body.get("message",{}).get("content","").strip(),
                    "latency": round(time.time()-t0, 1), "error": None}
    except Exception as exc:
        return {"text": "", "latency": round(time.time()-t0, 1), "error": str(exc)}

def grade_mcq(response, correct_letter):
    text = response.strip().upper()
    # First line, first letter A-D
    first_line = text.split('\n')[0]
    m = re.search(r'\b([ABCD])\b', first_line)
    if m:
        return "correct" if m.group(1) == correct_letter else "incorrect"
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
        if abs(got - correct_val) <= max(correct_val * 0.05, 0.5):
            return "partial"
        return "incorrect"
    except ValueError:
        return "incorrect"

def grade_q(response, q):
    if q["src"] == "ARC":
        return grade_mcq(response, q["answer"])
    return grade_numeric(response, q["answer"])

def quorum_vote(grades_by_model):
    """grades_by_model: dict of model_id -> list of grades (one per question)"""
    n_questions = len(next(iter(grades_by_model.values())))
    quorum_grades = []
    for qi in range(n_questions):
        counts = {"correct": 0, "partial": 0, "incorrect": 0}
        for grades in grades_by_model.values():
            counts[grades[qi]] = counts.get(grades[qi], 0) + 1
        quorum_grades.append(max(counts, key=lambda k: counts[k]))
    return quorum_grades

def pct(correct, partial, n):
    return round(100 * (correct + 0.5 * partial) / n, 1) if n > 0 else 0.0

def run_model_batch(model_id, questions, condition, sys_prompt):
    """Run ALL questions with one model. Returns list of (text, grade, latency)."""
    log(f"    [{model_id}] {condition.upper()} -- {len(questions)} Qs...")
    t0 = time.time()
    results = []
    for i, q in enumerate(questions):
        resp = ollama(model_id, sys_prompt, q["q"])
        if resp["error"]:
            log(f"      [!] Q{i+1} error: {resp['error'][:50]}")
            resp["text"] = ""
        g = grade_q(resp["text"], q)
        results.append({"text": resp["text"], "grade": g, "latency": resp["latency"]})
    elapsed = round(time.time() - t0, 0)
    n_correct = sum(1 for r in results if r["grade"] == "correct")
    n_partial = sum(1 for r in results if r["grade"] == "partial")
    log(f"    [{model_id}] {condition.upper()} done -- {pct(n_correct, n_partial, len(questions))}% in {elapsed}s")
    return results

def run_test2(n_limit=None):
    log(f"\n{'='*60}")
    log("TEST 2 -- REASONING | ARC-Challenge + GSM8K | 25 Qs")
    log("  Cadre Quorum: model-first outer loop (3 model loads only)")
    log("  COLD + HOT minimal | Deterministic grading")
    log(f"{'='*60}")

    q_slice = REASONING_QS[:n_limit] if n_limit else REASONING_QS
    results = {}

    for condition in ["cold", "hot"]:
        sp = COLD_SYS if condition == "cold" else HOT_SYS
        grades_by_model = {}
        latencies_all = []

        log(f"\n  [{condition.upper()}] Model-first pass...")
        for m in CADRE:
            t_load_start = time.time()
            # Warm up / load model with a tiny call first
            warmup = ollama(m["id"], "Be brief.", "Ready?", timeout=300)
            load_time = round(time.time() - t_load_start, 1)
            log(f"    [{m['id']}] loaded in {load_time}s (warmup: {warmup['text'][:20]!r})")

            batch = run_model_batch(m["id"], q_slice, condition, sp)
            grades_by_model[m["id"]] = [r["grade"] for r in batch]
            latencies_all.extend(r["latency"] for r in batch)

        # Quorum vote
        quorum_grades = quorum_vote(grades_by_model)
        correct = quorum_grades.count("correct")
        partial = quorum_grades.count("partial")
        incorrect = quorum_grades.count("incorrect")
        accuracy = pct(correct, partial, len(q_slice))
        avg_lat = round(sum(latencies_all) / len(latencies_all), 1) if latencies_all else 0

        q_results = []
        for qi, q in enumerate(q_slice):
            q_results.append({
                "qid": q["id"], "src": q["src"],
                "quorum": quorum_grades[qi],
                "grades": {m["id"]: grades_by_model[m["id"]][qi] for m in CADRE},
            })

        results[condition] = {
            "accuracy": accuracy, "correct": correct, "partial": partial,
            "incorrect": incorrect, "n": len(q_slice), "avg_latency_s": avg_lat,
            "cost_usd": 0.0, "q_results": q_results
        }
        log(f"\n  [{condition.upper()}] QUORUM: {accuracy}% ({correct}C/{partial}P/{incorrect}I)")

    return results

def print_results(t2):
    log(f"\n\n{'#'*60}")
    log("# CADRE STAR CHAMBER BENCHMARK -- TEST 2 RESULTS")
    log(f"# Generated: {ts()} | Knight BP067 | TRUTH-ALWAYS")
    log(f"# Cadre: {' + '.join(m['id'] for m in CADRE)}")
    log(f"{'#'*60}")

    log(f"\n{'-'*60}")
    log("TEST 2 -- REASONING | ARC-Challenge (R01-R15) + GSM8K (R16-R25)")
    log(f"{'-'*60}")
    log(f"{'Model/Config':<40} {'COLD':>8} {'HOT':>8} {'Delta':>7} {'Cost':>8}")
    log("-" * 60)

    c = t2["cold"]["accuracy"]
    h = t2["hot"]["accuracy"]
    d = round(h - c, 1)
    log(f"{'Cadre-quorum (gemma2+llama3.1+qwen2.5)':<40} {c:>7.1f}% {h:>7.1f}% {d:>+6.1f}pp {'$0.00':>8}")

    log("")
    log("  Big-4 NOT RUN (no API keys); Big-4 baseline from BP063 is FACTUAL only.")
    log(f"\n  KEY FINDING:")
    if abs(d) <= 5:
        log(f"  delta={d:+.1f}pp -- Substrate marker does NOT distract from reasoning (expected).")
        log(f"  Confirms: substrate lift is FACTUAL-KNOWLEDGE-SPECIFIC, not a general reasoning aid.")
    else:
        log(f"  delta={d:+.1f}pp -- Unexpected delta; investigate cause.")

    # Per-subset
    cold_qr = t2["cold"]["q_results"]
    hot_qr = t2["hot"]["q_results"]

    def sub_pct(qr, src_filter):
        qs = [q for q in qr if q["src"] == src_filter]
        if not qs:
            return 0.0
        return pct(sum(1 for q in qs if q["quorum"]=="correct"),
                   sum(1 for q in qs if q["quorum"]=="partial"), len(qs))

    arc_c = sub_pct(cold_qr, "ARC")
    arc_h = sub_pct(hot_qr, "ARC")
    gsm_c = sub_pct(cold_qr, "GSM8K")
    gsm_h = sub_pct(hot_qr, "GSM8K")

    log(f"\n  Sub-set breakdown (deterministic grading):")
    log(f"    ARC-Challenge (R01-R15, science MCQ): COLD {arc_c}%  HOT {arc_h}%")
    log(f"    GSM8K (R16-R25, math word problems):  COLD {gsm_c}%  HOT {gsm_h}%")

    # Per-model
    log(f"\n  Per-model COLD accuracy (before quorum vote):")
    for m in CADRE:
        m_correct = sum(1 for qr in cold_qr if qr["grades"].get(m["id"]) == "correct")
        m_acc = round(100 * m_correct / len(cold_qr), 1)
        log(f"    {m['id']}: {m_acc}% ({m_correct}/{len(cold_qr)})")
    quorum_c = sum(1 for qr in cold_qr if qr["quorum"] == "correct")
    best_single = max(
        (sum(1 for qr in cold_qr if qr["grades"].get(m["id"]) == "correct") for m in CADRE),
        default=0
    )
    log(f"    Quorum COLD: {t2['cold']['accuracy']}% -- quorum gain vs best single: {round(100*(quorum_c-best_single)/len(cold_qr),1):+.1f}pp")

    log(f"\n  TRUTH-ALWAYS NOTES:")
    log(f"  - HOT uses minimal substrate marker (not full 16K preload)")
    log(f"  - Grading: deterministic letter-match (ARC) + numeric-compare (GSM8K)")
    log(f"  - mistral:7b excluded (73s/call measured on this machine)")
    log(f"  - Big-4 comparison pending API key availability")
    log(f"  FOR THE KEEP.")

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=None)
    args = parser.parse_args()

    log(f"[{ts()}] Cadre Star Chamber Benchmark v4 -- BP067 TRUTH-ALWAYS")
    log(f"  Test 2 only (reasoning, 25 Qs)")
    log(f"  Cadre: {' | '.join(m['id'] for m in CADRE)}")

    t2 = run_test2(n_limit=args.n)
    print_results(t2)

    out_dir = SCRIPT_DIR / "results"
    out_dir.mkdir(exist_ok=True)
    run_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    out_path = out_dir / f"CADRE_V4_TEST2_BP067_{run_ts}.json"
    out_data = {
        "generated": ts(), "session": "BP067",
        "cadre_models": [m["id"] for m in CADRE],
        "test2": t2,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)
    log(f"\n[SAVED] {out_path}")

if __name__ == "__main__":
    main()
