#!/usr/bin/env python3
"""
R11-v2 Cross-Vendor Memory Benchmark Runner — K528
====================================================
16 conditions across Phase B (10) and Phase C (6 Cathedral configs).

Phase B — Vendor-native + cold baselines:
  cold_haiku            - Claude Haiku 4.5, no corpus
  cold_gpt4o_mini       - GPT-4o-mini, no corpus
  cold_gemini_flash     - Gemini 2.5 Flash, no corpus
  cold_sonnet           - Claude Sonnet 4.6, no corpus
  chatgpt_memory        - GPT-4o + 106K-token corpus in system prompt
  chatgpt_memory_gpt5   - GPT-4.1 + corpus (gpt-4.1 proxy for gpt-5)
  claude_projects_sonnet- claude-sonnet-4-6 + corpus-as-reference-doc
  claude_projects_opus  - claude-opus-4-7 + corpus-as-reference-doc
  gemini_gems           - Gemini 2.5 Pro + corpus-as-system-instruction
  perplexity_spaces     - Sonar-Pro + corpus-in-system-prompt

Phase C — LB Cathedral configurations:
  lb_cathedral_haiku         - Cathedral routing → Haiku (K444 BEST baseline)
  lb_cathedral_sonnet        - Cathedral routing → Sonnet 4.6
  lb_cathedral_opus          - Cathedral routing → Opus 4.7
  lb_cathedral_gpt4o_mini    - Cathedral routing → gpt-4o-mini (cross-vendor)
  lb_cathedral_gemini_flash  - Cathedral routing → gemini-2.5-flash (cross-vendor)
  lb_cathedral_conductor_auto- Conductor's Baton per-query routing (production path)

Usage:
  python run_r11v2.py --phase B --out results_r11v2_K528
  python run_r11v2.py --phase C --out results_r11v2_K528
  python run_r11v2.py --phase ALL --out results_r11v2_K528
  python run_r11v2.py --conditions cold_haiku cold_sonnet --out results_r11v2_K528

Per-condition spend pause: report to Founder if any condition exceeds $100 individually.
NO hard budget cap — per Founder K528 authorization.
Checkpoint/resume: skip conditions with existing output files (use --force to re-run).

Env vars: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY (or GEMINI_API_KEY), PERPLEXITY_API_KEY
Self-loads from SDS.env at startup.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# SDS.env self-loader (background subprocess strips shell env inheritance)
# ---------------------------------------------------------------------------
def _load_sds_env() -> None:
    candidates = [
        Path(__file__).resolve().parents[3] / "Asteroid-ProofVault" / "LockBox" / "SDS.env",
        Path(__file__).resolve().parents[2] / "Asteroid-ProofVault" / "LockBox" / "SDS.env",
        Path("Asteroid-ProofVault") / "LockBox" / "SDS.env",
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

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from r11_adapters import chatgpt_memory_adapter, claude_projects_adapter  # noqa: E402
from r11_adapters import gemini_gems_adapter, perplexity_spaces_adapter   # noqa: E402
from r11_adapters import lb_cathedral_adapter, multi_cathedral_adapter     # noqa: E402

BANK_PATH = SCRIPT_DIR / "R11v2_QUESTION_BANK_SEALED_K528.json"
CORPUS_PATH = SCRIPT_DIR / "r11v2_canonical_corpus_100k.md"

# Per-condition $100 pause threshold (K528 authorization)
PER_CONDITION_PAUSE_USD = 100.00
# No hard budget cap per Founder direction
BUDGET_NO_CAP = 9_999_999.00

# Conductor's Baton routing table: category → preferred model for Cathedral conditions
# Mirrors K525-LAUNCH routing logic: cheapest model meeting quality threshold per category
CONDUCTOR_ROUTING: dict[str, str] = {
    "canonical_statistics":   "claude-haiku-4-5-20251001",   # pure factual recall
    "architecture_mechanics": "claude-haiku-4-5-20251001",   # factual + structural
    "economic_governance":    "claude-sonnet-4-6",            # analytical nuance needed
    "member_journey":         "claude-haiku-4-5-20251001",   # factual + procedural
    "regulatory_compliance":  "claude-sonnet-4-6",            # compliance analysis
    "historical_precedent":   "claude-haiku-4-5-20251001",   # factual recall
}

CONDITIONS_PHASE_B: list[dict] = [
    # Cold baselines — no corpus, no retrieval
    {"id": "cold_haiku",            "phase": "B", "vendor": "anthropic", "model": "claude-haiku-4-5-20251001", "adapter": "claude_projects", "mode": "cold"},
    {"id": "cold_gpt4o_mini",       "phase": "B", "vendor": "openai",    "model": "gpt-4o-mini",               "adapter": "chatgpt_memory",  "mode": "cold"},
    {"id": "cold_gemini_flash",     "phase": "B", "vendor": "google",    "model": "gemini-2.5-flash",           "adapter": "gemini_gems",     "mode": "cold"},
    {"id": "cold_sonnet",           "phase": "B", "vendor": "anthropic", "model": "claude-sonnet-4-6",          "adapter": "claude_projects", "mode": "cold"},
    # Vendor memory products (corpus in system prompt / reference doc)
    # GPT-4o: 106K corpus tokens → at 30K TPM requires 3.5 min/query minimum.
    # inter_query_sleep_s=220 avoids most 429s; adapter's parsed retry-after handles remainder.
    # 200q × 220s ≈ 12.2h per condition. Authorized: Founder K528 no-cap directive.
    {"id": "chatgpt_memory",        "phase": "B", "vendor": "openai",    "model": "gpt-4o",     "adapter": "chatgpt_memory",  "mode": "memory",  "inter_query_sleep_s": 220.0},
    {"id": "chatgpt_memory_gpt5",   "phase": "B", "vendor": "openai",    "model": "gpt-4.1",    "adapter": "chatgpt_memory",  "mode": "memory",  "inter_query_sleep_s": 220.0,
     "model_note": "gpt-4.1 proxy; run with model=gpt-5 if API access confirmed"},
    {"id": "claude_projects_sonnet","phase": "B", "vendor": "anthropic", "model": "claude-sonnet-4-6", "adapter": "claude_projects", "mode": "project"},
    {"id": "claude_projects_opus",  "phase": "B", "vendor": "anthropic", "model": "claude-opus-4-7",   "adapter": "claude_projects", "mode": "project"},
    {"id": "gemini_gems",           "phase": "B", "vendor": "google",    "model": "gemini-2.5-pro",    "adapter": "gemini_gems",     "mode": "gem"},
    {"id": "perplexity_spaces",     "phase": "B", "vendor": "perplexity","model": "sonar-pro",         "adapter": "perplexity_spaces","mode": "space"},
]

CONDITIONS_PHASE_C: list[dict] = [
    # LB Cathedral: Cathedral retrieval → Anthropic models
    {"id": "lb_cathedral_haiku",          "phase": "C", "vendor": "anthropic", "model": "claude-haiku-4-5-20251001", "adapter": "lb_cathedral",        "mode": "lb_cathedral"},
    {"id": "lb_cathedral_sonnet",         "phase": "C", "vendor": "anthropic", "model": "claude-sonnet-4-6",          "adapter": "lb_cathedral",        "mode": "lb_cathedral"},
    {"id": "lb_cathedral_opus",           "phase": "C", "vendor": "anthropic", "model": "claude-opus-4-7",            "adapter": "lb_cathedral",        "mode": "lb_cathedral"},
    # LB Cathedral: Cathedral retrieval → cross-vendor models
    {"id": "lb_cathedral_gpt4o_mini",     "phase": "C", "vendor": "openai",    "model": "gpt-4o-mini",               "adapter": "multi_cathedral",     "mode": "lb_cathedral", "cathedral": "bishop"},
    {"id": "lb_cathedral_gemini_flash",   "phase": "C", "vendor": "google",    "model": "gemini-2.5-flash",           "adapter": "multi_cathedral",     "mode": "lb_cathedral", "cathedral": "bishop"},
    # Conductor's Baton auto-routing (production path)
    {"id": "lb_cathedral_conductor_auto", "phase": "C", "vendor": "anthropic", "model": "conductor_auto",             "adapter": "lb_cathedral_conductor", "mode": "lb_cathedral"},
]

ALL_CONDITIONS = CONDITIONS_PHASE_B + CONDITIONS_PHASE_C


def grade_response(response_text: str, required_elements: list[str]) -> str:
    """R10 three-tier substring rubric. HOT=all, HIT>=ceil(n/2), MISS=rest."""
    if not required_elements:
        return "ungraded"
    text_lower = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in text_lower)
    n = len(required_elements)
    if hits == n:
        return "HOT"
    if hits >= max(1, (n + 1) // 2):
        return "HIT"
    return "MISS"


def _vendor_key_present(vendor: str) -> bool:
    if vendor == "anthropic":
        return bool(os.environ.get("ANTHROPIC_API_KEY"))
    if vendor == "openai":
        return bool(os.environ.get("OPENAI_API_KEY"))
    if vendor == "google":
        return bool(os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if vendor == "perplexity":
        return bool(os.environ.get("PERPLEXITY_API_KEY"))
    return False


def run_condition(
    condition: dict,
    questions: list[dict],
    corpus_text: str,
    out_dir: Path,
    vendor_spend: dict[str, float],
    consult_client: lb_cathedral_adapter.ConsultClient | None,
    multi_consult_client: multi_cathedral_adapter.MultiCathedralConsultClient | None,
    force: bool = False,
) -> tuple[list[dict], bool]:
    """Run all questions for one condition. Returns (records, paused)."""
    cid = condition["id"]
    model = condition["model"]
    adapter_name = condition["adapter"]
    mode = condition["mode"]
    inter_query_sleep: float = condition.get("inter_query_sleep_s", 0.20)
    per_file = out_dir / f"{cid}.jsonl"

    # Checkpoint: skip if already done
    if per_file.exists() and not force:
        existing = [json.loads(l) for l in per_file.read_text(encoding="utf-8").splitlines() if l.strip()]
        completed = [r for r in existing if "error" not in r]
        if len(completed) >= len(questions):
            print(f"  [{cid}] CHECKPOINT: {len(completed)} records found — skipping (use --force to re-run)")
            return completed, False
        print(f"  [{cid}] CHECKPOINT: partial ({len(completed)}/{len(questions)}) — resuming")
        completed_ids = {r["qid"] for r in completed}
        questions = [q for q in questions if q["id"] not in completed_ids]
        condition_cost = sum(r.get("cost_usd", 0) for r in completed)
        vendor_spend[condition["vendor"]] += condition_cost
        records = completed
        out_f = per_file.open("a", encoding="utf-8")
    else:
        records = []
        completed_ids = set()
        out_f = per_file.open("w", encoding="utf-8")

    paused = False
    condition_cost = sum(r.get("cost_usd", 0) for r in records)

    with out_f:
        for q in questions:
            qid = q["id"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])
            scribe_ids: list[str] = []
            category = q.get("category", "unknown")

            try:
                if adapter_name == "chatgpt_memory":
                    resp = chatgpt_memory_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "claude_projects":
                    resp = claude_projects_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "gemini_gems":
                    resp = gemini_gems_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "perplexity_spaces":
                    resp = perplexity_spaces_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "lb_cathedral":
                    resp, scribe_ids = lb_cathedral_adapter.answer(
                        question_text, corpus_text,
                        model=model, mode="lb_cathedral",
                        consult_client=consult_client,
                    )
                elif adapter_name == "lb_cathedral_conductor":
                    # Conductor's Baton: route per-query based on category
                    routed_model = CONDUCTOR_ROUTING.get(category, "claude-haiku-4-5-20251001")
                    resp, scribe_ids = lb_cathedral_adapter.answer(
                        question_text, corpus_text,
                        model=routed_model, mode="lb_cathedral",
                        consult_client=consult_client,
                    )
                    scribe_ids = [f"conductor:{routed_model}"] + scribe_ids
                elif adapter_name == "multi_cathedral":
                    cathedral = condition.get("cathedral", "bishop")
                    resp, scribe_ids = multi_cathedral_adapter.answer(
                        question_text,
                        vendor=condition["vendor"],
                        model=model,
                        cathedral=cathedral,
                        consult_client=multi_consult_client,
                    )
                else:
                    raise ValueError(f"Unknown adapter: {adapter_name}")

                grade = grade_response(resp.text, required)
                condition_cost += resp.cost_usd
                vendor_spend[condition["vendor"]] += resp.cost_usd

                actual_model = model
                if adapter_name == "lb_cathedral_conductor":
                    actual_model = CONDUCTOR_ROUTING.get(category, "claude-haiku-4-5-20251001")

                record = {
                    "qid": qid,
                    "condition": cid,
                    "phase": condition["phase"],
                    "vendor": condition["vendor"],
                    "model": actual_model if adapter_name == "lb_cathedral_conductor" else model,
                    "adapter": adapter_name,
                    "mode": mode,
                    "category": category,
                    "source_fact_id": q.get("source_fact_id", ""),
                    "question": question_text,
                    "required_elements": required,
                    "response_text": resp.text,
                    "grade": grade,
                    "cost_usd": resp.cost_usd,
                    "latency_s": resp.latency_s,
                    "input_tokens": resp.input_tokens,
                    "output_tokens": resp.output_tokens,
                    "scribes_consulted": scribe_ids,
                    "ts": datetime.now(timezone.utc).isoformat(),
                }
                if "model_note" in condition:
                    record["model_note"] = condition["model_note"]
                if adapter_name == "lb_cathedral_conductor":
                    record["conductor_routed_model"] = actual_model

                out_f.write(json.dumps(record) + "\n")
                out_f.flush()
                records.append(record)

                scribes_tag = (",".join(str(s) for s in scribe_ids[:3]) or "-") if scribe_ids else ""
                total_vendor = vendor_spend[condition["vendor"]]
                print(
                    f"  [{cid:<32}] {qid:<14} {grade:<5} "
                    f"${resp.cost_usd:.5f} (cond:${condition_cost:.3f} vend:${total_vendor:.3f}) {scribes_tag}"
                )

                # K528: pause-and-report if per-condition spend exceeds $100
                if condition_cost >= PER_CONDITION_PAUSE_USD:
                    print(f"\n!! K528 PAUSE: {cid} hit ${condition_cost:.2f} condition spend.")
                    print(f"   Founder authorization needed to continue. Remaining questions: {len(questions) - questions.index(q) - 1}")
                    print(f"   Data checkpoint saved to {per_file}")
                    paused = True
                    break

            except Exception as e:
                err_record = {
                    "qid": qid, "condition": cid, "model": model,
                    "error": str(e), "ts": datetime.now(timezone.utc).isoformat(),
                }
                out_f.write(json.dumps(err_record) + "\n")
                out_f.flush()
                print(f"  [{cid:<32}] {qid:<14} ERROR: {e}")

            time.sleep(inter_query_sleep)

    return records, paused


def _aggregate(all_records: list[dict], vendor_spend: dict[str, float]) -> dict:
    from collections import Counter

    graded = [r for r in all_records if "grade" in r and "error" not in r]
    per_condition: dict[str, dict] = {}
    for r in graded:
        cid = r["condition"]
        if cid not in per_condition:
            per_condition[cid] = {
                "condition": cid, "phase": r.get("phase", "?"),
                "vendor": r["vendor"], "model": r["model"], "adapter": r["adapter"],
                "grades": [], "costs": [], "latencies": [], "categories": defaultdict(list),
            }
        per_condition[cid]["grades"].append(r["grade"])
        per_condition[cid]["costs"].append(r["cost_usd"])
        per_condition[cid]["latencies"].append(r["latency_s"])
        per_condition[cid]["categories"][r["category"]].append(r["grade"])

    summary_conditions = []
    for cid, data in per_condition.items():
        grades = data["grades"]
        n = len(grades)
        c = Counter(grades)
        hot_pct = c["HOT"] / n * 100 if n else 0
        hit_pct = c["HIT"] / n * 100 if n else 0
        total_cost = sum(data["costs"])
        cost_per_hot = total_cost / max(c["HOT"], 1)
        avg_latency = sum(data["latencies"]) / len(data["latencies"]) if data["latencies"] else 0

        cat_breakdown = {}
        for cat, cat_grades in data["categories"].items():
            cg = Counter(cat_grades)
            cn = len(cat_grades)
            cat_breakdown[cat] = {
                "n": cn, "HOT": cg["HOT"], "HIT": cg["HIT"], "MISS": cg["MISS"],
                "hot_pct": round(cg["HOT"] / cn * 100, 1) if cn else 0,
            }

        summary_conditions.append({
            "condition": cid, "phase": data["phase"],
            "vendor": data["vendor"], "model": data["model"],
            "n": n, "HOT": c["HOT"], "HIT": c["HIT"], "MISS": c["MISS"],
            "hot_pct": round(hot_pct, 3),
            "hit_pct": round(hit_pct, 3),
            "total_cost_usd": round(total_cost, 6),
            "cost_per_hot_usd": round(cost_per_hot, 6),
            "avg_latency_s": round(avg_latency, 3),
            "category_breakdown": cat_breakdown,
        })

    summary_conditions.sort(key=lambda x: x["cost_per_hot_usd"])

    return {
        "run_ts": datetime.now(timezone.utc).isoformat(),
        "bank": str(BANK_PATH.name),
        "corpus": str(CORPUS_PATH.name),
        "total_records": len(all_records),
        "total_graded": len(graded),
        "vendor_spend_usd": {k: round(v, 6) for k, v in vendor_spend.items()},
        "total_spend_usd": round(sum(vendor_spend.values()), 6),
        "conditions": summary_conditions,
    }


def run(
    out_dir: Path,
    selected_conditions: list[dict],
    force: bool = False,
) -> dict:
    if not BANK_PATH.exists():
        raise FileNotFoundError(f"Question bank not found: {BANK_PATH}")
    if not CORPUS_PATH.exists():
        raise FileNotFoundError(f"Corpus not found: {CORPUS_PATH}")

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]
    corpus_text = CORPUS_PATH.read_text(encoding="utf-8")

    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"R11-v2 Runner K528 starting.")
    print(f"  Bank:       {BANK_PATH.name}  ({len(questions)} questions)")
    print(f"  Corpus:     {CORPUS_PATH.name}  ({len(corpus_text.split()):,} words)")
    print(f"  Conditions: {len(selected_conditions)}")
    print(f"  Output:     {out_dir}")
    print(f"  No-cap mode: per-condition ${PER_CONDITION_PAUSE_USD:.0f} pause threshold")
    print()

    vendor_spend: dict[str, float] = defaultdict(float)
    all_records: list[dict] = []

    # Start Cathedral consult clients once (reused across conditions)
    consult_client: lb_cathedral_adapter.ConsultClient | None = None
    multi_consult: multi_cathedral_adapter.MultiCathedralConsultClient | None = None

    need_lb = any(c["adapter"] in ("lb_cathedral", "lb_cathedral_conductor") for c in selected_conditions)
    need_multi = any(c["adapter"] == "multi_cathedral" for c in selected_conditions)

    if need_lb and lb_cathedral_adapter.CONSULT_CLI_PATH.exists():
        try:
            consult_client = lb_cathedral_adapter.ConsultClient(lb_cathedral_adapter.CONSULT_CLI_PATH)
            print("  consult_scribes subprocess started OK (lb_cathedral).")
        except Exception as e:
            print(f"  WARNING: lb_cathedral consult subprocess failed: {e}")
    elif need_lb:
        print(f"  WARNING: {lb_cathedral_adapter.CONSULT_CLI_PATH} not found — lb_cathedral conditions will fail.")

    if need_multi and multi_cathedral_adapter.CONSULT_CLI_PATH.exists():
        try:
            multi_consult = multi_cathedral_adapter.MultiCathedralConsultClient(
                multi_cathedral_adapter.CONSULT_CLI_PATH
            )
            print("  consult_scribes subprocess started OK (multi_cathedral).")
        except Exception as e:
            print(f"  WARNING: multi_cathedral consult subprocess failed: {e}")
    elif need_multi:
        print(f"  WARNING: {multi_cathedral_adapter.CONSULT_CLI_PATH} not found — multi_cathedral conditions will fail.")

    print()

    try:
        any_paused = False
        for condition in selected_conditions:
            cid = condition["id"]
            vendor = condition["vendor"]

            if not _vendor_key_present(vendor):
                print(f"\n  SKIP {cid}: API key for '{vendor}' not set.")
                continue

            print(f"\n--- {cid} ({condition['model']}, mode={condition['mode']}, phase={condition['phase']}) ---")
            records, paused = run_condition(
                condition, questions, corpus_text, out_dir,
                vendor_spend, consult_client, multi_consult, force=force,
            )
            all_records.extend(records)

            if paused:
                any_paused = True
                print(f"\n  PAUSED at {cid}. Partial data saved. Resume from checkpoint after Founder authorization.")

    finally:
        if consult_client:
            consult_client.close()
        if multi_consult:
            multi_consult.close()

    # Write consolidated outputs
    all_jsonl = out_dir / "all_graded.jsonl"
    with all_jsonl.open("w", encoding="utf-8") as f:
        for r in all_records:
            f.write(json.dumps(r) + "\n")

    summary = _aggregate(all_records, vendor_spend)
    summary_path = out_dir / "results_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\n=== R11-v2 K528 RUN COMPLETE ===")
    print(f"Records:   {len(all_records)}")
    total_spend = sum(vendor_spend.values())
    print(f"Total spend: ${total_spend:.4f}")
    for vend, amt in sorted(vendor_spend.items()):
        print(f"  {vend:12s}: ${amt:.4f}")
    print(f"Output:    {out_dir}")
    if summary.get("conditions"):
        print(f"\nTop-5 conditions by $/HOT:")
        for s in summary["conditions"][:5]:
            print(f"  {s['condition']:<32} HOT={s['hot_pct']:.1f}%  $/HOT=${s['cost_per_hot_usd']:.4f}  n={s['n']}")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="R11-v2 K528 Benchmark Runner")
    parser.add_argument("--phase", choices=["B", "C", "ALL"], default="ALL",
                        help="Which phase to run (B=vendor-native, C=Cathedral configs, ALL=both)")
    parser.add_argument("--conditions", nargs="+", default=None,
                        help="Run only specific condition IDs (space-separated)")
    parser.add_argument("--out", default="results_r11v2_K528",
                        help="Output directory name")
    parser.add_argument("--force", action="store_true",
                        help="Re-run conditions even if checkpoint files exist")
    parser.add_argument("--list", action="store_true",
                        help="List all conditions and exit")
    args = parser.parse_args()

    if args.list:
        print("Phase B conditions:")
        for c in CONDITIONS_PHASE_B:
            print(f"  {c['id']:<32} {c['model']}")
        print("Phase C conditions:")
        for c in CONDITIONS_PHASE_C:
            print(f"  {c['id']:<32} {c['model']}")
        return

    # Select conditions
    if args.conditions:
        id_set = set(args.conditions)
        selected = [c for c in ALL_CONDITIONS if c["id"] in id_set]
        missing = id_set - {c["id"] for c in selected}
        if missing:
            print(f"WARNING: unknown condition IDs: {missing}")
    elif args.phase == "B":
        selected = CONDITIONS_PHASE_B
    elif args.phase == "C":
        selected = CONDITIONS_PHASE_C
    else:
        selected = ALL_CONDITIONS

    out_dir = SCRIPT_DIR / args.out
    run(out_dir, selected, force=args.force)


if __name__ == "__main__":
    main()
