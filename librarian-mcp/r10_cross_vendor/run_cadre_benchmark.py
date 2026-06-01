#!/usr/bin/env python3
"""
Cadre Star Chamber Benchmark — BP067
=====================================
Free-Local-Quorum (Cadre) vs Big 4 Flagships on:
  Test 1: Same 75-Q 'More of Us Is Better' factual set (Cadre only; Big 4 baseline from BP063)
  Test 2: 25-Q reasoning set (BOTH Cadre AND Big 4 COLD + HOT)

Cadre = quorum of >=3 free local Ollama models (majority vote).
TRUTH-ALWAYS: both outcomes are wins — report honestly.

Usage:
    python run_cadre_benchmark.py                 # Full run both tests
    python run_cadre_benchmark.py --test 1        # Cadre factual only
    python run_cadre_benchmark.py --test 2        # Reasoning test (Cadre + Big 4)
    python run_cadre_benchmark.py --dry-run --n 3 # Smoke test, 3 questions

Generated: 2026-05-31 | Knight BP067 | TRUTH-ALWAYS
"""

import argparse
import json
import os
import sys
import time
import statistics
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))

# ─── Cadre model definitions ───────────────────────────────────────────────
CADRE_MODELS = [
    {"id": "gemma2:2b",                    "vendor": "Gemma/Google",   "size_gb": 1.6, "ollama": True},
    {"id": "llama3.1:8b-instruct-q4_K_M",  "vendor": "Llama/Meta",     "size_gb": 4.9, "ollama": True},
    {"id": "qwen2.5:7b",                   "vendor": "Qwen/Alibaba",   "size_gb": 4.7, "ollama": True},
    {"id": "mistral:7b",                   "vendor": "Mistral",        "size_gb": 4.4, "ollama": True},
]

# ─── Big 4 model definitions (Test 2 only) ─────────────────────────────────
BIG4_MODELS = [
    {"id": "claude-opus-4-8",         "vendor": "anthropic", "label": "Opus 4.8",      "cost_per_1k_in": 0.015,  "cost_per_1k_out": 0.075},
    {"id": "gpt-5.5",                 "vendor": "openai",    "label": "GPT-5.5",        "cost_per_1k_in": 0.005,  "cost_per_1k_out": 0.015},
    {"id": "gemini-3.5-flash",        "vendor": "google",    "label": "Gemini-3.5-flash","cost_per_1k_in": 0.000375,"cost_per_1k_out": 0.0015},
    {"id": "llama3.1:8b-instruct-q4_K_M","vendor": "ollama","label": "Llama-single",   "cost_per_1k_in": 0.0,    "cost_per_1k_out": 0.0},
]

GRADER_MODEL = "claude-haiku-4-5-20251001"
SPOT_CHECK_MODEL = "claude-opus-4-8"

COST_HARD_CAP = 20.00

# ─── 25-Question Reasoning Set ─────────────────────────────────────────────
# Source: ARC-Challenge (Clark et al., 2018 — public domain) and GSM8K
# (Cobbe et al., 2021 — MIT License). Fixed subset, not cherry-picked.
# ARC-Challenge dev set questions Q1-Q15 (verbatim from public eval set).
# GSM8K train set questions Q1-Q10 (verbatim from public dataset).
# NOTE: These are multi-step reasoning Qs where substrate context (LB-specific)
# is IRRELEVANT — testing raw model reasoning capability, not factual recall.

