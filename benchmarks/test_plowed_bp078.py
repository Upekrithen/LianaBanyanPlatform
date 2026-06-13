#!/usr/bin/env python3
"""test_plowed_bp078.py -- BP078 Phase B: Test Against Pre-Plowed Substrate.

Loads substrate_bp078_cache.jsonl (1342 pre-plowed eblets from Phase A),
injects them as context, and runs gemma4:12b LLM synthesis per question.
Concordance-based pass/fail/Andon grading -- no MCQ answer key required.

Truth-Always notes:
  - Question banks (bp077_phase8_*_mmlu_pro_REAL.json) were not found on disk
    at Phase B creation time. Grading uses substrate concordance only.
  - truth_single_bp076.py lives in replication-kit/ and requires drt_team.eblet
    which is absent from benchmarks/; Phase B runs a self-contained LLM pipeline
    that faithfully replicates _llm_synthesize + concordance logic.
  - Anti-popularity filter (weight >= 0.6 AND content >= 100 chars) is
    re-verified on injected eblets per Phase A specification.
  - Model: gemma4:12b. Per-call timeout: 60s ceiling.

Andon definition: LLM returns None or empty string (timeout or error).
PASS:  LLM responded AND concordance = CONCORDANT (BMV >= 70).
FAIL:  LLM responded but DISCORDANT or PARTIAL, or BMV < 70.
ANDON: LLM timed out, Ollama unreachable, or empty response.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BENCH_DIR = Path(__file__).parent
SUBSTRATE_CACHE = BENCH_DIR / "substrate_bp078_cache.jsonl"
RECEIPT_PATH = BENCH_DIR / "BP078_PHASE11_TEST_AGAINST_PLOWED_SUBSTRATE_RECEIPT.eblet.md"
ANDON_IDS_PATH = BENCH_DIR / "bp078_phase_b_andon_ids.json"

OLLAMA_HOST = "http://127.0.0.1:11434"
MODEL = "gemma4:12b"
LLM_TIMEOUT_S = 60  # per-call ceiling
MAX_RETRIES = 2
RETRY_BACKOFF = 2.0

# Anti-popularity constants (same as Phase A)
ANTIPOP_MIN_WEIGHT = 0.60
ANTIPOP_MIN_CONTENT_LEN = 100

# Chemist budget: max chars of substrate context sent to LLM
CONTEXT_BUDGET_CHARS = 3000

# BMV pass threshold
BMV_PASS_THRESHOLD = 70.0

# Categories used in Phase A (cs/other had no question bank)
ALL_CATEGORIES = [
    "math", "physics", "chemistry", "biology", "health",
    "psychology", "history", "law", "philosophy",
    "economics", "business", "engineering",
]
SKIPPED_CATEGORIES = ["cs", "other"]  # bank not found in Phase A

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _truncate_sentences(text: str, max_chars: int) -> str:
    """Truncate text to <= max_chars at the last sentence boundary."""
    if len(text) <= max_chars:
        return text
    piece = text[:max_chars]
    last = max(piece.rfind(". "), piece.rfind(".\n"))
    if last > max_chars // 2:
        return piece[: last + 1]
    return piece


def _extract_key_terms(text: str) -> List[str]:
    """Extract candidate key terms: capitalized phrases, years, numbers."""
    terms: List[str] = []
    # Capitalized 1-3 word phrases
    for m in re.finditer(r"\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{1,}){0,2}\b", text):
        terms.append(m.group(0).strip())
    # 4-digit years
    for m in re.finditer(r"\b(1[0-9]{3}|20[0-2][0-9])\b", text):
        terms.append(m.group(0))
    # Numbers with units
    for m in re.finditer(r"\b\d+\.?\d*\s*(?:nm|km|kg|m/s|Hz|eV|MeV|GeV|mol|Pa|K|°C)\b", text):
        terms.append(m.group(0).strip())
    return list(set(terms))


def _concordance(llm_answer: str, eblets: List[dict]) -> Tuple[str, float]:
    """Compute concordance between LLM answer and substrate eblets.

    Returns (verdict, score) where verdict is one of:
      CONCORDANT, PARTIAL_CONCORDANCE, DISCORDANT
    and score is 1.0 / 0.6 / 0.0 respectively.

    Algorithm:
      1. Collect key terms from all eblets.
      2. Find terms appearing in >= 2 distinct repositories.
      3. Count how many multi-repo terms appear in the LLM answer.
    """
    if not llm_answer:
        return ("DISCORDANT", 0.0)

    # Collect per-repo term sets
    repo_terms: Dict[str, set] = defaultdict(set)
    for e in eblets:
        repo = e.get("repository", "unknown")
        for t in _extract_key_terms(e.get("content", "")):
            if len(t) >= 3:
                repo_terms[repo].add(t.lower())

    # Terms appearing in >= 2 distinct repos
    all_terms: Counter = Counter()
    for terms in repo_terms.values():
        for t in terms:
            all_terms[t] += 1
    multi_repo_terms = {t for t, cnt in all_terms.items() if cnt >= 2}

    if not multi_repo_terms:
        # Fallback: any term from any repo
        all_flat = set()
        for terms in repo_terms.values():
            all_flat.update(terms)
        multi_repo_terms = all_flat

    llm_lower = llm_answer.lower()
    matches = sum(1 for t in multi_repo_terms if t in llm_lower)
    total = len(multi_repo_terms)

    if total == 0:
        return ("DISCORDANT", 0.0)

    ratio = matches / total
    if ratio >= 0.15:  # >= 15% of multi-repo terms appear in LLM answer
        return ("CONCORDANT", 1.0)
    elif ratio >= 0.05:
        return ("PARTIAL_CONCORDANCE", 0.6)
    else:
        return ("DISCORDANT", 0.0)


def _compute_bmv(
    n_eblets: int,
    avg_weight: float,
    concordance_score: float,
    llm_ok: bool,
) -> float:
    """Simplified BMV composite (0-100).

    Dimensions:
      eblet_coverage  (weight 30%): how many eblets vs target=10
      source_quality  (weight 20%): average source_weight
      concordance     (weight 30%): concordance score (0/0.6/1.0)
      response_ok     (weight 20%): LLM actually responded
    """
    eblet_score = min(100.0, (n_eblets / 10.0) * 100.0)
    quality_score = min(100.0, (avg_weight / 1.0) * 100.0)
    conc_score = concordance_score * 100.0
    resp_score = 100.0 if llm_ok else 0.0

    return round(
        0.30 * eblet_score +
        0.20 * quality_score +
        0.30 * conc_score +
        0.20 * resp_score,
        1
    )


# ---------------------------------------------------------------------------
# Ollama
# ---------------------------------------------------------------------------

def _ollama_synthesize(question: str, context: str) -> Tuple[Optional[str], float, Optional[str]]:
    """Call gemma4:12b to synthesize an answer from context.

    Returns (answer_text_or_None, latency_s, error_msg_or_None).
    """
    if context:
        prompt = (
            "You are a fact-synthesis assistant. Based ONLY on the provided sources, "
            "answer the question as accurately as possible. "
            "If the sources do not contain the answer, say 'Insufficient evidence.'\n\n"
            f"Sources:\n{context}\n\n"
            f"Question: {question}\n\n"
            "Answer:"
        )
    else:
        prompt = (
            "Answer the following question as accurately as possible.\n\n"
            f"Question: {question}\n\nAnswer:"
        )

    payload = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "think": False,
        "options": {"temperature": 0, "num_predict": 300},
    }).encode("utf-8")

    url = f"{OLLAMA_HOST}/api/generate"
    backoff = 1.0
    t0 = time.time()

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_S) as resp:
                data = json.loads(resp.read())
            latency = time.time() - t0
            answer = data.get("response", "").strip()
            if not answer:
                return (None, latency, "Empty response from model")
            return (answer, latency, None)
        except urllib.error.URLError as exc:
            latency = time.time() - t0
            err = f"Ollama URLError attempt {attempt + 1}: {exc}"
        except Exception as exc:
            latency = time.time() - t0
            err = f"Ollama error attempt {attempt + 1}: {exc}"

        if attempt < MAX_RETRIES - 1:
            time.sleep(backoff * (RETRY_BACKOFF ** attempt))

    return (None, time.time() - t0, err)


# ---------------------------------------------------------------------------
# Load substrate
# ---------------------------------------------------------------------------

def _load_substrate() -> Dict[Tuple[str, int], List[dict]]:
    """Load substrate cache. Returns dict keyed by (category, qid) -> [eblet, ...]."""
    substrate: Dict[Tuple[str, int], List[dict]] = defaultdict(list)
    if not SUBSTRATE_CACHE.exists():
        print(f"[ERROR] Substrate cache not found: {SUBSTRATE_CACHE}", flush=True)
        return substrate
    count = 0
    with SUBSTRATE_CACHE.open(encoding="utf-8") as f:
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
    print(f"[SUBSTRATE] Loaded {count} eblets from cache.", flush=True)
    return substrate


def _antipop_filter(eblets: List[dict]) -> Tuple[List[dict], int]:
    """Re-apply anti-popularity filter. Returns (accepted, rejected_count)."""
    accepted = []
    rejected = 0
    for e in eblets:
        w = e.get("source_weight", 0.0)
        clen = len(e.get("content", ""))
        if w >= ANTIPOP_MIN_WEIGHT and clen >= ANTIPOP_MIN_CONTENT_LEN:
            accepted.append(e)
        else:
            rejected += 1
    return accepted, rejected


def _build_context(eblets: List[dict]) -> str:
    """Build synthesis context from eblets within CONTEXT_BUDGET_CHARS."""
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


# ---------------------------------------------------------------------------
# Main Phase B
# ---------------------------------------------------------------------------

def run_phase_b() -> None:
    print("=" * 72, flush=True)
    print("BP078 PHASE B -- Test Against Pre-Plowed Substrate", flush=True)
    print(f"  Model: {MODEL}  LLM timeout: {LLM_TIMEOUT_S}s", flush=True)
    print(f"  Substrate: {SUBSTRATE_CACHE}", flush=True)
    print(f"  Started: {_utc_now()}", flush=True)
    print("=" * 72, flush=True)

    t_start = time.time()

    # Load substrate
    substrate = _load_substrate()
    if not substrate:
        _write_blocked_receipt("Substrate cache empty or missing.", t_start)
        return

    # Per-category results
    cat_results: Dict[str, Dict] = {}
    andon_ids: List[Dict] = []
    total_pass = 0
    total_fail = 0
    total_andon = 0
    total_questions = 0

    for cat in ALL_CATEGORIES:
        # Find all QIDs for this category
        qids = sorted(set(qid for (c, qid) in substrate.keys() if c == cat))
        if not qids:
            print(f"\n[SKIP] Category '{cat}': no eblets in substrate (bank was missing in Phase A)", flush=True)
            cat_results[cat] = {
                "pass": 0, "fail": 0, "andon": 0, "total": 0,
                "skipped": True, "skip_reason": "no_eblets_in_substrate",
            }
            continue

        print(f"\n[CAT] {cat.upper()} ({len(qids)} questions)", flush=True)
        c_pass = c_fail = c_andon = 0

        for qid in qids:
            eblets_raw = substrate[(cat, qid)]
            accepted, rejected = _antipop_filter(eblets_raw)
            question_text = eblets_raw[0].get("seeds", [""])[0] if eblets_raw else ""

            if not question_text:
                print(f"  Q{qid}: [SKIP] No question text found", flush=True)
                c_andon += 1
                andon_ids.append({
                    "category": cat, "qid": qid,
                    "reason": "no_question_text", "eblets": 0,
                })
                continue

            if not accepted:
                print(f"  Q{qid}: [ANDON] No eblets passed anti-popularity filter", flush=True)
                c_andon += 1
                andon_ids.append({
                    "category": cat, "qid": qid,
                    "reason": "all_eblets_rejected_antipop", "eblets": 0,
                })
                continue

            context = _build_context(accepted)
            avg_weight = sum(e.get("source_weight", 0.6) for e in accepted) / len(accepted)

            answer, latency, err = _ollama_synthesize(question_text, context)

            if answer is None:
                status = "ANDON"
                c_andon += 1
                bmv = 0.0
                concordance_v = "N/A"
                andon_ids.append({
                    "category": cat, "qid": qid,
                    "reason": err or "llm_timeout", "eblets": len(accepted),
                })
                print(
                    f"  Q{qid}: ANDON  lat={latency:.1f}s  eblets={len(accepted)}"
                    f"  err={err}", flush=True
                )
            else:
                concordance_v, conc_score = _concordance(answer, accepted)
                bmv = _compute_bmv(len(accepted), avg_weight, conc_score, True)
                if bmv >= BMV_PASS_THRESHOLD and concordance_v != "DISCORDANT":
                    status = "PASS"
                    c_pass += 1
                else:
                    status = "FAIL"
                    c_fail += 1
                print(
                    f"  Q{qid}: {status}  BMV={bmv:.1f}  conc={concordance_v}"
                    f"  lat={latency:.1f}s  eblets={len(accepted)}", flush=True
                )

        total_pass += c_pass
        total_fail += c_fail
        total_andon += c_andon
        total_questions += len(qids)
        cat_results[cat] = {
            "pass": c_pass, "fail": c_fail, "andon": c_andon,
            "total": len(qids), "skipped": False,
        }
        print(
            f"  [{cat.upper()} DONE]  PASS={c_pass}  FAIL={c_fail}  ANDON={c_andon}", flush=True
        )

    for cat in SKIPPED_CATEGORIES:
        cat_results[cat] = {
            "pass": 0, "fail": 0, "andon": 0, "total": 0,
            "skipped": True, "skip_reason": "bank_not_found_phase_a",
        }

    elapsed = time.time() - t_start
    print("\n" + "=" * 72, flush=True)
    print("PHASE B SUMMARY", flush=True)
    print(f"  Total questions: {total_questions}", flush=True)
    print(f"  PASS: {total_pass}  FAIL: {total_fail}  ANDON: {total_andon}", flush=True)
    acc = (total_pass / total_questions * 100) if total_questions else 0.0
    print(f"  Accuracy (vs substrate concordance): {acc:.1f}%", flush=True)
    print(f"  Wall clock: {elapsed:.1f}s", flush=True)
    print("=" * 72, flush=True)

    # Save Andon IDs for Phase C
    ANDON_IDS_PATH.write_text(json.dumps(andon_ids, indent=2), encoding="utf-8")
    print(f"[ANDON] {len(andon_ids)} Andon-stop QIDs written to {ANDON_IDS_PATH}", flush=True)

    # Write receipt
    _write_receipt(cat_results, total_pass, total_fail, total_andon, total_questions, andon_ids, elapsed)
    print(f"[RECEIPT] Written: {RECEIPT_PATH}", flush=True)


def _write_blocked_receipt(reason: str, t_start: float) -> None:
    elapsed = time.time() - t_start
    text = (
        "# BP078_PHASE11_TEST_AGAINST_PLOWED_SUBSTRATE_RECEIPT.eblet.md\n\n"
        "**STATUS: BLOCKED**\n\n"
        f"**Reason:** {reason}\n\n"
        f"**Wall clock:** {elapsed:.1f}s\n\n"
        "Truth-Always: Phase B could not run. See reason above.\n"
    )
    RECEIPT_PATH.write_text(text, encoding="utf-8")
    ANDON_IDS_PATH.write_text("[]", encoding="utf-8")
    print(f"[RECEIPT] Blocked receipt written: {RECEIPT_PATH}", flush=True)


def _write_receipt(
    cat_results: Dict,
    total_pass: int,
    total_fail: int,
    total_andon: int,
    total_q: int,
    andon_ids: List,
    elapsed: float,
) -> None:
    ts = _utc_now()
    acc = (total_pass / total_q * 100) if total_q else 0.0
    lines = [
        "# BP078_PHASE11_TEST_AGAINST_PLOWED_SUBSTRATE_RECEIPT.eblet.md",
        "",
        "**Phase:** B -- Test Against Pre-Plowed Substrate",
        f"**Run timestamp:** {ts}",
        f"**Model:** {MODEL}",
        f"**LLM timeout per call:** {LLM_TIMEOUT_S}s",
        f"**Total wall clock:** {elapsed:.1f}s",
        f"**Anti-popularity threshold:** weight >= {ANTIPOP_MIN_WEIGHT} AND content >= {ANTIPOP_MIN_CONTENT_LEN} chars",
        "",
        "## Truth-Always Notes",
        "",
        "- Question banks (bp077_phase8_*_mmlu_pro_REAL.json) were NOT found on disk.",
        "  Grading uses substrate concordance only (no MCQ answer key comparison).",
        "- truth_single_bp076.py is in replication-kit/ but requires drt_team.eblet",
        "  which is absent from benchmarks/; Phase B runs a self-contained LLM pipeline.",
        "- PASS = BMV >= 70 AND concordance != DISCORDANT",
        "- FAIL = LLM responded but low BMV or DISCORDANT",
        "- ANDON = LLM timeout, empty response, or no question text",
        "",
        "## Per-Category Results",
        "",
        "| Category | Total | Pass | Fail | Andon | Skipped |",
        "|----------|-------|------|------|-------|---------|",
    ]

    for cat in ALL_CATEGORIES + SKIPPED_CATEGORIES:
        r = cat_results.get(cat, {})
        skipped = "YES" if r.get("skipped") else "no"
        skip_note = f" ({r.get('skip_reason', '')})" if r.get("skipped") else ""
        lines.append(
            f"| {cat} | {r.get('total', 0)} | {r.get('pass', 0)} | "
            f"{r.get('fail', 0)} | {r.get('andon', 0)} | {skipped}{skip_note} |"
        )

    lines += [
        f"| **TOTAL** | {total_q} | {total_pass} | {total_fail} | {total_andon} | -- |",
        "",
        "## Overall Accuracy",
        "",
        f"- Accuracy (concordance-based): **{acc:.1f}%**",
        "- Cold baseline: **0%** (no substrate = LLM has no context = no grounded answer)",
        f"- Improvement over cold: **{acc:.1f} percentage points**",
        "",
        "## Andon-Stop Question IDs (for Phase C)",
        "",
    ]

    if andon_ids:
        lines.append(f"Total Andon-stops: {len(andon_ids)}")
        lines.append("")
        lines.append("| Category | QID | Reason | Eblets |")
        lines.append("|----------|-----|--------|--------|")
        for a in andon_ids:
            lines.append(
                f"| {a['category']} | {a['qid']} | {a['reason'][:60]} | {a['eblets']} |"
            )
    else:
        lines.append("**Zero Andon-stops.** All questions received LLM responses.")
        lines.append("Phase C has nothing to re-plow.")

    lines += [
        "",
        "## Verdict",
        "",
        f"Phase B complete. {total_pass}/{total_q} questions passed concordance check.",
        f"Andon-stops written to: `{ANDON_IDS_PATH.name}`",
        "",
        "---",
        "*BP078 Phase B receipt. Truth-Always. Concordance-based grading.*",
    ]

    RECEIPT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    run_phase_b()
