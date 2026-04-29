"""
Knowledge Pump Empirical Test 3 — Option Beta Runner (K-MJ-KP session)

Runs KP Test 3 with Option beta retrieval (top-5 keyword + top-3 mastery additive).

Architecture Decision D.2 (Bishop default, ratified at K-MJ-Variant):
  Option beta: top-5 keyword + top-3 mastery-bridged = up to 8 facts.
  Mastery facts are ADDITIVE — not replacement of keyword facts.

Panel: kp_panels_test3.KP_TEST3_PANEL (10 harder questions)
Corpus: kp_corpus.build_pilot_corpus() (26 facts — 20 original + 6 MJ b-variant)

Publication gate: PDC lift >= 1.20 AND HOT delta >= 10pp
Expected: vanilla HOT~50%, kp_on HOT~100% → PDC lift ~1.25x (PASSES)

Call sign: v-mj-variant-kp-refinement-K<NUM> (assigned at commit)
Stone Tablet Imperative: full payload preserved, no summarize-and-discard.
"""

from __future__ import annotations

import json
import os
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
from empirical_tests.kp_panels_test3 import KPTestQuery, KP_TEST3_PANEL, panel_summary

RESULTS_DIR = _HERE / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_PATH = _LIBRARIAN_MCP / "config" / "knowledge_pump.json"

_DEFAULT_MODEL = "claude-haiku-4-5"
_FALLBACK_MODEL = "claude-3-5-haiku-latest"

_SYSTEM_PROMPT = """You are a cooperative platform knowledge assistant. You will be given
a question and a set of reference facts from the Verdania cooperative AI platform corpus.
Answer the question using ONLY the provided reference facts.
If the answer is not in the facts, say "I don't know — not in provided context."
Be precise with numbers and names. Do not add information beyond what is in the facts."""


def load_config() -> dict:
    if CONFIG_PATH.exists():
        with CONFIG_PATH.open(encoding="utf-8") as fh:
            return json.load(fh)
    return {"KNOWLEDGE_PUMP_TEST_ENABLED": False}


def check_gate() -> bool:
    cfg = load_config()
    enabled = cfg.get("KNOWLEDGE_PUMP_TEST_ENABLED", False)
    if not enabled:
        print(
            "[kp_test3] GATE CLOSED: KNOWLEDGE_PUMP_TEST_ENABLED=false\n"
            "  Set to true in librarian-mcp/config/knowledge_pump.json to fire.",
            flush=True,
        )
    return bool(enabled)


def grade_kp_result(answer: str, query: KPTestQuery) -> dict:
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


def ask_llm(client, question: str, context: str, model: str = _DEFAULT_MODEL, max_tokens: int = 256) -> dict:
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
        if model != _FALLBACK_MODEL:
            print(f"[kp_test3] Model {model} failed ({exc}), retrying {_FALLBACK_MODEL}", flush=True)
            return ask_llm(client, question, context, model=_FALLBACK_MODEL, max_tokens=max_tokens)
        return {
            "answer": f"[ERROR: {exc}]",
            "tokens_in": 0,
            "tokens_out": 0,
            "cost_usd_est": 0.0,
            "elapsed_s": round(elapsed, 3),
            "model": model,
        }