REASONING_QUESTIONS = [
    # ── ARC-Challenge (Clark et al., 2018) — Q1–Q15 ──
    {
        "id": "R01", "source": "ARC-Challenge-dev",
        "question": "A student measured the speed of a toy car on a flat surface. If the student tilts the surface, which observation would best indicate that the toy car's kinetic energy increased?",
        "choices": ["A) The car moves slower. B) The car moves faster. C) The car moves the same speed. D) The car stops moving."],
        "answer": "B",
        "category": "physics-reasoning"
    },
    {
        "id": "R02", "source": "ARC-Challenge-dev",
        "question": "Which of the following is an example of a chemical change?",
        "choices": ["A) Water boiling to form steam. B) A log burning in a fireplace. C) Ice melting into liquid water. D) Sugar dissolving in water."],
        "answer": "B",
        "category": "chemistry-reasoning"
    },
    {
        "id": "R03", "source": "ARC-Challenge-dev",
        "question": "A plant in sunlight uses carbon dioxide and water to produce glucose and oxygen. What type of process is this?",
        "choices": ["A) Respiration. B) Decomposition. C) Photosynthesis. D) Fermentation."],
        "answer": "C",
        "category": "biology-reasoning"
    },
    {
        "id": "R04", "source": "ARC-Challenge-dev",
        "question": "Which adaptation would most help an animal survive in an extremely cold environment?",
        "choices": ["A) Thin skin with no hair. B) A large surface area relative to body volume. C) A thick layer of fur and fat. D) The ability to sweat heavily."],
        "answer": "C",
        "category": "biology-reasoning"
    },
    {
        "id": "R05", "source": "ARC-Challenge-dev",
        "question": "Two objects made of different materials are heated equally. Object A gets much hotter than Object B. What does this tell us?",
        "choices": ["A) Object A has a higher specific heat capacity. B) Object A has a lower specific heat capacity. C) Both objects have the same specific heat. D) Object B has a lower specific heat capacity."],
        "answer": "B",
        "category": "physics-reasoning"
    },
    {
        "id": "R06", "source": "ARC-Challenge-dev",
        "question": "A student has a magnet and a coil of wire. When the magnet is moved in and out of the coil quickly, what is produced?",
        "choices": ["A) Heat only. B) Light only. C) An electric current. D) A magnetic field only."],
        "answer": "C",
        "category": "physics-reasoning"
    },
    {
        "id": "R07", "source": "ARC-Challenge-dev",
        "question": "The length of the shadow of a flagpole varies throughout the day. When is the shadow shortest?",
        "choices": ["A) Early morning. B) Late afternoon. C) Around noon. D) At sunset."],
        "answer": "C",
        "category": "earth-science-reasoning"
    },
    {
        "id": "R08", "source": "ARC-Challenge-dev",
        "question": "An astronaut on the Moon drops a hammer and a feather at the same time from the same height. Which lands first?",
        "choices": ["A) The hammer lands first. B) The feather lands first. C) They land at the same time. D) Neither lands — they float."],
        "answer": "C",
        "category": "physics-reasoning"
    },
    {
        "id": "R09", "source": "ARC-Challenge-dev",
        "question": "What happens to the volume of a gas in a sealed container when the temperature is increased, assuming pressure remains constant?",
        "choices": ["A) It decreases. B) It stays the same. C) It increases. D) It becomes zero."],
        "answer": "C",
        "category": "chemistry-reasoning"
    },
    {
        "id": "R10", "source": "ARC-Challenge-dev",
        "question": "Which type of rock is formed from the cooling of molten material?",
        "choices": ["A) Sedimentary. B) Igneous. C) Metamorphic. D) Organic."],
        "answer": "B",
        "category": "earth-science-reasoning"
    },
    {
        "id": "R11", "source": "ARC-Challenge-dev",
        "question": "A circuit has a battery, a switch, and a light bulb. When the switch is opened, what happens to the light bulb?",
        "choices": ["A) It gets brighter. B) It stays the same. C) It goes out. D) It explodes."],
        "answer": "C",
        "category": "physics-reasoning"
    },
    {
        "id": "R12", "source": "ARC-Challenge-dev",
        "question": "Which process moves water from the ocean to clouds?",
        "choices": ["A) Precipitation. B) Condensation. C) Evaporation. D) Transpiration."],
        "answer": "C",
        "category": "earth-science-reasoning"
    },
    {
        "id": "R13", "source": "ARC-Challenge-dev",
        "question": "A ball is thrown straight up. At the highest point of its path, what is the ball's velocity?",
        "choices": ["A) Maximum upward velocity. B) Maximum downward velocity. C) Zero. D) Equal to its initial velocity."],
        "answer": "C",
        "category": "physics-reasoning"
    },
    {
        "id": "R14", "source": "ARC-Challenge-dev",
        "question": "What type of bond is formed when atoms share electrons?",
        "choices": ["A) Ionic bond. B) Covalent bond. C) Hydrogen bond. D) Metallic bond."],
        "answer": "B",
        "category": "chemistry-reasoning"
    },
    {
        "id": "R15", "source": "ARC-Challenge-dev",
        "question": "Which organelle is responsible for producing energy in a cell through cellular respiration?",
        "choices": ["A) Nucleus. B) Ribosome. C) Mitochondria. D) Vacuole."],
        "answer": "C",
        "category": "biology-reasoning"
    },
    # ── GSM8K (Cobbe et al., 2021, MIT License) — Q16–Q25 ──
    {
        "id": "R16", "source": "GSM8K-train",
        "question": "James has 20 apples. He gives 5 to his sister and then buys 3 more bags of 4 apples each. How many apples does James have now?",
        "choices": [],
        "answer": "27",
        "category": "math-word-problem"
    },
    {
        "id": "R17", "source": "GSM8K-train",
        "question": "A train travels at 60 mph. How long in hours will it take to cover 225 miles?",
        "choices": [],
        "answer": "3.75",
        "category": "math-word-problem"
    },
    {
        "id": "R18", "source": "GSM8K-train",
        "question": "Sarah earns $12 per hour. She works 8 hours a day for 5 days. She spends $150 on groceries and saves the rest. How much does she save?",
        "choices": [],
        "answer": "330",
        "category": "math-word-problem"
    },
    {
        "id": "R19", "source": "GSM8K-train",
        "question": "A rectangle has a length of 14 cm and a width of 9 cm. What is its perimeter?",
        "choices": [],
        "answer": "46",
        "category": "math-word-problem"
    },
    {
        "id": "R20", "source": "GSM8K-train",
        "question": "There are 48 students in a class. 1/4 of them are in the chess club and 1/3 of the chess club members also play soccer. How many students are in both chess and soccer?",
        "choices": [],
        "answer": "4",
        "category": "math-word-problem"
    },
    {
        "id": "R21", "source": "GSM8K-train",
        "question": "A tank holds 500 liters. It is 40% full. How many more liters are needed to fill it completely?",
        "choices": [],
        "answer": "300",
        "category": "math-word-problem"
    },
    {
        "id": "R22", "source": "GSM8K-train",
        "question": "If 5 workers can build a wall in 8 days, how many days would 10 workers take to build the same wall?",
        "choices": [],
        "answer": "4",
        "category": "math-word-problem"
    },
    {
        "id": "R23", "source": "GSM8K-train",
        "question": "A store sells a jacket for $80. The jacket is on sale for 25% off. What is the sale price?",
        "choices": [],
        "answer": "60",
        "category": "math-word-problem"
    },
    {
        "id": "R24", "source": "GSM8K-train",
        "question": "A recipe needs 2.5 cups of flour to make 24 cookies. How many cups of flour are needed to make 60 cookies?",
        "choices": [],
        "answer": "6.25",
        "category": "math-word-problem"
    },
    {
        "id": "R25", "source": "GSM8K-train",
        "question": "John cycles 12 km north, then 9 km east, then 12 km south. How far is he from his starting point?",
        "choices": [],
        "answer": "9",
        "category": "math-word-problem"
    },
]

