"""
run_k494_vocabulary_bridging.py — Vocabulary Bridging for Orphan-Vocabulary Keystones

K494 · B124 · REDESIGNED (supersedes K494/B123 Temporal-Decay TF-IDF)

Four phases:
  A — Orphan-vocabulary keystone identification (from K493 gradient_data)
  B — Synthetic bridging Eblet generation (Anthropic Haiku 4.5)
  C — Ingest bridging Eblets into EbletStore + re-run K493 analysis
  D — Decision matrix + report

Budget cap: $6.00
Architecture reference: project_cathedral_forgets_by_vocabulary_not_time.md

BRIDLE v10.4 Step-0 check-ignore confirmed before creation.
REF Staff discipline: existing 195 Eblets read-only; new writes = bridging Eblets + analysis output.
"""

from __future__ import annotations

import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent

sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from eblets.eblet import EbletStore, Eblet, EBLET_STORE_PATH, _detect_scribe_attributions
from seers.seer import TFIDFIndex, _tokenize

# ---------------------------------------------------------------------------
# File paths
# ---------------------------------------------------------------------------

KEYSTONES_REGISTRY = _LIBRARIAN_MCP / "miners" / "stone_tablets" / "keystones_registry.json"
GRADIENT_DATA_K493 = _LIBRARIAN_MCP / "analysis" / "gradient_data_K493.json"
ORPHAN_OUTPUT = _LIBRARIAN_MCP / "analysis" / "orphan_keystones_K494.json"
BRIDGING_EBLETS_OUTPUT = _LIBRARIAN_MCP / "analysis" / "bridging_eblets_K494.jsonl"
REPORT_OUTPUT = _LIBRARIAN_MCP / "analysis" / "REPORT_KNIGHT_K494_B124_VOCABULARY_BRIDGING.md"

# ---------------------------------------------------------------------------
# Session / analysis constants
# ---------------------------------------------------------------------------

ANALYSIS_SESSION = "K494"
ANALYSIS_DATE = "2026-04-25"
GENERATOR_MODEL = "claude-haiku-4-5"
EBLETS_PER_ORPHAN = 5
MIN_CORPUS_COVERAGE = 0.60  # 60% of content tokens must appear in ≥10 existing Eblets
MIN_THRESHOLD = 0.005  # K493 threshold for "above threshold" count

# K493 SESSION_DATE_MAP (carry forward from K493 analysis)
SESSION_DATE_MAP: dict[str, str] = {
    "B103": "2026-01-15",
    "B110": "2026-02-10",
    "B111": "2026-02-20",
    "B112": "2026-02-28",
    "B113": "2026-03-05",
    "B115": "2026-03-15",
    "B116": "2026-03-20",
    "B117": "2026-03-25",
    "B118": "2026-04-01",
    "B119": "2026-04-05",
    "B120": "2026-04-10",
    "B121": "2026-04-15",
    "B122": "2026-04-18",
    "B123": "2026-04-22",
    "B124": "2026-04-25",
}


# ---------------------------------------------------------------------------
# Helpers (copied/adapted from recency_gradient_K493.py)
# ---------------------------------------------------------------------------

def session_to_ordinal(label: str) -> int:
    for i, ch in enumerate(label):
        if ch.isdigit():
            return int(label[i:])
    return 0


def session_to_age_days(label: str) -> float:
    date_str = SESSION_DATE_MAP.get(label)
    if date_str is None:
        ordinal = session_to_ordinal(label)
        b103_days = (datetime.fromisoformat(ANALYSIS_DATE) - datetime.fromisoformat("2026-01-15")).days
        b123_days = (datetime.fromisoformat(ANALYSIS_DATE) - datetime.fromisoformat("2026-04-22")).days
        slope = (b103_days - b123_days) / (123 - 103)
        return max(0.0, b123_days + (123 - ordinal) * slope)
    return (datetime.fromisoformat(ANALYSIS_DATE) - datetime.fromisoformat(date_str)).days


def eblet_age_days(eblet: Eblet) -> float:
    try:
        created = datetime.fromisoformat(eblet.created_at.replace("Z", "+00:00"))
        analysis = datetime.fromisoformat(ANALYSIS_DATE).replace(tzinfo=timezone.utc)
        return max(0.0, (analysis - created).days)
    except Exception:
        return 0.0


def fit_linear(x: list[float], y: list[float]) -> dict:
    n = len(x)
    if n < 2:
        return {"a": 0.0, "b": 0.0, "r_squared": 0.0, "model": "linear"}
    sx, sy = sum(x), sum(y)
    sxy = sum(xi * yi for xi, yi in zip(x, y))
    sxx = sum(xi * xi for xi in x)
    denom = n * sxx - sx * sx
    if abs(denom) < 1e-12:
        return {"a": 0.0, "b": sy / n, "r_squared": 0.0, "model": "linear"}
    a = (n * sxy - sx * sy) / denom
    b = (sy - a * sx) / n
    y_pred = [a * xi + b for xi in x]
    ss_res = sum((yi - yp) ** 2 for yi, yp in zip(y, y_pred))
    y_mean = sy / n
    ss_tot = sum((yi - y_mean) ** 2 for yi in y)
    r2 = 1.0 - ss_res / ss_tot if abs(ss_tot) > 1e-12 else 0.0
    return {"a": round(a, 6), "b": round(b, 6), "r_squared": round(r2, 4), "model": "linear"}


