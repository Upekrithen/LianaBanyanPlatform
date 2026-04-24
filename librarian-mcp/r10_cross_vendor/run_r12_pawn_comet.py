#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_r12_pawn_comet.py — K475/B122 R12 Pawn-Cathedral × Comet/Perplexity Benchmark
====================================================================================
Stagger-parallel async Playwright driver.

Design:
  - One persistent Chromium context (shared cookies = shared Perplexity login).
  - New page per question; page closed after response captured.
  - Stagger: new tab every `--stagger` seconds (default 15).
  - Max concurrent: up to `--max-concurrent` pages (default 10).
  - Auto-lengthen stagger on rate-limit / CAPTCHA / session-expired hits.
  - Per-question log: start_ts, end_ts, wall_sec, grade, tab_id.
  - Resume-safe: JSONL append; re-running skips already-completed question_ids.

Six arms (run with --no-resume to start fresh, default is resume):
  python run_r12_pawn_comet.py --universe cranewell --arm cold
  python run_r12_pawn_comet.py --universe cranewell --arm cathedral --keywords-mode auto-only
  python run_r12_pawn_comet.py --universe cranewell --arm cathedral --keywords-mode union
  python run_r12_pawn_comet.py --universe covenant  --arm cold
  python run_r12_pawn_comet.py --universe covenant  --arm cathedral --keywords-mode auto-only
  python run_r12_pawn_comet.py --universe covenant  --arm cathedral --keywords-mode union

Or run all six sequentially:
  python run_r12_pawn_comet.py --run-all --no-resume