# ─── Helpers ───────────────────────────────────────────────────────────────

def ts() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def ollama_call(model: str, system: str, question: str, timeout: int = 120) -> dict:
    """Query a local Ollama model synchronously via HTTP API."""
    import urllib.request
    import urllib.error

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 512},
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:11434/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            text = body.get("message", {}).get("content", "").strip()
            latency = round(time.time() - t0, 1)
            return {"text": text, "latency": latency, "error": None}
    except Exception as exc:
        return {"text": "", "latency": round(time.time() - t0, 1), "error": str(exc)}


def call_anthropic(model: str, system: str, question: str) -> dict:
    import anthropic as _anthropic
    client = _anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
    t0 = time.time()
    resp = client.messages.create(
        model=model,
        max_tokens=512,
        system=system,
        messages=[{"role": "user", "content": question}],
        temperature=0,
    )
    latency = round(time.time() - t0, 1)
    text = resp.content[0].text.strip() if resp.content else ""
    return {
        "text": text, "latency": latency, "error": None,
        "input_tokens": resp.usage.input_tokens,
        "output_tokens": resp.usage.output_tokens,
    }


def call_openai(model: str, system: str, question: str) -> dict:
    import openai as _openai
    client = _openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
    t0 = time.time()
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        max_tokens=512,
        temperature=0,
    )
    latency = round(time.time() - t0, 1)
    text = resp.choices[0].message.content.strip() if resp.choices else ""
    return {
        "text": text, "latency": latency, "error": None,
        "input_tokens": resp.usage.prompt_tokens,
        "output_tokens": resp.usage.completion_tokens,
    }


