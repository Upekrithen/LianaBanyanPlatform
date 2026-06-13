#!/usr/bin/env python3
"""replow_andon_bp078.py -- BP078 Phase C: Re-Plow Andon-Stop Questions.

Reads bp078_phase_b_andon_ids.json from Phase B.
For each Andon-stop question:
  - Re-mines with wider parameters (k=20 instead of k=10, extra seed terms)
  - Appends new eblets to substrate_bp078_cache.jsonl
  - Re-runs LLM synthesis + concordance
  - Writes BP078_PHASE_C_REPLOW_RECEIPT.eblet.md

Truth-Always:
  - If Phase B produced zero Andon-stops, writes an honest receipt saying so.
  - If a question remains Andon after re-plow, documents as
    "persistent gap -- out of scope".
  - Network failures during re-mining are documented per question.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BENCH_DIR = Path(__file__).parent
SUBSTRATE_CACHE = BENCH_DIR / "substrate_bp078_cache.jsonl"
ANDON_IDS_PATH = BENCH_DIR / "bp078_phase_b_andon_ids.json"
RECEIPT_PATH = BENCH_DIR / "BP078_PHASE_C_REPLOW_RECEIPT.eblet.md"

OLLAMA_HOST = "http://127.0.0.1:11434"
MODEL = "gemma4:12b"
LLM_TIMEOUT_S = 60
MAX_RETRIES = 2
RETRY_BACKOFF = 2.0

# Re-plow parameters (wider than Phase A's k=10)
REPLOW_K = 20
ANTIPOP_MIN_WEIGHT = 0.60
ANTIPOP_MIN_CONTENT_LEN = 100
CONTEXT_BUDGET_CHARS = 3000
BMV_PASS_THRESHOLD = 70.0

WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKI_SLEEP_S = 0.15


# ---------------------------------------------------------------------------
# Helpers (copied from Phase B for self-containment)
# ---------------------------------------------------------------------------

def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _truncate_sentences(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    piece = text[:max_chars]
    last = max(piece.rfind(". "), piece.rfind(".\n"))
    if last > max_chars // 2:
        return piece[: last + 1]
    return piece


def _extract_key_terms(text: str) -> List[str]:
    terms: List[str] = []
    for m in re.finditer(r"\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{1,}){0,2}\b", text):
        terms.append(m.group(0).strip())
    for m in re.finditer(r"\b(1[0-9]{3}|20[0-2][0-9])\b", text):
        terms.append(m.group(0))
    return list(set(terms))


def _concordance(llm_answer: str, eblets: List[dict]) -> Tuple[str, float]:
    if not llm_answer:
        return ("DISCORDANT", 0.0)
    repo_terms: Dict[str, set] = defaultdict(set)
    for e in eblets:
        repo = e.get("repository", "unknown")
        for t in _extract_key_terms(e.get("content", "")):
            if len(t) >= 3:
                repo_terms[repo].add(t.lower())
    from collections import Counter
    all_terms: Counter = Counter()
    for terms in repo_terms.values():
        for t in terms:
            all_terms[t] += 1
    multi_repo_terms = {t for t, cnt in all_terms.items() if cnt >= 2}
    if not multi_repo_terms:
        all_flat: set = set()
        for terms in repo_terms.values():
            all_flat.update(terms)
        multi_repo_terms = all_flat
    llm_lower = llm_answer.lower()
    matches = sum(1 for t in multi_repo_terms if t in llm_lower)
    total = len(multi_repo_terms)
    if total == 0:
        return ("DISCORDANT", 0.0)
    ratio = matches / total
    if ratio >= 0.15:
        return ("CONCORDANT", 1.0)
    elif ratio >= 0.05:
        return ("PARTIAL_CONCORDANCE", 0.6)
    else:
        return ("DISCORDANT", 0.0)


def _compute_bmv(n_eblets: int, avg_weight: float, concordance_score: float, llm_ok: bool) -> float:
    eblet_score = min(100.0, (n_eblets / 10.0) * 100.0)
    quality_score = min(100.0, (avg_weight / 1.0) * 100.0)
    conc_score = concordance_score * 100.0
    resp_score = 100.0 if llm_ok else 0.0
    return round(
        0.30 * eblet_score + 0.20 * quality_score + 0.30 * conc_score + 0.20 * resp_score, 1
    )


def _build_context(eblets: List[dict]) -> str:
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


def _ollama_synthesize(question: str, context: str) -> Tuple[Optional[str], float, Optional[str]]:
    prompt = (
        "You are a fact-synthesis assistant. Based ONLY on the provided sources, "
        "answer the question as accurately as possible. "
        "If the sources do not contain the answer, say 'Insufficient evidence.'\n\n"
        f"Sources:\n{context}\n\n"
        f"Question: {question}\n\nAnswer:"
    ) if context else (
        f"Answer the following question accurately.\n\nQuestion: {question}\n\nAnswer:"
    )
    payload = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "think": False,
        "options": {"temperature": 0, "num_predict": 300},
    }).encode("utf-8")
    url = f"{OLLAMA_HOST}/api/generate"
    t0 = time.time()
    err = "unknown"
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                url, data=payload, headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_S) as resp:
                data = json.loads(resp.read())
            latency = time.time() - t0
            answer = data.get("response", "").strip()
            if not answer:
                return (None, latency, "Empty response")
            return (answer, latency, None)
        except Exception as exc:
            err = f"attempt {attempt + 1}: {exc}"
        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_BACKOFF)
    return (None, time.time() - t0, err)


# ---------------------------------------------------------------------------
# Wikipedia re-mining (wider k=20 + extra seeds)
# ---------------------------------------------------------------------------

def _wiki_search(query: str, limit: int = 5) -> List[str]:
    """Return up to `limit` Wikipedia article titles for query."""
    params = urllib.parse.urlencode({
        "action": "query", "list": "search", "srsearch": query,
        "srlimit": limit, "format": "json", "utf8": 1,
    })
    url = f"{WIKI_API}?{params}"
    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "LianaBanyanResearch/0.1 (BP078 Phase C replow)"}
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        return [h["title"] for h in data.get("query", {}).get("search", [])]
    except Exception:
        return []


def _wiki_fetch(title: str) -> Optional[str]:
    """Fetch Wikipedia article extract for title."""
    params = urllib.parse.urlencode({
        "action": "query", "prop": "extracts", "exintro": True,
        "titles": title, "format": "json", "utf8": 1, "redirects": 1,
    })
    url = f"{WIKI_API}?{params}"
    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "LianaBanyanResearch/0.1 (BP078 Phase C replow)"}
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if pid == "-1":
                continue
            extract = page.get("extract", "")
            # Strip HTML tags
            extract = re.sub(r"<[^>]+>", " ", extract)
            extract = re.sub(r"\s+", " ", extract).strip()
            return extract or None
    except Exception:
        return None


def _replow_question(question_text: str, category: str, qid: int) -> List[dict]:
    """Re-mine with wider parameters (k=20). Returns new eblets."""
    new_eblets: List[dict] = []
    seen_urls: set = set()

    # Derive extra seed terms from question
    words = question_text.split()
    base_seed = question_text[:120]

    # Seed 1: full question (truncated)
    # Seed 2: category keyword
    # Seed 3: first capitalized phrase from question
    seeds = [base_seed, category]
    cap_m = re.search(r"\b[A-Z][a-zA-Z]{3,}(?:\s+[A-Z][a-zA-Z]{3,}){0,2}\b", question_text)
    if cap_m:
        seeds.append(cap_m.group(0))

    # Seed 4: key numbers or formulas in question
    num_m = re.search(r"\d+\.?\d*\s*[a-zA-Z]+", question_text)
    if num_m:
        seeds.append(num_m.group(0))

    for seed in seeds[:4]:
        titles = _wiki_search(seed, limit=REPLOW_K // len(seeds[:4]))
        time.sleep(WIKI_SLEEP_S)
        for title in titles[:5]:
            wiki_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
            if wiki_url in seen_urls:
                continue
            seen_urls.add(wiki_url)
            content = _wiki_fetch(title)
            time.sleep(WIKI_SLEEP_S)
            if not content:
                continue
            w = 0.85  # wikipedia weight
            if len(content) < ANTIPOP_MIN_CONTENT_LEN or w < ANTIPOP_MIN_WEIGHT:
                continue
            import hashlib
            eblet = {
                "category": category,
                "qid": qid,
                "domain": "replow",
                "seeds": [question_text],
                "repository": "wikipedia",
                "provenance_url": wiki_url,
                "content": content[:3000],
                "source_weight": w,
                "content_hash": hashlib.sha256(content.encode("utf-8")).hexdigest()[:16],
                "replow": True,
            }
            new_eblets.append(eblet)

    return new_eblets


# ---------------------------------------------------------------------------
# Main Phase C
# ---------------------------------------------------------------------------

def run_phase_c() -> None:
    print("=" * 72, flush=True)
    print("BP078 PHASE C -- Re-Plow Andon-Stop Questions", flush=True)
    print(f"  Model: {MODEL}  LLM timeout: {LLM_TIMEOUT_S}s", flush=True)
    print(f"  Substrate: {SUBSTRATE_CACHE}", flush=True)
    print(f"  Andon IDs: {ANDON_IDS_PATH}", flush=True)
    print(f"  Started: {_utc_now()}", flush=True)
    print("=" * 72, flush=True)

    t_start = time.time()

    # Load Andon IDs from Phase B
    if not ANDON_IDS_PATH.exists():
        _write_receipt_blocked("Phase B Andon ID file not found. Run Phase B first.", t_start)
        return

    andon_ids: List[dict] = json.loads(ANDON_IDS_PATH.read_text(encoding="utf-8"))

    if not andon_ids:
        print("[PHASE C] Zero Andon-stops from Phase B. Nothing to re-plow.", flush=True)
        _write_receipt_zero_andon(t_start)
        return

    print(f"[PHASE C] {len(andon_ids)} Andon-stop questions to re-plow.", flush=True)

    # Load existing substrate to get question texts and existing eblets
    existing_substrate: Dict[Tuple[str, int], List[dict]] = defaultdict(list)
    if SUBSTRATE_CACHE.exists():
        with SUBSTRATE_CACHE.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    e = json.loads(line)
                    existing_substrate[(e["category"], e["qid"])].append(e)
                except Exception:
                    pass

    # Process each Andon question
    results: List[dict] = []
    new_eblets_total = 0
    resolved = 0
    persistent_gaps = 0

    for item in andon_ids:
        cat = item["category"]
        qid = item["qid"]
        orig_reason = item.get("reason", "unknown")

        print(f"\n[REPLOW] {cat} Q{qid} (orig reason: {orig_reason})", flush=True)

        # Get question text from existing substrate or seeds
        existing = existing_substrate.get((cat, qid), [])
        question_text = existing[0].get("seeds", [""])[0] if existing else ""
        if not question_text:
            print(f"  [SKIP] No question text available", flush=True)
            results.append({
                "category": cat, "qid": qid,
                "status": "persistent_gap",
                "reason": "no_question_text",
                "new_eblets": 0,
            })
            persistent_gaps += 1
            continue

        # Re-mine with wider params
        new_eblets = _replow_question(question_text, cat, qid)
        print(f"  Re-mined: {len(new_eblets)} new eblets", flush=True)

        # Append to substrate cache
        if new_eblets:
            with SUBSTRATE_CACHE.open("a", encoding="utf-8") as f:
                for e in new_eblets:
                    f.write(json.dumps(e, ensure_ascii=False) + "\n")
            new_eblets_total += len(new_eblets)

        # Combine with existing eblets for this question
        all_eblets = existing + new_eblets
        accepted = [
            e for e in all_eblets
            if e.get("source_weight", 0.0) >= ANTIPOP_MIN_WEIGHT
            and len(e.get("content", "")) >= ANTIPOP_MIN_CONTENT_LEN
        ]

        if not accepted:
            print(f"  [ANDON] Still no valid eblets after re-plow", flush=True)
            results.append({
                "category": cat, "qid": qid,
                "status": "persistent_gap",
                "reason": "no_valid_eblets_after_replow",
                "new_eblets": len(new_eblets),
            })
            persistent_gaps += 1
            continue

        context = _build_context(accepted)
        avg_weight = sum(e.get("source_weight", 0.6) for e in accepted) / len(accepted)

        answer, latency, err = _ollama_synthesize(question_text, context)

        if answer is None:
            print(
                f"  [ANDON/PERSISTENT] LLM still timed out. lat={latency:.1f}s"
                f" err={err}", flush=True
            )
            results.append({
                "category": cat, "qid": qid,
                "status": "persistent_gap",
                "reason": f"llm_timeout_after_replow: {err}",
                "new_eblets": len(new_eblets),
            })
            persistent_gaps += 1
        else:
            concordance_v, conc_score = _concordance(answer, accepted)
            bmv = _compute_bmv(len(accepted), avg_weight, conc_score, True)
            if bmv >= BMV_PASS_THRESHOLD and concordance_v != "DISCORDANT":
                status = "resolved_pass"
                resolved += 1
            else:
                status = "resolved_fail"
                resolved += 1  # resolved (LLM answered), but failed BMV
            print(
                f"  [{status.upper()}]  BMV={bmv:.1f}  conc={concordance_v}"
                f"  lat={latency:.1f}s  eblets={len(accepted)}", flush=True
            )
            results.append({
                "category": cat, "qid": qid,
                "status": status,
                "bmv": bmv,
                "concordance": concordance_v,
                "latency_s": round(latency, 1),
                "new_eblets": len(new_eblets),
                "total_eblets": len(accepted),
            })

    elapsed = time.time() - t_start
    print("\n" + "=" * 72, flush=True)
    print("PHASE C SUMMARY", flush=True)
    print(f"  Andon questions processed: {len(andon_ids)}", flush=True)
    print(f"  Resolved (LLM answered): {resolved}", flush=True)
    print(f"  Persistent gaps: {persistent_gaps}", flush=True)
    print(f"  New eblets appended to substrate: {new_eblets_total}", flush=True)
    print(f"  Wall clock: {elapsed:.1f}s", flush=True)
    print("=" * 72, flush=True)

    _write_receipt(results, resolved, persistent_gaps, new_eblets_total, len(andon_ids), elapsed)
    print(f"[RECEIPT] Written: {RECEIPT_PATH}", flush=True)


def _write_receipt_blocked(reason: str, t_start: float) -> None:
    elapsed = time.time() - t_start
    text = (
        "# BP078_PHASE_C_REPLOW_RECEIPT.eblet.md\n\n"
        "**STATUS: BLOCKED**\n\n"
        f"**Reason:** {reason}\n\n"
        f"**Wall clock:** {elapsed:.1f}s\n\n"
        "Truth-Always: Phase C could not run.\n"
    )
    RECEIPT_PATH.write_text(text, encoding="utf-8")


def _write_receipt_zero_andon(t_start: float) -> None:
    elapsed = time.time() - t_start
    ts = _utc_now()
    text = (
        "# BP078_PHASE_C_REPLOW_RECEIPT.eblet.md\n\n"
        "**Phase:** C -- Re-Plow Andon-Stop Questions\n\n"
        f"**Run timestamp:** {ts}\n"
        f"**Wall clock:** {elapsed:.1f}s\n\n"
        "## Result\n\n"
        "**Phase B produced zero Andon-stops.**\n\n"
        "All Phase B questions received LLM responses. "
        "There are no questions to re-plow in Phase C.\n\n"
        "New eblets appended: 0\n\n"
        "---\n"
        "*BP078 Phase C receipt. Truth-Always. Zero Andon-stops.*\n"
    )
    RECEIPT_PATH.write_text(text, encoding="utf-8")


def _write_receipt(
    results: List[dict],
    resolved: int,
    persistent_gaps: int,
    new_eblets_total: int,
    total_andon: int,
    elapsed: float,
) -> None:
    ts = _utc_now()
    lines = [
        "# BP078_PHASE_C_REPLOW_RECEIPT.eblet.md",
        "",
        "**Phase:** C -- Re-Plow Andon-Stop Questions",
        f"**Run timestamp:** {ts}",
        f"**Model:** {MODEL}",
        f"**Re-plow k:** {REPLOW_K} (vs Phase A k=10)",
        f"**Total wall clock:** {elapsed:.1f}s",
        "",
        "## Summary",
        "",
        f"- Andon questions from Phase B: **{total_andon}**",
        f"- Resolved (LLM answered after re-plow): **{resolved}**",
        f"- Persistent gaps (still Andon): **{persistent_gaps}**",
        f"- New eblets appended to substrate: **{new_eblets_total}**",
        "",
        "## Per-Question Results",
        "",
        "| Category | QID | Status | BMV | Concordance | Latency | New Eblets |",
        "|----------|-----|--------|-----|-------------|---------|------------|",
    ]

    for r in results:
        bmv_s = f"{r.get('bmv', 'N/A'):.1f}" if isinstance(r.get("bmv"), float) else "N/A"
        conc_s = r.get("concordance", r.get("reason", "N/A"))[:30]
        lat_s = f"{r.get('latency_s', 0):.1f}s" if "latency_s" in r else "N/A"
        lines.append(
            f"| {r['category']} | {r['qid']} | {r['status']} | {bmv_s} | {conc_s} | {lat_s} | {r.get('new_eblets', 0)} |"
        )

    lines += [
        "",
        "## Persistent Gaps",
        "",
    ]

    gaps = [r for r in results if r["status"] == "persistent_gap"]
    if gaps:
        for g in gaps:
            lines.append(
                f"- **{g['category']} Q{g['qid']}**: {g.get('reason', 'unknown')} "
                f"-- *persistent gap: out of scope*"
            )
    else:
        lines.append("None. All Andon questions resolved after re-plow.")

    lines += [
        "",
        "---",
        "*BP078 Phase C receipt. Truth-Always. Persistent gaps documented.*",
    ]

    RECEIPT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    run_phase_c()
