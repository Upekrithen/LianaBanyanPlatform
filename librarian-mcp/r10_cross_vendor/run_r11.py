#!/usr/bin/env python3
"""
R11 Cross-Vendor Memory Benchmark Runner
=========================================
13 conditions × 50 questions = 650 primary calls.
Hard budget cap: $25.00 (non-negotiable per K444 dispatch).

Conditions:
  cold_haiku            - Claude Haiku 4.5, no corpus
  cold_gpt4o_mini       - GPT-4o-mini, no corpus
  cold_gemini_flash     - Gemini 2.5 Flash, no corpus
  chatgpt_memory        - GPT-4o + corpus-as-memory (30 entries)
  chatgpt_memory_gpt5   - GPT-5 (or gpt-4.1 proxy) + corpus-as-memory
  claude_projects_sonnet- claude-sonnet-4-6 + corpus-as-reference-doc
  claude_projects_opus  - Opus 4.7 + corpus-as-reference-doc
  gemini_gems           - Gemini 2.5 Pro + corpus-as-system-instruction
  perplexity_spaces     - Sonar-Pro + corpus-in-system-prompt
  lb_r9_only_haiku      - Haiku + r9v2_base preload only
  lb_r9_only_opus       - Opus + r9v2_base preload only
  lb_cathedral_haiku    - Haiku + preload + consult_scribes top-10
  lb_cathedral_opus     - Opus + preload + consult_scribes top-10

Usage:
  python run_r11.py --out results_r11_K444_v2 --budget 50.00

Env vars: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY (or GEMINI_API_KEY), PERPLEXITY_API_KEY
Loaded automatically from SDS.env at startup (background mode strips shell inheritance).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Explicit SDS.env loader — must run before any imports that use API keys.
# Background subprocess mode strips env inheritance; load from vault directly.
# ---------------------------------------------------------------------------
def _load_sds_env() -> None:
    """Parse SDS.env and set missing env vars without echoing values."""
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
        key = key.strip()
        val = val.strip()
        if key and val and not os.environ.get(key):
            os.environ[key] = val


_load_sds_env()

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from r11_adapters import chatgpt_memory_adapter, claude_projects_adapter  # noqa: E402
from r11_adapters import gemini_gems_adapter, perplexity_spaces_adapter   # noqa: E402
from r11_adapters import lb_cathedral_adapter                              # noqa: E402

BANK_PATH_K471 = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED_K471.json"
BANK_PATH_K444_LEGACY = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED_K444_LEGACY.json"
BANK_PATH = BANK_PATH_K471  # default; overridden by --legacy-k444 flag
CORPUS_PATH = SCRIPT_DIR / "r11_canonical_corpus.md"

BUDGET_HARD_CAP = 50.00
HALF_WARN_FRACTION = 0.50

CONDITIONS: list[dict] = [
    # Cold baselines — no corpus, no retrieval
    {"id": "cold_haiku",           "vendor": "anthropic", "model": "claude-haiku-4-5-20251001",  "adapter": "claude_projects", "mode": "cold"},
    {"id": "cold_gpt4o_mini",      "vendor": "openai",    "model": "gpt-4o-mini",                "adapter": "chatgpt_memory",  "mode": "cold"},
    {"id": "cold_gemini_flash",    "vendor": "google",    "model": "gemini-2.5-flash",            "adapter": "gemini_gems",     "mode": "cold"},
    # Vendor memory products
    # GPT-4o: ~22K tokens/query → 30K TPM limit → 1 query/min → 46s min inter-query sleep
    {"id": "chatgpt_memory",       "vendor": "openai",    "model": "gpt-4o",                     "adapter": "chatgpt_memory",  "mode": "memory",
     "inter_query_sleep_s": 46.0},
    {"id": "chatgpt_memory_gpt5",  "vendor": "openai",    "model": "gpt-4.1",                    "adapter": "chatgpt_memory",  "mode": "memory",
     "model_note": "gpt-4.1 used as proxy; try 'gpt-5' if API access confirmed",
     "inter_query_sleep_s": 46.0},
    {"id": "claude_projects_sonnet","vendor": "anthropic","model": "claude-sonnet-4-6",           "adapter": "claude_projects", "mode": "project"},
    {"id": "claude_projects_opus", "vendor": "anthropic", "model": "claude-opus-4-7",             "adapter": "claude_projects", "mode": "project"},
    {"id": "gemini_gems",          "vendor": "google",    "model": "gemini-2.5-pro",              "adapter": "gemini_gems",     "mode": "gem"},
    {"id": "perplexity_spaces",    "vendor": "perplexity","model": "sonar-pro",                   "adapter": "perplexity_spaces","mode": "space"},
    # LB substrate
    {"id": "lb_r9_only_haiku",     "vendor": "anthropic", "model": "claude-haiku-4-5-20251001",  "adapter": "lb_cathedral",    "mode": "lb_r9_only"},
    {"id": "lb_r9_only_opus",      "vendor": "anthropic", "model": "claude-opus-4-7",             "adapter": "lb_cathedral",    "mode": "lb_r9_only"},
    {"id": "lb_cathedral_haiku",   "vendor": "anthropic", "model": "claude-haiku-4-5-20251001",  "adapter": "lb_cathedral",    "mode": "lb_cathedral"},
    {"id": "lb_cathedral_opus",    "vendor": "anthropic", "model": "claude-opus-4-7",             "adapter": "lb_cathedral",    "mode": "lb_cathedral"},
]


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


def run_condition(
    condition: dict,
    questions: list[dict],
    corpus_text: str,
    out_dir: Path,
    total_cost: list[float],
    budget: float,
    consult_client: lb_cathedral_adapter.ConsultClient | None,
) -> tuple[list[dict], bool]:
    """Run all questions for one condition. Returns (records, halted)."""
    cid = condition["id"]
    model = condition["model"]
    adapter_name = condition["adapter"]
    mode = condition["mode"]
    # Per-condition minimum inter-query pacing (seconds). Used for high-TPM-cost
    # conditions like GPT-4o with the full 11.8K corpus in system prompt.
    inter_query_sleep: float = condition.get("inter_query_sleep_s", 0.20)

    per_file = out_dir / f"{cid}.jsonl"
    records: list[dict] = []
    halted = False

    with per_file.open("w", encoding="utf-8") as out:
        for q in questions:
            if total_cost[0] >= budget:
                print(f"\n!! BUDGET CAP ${budget:.2f} HIT — halting {cid} mid-run.")
                halted = True
                break
            if total_cost[0] >= budget * HALF_WARN_FRACTION and not getattr(run_condition, "_warned", False):
                print(f"\n** HALF-BUDGET WARNING: ${total_cost[0]:.2f} of ${budget:.2f} spent. Continuing.")
                run_condition._warned = True  # type: ignore[attr-defined]

            qid = q["id"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])
            scribe_ids: list[str] = []

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
                        model=model, mode=mode,
                        consult_client=consult_client if mode == "lb_cathedral" else None,
                    )
                else:
                    raise ValueError(f"Unknown adapter: {adapter_name}")

                grade = grade_response(resp.text, required)
                total_cost[0] += resp.cost_usd

                record = {
                    "qid": qid,
                    "condition": cid,
                    "vendor": condition["vendor"],
                    "model": model,
                    "adapter": adapter_name,
                    "mode": mode,
                    "category": q["category"],
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

                out.write(json.dumps(record) + "\n")
                records.append(record)

                scribes_tag = (",".join(scribe_ids[:3]) or "-") if scribe_ids else ""
                print(
                    f"  [{cid:<28}] {qid:<12} {grade:<5} "
                    f"${resp.cost_usd:.5f} (${total_cost[0]:.4f}) {scribes_tag}"
                )
            except Exception as e:
                err_record = {
                    "qid": qid, "condition": cid, "model": model,
                    "error": str(e), "ts": datetime.now(timezone.utc).isoformat(),
                }
                out.write(json.dumps(err_record) + "\n")
                print(f"  [{cid:<28}] {qid:<12} ERROR: {e}")

            time.sleep(inter_query_sleep)

    return records, halted


def run(out_dir: Path, budget: float) -> dict:
    if not BANK_PATH.exists():
        raise FileNotFoundError(f"Question bank not found: {BANK_PATH}")
    if not CORPUS_PATH.exists():
        raise FileNotFoundError(f"Corpus not found: {CORPUS_PATH}")

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]
    corpus_text = CORPUS_PATH.read_text(encoding="utf-8")

    out_dir.mkdir(parents=True, exist_ok=True)
    cost_log = out_dir / "cost_log.csv"
    cost_log.write_text("ts,condition,model,qid,grade,cost_usd,latency_s,running_total_usd\n", encoding="utf-8")

    print(f"R11 Runner starting.")
    print(f"  Bank:       {BANK_PATH.name}  ({len(questions)} questions)")
    print(f"  Corpus:     {CORPUS_PATH.name}")
    print(f"  Conditions: {len(CONDITIONS)}")
    print(f"  Budget:     ${budget:.2f}")
    print(f"  Output:     {out_dir}")
    print()

    total_cost: list[float] = [0.0]
    all_records: list[dict] = []
    global_halted = False

    consult_client: lb_cathedral_adapter.ConsultClient | None = None
    if lb_cathedral_adapter.CONSULT_CLI_PATH.exists():
        try:
            consult_client = lb_cathedral_adapter.ConsultClient(lb_cathedral_adapter.CONSULT_CLI_PATH)
            print("  consult_scribes subprocess started OK.")
        except Exception as e:
            print(f"  WARNING: consult_scribes failed to start: {e}. lb_cathedral conditions will error.")
    else:
        print(f"  WARNING: {lb_cathedral_adapter.CONSULT_CLI_PATH} not found — lb_cathedral conditions will fail.")

    try:
        for condition in CONDITIONS:
            if global_halted:
                break
            cid = condition["id"]

            # Check required env vars before attempting the condition
            vendor = condition["vendor"]
            if vendor == "anthropic" and not os.environ.get("ANTHROPIC_API_KEY"):
                print(f"\n  SKIP {cid}: ANTHROPIC_API_KEY not set in environment.")
                continue
            elif vendor == "openai" and not os.environ.get("OPENAI_API_KEY"):
                print(f"\n  SKIP {cid}: OPENAI_API_KEY not set in environment.")
                continue
            elif vendor == "google" and not (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")):
                print(f"\n  SKIP {cid}: neither GOOGLE_API_KEY nor GEMINI_API_KEY is set.")
                continue
            elif vendor == "perplexity" and not os.environ.get("PERPLEXITY_API_KEY"):
                print(f"\n  SKIP {cid}: PERPLEXITY_API_KEY not set in environment.")
                continue

            print(f"\n--- {cid} ({condition['model']}, mode={condition['mode']}) ---")
            records, halted = run_condition(
                condition, questions, corpus_text, out_dir,
                total_cost, budget, consult_client,
            )
            all_records.extend(records)

            # Append to cost log
            with cost_log.open("a", encoding="utf-8") as cl:
                for r in records:
                    if "error" not in r:
                        cl.write(
                            f"{r['ts']},{r['condition']},{r['model']},{r['qid']},"
                            f"{r['grade']},{r['cost_usd']:.6f},{r['latency_s']:.3f},"
                            f"{total_cost[0]:.6f}\n"
                        )

            if halted:
                global_halted = True
    finally:
        if consult_client:
            consult_client.close()

    all_jsonl = out_dir / "all_graded.jsonl"
    with all_jsonl.open("w", encoding="utf-8") as f:
        for r in all_records:
            f.write(json.dumps(r) + "\n")

    summary = _aggregate(all_records, total_cost[0], global_halted)
    summary_path = out_dir / "results_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\n=== R11 RUN COMPLETE ===")
    print(f"Total spend:    ${total_cost[0]:.4f}  (cap ${budget:.2f})")
    print(f"Records:        {len(all_records)}")
    print(f"Budget halted:  {global_halted}")
    print(f"Output:         {out_dir}")
    return summary


def _aggregate(records: list[dict], total_cost: float, halted: bool) -> dict:
    by_condition: dict[str, dict] = {}
    latencies: dict[str, list[float]] = {}
    cold_hots: dict[str, set[str]] = {}  # qid -> set of cold conditions that scored HOT

    cold_condition_ids = {"cold_haiku", "cold_gpt4o_mini", "cold_gemini_flash"}

    for r in records:
        if "error" in r or "grade" not in r:
            continue
        cid = r["condition"]
        qid = r["qid"]
        grade = r["grade"]

        if cid in cold_condition_ids and grade == "HOT":
            cold_hots.setdefault(qid, set()).add(cid)

        b = by_condition.setdefault(cid, {"n": 0, "HOT": 0, "HIT": 0, "MISS": 0, "cost_usd": 0.0, "retrieval_correct": 0})
        b["n"] += 1
        if grade in ("HOT", "HIT", "MISS"):
            b[grade] += 1
        b["cost_usd"] = round(b["cost_usd"] + r.get("cost_usd", 0.0), 6)
        latencies.setdefault(cid, []).append(r.get("latency_s", 0.0))

    # Second pass: compute retrieval_correct (HOT in this condition but MISS in all cold)
    for r in records:
        if "error" in r or "grade" not in r:
            continue
        if r["grade"] == "HOT":
            qid = r["qid"]
            cid = r["condition"]
            if cid not in cold_condition_ids:
                if qid not in cold_hots:
                    by_condition[cid]["retrieval_correct"] += 1

    for cid, b in by_condition.items():
        n = b["n"] or 1
        b["hot_pct"] = round(100.0 * b["HOT"] / n, 2)
        b["hit_pct"] = round(100.0 * b["HIT"] / n, 2)
        b["miss_pct"] = round(100.0 * b["MISS"] / n, 2)
        b["hot_or_hit_pct"] = round(100.0 * (b["HOT"] + b["HIT"]) / n, 2)
        b["retrieval_correct_pct"] = round(100.0 * b["retrieval_correct"] / max(1, b["HOT"]), 2)
        b["cost_per_q"] = round(b["cost_usd"] / n, 6)
        b["cost_per_correct"] = round(b["cost_usd"] / b["HOT"], 6) if b["HOT"] > 0 else None
        lats = sorted(latencies.get(cid, []))
        if lats:
            mid = len(lats) // 2
            b["p50_latency_s"] = round(lats[mid], 3)
            b["p95_latency_s"] = round(lats[max(0, int(0.95 * len(lats)) - 1)], 3)

    bank_meta = {}
    if BANK_PATH.exists():
        try:
            import json as _json
            _b = _json.loads(BANK_PATH.read_text(encoding="utf-8"))
            bank_meta = {"corpus_id": _b.get("corpus_id", "unknown"), "bank_version": _b.get("bank_version", "unknown")}
        except Exception:
            pass

    return {
        "session": bank_meta.get("corpus_id", "R11-CANONICAL-K471"),
        "corpus_id": bank_meta.get("corpus_id", "R11-CANONICAL-K471"),
        "bank_version": bank_meta.get("bank_version", "2.0.0-sealed"),
        "total_cost_usd": round(total_cost, 4),
        "total_records": len(records),
        "halted_on_budget": halted,
        "by_condition": by_condition,
    }


def main() -> None:
    p = argparse.ArgumentParser(description="R11 cross-vendor memory benchmark runner")
    p.add_argument("--out", default="results_r11_K471", help="Output directory (relative to script dir)")
    p.add_argument("--budget", type=float, default=BUDGET_HARD_CAP, help=f"Hard cost cap USD (default {BUDGET_HARD_CAP})")
    p.add_argument("--conditions", nargs="*", help="Run only these condition IDs (default: all)")
    p.add_argument("--legacy-k444", action="store_true", help="Use legacy K444 bank (R11-CANONICAL-K444) for historical comparison")
    args = p.parse_args()

    if args.legacy_k444:
        global BANK_PATH
        BANK_PATH = BANK_PATH_K444_LEGACY
        print(f"[run_r11] Using LEGACY K444 bank: {BANK_PATH.name}")
    else:
        print(f"[run_r11] Using K471 bank (default): {BANK_PATH.name}")

    if args.conditions:
        allowed = set(args.conditions)
        global CONDITIONS
        CONDITIONS = [c for c in CONDITIONS if c["id"] in allowed]
        if not CONDITIONS:
            print(f"ERROR: no conditions matched {args.conditions}", file=sys.stderr)
            sys.exit(1)

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("FATAL: ANTHROPIC_API_KEY not set. Load SDS.env upstream.", file=sys.stderr)
        sys.exit(2)

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = SCRIPT_DIR / out_dir

    run(out_dir, args.budget)


if __name__ == "__main__":
    main()