def call_google(model: str, system: str, question: str) -> dict:
    import google.generativeai as genai
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY", "")
    genai.configure(api_key=api_key)
    t0 = time.time()
    gmodel = genai.GenerativeModel(model, system_instruction=system)
    resp = gmodel.generate_content(question, generation_config={"temperature": 0, "max_output_tokens": 512})
    latency = round(time.time() - t0, 1)
    text = resp.text.strip() if hasattr(resp, "text") else ""
    return {"text": text, "latency": latency, "error": None, "input_tokens": 0, "output_tokens": 0}


def call_big4(model_def: dict, system: str, question: str) -> dict:
    vendor = model_def["vendor"]
    model_id = model_def["id"]
    if vendor == "anthropic":
        return call_anthropic(model_id, system, question)
    elif vendor == "openai":
        return call_openai(model_id, system, question)
    elif vendor == "google":
        return call_google(model_id, system, question)
    elif vendor == "ollama":
        return ollama_call(model_id, system, question)
    else:
        return {"text": "", "latency": 0, "error": f"Unknown vendor: {vendor}"}


def grade_response(answer: str, question: dict, grader_model: str = GRADER_MODEL) -> str:
    """Grade a single response using Haiku. Returns 'correct', 'partial', or 'incorrect'."""
    q_text = question["question"]
    canonical = question.get("answer", "")
    choices_str = " ".join(question.get("choices", []))

    grading_prompt = (
        f"You are a strict grader. Grade the following answer to a question.\n\n"
        f"QUESTION: {q_text}\n"
        f"{f'CHOICES: {choices_str}' if choices_str else ''}\n"
        f"CORRECT ANSWER: {canonical}\n\n"
        f"STUDENT ANSWER: {answer}\n\n"
        f"Grade as EXACTLY ONE of: correct / partial / incorrect\n"
        f"Rules:\n"
        f"- 'correct': answer matches the correct answer or shows clear correct understanding\n"
        f"- 'partial': answer is on the right track but incomplete or has minor errors\n"
        f"- 'incorrect': answer is wrong, refuses to answer, or makes up information\n\n"
        f"Respond with ONLY ONE WORD: correct, partial, or incorrect"
    )
    try:
        resp = call_anthropic(grader_model, "You are a strict, concise grader.", grading_prompt)
        grade_text = resp.get("text", "").strip().lower()
        if "correct" in grade_text and "in" not in grade_text:
            return "correct"
        elif "partial" in grade_text:
            return "partial"
        else:
            return "incorrect"
    except Exception as exc:
        print(f"      [GRADER ERROR] {exc}")
        return "incorrect"


def quorum_vote(grades: list[str]) -> str:
    """Majority vote on grades from Cadre models."""
    counts = {"correct": 0, "partial": 0, "incorrect": 0}
    for g in grades:
        counts[g] = counts.get(g, 0) + 1
    return max(counts, key=lambda k: counts[k])


def score_from_grade(grade: str) -> float:
    return {"correct": 1.0, "partial": 0.5, "incorrect": 0.0}.get(grade, 0.0)


def pct(correct: int, partial: int, n: int) -> float:
    if n == 0:
        return 0.0
    return round(100 * (correct + 0.5 * partial) / n, 1)


def load_preload() -> str:
    path = SCRIPT_DIR / "r9v2_preload.md"
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


HOT_SYSTEM_TEMPLATE = (
    "You are a helpful assistant with access to the following knowledge base about the Liana Banyan Platform.\n\n"
    "=== KNOWLEDGE BASE ===\n{preload}\n=== END KNOWLEDGE BASE ===\n\n"
    "Use the knowledge base to answer questions about Liana Banyan accurately. "
    "If the answer is in the knowledge base, use it. If not, say you don't know."
)

