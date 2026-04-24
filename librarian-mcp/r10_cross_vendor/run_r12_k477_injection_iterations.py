#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_r12_k477_injection_iterations.py — K477/B122 Injection-Pathway Iterations
===============================================================================
Tests three injection-pathway variants against K475's established baseline
(12%/18% HOT on Cranewell auto-only/union; 14.6%/18.8% on Covenant).

Three hypotheses under test:
  H1 — Injection-pathway degradation (Perplexity treats pasted text as auxiliary)
  H2 — Multi-element composition friction (model surfaces 1 element, drops 2nd)
  H3 — Full-corpus noise (whole-corpus injection adds irrelevant tablets)

Three iterations (one per hypothesis):
  A — Authoritative-context wrapper (H1): prefix tablets with explicit authority framing
  B — Multi-turn follow-up (H2): submit extraction prompt after initial response
  C — Top-K RAG sweep (H3): replace full-corpus with per-question top-K retrieval

Key K475 lessons applied (from synapse_K475.jsonl):
  K475-001: wait_until='domcontentloaded' (never 'networkidle' on Perplexity)
  K475-002: combined CSS OR-selector for answer area (single wait_for_selector call)
  K475-005/024: storage_state NOT launch_persistent_context (avoids SingletonLock)
  K475-006/007: stagger-parallel asyncio (semaphore + 15s stagger)
  K475-008: WindowsProactorEventLoopPolicy on win32
  K475-009: asyncio.Lock for shared JSONL writes
  K475-022: adaptive throttle (2/10 anomalies → ×1.75 stagger, max 120s)

Results path: librarian-mcp/r10_cross_vendor/results_r12_k477_injection_iterations/

Usage:
  # Single arm:
  python run_r12_k477_injection_iterations.py --iteration A --universe cranewell --keywords-mode auto-only
  python run_r12_k477_injection_iterations.py --iteration B --universe covenant --keywords-mode union
  python run_r12_k477_injection_iterations.py --iteration C --universe cranewell --top-k 10 --keywords-mode auto-only

  # Full suite (all iterations × both universes × both modes; C at k=5,10,20):
  python run_r12_k477_injection_iterations.py --run-all

  # Skip interactive login gate (session already live):
  python run_r12_k477_injection_iterations.py --run-all --confirmed

