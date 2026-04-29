"""
Knowledge Pump Empirical Test 5 — Confound-Patched Panel Runner (K-Panel-5, B133)

Architecture Decision D.1 = β (Founder pre-ratified 2026-04-29):
  Decoupled lift gate from PDC gate. Reading-C lift > 5pp = LIFT_GATE_CLEARED
  (standalone verdict). PDC gate retained as separate metric (not blocking).

Two confound patches active:
  1. Excerpt-leakage fix: C02+C04 questions rewritten to avoid excerpt vocabulary.
     Confirmed via pre-flight `build_pilot_corpus(load_excerpts=True)` vocabulary audit.
  2. Context-dilution fix: include_bridge_rationale=False for Reading-A arm.
     Removes bridge rationale text from Reading-A LLM context to prevent attention dilution.

Prediction (D.1 beta, confounds patched):
  KP-off:   Reading-A=100%  Reading-B=0%   Reading-C=0%
  KP-fixed: Reading-A=100%  Reading-B=100% Reading-C=25% (C01: EG-20 captured)
  KP-gamma: Reading-A=100%  Reading-B=100% Reading-C=75% (C01+C03+C04)

Call sign: v-panel-5-kp-confound-patches-K<INTEGER>
Stone Tablet: full payload preserved in results/kp_test5_*.jsonl
Filed: B133, 2026-04-29 by Knight (K-Panel-5).
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
from empirical_tests.kp_retrieval import KPRetriever, compute_dynamic_budget
from empirical_tests.kp_panels_test4 import KPTestQuery4
from empirical_tests.kp_panels_test5 import (
    KP_TEST5_PANEL,
    panel_summary,
    INCLUDE_BRIDGE_RATIONALE_PER_CLASS,
)

RESULTS_DIR = _HERE / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_PATH = _LIBRARIAN_MCP / "config" / "knowledge_pump.json"
_DEFAULT_MODEL = "claude-haiku-4-5"
_FALLBACK_MODEL = "claude-3-5-haiku-latest"


def _load_sds_env() -> None:
    candidates = [
        _LIBRARIAN_MCP.parent / "Asteroid-ProofVault" / "LockBox" / "SDS.env",
    ]
    sds = next((p for p in candidates if p.exists()), None)
    if not sds:
        return
    for line in sds.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip(), v.strip()
        if k and v and not os.environ.get(k):
            os.environ[k] = v


def load_config() -> dict:
    if CONFIG_PATH.exists():
        with CONFIG_PATH.open(encoding="utf-8") as fh:
            return json.load(fh)
    return {}


def grade_kp_result(answer: str, query: KPTestQuery4) -> dict:
    """Grade one LLM answer against query key_facts."""
    answer_lower = answer.lower()
    scope_boundary = (
        "don't know" in answer_lower or "i don't know" in answer_lower
        or "not in provided context" in answer_lower
    )
    if scope_boundary:
        return {
            "grade": GRADE_MISS,
            "matched_key_facts": [],
            "matched_hit_keywords": [],
            "honest_unknown": True,
            "require_all_key_facts": query.require_all_key_facts,
            "reasoning": "SCOPE-BOUNDARY",
        }

    matched_key = [f for f in query.key_facts if f.lower() in answer_lower]
    matched_hit = [k for k in query.hit_keywords if k.lower() in answer_lower]

    if query.require_all_key_facts:
        threshold = len(query.key_facts)
    else:
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
        "require_all_key_facts": query.require_all_key_facts,
        "threshold_applied": threshold,
        "reasoning": (
            f"{len(matched_key)}/{len(query.key_facts)} key facts matched "
            f"(threshold={threshold})"
        ),
    }


def ask_llm(client: object, question: str, context: str, model: str = _DEFAULT_MODEL) -> dict:
    """Send one question+context to LLM and return answer + cost."""
    import anthropic
    prompt = f"Reference facts:\n{context}\n\nQuestion: {question}"
    t0 = time.perf_counter()
    try:
        response = client.messages.create(  # type: ignore[union-attr]
            model=model,
            max_tokens=256,
            system=_system_prompt(),
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
            return ask_llm(client, question, context, model=_FALLBACK_MODEL)
        return {
            "answer": f"[ERROR: {exc}]",
            "tokens_in": 0,
            "tokens_out": 0,
            "cost_usd_est": 0.0,
            "elapsed_s": round(elapsed, 3),
            "model": model,
        }


# ─── Pre-flight: excerpt vocabulary audit ─────────────────────────────────────

def _excerpt_vocabulary_audit(corpus, panel: list[KPTestQuery4]) -> dict[str, list[str]]:
    """
    For each question in panel, check whether any question token matches any
    observation_excerpt token for the target fact IDs.
    Returns {qid: [leaked_tokens]} for questions with leakage.
    """
    import re

    _STOP = frozenset({
        "a", "an", "the", "is", "are", "was", "were", "be", "been",
        "have", "has", "had", "do", "does", "did", "will", "would",
        "shall", "should", "may", "might", "can", "could", "of", "in",
        "on", "at", "to", "for", "with", "by", "from", "and", "or",
        "but", "not", "this", "that", "it", "its", "as", "if", "when",
        "what", "which", "who", "how", "all", "any", "each", "more",
        "than", "their", "they", "them", "we", "our", "us", "i", "my",
        "me", "you", "your", "s", "t",
    })

    def tokenize(text: str) -> set[str]:
        return {t for t in re.findall(r"[a-z0-9]+", text.lower())
                if t not in _STOP and len(t) >= 3}

    corpus_by_id = {f.fact_id: f for f in corpus}
    leakage: dict[str, list[str]] = {}

    for query in panel:
        q_tokens = tokenize(query.question)
        for fid in query.target_fact_ids:
            fact = corpus_by_id.get(fid)
            if not fact:
                continue
            excerpt_tokens = tokenize(fact.observation_excerpt)
            overlap = q_tokens & excerpt_tokens
            if overlap:
                qid_key = f"{query.qid}:{fid}"
                leakage[qid_key] = sorted(overlap)

    return leakage


# ─── Decoupled verdict (D.1 = β) ──────────────────────────────────────────────

def aggregate_test5_summary(records: list[dict], reading_c_n: int) -> dict:
    """
    D.1 = β — decoupled verdict:
      LIFT_GATE_CLEARED: gamma Reading-C HOT% - fixed Reading-C HOT% > 5pp
      PDC_VERDICT: gamma PDC >= fixed PDC (separate, non-blocking metric)
      OVERALL_VERDICT: SUPPORTED requires LIFT_GATE_CLEARED
                       (PDC is informational, not load-bearing for lift claim)
    """
    arms = {"kp_off": {}, "kp_fixed": {}, "kp_gamma": {}}
    n = len(records)

    for arm_key in arms:
        grades = [r[arm_key]["grade"] for r in records]
        costs = [r[f"cost_{arm_key}_usd"] for r in records]
        hot = sum(1 for g in grades if g == GRADE_HOT)
        total_cost = sum(costs)
        pdc = hot / total_cost if total_cost > 0 else 0.0
        arms[arm_key] = {
            "HOT": hot,
            "hot_pct": round(100 * hot / n, 1) if n > 0 else 0,
            "total_cost_usd": round(total_cost, 6),
            "per_dollar_correctness": round(pdc, 2),
        }

    # 9-cell table
    nine: dict[str, dict] = {}
    for arm_key in arms:
        nine[arm_key] = {}
        for rc in ["Reading-A", "Reading-B", "Reading-C"]:
            rc_records = [r for r in records if r["reading_class"] == rc]
            if not rc_records:
                nine[arm_key][rc] = {"hot_pct": None, "n": 0}
                continue
            rc_hot = sum(1 for r in rc_records if r[arm_key]["grade"] == GRADE_HOT)
            nine[arm_key][rc] = {
                "hot_pct": round(100 * rc_hot / len(rc_records), 1),
                "n": len(rc_records),
                "HOT": rc_hot,
            }

    # D.1 β: Lift gate (standalone, load-bearing Tagline V3 Reading-C anchor)
    fixed_rc_hot = nine["kp_fixed"]["Reading-C"].get("hot_pct") or 0
    gamma_rc_hot = nine["kp_gamma"]["Reading-C"].get("hot_pct") or 0
    reading_c_lift_pp = round(gamma_rc_hot - fixed_rc_hot, 1)

    LIFT_GATE_THRESHOLD = 5.0  # pp
    lift_gate = "LIFT_GATE_CLEARED" if reading_c_lift_pp >= LIFT_GATE_THRESHOLD else "LIFT_GATE_NOT_CLEARED"

    # PDC verdict (informational — not blocking)
    gamma_pdc = arms["kp_gamma"]["per_dollar_correctness"]
    fixed_pdc = arms["kp_fixed"]["per_dollar_correctness"]
    pdc_verdict = "PDC_SUPPORTED" if gamma_pdc >= fixed_pdc else "PDC_BELOW_FIXED"

    # Overall verdict (D.1 β: lift gate is load-bearing, PDC is informational)
    if lift_gate == "LIFT_GATE_CLEARED":
        verdict = "SUPPORTED"
    else:
        verdict = "INDETERMINATE" if reading_c_lift_pp > 0 else "REFUTED"

    # Synthesis question validation
    synthesis_qs = [r for r in records if r.get("require_all_key_facts")]
    syn_van_miss = sum(1 for r in synthesis_qs if r["kp_off"]["grade"] == GRADE_MISS)
    syn_gamma_hot = sum(1 for r in synthesis_qs if r["kp_gamma"]["grade"] == GRADE_HOT)

    return {
        "panel_version": "test5",
        "architecture_decision": "D.1 beta — decoupled lift gate from PDC gate",
        "n": n,
        "reading_c_n": reading_c_n,
        "arms": arms,
        "nine_cell_hot_table": nine,
        "reading_c_lift_pp": reading_c_lift_pp,
        "lift_gate": lift_gate,
        "lift_gate_threshold_pp": LIFT_GATE_THRESHOLD,
        "pdc_verdict": pdc_verdict,
        "pdc_detail": {
            "gamma_pdc": gamma_pdc,
            "fixed_pdc": fixed_pdc,
            "note": "PDC is informational in D.1 beta — not blocking lift verdict",
        },
        "gamma_hypothesis_verdict": verdict,
        "tagline_v3_reading_c_status": (
            "PUBLICATION-GRADE anchor — Tagline V3 Reading C CONFIRMED (pending Founder ratification)"
            if verdict == "SUPPORTED"
            else "HYPOTHESIS-CLASS — reading_c_lift below gate"
            if verdict == "INDETERMINATE"
            else "REFUTED"
        ),
        "confound_patches_applied": {
            "excerpt_leakage_fix": "C02+C04 questions rewritten to avoid excerpt vocabulary",
            "context_dilution_fix": "include_bridge_rationale=False for Reading-A arm",
        },
        "panel_design_validation": {
            "synthesis_questions_total": len(synthesis_qs),
            "synthesis_vanilla_miss": syn_van_miss,
            "synthesis_gamma_hot": syn_gamma_hot,
            "keyword_reachability_defeated": syn_van_miss == len(synthesis_qs),
        },
        "total_cost_all_arms_usd": round(
            sum(r.get("cost_all_three_usd", 0) for r in records), 6
        ),
    }


# ─── Main runner ──────────────────────────────────────────────────────────────

def _system_prompt() -> str:
    return """You are a cooperative platform knowledge assistant. You will be given