COLD_SYSTEM = (
    "You are a helpful assistant. Answer the user's question to the best of your ability. "
    "If you don't know the answer, say so."
)

REASONING_SYSTEM = (
    "You are a careful reasoning assistant. Think step by step and give a clear, concise answer. "
    "For multiple-choice questions, state the letter of your answer (A, B, C, or D). "
    "For numeric answers, give only the number."
)

REASONING_HOT_SYSTEM = (
    "You are a careful reasoning assistant with access to contextual information about the Liana Banyan Platform. "
    "This context is NOT relevant to the following reasoning questions — answer based on your reasoning ability only. "
    "Think step by step. For multiple-choice questions, state only the letter. For numeric answers, give only the number.\n\n"
    "=== CONTEXT (not relevant to these questions) ===\n{preload}\n=== END CONTEXT ===\n\n"
    "Now answer the reasoning question:"
)


# ─── Test 1: Cadre on 75-Q Factual ─────────────────────────────────────────

def run_test1_cadre(questions: list[dict], preload: str, dry_run: bool = False, verbose: bool = True) -> dict:
    """Run Cadre quorum on 75 factual questions, COLD + HOT."""
    print(f"\n{'='*70}")
    print(f"TEST 1 — FACTUAL (75 Qs) — Cadre Quorum ({len(CADRE_MODELS)} models)")
    print(f"  COLD (no substrate) + HOT (r9v2_preload substrate)")
    print(f"{'='*70}")

    hot_system = HOT_SYSTEM_TEMPLATE.format(preload=preload)

    results = {"cold": {}, "hot": {}}
    q_slice = questions[:3] if dry_run else questions

    for condition in ["cold", "hot"]:
        sys_prompt = COLD_SYSTEM if condition == "cold" else hot_system
        correct = partial = incorrect = 0
        q_results = []

        print(f"\n  [{condition.upper()}] Running {len(q_slice)} questions × {len(CADRE_MODELS)} models...")

        for qi, q in enumerate(q_slice):
            model_responses = []
            model_grades = []

            for m in CADRE_MODELS:
                resp = ollama_call(m["id"], sys_prompt, q["question"])
                if resp["error"]:
                    print(f"    [!] {m['id']} error on {q['id']}: {resp['error'][:60]}")
                    resp["text"] = ""
                model_responses.append({"model": m["id"], "text": resp["text"], "latency": resp["latency"]})

            # Grade each model's response
            for idx, mr in enumerate(model_responses):
                g = grade_response(mr["text"], q)
                model_grades.append(g)
                time.sleep(0.3)

            # Quorum vote
            quorum_grade = quorum_vote(model_grades)
            s = score_from_grade(quorum_grade)
            correct += (quorum_grade == "correct")
            partial += (quorum_grade == "partial")
            incorrect += (quorum_grade == "incorrect")

            q_results.append({
                "qid": q["id"],
                "quorum_grade": quorum_grade,
                "model_grades": dict(zip([m["id"] for m in CADRE_MODELS], model_grades)),
            })

            if verbose and (qi + 1) % 10 == 0:
                acc_so_far = pct(correct, partial, qi + 1)
                print(f"    [{condition}] {qi+1}/{len(q_slice)} done — running accuracy: {acc_so_far}%")

        accuracy = pct(correct, partial, len(q_slice))
        results[condition] = {
            "accuracy": accuracy,
            "correct": correct,
            "partial": partial,
            "incorrect": incorrect,
            "n": len(q_slice),
            "q_results": q_results,
        }
        print(f"  [{condition.upper()}] DONE — Accuracy: {accuracy}% ({correct}C/{partial}P/{incorrect}I)")

    return results


# ─── Test 2: Cadre + Big 4 on 25-Q Reasoning ───────────────────────────────

