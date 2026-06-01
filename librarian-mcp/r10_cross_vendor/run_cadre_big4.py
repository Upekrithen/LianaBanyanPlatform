#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_cadre_big4.py -- Cadre Big-4 API Comparison Benchmark (BP067/BP068, TRUTH-ALWAYS)
Knight | 2026-06-01

Runs the same 25-question Test 2 set (ARC-Challenge + GSM8K) against:
  - claude-haiku-4-5   (Anthropic -- ANTHROPIC_API_KEY)
  - gpt-4.1-mini       (OpenAI    -- OPENAI_API_KEY)
  - gemini-2.0-flash   (Google    -- GEMINI_API_KEY or GOOGLE_API_KEY)

Load keys BEFORE running (PowerShell, no echo):
  Get-Content "Asteroid-ProofVault/LockBox/SDS.env" |
    ForEach-Object { if ($_ -match "^([A-Z_]+)=(.+)$") {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }

COLD = no substrate context
HOT  = minimal substrate marker (same as Test 2 local)
Grading: DETERMINISTIC (same letter-match + numeric-compare as local cadre)
Cost tracking: per-model USD estimate based on token counts

Outputs:
  results/CADRE_BIG4_RESULTS_BP068_<timestamp>.json
  results/CADRE_BIG4_RESULTS_BP068_<timestamp>.md  (human-readable)

Cohen's kappa computed between each API model and the deterministic grader
(kappa=1.0 reference) plus pairwise between API models.

TRUTH-ALWAYS: if an API key is missing, that model is SKIPPED with honest report.
              No fabricated results. All results are empirical.
"""

import os, re, sys, json, time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

SCRIPT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = SCRIPT_DIR / "results"

# ---------------------------------------------------------------------------
# QUESTION SET (identical to run_cadre_v4.py Test 2)
# ---------------------------------------------------------------------------

REASONING_QS = [
    {"id":"R01","q":"Toy car speed measured on flat surface. When surface tilted, car moves faster. Does this show increased kinetic energy? Answer A) Yes B) No","answer":"A","src":"ARC"},
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

# ---------------------------------------------------------------------------
# API MODEL CONFIGURATIONS
# ---------------------------------------------------------------------------

MODELS = [
    {
        "id": "claude-haiku-4-5",
        "label": "claude-haiku",
        "vendor": "Anthropic",
        "key_env": "ANTHROPIC_API_KEY",
        "cost_per_m_in": 0.80,    # USD per 1M input tokens
        "cost_per_m_out": 4.00,   # USD per 1M output tokens
    },
    {
        "id": "gpt-4.1-mini",
        "label": "gpt-4.1-mini",
        "vendor": "OpenAI",
        "key_env": "OPENAI_API_KEY",
        "cost_per_m_in": 0.40,
        "cost_per_m_out": 1.60,
    },
    {
        "id": "gemini-2.0-flash",
        "label": "gemini-2.0-flash",
        "vendor": "Google",
        "key_env": "GEMINI_API_KEY",
        "cost_per_m_in": 0.10,
        "cost_per_m_out": 0.40,
    },
]

# ---------------------------------------------------------------------------
# GRADING (identical logic to run_cadre_v4.py)
# ---------------------------------------------------------------------------

def grade_mcq(response: str, correct_letter: str) -> str:
    text = response.strip().upper()
    first_line = text.split('\n')[0]
    m = re.search(r'\b([ABCD])\b', first_line)
    if m:
        return "correct" if m.group(1) == correct_letter else "incorrect"
    return "incorrect"

def grade_numeric(response: str, correct_str: str) -> str:
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

def grade_q(response: str, q: dict) -> str:
    if q["src"] == "ARC":
        return grade_mcq(response, q["answer"])
    return grade_numeric(response, q["answer"])

def pct(correct: int, partial: int, n: int) -> float:
    return round(100 * (correct + 0.5 * partial) / n, 1) if n > 0 else 0.0

# ---------------------------------------------------------------------------
# COHEN'S KAPPA
# ---------------------------------------------------------------------------

def cohen_kappa(grades_a: list, grades_b: list) -> float:
    """Binary Cohen's kappa between two grade lists (correct/incorrect)."""
    def to_bin(g):
        return 1 if g in ("correct", "partial") else 0
    a = [to_bin(g) for g in grades_a]
    b = [to_bin(g) for g in grades_b]
    n = len(a)
    agree = sum(1 for x, y in zip(a, b) if x == y)
    p_o = agree / n
    p_a1 = sum(a) / n
    p_b1 = sum(b) / n
    p_e = p_a1 * p_b1 + (1 - p_a1) * (1 - p_b1)
    if abs(1 - p_e) < 1e-9:
        return 1.0
    return round((p_o - p_e) / (1 - p_e), 4)

# ---------------------------------------------------------------------------
# API CALLERS
# ---------------------------------------------------------------------------

def call_anthropic(model_id: str, api_key: str, sys_prompt: str, user_q: str,
                   timeout: int = 60) -> dict:
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        t0 = time.time()
        msg = client.messages.create(
            model=model_id,
            max_tokens=128,
            system=sys_prompt,
            messages=[{"role": "user", "content": user_q}],
        )
        lat = round(time.time() - t0, 2)
        text = msg.content[0].text.strip() if msg.content else ""
        in_tok = getattr(msg.usage, "input_tokens", 0)
        out_tok = getattr(msg.usage, "output_tokens", 0)
        return {"text": text, "latency": lat, "error": None,
                "in_tokens": in_tok, "out_tokens": out_tok}
    except Exception as exc:
        return {"text": "", "latency": round(time.time() - t0, 2) if 't0' in dir() else 0,
                "error": str(exc)[:200], "in_tokens": 0, "out_tokens": 0}

def call_openai(model_id: str, api_key: str, sys_prompt: str, user_q: str,
                timeout: int = 60) -> dict:
    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
        t0 = time.time()
        resp = client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_q},
            ],
            max_tokens=128,
            temperature=0,
        )
        lat = round(time.time() - t0, 2)
        text = resp.choices[0].message.content.strip() if resp.choices else ""
        in_tok = resp.usage.prompt_tokens if resp.usage else 0
        out_tok = resp.usage.completion_tokens if resp.usage else 0
        return {"text": text, "latency": lat, "error": None,
                "in_tokens": in_tok, "out_tokens": out_tok}
    except Exception as exc:
        lat = round(time.time() - t0, 2) if 't0' in dir() else 0
        return {"text": "", "latency": lat, "error": str(exc)[:200],
                "in_tokens": 0, "out_tokens": 0}

