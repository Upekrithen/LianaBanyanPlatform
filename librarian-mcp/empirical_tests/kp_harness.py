"""
Knowledge Pump Empirical Test — Two-Arm Harness (Phase B, K538)

Runs the KP Test 2 (mastery-aware retrieval) experiment:
  For each query in KP_TEST2_PANEL:
    1. Retrieve context: vanilla arm (no mastery) + KP arm (mastery-weighted)
    2. Ask the LLM the same question with each arm's context
    3. Grade both answers: HOT / HIT / MISS
    4. Record full Stone Tablet payload (no summarize-and-discard)

Primary metric: per_dollar_correctness = HOT% / mean_cost_per_query
KP lift: (kp_pdc) / (vanilla_pdc)
Publication gate: lift ≥ 1.20 AND HOT delta ≥ 10pp

PUBLICATION GATE HARD: this harness is inactive unless KNOWLEDGE_PUMP_TEST_ENABLED=true
in librarian-mcp/config/knowledge_pump.json. Knight builds; Founder fires.

Stone Tablet Imperative: every per-question result, per-arm aggregate, and
retrieval diff is preserved at full payload. Each run produces a dated JSONL
in empirical_tests/results/ and an aggregate summary. No summarize-and-discard.

Integration:
  - load_api_client() from empirical_tests.harness — no echo of raw key
  - grade_result() HOT/HIT/MISS rubric extended for KP key_facts
  - KPRetriever from kp_retrieval — two-arm context assembly
  - KP_TEST2_PANEL from kp_panels — frozen query bank

Filed: B132, 2026-04-28 by Knight (K538).
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from empirical_tests.harness import load_api_client, GRADE_HOT, GRADE_HIT, GRADE_MISS
from empirical_tests.kp_corpus import build_pilot_corpus
from empirical_tests.kp_retrieval import KPRetriever
from empirical_tests.kp_panels import KPTestQuery

RESULTS_DIR = _HERE / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_PATH = _LIBRARIAN_MCP / "config" / "knowledge_pump.json"

# Haiku-class model (cheapest inference, parallels K491 cost discipline)
_DEFAULT_MODEL = "claude-haiku-4-5"
# Fallback if Haiku not available
_FALLBACK_MODEL = "claude-3-5-haiku-latest"

# System prompt for both arms — identical to isolate retrieval as the variable
_SYSTEM_PROMPT = """You are a cooperative platform knowledge assistant. You will be given
a question and a set of reference facts from the Verdania cooperative AI platform corpus.
Answer the question using ONLY the provided reference facts.
If the answer is not in the facts, say "I don't know — not in provided context."
Be precise with numbers and names. Do not add information beyond what is in the facts."""


def load_config() -> dict:
    """Load knowledge_pump.json config. Returns dict with defaults."""
    if CONFIG_PATH.exists():
        with CONFIG_PATH.open(encoding="utf-8") as fh:
            return json.load(fh)
    return {"KNOWLEDGE_PUMP_TEST_ENABLED": False}


def check_gate() -> bool:
    """Return True if KNOWLEDGE_PUMP_TEST_ENABLED is true in config."""
    cfg = load_config()
    enabled = cfg.get("KNOWLEDGE_PUMP_TEST_ENABLED", False)
    if not enabled:
        print(
            "[kp_harness] GATE CLOSED: KNOWLEDGE_PUMP_TEST_ENABLED=false\n"
            "  Infrastructure is ready. Founder flips to true to fire empirical run.\n"
            "  See: librarian-mcp/config/knowledge_pump.json",
            flush=True,
        )
    return bool(enabled)


def grade_kp_result(answer: str, query: KPTestQuery) -> dict:
    """
    Grade a KP test answer against the query's key_facts and hit_keywords.

    HOT: answer contains >= 60% of key_facts (case-insensitive substring) AND not scope-boundary
    HIT: answer contains >= 1 key_fact OR >= 1 hit_keyword AND not scope-boundary
    MISS: none of the above, OR scope-boundary ("I don't know")
    """
    answer_lower = answer.lower()
    scope_boundary = "don't know" in answer_lower or "not in provided context" in answer_lower

    if scope_boundary:
        return {
            "grade": GRADE_MISS,
            "matched_key_facts": [],
            "matched_hit_keywords": [],
            "honest_unknown": True,
            "reasoning": "SCOPE-BOUNDARY: answer declined to answer from provided context",
        }

    matched_key = [f for f in query.key_facts if f.lower() in answer_lower]
    matched_hit = [k for k in query.hit_keywords if k.lower() in answer_lower]
    threshold = max(1, int(len(query.key_facts) * 0.6))

    if len(matched_key) >= threshold:
        grade = GRADE_HOT
    elif matched_key or matched_hit:
        grade = GRADE_HIT
    else:
        grade = GRADE_MISS

    return {
        "grade": grade,
        "matched_key_facts": matched_key,
        "matched_hit_keywords": matched_hit,
        "honest_unknown": False,
        "reasoning": f"{len(matched_key)}/{len(query.key_facts)} key facts matched (threshold={threshold})",
    }


def ask_llm(
    client,
    question: str,
    context: str,
    model: str = _DEFAULT_MODEL,
    max_tokens: int = 256,
) -> dict:
    """
    Ask the LLM a question with the provided context.

    Returns: {answer, tokens_in, tokens_out, cost_usd_est, elapsed_s, model}
    Never echoes API key. Cost estimate uses Haiku pricing.
    """
    prompt = f"Reference facts:\n{context}\n\nQuestion: {question}"

    t0 = time.perf_counter()
    try:
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        elapsed = time.perf_counter() - t0
        answer = response.content[0].text if response.content else ""
        tok_in = response.usage.input_tokens
        tok_out = response.usage.output_tokens

        # Haiku-4-5 pricing: $0.80/MTok input, $4.00/MTok output (industry-term)
        cost_usd = (tok_in * 0.80 + tok_out * 4.00) / 1_000_000

        return {
            "answer": answer,
            "tokens_in": tok_in,
            "tokens_out": tok_out,
            "cost_usd_est": round(cost_usd, 6),
            "elapsed_s": round(elapsed, 3),
            "model": model,
        }
    except Exception as exc:
        elapsed = time.perf_counter() - t0
        # Try fallback model
        if model != _FALLBACK_MODEL:
            print(f"[kp_harness] Model {model} failed ({exc}), retrying with {_FALLBACK_MODEL}", flush=True)
            return ask_llm(client, question, context, model=_FALLBACK_MODEL, max_tokens=max_tokens)
        return {
            "answer": f"[ERROR: {exc}]",
            "tokens_in": 0,
            "tokens_out": 0,
            "cost_usd_est": 0.0,
            "elapsed_s": round(elapsed, 3),
            "model": model,
        }


def run_query_pair(
    client,
    query: KPTestQuery,
    retriever: KPRetriever,
    top_k: int = 5,
    verbose: bool = True,
) -> dict:
    """
    Run one query through both arms and return the full Stone Tablet payload.

    Returns a record with:
      qid, question, target_fact_id, category, mastery_profile,
      vanilla_result, kp_result, retrieval_diff,
      vanilla_grade, kp_grade, cost_both_usd, run_at
    """
    if verbose:
        print(f"\n[{query.qid}] {query.question[:80]}...", flush=True)
        print(f"  target={query.target_fact_id} | kp_mastery={query.kp_mastery_profile}", flush=True)

    # --- Arm A: Vanilla retrieval ---
    vanilla_retrieval = retriever.retrieve_vanilla(query.question, top_k=top_k)
    vanilla_llm = ask_llm(client, query.question, vanilla_retrieval.context_text)
    vanilla_grade = grade_kp_result(vanilla_llm["answer"], query)

    # --- Arm B: KP-on retrieval ---
    kp_retrieval = retriever.retrieve_kp(
        query.question,
        query.kp_mastery_profile,
        top_k=top_k,
        include_bridge_rationale=True,
    )
    kp_llm = ask_llm(client, query.question, kp_retrieval.context_text)
    kp_grade = grade_kp_result(kp_llm["answer"], query)

    # --- Retrieval diff (Stone Tablet) ---
    diff = retriever.retrieval_diff(vanilla_retrieval, kp_retrieval)

    if verbose:
        print(
            f"  vanilla: grade={vanilla_grade['grade']} | "
            f"cost=${vanilla_llm['cost_usd_est']:.5f} | "
            f"top5={[sf.fact.fact_id for sf in vanilla_retrieval.top_k]}",
            flush=True,
        )
        print(
            f"  kp_on:   grade={kp_grade['grade']} | "
            f"cost=${kp_llm['cost_usd_est']:.5f} | "
            f"top5={[sf.fact.fact_id for sf in kp_retrieval.top_k]}",
            flush=True,
        )
        if not diff["retrieval_sets_identical"]:
            print(f"  retrieval diff: added={diff['added_by_kp']}, removed={diff['removed_by_kp']}", flush=True)

    return {
        "qid": query.qid,
        "question": query.question,
        "target_fact_id": query.target_fact_id,
        "category": query.category,
        "kp_mastery_profile": query.kp_mastery_profile,
        "vanilla": {
            "arm": "vanilla",
            "top_k_facts": [sf.as_dict() for sf in vanilla_retrieval.top_k],
            "context_char_count": len(vanilla_retrieval.context_text),
            "answer": vanilla_llm["answer"][:800],
            "grade": vanilla_grade["grade"],
            "grade_detail": vanilla_grade,
            "tokens_in": vanilla_llm["tokens_in"],
            "tokens_out": vanilla_llm["tokens_out"],
            "cost_usd_est": vanilla_llm["cost_usd_est"],
            "elapsed_s": vanilla_llm["elapsed_s"],
            "model": vanilla_llm["model"],
        },
        "kp_on": {
            "arm": "kp_on",
            "top_k_facts": [sf.as_dict() for sf in kp_retrieval.top_k],
            "context_char_count": len(kp_retrieval.context_text),
            "answer": kp_llm["answer"][:800],
            "grade": kp_grade["grade"],
            "grade_detail": kp_grade,
            "tokens_in": kp_llm["tokens_in"],
            "tokens_out": kp_llm["tokens_out"],
            "cost_usd_est": kp_llm["cost_usd_est"],
            "elapsed_s": kp_llm["elapsed_s"],
            "model": kp_llm["model"],
        },
        "retrieval_diff": diff,
        "cost_both_usd": round(vanilla_llm["cost_usd_est"] + kp_llm["cost_usd_est"], 6),
        "run_at": datetime.now(timezone.utc).isoformat(),
    }


def compute_per_dollar_correctness(records: list[dict], arm: str) -> float:
    """
    per_dollar_correctness = HOT_count / total_cost_usd (for one arm).
    Higher = more HOT answers per dollar.
    Returns 0.0 if cost is zero (avoid division by zero).
    """
    hot_count = sum(1 for r in records if r[arm]["grade"] == GRADE_HOT)
    total_cost = sum(r[arm]["cost_usd_est"] for r in records)
    if total_cost == 0.0:
        return 0.0
    return round(hot_count / total_cost, 4)


def aggregate_summary(records: list[dict], run_ts: str) -> dict:
    """
    Compute aggregate summary with per-dollar-correctness lift.
    This is the primary publication-grade metric (D.3 decision).
    """
    n = len(records)

    # Per-arm counts
    vanilla_hot = sum(1 for r in records if r["vanilla"]["grade"] == GRADE_HOT)
    vanilla_hit = sum(1 for r in records if r["vanilla"]["grade"] == GRADE_HIT)
    vanilla_miss = sum(1 for r in records if r["vanilla"]["grade"] == GRADE_MISS)
    kp_hot = sum(1 for r in records if r["kp_on"]["grade"] == GRADE_HOT)
    kp_hit = sum(1 for r in records if r["kp_on"]["grade"] == GRADE_HIT)
    kp_miss = sum(1 for r in records if r["kp_on"]["grade"] == GRADE_MISS)

    vanilla_hot_rate = round(vanilla_hot / max(1, n), 4)
    kp_hot_rate = round(kp_hot / max(1, n), 4)
    hot_delta_pp = round((kp_hot_rate - vanilla_hot_rate) * 100, 2)

    vanilla_cost = round(sum(r["vanilla"]["cost_usd_est"] for r in records), 6)
    kp_cost = round(sum(r["kp_on"]["cost_usd_est"] for r in records), 6)
    total_cost = round(vanilla_cost + kp_cost, 6)

    vanilla_pdc = compute_per_dollar_correctness(records, "vanilla")
    kp_pdc = compute_per_dollar_correctness(records, "kp_on")
    pdc_lift = round(kp_pdc / vanilla_pdc, 4) if vanilla_pdc > 0 else None

    # Publication gate evaluation
    pub_threshold_pdc = 1.20
    pub_threshold_hot_pp = 10.0
    gate_pdc = pdc_lift is not None and pdc_lift >= pub_threshold_pdc
    gate_hot = hot_delta_pp >= pub_threshold_hot_pp
    publication_gate = gate_pdc and gate_hot

    # Retrieval sets that differed (KP actually changed retrieval)
    retrieval_changed = sum(1 for r in records if not r["retrieval_diff"]["retrieval_sets_identical"])

    summary = {
        "run_ts": run_ts,
        "panel": "KP_TEST2",
        "n": n,
        "call_sign": "v-knowledge-pump-empirical-K538",
        "session": "K538",
        "b_session": "B132",

        # --- Vanilla arm ---
        "vanilla": {
            "HOT": vanilla_hot, "HIT": vanilla_hit, "MISS": vanilla_miss,
            "hot_rate": vanilla_hot_rate,
            "total_cost_usd": vanilla_cost,
            "per_dollar_correctness": vanilla_pdc,
        },

        # --- KP arm ---
        "kp_on": {
            "HOT": kp_hot, "HIT": kp_hit, "MISS": kp_miss,
            "hot_rate": kp_hot_rate,
            "total_cost_usd": kp_cost,
            "per_dollar_correctness": kp_pdc,
        },

        # --- Primary metric ---
        "hot_delta_pp": hot_delta_pp,
        "per_dollar_correctness_lift": pdc_lift,
        "total_cost_usd": total_cost,
        "retrieval_sets_changed": retrieval_changed,

        # --- Publication gate ---
        "publication_gate": {
            "passed": publication_gate,
            "gate_pdc_lift": gate_pdc,
            "gate_hot_delta_pp": gate_hot,
            "threshold_pdc_lift_min": pub_threshold_pdc,
            "threshold_hot_delta_pp_min": pub_threshold_hot_pp,
        },

        # --- Tagline V3 claim ---
        "tagline_v3_claim": "doing what you already do",
        "reading_c_status": (
            "PUBLICATION-GRADE" if publication_gate
            else "HYPOTHESIS-CLASS (gate not cleared)"
        ),

        "note_underpowered": (
            f"N={n} — confidence intervals are wide; "
            "report effect size + direction only, not p-values"
        ),
    }
    return summary


def save_run(records: list[dict], summary: dict, run_ts: str) -> tuple[Path, Path]:
    """Save per-question JSONL and aggregate summary JSONL to results/."""
    ts_safe = run_ts.replace(":", "-").replace("+", "-")[:19]
    detail_path = RESULTS_DIR / f"kp_test2_detail_{ts_safe}.jsonl"
    summary_path = RESULTS_DIR / f"kp_test2_summary_{ts_safe}.jsonl"

    with detail_path.open("w", encoding="utf-8") as fh:
        for r in records:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"[kp_harness] Detail saved ({len(records)} records) -> {detail_path}", flush=True)

    with summary_path.open("w", encoding="utf-8") as fh:
        fh.write(json.dumps(summary, ensure_ascii=False) + "\n")
    print(f"[kp_harness] Summary saved -> {summary_path}", flush=True)

    return detail_path, summary_path


def run_test2(
    panel: list[KPTestQuery],
    top_k: int = 5,
    verbose: bool = True,
    dry_run: bool = False,
) -> tuple[list[dict], dict]:
    """
    Run the full KP Test 2 experiment.

    Args:
        panel: frozen query list (KP_TEST2_PANEL)
        top_k: retrieval size per arm
        verbose: print progress
        dry_run: if True, skip LLM calls (for infrastructure validation only)

    Returns:
        (records, summary) — full Stone Tablet payload
    """
    run_ts = datetime.now(timezone.utc).isoformat()
    print(f"\n[kp_harness] KP Test 2 — {len(panel)} queries × 2 arms", flush=True)
    print(f"[kp_harness] run_ts={run_ts}", flush=True)

    # Load corpus and retriever
    corpus = build_pilot_corpus()
    retriever = KPRetriever(corpus)
    print(f"[kp_harness] Corpus loaded: {len(corpus)} pilot facts", flush=True)

    if dry_run:
        print("[kp_harness] DRY-RUN mode: skipping LLM calls. Retrieval only.", flush=True)
        records = []
        for q in panel:
            v_ret = retriever.retrieve_vanilla(q.question, top_k=top_k)
            k_ret = retriever.retrieve_kp(q.question, q.kp_mastery_profile, top_k=top_k)
            diff = retriever.retrieval_diff(v_ret, k_ret)
            print(f"  {q.qid} | retrieval diff: {not diff['retrieval_sets_identical']} | "
                  f"added={diff['added_by_kp']}", flush=True)
            records.append({"qid": q.qid, "retrieval_diff": diff, "dry_run": True})
        return records, {"dry_run": True, "n": len(records)}

    # Load API client
    client = load_api_client(verbose=verbose)
    if client is None:
        print("[kp_harness] ERROR: No API client available. Cannot run empirical test.", flush=True)
        sys.exit(1)

    # Run all queries
    records: list[dict] = []
    cumulative_cost = 0.0
    per_condition_limit = 1000.0  # Both-Feet baked in (B132)

    for q in panel:
        record = run_query_pair(client, q, retriever, top_k=top_k, verbose=verbose)
        records.append(record)

        cumulative_cost += record["cost_both_usd"]
        if verbose:
            print(f"  cumulative cost: ${cumulative_cost:.4f}", flush=True)

        # Budget gate check
        if cumulative_cost >= per_condition_limit:
            print(
                f"[kp_harness] BUDGET GATE: cumulative cost ${cumulative_cost:.4f} "
                f">= per_condition_limit ${per_condition_limit:.2f}. STOPPING.",
                flush=True,
            )
            break

    summary = aggregate_summary(records, run_ts)
    save_run(records, summary, run_ts)

    if verbose:
        print("\n[kp_harness] === RESULTS ===", flush=True)
        print(f"  Vanilla:  HOT={summary['vanilla']['HOT']} | HOT%={summary['vanilla']['hot_rate']:.1%} | cost=${summary['vanilla']['total_cost_usd']:.5f} | PDC={summary['vanilla']['per_dollar_correctness']}", flush=True)
        print(f"  KP-on:    HOT={summary['kp_on']['HOT']} | HOT%={summary['kp_on']['hot_rate']:.1%} | cost=${summary['kp_on']['total_cost_usd']:.5f} | PDC={summary['kp_on']['per_dollar_correctness']}", flush=True)
        print(f"  HOT delta: {summary['hot_delta_pp']:+.1f}pp", flush=True)
        print(f"  Per-dollar correctness lift: {summary['per_dollar_correctness_lift']}", flush=True)
        print(f"  Publication gate: {'PASSED' if summary['publication_gate']['passed'] else 'NOT YET'}", flush=True)
        print(f"  Reading C status: {summary['reading_c_status']}", flush=True)
        print(f"  Total cost: ${summary['total_cost_usd']:.5f}", flush=True)
        print(f"  Retrieval changed on {summary['retrieval_sets_changed']}/{len(records)} queries", flush=True)

    return records, summary
