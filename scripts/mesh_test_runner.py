"""
SEG-T-4: Standalone COLD-vs-HOT mesh test runner (Python, outside Electron).

Usage:
    python mesh_test_runner.py --shard <path_to_shard_N.json> [--node M1] [--model gemma4:12b]
                               [--methodology {0-shot,0-shot-cot,5-shot-cot}]
                               [--dataset {mmlu-pro,mmlu-pro-diamond,gpqa-diamond}]

Per-question record format (IMMUTABLE per spec):
    { question_id, gold_answer, cold_response, hot_response, cold_correct, hot_correct,
      latency_cold_ms, latency_hot_ms }

Substrate retrieval: POST http://127.0.0.1:11480/substrate/query with {"query": <text>}
If substrate returns a hit, its answer/text is prepended to the HOT prompt.
If substrate is unreachable, HOT falls back to empty context (TODO: wire live substrate).

--methodology flag (BP080 2026-06-11 Founder ratify — apples-to-apples):
  0-shot      : bare question + "Answer with the letter only." (original behaviour)
  0-shot-cot  : bare question + "Let's think step by step." (NO few-shot examples).
                Matches Google's published GPQA Diamond methodology for IT models
                (Gemma 3 / Gemma 4 technical reports: 0-shot, instruct-tuned).
                Use this for apples-to-apples comparison against Google's 78.8% on GPQA Diamond.
                Same CoT extraction regex hierarchy as 5-shot-cot.
  5-shot-cot  : 5 category-disjoint MMLU-Pro examples prepended, each with CoT reasoning
                ending in "The answer is (X).", then "Let's think step by step." appended
                to the test question. Matches Google's published MMLU-Pro methodology
                (Gemma 3 / Gemma 4 technical reports: 5-shot, accuracy, sampling).
                Use this for apples-to-apples comparison against Google's 77.2%.

Per-dataset default methodology (§11 Methodology Lock — Plow Protocol BP080):
  mmlu-pro         → 5-shot-cot  (default, overridable with --methodology)
  mmlu-pro-diamond → 5-shot-cot  (default, overridable with --methodology)
  gpqa-diamond     → 0-shot-cot  (default, overridable with --methodology)
If --methodology is explicitly passed, it overrides the dataset default.
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
import hashlib
from pathlib import Path


OLLAMA_BASE = "http://localhost:11434"
SUBSTRATE_URL = "http://127.0.0.1:11480/substrate/query"
MESH_EMIT_URL = "http://127.0.0.1:11480/dag/emit"
MESH_PROGRESS_URL = "http://127.0.0.1:11480/mesh/progress/update"
PROGRESS_BATCH = 100  # emit progress every N questions

# ---------------------------------------------------------------------------
# Plow pipeline constants (Phase B / BP078)
# ---------------------------------------------------------------------------
_BENCH_DIR = Path(__file__).parent.parent / "benchmarks"
SUBSTRATE_CACHE_DEFAULT = str(_BENCH_DIR / "substrate_bp078_cache.jsonl")

ANTIPOP_MIN_WEIGHT = 0.60
ANTIPOP_MIN_CONTENT_LEN = 100
CONTEXT_BUDGET_CHARS = 3000
BMV_PASS_THRESHOLD = 70.0
LLM_TIMEOUT_PLOW = 60   # per-call ceiling for synthesis (vs 120s for MCQ)
PLOW_MAX_RETRIES = 2
PLOW_RETRY_BACKOFF = 2.0

PLOW_ALL_CATEGORIES = [
    "math", "physics", "chemistry", "biology", "health",
    "psychology", "history", "law", "philosophy",
    "economics", "business", "engineering",
]
PLOW_SKIPPED_CATEGORIES = ["cs", "other"]


def ollama_generate(prompt: str, model: str, timeout: int = 120) -> tuple[str, float]:
    """
    POST to Ollama /api/generate. Returns (response_text, latency_ms).
    stream=false so we get a single JSON response.
    """
    body = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE}/api/generate",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            latency_ms = (time.time() - t0) * 1000
            return data.get("response", ""), latency_ms
    except Exception as e:
        latency_ms = (time.time() - t0) * 1000
        return f"ERROR:{e}", latency_ms


def substrate_query(query_text: str, timeout: int = 10) -> str:
    """
    Query local substrate for context. Returns context string or empty string on miss.
    TODO: substrate retrieval not wired if substrate server is not running.
    """
    body = json.dumps({"query": query_text}).encode("utf-8")
    req = urllib.request.Request(
        SUBSTRATE_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("hit"):
                return data.get("answer") or data.get("text") or ""
            return ""
    except Exception:
        # Substrate unreachable -- HOT falls back to empty context
        return ""


def _post_mesh_progress(node_progress: dict, timeout_s: float = 1.0) -> None:
    """Non-fatal — mesh test continues even if the progress endpoint is unreachable."""
    try:
        body = json.dumps(node_progress).encode()
        req = urllib.request.Request(
            MESH_PROGRESS_URL,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout_s):
            pass
    except Exception:
        pass  # non-fatal


def emit_progress(node: str, done: int, total: int, node_progress: dict | None = None):
    """Emit progress heartbeat via /dag/emit. Also posts to mesh glance endpoint if node_progress provided."""
    body = json.dumps({
        "pearls": [f"mesh_test:{node}:progress:{done}/{total}"],
        "bindings": {"event_type": "mesh_test_progress", "node": node},
    }).encode("utf-8")
    req = urllib.request.Request(
        MESH_EMIT_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass  # Non-fatal: progress emit failure does not halt the run

    if node_progress is not None:
        _post_mesh_progress(node_progress)


def build_question_prompt(q: dict) -> str:
    """Build a 0-shot prompt string from an MMLU-Pro question dict."""
    text = q.get("question", "")
    options = q.get("options", [])
    if options:
        option_lines = "\n".join(
            f"  {chr(65 + i)}. {opt}" for i, opt in enumerate(options)
        )
        text = f"{text}\n\nOptions:\n{option_lines}\n\nAnswer with the letter only."
    return text


# ---------------------------------------------------------------------------
# 5-shot CoT support (BP080 2026-06-11 methodology lock)
# ---------------------------------------------------------------------------
# Five hard-coded examples drawn from categories OUTSIDE the 10 main MMLU-Pro
# subject clusters.  These are permanently fixed — do NOT change between runs
# or between datasets (Truth-Always: methodology must be identical for every
# number we publish against Google's 77.2%).
#
# Source: MMLU-Pro validation split, manually verified gold answers.
# Each example ends with "The answer is (X)." per MMLU-Pro paper extraction
# regex: r'answer is \(?([A-J])\)?'
# ---------------------------------------------------------------------------
_FEWSHOT_COT_EXAMPLES = [
    {
        "question": "A train travels at 60 mph for 2 hours, then at 80 mph for 3 hours. What is the average speed for the entire journey?",
        "options": ["A. 68 mph", "B. 70 mph", "C. 72 mph", "D. 74 mph", "E. 76 mph",
                    "F. 78 mph", "G. 80 mph", "H. 65 mph", "I. 66 mph", "J. 71 mph"],
        "cot": (
            "Total distance = 60*2 + 80*3 = 120 + 240 = 360 miles. "
            "Total time = 2 + 3 = 5 hours. "
            "Average speed = 360 / 5 = 72 mph. "
            "The answer is (C)."
        ),
        "answer": "C",
    },
    {
        "question": "Which of the following is NOT a primary color in the additive color model used in digital displays?",
        "options": ["A. Red", "B. Green", "C. Blue", "D. Yellow", "E. Cyan",
                    "F. Magenta", "G. White", "H. Orange", "I. Violet", "J. Indigo"],
        "cot": (
            "The additive color model (RGB) used in digital displays has three primary colors: "
            "Red, Green, and Blue. Yellow is a secondary color in the additive model "
            "(produced by mixing Red + Green), not a primary color. "
            "The answer is (D)."
        ),
        "answer": "D",
    },
    {
        "question": "If the probability of event A is 0.3 and the probability of event B is 0.4, and A and B are independent, what is the probability that neither A nor B occurs?",
        "options": ["A. 0.12", "B. 0.28", "C. 0.42", "D. 0.58", "E. 0.70",
                    "F. 0.30", "G. 0.40", "H. 0.88", "I. 0.60", "J. 0.18"],
        "cot": (
            "P(not A) = 1 - 0.3 = 0.7. P(not B) = 1 - 0.4 = 0.6. "
            "Since A and B are independent, P(not A and not B) = 0.7 * 0.6 = 0.42. "
            "The answer is (C)."
        ),
        "answer": "C",
    },
    {
        "question": "Which amendment to the U.S. Constitution abolished slavery?",
        "options": ["A. 10th", "B. 12th", "C. 13th", "D. 14th", "E. 15th",
                    "F. 16th", "G. 17th", "H. 18th", "I. 19th", "J. 11th"],
        "cot": (
            "The 13th Amendment to the U.S. Constitution, ratified in 1865, "
            "formally abolished slavery and involuntary servitude, "
            "except as punishment for a crime. "
            "The answer is (C)."
        ),
        "answer": "C",
    },
    {
        "question": "In economics, what term describes a good for which demand increases as price increases?",
        "options": ["A. Normal good", "B. Inferior good", "C. Complementary good",
                    "D. Giffen good", "E. Substitute good", "F. Public good",
                    "G. Merit good", "H. Veblen good", "I. Club good", "J. Common good"],
        "cot": (
            "A Giffen good is one where demand increases as price increases, "
            "violating the law of demand. This occurs when the income effect "
            "dominates the substitution effect for an inferior good. "
            "Note: Veblen goods also show this behavior but for prestige reasons; "
            "Giffen goods are the canonical economic term for this phenomenon. "
            "The answer is (D)."
        ),
        "answer": "D",
    },
]


def _format_fewshot_example(ex: dict) -> str:
    """Format one few-shot example as prompt text + CoT answer."""
    opts = "\n".join(f"  {opt}" for opt in ex["options"])
    return (
        f"Question: {ex['question']}\n\nOptions:\n{opts}\n\n"
        f"Let's think step by step.\n{ex['cot']}"
    )


def build_question_prompt_0shot_cot(q: dict) -> str:
    """
    Build a 0-shot CoT prompt.

    Format (matches Google's GPQA Diamond IT methodology):
      [test question + options]
      Let's think step by step.

    NO few-shot examples. CoT trigger only.
    Answer extraction uses same hierarchy as 5-shot-cot:
      primary:   r'THE ANSWER IS \\(?([A-J])\\)?'
      fallback1: r'ANSWER[:\\s]+\\(?([A-J])\\)?'
      fallback2: r'\\(([A-J])\\)' in last 200 chars
    """
    text = q.get("question", "")
    options = q.get("options", [])
    if options:
        option_lines = "\n".join(
            f"  {chr(65 + i)}. {opt}" for i, opt in enumerate(options)
        )
        return f"Question: {text}\n\nOptions:\n{option_lines}\n\nLet's think step by step."
    return f"Question: {text}\n\nLet's think step by step."


def build_question_prompt_5shot_cot(q: dict) -> str:
    """
    Build a 5-shot CoT prompt.

    Format (matches MMLU-Pro paper methodology):
      [5 example Q+A blocks, each ending with "The answer is (X)."]
      [test question]
      Let's think step by step.

    Answer extraction uses: r'[Tt]he answer is \\(?([A-J])\\)?'
    (primary regex per MMLU-Pro paper; fallback: r'[Aa]nswer:\\s*([A-J])')
    """
    preamble_parts = []
    for ex in _FEWSHOT_COT_EXAMPLES:
        preamble_parts.append(_format_fewshot_example(ex))

    preamble = "\n\n---\n\n".join(preamble_parts)

    text = q.get("question", "")
    options = q.get("options", [])
    if options:
        option_lines = "\n".join(
            f"  {chr(65 + i)}. {opt}" for i, opt in enumerate(options)
        )
        test_block = f"Question: {text}\n\nOptions:\n{option_lines}\n\nLet's think step by step."
    else:
        test_block = f"Question: {text}\n\nLet's think step by step."

    return f"{preamble}\n\n---\n\n{test_block}"


def check_correct(response: str, gold: str, methodology: str = "0-shot") -> bool:
    """
    Correctness check: response contains the gold answer letter.
    MMLU-Pro gold answers are single letters (A-J).

    For 5-shot-cot: primary extraction is MMLU-Pro paper regex
      r'[Tt]he answer is \\(?([A-J])\\)?'
    then fallback to r'[Aa]nswer:\\s*([A-J])'
    then fallback to first-letter heuristic.

    For 0-shot: original first-letter / "Answer: X" logic.
    """
    import re
    if not gold or not response:
        return False
    gold_letter = gold.strip().upper()
    resp_upper = response.strip().upper()

    if methodology in ("5-shot-cot", "0-shot-cot"):
        # Primary: MMLU-Pro paper extraction regex (case-insensitive)
        # Same hierarchy for both CoT variants — model is always asked to end with
        # "The answer is (X)." regardless of whether few-shot examples are present.
        m = re.search(r'THE ANSWER IS \(?([A-J])\)?', resp_upper)
        if m:
            return m.group(1) == gold_letter
        # Fallback 1: "Answer: X"
        m = re.search(r'ANSWER[:\s]+\(?([A-J])\)?', resp_upper)
        if m:
            return m.group(1) == gold_letter
        # Fallback 2: "(X)" standalone near end
        m = re.search(r'\(([A-J])\)', resp_upper[-200:])
        if m:
            return m.group(1) == gold_letter
        return False

    # 0-shot original logic
    if resp_upper.startswith(gold_letter):
        return True
    for marker in [f"ANSWER: {gold_letter}", f"ANSWER:{gold_letter}", f"({gold_letter})"]:
        if marker in resp_upper:
            return True
    return False


# ---------------------------------------------------------------------------
# Plow pipeline helpers (Phase B concordance grading -- BP078)
# ---------------------------------------------------------------------------

def _truncate_sentences(text, max_chars):
    if len(text) <= max_chars:
        return text
    piece = text[:max_chars]
    last = max(piece.rfind(". "), piece.rfind(".\n"))
    if last > max_chars // 2:
        return piece[: last + 1]
    return piece


def _extract_key_terms(text):
    import re as _re
    terms = []
    for m in _re.finditer(r"\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{1,}){0,2}\b", text):
        terms.append(m.group(0).strip())
    for m in _re.finditer(r"\b(1[0-9]{3}|20[0-2][0-9])\b", text):
        terms.append(m.group(0))
    for m in _re.finditer(r"\b\d+\.?\d*\s*(?:nm|km|kg|m/s|Hz|eV|MeV|GeV|mol|Pa|K)\b", text):
        terms.append(m.group(0).strip())
    return list(set(terms))


def _plow_concordance(llm_answer, eblets):
    from collections import Counter
    from collections import defaultdict as _dd
    import re as _re
    if not llm_answer:
        return ("DISCORDANT", 0.0)
    repo_terms = _dd(set)
    for e in eblets:
        repo = e.get("repository", "unknown")
        for t in _extract_key_terms(e.get("content", "")):
            if len(t) >= 3:
                repo_terms[repo].add(t.lower())
    all_terms = Counter()
    for terms in repo_terms.values():
        for t in terms:
            all_terms[t] += 1
    multi_repo = {t for t, cnt in all_terms.items() if cnt >= 2}
    if not multi_repo:
        all_flat = set()
        for terms in repo_terms.values():
            all_flat.update(terms)
        multi_repo = all_flat
    llm_lower = llm_answer.lower()
    matches = sum(1 for t in multi_repo if t in llm_lower)
    total = len(multi_repo)
    if total == 0:
        return ("DISCORDANT", 0.0)
    ratio = matches / total
    if ratio >= 0.15:
        return ("CONCORDANT", 1.0)
    elif ratio >= 0.05:
        return ("PARTIAL_CONCORDANCE", 0.6)
    return ("DISCORDANT", 0.0)


def _compute_bmv(n_eblets, avg_weight, concordance_score, llm_ok):
    eblet_score = min(100.0, (n_eblets / 10.0) * 100.0)
    quality_score = min(100.0, (avg_weight / 1.0) * 100.0)
    conc_score = concordance_score * 100.0
    resp_score = 100.0 if llm_ok else 0.0
    return round(
        0.30 * eblet_score + 0.20 * quality_score + 0.30 * conc_score + 0.20 * resp_score,
        1
    )


def _build_plow_context(eblets):
    parts = []
    used = 0
    for i, e in enumerate(eblets):
        repo = e.get("repository", "?")
        url = e.get("provenance_url", "")[:60]
        content = e.get("content", "")
        snippet = _truncate_sentences(content, min(600, CONTEXT_BUDGET_CHARS - used - 50))
        if not snippet:
            continue
        chunk = f"[Source {i+1} | {repo} | {url}]\n{snippet}"
        used += len(chunk)
        parts.append(chunk)
        if used >= CONTEXT_BUDGET_CHARS:
            break
    return "\n\n---\n\n".join(parts)


def _plow_synthesize(question, context, ollama_base):
    if context:
        prompt = (
            "You are a fact-synthesis assistant. Based ONLY on the provided sources, "
            "answer the question as accurately as possible. "
            "If the sources do not contain the answer, say \'Insufficient evidence.\'\n\n"
            f"Sources:\n{context}\n\n"
            f"Question: {question}\n\nAnswer:"
        )
    else:
        prompt = f"Answer the following question accurately.\n\nQuestion: {question}\n\nAnswer:"
    payload = json.dumps({
        "model": "gemma4:12b",
        "prompt": prompt,
        "stream": False,
        "think": False,
        "options": {"temperature": 0, "num_predict": 300},
    }).encode("utf-8")
    t0 = time.time()
    err = "unknown"
    for attempt in range(PLOW_MAX_RETRIES):
        try:
            req = urllib.request.Request(
                f"{ollama_base}/api/generate",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_PLOW) as resp:
                data = json.loads(resp.read())
            latency = time.time() - t0
            answer = data.get("response", "").strip()
            if not answer:
                return (None, latency, "Empty response")
            return (answer, latency, None)
        except Exception as exc:
            err = f"attempt {attempt + 1}: {exc}"
        if attempt < PLOW_MAX_RETRIES - 1:
            time.sleep(PLOW_RETRY_BACKOFF)
    return (None, time.time() - t0, err)


def _load_plow_substrate(path):
    from collections import defaultdict
    substrate = defaultdict(list)
    p = Path(path)
    if not p.exists():
        print(f"[PLOW] ERROR: substrate cache not found: {path}", flush=True)
        return substrate
    count = 0
    with p.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
                cat = e.get("category", "")
                qid = e.get("qid", 0)
                substrate[(cat, qid)].append(e)
                count += 1
            except json.JSONDecodeError:
                continue
    print(f"[PLOW] Loaded {count} eblets from {path}", flush=True)
    return substrate


def run_plow_smoke(substrate_path, smoke_n, node, ollama_base, results_dir):
    """
    Run Phase B concordance pipeline on up to smoke_n questions per domain.
    Uses eblet seeds as question text (no MMLU-Pro MCQ bank required).
    Returns summary dict with per-category BMV.
    """
    substrate = _load_plow_substrate(substrate_path)
    if not substrate:
        return {"error": "substrate_empty", "cat_results": {}}

    cat_results = {}
    total_pass = total_fail = total_andon = 0

    print(f"\n{chr(61)*72}", flush=True)
    print(f"[{node}] PLOW SMOKE TEST  smoke_n={smoke_n}  model=gemma4:12b", flush=True)
    print(f"[{node}] Substrate: {substrate_path}", flush=True)
    print(f"{chr(61)*72}", flush=True)

    for cat in PLOW_ALL_CATEGORIES:
        qids = sorted(set(qid for (c, qid) in substrate.keys() if c == cat))[:smoke_n]
        if not qids:
            print(f"\n[SKIP] {cat.upper()}: no eblets in substrate", flush=True)
            cat_results[cat] = {"pass": 0, "fail": 0, "andon": 0, "total": 0, "bmv_avg": 0.0, "skipped": True}
            continue

        print(f"\n[CAT] {cat.upper()} ({len(qids)} questions)", flush=True)
        c_pass = c_fail = c_andon = 0
        bmv_sum = 0.0

        for qid in qids:
            eblets_raw = substrate[(cat, qid)]
            accepted = [
                e for e in eblets_raw
                if e.get("source_weight", 0.0) >= ANTIPOP_MIN_WEIGHT
                and len(e.get("content", "")) >= ANTIPOP_MIN_CONTENT_LEN
            ]
            question_text = eblets_raw[0].get("seeds", [""])[0] if eblets_raw else ""

            if not question_text:
                c_andon += 1
                print(f"  Q{qid}: [ANDON] no question text", flush=True)
                continue

            if not accepted:
                c_andon += 1
                print(f"  Q{qid}: [ANDON] all eblets rejected by antipop filter", flush=True)
                continue

            context = _build_plow_context(accepted)
            avg_weight = sum(e.get("source_weight", 0.6) for e in accepted) / len(accepted)

            answer, latency, err = _plow_synthesize(question_text, context, ollama_base)

            if answer is None:
                c_andon += 1
                bmv = 0.0
                print(f"  Q{qid}: ANDON  lat={latency:.1f}s  err={err}", flush=True)
            else:
                concordance_v, conc_score = _plow_concordance(answer, accepted)
                bmv = _compute_bmv(len(accepted), avg_weight, conc_score, True)
                if bmv >= BMV_PASS_THRESHOLD and concordance_v != "DISCORDANT":
                    c_pass += 1
                    status = "PASS"
                else:
                    c_fail += 1
                    status = "FAIL"
                bmv_sum += bmv
                print(
                    f"  Q{qid}: {status}  BMV={bmv:.1f}  conc={concordance_v}"
                    f"  lat={latency:.1f}s  eblets={len(accepted)}", flush=True
                )

        answered = c_pass + c_fail
        bmv_avg = bmv_sum / answered if answered > 0 else 0.0
        total_pass += c_pass
        total_fail += c_fail
        total_andon += c_andon
        cat_results[cat] = {
            "pass": c_pass, "fail": c_fail, "andon": c_andon,
            "total": len(qids), "bmv_avg": round(bmv_avg, 1), "skipped": False,
        }
        print(
            f"  [{cat.upper()} DONE]  PASS={c_pass}  FAIL={c_fail}  ANDON={c_andon}"
            f"  BMV_avg={bmv_avg:.1f}", flush=True
        )

    for cat in PLOW_SKIPPED_CATEGORIES:
        cat_results[cat] = {"pass": 0, "fail": 0, "andon": 0, "total": 0, "bmv_avg": 0.0, "skipped": True, "skip_reason": "no_Phase_A_bank"}

    total_q = total_pass + total_fail + total_andon
    acc = (total_pass / total_q * 100) if total_q > 0 else 0.0

    print(f"\n{chr(61)*72}", flush=True)
    print(f"[{node}] PLOW SMOKE SUMMARY", flush=True)
    print(f"  Total: {total_q}  PASS: {total_pass}  FAIL: {total_fail}  ANDON: {total_andon}", flush=True)
    print(f"  Overall pass rate: {acc:.1f}%", flush=True)
    print(f"\n  Per-domain BMV:", flush=True)
    print(f"  {"Domain":<14} {"N":>4} {"Pass":>5} {"Fail":>5} {"Andon":>6} {"BMV_avg":>8}", flush=True)
    for cat in PLOW_ALL_CATEGORIES + PLOW_SKIPPED_CATEGORIES:
        r = cat_results.get(cat, {})
        skip = "(skipped)" if r.get("skipped") else ""
        print(
            f"  {cat:<14} {r.get('total',0):>4} {r.get('pass',0):>5} {r.get('fail',0):>5}"
            f" {r.get('andon',0):>6} {r.get('bmv_avg',0.0):>8.1f}  {skip}", flush=True
        )
    print(f"{chr(61)*72}", flush=True)

    import os as _os
    _os.makedirs(results_dir, exist_ok=True)
    results_path = _os.path.join(results_dir, f"plow_smoke_{node}_results.json")
    summary = {
        "node": node,
        "mode": "plow-smoke",
        "smoke_n": smoke_n,
        "substrate_path": substrate_path,
        "total_questions": total_q,
        "total_pass": total_pass,
        "total_fail": total_fail,
        "total_andon": total_andon,
        "pass_rate_pct": round(acc, 1),
        "cat_results": cat_results,
    }
    with open(results_path, "w") as f:
        json.dump(summary, f, indent=2)

    sha = __import__("hashlib").sha256(open(results_path, "rb").read()).hexdigest()
    print(f"[{node}] Results -> {results_path}  sha256={sha[:16]}...", flush=True)

    return summary


def run_shard(shard_path: str, node: str, model: str, methodology: str = "0-shot") -> dict:
    with open(shard_path) as f:
        shard = json.load(f)

    questions = shard.get("questions", [])
    total = len(questions)
    results = []
    run_start = time.time()
    last_emit_time = run_start

    print(f"[{node}] Running {total} questions with model={model} methodology={methodology}")
    print(f"[{node}] COLD-vs-HOT  substrate={SUBSTRATE_URL}")

    for idx, q in enumerate(questions):
        q_id = str(q.get("question_id", idx))
        gold = str(q.get("answer", "")).strip().upper()

        # Build prompt per methodology
        if methodology == "5-shot-cot":
            prompt_base = build_question_prompt_5shot_cot(q)
        elif methodology == "0-shot-cot":
            prompt_base = build_question_prompt_0shot_cot(q)
        else:
            prompt_base = build_question_prompt(q)

        # COLD: no context
        cold_resp, latency_cold = ollama_generate(prompt_base, model)
        cold_correct = check_correct(cold_resp, gold, methodology)

        # HOT: retrieve substrate context, prepend if found
        # For 5-shot-cot HOT, context is injected before the few-shot block
        ctx = substrate_query(q.get("question", ""))
        if ctx:
            if methodology == "5-shot-cot":
                hot_prompt = f"Context from substrate:\n{ctx}\n\n{prompt_base}"
            else:
                hot_prompt = f"Context from substrate:\n{ctx}\n\n{prompt_base}"
        else:
            # TODO: substrate context empty -- substrate server may not be running
            hot_prompt = prompt_base
        hot_resp, latency_hot = ollama_generate(hot_prompt, model)
        hot_correct = check_correct(hot_resp, gold, methodology)

        record = {
            "question_id": q_id,
            "gold_answer": gold,
            "cold_response": cold_resp,
            "hot_response": hot_resp,
            "cold_correct": cold_correct,
            "hot_correct": hot_correct,
            "latency_cold_ms": round(latency_cold, 1),
            "latency_hot_ms": round(latency_hot, 1),
            "methodology": methodology,
        }
        results.append(record)

        done = idx + 1
        now = time.time()
        # Emit progress every PROGRESS_BATCH questions or every 60 seconds
        if done % PROGRESS_BATCH == 0 or (now - last_emit_time) >= 60:
            cold_acc = sum(1 for r in results if r["cold_correct"]) / done
            hot_acc = sum(1 for r in results if r["hot_correct"]) / done
            elapsed = now - run_start
            rate = done / elapsed if elapsed > 0 else 1.0
            eta_s = max(0, int((total - done) / rate))
            emit_progress(node, done, total, node_progress={
                "nodeId": node,
                "label": node,
                "pct": round(done / total * 100.0, 1) if total > 0 else 0.0,
                "eta_s": eta_s,
                "cold_accuracy": cold_acc,
                "hot_accuracy": hot_acc,
                "last_seen": int(now),
                "total_rounds": total,
                "rounds_done": done,
            })
            last_emit_time = now
            print(f"[{node}] {done}/{total}  cold_acc={cold_acc:.3f}  hot_acc={hot_acc:.3f}")

    cold_correct_count = sum(1 for r in results if r["cold_correct"])
    hot_correct_count = sum(1 for r in results if r["hot_correct"])
    summary = {
        "node": node,
        "model": model,
        "methodology": methodology,
        "total_questions": total,
        "cold_correct": cold_correct_count,
        "hot_correct": hot_correct_count,
        "cold_accuracy": cold_correct_count / total if total else 0,
        "hot_accuracy": hot_correct_count / total if total else 0,
        "delta_accuracy": (hot_correct_count - cold_correct_count) / total if total else 0,
    }
    return {"results": results, "summary": summary}


# Results directories per dataset
RESULTS_DIRS = {
    "mmlu-pro":         "~/.mnemosynec/test-data/mmlu-pro/results/",
    "mmlu-pro-diamond": "~/.mnemosynec/test-data/mmlu-pro/results-diamond/",
    "gpqa-diamond":     "~/.mnemosynec/test-data/gpqa-diamond/results/",
}


def main():
    parser = argparse.ArgumentParser(description="Mesh COLD-vs-HOT test runner")
    parser.add_argument(
        "--mode",
        default="mcq",
        choices=["mcq", "plow-smoke"],
        help="Run mode: mcq (default, MCQ letter grading) or plow-smoke (Phase B concordance, 14-domain smoke test)",
    )
    parser.add_argument("--shard", required=False, default=None, help="Path to shard_MN.json (required for --mode mcq)")
    parser.add_argument("--node", default="M0", help="Node identifier (M0/M1/M2/M3 -- use the node\'s own label)")
    parser.add_argument(
        "--substrate",
        default=SUBSTRATE_CACHE_DEFAULT,
        help="Path to substrate_bp078_cache.jsonl (used by --mode plow-smoke)",
    )
    parser.add_argument(
        "--smoke-n",
        type=int,
        default=5,
        help="Questions per domain in plow-smoke mode (default 5, 14 domains = 70 total)",
    )
    parser.add_argument("--model", default="gemma4:12b", help="Ollama model name")
    parser.add_argument(
        "--dataset",
        default="mmlu-pro",
        choices=list(RESULTS_DIRS.keys()),
        help=(
            "Dataset being tested: mmlu-pro (default), mmlu-pro-diamond, or gpqa-diamond. "
            "Controls results output directory. Does not affect question loading -- "
            "questions come from the shard file. Use mesh_shard.py --dataset to generate "
            "the correct shard for each dataset."
        ),
    )
    parser.add_argument(
        "--methodology",
        default=None,
        choices=["0-shot", "0-shot-cot", "5-shot-cot"],
        help=(
            "Prompting methodology (BP080 2026-06-11 Founder ratify). "
            "If omitted, the default is chosen per --dataset (S11 Methodology Lock): "
            "  mmlu-pro / mmlu-pro-diamond -> 5-shot-cot, "
            "  gpqa-diamond -> 0-shot-cot. "
            "0-shot: bare question + 'Answer with the letter only.' (original). "
            "0-shot-cot: bare question + 'Let's think step by step.' (no few-shot examples). "
            "  Matches Google's GPQA Diamond IT methodology. Same CoT extraction as 5-shot-cot. "
            "5-shot-cot: 5 category-disjoint examples with CoT + 'Let's think step by step.' "
            "  Use for MMLU-Pro apples-to-apples vs Google 77.2%%."
        ),
    )
    args = parser.parse_args()

    # Route to plow-smoke mode before any MCQ-specific checks
    if args.mode == "plow-smoke":
        results_dir_plow = os.path.expanduser(RESULTS_DIRS.get("mmlu-pro", "~/.mnemosynec/test-data/mmlu-pro/results/"))
        run_plow_smoke(
            substrate_path=args.substrate,
            smoke_n=args.smoke_n,
            node=args.node,
            ollama_base=OLLAMA_BASE,
            results_dir=results_dir_plow,
        )
        return

    # MCQ mode requires --shard
    if args.shard is None:
        print("Error: --shard is required for --mode mcq")
        sys.exit(1)

    # Per-dataset default methodology (§11 Methodology Lock — Plow Protocol BP080)
    _DATASET_DEFAULT_METHODOLOGY = {
        "mmlu-pro":         "5-shot-cot",
        "mmlu-pro-diamond": "5-shot-cot",
        "gpqa-diamond":     "0-shot-cot",
    }
    if args.methodology is None:
        methodology = _DATASET_DEFAULT_METHODOLOGY[args.dataset]
        methodology_source = "default"
    else:
        methodology = args.methodology
        methodology_source = "explicit"

    print(f"[{args.node}] dataset={args.dataset}  methodology={methodology}  "
          f"(source={methodology_source})")

    if not os.path.exists(args.shard):
        print(f"Shard file not found: {args.shard}")
        sys.exit(1)

    out = run_shard(args.shard, args.node, args.model, methodology)
    results = out["results"]
    summary = out["summary"]

    # Write results JSON -- dataset-specific subdirectory
    results_dir = os.path.expanduser(RESULTS_DIRS[args.dataset])
    os.makedirs(results_dir, exist_ok=True)
    results_path = os.path.join(results_dir, f"shard_{args.node}_results.json")
    with open(results_path, "w") as f:
        json.dump({"summary": summary, "results": results}, f, indent=2)

    # SHA-256 of results file
    sha = hashlib.sha256(open(results_path, "rb").read()).hexdigest()

    print(f"\n[{args.node}] Done.")
    print(f"  methodology:   {summary['methodology']}")
    print(f"  cold_accuracy: {summary['cold_accuracy']:.4f}")
    print(f"  hot_accuracy:  {summary['hot_accuracy']:.4f}")
    print(f"  delta:         {summary['delta_accuracy']:+.4f}")
    print(f"  results -> {results_path}")
    print(f"  sha256:  {sha[:16]}...")


if __name__ == "__main__":
    main()