Requires: pip install playwright pyyaml; playwright install chromium
"""
from __future__ import annotations

import argparse
import asyncio
import json
import math
import os
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR           = Path(__file__).resolve().parent
LIBRARIAN_MCP_DIR    = SCRIPT_DIR.parent
WORKSPACE_DIR        = LIBRARIAN_MCP_DIR.parent
LIBRARIAN_PUBLIC_SRC = WORKSPACE_DIR / "librarian-mcp-public" / "src"

# Add librarian-mcp-public to sys.path for query_cathedral() in Iteration C
if str(LIBRARIAN_PUBLIC_SRC) not in sys.path:
    sys.path.insert(0, str(LIBRARIAN_PUBLIC_SRC))

STITCHPUNKS_DIR      = LIBRARIAN_MCP_DIR / "stitchpunks"
PAWN_CATHEDRAL_DIR   = STITCHPUNKS_DIR / "pawn_cathedral"
PAWN_AUTO_KW_DIR     = PAWN_CATHEDRAL_DIR / "auto_keywords"
PAWN_REGISTRY_PATH   = PAWN_CATHEDRAL_DIR / "registry.yaml"

K475_RESULTS_DIR     = SCRIPT_DIR / "results_r12_pawn_comet"
RESULTS_DIR          = SCRIPT_DIR / "results_r12_k477_injection_iterations"
STORAGE_STATE_PATH   = SCRIPT_DIR / "perplexity_session.json"

BANK_FILES = {
    "cranewell": SCRIPT_DIR / "R12_QUESTION_BANK_CRANEWELL_SEALED.json",
    "covenant":  SCRIPT_DIR / "R12_QUESTION_BANK_COVENANT_SEALED.json",
}
CORPUS_FILES = {
    "cranewell": SCRIPT_DIR / "r12_cranewell_corpus.md",
    "covenant":  SCRIPT_DIR / "r12_covenant_corpus.md",
}

# ─── Constants ────────────────────────────────────────────────────────────────

DEFAULT_STAGGER_SEC    = 15.0
DEFAULT_MAX_CONCURRENT = 10
PER_QUESTION_TIMEOUT   = 120_000   # ms
ANSWER_SETTLE_MS       = 4_000     # ms after streaming stops
MAX_INPUT_CHARS        = 12_000    # Perplexity practical input limit

# Iteration B: Turn 2 follow-up prompt (forces explicit extraction)
ITER_B_TURN2_PROMPT = (
    "For the answer you just provided, please now list explicitly:\n"
    "- All specific numbers mentioned (values, percentages, counts, dates)\n"
    "- All named entities mentioned (people, organizations, places, protocols)\n"
    "- All specific durations or time spans mentioned\n\n"
    "Format as a bulleted list. If any information from the question is not in your answer, note it."
)

# Iteration A/B: Authoritative-context wrapper
AUTHORITY_HEADER = (
    "The following is authoritative reference material from a canonical local knowledge base. "
    "It represents the ground truth for the domain being asked about. "
    "Use these sources as the primary basis for your answer. "
    "If the sources do not contain the answer, say \"The provided sources do not contain this information.\" "
    "Do NOT supplement with web search if the sources are sufficient.\n\n"
    "=== BEGIN AUTHORITATIVE SOURCES ==="
)
AUTHORITY_FOOTER = "=== END AUTHORITATIVE SOURCES ==="

# Throttle / anomaly detection
RATE_LIMIT_SIGNALS = [
    "you've reached your", "you have reached", "rate limit", "too many requests",
    "slow down", "please wait", "request limit",
]
CAPTCHA_SIGNALS = [
    "verify you are human", "i am not a robot", "captcha", "cloudflare",
    "prove you're human",
]
SESSION_EXPIRED_SIGNALS = [
    "sign in to continue", "log in to continue", "please sign in",
    "session expired", "you must be logged in",
]

# Combined answer-area CSS selector (OR semantics — single wait_for_selector call)
ANSWER_SEL = (
    "[data-testid='answer-text'], "
    ".prose, "
    "div[class*='AnswerBody'], "
    "div[class*='answer-content'], "
    "div[class*='answerContent'], "
    "div[class*='markdown']"
)

# ─── Grader ──────────────────────────────────────────────────────────────────

def grade_response(response_text: str, required_elements: list[str]) -> str:
    """R10 three-tier substring rubric. HOT=all, HIT>=ceil(n/2)>=1, MISS=rest."""
    if not required_elements:
        return "ungraded"
    t = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in t)
    n = len(required_elements)
    if hits == n:
        return "HOT"
    if hits >= math.ceil(n / 2):
        return "HIT"
    return "MISS"


def detect_anomaly(text: str) -> str | None:
    """Return 'rate-limited', 'captcha', 'session-expired', or None."""
    t = text.lower()
    if any(s in t for s in RATE_LIMIT_SIGNALS):
        return "rate-limited"
    if any(s in t for s in CAPTCHA_SIGNALS):
        return "captcha"
    if any(s in t for s in SESSION_EXPIRED_SIGNALS):
        return "session-expired"
    return None


# ─── Bank / corpus loading ────────────────────────────────────────────────────

def load_bank(universe: str) -> dict:
    with open(BANK_FILES[universe], encoding="utf-8") as f:
        return json.load(f)


def load_corpus_chunks(universe: str) -> list[dict]:
    """Split corpus markdown into per-fact chunks by H3 heading."""
    text = CORPUS_FILES[universe].read_text(encoding="utf-8")
    chunks: list[dict] = []
    current_id: str | None = None
    current_heading = ""
    current_lines: list[str] = []

    def flush():
        if current_id and current_lines:
            chunks.append({
                "fact_id": current_id,
                "heading": current_heading,
                "content": "\n".join(current_lines).strip(),
            })

    for line in text.splitlines():
        s = line.strip()
        if s.startswith("### "):
            flush()
            current_heading = s[4:].strip()
            raw = current_heading
            for d in ["—", "–", "-", "\u2014", "\u2013"]:
                if d in raw:
                    raw = raw.split(d)[0].strip()
                    break
            current_id = raw if raw else None
            current_lines = []
        elif s.startswith("## ") or s.startswith("# "):
            flush()
            current_id = None
            current_heading = ""
            current_lines = []
        else:
            if current_id is not None:
                current_lines.append(line)
    flush()
    return chunks


def load_auto_keywords_pawn(scribe_id: str) -> list[str]:
    sidecar = PAWN_AUTO_KW_DIR / f"{scribe_id}.yaml"
    if not sidecar.exists():
        return []
    try:
        import yaml  # type: ignore
        with open(sidecar, encoding="utf-8") as f:
            d = yaml.safe_load(f)
        return d.get("keywords", []) if isinstance(d, dict) else []
    except Exception:
        return []


def load_hand_keywords_pawn(universe: str) -> list[str]:
    scribe_map = {"cranewell": "PawnR12Cranewell", "covenant": "PawnR12Covenant"}
    try:
        import yaml  # type: ignore
        with open(PAWN_REGISTRY_PATH, encoding="utf-8") as f:
            reg = yaml.safe_load(f)
        target = scribe_map.get(universe, "")
        for s in reg.get("scribes", []):
            if s.get("id") == target:
                return s.get("keywords", [])
    except Exception:
        pass
    return []


# ─── Iteration C: temp Cathedral setup ───────────────────────────────────────

def setup_temp_cathedral(universe: str, temp_dir: Path) -> Path:
    """
    Ingest the R12 corpus into a temporary Cathedral using the K476 librarian
    pipeline. Returns the cathedral_dir path.

    Uses librarian_mcp.cathedral from librarian-mcp-public (src/ added to path above).
    """
    try:
        from librarian_mcp.cathedral import (  # type: ignore
            parse_markdown_tablets, replace_scribe_tablets,
            extract_auto_keywords, save_auto_keywords,
            upsert_scribe, save_registry,
        )
    except ImportError as e:
        raise ImportError(
            f"Cannot import librarian_mcp.cathedral for Iteration C. "
            f"Ensure librarian-mcp-public/src exists at {LIBRARIAN_PUBLIC_SRC}. Error: {e}"
        )

    cathedral_dir = temp_dir / f"cathedral_{universe}"
    cathedral_dir.mkdir(parents=True, exist_ok=True)
    (cathedral_dir / "auto_keywords").mkdir(exist_ok=True)

    corpus_file = CORPUS_FILES[universe]
    scribe_name = f"R12{universe.capitalize()}"

    text = corpus_file.read_text(encoding="utf-8")
    tablets = parse_markdown_tablets(text, scribe_name)
    replace_scribe_tablets(cathedral_dir, scribe_name, tablets)
    kws = extract_auto_keywords(tablets)
    save_auto_keywords(cathedral_dir, scribe_name, kws)
    upsert_scribe(cathedral_dir, {
        "id": scribe_name,
        "mode": "corpus",
        "description": f"K477 temp Cathedral for {universe}",
        "tablet_count": len(tablets),
    })

    print(f"[temp-cathedral] {universe}: {len(tablets)} tablets ingested, "
          f"{len(kws)} auto-keywords extracted")
    return cathedral_dir


def query_topk_tablets(question: str, cathedral_dir: Path, k: int) -> list[str]:
    """Use K476 query_cathedral() to retrieve top-k tablets for the question."""
    try:
        from librarian_mcp.cathedral import query_cathedral, _get_tablet_text  # type: ignore
    except ImportError as e:
        raise ImportError(f"Cannot import query_cathedral for Iteration C: {e}")

    results = query_cathedral(question, cathedral_dir, k=k)
    return [_get_tablet_text(r["tablet"]) for r in results if _get_tablet_text(r["tablet"]).strip()]


# ─── Prompt builders ──────────────────────────────────────────────────────────

def build_context_k475_style(question: dict, universe: str, keywords_mode: str,
                              chunks: list[dict]) -> tuple[str, str]:
    """
    K475 baseline: inject full corpus with simple 'Context:...' wrapper.
    Returns (full_context_text, routing_label).
    """
    scribe_map = {"cranewell": "PawnR12Cranewell", "covenant": "PawnR12Covenant"}
    scribe_id = scribe_map.get(universe, "PawnR12Cranewell")
    auto_kws = load_auto_keywords_pawn(scribe_id)
    if keywords_mode == "union":
        hand_kws = load_hand_keywords_pawn(universe)
        all_kws = list(dict.fromkeys(auto_kws + hand_kws))
    else:
        all_kws = auto_kws
    q_lower = question.get("question", "").lower()
    kw_hits = sum(1 for kw in all_kws if kw.lower() in q_lower)
    routing = (
        f"[Pawn-Cathedral | Scribe: {scribe_id} | mode: {keywords_mode} | "
        f"kw_pool: {len(all_kws)} | kw_hits_in_q: {kw_hits}]"
    )
    corpus_text = "\n\n".join(
        f"### {c['heading']}\n{c['content']}" for c in chunks
    )
    return f"{routing}\n\n{corpus_text}", routing


def build_prompt_iter_a(question_text: str, corpus_body: str) -> str:
    """
    Iteration A: Authoritative-context wrapper.
    Replaces the plain 'Context:...' header with an explicit authority framing
    that instructs Perplexity to treat the injected text as primary ground truth.
    """
    body = (
        f"{AUTHORITY_HEADER}\n"
        f"{corpus_body}\n"
        f"{AUTHORITY_FOOTER}\n\n"
        f"Question: {question_text}"
    )
    if len(body) > MAX_INPUT_CHARS:
        allowed_corpus = MAX_INPUT_CHARS - len(
            f"{AUTHORITY_HEADER}\n\n{AUTHORITY_FOOTER}\n\nQuestion: {question_text}"
        ) - 20
        body = (
            f"{AUTHORITY_HEADER}\n"
            f"{corpus_body[:max(0, allowed_corpus)]}...\n"
            f"{AUTHORITY_FOOTER}\n\n"
            f"Question: {question_text}"
        )
    return body


def build_prompt_baseline(question_text: str, corpus_body: str) -> str:
    """K475-style baseline prompt (simple Context: wrapper)."""
    body = f"Context:\n{corpus_body}\n\nQuestion: {question_text}"
    if len(body) > MAX_INPUT_CHARS:
        allowed = MAX_INPUT_CHARS - len(f"Context:\n\nQuestion: {question_text}") - 10
        body = f"Context:\n{corpus_body[:max(0, allowed)]}...\n\nQuestion: {question_text}"
    return body


def build_prompt_iter_c(question_text: str, tablet_texts: list[str]) -> str:
    """
    Iteration C: Top-K RAG prompt.
    Inject only the top-K tablets retrieved by query_cathedral(), with authority wrapper.
    """
    corpus_body = "\n\n---\n\n".join(t for t in tablet_texts if t.strip())
    return build_prompt_iter_a(question_text, corpus_body)


# ─── Results I/O ──────────────────────────────────────────────────────────────

def get_results_path(universe: str, iteration: str, keywords_mode: str,
                     top_k: int | None = None) -> Path:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    if iteration == "C" and top_k is not None:
        slug = f"{universe}_iter_c_k{top_k}_{keywords_mode}"
    else:
        slug = f"{universe}_iter_{iteration.lower()}_{keywords_mode}"
    return RESULTS_DIR / f"{slug}.jsonl"


def load_completed_ids(path: Path) -> set[str]:
    if not path.exists():
        return set()
    done = set()
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if rec.get("grade") in ("HOT", "HIT", "MISS",
                                        "retrieval-failed", "rate-limited",
                                        "captcha", "session-expired"):
                    done.add(rec["question_id"])
            except Exception:
                pass
    return done


_results_lock: asyncio.Lock | None = None


async def append_result(path: Path, record: dict) -> None:
    global _results_lock
    async with _results_lock:  # type: ignore
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ─── Playwright page submissions ──────────────────────────────────────────────

async def submit_one_question(
    context,
    prompt_text: str,
    tab_id: int,
    question_id: str,
) -> dict:
    """
    Submit a single question to Perplexity; capture and return the response.
    Identical to K475 pattern (battle-tested).
    """
    page = await context.new_page()
    start_ts = datetime.now(timezone.utc).isoformat()
    t0 = time.monotonic()
    anomaly: str | None = None
    response_text = ""

    rate_limited_flag = False

    def on_response(resp):
        nonlocal rate_limited_flag
        if resp.status == 429:
            rate_limited_flag = True

    page.on("response", on_response)

    try:
        await page.goto("https://www.perplexity.ai/", wait_until="domcontentloaded", timeout=60_000)
        await page.wait_for_timeout(2000)

        if rate_limited_flag:
            await page.close()
            return _error_record(tab_id, question_id, start_ts, t0, "rate-limited", "HTTP 429")

        textarea = None
        for sel in [
            "textarea[placeholder]",
            "textarea",
            "div[contenteditable='true']",
            "[contenteditable='true']",
        ]:
            try:
                loc = page.locator(sel).first
                if await loc.count() > 0:
                    textarea = loc
                    break
            except Exception:
                continue

        if textarea is None:
            body_text = await page.locator("body").inner_text()
            if any(s in body_text.lower() for s in SESSION_EXPIRED_SIGNALS):
                await page.close()
                return _error_record(tab_id, question_id, start_ts, t0, "session-expired", body_text[:300])
            await page.close()
            return _error_record(tab_id, question_id, start_ts, t0, "retrieval-failed",
                                 f"no textarea after 2s (page title: {await page.title()})")

        await textarea.click()
        await page.wait_for_timeout(300)
        await textarea.fill(prompt_text[:MAX_INPUT_CHARS])
        await page.wait_for_timeout(200)
        await textarea.press("Enter")

        try:
            await page.wait_for_selector(ANSWER_SEL, state="visible", timeout=60_000)
        except Exception:
            await page.wait_for_timeout(20_000)

        try:
            await page.wait_for_function(
                """() => !document.querySelector('button[aria-label*="stop" i], '
                         + 'button[title*="stop" i]') &&
                         !Array.from(document.querySelectorAll('button'))
                              .some(b => (b.textContent||'').toLowerCase().includes('stop'))""",
                timeout=45_000,
            )
        except Exception:
            pass

        await page.wait_for_timeout(ANSWER_SETTLE_MS)

        for sel in [ANSWER_SEL, "main", "article", "body"]:
            try:
                elem = page.locator(sel).first
                if await elem.count() > 0:
                    t = await elem.inner_text()
                    if t and len(t) > 30:
                        response_text = t
                        break
            except Exception:
                continue

        anomaly = detect_anomaly(response_text)

    except Exception as e:
        response_text = f"ERROR: {e}"
        anomaly = "retrieval-failed"
    finally:
        try:
            await page.close()
        except Exception:
            pass

    wall_sec = round(time.monotonic() - t0, 1)
    end_ts = datetime.now(timezone.utc).isoformat()
    return {
        "response_text": response_text,
        "anomaly": anomaly,
        "wall_sec": wall_sec,
        "start_ts": start_ts,
        "end_ts": end_ts,
        "tab_id": tab_id,
    }


async def submit_two_turn_question(
    context,
    turn1_prompt: str,
    turn2_prompt: str,
    tab_id: int,
    question_id: str,
) -> dict:
    """
    Iteration B: two-turn interaction.
    Turn 1: submit the question with auth wrapper.
    Turn 2: submit the extraction follow-up in the same conversation.
    Returns combined Turn 1 + Turn 2 response text for grading.
    """
    page = await context.new_page()
    start_ts = datetime.now(timezone.utc).isoformat()
    t0 = time.monotonic()
    anomaly: str | None = None
    response_text = ""
    turn1_text = ""
    turn2_text = ""

    rate_limited_flag = False

    def on_response(resp):
        nonlocal rate_limited_flag
        if resp.status == 429:
            rate_limited_flag = True

    page.on("response", on_response)

    try:
        await page.goto("https://www.perplexity.ai/", wait_until="domcontentloaded", timeout=60_000)
        await page.wait_for_timeout(2000)

        if rate_limited_flag:
            await page.close()
            return _error_record(tab_id, question_id, start_ts, t0, "rate-limited", "HTTP 429")

        # ── Turn 1 ──────────────────────────────────────────────────────────

        textarea = None
        for sel in ["textarea[placeholder]", "textarea",
                    "div[contenteditable='true']", "[contenteditable='true']"]:
            try:
                loc = page.locator(sel).first
                if await loc.count() > 0:
                    textarea = loc
                    break
            except Exception:
                continue

        if textarea is None:
            body_text = await page.locator("body").inner_text()
            grade_str = ("session-expired"
                         if any(s in body_text.lower() for s in SESSION_EXPIRED_SIGNALS)
                         else "retrieval-failed")
            await page.close()
            return _error_record(tab_id, question_id, start_ts, t0, grade_str, body_text[:300])

        await textarea.click()
        await page.wait_for_timeout(300)
        await textarea.fill(turn1_prompt[:MAX_INPUT_CHARS])
        await page.wait_for_timeout(200)
        await textarea.press("Enter")

        # Wait for Turn 1 answer
        try:
            await page.wait_for_selector(ANSWER_SEL, state="visible", timeout=60_000)
        except Exception:
            await page.wait_for_timeout(20_000)

        try:
            await page.wait_for_function(
                """() => !document.querySelector('button[aria-label*="stop" i], '
                         + 'button[title*="stop" i]') &&
                         !Array.from(document.querySelectorAll('button'))
                              .some(b => (b.textContent||'').toLowerCase().includes('stop'))""",
                timeout=45_000,
            )
        except Exception:
            pass

        await page.wait_for_timeout(ANSWER_SETTLE_MS)

        for sel in [ANSWER_SEL, "main", "article", "body"]:
            try:
                elem = page.locator(sel).first
                if await elem.count() > 0:
                    t = await elem.inner_text()
                    if t and len(t) > 30:
                        turn1_text = t
                        break
            except Exception:
                continue

        anomaly = detect_anomaly(turn1_text)
        if anomaly in ("rate-limited", "captcha", "session-expired"):
            await page.close()
            result = _error_record(tab_id, question_id, start_ts, t0, anomaly, turn1_text[:300])
            result["turn"] = "turn1_anomaly"
            return result

        # ── Turn 2: submit follow-up in same thread ──────────────────────────

        turn2_input = None
        # After Turn 1, Perplexity shows a new follow-up input. Try multiple selectors.
        for sel in [
            "textarea[placeholder]",
            "textarea",
            "div[contenteditable='true'][data-placeholder]",
            "div[contenteditable='true']",
            "[contenteditable='true']",
        ]:
            try:
                locs = page.locator(sel)
                count = await locs.count()
                if count > 0:
                    # Prefer the LAST one (follow-up input, not the original)
                    turn2_input = locs.last
                    break
            except Exception:
                continue

        if turn2_input is None:
            # Turn 2 input not found — grade on Turn 1 only with a note
            response_text = turn1_text + "\n[ITER-B NOTE: Turn 2 input not found; grading Turn 1 only]"
        else:
            try:
                await turn2_input.click()
                await page.wait_for_timeout(500)
                await turn2_input.fill(turn2_prompt)
                await page.wait_for_timeout(200)
                await turn2_input.press("Enter")

                # Wait for Turn 2 answer — refresh the answer area capture
                try:
                    await page.wait_for_selector(ANSWER_SEL, state="visible", timeout=60_000)
                except Exception:
                    await page.wait_for_timeout(20_000)

                try:
                    await page.wait_for_function(
                        """() => !document.querySelector('button[aria-label*="stop" i], '
                                 + 'button[title*="stop" i]') &&
                                 !Array.from(document.querySelectorAll('button'))
                                      .some(b => (b.textContent||'').toLowerCase().includes('stop'))""",
                        timeout=45_000,
                    )
                except Exception:
                    pass

                await page.wait_for_timeout(ANSWER_SETTLE_MS)

                for sel in [ANSWER_SEL, "main", "article", "body"]:
                    try:
                        elem = page.locator(sel).first
                        if await elem.count() > 0:
                            t = await elem.inner_text()
                            if t and len(t) > 30:
                                turn2_text = t
                                break
                    except Exception:
                        continue

            except Exception as e2:
                turn2_text = f"[ITER-B TURN2 ERROR: {e2}]"

            # Combine both turns — grade on the union
            response_text = turn1_text + "\n\n--- ITER-B TURN 2 ---\n\n" + turn2_text

        anomaly = detect_anomaly(response_text)

    except Exception as e:
        response_text = f"ERROR: {e}"
        anomaly = "retrieval-failed"
    finally:
        try:
            await page.close()
        except Exception:
            pass

    wall_sec = round(time.monotonic() - t0, 1)
    end_ts = datetime.now(timezone.utc).isoformat()
    return {
        "response_text": response_text,
        "anomaly": anomaly,
        "wall_sec": wall_sec,
        "start_ts": start_ts,
        "end_ts": end_ts,
        "tab_id": tab_id,
        "turn1_text": turn1_text[:2000],   # abbreviated for logging
        "turn2_text": turn2_text[:2000],
    }


def _error_record(tab_id, question_id, start_ts, t0, grade, detail):
    wall_sec = round(time.monotonic() - t0, 1)
    return {
        "response_text": detail,
        "anomaly": grade,
        "wall_sec": wall_sec,
        "start_ts": start_ts,
        "end_ts": datetime.now(timezone.utc).isoformat(),
        "tab_id": tab_id,
    }


# ─── Adaptive throttle ────────────────────────────────────────────────────────

class ThrottleState:
    def __init__(self, base_stagger: float):
        self.stagger = base_stagger
        self._recent: list[str | None] = []
        self._lock = asyncio.Lock()

    async def record(self, anomaly: str | None) -> None:
        async with self._lock:
            self._recent.append(anomaly)
            if len(self._recent) > 10:
                self._recent.pop(0)
            bad = sum(1 for a in self._recent
                      if a in ("rate-limited", "captcha", "session-expired"))
            if bad >= 2 and self.stagger < 120:
                old = self.stagger
                self.stagger = min(self.stagger * 1.75, 120)
                print(f"\n[throttle] {bad}/10 recent anomalies → stagger {old:.0f}s → {self.stagger:.0f}s",
                      flush=True)

    async def wait(self) -> None:
        await asyncio.sleep(self.stagger)


# ─── Parallel benchmark arm ───────────────────────────────────────────────────

async def run_arm_async(
    context,
    questions: list[dict],
    results_path: Path,
    universe: str,
    iteration: str,
    keywords_mode: str,
    chunks: list[dict],
    cathedral_dir: Path | None,
    top_k: int | None,
    completed_ids: set[str],
    stagger_sec: float,
    max_concurrent: int,
    print_lock: asyncio.Lock,
) -> dict:
    global _results_lock
    _results_lock = asyncio.Lock()

    throttle = ThrottleState(stagger_sec)
    sem = asyncio.Semaphore(max_concurrent)
    total = len(questions)
    arm_label = f"iter_{iteration.lower()}" + (f"_k{top_k}" if top_k else "") + f"/{keywords_mode}"

    counts: dict[str, int] = {"HOT": 0, "HIT": 0, "MISS": 0, "failed": 0, "skipped": 0}
    tab_counter = 0
    tab_lock = asyncio.Lock()

    async def process_one(q: dict, seq: int) -> None:
        nonlocal tab_counter
        q_id = q.get("id", f"Q{seq:03d}")
        category = q.get("category", "?")
        fact_type = q.get("fact_type", "unknown")

        if q_id in completed_ids:
            async with print_lock:
                print(f"  [{seq+1}/{total}] {q_id} SKIP", flush=True)
            counts["skipped"] += 1
            return

        question_text = q.get("question", "")
        hot_elements = q.get("hot_required_elements", [])
        context_snippet: str | None = None
        prompt_turn1 = ""
        prompt_turn2 = ""

        if iteration == "A":
            corpus_body, routing = build_context_k475_style(q, universe, keywords_mode, chunks)
            corpus_only = "\n\n".join(
                f"### {c['heading']}\n{c['content']}" for c in chunks
            )
            prompt_turn1 = build_prompt_iter_a(question_text, corpus_only)
            context_snippet = (corpus_body[:400] + "...") if len(corpus_body) > 400 else corpus_body

        elif iteration == "B":
            corpus_only = "\n\n".join(
                f"### {c['heading']}\n{c['content']}" for c in chunks
            )
            prompt_turn1 = build_prompt_iter_a(question_text, corpus_only)
            prompt_turn2 = ITER_B_TURN2_PROMPT
            corpus_body, _ = build_context_k475_style(q, universe, keywords_mode, chunks)
            context_snippet = (corpus_body[:400] + "...") if len(corpus_body) > 400 else corpus_body

        elif iteration == "C":
            assert cathedral_dir is not None and top_k is not None
            try:
                tablet_texts = query_topk_tablets(question_text, cathedral_dir, top_k)
            except Exception as e:
                tablet_texts = []
                print(f"\n[ITER-C WARNING] query_topk failed for {q_id}: {e}", flush=True)
            prompt_turn1 = build_prompt_iter_c(question_text, tablet_texts)
            context_snippet = f"[top-{top_k} tablets]\n" + "\n---\n".join(tablet_texts)[:400] + "..."

        else:
            raise ValueError(f"Unknown iteration: {iteration!r}")

        async with tab_lock:
            tab_counter += 1
            my_tab = tab_counter

        async with print_lock:
            print(f"  [{seq+1}/{total}] {q_id} ({category}) tab={my_tab} → submit...",
                  end="", flush=True)

        async with sem:
            if iteration == "B":
                result = await submit_two_turn_question(
                    context, prompt_turn1, prompt_turn2, my_tab, q_id
                )
            else:
                result = await submit_one_question(context, prompt_turn1, my_tab, q_id)

        anomaly = result["anomaly"]
        resp_text = result["response_text"]

        if anomaly in ("rate-limited", "captcha", "session-expired", "retrieval-failed"):
            grade = anomaly
            counts["failed"] += 1
        else:
            grade = grade_response(resp_text, hot_elements)
            counts[grade] = counts.get(grade, 0) + 1

        record: dict[str, Any] = {
            "question_id": q_id,
            "category": category,
            "fact_type": fact_type,
            "universe": universe,
            "iteration": iteration,
            "keywords_mode": keywords_mode,
            "top_k": top_k,
            "grade": grade,
            "question": question_text,
            "hot_required_elements": hot_elements,
            "response_text": resp_text,
            "tab_id": result["tab_id"],
            "start_ts": result["start_ts"],
            "end_ts": result["end_ts"],
            "wall_sec": result["wall_sec"],
        }
        if context_snippet:
            record["context_snippet"] = context_snippet
        if iteration == "B":
            record["turn1_text"] = result.get("turn1_text", "")
            record["turn2_text"] = result.get("turn2_text", "")

        await append_result(results_path, record)
        await throttle.record(anomaly)

        async with print_lock:
            flag = f" [{anomaly}]" if anomaly else ""
            print(f" {grade}{flag} ({result['wall_sec']:.0f}s)", flush=True)

    tasks = []
    for seq, q in enumerate(questions):
        task = asyncio.create_task(process_one(q, seq))
        tasks.append(task)
        if seq < len(questions) - 1:
            await throttle.wait()

    results_list = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results_list:
        if isinstance(r, Exception):
            print(f"\n[ERROR] Task raised: {r}", flush=True)

    graded = counts["HOT"] + counts["HIT"] + counts["MISS"]
    return {
        "arm": arm_label,
        "universe": universe,
        "iteration": iteration,
        "keywords_mode": keywords_mode,
        "top_k": top_k,
        "HOT": counts["HOT"],
        "HIT": counts["HIT"],
        "MISS": counts["MISS"],
        "failed": counts["failed"],
        "skipped": counts["skipped"],
        "total_graded": graded,
        "hot_pct": round(100 * counts["HOT"] / max(1, graded), 1),
        "hit_pct": round(100 * counts["HIT"] / max(1, graded), 1),
        "miss_pct": round(100 * counts["MISS"] / max(1, graded), 1),
    }


# ─── Arm catalogue ────────────────────────────────────────────────────────────

# Format: (universe, iteration, keywords_mode, top_k)
ALL_ARMS: list[tuple[str, str, str, int | None]] = [
    # Iteration A — Authoritative wrapper (full corpus, auth framing)
    ("cranewell", "A", "auto-only", None),
    ("cranewell", "A", "union",     None),
    ("covenant",  "A", "auto-only", None),
    ("covenant",  "A", "union",     None),
    # Iteration B — Multi-turn follow-up (auth wrapper Turn 1 + extraction Turn 2)
    ("cranewell", "B", "auto-only", None),
    ("cranewell", "B", "union",     None),
    ("covenant",  "B", "auto-only", None),
    ("covenant",  "B", "union",     None),
    # Iteration C — Top-K RAG sweep (per-question retrieval; skip union since routing changes)
    ("cranewell", "C", "auto-only",  5),
    ("cranewell", "C", "auto-only", 10),
    ("cranewell", "C", "auto-only", 20),
    ("covenant",  "C", "auto-only",  5),
    ("covenant",  "C", "auto-only", 10),
    ("covenant",  "C", "auto-only", 20),
]


# ─── Top-level orchestrator ───────────────────────────────────────────────────

async def main_async(args: argparse.Namespace) -> None:
    from playwright.async_api import async_playwright  # type: ignore

    if args.run_all:
        arms_to_run = ALL_ARMS
    else:
        # top_k is only relevant for Iteration C
        effective_top_k = args.top_k if args.iteration == "C" else None
        arms_to_run = [(args.universe, args.iteration, args.keywords_mode, effective_top_k)]

    # Pre-load full corpora (Iterations A and B use full corpus)
    corpora: dict[str, list[dict]] = {}
    for uni, itr, kw, _ in arms_to_run:
        if itr in ("A", "B") and uni not in corpora:
            corpora[uni] = load_corpus_chunks(uni)
            print(f"[corpus] Loaded {len(corpora[uni])} chunks for {uni}")

    # Setup temp Cathedrals for Iteration C
    temp_cathedrals: dict[str, Path] = {}
    has_iter_c = any(itr == "C" for _, itr, _, _ in arms_to_run)
    tmp_dir_obj = None
    if has_iter_c:
        tmp_dir_obj = tempfile.TemporaryDirectory(prefix="k477_cathedral_")
        tmp_dir = Path(tmp_dir_obj.name)
        for uni, itr, _, _ in arms_to_run:
            if itr == "C" and uni not in temp_cathedrals:
                temp_cathedrals[uni] = setup_temp_cathedral(uni, tmp_dir)

    async with async_playwright() as pw:
        print(f"\n[browser] Launching Chromium (headless=False)...")
        browser = await pw.chromium.launch(
            headless=False,
            slow_mo=100,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
        )

        ctx_kwargs: dict = {"viewport": {"width": 1280, "height": 900}}
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        if STORAGE_STATE_PATH.exists():
            ctx_kwargs["storage_state"] = str(STORAGE_STATE_PATH)
            print(f"[browser] Restoring session from {STORAGE_STATE_PATH.name}")

        context = await browser.new_context(**ctx_kwargs)

        login_page = await context.new_page()
        await login_page.goto("https://www.perplexity.ai/", wait_until="domcontentloaded", timeout=60_000)
        print("\n[preflight] Browser is open at perplexity.ai.")
        if args.confirmed:
            print("[preflight] --confirmed set. Proceeding in 8 seconds — log in now if needed.")
            await asyncio.sleep(8)
        else:
            print("[preflight] Press Enter once you are logged in to Perplexity...")
            await asyncio.get_event_loop().run_in_executor(None, input)
        await login_page.close()

        print_lock = asyncio.Lock()
        all_summaries: list[dict] = []

        for arm_idx, (universe, iteration, keywords_mode, top_k) in enumerate(arms_to_run):
            bank = load_bank(universe)
            questions = bank["questions"]
            results_path = get_results_path(universe, iteration, keywords_mode, top_k)
            chunks = corpora.get(universe, [])
            cathedral_dir = temp_cathedrals.get(universe)

            completed_ids: set[str] = set()
            if not args.no_resume:
                completed_ids = load_completed_ids(results_path)

            arm_label = f"iter_{iteration.lower()}" + (f"_k{top_k}" if top_k else "") + f"/{keywords_mode}"
            print(f"\n{'='*60}")
            print(f"ARM {arm_idx+1}/{len(arms_to_run)}: {universe.upper()} / {arm_label}")
            print(f"Questions: {len(questions)} | Completed: {len(completed_ids)} | "
                  f"Stagger: {args.stagger}s | MaxConcurrent: {args.max_concurrent}")
            print(f"Results  : {results_path}")
            print(f"{'='*60}")

            arm_start = time.monotonic()
            summary = await run_arm_async(
                context=context,
                questions=questions,
                results_path=results_path,
                universe=universe,
                iteration=iteration,
                keywords_mode=keywords_mode,
                chunks=chunks,
                cathedral_dir=cathedral_dir,
                top_k=top_k,
                completed_ids=completed_ids,
                stagger_sec=args.stagger,
                max_concurrent=args.max_concurrent,
                print_lock=print_lock,
            )
            arm_wall = round(time.monotonic() - arm_start, 1)
            summary["wall_sec"] = arm_wall
            all_summaries.append(summary)

            graded = summary["total_graded"]
            print(f"\n  → HOT {summary['HOT']}/{graded} ({summary['hot_pct']}%) | "
                  f"HIT {summary['HIT']}/{graded} ({summary['hit_pct']}%) | "
                  f"MISS {summary['MISS']}/{graded} ({summary['miss_pct']}%) | "
                  f"failed {summary['failed']} | wall {arm_wall:.0f}s")

        # Save session for next run
        try:
            await context.storage_state(path=str(STORAGE_STATE_PATH))
            print(f"\n[browser] Session saved to {STORAGE_STATE_PATH.name}")
        except Exception as e:
            print(f"\n[browser] WARNING: Could not save session: {e}")

        await context.close()
        await browser.close()

    if tmp_dir_obj is not None:
        tmp_dir_obj.cleanup()

    # Print final summary table
    print(f"\n{'='*80}")
    print("K477 INJECTION-PATHWAY ITERATIONS — SUMMARY")
    print(f"{'='*80}")

    # K475 baselines for delta comparison
    k475_baselines = {
        ("cranewell", "auto-only"): 12.0,
        ("cranewell", "union"):     18.0,
        ("covenant",  "auto-only"): 14.6,
        ("covenant",  "union"):     18.8,
    }

    print(f"{'Universe/Arm':<42} {'HOT%':>6} {'Δ vs K475':>10} {'HIT%':>6} {'N':>4} {'Wall':>6}")
    print("-" * 80)
    for s in all_summaries:
        label = f"{s['universe']}/{s['arm']}"
        baseline = k475_baselines.get((s["universe"], s["keywords_mode"]))
        delta_str = f"{s['hot_pct'] - baseline:+.1f}pp" if baseline is not None else "n/a"
        print(f"{label:<42} {s['hot_pct']:>5.1f}% {delta_str:>10} "
              f"{s['hit_pct']:>5.1f}% {s['total_graded']:>4} {s['wall_sec']:>5.0f}s")
    print(f"{'='*80}")

    # Write summary JSON
    summary_path = RESULTS_DIR / "k477_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "args": vars(args),
            "k475_baselines": {f"{u}/{m}": v for (u, m), v in k475_baselines.items()},
            "summaries": all_summaries,
        }, f, indent=2)
    print(f"\nSummary written to {summary_path}")


# ─── Regrade utility ──────────────────────────────────────────────────────────

def regrade_all() -> None:
    banks = {u: load_bank(u) for u in ["cranewell", "covenant"]}
    for jf in RESULTS_DIR.glob("*.jsonl"):
        universe = "cranewell" if "cranewell" in jf.name else "covenant"
        bank_by_id = {q["id"]: q for q in banks[universe]["questions"]}
        rows: list[dict] = []
        with open(jf, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                    qid = rec.get("question_id")
                    if qid in bank_by_id and rec.get("grade") not in (
                        "retrieval-failed", "rate-limited", "captcha", "session-expired"
                    ):
                        elems = bank_by_id[qid].get("hot_required_elements", [])
                        rec["grade"] = grade_response(rec.get("response_text", ""), elems)
                    rows.append(rec)
                except Exception:
                    pass
        with open(jf, "w", encoding="utf-8") as f:
            for rec in rows:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print(f"Re-graded {len(rows)} records in {jf.name}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    parser = argparse.ArgumentParser(
        description="K477 R12 Injection-Pathway Iterations — stagger-parallel Playwright benchmark"
    )
    parser.add_argument("--universe", choices=["cranewell", "covenant"],
                        help="Which universe (required unless --run-all)")
    parser.add_argument("--iteration", choices=["A", "B", "C"],
                        help="Which iteration: A=auth-wrapper, B=multi-turn, C=top-K RAG")
    parser.add_argument("--keywords-mode", default="auto-only",
                        choices=["auto-only", "union"],
                        help="Keyword pool mode (default: auto-only)")
    parser.add_argument("--top-k", type=int, default=10,
                        help="Top-K for Iteration C (default: 10)")
    parser.add_argument("--run-all", action="store_true",
                        help="Run all arms in ALL_ARMS catalogue")
    parser.add_argument("--no-resume", action="store_true",
                        help="Start fresh; ignore partial results")
    parser.add_argument("--confirmed", action="store_true",
                        help="Skip interactive login gate")
    parser.add_argument("--stagger", type=float, default=DEFAULT_STAGGER_SEC,
                        help=f"Seconds between tab launches (default {DEFAULT_STAGGER_SEC})")
    parser.add_argument("--max-concurrent", type=int, default=DEFAULT_MAX_CONCURRENT,
                        help=f"Max concurrent Perplexity tabs (default {DEFAULT_MAX_CONCURRENT})")
    parser.add_argument("--regrade", action="store_true",
                        help="Re-grade existing K477 JSONL files without new submissions")
    args = parser.parse_args()

    if args.regrade:
        regrade_all()
        return

    if not args.run_all and (not args.universe or not args.iteration):
        parser.error("--universe and --iteration are required unless --run-all is set")

    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