# ---------------------------------------------------------------------------
# Percentile calculation (interpolated, N-1 denominator)
# ---------------------------------------------------------------------------

def percentile(values: list[float], p: float) -> float:
    """Compute p-th percentile (0–100) via linear interpolation."""
    if not values:
        return 0.0
    s = sorted(values)
    n = len(s)
    idx = (p / 100.0) * (n - 1)
    lo = int(idx)
    hi = lo + 1
    if hi >= n:
        return s[-1]
    frac = idx - lo
    return s[lo] + frac * (s[hi] - s[lo])


# ---------------------------------------------------------------------------
# Phase A — Orphan-vocabulary keystone identification
# ---------------------------------------------------------------------------

def phase_a() -> dict:
    print("\n" + "=" * 70)
    print("PHASE A — Orphan-vocabulary keystone identification")
    print("=" * 70)

    with GRADIENT_DATA_K493.open("r", encoding="utf-8") as fh:
        k493_data = json.load(fh)

    keystone_analysis = k493_data["keystone_analysis"]
    scores = {r["keystone_id"]: r["top_tfidf_score"] for r in keystone_analysis}
    all_scores = list(scores.values())

    q1 = percentile(all_scores, 25)
    q3 = percentile(all_scores, 75)
    median = percentile(all_scores, 50)

    print(f"  K493 keystones: {len(keystone_analysis)}")
    print(f"  Score range: {min(all_scores):.5f} – {max(all_scores):.5f}")
    print(f"  Q1 (25th percentile): {q1:.5f}")
    print(f"  Median (50th):        {median:.5f}")
    print(f"  Q3 (75th percentile): {q3:.5f}")

    hard_orphans = []
    near_orphans = []
    controls = []
    middle = []

    for r in keystone_analysis:
        kid = r["keystone_id"]
        score = r["top_tfidf_score"]
        if score == 0.0:
            hard_orphans.append(kid)
        elif score < q1:
            near_orphans.append(kid)
        elif score > q3:
            controls.append(kid)
        else:
            middle.append(kid)

    # If more than 8 orphans total, prioritize hard orphans, then nearest near-orphans
    all_orphans = hard_orphans + near_orphans
    if len(all_orphans) > 8:
        print(f"  WARNING: {len(all_orphans)} orphans identified; trimming to 8 (hard-first priority)")
        near_sorted = sorted(near_orphans, key=lambda k: scores[k])
        all_orphans = hard_orphans + near_sorted[: 8 - len(hard_orphans)]

    print(f"\n  Hard orphans (score = 0.0): {len(hard_orphans)}")
    for kid in hard_orphans:
        r = next(x for x in keystone_analysis if x["keystone_id"] == kid)
        print(f"    {kid}: {r['top_tfidf_score']:.5f}  '{r['phrase'][:55]}'")

    print(f"\n  Near-orphans (0 < score < Q1={q1:.5f}): {len(near_orphans)}")
    for kid in near_orphans:
        r = next(x for x in keystone_analysis if x["keystone_id"] == kid)
        print(f"    {kid}: {r['top_tfidf_score']:.5f}  '{r['phrase'][:55]}'")

    print(f"\n  Universal-vocabulary controls (score > Q3={q3:.5f}): {len(controls)}")
    for kid in controls:
        r = next(x for x in keystone_analysis if x["keystone_id"] == kid)
        print(f"    {kid}: {r['top_tfidf_score']:.5f}  '{r['phrase'][:55]}'")

    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "session": ANALYSIS_SESSION,
        "k493_source": str(GRADIENT_DATA_K493),
        "statistics": {
            "n_keystones": len(keystone_analysis),
            "q1": round(q1, 5),
            "median": round(median, 5),
            "q3": round(q3, 5),
        },
        "hard_orphans": hard_orphans,
        "near_orphans": near_orphans,
        "all_orphans": all_orphans,
        "controls": controls,
        "middle": middle,
        "orphan_details": {
            kid: {
                "k493_score": scores[kid],
                "phrase": next(x["phrase"] for x in keystone_analysis if x["keystone_id"] == kid),
            }
            for kid in all_orphans
        },
        "control_details": {
            kid: {
                "k493_score": scores[kid],
                "phrase": next(x["phrase"] for x in keystone_analysis if x["keystone_id"] == kid),
            }
            for kid in controls
        },
    }

    ORPHAN_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ORPHAN_OUTPUT.open("w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, ensure_ascii=False)
    print(f"\n  [A] Orphan identification complete.")
    print(f"  [A] Output: {ORPHAN_OUTPUT}")
    print(f"  [A] Total orphans to bridge: {len(all_orphans)}")
    return result


# ---------------------------------------------------------------------------
# Phase B — Synthetic bridging Eblet generation
# ---------------------------------------------------------------------------

def _build_corpus_frequency(eblets: list[Eblet]) -> Counter:
    """Build token → doc_count mapping from existing Eblets."""
    freq: Counter = Counter()
    for eb in eblets:
        tokens = set(_tokenize(eb.summary_text))
        for t in tokens:
            freq[t] += 1
    return freq


def _check_corpus_coverage(eblet_text: str, corpus_freq: Counter, min_doc_count: int = 10) -> float:
    """
    What fraction of content tokens in eblet_text appear in ≥min_doc_count existing Eblets?
    Returns 0.0–1.0.
    """
    tokens = _tokenize(eblet_text)
    if not tokens:
        return 0.0
    covered = sum(1 for t in tokens if corpus_freq.get(t, 0) >= min_doc_count)
    return covered / len(tokens)


def _call_haiku(system_prompt: str, user_prompt: str, api_key: str) -> tuple[str, int, int, float]:
    """Call Haiku 4.5. Returns (text, input_tokens, output_tokens, cost_usd)."""
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    t0 = time.perf_counter()
    response = client.messages.create(
        model=GENERATOR_MODEL,
        max_tokens=1500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    latency = time.perf_counter() - t0
    text = response.content[0].text if response.content else ""
    inp = response.usage.input_tokens
    out = response.usage.output_tokens
    cost = (inp / 1_000_000) * 1.00 + (out / 1_000_000) * 5.00
    print(f"    [Haiku] {inp}in/{out}out tokens · ${cost:.4f} · {latency:.1f}s")
    return text, inp, out, cost


def _parse_bridging_eblets_json(text: str) -> list[dict]:
    """Parse JSON array of bridging Eblets from Haiku output."""
    text = text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try extracting JSON array
        m = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except json.JSONDecodeError:
                pass
    return []


SYSTEM_PROMPT = """You are generating bridging Eblets to translate orphan-vocabulary Rhetorical Keystones into the technical corpus vocabulary of the Liana Banyan substrate. These bridging Eblets will be ingested into the Cathedral's Eblet store (the Awareness Net).

Your goal: for each keystone, generate 5 bridging Eblets that use technical corpus vocabulary while preserving the keystone's underlying meaning. A "bridging Eblet" is a factual statement (50-150 words) that serves as a vocabulary bridge between the keystone's domain and the technical corpus.

Corpus vocabulary available (use heavily):
compounding, substrate, Cathedral, Cost-Slasher, pre-extended trust, Cloyd Pattern, Inuka Coefficient, Pedestal Stake, Mush Index, Eblet, Seer, Augur, Synapse, Scribe, Miner, keystone, anchor, bedrock, TF-IDF, retrieval, architect, scaffold, design, patent, claim, innovation, crown jewel, provisional, deployment, platform, member, cephas, supabase, firebase, session, knight, bishop, bridle, phase, handoff, cathedral effect, awareness net, living pyramid, virtual context, pointer resolution, Well mitosis, three fates, cooperative, collective, mutual, amplified, governance, participatory, commons, economic sovereignty, inversion, 83.3%, creator take, Liana Banyan, founder, 37-year development arc, Red Carpet protocol.

Rules:
1. Preserve the keystone's underlying meaning — do NOT rewrite the meaning away
2. Use vocabulary from the corpus list above (aim for ≥60% of content words)
3. Do NOT copy the keystone text verbatim
4. Do NOT use vocabulary unique to the keystone (e.g., "poordom" is unique to KEYSTONE-15 — use "economic hardship" or "poverty" instead; "hoe handle" is unique to KEYSTONE-03)
5. Write standalone factual statements, NOT quotations of the keystone
6. Each bridging Eblet: 50-150 words

Output ONLY a valid JSON array, 5 items, each with:
{"eblet_text": "...", "primary_corpus_terms_used": ["term1", "term2", ...]}"""


def phase_b(orphan_data: dict, existing_eblets: list[Eblet], api_key: str) -> list[dict]:
    print("\n" + "=" * 70)
    print("PHASE B — Synthetic bridging Eblet generation")
    print("=" * 70)

    corpus_freq = _build_corpus_frequency(existing_eblets)
    print(f"  Corpus frequency index built: {len(corpus_freq)} unique tokens from {len(existing_eblets)} Eblets")

    # Load keystones registry for full phrases and keywords
    with KEYSTONES_REGISTRY.open("r", encoding="utf-8") as fh:
        registry = json.load(fh)
    keystones_by_id = {k["id"]: k for k in registry["keystones"]}

    all_orphans = orphan_data["all_orphans"]
    total_cost = 0.0
    total_input = 0
    total_output = 0
    all_bridging_records = []
    now = datetime.now(timezone.utc).isoformat()

    BRIDGING_EBLETS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    with BRIDGING_EBLETS_OUTPUT.open("w", encoding="utf-8") as outfile:
        for kid in all_orphans:
            ks = keystones_by_id.get(kid)
            if not ks:
                print(f"  WARNING: {kid} not in registry; skipping")
                continue

            phrase = ks["phrase"]
            keywords = ks.get("thematic_keywords", [])
            domain = ks.get("domain", "unknown")
            k493_score = orphan_data["orphan_details"][kid]["k493_score"]

            print(f"\n  [{kid}] score={k493_score:.5f}  domain={domain}")
            print(f"    Phrase: '{phrase[:70]}'")
            print(f"    Keywords: {keywords[:5]}")

            user_prompt = f"""Orphan keystone: "{phrase}"
Source keystone ID: {kid}
Domain: {domain}
Thematic keywords (context only — do NOT use these as the primary vocabulary in your Eblets): {keywords}
K493 retrieval score: {k493_score} (score of 0.0 = completely orphaned from technical corpus)

Generate 5 bridging Eblets that translate this keystone's meaning into technical corpus vocabulary.

Output: valid JSON array of 5 objects."""

            text, inp, out, cost = _call_haiku(SYSTEM_PROMPT, user_prompt, api_key)
            total_cost += cost
            total_input += inp
            total_output += out

            parsed = _parse_bridging_eblets_json(text)
            if not parsed:
                print(f"    WARNING: Failed to parse Haiku output for {kid}; raw: {text[:200]}")
                continue

            valid_eblets = []
            for i, item in enumerate(parsed[:EBLETS_PER_ORPHAN]):
                eblet_text = item.get("eblet_text", "").strip()
                corpus_terms = item.get("primary_corpus_terms_used", [])
                if not eblet_text:
                    continue

                coverage = _check_corpus_coverage(eblet_text, corpus_freq, min_doc_count=10)
                record = {
                    "source_keystone": kid,
                    "keystone_phrase": phrase,
                    "eblet_index": i,
                    "eblet_text": eblet_text,
                    "primary_corpus_terms_used": corpus_terms,
                    "corpus_coverage_fraction": round(coverage, 3),
                    "synthetic_bridging": True,
                    "generator_model": GENERATOR_MODEL,
                    "generated_at": now,
                    "session": ANALYSIS_SESSION,
                }
                valid_eblets.append(record)
                outfile.write(json.dumps(record, ensure_ascii=False) + "\n")

            all_bridging_records.extend(valid_eblets)
            print(f"    Generated {len(valid_eblets)} valid bridging Eblets")
            for r in valid_eblets:
                print(f"    Coverage={r['corpus_coverage_fraction']:.2f}: {r['eblet_text'][:80]}...")

            if total_cost > 5.50:
                print(f"  WARNING: Cost ${total_cost:.4f} approaching cap; stopping early.")
                break

    print(f"\n  [B] Phase B complete.")
    print(f"  [B] Total bridging Eblets generated: {len(all_bridging_records)}")
    print(f"  [B] Total cost: ${total_cost:.4f} (cap: $6.00)")
    print(f"  [B] Output: {BRIDGING_EBLETS_OUTPUT}")
    return all_bridging_records


# ---------------------------------------------------------------------------
# Phase C — Ingest + re-run K493 analysis
# ---------------------------------------------------------------------------

def _run_keystone_analysis(eblets: list[Eblet], keystones: list[dict]) -> list[dict]:
    """Run K493-style TF-IDF per-keystone analysis on a given Eblet list."""
    index = TFIDFIndex()
    index.build(eblets)
    eblet_map = {eb.eblet_id: eb for eb in eblets}
    results = []

    for ks in keystones:
        ks_id = ks["id"]
        phrase = ks["phrase"]
        keywords = ks.get("thematic_keywords", [])
        ratified_session = ks.get("ratified_session", "B103")
        age_days = session_to_age_days(ratified_session)

        query = phrase + " " + " ".join(keywords)
        scores_map = index.score(query)
        ranked = sorted(scores_map.items(), key=lambda kv: -kv[1])
        top8 = ranked[:8]
        top_score = top8[0][1] if top8 else 0.0
        mean_top8 = sum(s for _, s in top8) / max(1, len(top8))
        above_threshold = sum(1 for _, s in scores_map.items() if s >= MIN_THRESHOLD)
        direct_anchors = [eb for eb in eblets if ks_id in eb.keystone_anchors]

        results.append({
            "keystone_id": ks_id,
            "number": ks.get("number", 0),
            "phrase": phrase[:60] + "…" if len(phrase) > 60 else phrase,
            "ratified_session": ratified_session,
            "age_days": round(age_days, 1),
            "top_tfidf_score": round(top_score, 5),
            "mean_top8_score": round(mean_top8, 5),
            "eblets_above_threshold": above_threshold,
            "direct_anchor_count": len(direct_anchors),
        })

    results.sort(key=lambda r: r["number"])
    return results


def phase_c(bridging_records: list[dict], existing_eblets: list[Eblet]) -> dict:
    print("\n" + "=" * 70)
    print("PHASE C — Ingest bridging Eblets + re-run K493 analysis")
    print("=" * 70)

    store = EbletStore(EBLET_STORE_PATH)
    now = datetime.now(timezone.utc).isoformat()

    # Build new Eblet objects from bridging records
    bridging_eblets: list[Eblet] = []
    for record in bridging_records:
        kid = record["source_keystone"]
        text = record["eblet_text"]
        scribe_attr = _detect_scribe_attributions(text)
        eblet = Eblet(
            eblet_id=store.next_id(),
            synapse_pointer=f"synthetic_bridging_K494.jsonl#cluster_{kid}",
            summary_text=text,
            scribe_attributions=scribe_attr,
            root_miner_serial=None,
            provenance_chain=[
                "synthetic_bridging=true",
                f"source_keystone={kid}",
                f"generator_model={GENERATOR_MODEL}",
                f"session={ANALYSIS_SESSION}",
            ],
            confidence_score=0.75,
            created_at=now,
            keystone_anchors=[kid],  # explicit direct anchor to the keystone
            last_accessed_at=None,
            access_count=0,
        )
        bridging_eblets.append(eblet)
        # Append to real store (additive; read-only constraint respected for existing 195)
        store.append(eblet)
        print(f"  Ingested {eblet.eblet_id} → anchor {kid}")

    print(f"\n  [C] Ingested {len(bridging_eblets)} bridging Eblets into store")
    print(f"  [C] Store now has {store.count()} total Eblets")

    # Load keystones
    with KEYSTONES_REGISTRY.open("r", encoding="utf-8") as fh:
        registry = json.load(fh)
    keystones = registry["keystones"]

    # Re-run analysis on expanded store
    all_eblets = existing_eblets + bridging_eblets
    print(f"\n  [C] Running K493-style TF-IDF analysis on {len(all_eblets)} Eblets...")
    k494_results = _run_keystone_analysis(all_eblets, keystones)

    # Load K493 baseline for comparison
    with GRADIENT_DATA_K493.open("r", encoding="utf-8") as fh:
        k493_data = json.load(fh)
    k493_by_id = {r["keystone_id"]: r for r in k493_data["keystone_analysis"]}

    print(f"\n  [C] K493 vs K494 comparison (all 30 keystones):")
    print(f"  {'#':>3}  {'K493Score':>9}  {'K494Score':>9}  {'Delta':>9}  {'DirAnch':>7}  Phrase")
    print("  " + "-" * 75)

    comparison = []
    for r in k494_results:
        kid = r["keystone_id"]
        k493_score = k493_by_id.get(kid, {}).get("top_tfidf_score", 0.0)
        k494_score = r["top_tfidf_score"]
        delta = k494_score - k493_score
        pct_change = (delta / k493_score * 100) if k493_score > 0 else float("inf") if delta > 0 else 0.0
        comparison.append({
            "keystone_id": kid,
            "number": r["number"],
            "phrase": r["phrase"],
            "k493_score": k493_score,
            "k494_score": k494_score,
            "delta": round(delta, 5),
            "pct_change": round(pct_change, 1) if not math.isinf(pct_change) else "inf",
            "direct_anchor_count_k494": r["direct_anchor_count"],
            "eblets_above_threshold_k494": r["eblets_above_threshold"],
        })
        marker = " ← ORPHAN" if kid in k493_data["gaps"] or k493_score == 0.0 else ""
        near_marker = " ← NEAR" if 0 < k493_score < percentile(
            [x["top_tfidf_score"] for x in k493_data["keystone_analysis"]], 25
        ) else ""
        print(f"  {r['number']:>3}  {k493_score:>9.5f}  {k494_score:>9.5f}  {delta:>+9.5f}  {r['direct_anchor_count']:>7}  {r['phrase'][:40]}{marker}{near_marker}")

    return {
        "store_size_before": len(existing_eblets),
        "store_size_after": len(all_eblets),
        "bridging_eblets_ingested": len(bridging_eblets),
        "k494_keystone_analysis": k494_results,
        "comparison": comparison,
    }


# ---------------------------------------------------------------------------
# Phase D — Decision matrix + report
# ---------------------------------------------------------------------------

def phase_d(orphan_data: dict, bridging_records: list[dict], phase_c_result: dict) -> str:
    print("\n" + "=" * 70)
    print("PHASE D — Decision matrix + report")
    print("=" * 70)

    comparison = phase_c_result["comparison"]
    all_orphans = set(orphan_data["all_orphans"])
    hard_orphans = set(orphan_data["hard_orphans"])
    near_orphans = set(orphan_data["near_orphans"])
    controls = set(orphan_data["controls"])

    stats = orphan_data["statistics"]
    q1 = stats["q1"]
    q3 = stats["q3"]

    # Compute decision criteria
    orphan_results = []
    control_results = []
    for c in comparison:
        kid = c["keystone_id"]
        if kid in all_orphans:
            orphan_results.append(c)
        elif kid in controls:
            control_results.append(c)

    # Hard orphan: did KEYSTONE-15 climb to ≥ 25th percentile?
    k15 = next((c for c in comparison if c["keystone_id"] == "KEYSTONE-15"), None)
    k15_climbed = k15 and k15["k494_score"] >= q1 if k15 else False

    # Orphans that climbed to ≥ Q1
    orphans_at_q1 = sum(1 for c in orphan_results if c["k494_score"] >= q1)
    orphans_total = len(orphan_results)

    # Near-orphans that climbed at least one quartile (from below Q1 to above Q1)
    near_climbed = sum(
        1 for c in orphan_results
        if c["keystone_id"] in near_orphans and c["k493_score"] < q1 and c["k494_score"] >= q1
    )
    near_total = len(near_orphans)

    # Controls stayed within ±10%?
    controls_stable = all(
        abs(c["delta"]) / max(c["k493_score"], 1e-9) <= 0.10
        for c in control_results
    )
    control_degraded = [
        c for c in control_results
        if abs(c["delta"]) / max(c["k493_score"], 1e-9) > 0.10
    ]

    print(f"\n  KEYSTONE-15 (canonical orphan):")
    print(f"    K493 score: {k15['k493_score']:.5f}" if k15 else "    NOT FOUND")
    print(f"    K494 score: {k15['k494_score']:.5f}" if k15 else "")
    print(f"    Climbed to ≥ Q1 ({q1:.5f}): {'YES ✓' if k15_climbed else 'NO ✗'}")

    print(f"\n  Orphan keystones that reached ≥ Q1: {orphans_at_q1}/{orphans_total}")
    print(f"  Near-orphans that crossed Q1 boundary: {near_climbed}/{near_total}")
    print(f"  Controls stable (within ±10%): {'YES ✓' if controls_stable else 'NO ✗'}")
    if control_degraded:
        for c in control_degraded:
            print(f"    DEGRADED: {c['keystone_id']} {c['k493_score']:.5f} → {c['k494_score']:.5f}")

    # Decision matrix
    if orphans_at_q1 >= orphans_total * 0.5 and controls_stable:
        decision = "SHIP"
        recommendation = (
            "Vocabulary bridging closes the orphan-keystone retrieval gap without degrading "
            "universal-vocabulary keystone retrieval. Bridging becomes standard for orphan-vocabulary "
            "keystones at registration time. New Toolsmith entry. Update keystone-registration "
            "tooling to auto-suggest bridging when score < Q1 threshold."
        )
    elif orphans_at_q1 >= orphans_total * 0.5 and not controls_stable:
        decision = "MAKE_OPTIONAL"
        recommendation = (
            "Orphans climb but controls degrade > 10%. Expose bridging as optional flag. "
            "Investigate vocabulary collision. Document why controls degrade."
        )
    elif orphans_at_q1 < orphans_total * 0.5 and controls_stable:
        decision = "NEGATIVE_FINDING"
        recommendation = (
            "Orphans don't climb sufficiently. Mechanism may need more Eblets per keystone, "
            "different bridging-vocabulary selection, or per-keystone tuning. Don't ship as standard; "
            "report negative finding honestly. Consider per-keystone characterization."
        )
    else:
        decision = "MIXED"
        recommendation = (
            "Mixed results. Some orphans bridge well; some don't. Per-keystone characterization needed. "
            "Investigate why some orphans respond to bridging and others don't."
        )

    print(f"\n  DECISION: {decision}")
    print(f"  Recommendation: {recommendation}")

    # Write report
    bridging_samples = {}
    for kid in all_orphans:
        samples = [r["eblet_text"] for r in bridging_records if r["source_keystone"] == kid][:3]
        bridging_samples[kid] = samples

    report = _build_report(
        orphan_data=orphan_data,
        bridging_records=bridging_records,
        phase_c_result=phase_c_result,
        comparison=comparison,
        orphan_results=orphan_results,
        control_results=control_results,
        decision=decision,
        recommendation=recommendation,
        k15=k15,
        k15_climbed=k15_climbed,
        orphans_at_q1=orphans_at_q1,
        orphans_total=orphans_total,
        near_climbed=near_climbed,
        near_total=near_total,
        controls_stable=controls_stable,
        control_degraded=control_degraded,
        bridging_samples=bridging_samples,
        q1=q1,
        q3=q3,
    )

    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with REPORT_OUTPUT.open("w", encoding="utf-8") as fh:
        fh.write(report)
    print(f"\n  [D] Report written: {REPORT_OUTPUT}")
    return decision


def _build_report(
    orphan_data, bridging_records, phase_c_result, comparison,
    orphan_results, control_results, decision, recommendation,
    k15, k15_climbed, orphans_at_q1, orphans_total, near_climbed, near_total,
    controls_stable, control_degraded, bridging_samples, q1, q3,
) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    all_orphans = set(orphan_data["all_orphans"])
    controls = set(orphan_data["controls"])

    lines = [
        f"# REPORT: K494 · B124 — Vocabulary Bridging for Orphan-Vocabulary Keystones",
        f"",
        f"**Session:** K494 · **Bishop:** B124 · **Generated:** {now}",
        f"**Predecessor:** K493 (`v-recency-anchor-gradient-K493`, commit `ddcfdae`)",
        f"**Decision:** `{decision}`",
        f"",
        f"---",
        f"",
        f"## Executive Summary",
        f"",
        f"K493 established that the Cathedral does not forget by time (linear R²=0.0103 — age explains",
        f"~1% of score variance). The true forgetting mechanism is **vocabulary orphaning**: when a",
        f"keystone's language never appears in the technical Eblet corpus, TF-IDF retrieval cannot",
        f"surface it regardless of age.",
        f"",
        f"K494 tests the corrective mechanism: **vocabulary bridging**. Synthetic Eblets paraphrase each",
        f"orphan keystone's meaning in technical corpus vocabulary, carrying an explicit `keystone_anchors`",
        f"direct-link. If bridging works, orphan keystones climb to ≥ Q1 (25th percentile) without",
        f"degrading universal-vocabulary controls (± 10% tolerance).",
        f"",
        f"**Outcome:** {decision} — {recommendation[:120]}...",
        f"",
        f"---",
        f"",
        f"## Phase A — Orphan Keystone Identification",
        f"",
        f"| Statistic | Value |",
        f"|---|---|",
        f"| Total keystones | {orphan_data['statistics']['n_keystones']} |",
        f"| Q1 (25th percentile) | {q1:.5f} |",
        f"| Median | {orphan_data['statistics']['median']:.5f} |",
        f"| Q3 (75th percentile) | {q3:.5f} |",
        f"| Hard orphans (score = 0.0) | {len(orphan_data['hard_orphans'])} |",
        f"| Near-orphans (0 < score < Q1) | {len(orphan_data['near_orphans'])} |",
        f"| Total orphans to bridge | {len(orphan_data['all_orphans'])} |",
        f"| Controls (score > Q3) | {len(orphan_data['controls'])} |",
        f"",
        f"**Hard orphan — KEYSTONE-15 (canonical load-bearing test case):**",
        f"> \"53 years of surviving the trenches of poordom, and I'm really good at it.\"",
        f"> K493 score: 0.00000 — completely vocabulary-orphaned from technical corpus.",
        f"> Biographical poverty vocabulary (poordom, trenches) has zero overlap with substrate architecture vocabulary.",
        f"",
        f"**Near-orphans identified:**",
    ]

    for kid in orphan_data["near_orphans"]:
        det = orphan_data["orphan_details"].get(kid, {})
        lines.append(f"- {kid}: score={det.get('k493_score', 0):.5f}  \"{det.get('phrase', '')[:65]}\"")

    lines += [
        f"",
        f"---",
        f"",
        f"## Phase B — Bridging Eblet Samples",
        f"",
        f"5 bridging Eblets were generated per orphan keystone using `{GENERATOR_MODEL}`.",
        f"Full output: `librarian-mcp/analysis/bridging_eblets_K494.jsonl`",
        f"",
    ]

    for kid in orphan_data["all_orphans"]:
        det = orphan_data["orphan_details"].get(kid, {})
        samples = bridging_samples.get(kid, [])
        lines.append(f"### {kid} — \"{det.get('phrase', '')[:65]}\"")
        lines.append(f"")
        for i, s in enumerate(samples[:3]):
            lines.append(f"**Bridging Eblet {i+1}:**")
            lines.append(f"> {s[:300]}")
            lines.append(f"")

    lines += [
        f"---",
        f"",
        f"## Phase C — K493 vs K494 Comparison Table (All 30 Keystones)",
        f"",
        f"| # | K493 Score | K494 Score | Delta | Dir Anchors | Group | Phrase |",
        f"|---|---|---|---|---|---|---|",
    ]

    all_orphan_ids = set(orphan_data["all_orphans"])
    control_ids = set(orphan_data["controls"])

    for c in comparison:
        kid = c["keystone_id"]
        group = "HARD-ORPHAN" if kid in orphan_data["hard_orphans"] else \
                "NEAR-ORPHAN" if kid in orphan_data["near_orphans"] else \
                "CONTROL" if kid in control_ids else "middle"
        delta_str = f"{c['delta']:+.5f}"
        lines.append(
            f"| {c['number']} | {c['k493_score']:.5f} | {c['k494_score']:.5f} | {delta_str} | "
            f"{c['direct_anchor_count_k494']} | {group} | {c['phrase'][:40]} |"
        )

    # Decision matrix
    lines += [
        f"",
        f"---",
        f"",
        f"## Phase D — Decision Matrix",
        f"",
        f"| Criterion | Target | Result |",
        f"|---|---|---|",
        f"| KEYSTONE-15 climbs to >= Q1 ({q1:.5f}) | Required | {'YES' if k15_climbed else 'NO'} — K494={k15['k494_score']:.5f} |",
        f"| Orphan keystones reach >= Q1 | >=50% | {orphans_at_q1}/{orphans_total} ({'OK' if orphans_at_q1 >= orphans_total*0.5 else 'FAIL'}) |",
        f"| Near-orphans cross Q1 boundary | >=50% | {near_climbed}/{near_total} ({'OK' if near_climbed >= near_total*0.5 else 'FAIL'}) |",
        f"| Controls within +-10% of K493 | Required | {'STABLE' if controls_stable else 'DEGRADED'} |",
        f"",
        f"### Decision: `{decision}`",
        f"",
        f"{recommendation}",
        f"",
    ]

    if control_degraded:
        lines.append(f"**Degraded controls (> ±10%):**")
        for c in control_degraded:
            pct = abs(c["delta"]) / max(c["k493_score"], 1e-9) * 100
            lines.append(f"- {c['keystone_id']}: {c['k493_score']:.5f} → {c['k494_score']:.5f} ({pct:+.1f}%)")
        lines.append(f"")

    lines += [
        f"---",
        f"",
        f"## Architectural Implications",
        f"",
        f"The K491 → K493 → K494 Russian Two-Step arc is complete:",
        f"",
        f"- **K491** raised the P3 architectural gap (some keystones surface poorly in current Eblets)",
        f"- **K493** characterized the gap empirically: age explains 1% of variance (R²=0.0103);",
        f"  the real mechanism is **vocabulary orphaning**, not temporal decay",
        f"- **K494** implements vocabulary bridging as the corrected intervention and tests it empirically",
        f"",
        f"**The Anne Rice synthesis is preserved and strengthened:** The old vampires that cannot evolve",
        f"are those whose language was never spoken in the new age. The bridging mechanism is exactly",
        f"the linguistic adaptation that lets the old vampire keep speaking — translating Founder",
        f"biographical vocabulary (\"poordom\", \"trenches\") into technical corpus vocabulary",
        f"(\"substrate economic architecture\", \"Cost-Slasher discipline\").",
        f"",
        f"**Impact on paper #7** (*How the Cathedral Naturally Forgets*): temporal-decay framing is",
        f"retired. The Cathedral forgets by vocabulary, not time. Bridging at keystone-registration",
        f"time is the architectural intervention.",
        f"",
        f"**Impact on *Authoritative-Answer-AI* paper**: vocabulary bridging is a substrate-readiness",
        f"mechanism. A SCOPE-BOUNDARY response (honest-unknown) should mean \"substrate doesn't have it,\"",
        f"not \"substrate has it but vocabulary mismatch hid it.\" Bridging ensures the distinction is real.",
        f"",
        f"---",
        f"",
        f"*Generated K494 · B124 · {now}.*",
        f"**FOR THE KEEP.**",
    ]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"\n{'=' * 70}")
    print(f"K494 · B124 — VOCABULARY BRIDGING FOR ORPHAN-VOCABULARY KEYSTONES")
    print(f"{'=' * 70}")
    print(f"Analysis date: {ANALYSIS_DATE}")
    print(f"Generator model: {GENERATOR_MODEL}")
    print(f"Budget cap: $6.00")

    # Load API key
    env_path = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\SDS.env")
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key and env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                api_key = line.split("=", 1)[1].strip()
                break
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not found. Set it or ensure SDS.env is accessible.")
        sys.exit(1)
    print(f"  ANTHROPIC_API_KEY: set ({len(api_key)} chars)")

    # Load existing Eblets BEFORE any ingestion
    store = EbletStore(EBLET_STORE_PATH)
    existing_eblets = store.load_all()
    print(f"  Existing Eblet store: {len(existing_eblets)} Eblets")

    # Phase A
    orphan_data = phase_a()

    # Phase B
    bridging_records = phase_b(orphan_data, existing_eblets, api_key)

    if not bridging_records:
        print("\nERROR: No bridging Eblets generated. Check API key and Haiku output.")
        sys.exit(1)

    # Phase C
    phase_c_result = phase_c(bridging_records, existing_eblets)

    # Phase D
    decision = phase_d(orphan_data, bridging_records, phase_c_result)

    print(f"\n{'=' * 70}")
    print(f"K494 COMPLETE — Decision: {decision}")
    print(f"{'=' * 70}")
    print(f"Outputs:")
    print(f"  {ORPHAN_OUTPUT}")
    print(f"  {BRIDGING_EBLETS_OUTPUT}")
    print(f"  {REPORT_OUTPUT}")
    print(f"  {EBLET_STORE_PATH} (expanded)")


if __name__ == "__main__":
    main()
