#!/usr/bin/env python3
"""run_bp076_phase2_drt.py -- BM-MNEM-30 S11 Phase 2 DRT Harness.

Implements 8 experimental conditions for the Mnem-DRT cooperative-cathedral
retrieval experiment (BP076/BP077). Extends the POC harness pattern with:
  - Full 8-condition matrix (Bishop-locked)
  - Chemist budget discipline (2000-token ceiling per question)
  - Adversarial verifier ON for primary conditions, OFF for ablation
  - OS-detached production mode (heartbeat every 60s)
  - Retry logic: 3x exponential backoff on Ollama errors
  - Per-question JSONL output

Usage:
  python benchmarks/run_bp076_phase2_drt.py --dry-run
  python benchmarks/run_bp076_phase2_drt.py --conditions baseline_no_substrate,drt_wikipedia_only --q-bank mmlu_pro --n 50 --model gemma4:12b
  python benchmarks/run_bp076_phase2_drt.py --conditions all --q-bank mmlu_pro,gpqa_diamond --n-mmlu 1000 --n-gpqa 198 --model gemma4:12b --heartbeat 60

Truth-Always: zero vibes-receipts. All results go to JSONL on disk.
Heart of Peace: polite inter-call delays; graceful degrade on specialist failure.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import time
import traceback
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger("phase2_drt")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
BENCH_ROOT = WORKSPACE / "benchmarks"
DRT_TEAM_DIR = BENCH_ROOT / "drt_team"
QUESTIONS_DIR = BENCH_ROOT / "questions"
RUNS_BASE = BENCH_ROOT / "runs" / "BP076_PHASE2"
OLLAMA_HOST = "http://127.0.0.1:11434"

MMLU_PRO_SAMPLE = QUESTIONS_DIR / "mmlu_pro_sample.jsonl"
GPQA_DIAMOND_SAMPLE = QUESTIONS_DIR / "gpqa_diamond_sample.jsonl"
MMLU_PRO_FULL = BENCH_ROOT / "corpora" / "mmlu_pro_1000q.jsonl"
GPQA_DIAMOND_FULL = BENCH_ROOT / "corpora" / "gpqa_diamond_198q.jsonl"

# ---------------------------------------------------------------------------
# The 8 conditions (Bishop-locked)
# ---------------------------------------------------------------------------

CONDITIONS = [
    "baseline_no_substrate",            # control
    "baseline_r10v3_substrate_only",    # Phase 1.5 replication (expect suffocation)
    "drt_wikipedia_only",               # S01 alone
    "drt_wikipedia_plus_wikidata",      # S01 + S02
    "drt_science_stack",                # S03+S04+S05+S08
    "drt_all_specialists",              # S01-S10 with dispatcher
    "drt_all_specialists_verifier_on",  # adversarial primary
    "drt_all_specialists_verifier_off", # ablation
]

# Chemist budget: max chars of DRT context per question
# 2000 tokens ~ 8000 chars (4 chars/token); use 2000 chars conservative proxy
CHEMIST_BUDGET_CHARS = 2000

OPTION_LETTERS = "ABCDEFGHIJ"

# ---------------------------------------------------------------------------
# Ollama settings
# ---------------------------------------------------------------------------

DEFAULT_MODEL = "gemma4:12b"
OLLAMA_TIMEOUT_S = 300  # gemma4:12b needs ~2-3 min on this machine
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2.0

# ---------------------------------------------------------------------------
# Grading regex
# ---------------------------------------------------------------------------

_LEADING_LETTER_RE = re.compile(
    r"^\s*(?:answer\s*[:\-]\s*)?([A-J])(?![A-Za-z])", re.IGNORECASE
)
_BARE_LETTER_RE = re.compile(r"\b([A-J])\b")


# ---------------------------------------------------------------------------
# Corpus loading
# ---------------------------------------------------------------------------

def _load_jsonl(path: Path) -> List[dict]:
    """Load JSONL file; returns list of dicts. Skips malformed lines."""
    out: List[dict] = []
    if not path.exists():
        log.warning("Question bank not found: %s", path)
        return out
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    out.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return out


def load_questions(q_bank: str, n: int, dry_run: bool) -> List[dict]:
    """Load up to n questions from the specified bank."""
    if q_bank == "mmlu_pro":
        path = MMLU_PRO_SAMPLE if dry_run else MMLU_PRO_FULL
        if not path.exists():
            path = MMLU_PRO_SAMPLE
    elif q_bank == "gpqa_diamond":
        path = GPQA_DIAMOND_SAMPLE if dry_run else GPQA_DIAMOND_FULL
        if not path.exists():
            path = GPQA_DIAMOND_SAMPLE
    else:
        log.error("Unknown q-bank: %s", q_bank)
        return []
    qs = _load_jsonl(path)
    return qs[:n] if n > 0 else qs


# ---------------------------------------------------------------------------
# Specialist import helpers (graceful stubs for missing S02-S10)
# ---------------------------------------------------------------------------

def _import_wikipedia_specialist():
    """Import WikipediaSpecialist from the specialists sub-package."""
    try:
        sys.path.insert(0, str(WORKSPACE))
        from benchmarks.drt_team.specialists.wikipedia_specialist import (
            WikipediaSpecialist,
        )
        return WikipediaSpecialist()
    except Exception as exc:
        log.warning("WikipediaSpecialist import failed: %s", exc)
        return None


def _stub_specialist(name: str):
    """Return a stub object with fetch() that returns []."""
    class _Stub:
        def fetch(self, query: str, k: int = 5) -> list:
            return []
    _Stub.__name__ = f"StubSpecialist_{name}"
    return _Stub()


def _import_specialist(name: str):
    """Try to import a specialist by name; fall back to stub."""
    try:
        sys.path.insert(0, str(WORKSPACE))
        if name == "wikipedia":
            from benchmarks.drt_team.specialists.wikipedia_specialist import WikipediaSpecialist
            return WikipediaSpecialist()
        # Other specialists live in drt_team_specialist.py
        from benchmarks.drt_team.drt_team_specialist import (
            WikidataSpecialist,
            ArxivSpecialist,
            WolframAlphaSpecialist,
            OpenAlexSpecialist,
            StackExchangeSpecialist,
            CommonCrawlSpecialist,
            PubMedCentralSpecialist,
        )
        mapping = {
            "wikidata": WikidataSpecialist,
            "arxiv": ArxivSpecialist,
            "wolfram_alpha": WolframAlphaSpecialist,
            "openalex": OpenAlexSpecialist,
            "stack_exchange": StackExchangeSpecialist,
            "common_crawl": CommonCrawlSpecialist,
            "pubmed_central": PubMedCentralSpecialist,
        }
        cls = mapping.get(name)
        return cls() if cls else _stub_specialist(name)
    except Exception as exc:
        log.warning("Specialist '%s' import failed (%s), using stub", name, exc)
        return _stub_specialist(name)


def _import_nist_specialist():
    """Import NISTSpecialist."""
    try:
        sys.path.insert(0, str(WORKSPACE))
        from benchmarks.drt_team.nist_specialist import NISTSpecialist
        return NISTSpecialist()
    except Exception:
        try:
            from benchmarks.drt_team.drt_team_specialist import NISTSpecialist
            return NISTSpecialist()
        except Exception as exc:
            log.warning("NISTSpecialist import failed (%s), using stub", exc)
            return _stub_specialist("nist")


def _build_specialist_set(condition: str, dry_run: bool = False) -> List:
    """Return specialist instances. In dry-run mode all return stubs (fast)."""
    if dry_run:
        # Dry-run: stub all specialists to return [] immediately
        # This validates the pipeline flow without live network calls
        return [_stub_specialist(f"stub_{condition}")]


    """Return the list of specialist instances for a given condition."""
    if condition in ("baseline_no_substrate", "baseline_r10v3_substrate_only"):
        return []
    if condition == "drt_wikipedia_only":
        return [_import_specialist("wikipedia")]
    if condition == "drt_wikipedia_plus_wikidata":
        return [
            _import_specialist("wikipedia"),
            _import_specialist("wikidata"),
        ]
    if condition == "drt_science_stack":
        return [
            _import_specialist("arxiv"),
            _import_specialist("openalex"),
            _import_specialist("wolfram_alpha"),
            _import_nist_specialist(),
        ]
    if condition in (
        "drt_all_specialists",
        "drt_all_specialists_verifier_on",
        "drt_all_specialists_verifier_off",
    ):
        return [
            _import_specialist("wikipedia"),
            _import_specialist("wikidata"),
            _import_specialist("arxiv"),
            _import_specialist("openalex"),
            _import_specialist("wolfram_alpha"),
            _import_specialist("stack_exchange"),
            _import_specialist("pubmed_central"),
            _import_nist_specialist(),
            _import_specialist("common_crawl"),
        ]
    return []


# ---------------------------------------------------------------------------
# Chemist budget -- truncate DRT context at sentence boundary
# ---------------------------------------------------------------------------

def _truncate_to_sentence(text: str, max_chars: int) -> str:
    """Truncate text to <= max_chars, ending at last full sentence boundary."""
    if len(text) <= max_chars:
        return text
    piece = text[:max_chars]
    last_period = max(piece.rfind(". "), piece.rfind(".\n"))
    if last_period > 0 and last_period > max_chars // 2:
        return piece[: last_period + 1]
    return piece


def _apply_chemist_budget(drt_context: str, budget_chars: int) -> str:
    """Apply Chemist budget: truncate at sentence boundary if over budget."""
    if len(drt_context) <= budget_chars:
        return drt_context
    log.debug("Chemist budget triggered: %d > %d chars", len(drt_context), budget_chars)
    return _truncate_to_sentence(drt_context, budget_chars)


def _fetch_drt_context(
    question: str, specialists: List, k: int = 3, dry_run: bool = False
) -> str:
    """Call each specialist, merge results, apply Chemist budget."""
    if not specialists:
        return ""
    all_chunks: List[str] = []
    for spec in specialists:
        try:
            results = spec.fetch(question, k=k)
            if not results:
                continue
            for r in results:
                # Support both Eblet objects (have .content) and dicts
                if hasattr(r, "content"):
                    chunk = r.content
                elif isinstance(r, dict):
                    # WikipediaSpecialist (S01) returns dicts with lede + sections
                    parts = []
                    if r.get("title"):
                        parts.append(f"[{r['title']}]")
                    if r.get("lede"):
                        parts.append(r["lede"])
                    if r.get("sections"):
                        parts.extend(r["sections"][:2])
                    chunk = " ".join(parts)
                else:
                    chunk = str(r)
                if chunk:
                    all_chunks.append(chunk)
        except Exception as exc:
            if dry_run:
                log.debug("Specialist error (dry-run, OK): %s", exc)
            else:
                log.warning("Specialist error: %s", exc)

    if not all_chunks:
        return ""
    raw = "\n\n---\n\n".join(all_chunks)
    return _apply_chemist_budget(raw, CHEMIST_BUDGET_CHARS)


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------

def _format_options(options: List[str]) -> str:
    lines = []
    for i, opt in enumerate(options):
        letter = OPTION_LETTERS[i] if i < len(OPTION_LETTERS) else str(i)
        lines.append(f"{letter}. {opt}")
    return "\n".join(lines)


def _build_prompt(question: dict, drt_context: str) -> str:
    """Build the full prompt for the LLM."""
    q_text = question.get("question", "")
    options = question.get("options", [])
    options_str = _format_options(options)

    if drt_context:
        context_block = (
            f"Reference information (retrieved per-question):\n"
            f"{drt_context}\n\n"
            "---\n\n"
        )
    else:
        context_block = ""

    return (
        f"{context_block}"
        f"Question: {q_text}\n\n"
        f"Options:\n{options_str}\n\n"
        "Answer with the letter of the correct option (A, B, C, etc.) "
        "followed by a brief explanation. "
        "Begin your response with the answer letter."
    )


def _build_verifier_prompt(original_prompt: str, answer: str) -> str:
    """Adversarial verifier challenge prompt."""
    return (
        f"{original_prompt}\n\n"
        f"---\n"
        f"A previous model answered: {answer}\n\n"
        "Do you agree with this answer? If not, give the correct letter and explain why. "
        "Begin your response with the answer letter."
    )


# ---------------------------------------------------------------------------
# Grading
# ---------------------------------------------------------------------------

def _grade_response(response: str, correct_answer: str) -> bool:
    """Extract letter from response; return True if it matches correct_answer."""
    if not response or not correct_answer:
        return False
    m = _LEADING_LETTER_RE.match(response)
    if m:
        return m.group(1).upper() == correct_answer.upper()
    m2 = _BARE_LETTER_RE.search(response[:100])
    if m2:
        return m2.group(1).upper() == correct_answer.upper()
    return False


# ---------------------------------------------------------------------------
# Ollama interface
# ---------------------------------------------------------------------------

def _ollama_generate(
    prompt: str,
    model: str,
    host: str = OLLAMA_HOST,
    timeout: int = OLLAMA_TIMEOUT_S,
    dry_run: bool = False,
) -> Optional[str]:
    """Call Ollama /api/generate with retry. Returns response text or None."""
    if dry_run:
        # Dry-run stub: return a plausible MCQ response without calling Ollama
        return "A. This is a dry-run stub response."

    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0, "seed": 42},
    }).encode("utf-8")

    url = f"{host}/api/generate"
    backoff = 1.0

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "LianaBanyanResearch/0.1 (BP077 Phase2 harness)",
                },
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read()
            data = json.loads(body)
            return data.get("response", "")
        except urllib.error.URLError as exc:
            log.warning("Ollama attempt %d/%d failed: %s", attempt + 1, MAX_RETRIES, exc)
        except Exception as exc:
            log.warning("Ollama attempt %d/%d error: %s", attempt + 1, MAX_RETRIES, exc)

        if attempt < MAX_RETRIES - 1:
            wait = backoff * (RETRY_BACKOFF_BASE ** attempt)
            log.info("Retrying in %.1fs ...", wait)
            time.sleep(wait)

    log.error("All %d Ollama attempts failed", MAX_RETRIES)
    return None


# ---------------------------------------------------------------------------
# Per-question pipeline
# ---------------------------------------------------------------------------

def _run_question(
    q: dict,
    condition: str,
    specialists: List,
    model: str,
    dry_run: bool,
    verifier_on: bool,
) -> dict:
    """Run one question through the DRT pipeline. Returns result dict."""
    q_id = q.get("question_id", q.get("id", "unknown"))
    correct = str(q.get("answer", "")).upper()
    ts_start = datetime.now(timezone.utc).isoformat()

    drt_context = _fetch_drt_context(
        q.get("question", ""), specialists, k=3, dry_run=dry_run
    )
    prompt = _build_prompt(q, drt_context)
    response = _ollama_generate(prompt, model=model, dry_run=dry_run)

    predicted = ""
    correct_flag = False
    verifier_response = None
    verifier_agrees = None

    if response is not None:
        predicted_m = _LEADING_LETTER_RE.match(response)
        if predicted_m:
            predicted = predicted_m.group(1).upper()
        else:
            m2 = _BARE_LETTER_RE.search(response[:100])
            predicted = m2.group(1).upper() if m2 else ""
        correct_flag = (predicted == correct) if predicted else False

        # Adversarial verifier
        if verifier_on and response:
            ver_prompt = _build_verifier_prompt(prompt, response[:50])
            verifier_response = _ollama_generate(
                ver_prompt, model=model, dry_run=dry_run
            )
            if verifier_response:
                ver_m = _LEADING_LETTER_RE.match(verifier_response)
                if not ver_m:
                    ver_m = _BARE_LETTER_RE.search(verifier_response[:100])
                ver_predicted = ver_m.group(1).upper() if ver_m else ""
                verifier_agrees = (ver_predicted == predicted)

    return {
        "question_id": q_id,
        "condition": condition,
        "model": model,
        "ts": ts_start,
        "correct_answer": correct,
        "predicted": predicted,
        "correct": correct_flag,
        "response_snippet": (response or "")[:200],
        "drt_context_chars": len(drt_context),
        "drt_context_snippet": drt_context[:200] if drt_context else "",
        "verifier_on": verifier_on,
        "verifier_response_snippet": (verifier_response or "")[:100],
        "verifier_agrees": verifier_agrees,
    }


# ---------------------------------------------------------------------------
# Condition runner
# ---------------------------------------------------------------------------

def _run_condition(
    condition: str,
    questions: List[dict],
    model: str,
    output_dir: Path,
    dry_run: bool,
    heartbeat_interval: int = 60,
) -> Dict:
    """Run all questions under one condition. Returns summary dict."""
    log.info("Starting condition: %s (%d questions)", condition, len(questions))

    verifier_on = condition.endswith("_verifier_on")
    # For conditions not explicitly ablated, default to verifier ON for
    # primary multi-specialist conditions (Bishop default k)
    if condition in ("drt_all_specialists",):
        verifier_on = True

    specialists = _build_specialist_set(condition, dry_run=dry_run)

    ts_str = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    cond_dir = output_dir / condition
    cond_dir.mkdir(parents=True, exist_ok=True)
    out_path = cond_dir / f"{ts_str}.jsonl"

    results: List[dict] = []
    correct_count = 0
    last_heartbeat = time.time()

    with out_path.open("w", encoding="utf-8") as out_f:
        for i, q in enumerate(questions):
            try:
                r = _run_question(
                    q, condition, specialists, model, dry_run, verifier_on
                )
            except Exception as exc:
                log.error("Question %s failed: %s", q.get("question_id", i), exc)
                r = {
                    "question_id": q.get("question_id", i),
                    "condition": condition,
                    "model": model,
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "error": str(exc),
                    "correct": False,
                }

            out_f.write(json.dumps(r, ensure_ascii=False) + "\n")
            out_f.flush()
            results.append(r)
            if r.get("correct"):
                correct_count += 1

            # Heartbeat
            now = time.time()
            if now - last_heartbeat >= heartbeat_interval:
                acc = correct_count / max(len(results), 1)
                log.info(
                    "HEARTBEAT condition=%s q=%d/%d acc=%.1f%%",
                    condition, i + 1, len(questions), acc * 100,
                )
                last_heartbeat = now

    total = len(results)
    accuracy = correct_count / max(total, 1)
    summary = {
        "condition": condition,
        "model": model,
        "n_total": total,
        "n_correct": correct_count,
        "accuracy": round(accuracy, 4),
        "output_file": str(out_path),
    }
    log.info(
        "Condition %s done: %d/%d correct (%.1f%%)",
        condition, correct_count, total, accuracy * 100,
    )
    return summary


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def _parse_args():
    p = argparse.ArgumentParser(description="BP076 Phase 2 DRT harness")
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Run 5 questions per bank, stub Ollama, verify pipeline flows end-to-end",
    )
    p.add_argument(
        "--conditions",
        default="all",
        help="Comma-separated list of conditions to run, or 'all' (default: all)",
    )
    p.add_argument(
        "--q-bank",
        default="mmlu_pro",
        help="Question bank(s): mmlu_pro, gpqa_diamond, or mmlu_pro,gpqa_diamond",
    )
    p.add_argument(
        "--n",
        type=int,
        default=50,
        help="Number of questions per bank (used when a single bank is specified)",
    )
    p.add_argument("--n-mmlu", type=int, default=1000, help="N for MMLU-Pro bank")
    p.add_argument("--n-gpqa", type=int, default=198, help="N for GPQA Diamond bank")
    p.add_argument("--model", default=DEFAULT_MODEL, help="Ollama model tag")
    p.add_argument(
        "--output-dir",
        default=str(RUNS_BASE),
        help="Output directory for JSONL results",
    )
    p.add_argument(
        "--heartbeat",
        type=int,
        default=60,
        help="Heartbeat log interval in seconds",
    )
    return p.parse_args()


def main():
    args = _parse_args()

    dry_run: bool = args.dry_run
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    model: str = args.model
    heartbeat_interval: int = args.heartbeat

    # Resolve conditions
    if args.conditions.strip().lower() == "all":
        selected_conditions = CONDITIONS
    else:
        selected_conditions = [
            c.strip() for c in args.conditions.split(",") if c.strip()
        ]
        invalid = [c for c in selected_conditions if c not in CONDITIONS]
        if invalid:
            log.warning("Unknown conditions (will be skipped): %s", invalid)
            selected_conditions = [c for c in selected_conditions if c in CONDITIONS]

    # Resolve question banks
    q_banks = [b.strip() for b in args.q_bank.split(",") if b.strip()]

    if dry_run:
        log.info("=== DRY-RUN mode: 5 questions, Ollama stubbed ===")
        n_per_bank = 5
    else:
        n_per_bank = args.n  # used for single-bank --n

    # If --n is given explicitly (not default 50), use it for single-bank runs
    # that don't also specify --n-mmlu or --n-gpqa
    n_override = args.n  # explicit per-run count for POC

    all_questions: List[dict] = []
    for bank in q_banks:
        if dry_run:
            qs = load_questions(bank, 5, dry_run=True)
        elif bank == "mmlu_pro":
            # Use --n if it is < --n-mmlu default, treating --n as POC cap
            n_use = min(n_override, args.n_mmlu) if n_override < args.n_mmlu else args.n_mmlu
            qs = load_questions(bank, n_use, dry_run=False)
        elif bank == "gpqa_diamond":
            n_use = min(n_override, args.n_gpqa) if n_override < args.n_gpqa else args.n_gpqa
            qs = load_questions(bank, n_use, dry_run=False)
        else:
            qs = load_questions(bank, n_per_bank, dry_run=False)
        log.info("Loaded %d questions from bank '%s'", len(qs), bank)
        all_questions.extend(qs)

    if not all_questions:
        log.error("No questions loaded -- check question bank paths")
        sys.exit(1)

    log.info(
        "Phase 2 DRT harness: %d conditions x %d questions x model=%s",
        len(selected_conditions), len(all_questions), model,
    )

    run_summaries: List[dict] = []
    for condition in selected_conditions:
        try:
            summary = _run_condition(
                condition=condition,
                questions=all_questions,
                model=model,
                output_dir=output_dir,
                dry_run=dry_run,
                heartbeat_interval=heartbeat_interval,
            )
            run_summaries.append(summary)
        except Exception as exc:
            log.error("Condition '%s' failed: %s\n%s", condition, exc, traceback.format_exc())
            run_summaries.append({
                "condition": condition,
                "error": str(exc),
                "n_total": 0,
                "n_correct": 0,
                "accuracy": 0.0,
            })

    # Write run summary
    summary_path = output_dir / f"run_summary_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.json"
    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(run_summaries, f, indent=2, ensure_ascii=False)
    log.info("Run summary written to: %s", summary_path)

    # Print final table
    print("\n=== Phase 2 DRT Run Summary ===")
    for s in run_summaries:
        if "error" in s:
            print(f"  {s['condition']}: ERROR -- {s['error']}")
        else:
            print(
                f"  {s['condition']}: {s['n_correct']}/{s['n_total']} "
                f"({s['accuracy']*100:.1f}%)"
            )

    if dry_run:
        print("\nDRY-RUN COMPLETE -- pipeline flows end-to-end.")
    return run_summaries


if __name__ == "__main__":
    main()
