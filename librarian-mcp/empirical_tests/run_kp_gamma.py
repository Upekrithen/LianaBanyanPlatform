"""
Knowledge Pump Empirical Test 4 — Option Gamma (Dynamic Budget) Runner
KP-Option-Gamma / B132

Runs KP Test 3 panel with THREE conditions side-by-side:
  Arm 1 (KP-off):    vanilla retrieval (top-5 keyword, no mastery)
  Arm 2 (KP-fixed):  KP-beta retrieval (top-5 kw + fixed top-3 mastery)
  Arm 3 (KP-gamma):  KP-beta retrieval (top-5 kw + dynamic top-mastery per reading_class)

Dynamic budget mapping (OPTION_GAMMA_BUDGET_MAP from knowledge_pump.json):
  Reading-A: 1.0x -> top_mastery=3  (same as fixed)
  Reading-B: 1.5x -> top_mastery=5  (+2 vs fixed)
  Reading-C: 2.5x -> top_mastery=8  (+5 vs fixed)

Hypothesis (D.2 from K539): gamma recovers mastery-bridging differentiation that
fixed budget destroyed under SCOPE A's dense corpus. Reading-C queries should show
>5pp HOT lift (gamma vs fixed) because the expanded mastery budget pulls in secondary-
stat bridge facts that were crowded out under the 3-mastery-slot fixed ceiling.

Publication gate: gamma HOT(Reading-C) - fixed HOT(Reading-C) >= 5pp.

Brick Wall: fixed-budget code path unchanged; this runner adds a new gamma_dynamic
path. The original run_kp_test3.py retains all existing receipts unmodified.

Filed: B132, 2026-04-29 by Knight (KP-Option-Gamma).
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
from empirical_tests.kp_panels_test3 import KPTestQuery, KP_TEST3_PANEL

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
    return {}


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


def ask_llm(client, question: str, context: str, model: str = _DEFAULT_MODEL) -> dict:
    prompt = f"Reference facts:\n{context}\n\nQuestion: {question}"
    t0 = time.perf_counter()
    try:
        response = client.messages.create(
            model=model,
            max_tokens=256,
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
            print(f"[kp_gamma] Model {model} failed ({exc}), retrying {_FALLBACK_MODEL}", flush=True)
            return ask_llm(client, question, context, model=_FALLBACK_MODEL)
        return {
            "answer": f"[ERROR: {exc}]",
            "tokens_in": 0,
            "tokens_out": 0,
            "cost_usd_est": 0.0,
            "elapsed_s": round(elapsed, 3),
            "model": model,
        }


def _arm_dict(
    arm_name: str,
    retrieval_result,
    llm_result: dict,
    grade_result: dict,
) -> dict:
    return {
        "arm": arm_name,
        "top_k_facts": [sf.as_dict() for sf in retrieval_result.top_k],
        "context_size": len(retrieval_result.top_k),
        "context_char_count": len(retrieval_result.context_text),
        "answer": llm_result["answer"][:800],
        "grade": grade_result["grade"],
        "grade_detail": grade_result,
        "tokens_in": llm_result["tokens_in"],
        "tokens_out": llm_result["tokens_out"],
        "cost_usd_est": llm_result["cost_usd_est"],
        "elapsed_s": llm_result["elapsed_s"],
        "model": llm_result["model"],
    }


def run_query_triple(
    client,
    query: KPTestQuery,
    retriever: KPRetriever,
    budget_map: dict,
    fallback_multiplier: float,
    verbose: bool = True,
) -> dict:
    """Run one query through all 3 arms (KP-off, KP-fixed, KP-gamma)."""
    if verbose:
        rc = query.reading_class or "(untagged)"
        print(f"\n[{query.qid}] {rc} | {query.question[:70]}...", flush=True)

    # Arm 1: KP-off (vanilla, no mastery)
    van_ret = retriever.retrieve_vanilla(query.question, top_k=5)
    van_llm = ask_llm(client, query.question, van_ret.context_text)
    van_grade = grade_kp_result(van_llm["answer"], query)

    # Arm 2: KP-fixed (top-5 kw + fixed top-3 mastery)
    fixed_ret = retriever.retrieve_kp_beta(
        query.question, query.kp_mastery_profile, top_keyword=5, top_mastery=3
    )
    fixed_llm = ask_llm(client, query.question, fixed_ret.context_text)
    fixed_grade = grade_kp_result(fixed_llm["answer"], query)

    # Arm 3: KP-gamma (top-5 kw + dynamic top_mastery per reading_class)
    gamma_top_mastery = compute_dynamic_budget(
        query.reading_class,
        budget_map=budget_map,
        fallback_multiplier=fallback_multiplier,
    )
    gamma_ret = retriever.retrieve_kp_beta(
        query.question, query.kp_mastery_profile, top_keyword=5, top_mastery=gamma_top_mastery
    )
    gamma_llm = ask_llm(client, query.question, gamma_ret.context_text)
    gamma_grade = grade_kp_result(gamma_llm["answer"], query)

    if verbose:
        print(
            f"  KP-off={van_grade['grade']} | KP-fixed={fixed_grade['grade']} | "
            f"KP-gamma={gamma_grade['grade']} (mastery_budget={gamma_top_mastery})",
            flush=True,
        )

    total_cost = van_llm["cost_usd_est"] + fixed_llm["cost_usd_est"] + gamma_llm["cost_usd_est"]

    return {
        "qid": query.qid,
        "question": query.question,
        "target_fact_id": query.target_fact_id,
        "category": query.category,
        "reading_class": query.reading_class,
        "kp_mastery_profile": query.kp_mastery_profile,
        "gamma_top_mastery": gamma_top_mastery,
        "kp_off": _arm_dict("kp_off", van_ret, van_llm, van_grade),
        "kp_fixed": _arm_dict("kp_fixed", fixed_ret, fixed_llm, fixed_grade),
        "kp_gamma": _arm_dict("kp_gamma", gamma_ret, gamma_llm, gamma_grade),
        "cost_all_three_usd": round(total_cost, 6),
        "run_at": datetime.now(timezone.utc).isoformat(),
    }


def compute_9cell_table(records: list[dict]) -> dict:
    """Compute 9-cell HOT% table: 3 modes × 3 reading classes."""
    reading_classes = ["Reading-A", "Reading-B", "Reading-C"]
    arms = ["kp_off", "kp_fixed", "kp_gamma"]

    table: dict = {}
    for arm in arms:
        table[arm] = {}
        for rc in reading_classes:
            subset = [r for r in records if r.get("reading_class") == rc]
            if not subset:
                table[arm][rc] = {"n": 0, "HOT": 0, "hot_pct": None}
                continue
            hot = sum(1 for r in subset if r[arm]["grade"] == GRADE_HOT)
            table[arm][rc] = {
                "n": len(subset),
                "HOT": hot,
                "hot_pct": round(hot / len(subset) * 100, 1),
            }
    return table


def aggregate_gamma_summary(records: list[dict], run_ts: str, config: dict) -> dict:
    n = len(records)
    arms = ["kp_off", "kp_fixed", "kp_gamma"]

    stats = {}
    for arm in arms:
        hot = sum(1 for r in records if r[arm]["grade"] == GRADE_HOT)
        hit = sum(1 for r in records if r[arm]["grade"] == GRADE_HIT)
        miss = sum(1 for r in records if r[arm]["grade"] == GRADE_MISS)
        cost = round(sum(r[arm]["cost_usd_est"] for r in records), 6)
        pdc = round(hot / cost, 4) if cost > 0 else 0.0
        stats[arm] = {
            "HOT": hot, "HIT": hit, "MISS": miss,
            "hot_pct": round(hot / max(1, n) * 100, 1),
            "total_cost_usd": cost,
            "per_dollar_correctness": pdc,
        }

    # Reading-C lift: gamma vs fixed
    rc_records = [r for r in records if r.get("reading_class") == "Reading-C"]
    rc_gamma_hot = sum(1 for r in rc_records if r["kp_gamma"]["grade"] == GRADE_HOT)
    rc_fixed_hot = sum(1 for r in rc_records if r["kp_fixed"]["grade"] == GRADE_HOT)
    rc_n = len(rc_records)
    reading_c_lift_pp = (
        round((rc_gamma_hot - rc_fixed_hot) / max(1, rc_n) * 100, 1)
        if rc_n > 0 else None
    )

    hypothesis_supported = (
        reading_c_lift_pp is not None and reading_c_lift_pp > 5
        and stats["kp_gamma"]["per_dollar_correctness"] >= stats["kp_fixed"]["per_dollar_correctness"]
    )
    hypothesis_refuted = (
        reading_c_lift_pp is not None and reading_c_lift_pp < 2
    )
    verdict = (
        "SUPPORTED" if hypothesis_supported
        else "REFUTED" if hypothesis_refuted
        else "INDETERMINATE"
    )

    nine_cell = compute_9cell_table(records)

    return {
        "run_ts": run_ts,
        "panel": "KP_TEST3",
        "n": n,
        "session": "KP-Option-Gamma",
        "b_session": "B132",
        "retrieval_mode": "gamma_dynamic",
        "budget_map": config.get("OPTION_GAMMA_BUDGET_MAP", {}),
        "arms": stats,
        "nine_cell_hot_table": nine_cell,
        "reading_c_lift_pp": reading_c_lift_pp,
        "reading_c_n": rc_n,
        "gamma_hypothesis_verdict": verdict,
        "total_cost_all_arms_usd": round(sum(r["cost_all_three_usd"] for r in records), 6),
        "call_sign": "v-kp-option-gamma-K-KP-GAMMA",
    }


def main():
    _load_sds_env()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set. Load SDS.env first.")
        sys.exit(1)

    cfg = load_config()
    if not cfg.get("KNOWLEDGE_PUMP_TEST_ENABLED", False):
        print("[kp_gamma] GATE CLOSED: KNOWLEDGE_PUMP_TEST_ENABLED=false")
        sys.exit(0)

    budget_map = cfg.get("OPTION_GAMMA_BUDGET_MAP", {"Reading-A": 1.0, "Reading-B": 1.5, "Reading-C": 2.5})
    fallback = float(cfg.get("OPTION_GAMMA_FALLBACK_MULTIPLIER", 1.0))

    corpus = build_pilot_corpus()
    retriever = KPRetriever(corpus)
    client = load_api_client()

    run_ts = datetime.now(timezone.utc).isoformat()
    ts_file = run_ts.replace(":", "-").replace(".", "-")[:19]

    print(f"KP-Option-Gamma A/B/C Run — {run_ts}")
    print(f"Panel: {len(KP_TEST3_PANEL)} queries | Budget map: {budget_map}")
    print()

    records = []
    total_cost = 0.0
    per_condition_pause = float(cfg.get("budget", {}).get("per_condition_pause_usd", 1000))

    for q in KP_TEST3_PANEL:
        rec = run_query_triple(client, q, retriever, budget_map, fallback)
        records.append(rec)
        total_cost += rec["cost_all_three_usd"]
        if total_cost >= per_condition_pause:
            print(f"\n[PAUSE] per_condition_pause_usd={per_condition_pause} reached. Stopping.")
            break

    summary = aggregate_gamma_summary(records, run_ts, cfg)

    detail_path = RESULTS_DIR / f"kp_gamma_detail_{ts_file}.jsonl"
    summary_path = RESULTS_DIR / f"kp_gamma_summary_{ts_file}.jsonl"

    with detail_path.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    with summary_path.open("w", encoding="utf-8") as f:
        f.write(json.dumps(summary, ensure_ascii=False) + "\n")

    print(f"\n{'='*60}")
    print(f"KP-Option-Gamma Results")
    print(f"{'='*60}")
    print(f"  KP-off:   {summary['arms']['kp_off']['HOT']}/{summary['n']} HOT "
          f"({summary['arms']['kp_off']['hot_pct']}%) "
          f"PDC={summary['arms']['kp_off']['per_dollar_correctness']:.2f}")
    print(f"  KP-fixed: {summary['arms']['kp_fixed']['HOT']}/{summary['n']} HOT "
          f"({summary['arms']['kp_fixed']['hot_pct']}%) "
          f"PDC={summary['arms']['kp_fixed']['per_dollar_correctness']:.2f}")
    print(f"  KP-gamma: {summary['arms']['kp_gamma']['HOT']}/{summary['n']} HOT "
          f"({summary['arms']['kp_gamma']['hot_pct']}%) "
          f"PDC={summary['arms']['kp_gamma']['per_dollar_correctness']:.2f}")
    print()
    print(f"  9-Cell HOT Table (arm × reading_class):")
    for arm in ["kp_off", "kp_fixed", "kp_gamma"]:
        row = summary["nine_cell_hot_table"][arm]
        cells = " | ".join(
            f"{rc.split('-')[1]}: {row[rc]['hot_pct']}%" if row[rc]["hot_pct"] is not None else f"{rc.split('-')[1]}: N/A"
            for rc in ["Reading-A", "Reading-B", "Reading-C"]
        )
        print(f"    {arm:10}: {cells}")
    print()
    print(f"  Reading-C lift (gamma vs fixed): {summary['reading_c_lift_pp']}pp "
          f"(n={summary['reading_c_n']})")
    print(f"  VERDICT: {summary['gamma_hypothesis_verdict']}")
    print()
    print(f"  Total cost (industry term, membership-orthogonal): "
          f"${summary['total_cost_all_arms_usd']:.4f}")
    print(f"  Detail: {detail_path}")
    print(f"  Summary: {summary_path}")
    print(f"  Call sign: {summary['call_sign']}")


if __name__ == "__main__":
    main()