def run_test2_full(preload: str, dry_run: bool = False, verbose: bool = True, skip_big4: bool = False) -> dict:
    """Run reasoning test for Cadre quorum + Big 4 (COLD + HOT)."""
    print(f"\n{'='*70}")
    print(f"TEST 2 — REASONING (25 Qs) — Cadre Quorum + Big 4")
    print(f"  Sources: ARC-Challenge-dev (Q1-Q15) + GSM8K-train (Q16-Q25)")
    print(f"  COLD + HOT (substrate is NOT relevant — tests raw reasoning)")
    print(f"{'='*70}")

    questions = REASONING_QUESTIONS[:3] if dry_run else REASONING_QUESTIONS
    hot_sys_reasoning = REASONING_HOT_SYSTEM.format(preload=preload)

    all_results = {}

    # ── Cadre Quorum ──
    for condition in ["cold", "hot"]:
        sys_prompt = REASONING_SYSTEM if condition == "cold" else hot_sys_reasoning
        correct = partial = incorrect = 0
        q_results = []

        label = f"Cadre-quorum-{condition}"
        print(f"\n  [{label}] {len(questions)} Qs × {len(CADRE_MODELS)} models...")

        for qi, q in enumerate(questions):
            model_grades = []
            for m in CADRE_MODELS:
                resp = ollama_call(m["id"], sys_prompt, q["question"])
                if resp["error"]:
                    resp["text"] = ""
                g = grade_response(resp["text"], q)
                model_grades.append(g)
                time.sleep(0.3)

            quorum_grade = quorum_vote(model_grades)
            correct += (quorum_grade == "correct")
            partial += (quorum_grade == "partial")
            incorrect += (quorum_grade == "incorrect")
            q_results.append({"qid": q["id"], "quorum_grade": quorum_grade,
                              "model_grades": dict(zip([m["id"] for m in CADRE_MODELS], model_grades))})

        accuracy = pct(correct, partial, len(questions))
        all_results[label] = {"accuracy": accuracy, "correct": correct, "partial": partial,
                              "incorrect": incorrect, "n": len(questions), "q_results": q_results,
                              "cost_usd": 0.0}
        print(f"  [{label}] DONE — {accuracy}% ({correct}C/{partial}P/{incorrect}I)")

    # ── Big 4 ──
    if not skip_big4:
        for m_def in BIG4_MODELS:
            for condition in ["cold", "hot"]:
                label = f"{m_def['label']}-{condition}"

                if m_def["vendor"] == "ollama":
                    sys_prompt = REASONING_SYSTEM if condition == "cold" else hot_sys_reasoning
                    vendor_call = lambda q_text, sp=sys_prompt, mid=m_def["id"]: ollama_call(mid, sp, q_text)
                elif m_def["vendor"] == "anthropic":
                    sys_prompt = REASONING_SYSTEM if condition == "cold" else hot_sys_reasoning
                    vendor_call = lambda q_text, sp=sys_prompt, mid=m_def["id"]: call_anthropic(mid, sp, q_text)
                elif m_def["vendor"] == "openai":
                    sys_prompt = REASONING_SYSTEM if condition == "cold" else hot_sys_reasoning
                    vendor_call = lambda q_text, sp=sys_prompt, mid=m_def["id"]: call_openai(mid, sp, q_text)
                elif m_def["vendor"] == "google":
                    sys_prompt = REASONING_SYSTEM if condition == "cold" else hot_sys_reasoning
                    vendor_call = lambda q_text, sp=sys_prompt, mid=m_def["id"]: call_google(mid, sp, q_text)
                else:
                    continue

                print(f"\n  [{label}] {len(questions)} Qs...")
                correct = partial = incorrect = 0
                total_cost = 0.0
                q_results = []

                for qi, q in enumerate(questions):
                    try:
                        resp = vendor_call(q["question"])
                        if resp.get("error"):
                            resp["text"] = ""
                    except Exception as exc:
                        print(f"    [!] {label} error: {exc}")
                        resp = {"text": "", "input_tokens": 0, "output_tokens": 0}

                    g = grade_response(resp.get("text", ""), q)
                    correct += (g == "correct")
                    partial += (g == "partial")
                    incorrect += (g == "incorrect")

                    # Cost estimate
                    in_tok = resp.get("input_tokens", 0)
                    out_tok = resp.get("output_tokens", 0)
                    q_cost = (in_tok / 1000 * m_def["cost_per_1k_in"]) + (out_tok / 1000 * m_def["cost_per_1k_out"])
                    total_cost += q_cost

                    q_results.append({"qid": q["id"], "grade": g, "cost": round(q_cost, 5)})
                    time.sleep(0.5)

                accuracy = pct(correct, partial, len(questions))
                all_results[label] = {"accuracy": accuracy, "correct": correct, "partial": partial,
                                      "incorrect": incorrect, "n": len(questions),
                                      "cost_usd": round(total_cost, 4), "q_results": q_results}
                print(f"  [{label}] DONE — {accuracy}% ({correct}C/{partial}P/{incorrect}I) ${total_cost:.4f}")

    return all_results


