#!/usr/bin/env python3
"""
K528 Phase E — Full-Stack Cathedral Librarian Integration Test
==============================================================
Routes 30 questions through the complete K525-LAUNCH stack:
  Conductor's Baton -> Cathedral routing -> Cost-cap -> Telemetry -> Response

Logs per-query:
  - Conductor routing decision (category, routed model, rationale)
  - Cathedral consult results (scribes hit, score, entries returned)
  - Response + HOT/HIT/MISS grade
  - Cost + latency telemetry
  - Circuit-breaker and cost-cap events (if triggered)

Output: results_r11v2_K528/phase_e_integration.json
"""
from __future__ import annotations
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))


def _load_sds_env() -> None:
    candidates = [
        Path(__file__).resolve().parents[3] / "Asteroid-ProofVault" / "LockBox" / "SDS.env",
        Path(__file__).resolve().parents[2] / "Asteroid-ProofVault" / "LockBox" / "SDS.env",
    ]
    sds = next((p for p in candidates if p.exists()), None)
    if sds is None:
        return
    for line in sds.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key, val = key.strip(), val.strip()
        if key and val and not os.environ.get(key):
            os.environ[key] = val


_load_sds_env()

from r11_adapters import lb_cathedral_adapter  # noqa: E402

BANK_PATH = SCRIPT_DIR / "R11v2_QUESTION_BANK_SEALED_K528.json"
OUT_DIR = SCRIPT_DIR / "results_r11v2_K528"
OUT_PATH = OUT_DIR / "phase_e_integration.json"

# Conductor's Baton routing table (K525 production routing)
CONDUCTOR_ROUTING: dict[str, str] = {
    "canonical_statistics":   "claude-haiku-4-5-20251001",
    "architecture_mechanics": "claude-haiku-4-5-20251001",
    "economic_governance":    "claude-sonnet-4-6",
    "member_journey":         "claude-haiku-4-5-20251001",
    "regulatory_compliance":  "claude-sonnet-4-6",
    "historical_precedent":   "claude-haiku-4-5-20251001",
}

CONDUCTOR_RATIONALE = {
    "canonical_statistics":   "Exact factual recall — haiku sufficient, lowest cost",
    "architecture_mechanics": "Structural factual retrieval — haiku sufficient",
    "economic_governance":    "Analytical nuance + multi-factor computation — sonnet needed",
    "member_journey":         "Procedural factual — haiku sufficient",
    "regulatory_compliance":  "Compliance analysis nuance — sonnet needed",
    "historical_precedent":   "Historical factual recall — haiku sufficient",
}

PRICING = {
    "claude-haiku-4-5-20251001": {"input": 1.00,  "output": 5.00},
    "claude-sonnet-4-6":          {"input": 3.00,  "output": 15.00},
}

# Phase E: sample 5 questions from each of 6 categories = 30 total
# Select the 5 MOST CANONICAL questions per category (first 5 in bank)
def select_30_questions(questions: list[dict]) -> list[dict]:
    from collections import defaultdict
    by_cat: dict[str, list] = defaultdict(list)
    for q in questions:
        cat = q["category"]
        if len(by_cat[cat]) < 5:
            by_cat[cat].append(q)
    selected = []
    for cat in ["canonical_statistics", "architecture_mechanics", "economic_governance",
                "member_journey", "regulatory_compliance", "historical_precedent"]:
        selected.extend(by_cat[cat])
    return selected