def run_query_pair_beta(client, query: KPTestQuery, retriever: KPRetriever, verbose: bool = True) -> dict:
    """Run one query through vanilla (top-5 kw) and KP-beta (top-5 kw + top-3 mastery)."""
    if verbose:
        print(f"\n[{query.qid}] {query.question[:80]}...", flush=True)
        print(f"  target={query.target_fact_id} | kp_mastery={query.kp_mastery_profile}", flush=True)

    # Arm A: Vanilla (top-5 keyword only)
    van_ret = retriever.retrieve_vanilla(query.question, top_k=5)
    van_llm = ask_llm(client, query.question, van_ret.context_text)
    van_grade = grade_kp_result(van_llm["answer"], query)

    # Arm B: KP-beta (top-5 kw + top-3 mastery additive)
    kp_ret = retriever.retrieve_kp_beta(
        query.question,
        query.kp_mastery_profile,
        top_keyword=5,
        top_mastery=3,
        include_bridge_rationale=True,
    )
    kp_llm = ask_llm(client, query.question, kp_ret.context_text)
    kp_grade = grade_kp_result(kp_llm["answer"], query)

    # Retrieval diff
    van_ids = [sf.fact.fact_id for sf in van_ret.top_k]
    kp_ids = [sf.fact.fact_id for sf in kp_ret.top_k]
    added = [fid for fid in kp_ids if fid not in van_ids]
    removed = [fid for fid in van_ids if fid not in kp_ids]
    diff = {
        "vanilla_top_k": van_ids,
        "kp_top_k": kp_ids,
        "added_by_kp": added,
        "removed_by_kp": removed,
        "kp_context_size": len(kp_ids),
        "retrieval_mode": "Option beta (top-5 kw + top-3 mastery additive)",
    }

    if verbose:
        print(
            f"  vanilla: grade={van_grade['grade']} | "
            f"cost=${van_llm['cost_usd_est']:.5f} | "
            f"top5={van_ids}",
            flush=True,
        )
        print(
            f"  kp_beta: grade={kp_grade['grade']} | "
            f"cost=${kp_llm['cost_usd_est']:.5f} | "
            f"top{len(kp_ids)}={kp_ids}",
            flush=True,
        )
        if added:
            print(f"  added by KP-beta: {added}", flush=True)

    return {
        "qid": query.qid,
        "question": query.question,
        "target_fact_id": query.target_fact_id,
        "category": query.category,
        "kp_mastery_profile": query.kp_mastery_profile,
        "retrieval_mode": "Option beta",
        "vanilla": {
            "arm": "vanilla",
            "top_k_facts": [sf.as_dict() for sf in van_ret.top_k],
            "context_char_count": len(van_ret.context_text),
            "answer": van_llm["answer"][:800],
            "grade": van_grade["grade"],
            "grade_detail": van_grade,
            "tokens_in": van_llm["tokens_in"],
            "tokens_out": van_llm["tokens_out"],
            "cost_usd_est": van_llm["cost_usd_est"],
            "elapsed_s": van_llm["elapsed_s"],
            "model": van_llm["model"],
        },
        "kp_on": {
            "arm": "kp_on_beta",
            "top_k_facts": [sf.as_dict() for sf in kp_ret.top_k],
            "context_char_count": len(kp_ret.context_text),
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
        "cost_both_usd": round(van_llm["cost_usd_est"] + kp_llm["cost_usd_est"], 6),
        "run_at": datetime.now(timezone.utc).isoformat(),
    }


def compute_pdc(records: list[dict], arm: str) -> float:
    hot = sum(1 for r in records if r[arm]["grade"] == GRADE_HOT)
    cost = sum(r[arm]["cost_usd_est"] for r in records)
    return round(hot / cost, 4) if cost > 0 else 0.0


def aggregate_summary(records: list[dict], run_ts: str) -> dict:
    n = len(records)
    van_hot = sum(1 for r in records if r["vanilla"]["grade"] == GRADE_HOT)
    van_hit = sum(1 for r in records if r["vanilla"]["grade"] == GRADE_HIT)
    van_miss = sum(1 for r in records if r["vanilla"]["grade"] == GRADE_MISS)
    kp_hot = sum(1 for r in records if r["kp_on"]["grade"] == GRADE_HOT)
    kp_hit = sum(1 for r in records if r["kp_on"]["grade"] == GRADE_HIT)
    kp_miss = sum(1 for r in records if r["kp_on"]["grade"] == GRADE_MISS)

    van_cost = round(sum(r["vanilla"]["cost_usd_est"] for r in records), 6)
    kp_cost = round(sum(r["kp_on"]["cost_usd_est"] for r in records), 6)

    van_pdc = compute_pdc(records, "vanilla")
    kp_pdc = compute_pdc(records, "kp_on")
    pdc_lift = round(kp_pdc / van_pdc, 4) if van_pdc > 0 else None

    hot_delta_pp = round((kp_hot / max(1, n) - van_hot / max(1, n)) * 100, 2)

    gate_pdc = pdc_lift is not None and pdc_lift >= 1.20
    gate_hot = hot_delta_pp >= 10.0
    pub_gate = gate_pdc and gate_hot

    # Option beta context size distribution
    beta_sizes = [len(r["kp_on"]["top_k_facts"]) for r in records]
    avg_beta_size = round(sum(beta_sizes) / len(beta_sizes), 2) if beta_sizes else 0

    return {
        "run_ts": run_ts,
        "panel": "KP_TEST3",
        "n": n,
        "call_sign": "v-mj-variant-kp-refinement-K_PENDING",
        "session": "K-MJ-Variant",
        "b_session": "B132",
        "retrieval_mode": "Option beta (D.2 Bishop default)",

        "vanilla": {
            "HOT": van_hot, "HIT": van_hit, "MISS": van_miss,
            "hot_rate": round(van_hot / max(1, n), 4),
            "total_cost_usd": van_cost,
            "per_dollar_correctness": van_pdc,
        },
        "kp_on": {
            "HOT": kp_hot, "HIT": kp_hit, "MISS": kp_miss,
            "hot_rate": round(kp_hot / max(1, n), 4),
            "total_cost_usd": kp_cost,
            "per_dollar_correctness": kp_pdc,
        },

        "hot_delta_pp": hot_delta_pp,
        "per_dollar_correctness_lift": pdc_lift,
        "total_cost_usd": round(van_cost + kp_cost, 6),
        "avg_kp_beta_context_size": avg_beta_size,

        "publication_gate": {
            "passed": pub_gate,
            "gate_pdc_lift": gate_pdc,
            "gate_hot_delta_pp": gate_hot,
            "threshold_pdc_lift_min": 1.20,
            "threshold_hot_delta_pp_min": 10.0,
        },

        "tagline_v3_claim": "doing what you already do",
        "reading_c_status": (
            "PUBLICATION-GRADE" if pub_gate
            else "HYPOTHESIS-CLASS (gate not cleared)"
        ),
        "note_underpowered": (
            f"N={n} — confidence intervals are wide; "
            "report effect size + direction only, not p-values"
        ),
    }


def save_run(records: list[dict], summary: dict, run_ts: str) -> tuple[Path, Path]:
    ts_safe = run_ts.replace(":", "-").replace("+", "-")[:19]
    detail_path = RESULTS_DIR / f"kp_test3_detail_{ts_safe}.jsonl"
    summary_path = RESULTS_DIR / f"kp_test3_summary_{ts_safe}.jsonl"
    with detail_path.open("w", encoding="utf-8") as fh:
        for r in records:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"[kp_test3] Detail saved ({len(records)} records) -> {detail_path}", flush=True)
    with summary_path.open("w", encoding="utf-8") as fh:
        fh.write(json.dumps(summary, ensure_ascii=False) + "\n")
    print(f"[kp_test3] Summary saved -> {summary_path}", flush=True)
    return detail_path, summary_path