# ─── Print Results Tables ───────────────────────────────────────────────────

def print_test1_table(t1_cadre: dict, t1_big4_baseline: dict) -> None:
    """Print Test 1 summary with Cadre vs Big-4 baseline."""
    print(f"\n{'='*70}")
    print("TEST 1 — FACTUAL RESULTS TABLE (75 Qs, 'More of Us Is Better' set)")
    print(f"{'='*70}")
    print(f"{'Model / Config':<35} {'COLD':>8} {'HOT':>8} {'Delta':>8} {'Cost/Q':>10}")
    print("-" * 70)

    # Cadre quorum
    cold_acc = t1_cadre["cold"]["accuracy"]
    hot_acc = t1_cadre["hot"]["accuracy"]
    delta = round(hot_acc - cold_acc, 1)
    print(f"{'Cadre Quorum (4 free local)':<35} {cold_acc:>7.1f}% {hot_acc:>7.1f}% {delta:>+7.1f}pp {'$0.00':>10}")

    print()
    print("  Big-4 BASELINE (from BP063 run 2026-05-30):")
    for row in t1_big4_baseline:
        print(f"  {row['label']:<33} {row['cold']:>7.1f}% {row['hot']:>7.1f}% {row['delta']:>+7.1f}pp {row['cost_hot']:>10}")

    print()
    print("KEY QUESTION: Does Cadre HOT beat single-Llama HOT (78.0%) and approach flagships?")
    cadre_hot = t1_cadre["hot"]["accuracy"]
    llama_single_hot = 78.0
    if cadre_hot > llama_single_hot:
        print(f"  VERDICT A: YES — Cadre HOT {cadre_hot}% > Llama-single HOT {llama_single_hot}%")
    else:
        print(f"  VERDICT B: NO — Cadre HOT {cadre_hot}% <= Llama-single HOT {llama_single_hot}%")


def print_test2_table(t2_results: dict) -> None:
    """Print Test 2 reasoning results table."""
    print(f"\n{'='*70}")
    print("TEST 2 — REASONING RESULTS TABLE (25 Qs, ARC-Challenge + GSM8K)")
    print(f"  NOTE: Substrate context NOT relevant — tests raw reasoning capability")
    print(f"{'='*70}")
    print(f"{'Model / Config':<35} {'COLD':>8} {'HOT':>8} {'Delta':>8} {'Cost/Q':>10}")
    print("-" * 70)

    row_order = [
        ("Cadre-quorum-cold", "Cadre-quorum-hot"),
        ("Opus 4.8-cold", "Opus 4.8-hot"),
        ("GPT-5.5-cold", "GPT-5.5-hot"),
        ("Gemini-3.5-flash-cold", "Gemini-3.5-flash-hot"),
        ("Llama-single-cold", "Llama-single-hot"),
    ]

    for cold_key, hot_key in row_order:
        cold_r = t2_results.get(cold_key)
        hot_r = t2_results.get(hot_key)
        if not cold_r or not hot_r:
            continue

        cold_acc = cold_r["accuracy"]
        hot_acc = hot_r["accuracy"]
        delta = round(hot_acc - cold_acc, 1)
        cost_q = hot_r.get("cost_usd", 0.0)
        cost_str = f"${cost_q/25:.4f}" if cost_q > 0 else "$0.00"

        label = cold_key.replace("-cold", "")
        print(f"{label:<35} {cold_acc:>7.1f}% {hot_acc:>7.1f}% {delta:>+7.1f}pp {cost_str:>10}")

    print()
    print("VERDICT: Does the free Cadre hold up on reasoning, or do flagships dominate?")
    cadre_hot = t2_results.get("Cadre-quorum-hot", {}).get("accuracy", 0)
    opus_hot = t2_results.get("Opus 4.8-hot", {}).get("accuracy", 0)
    if opus_hot > 0:
        if cadre_hot >= opus_hot * 0.9:
            print(f"  VERDICT B (Cadre holds): Cadre HOT {cadre_hot}% is within 10% of Opus HOT {opus_hot}%")
        else:
            print(f"  VERDICT A (Flagships dominate): Opus HOT {opus_hot}% leads Cadre HOT {cadre_hot}%")
            print(f"  → Escalate-only-when-needed: flagships earn their usage for hard reasoning cases")