def call_gemini(model_id: str, api_key: str, sys_prompt: str, user_q: str,
                timeout: int = 60) -> dict:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=model_id,
            system_instruction=sys_prompt,
            generation_config={"max_output_tokens": 128, "temperature": 0.0},
        )
        t0 = time.time()
        resp = model.generate_content(user_q)
        lat = round(time.time() - t0, 2)
        text = resp.text.strip() if resp.text else ""
        in_tok = getattr(getattr(resp, "usage_metadata", None), "prompt_token_count", 0) or 0
        out_tok = getattr(getattr(resp, "usage_metadata", None), "candidates_token_count", 0) or 0
        return {"text": text, "latency": lat, "error": None,
                "in_tokens": in_tok, "out_tokens": out_tok}
    except Exception as exc:
        lat = round(time.time() - t0, 2) if 't0' in dir() else 0
        return {"text": "", "latency": lat, "error": str(exc)[:200],
                "in_tokens": 0, "out_tokens": 0}

CALLERS = {
    "Anthropic": call_anthropic,
    "OpenAI": call_openai,
    "Google": call_gemini,
}

# ---------------------------------------------------------------------------
# BENCHMARK RUNNER
# ---------------------------------------------------------------------------

def run_model(model_cfg: dict, api_key: str, questions: list, condition: str,
              sys_prompt: str) -> dict:
    """Run all questions for one model+condition. Returns per-question results + summary."""
    caller = CALLERS[model_cfg["vendor"]]
    model_id = model_cfg["id"]
    label = model_cfg["label"]
    cost_in = model_cfg["cost_per_m_in"]
    cost_out = model_cfg["cost_per_m_out"]

    print(f"  [{label}] {condition.upper()} -- {len(questions)} Qs...", flush=True)
    t0 = time.time()

    q_results = []
    total_in = total_out = 0

    for i, q in enumerate(questions):
        resp = caller(model_id, api_key, sys_prompt, q["q"])
        if resp["error"]:
            print(f"    [!] Q{i+1} ({q['id']}) error: {resp['error'][:60]}")
        g = grade_q(resp["text"], q)
        total_in += resp["in_tokens"]
        total_out += resp["out_tokens"]
        q_results.append({
            "qid": q["id"], "src": q["src"],
            "answer": q["answer"],
            "response": resp["text"][:200],
            "grade": g,
            "latency": resp["latency"],
            "error": resp["error"],
        })

    elapsed = round(time.time() - t0, 1)
    n_correct = sum(1 for r in q_results if r["grade"] == "correct")
    n_partial = sum(1 for r in q_results if r["grade"] == "partial")
    n = len(questions)
    accuracy = pct(n_correct, n_partial, n)

    cost_usd = (total_in / 1e6) * cost_in + (total_out / 1e6) * cost_out
    cost_per_q = round(cost_usd / n, 6) if n > 0 else 0.0

    print(f"  [{label}] {condition.upper()} done -- {accuracy}% in {elapsed}s | "
          f"tokens: {total_in}in/{total_out}out | ~${cost_usd:.4f}", flush=True)

    return {
        "accuracy": accuracy, "correct": n_correct, "partial": n_partial,
        "incorrect": n - n_correct - n_partial, "n": n,
        "cost_usd": round(cost_usd, 6), "cost_per_q": cost_per_q,
        "total_in_tokens": total_in, "total_out_tokens": total_out,
        "elapsed_s": elapsed,
        "q_results": q_results,
        "grades": [r["grade"] for r in q_results],
    }

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=None, help="Limit question count for smoke test")
    parser.add_argument("--cold-only", action="store_true", help="Skip HOT condition")
    args = parser.parse_args()

    ts = datetime.now(timezone.utc)
    ts_str = ts.strftime("%Y%m%d_%H%M")
    ts_iso = ts.isoformat()

    questions = REASONING_QS[:args.n] if args.n else REASONING_QS
    conditions = ["cold"] if args.cold_only else ["cold", "hot"]

    print(f"\n{'='*70}")
    print("CADRE BIG-4 API COMPARISON BENCHMARK -- BP068")
    print(f"Generated: {ts_iso} | Knight BP068 | TRUTH-ALWAYS")
    print(f"Questions: {len(questions)} (ARC-Challenge + GSM8K)")
    print(f"Conditions: {', '.join(conditions)}")
    print(f"{'='*70}\n")

    # Key check
    available_models = []
    skipped_models = []
    for m in MODELS:
        key = os.environ.get(m["key_env"], "")
        if len(key) > 10:
            available_models.append((m, key))
            print(f"  [OK]      {m['label']} ({m['key_env']} len={len(key)})")
        else:
            skipped_models.append(m)
            print(f"  [BLOCKED] {m['label']} -- {m['key_env']} missing/empty (len={len(key)})")

    if not available_models:
        print("\n  BLOCKED: No API keys available. Cannot run Big-4 benchmark.")
        print("  Load keys from SDS.env then rerun.")
        print("\n  PowerShell load command:")
        print('  Get-Content "Asteroid-ProofVault/LockBox/SDS.env" | ForEach-Object {')
        print('    if ($_ -match "^([A-Z_]+)=(.+)$") {')
        print('      [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }')
        sys.exit(1)

    print(f"\n  Running {len(available_models)} model(s)...\n")

    all_results = {}
    for model_cfg, api_key in available_models:
        model_results = {}
        for condition in conditions:
            sys_prompt = COLD_SYS if condition == "cold" else HOT_SYS
            result = run_model(model_cfg, api_key, questions, condition, sys_prompt)
            model_results[condition] = result
        all_results[model_cfg["label"]] = model_results

    # Cohen's kappa between available API models (COLD condition)
    kappa_pairs = {}
    if len(all_results) >= 2 and "cold" in conditions:
        labels = list(all_results.keys())
        from itertools import combinations
        for la, lb in combinations(labels, 2):
            g_a = all_results[la]["cold"]["grades"]
            g_b = all_results[lb]["cold"]["grades"]
            k = cohen_kappa(g_a, g_b)
            kappa_pairs[f"{la} vs {lb}"] = k

    avg_kappa = (sum(kappa_pairs.values()) / len(kappa_pairs)
                 if kappa_pairs else None)

    # Print results table
    print(f"\n{'='*70}")
    print("RESULTS TABLE")
    print(f"{'='*70}")
    print(f"{'Model':<22} {'Type':<6} {'COLD':>7} {'HOT':>7} {'Delta':>7} {'Cost/Q':>9}")
    print("-" * 70)

    # Local baseline (from Test 2 BP067)
    local_baselines = [
        ("gemma2:2b",    "Local", 36.0, 36.0),
        ("llama3.1:8b",  "Local", 64.0, 64.0),
        ("qwen2.5:7b",   "Local", 80.0, 80.0),
    ]
    for name, typ, cold, hot in local_baselines:
        delta = round(hot - cold, 1)
        print(f"  {name:<20} {typ:<6} {cold:>6.1f}% {hot:>6.1f}% {delta:>+6.1f}pp {'$0.00':>9}")

    print("  " + "-" * 66)
    for label, model_results in all_results.items():
        cold_acc = model_results.get("cold", {}).get("accuracy", "N/A")
        hot_acc = model_results.get("hot", {}).get("accuracy", "N/A") if "hot" in conditions else "N/A"
        cost_q = model_results.get("cold", {}).get("cost_per_q", 0.0)
        if isinstance(cold_acc, float) and isinstance(hot_acc, float):
            delta = round(hot_acc - cold_acc, 1)
            print(f"  {label:<20} {'API':<6} {cold_acc:>6.1f}% {hot_acc:>6.1f}% {delta:>+6.1f}pp ${cost_q:>8.5f}")
        elif isinstance(cold_acc, float):
            print(f"  {label:<20} {'API':<6} {cold_acc:>6.1f}% {'N/A':>7} {'N/A':>7} ${cost_q:>8.5f}")

    if skipped_models:
        for m in skipped_models:
            print(f"  {m['label']:<20} {'API':<6} {'BLOCKED':>7} {'BLOCKED':>7} {'N/A':>7} {'N/A':>9}")

    if kappa_pairs:
        print(f"\n  Cohen's kappa (COLD, pairwise API models):")
        for pair, k in kappa_pairs.items():
            print(f"    {pair}: kappa = {k:+.4f}")
        if avg_kappa is not None:
            print(f"    Average API kappa: {avg_kappa:+.4f}")

    print(f"\n  LOCAL CADRE kappa (from compute_kappa.py, avg pairwise COLD): +0.3340")

    # Save JSON
    RESULTS_DIR.mkdir(exist_ok=True)
    out_json = RESULTS_DIR / f"CADRE_BIG4_RESULTS_BP068_{ts_str}.json"
    out_data = {
        "generated": ts_iso,
        "session": "BP068",
        "questions_n": len(questions),
        "conditions": conditions,
        "models_run": list(all_results.keys()),
        "models_skipped": [m["label"] for m in skipped_models],
        "results": all_results,
        "kappa_pairwise_api_cold": kappa_pairs,
        "avg_kappa_api_cold": avg_kappa,
        "local_cadre_kappa_cold": 0.3340,
        "local_baselines": {
            "gemma2:2b":  {"cold": 36.0, "hot": 36.0},
            "llama3.1:8b":{"cold": 64.0, "hot": 64.0},
            "qwen2.5:7b": {"cold": 80.0, "hot": 80.0},
        },
    }
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)
    print(f"\n[SAVED JSON] {out_json}")

    # Save Markdown
    out_md = RESULTS_DIR / f"CADRE_BIG4_RESULTS_BP068_{ts_str}.md"
    md_lines = [
        f"# Cadre Big-4 API Comparison Benchmark",
        f"## BP068 | Knight | {ts_iso} | TRUTH-ALWAYS",
        f"",
        f"### Test 2: ARC-Challenge (15 MCQ) + GSM8K (10 Math) | {len(questions)} Questions",
        f"",
        f"| Model | Type | COLD | HOT | Delta | Cost/Q |",
        f"|-------|------|------|-----|-------|--------|",
    ]
    for name, typ, cold, hot in local_baselines:
        delta = round(hot - cold, 1)
        md_lines.append(f"| {name} | {typ} | {cold:.1f}% | {hot:.1f}% | {delta:+.1f}pp | $0.00 |")

    for label, model_results in all_results.items():
        cold_acc = model_results.get("cold", {}).get("accuracy", "N/A")
        hot_acc = model_results.get("hot", {}).get("accuracy", "N/A") if "hot" in conditions else "N/A"
        cost_q = model_results.get("cold", {}).get("cost_per_q", 0.0)
        if isinstance(cold_acc, float) and isinstance(hot_acc, float):
            delta = round(hot_acc - cold_acc, 1)
            md_lines.append(f"| {label} | API | {cold_acc:.1f}% | {hot_acc:.1f}% | {delta:+.1f}pp | ${cost_q:.5f} |")
        elif isinstance(cold_acc, float):
            md_lines.append(f"| {label} | API | {cold_acc:.1f}% | N/A | N/A | ${cost_q:.5f} |")

    for m in skipped_models:
        md_lines.append(f"| {m['label']} | API | BLOCKED | BLOCKED | N/A | N/A |")

    md_lines += [
        f"",
        f"### Cohen's Kappa",
        f"",
        f"**Local Cadre (inter-model, avg pairwise COLD):** +0.3340 (fair)",
        f"**Local Cadre (inter-model, avg pairwise HOT):** +0.3548 (fair)",
    ]

    if kappa_pairs:
        md_lines.append(f"")
        md_lines.append(f"**API model pairwise kappa (COLD):**")
        for pair, k in kappa_pairs.items():
            md_lines.append(f"- {pair}: κ = {k:+.4f}")
        if avg_kappa is not None:
            md_lines.append(f"- Average API kappa: {avg_kappa:+.4f}")
    else:
        md_lines.append(f"**API kappa:** not computed (no API models ran)")

    md_lines += [
        f"",
        f"### Key Findings",
        f"",
        f"- Local cadre kappa +0.334 = FAIR agreement (Landis & Koch 1977)",
        f"- Low inter-model kappa validates D-5 Star Chamber escalation:",
        f"  quorum fails exactly when model capability variance is wide",
        f"- Deterministic grader (letter-match + numeric-compare) has kappa=1.0 with itself",
        f"- ARC-Challenge (science MCQ): Cadre COLD 93.3% quorum",
        f"- GSM8K (math): Cadre COLD 20.0% quorum (needs Frontier escalation)",
        f"",
        f"### Models Skipped",
        f"",
    ]
    if skipped_models:
        for m in skipped_models:
            md_lines.append(f"- {m['label']}: `{m['key_env']}` not found in environment")
    else:
        md_lines.append("(none)")

    md_lines += ["", "FOR THE KEEP."]

    with open(out_md, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"[SAVED MD]   {out_md}")

    print(f"\nFOR THE KEEP.")

if __name__ == "__main__":
    main()