def grade_response(text: str, required: list[str]) -> str:
    if not required:
        return "ungraded"
    text_lower = text.lower()
    hits = sum(1 for e in required if str(e).lower() in text_lower)
    n = len(required)
    if hits == n:
        return "HOT"
    if hits >= max(1, (n + 1) // 2):
        return "HIT"
    return "MISS"


def run_integration_test() -> dict:
    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]
    test_bank = select_30_questions(questions)
    print(f"Phase E — 30 integration queries (5 per category, through full K525 stack)")
    print(f"  Routing: Conductor's Baton -> Cathedral -> Response -> Telemetry")
    print()

    if not lb_cathedral_adapter.CONSULT_CLI_PATH.exists():
        raise FileNotFoundError(f"consult_scribes_cli.mjs not found: {lb_cathedral_adapter.CONSULT_CLI_PATH}")
    client = lb_cathedral_adapter.ConsultClient(lb_cathedral_adapter.CONSULT_CLI_PATH)

    records = []
    total_cost = 0.0
    category_costs: dict[str, float] = {}
    category_hots: dict[str, int] = {}
    category_total: dict[str, int] = {}
    cost_cap_events = []
    circuit_breaker_events = []

    # Cost cap simulation: $5 per-category warning threshold (scaled from $50 per-condition)
    PER_CATEGORY_WARN = 5.00

    try:
        for q in test_bank:
            qid = q["id"]
            category = q["category"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])

            # Step 1: Conductor's Baton routing decision
            routed_model = CONDUCTOR_ROUTING[category]
            routing_rationale = CONDUCTOR_RATIONALE[category]

            print(f"  [{qid:<14}] cat={category[:8]}  -> {routed_model.split('-')[-1]}  ", end="")

            # Step 2: Cathedral Scribe retrieval (Pheromone Phase 0 -> consult_scribes)
            t0 = time.perf_counter()
            try:
                consult_resp = client.consult(question_text, max_entries=100)
            except Exception as e:
                circuit_breaker_events.append({"qid": qid, "event": f"consult_scribes error: {e}", "ts": datetime.now(timezone.utc).isoformat()})
                print(f"CIRCUIT_BREAKER: {e}")
                continue
            consult_latency = time.perf_counter() - t0
            scribes_hit = [c["scribe_id"] for c in consult_resp.get("result", {}).get("scribes_consulted", [])]

            # Step 3: Response synthesis via routed model
            import anthropic
            api_key = os.environ.get("ANTHROPIC_API_KEY")
            if not api_key:
                raise EnvironmentError("ANTHROPIC_API_KEY not set")
            ac_client = anthropic.Anthropic(api_key=api_key)

            # Build system from Cathedral retrieval (same as lb_cathedral_adapter)
            entries = consult_resp.get("result", {}).get("entries", [])
            if entries:
                cathedral_lines = [f"Scribes consulted: {', '.join(scribes_hit)}"]
                for e in entries[:10]:
                    cathedral_lines.append(f"\n### Scribe {e.get('scribe_id', '?')}")
                    cathedral_lines.append(e.get("observation", ""))
                cathedral_md = "\n".join(cathedral_lines)
            else:
                cathedral_md = "(no Scribe entries matched this query)"

            r9_path = lb_cathedral_adapter.R9_PRELOAD_PATH
            preload = r9_path.read_text(encoding="utf-8") if r9_path.exists() else ""
            system_prompt = lb_cathedral_adapter.CATHEDRAL_SYS_PREFIX + preload + lb_cathedral_adapter.CATHEDRAL_DIVIDER + cathedral_md

            pricing = PRICING.get(routed_model, {"input": 3.00, "output": 15.00})

            t1 = time.perf_counter()
            try:
                response = ac_client.messages.create(
                    model=routed_model,
                    max_tokens=512,
                    system=system_prompt,
                    messages=[{"role": "user", "content": question_text}],
                )
            except Exception as e:
                circuit_breaker_events.append({"qid": qid, "event": f"LLM API error: {e}", "ts": datetime.now(timezone.utc).isoformat()})
                print(f"LLM_ERROR: {e}")
                continue
            llm_latency = time.perf_counter() - t1

            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            cost = (input_tokens / 1_000_000) * pricing["input"] + (output_tokens / 1_000_000) * pricing["output"]
            text = response.content[0].text if response.content else ""

            total_latency = time.perf_counter() - t0
            grade = grade_response(text, required)
            total_cost += cost

            category_costs[category] = category_costs.get(category, 0) + cost
            category_hots[category] = category_hots.get(category, 0) + (1 if grade == "HOT" else 0)
            category_total[category] = category_total.get(category, 0) + 1

            # Step 4: Cost-cap check (simulation)
            if category_costs.get(category, 0) > PER_CATEGORY_WARN:
                cost_cap_events.append({
                    "qid": qid, "category": category,
                    "category_spend": category_costs[category],
                    "threshold": PER_CATEGORY_WARN,
                    "event": "WARN (below kill threshold)",
                    "ts": datetime.now(timezone.utc).isoformat()
                })

            record = {
                "qid": qid,
                "category": category,
                "question": question_text,
                "conductor_routing": {
                    "routed_model": routed_model,
                    "rationale": routing_rationale,
                    "category_prior_applied": True,
                },
                "cathedral_retrieval": {
                    "scribes_consulted": scribes_hit,
                    "entries_returned": len(entries),
                    "consult_latency_s": round(consult_latency, 3),
                },
                "response": {
                    "text": text[:500],  # truncate for storage
                    "grade": grade,
                    "required_elements": required,
                },
                "telemetry": {
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "cost_usd": round(cost, 6),
                    "llm_latency_s": round(llm_latency, 3),
                    "total_latency_s": round(total_latency, 3),
                    "running_total_usd": round(total_cost, 6),
                },
                "ts": datetime.now(timezone.utc).isoformat(),
            }
            records.append(record)

            scribes_tag = ",".join(scribes_hit[:3]) or "-"
            print(f"{grade:<5} ${cost:.5f} (${total_cost:.3f})  [{scribes_tag}]")

            time.sleep(0.20)  # brief pacing

    finally:
        client.close()

    # Aggregate
    graded = [r for r in records if r.get("response", {}).get("grade")]
    total_hot = sum(1 for r in graded if r["response"]["grade"] == "HOT")
    total_n = len(graded)
    hot_pct = total_hot / total_n * 100 if total_n else 0
    cost_per_hot = total_cost / max(total_hot, 1)

    cat_breakdown = {}
    for cat in CONDUCTOR_ROUTING:
        n = category_total.get(cat, 0)
        hot = category_hots.get(cat, 0)
        cat_breakdown[cat] = {
            "n": n, "HOT": hot, "hot_pct": round(hot/n*100, 1) if n else 0,
            "cost_usd": round(category_costs.get(cat, 0), 6),
            "routed_to": CONDUCTOR_ROUTING[cat],
        }

    print(f"\n=== PHASE E COMPLETE ===")
    print(f"  Queries: {total_n}/30")
    print(f"  HOT: {total_hot}/{total_n} ({hot_pct:.1f}%)")
    print(f"  Total cost: ${total_cost:.4f}")
    print(f"  Cost/HOT: ${cost_per_hot:.4f}")
    print(f"  Circuit-breaker events: {len(circuit_breaker_events)}")
    print(f"  Cost-cap warn events: {len(cost_cap_events)}")
    print("\nPer-category breakdown:")
    for cat, data in cat_breakdown.items():
        if data['n'] > 0:
            print(f"  {cat[:25]:<25} HOT={data['HOT']}/{data['n']} ({data['hot_pct']:.0f}%)  -> {data['routed_to'].split('-')[-1]}  ${data['cost_usd']:.4f}")

    result = {
        "phase": "E",
        "run_ts": datetime.now(timezone.utc).isoformat(),
        "description": "Full-stack integration test: Conductor's Baton + Cathedral + Telemetry, 30 queries",
        "stack": "K525-LAUNCH: Conductor's Baton routing + lb_cathedral retrieval + response synthesis",
        "queries_completed": total_n,
        "hot_count": total_hot,
        "hot_pct": round(hot_pct, 3),
        "total_cost_usd": round(total_cost, 6),
        "cost_per_hot_usd": round(cost_per_hot, 6),
        "category_breakdown": cat_breakdown,
        "verification": {
            "E_G1": total_n >= 30,
            "E_G2": all("conductor_routing" in r for r in records),
            "E_G3": all("telemetry" in r for r in records),
            "E_G4": len(circuit_breaker_events) == 0,
            "E_G5": f"{len(cost_cap_events)} cost-cap warn events recorded",
        },
        "circuit_breaker_events": circuit_breaker_events,
        "cost_cap_events": cost_cap_events,
        "records": records,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nPhase E output: {OUT_PATH}")
    return result


if __name__ == "__main__":
    run_integration_test()