Requires: pip install playwright pyyaml; playwright install chromium
"""
from __future__ import annotations

import argparse
import asyncio
import json
import math
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
LIBRARIAN_MCP_DIR = SCRIPT_DIR.parent
STITCHPUNKS_DIR = LIBRARIAN_MCP_DIR / "stitchpunks"
PAWN_CATHEDRAL_DIR = STITCHPUNKS_DIR / "pawn_cathedral"
PAWN_AUTO_KEYWORDS_DIR = PAWN_CATHEDRAL_DIR / "auto_keywords"
PAWN_REGISTRY_PATH = PAWN_CATHEDRAL_DIR / "registry.yaml"
RESULTS_DIR = SCRIPT_DIR / "results_r12_pawn_comet"

BANK_FILES = {
    "cranewell": SCRIPT_DIR / "R12_QUESTION_BANK_CRANEWELL_SEALED.json",
    "covenant":  SCRIPT_DIR / "R12_QUESTION_BANK_COVENANT_SEALED.json",
}
CORPUS_FILES = {
    "cranewell": SCRIPT_DIR / "r12_cranewell_corpus.md",
    "covenant":  SCRIPT_DIR / "r12_covenant_corpus.md",
}

STORAGE_STATE_PATH = RESULTS_DIR.parent / "perplexity_session.json"

# ─── Constants ────────────────────────────────────────────────────────────────

DEFAULT_STAGGER_SEC   = 15.0
DEFAULT_MAX_CONCURRENT = 10
PER_QUESTION_TIMEOUT   = 120_000   # ms
ANSWER_SETTLE_MS       = 4_000     # ms after streaming stops
MAX_INPUT_CHARS        = 12_000    # Perplexity practical input limit

# Throttle / error signals in Perplexity response text
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
            # Extract fact ID (before first dash/em-dash)
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


def load_auto_keywords(scribe_id: str) -> list[str]:
    sidecar = PAWN_AUTO_KEYWORDS_DIR / f"{scribe_id}.yaml"
    if not sidecar.exists():
        return []
    try:
        import yaml  # type: ignore
        with open(sidecar, encoding="utf-8") as f:
            d = yaml.safe_load(f)
        return d.get("keywords", []) if isinstance(d, dict) else []
    except Exception:
        return []


def load_hand_keywords(universe: str) -> list[str]:
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


def build_cathedral_context(question: dict, universe: str, keywords_mode: str,
                             chunks: list[dict]) -> tuple[str, list[str]]:
    """Build Cathedral context preamble for a question."""
    scribe_map = {"cranewell": "PawnR12Cranewell", "covenant": "PawnR12Covenant"}
    scribe_id = scribe_map.get(universe, "PawnR12Cranewell")

    auto_kws = load_auto_keywords(scribe_id)
    if keywords_mode == "union":
        hand_kws = load_hand_keywords(universe)
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
    return f"{routing}\n\n{corpus_text}", [scribe_id]


def build_prompt(question_text: str, context: str | None) -> str:
    if context is None:
        return question_text
    body = f"Context:\n{context}\n\nQuestion: {question_text}"
    # Hard cap: Perplexity input limit
    if len(body) > MAX_INPUT_CHARS:
        # Truncate context, not the question
        allowed_ctx = MAX_INPUT_CHARS - len(f"Context:\n\nQuestion: {question_text}") - 10
        body = f"Context:\n{context[:max(0, allowed_ctx)]}...\n\nQuestion: {question_text}"
    return body


# ─── Results I/O ──────────────────────────────────────────────────────────────

def get_results_path(universe: str, arm: str, keywords_mode: str) -> Path:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    slug = f"{universe}_cold" if arm == "cold" else f"{universe}_cathedral_{keywords_mode}"
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


# ─── Playwright page submission ───────────────────────────────────────────────

async def submit_one_question(
    context,            # playwright BrowserContext
    prompt_text: str,
    tab_id: int,
    question_id: str,
) -> dict:
    """
    Open a new page, submit prompt_text to Perplexity, capture response.
    Returns dict with keys: response_text, anomaly, wall_sec, start_ts, end_ts.
    Page is closed before returning.

    Key design choices for Perplexity:
    - wait_until='domcontentloaded' (not 'networkidle' — Perplexity has live WebSockets)
    - Combined CSS selector for answer area (single wait_for_selector call, not a loop)
    - 60s timeout for answer to appear (Perplexity typically responds in 15-45s)
    - Stop-button wait: short timeout (30s) then capture whatever is rendered
    """
    page = await context.new_page()
    start_ts = datetime.now(timezone.utc).isoformat()
    t0 = time.monotonic()
    anomaly: str | None = None
    response_text = ""

    # Combined answer-area CSS selector (OR semantics — single wait call)
    ANSWER_SEL = (
        "[data-testid='answer-text'], "
        ".prose, "
        "div[class*='AnswerBody'], "
        "div[class*='answer-content'], "
        "div[class*='answerContent'], "
        "div[class*='markdown']"
    )

    # Track HTTP 429
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
            return _error_record(tab_id, question_id, start_ts, t0, "rate-limited", "HTTP 429")

        # Find the search input — try textarea first, then contenteditable
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
                return _error_record(tab_id, question_id, start_ts, t0, "session-expired", body_text[:300])
            return _error_record(tab_id, question_id, start_ts, t0, "retrieval-failed",
                                 f"no textarea after 2s (page title: {await page.title()})")

        await textarea.click()
        await page.wait_for_timeout(300)
        await textarea.fill(prompt_text[:MAX_INPUT_CHARS])
        await page.wait_for_timeout(200)
        await textarea.press("Enter")

        # Wait for the answer container — SINGLE call with combined selector
        # Timeout: 60s (Perplexity normally responds in 15-45s)
        try:
            await page.wait_for_selector(ANSWER_SEL, state="visible", timeout=60_000)
        except Exception:
            # Selector not found after 60s — wait a flat 20s and capture body
            await page.wait_for_timeout(20_000)

        # Wait for streaming to stop: stop button disappears (max 45s)
        try:
            await page.wait_for_function(
                """() => !document.querySelector('button[aria-label*="stop" i], '
                         + 'button[title*="stop" i]') &&
                         !Array.from(document.querySelectorAll('button'))
                              .some(b => (b.textContent||'').toLowerCase().includes('stop'))""",
                timeout=45_000,
            )
        except Exception:
            pass  # Capture whatever is rendered

        await page.wait_for_timeout(ANSWER_SETTLE_MS)

        # Extract answer — try the combined selector, then progressively broader areas
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


# ─── Adaptive throttle state ──────────────────────────────────────────────────

class ThrottleState:
    """Tracks recent anomalies and adaptively lengthens stagger on pressure."""

    def __init__(self, base_stagger: float):
        self.stagger = base_stagger
        self._recent: list[str | None] = []   # last 10 anomalies
        self._lock = asyncio.Lock()

    async def record(self, anomaly: str | None) -> None:
        async with self._lock:
            self._recent.append(anomaly)
            if len(self._recent) > 10:
                self._recent.pop(0)
            bad = sum(1 for a in self._recent if a in ("rate-limited", "captcha", "session-expired"))
            if bad >= 2 and self.stagger < 120:
                old = self.stagger
                self.stagger = min(self.stagger * 1.75, 120)
                print(
                    f"\n[throttle] {bad}/10 recent anomalies → stagger {old:.0f}s → {self.stagger:.0f}s",
                    flush=True,
                )

    async def wait(self) -> None:
        await asyncio.sleep(self.stagger)


# ─── Parallel benchmark loop ──────────────────────────────────────────────────

async def run_arm_async(
    context,
    questions: list[dict],
    results_path: Path,
    universe: str,
    arm: str,
    keywords_mode: str,
    chunks: list[dict],
    completed_ids: set[str],
    stagger_sec: float,
    max_concurrent: int,
    print_lock: asyncio.Lock,
) -> dict:
    """Run one benchmark arm in parallel. Returns summary stats."""
    global _results_lock
    _results_lock = asyncio.Lock()

    throttle = ThrottleState(stagger_sec)
    sem = asyncio.Semaphore(max_concurrent)
    total = len(questions)
    arm_label = arm if arm == "cold" else f"cathedral/{keywords_mode}"

    counts = {"HOT": 0, "HIT": 0, "MISS": 0, "failed": 0, "skipped": 0}
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

        # Build prompt
        if arm == "cold":
            prompt = q.get("question", "")
            context_snippet = None
            scribes_used: list[str] = []
        else:
            ctx_text, scribes_used = build_cathedral_context(q, universe, keywords_mode, chunks)
            prompt = build_prompt(q.get("question", ""), ctx_text)
            context_snippet = ctx_text[:400] + "..." if len(ctx_text) > 400 else ctx_text

        async with tab_lock:
            tab_counter += 1
            my_tab = tab_counter

        async with print_lock:
            print(f"  [{seq+1}/{total}] {q_id} ({category}) tab={my_tab} → submit...",
                  end="", flush=True)

        async with sem:
            result = await submit_one_question(context, prompt, my_tab, q_id)

        anomaly = result["anomaly"]
        response_text = result["response_text"]

        # Grade
        hot_elements = q.get("hot_required_elements", [])
        if anomaly in ("rate-limited", "captcha", "session-expired", "retrieval-failed"):
            grade = anomaly
            counts["failed"] += 1
        else:
            grade = grade_response(response_text, hot_elements)
            counts[grade] = counts.get(grade, 0) + 1

        # Record
        record: dict[str, Any] = {
            "question_id": q_id,
            "category": category,
            "fact_type": fact_type,
            "universe": universe,
            "arm": arm,
            "keywords_mode": keywords_mode,
            "grade": grade,
            "question": q.get("question", ""),
            "hot_required_elements": hot_elements,
            "response_text": response_text,
            "scribes_used": scribes_used,
            "tab_id": result["tab_id"],
            "start_ts": result["start_ts"],
            "end_ts": result["end_ts"],
            "wall_sec": result["wall_sec"],
        }
        if context_snippet:
            record["context_snippet"] = context_snippet

        await append_result(results_path, record)
        await throttle.record(anomaly)

        async with print_lock:
            flag = f" [{anomaly}]" if anomaly else ""
            print(f" {grade}{flag} ({result['wall_sec']:.0f}s)", flush=True)

    # ── Launch tasks staggered ──────────────────────────────────────────────

    tasks = []
    for seq, q in enumerate(questions):
        task = asyncio.create_task(process_one(q, seq))
        tasks.append(task)
        if seq < len(questions) - 1:  # don't stagger after the last one
            await throttle.wait()

    # Wait for all in-flight tasks to finish
    results_list = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results_list:
        if isinstance(r, Exception):
            print(f"\n[ERROR] Task raised: {r}", flush=True)

    graded = counts["HOT"] + counts["HIT"] + counts["MISS"]
    return {
        "arm": arm_label,
        "universe": universe,
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


# ─── Top-level async orchestrator ────────────────────────────────────────────

ALL_ARMS = [
    ("cranewell", "cold",       "none"),
    ("cranewell", "cathedral",  "auto-only"),
    ("cranewell", "cathedral",  "union"),
    ("covenant",  "cold",       "none"),
    ("covenant",  "cathedral",  "auto-only"),
    ("covenant",  "cathedral",  "union"),
]


async def main_async(args: argparse.Namespace) -> None:
    from playwright.async_api import async_playwright  # type: ignore

    arms_to_run = ALL_ARMS if args.run_all else [
        (args.universe, args.arm, "none" if args.arm == "cold" else args.keywords_mode)
    ]

    # Pre-load corpora for cathedral arms
    corpora: dict[str, list[dict]] = {}
    for uni, arm, kw in arms_to_run:
        if arm == "cathedral" and uni not in corpora:
            corpora[uni] = load_corpus_chunks(uni)
            print(f"[corpus] Loaded {len(corpora[uni])} chunks for {uni}")

    async with async_playwright() as pw:
        print(f"\n[browser] Launching Chromium (headless=False)...")
        browser = await pw.chromium.launch(
            headless=False,
            slow_mo=100,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
        )

        # Restore session if saved from a previous run
        ctx_kwargs: dict = {"viewport": {"width": 1280, "height": 900}}
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        storage_path = RESULTS_DIR.parent / "perplexity_session.json"
        if storage_path.exists():
            ctx_kwargs["storage_state"] = str(storage_path)
            print(f"[browser] Restoring session from {storage_path.name}")

        context = await browser.new_context(**ctx_kwargs)

        # Open login gate page
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
        all_summaries = []

        for arm_idx, (universe, arm, keywords_mode) in enumerate(arms_to_run):
            bank = load_bank(universe)
            questions = bank["questions"]
            results_path = get_results_path(universe, arm, keywords_mode)
            chunks = corpora.get(universe, [])

            completed_ids: set[str] = set()
            if not args.no_resume:
                completed_ids = load_completed_ids(results_path)

            arm_label = arm if arm == "cold" else f"cathedral/{keywords_mode}"
            print(f"\n{'='*60}")
            print(f"ARM {arm_idx+1}/{len(arms_to_run)}: {universe.upper()} / {arm_label}")
            print(f"Questions: {len(questions)} | Completed: {len(completed_ids)} | Stagger: {args.stagger}s | MaxConcurrent: {args.max_concurrent}")
            print(f"Results  : {results_path}")
            print(f"{'='*60}")

            arm_start = time.monotonic()
            summary = await run_arm_async(
                context=context,
                questions=questions,
                results_path=results_path,
                universe=universe,
                arm=arm,
                keywords_mode=keywords_mode,
                chunks=chunks,
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

        # Save session cookies for next run
        try:
            await context.storage_state(path=str(storage_path))
            print(f"\n[browser] Session saved to {storage_path.name}")
        except Exception as e:
            print(f"\n[browser] WARNING: Could not save session: {e}")
        await context.close()
        await browser.close()

    # Final summary table
    print(f"\n{'='*70}")
    print("K475 BENCHMARK COMPLETE — SUMMARY")
    print(f"{'='*70}")
    print(f"{'Universe/Arm':<35} {'HOT%':>6} {'HIT%':>6} {'MISS%':>6} {'N':>4} {'Wall':>6}")
    print("-" * 70)
    for s in all_summaries:
        label = f"{s['universe']}/{s['arm']}"
        print(f"{label:<35} {s['hot_pct']:>5.1f}% {s['hit_pct']:>5.1f}% "
              f"{s['miss_pct']:>5.1f}% {s['total_graded']:>4} {s['wall_sec']:>5.0f}s")
    print(f"{'='*70}")

    # Write summary JSON
    summary_path = RESULTS_DIR / "benchmark_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump({"generated_at": datetime.now(timezone.utc).isoformat(),
                   "args": vars(args), "summaries": all_summaries}, f, indent=2)
    print(f"\nSummary written to {summary_path}")


# ─── Regrade utility ──────────────────────────────────────────────────────────

def regrade_all() -> None:
    """Re-grade every JSONL results file against the sealed banks."""
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
    # Windows asyncio fix for Playwright
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    parser = argparse.ArgumentParser(
        description="K475 R12 Pawn-Cathedral × Perplexity stagger-parallel benchmark"
    )
    parser.add_argument("--universe", choices=["cranewell", "covenant"],
                        help="Which universe to test (required unless --run-all)")
    parser.add_argument("--arm", choices=["cold", "cathedral"],
                        help="cold = no injection; cathedral = Pawn Cathedral injected")
    parser.add_argument("--keywords-mode", default="auto-only",
                        choices=["auto-only", "union"],
                        help="Cathedral arm only: keyword pool selection")
    parser.add_argument("--run-all", action="store_true",
                        help="Run all 6 arms sequentially in one browser session")
    parser.add_argument("--no-resume", action="store_true",
                        help="Start fresh; ignore any existing partial results")
    parser.add_argument("--confirmed", action="store_true",
                        help="Skip interactive login gate (Founder already confirmed login)")
    parser.add_argument("--stagger", type=float, default=DEFAULT_STAGGER_SEC,
                        help=f"Seconds between tab launches (default {DEFAULT_STAGGER_SEC})")
    parser.add_argument("--max-concurrent", type=int, default=DEFAULT_MAX_CONCURRENT,
                        help=f"Max concurrent Perplexity tabs (default {DEFAULT_MAX_CONCURRENT})")
    parser.add_argument("--regrade", action="store_true",
                        help="Re-grade existing JSONL files without submitting new queries")
    args = parser.parse_args()

    if args.regrade:
        regrade_all()
        return

    if not args.run_all and (not args.universe or not args.arm):
        parser.error("--universe and --arm are required unless --run-all is set")

    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