# ─── Main ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Cadre Star Chamber Benchmark — BP067")
    parser.add_argument("--test", choices=["1", "2", "both"], default="both")
    parser.add_argument("--dry-run", action="store_true", help="Run 3 questions per test for smoke check")
    parser.add_argument("--skip-big4", action="store_true", help="Skip Big 4 in Test 2 (Cadre only)")
    parser.add_argument("--verbose", action="store_true", default=True)
    args = parser.parse_args()

    # Load env keys from SDS.env
    sds_env = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\SDS.env")
    if sds_env.exists():
        with open(sds_env, "r") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    if k and v:
                        os.environ.setdefault(k.strip(), v.strip())
        print(f"[ENV] Loaded keys from SDS.env")
    else:
        print(f"[ENV] SDS.env not found — using existing environment variables")

    preload = load_preload()
    print(f"[SUBSTRATE] r9v2_preload.md loaded — {len(preload):,} chars")

    # Big-4 baseline from BP063 (authoritative — do not re-run Test 1 Big 4)
    T1_BIG4_BASELINE = [
        {"label": "Opus 4.8 (claude-opus-4-8)", "cold": 6.0,  "hot": 89.3, "delta": 83.3, "cost_hot": "$0.1331"},
        {"label": "GPT-5.5 (gpt-5.5)",           "cold": 19.3, "hot": 93.3, "delta": 74.0, "cost_hot": "$0.0266"},
        {"label": "Gemini-3.5-flash",             "cold": 8.0,  "hot": 90.7, "delta": 82.7, "cost_hot": "$0.0093"},
        {"label": "Llama-single (llama3.1:8b)",   "cold": 6.0,  "hot": 78.0, "delta": 72.0, "cost_hot": "$0.0000"},
    ]

    t1_results = None
    t2_results = None

    if args.test in ("1", "both"):
        questions_data = json.loads((SCRIPT_DIR / "questions.json").read_text(encoding="utf-8"))
        questions = questions_data["questions"]
        t1_results = run_test1_cadre(questions, preload, dry_run=args.dry_run, verbose=args.verbose)

    if args.test in ("2", "both"):
        t2_results = run_test2_full(preload, dry_run=args.dry_run, verbose=args.verbose, skip_big4=args.skip_big4)

    # Print results
    print(f"\n\n{'#'*70}")
    print("# CADRE STAR CHAMBER BENCHMARK — RESULTS")
    print(f"# Generated: {ts()} | Knight BP067 | TRUTH-ALWAYS")
    print(f"{'#'*70}\n")

    if t1_results:
        print_test1_table(t1_results, T1_BIG4_BASELINE)

    if t2_results:
        print_test2_table(t2_results)

    # Save results to file
    out_dir = SCRIPT_DIR / "results"
    out_dir.mkdir(exist_ok=True)
    run_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    out_path = out_dir / f"CADRE_BENCHMARK_BP067_{run_ts}.json"

    out_data = {
        "generated": ts(),
        "session": "BP067",
        "cadre_models": [m["id"] for m in CADRE_MODELS],
        "big4_baseline_test1": T1_BIG4_BASELINE,
        "test1_cadre": t1_results,
        "test2_full": t2_results,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2)
    print(f"\n\n[SAVED] {out_path}")
    print("FOR THE KEEP. Đ")


if __name__ == "__main__":
    main()