a question and a set of reference facts from the Verdania cooperative AI platform corpus.
Answer the question using ONLY the provided reference facts.
If the answer is not in the facts, say "I don't know -- not in provided context."
Be precise with numbers and names. Do not add information beyond what is in the facts."""


def run_test5(budget_map: dict | None = None) -> dict:
    """Run Panel 5 empirical evaluation. Returns full results dict."""
    _load_sds_env()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set. Load SDS.env first.")
        sys.exit(1)

    cfg = load_config()
    if not cfg.get("KNOWLEDGE_PUMP_TEST_ENABLED", False):
        print("[kp_test5] GATE CLOSED: KNOWLEDGE_PUMP_TEST_ENABLED=false")
        sys.exit(0)

    if budget_map is None:
        budget_map = cfg.get("OPTION_GAMMA_BUDGET_MAP", {
            "Reading-A": 1.0,
            "Reading-B": 1.5,
            "Reading-C": 2.5,
        })

    corpus = build_pilot_corpus(load_excerpts=True)

    # Pre-flight: excerpt vocabulary audit
    print("\n[kp_test5] Pre-flight excerpt vocabulary audit...", flush=True)
    audit = _excerpt_vocabulary_audit(corpus, KP_TEST5_PANEL)
    if audit:
        print(f"  WARNING: {len(audit)} potential leakage points detected:", flush=True)
        for qid_fid, tokens in audit.items():
            print(f"    {qid_fid}: {tokens[:10]}", flush=True)
    else:
        print("  PASS: No vocabulary overlap detected between questions and excerpts.", flush=True)

    retriever = KPRetriever(corpus)
    client = load_api_client("anthropic")
    panel = KP_TEST5_PANEL
    records: list[dict] = []
    reading_c_qs = [q for q in panel if q.reading_class == "Reading-C"]
    reading_c_n = len(reading_c_qs)

    ts_start = datetime.now(timezone.utc).isoformat()
    print(f"\n[kp_test5] Starting {len(panel)}-question Panel 5 run...", flush=True)
    print(f"  Confound patches: excerpt-leakage + context-dilution", flush=True)
    print(f"  D.1 = beta (decoupled lift gate)", flush=True)

    for qi, query in enumerate(panel, 1):
        print(f"\n  Q{qi}/{len(panel)}: {query.qid} ({query.reading_class})", flush=True)

        # Determine include_bridge_rationale per reading class (Confound 2 fix)
        incl_bridge = INCLUDE_BRIDGE_RATIONALE_PER_CLASS.get(query.reading_class, True)

        # Arm 1: KP-off (vanilla retrieval)
        van_result = retriever.retrieve_vanilla(query.question, top_k=5)
        van_context = van_result.context_for_llm(include_bridge_rationale=False)

        # Arm 2: KP-fixed (top-3 bridge, no dynamic budget)
        top_mastery_fixed = 3
        fixed_result = retriever.retrieve_kp(
            query.question,
            mastery_profile=query.kp_mastery_profile,
            top_k=5,
            top_mastery=top_mastery_fixed,
        )
        # Confound 2 fix: no bridge rationale for Reading-A
        fixed_context = fixed_result.context_for_llm(include_bridge_rationale=incl_bridge)

        # Arm 3: KP-gamma (dynamic budget per reading_class)
        top_mastery_gamma = compute_dynamic_budget(query.reading_class, budget_map)
        gamma_result = retriever.retrieve_kp(
            query.question,
            mastery_profile=query.kp_mastery_profile,
            top_k=5,
            top_mastery=top_mastery_gamma,
        )
        gamma_context = gamma_result.context_for_llm(include_bridge_rationale=incl_bridge)

        # LLM calls for all three arms
        van_llm = ask_llm(client, query.question, van_context)
        fixed_llm = ask_llm(client, query.question, fixed_context)
        gamma_llm = ask_llm(client, query.question, gamma_context)

        # Grade
        van_grade = grade_kp_result(van_llm["answer"], query)
        fixed_grade = grade_kp_result(fixed_llm["answer"], query)
        gamma_grade = grade_kp_result(gamma_llm["answer"], query)

        cost_van = van_llm["cost_usd_est"]
        cost_fixed = fixed_llm["cost_usd_est"]
        cost_gamma = gamma_llm["cost_usd_est"]

        # Diagnosis for targeted facts
        van_fact_ids_in_context = [f.fact.fact_id for f in van_result.top_k]
        fixed_fact_ids_in_context = [f.fact.fact_id for f in fixed_result.top_k]
        gamma_fact_ids_in_context = [f.fact.fact_id for f in gamma_result.top_k]

        record = {
            "qid": query.qid,
            "reading_class": query.reading_class,
            "require_all_key_facts": query.require_all_key_facts,
            "target_fact_ids": query.target_fact_ids,
            "kp_off": van_grade,
            "kp_fixed": fixed_grade,
            "kp_gamma": gamma_grade,
            "cost_kp_off_usd": cost_van,
            "cost_kp_fixed_usd": cost_fixed,
            "cost_kp_gamma_usd": cost_gamma,
            "cost_all_three_usd": cost_van + cost_fixed + cost_gamma,
            "top5_kp_off": van_fact_ids_in_context,
            "top5_kp_fixed": fixed_fact_ids_in_context,
            "top5_kp_gamma": gamma_fact_ids_in_context,
            "include_bridge_rationale_used": incl_bridge,
            "top_mastery_fixed": top_mastery_fixed,
            "top_mastery_gamma": top_mastery_gamma,
            "answers": {
                "kp_off": van_llm["answer"][:500],
                "kp_fixed": fixed_llm["answer"][:500],
                "kp_gamma": gamma_llm["answer"][:500],
            },
        }
        records.append(record)

        # Per-question print
        for arm_key, grade_dict in [
            ("kp_off", van_grade), ("kp_fixed", fixed_grade), ("kp_gamma", gamma_grade)
        ]:
            g = grade_dict["grade"]
            print(f"    {arm_key:10}: {g:4}", flush=True)

    # Build full summary
    summary = aggregate_test5_summary(records, reading_c_n)
    summary["records"] = records
    summary["ts_start"] = ts_start
    summary["ts_end"] = datetime.now(timezone.utc).isoformat()
    summary["excerpt_audit"] = audit
    summary["panel_summary"] = panel_summary()

    # Stone Tablet: write results
    ts = datetime.now(timezone.utc).isoformat().replace(":", "-").replace("+", "Z")[:22]
    detail_path = RESULTS_DIR / f"kp_test5_detail_{ts}.jsonl"
    summary_path = RESULTS_DIR / f"kp_test5_summary_{ts}.jsonl"

    with detail_path.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

    summary_copy = {k: v for k, v in summary.items() if k != "records"}
    with summary_path.open("w", encoding="utf-8") as fh:
        fh.write(json.dumps(summary_copy, ensure_ascii=False, indent=2) + "\n")

    print(f"\n  [kp_test5] Results written:", flush=True)
    print(f"    Detail:  {detail_path}", flush=True)
    print(f"    Summary: {summary_path}", flush=True)

    # Print results table
    _print_results5(summary)
    return summary


def _print_results5(summary: dict) -> None:
    n = summary["n"]
    nine = summary["nine_cell_hot_table"]
    arms = summary["arms"]

    print(f"\n{'='*65}", flush=True)
    print(f"KP Test 5 (Panel 5) Results ({n} questions)", flush=True)
    print(f"Architecture: {summary['architecture_decision']}", flush=True)
    print(f"Confounds patched: excerpt-leakage + context-dilution", flush=True)
    print(f"{'='*65}", flush=True)

    for arm in ["kp_off", "kp_fixed", "kp_gamma"]:
        a = arms[arm]
        print(
            f"  {arm:10}: {a['HOT']}/{n} HOT ({a['hot_pct']}%) "
            f"PDC={a['per_dollar_correctness']:.2f} "
            f"cost=${a['total_cost_usd']:.5f}",
            flush=True,
        )

    print(f"\n  9-Cell HOT Table:", flush=True)
    header = f"  {'':12} {'Reading-A':>12} {'Reading-B':>12} {'Reading-C':>12}"
    print(header, flush=True)
    for arm in ["kp_off", "kp_fixed", "kp_gamma"]:
        row = nine[arm]
        def cell(rc: str) -> str:
            d = row.get(rc, {})
            hp = d.get("hot_pct")
            return f"{'N/A':>12}" if hp is None else f"{hp:>11.1f}%"
        print(f"  {arm:12} {cell('Reading-A')} {cell('Reading-B')} {cell('Reading-C')}", flush=True)

    lift = summary.get("reading_c_lift_pp", 0)
    lift_gate = summary.get("lift_gate", "?")
    pdc_v = summary.get("pdc_verdict", "?")
    verdict = summary.get("gamma_hypothesis_verdict", "?")

    print(f"\n  Reading-C lift (gamma vs fixed): {lift:+.1f}pp", flush=True)
    print(f"  Lift gate (>5pp threshold): {lift_gate}", flush=True)
    print(f"  PDC verdict (informational): {pdc_v}", flush=True)
    print(f"\n  VERDICT: {verdict}", flush=True)
    print(f"  Tagline V3: {summary.get('tagline_v3_reading_c_status', '')}", flush=True)
    print(f"\n  Total cost: ${summary['total_cost_all_arms_usd']:.4f}", flush=True)
    print(f"{'='*65}", flush=True)


if __name__ == "__main__":
    run_test5()