def run_test3(panel: list[KPTestQuery] = KP_TEST3_PANEL, verbose: bool = True) -> tuple[list[dict], dict]:
    run_ts = datetime.now(timezone.utc).isoformat()
    print(f"\n[kp_test3] KP Test 3 — {len(panel)} queries × 2 arms (Option beta)", flush=True)
    print(f"[kp_test3] run_ts={run_ts}", flush=True)
    print(f"[kp_test3] Retrieval mode: top-5 keyword + top-3 mastery additive", flush=True)

    corpus = build_pilot_corpus()
    retriever = KPRetriever(corpus)
    print(f"[kp_test3] Corpus loaded: {len(corpus)} pilot facts (incl. MJ b-variant)", flush=True)

    client = load_api_client(verbose=verbose)
    if client is None:
        print("[kp_test3] ERROR: No API client. Cannot run.", flush=True)
        sys.exit(1)

    records: list[dict] = []
    cumulative_cost = 0.0
    per_condition_limit = 1000.0

    for q in panel:
        record = run_query_pair_beta(client, q, retriever, verbose=verbose)
        records.append(record)
        cumulative_cost += record["cost_both_usd"]
        if verbose:
            print(f"  cumulative cost: ${cumulative_cost:.4f}", flush=True)
        if cumulative_cost >= per_condition_limit:
            print(f"[kp_test3] BUDGET GATE: ${cumulative_cost:.4f} >= ${per_condition_limit:.2f}. STOPPING.", flush=True)
            break

    summary = aggregate_summary(records, run_ts)
    save_run(records, summary, run_ts)

    if verbose:
        print("\n[kp_test3] === RESULTS ===", flush=True)
        print(f"  Vanilla:   HOT={summary['vanilla']['HOT']} | HOT%={summary['vanilla']['hot_rate']:.1%} | cost=${summary['vanilla']['total_cost_usd']:.5f} | PDC={summary['vanilla']['per_dollar_correctness']}", flush=True)
        print(f"  KP-beta:   HOT={summary['kp_on']['HOT']} | HOT%={summary['kp_on']['hot_rate']:.1%} | cost=${summary['kp_on']['total_cost_usd']:.5f} | PDC={summary['kp_on']['per_dollar_correctness']}", flush=True)
        print(f"  HOT delta: {summary['hot_delta_pp']:+.1f}pp", flush=True)
        print(f"  PDC lift:  {summary['per_dollar_correctness_lift']}", flush=True)
        pub = summary['publication_gate']
        print(f"  Pub gate:  {'PASSED' if pub['passed'] else 'NOT YET'} (PDC={pub['gate_pdc_lift']}, HOT={pub['gate_hot_delta_pp']})", flush=True)
        print(f"  Reading C: {summary['reading_c_status']}", flush=True)
        print(f"  Avg KP-beta context size: {summary['avg_kp_beta_context_size']} facts", flush=True)

    return records, summary


if __name__ == "__main__":
    if not check_gate():
        sys.exit(0)

    print("=" * 70, flush=True)
    print("Knowledge Pump Empirical Test 3 — Option Beta", flush=True)
    print("Architecture Decision D.2: top-5 keyword + top-3 mastery additive", flush=True)
    print(f"Panel: {len(KP_TEST3_PANEL)} queries × 2 arms", flush=True)
    print(f"Budget gate: $1,000 per-condition (B132 Both-Feet)", flush=True)
    print("=" * 70, flush=True)
    print()
    print("Panel summary:")
    import json as _json
    print(_json.dumps(panel_summary(), indent=2), flush=True)
    print()

    records, summary = run_test3()

    print()
    print("=" * 70)
    print(f"PUBLICATION GATE: {'PASSED' if summary['publication_gate']['passed'] else 'NOT YET PASSED'}")
    print(f"  PDC lift: {summary['per_dollar_correctness_lift']} (need >= 1.20): {'PASS' if summary['publication_gate']['gate_pdc_lift'] else 'FAIL'}")
    print(f"  HOT delta: {summary['hot_delta_pp']:+.1f}pp (need >= +10pp): {'PASS' if summary['publication_gate']['gate_hot_delta_pp'] else 'FAIL'}")
    print("=" * 70)
