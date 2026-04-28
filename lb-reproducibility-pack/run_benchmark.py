#!/usr/bin/env python3
"""
lb-reproducibility-pack — Benchmark Runner
===========================================
Single entry point for all three dataset tiers. Wraps the K528 harness logic with a
clean --tier / --corpus / --questions / --conditions / --out interface.

Usage (quick start):
    python run_benchmark.py --tier smoke --out results/smoke/

Usage (full replication):
    python run_benchmark.py --tier full --conditions cold_haiku claude_projects_sonnet --out results/full/

Usage (substitute your own corpus — sovereignty contract: your data stays local):
    python run_benchmark.py --tier reasonable \\
        --corpus /path/to/mycompany_docs.md \\
        --questions /path/to/mycompany_questions.json \\
        --out results/mycompany/

Sovereignty contract:
    - Your substitute corpus stays on YOUR machine. No upload. No telemetry.
    - AI vendor API calls go to Anthropic/OpenAI/Google/Perplexity using YOUR API keys.
    - LB infrastructure is NOT in the loop for any benchmark calls.
    - Results are written to your local --out directory only.
    - See SUBSTITUTION_GUIDE.md for full sovereignty documentation.

Conditions:
    Phase B (vendor-native):
        cold_haiku, cold_gpt4o_mini, cold_gemini_flash, cold_sonnet
        claude_projects_sonnet, claude_projects_opus
        gemini_gems, perplexity_spaces
        chatgpt_memory, chatgpt_memory_gpt5   [require high API tier; may 429]

    Phase C (local Cathedral):
        lb_cathedral_haiku, lb_cathedral_sonnet
        lb_cathedral_gpt4o_mini, lb_cathedral_gemini_flash
        lb_cathedral_conductor_auto

API keys: set via .env in this directory (copy .env.example → .env and fill in).
Self-loads from .env at startup. No LB server keys required.

Publication gate: pack ships internal-only until Prov 14 + Founder publish trigger.
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


PACK_ROOT = Path(__file__).resolve().parent
DATASETS_DIR = PACK_ROOT / "datasets"

TIER_DEFAULTS = {
    "smoke": {
        "corpus": DATASETS_DIR / "smoke" / "corpus_smoke.md",
        "questions": DATASETS_DIR / "smoke" / "questions_smoke.json",
        "expected": DATASETS_DIR / "smoke" / "expected_results_smoke.json",
        "description": "10 facts · 20 questions · ~$0.50-1.00 · ~5 min",
    },
    "reasonable": {
        "corpus": DATASETS_DIR / "reasonable" / "corpus_reasonable.md",
        "questions": DATASETS_DIR / "reasonable" / "questions_reasonable.json",
        "expected": DATASETS_DIR / "reasonable" / "expected_results_reasonable.json",
        "description": "75 facts · 100 questions · ~$10-30 · ~30-60 min",
    },
    "full": {
        "corpus": DATASETS_DIR / "full_k528" / "corpus_full_k528.md",
        "questions": DATASETS_DIR / "full_k528" / "questions_full_k528.json",
        "expected": None,
        "description": "150 facts · 200 questions · ~$200-300 · ~4-8 hr",
    },
}

# Default 3-condition smoke run
DEFAULT_SMOKE_CONDITIONS = ["cold_haiku", "claude_projects_sonnet", "lb_cathedral_haiku"]
DEFAULT_REASONABLE_CONDITIONS = ["cold_haiku", "cold_gpt4o_mini", "claude_projects_sonnet", "lb_cathedral_haiku", "lb_cathedral_gpt4o_mini"]
DEFAULT_FULL_CONDITIONS = "ALL"


# ---------------------------------------------------------------------------
# .env self-loader
# ---------------------------------------------------------------------------
def _load_dotenv() -> None:
    env_file = PACK_ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key, val = key.strip(), val.strip().strip('"').strip("'")
        if key and val and not os.environ.get(key):
            os.environ[key] = val


_load_dotenv()

sys.path.insert(0, str(PACK_ROOT))
from adapters import (  # noqa: E402
    chatgpt_memory_adapter,
    claude_projects_adapter,
    gemini_gems_adapter,
    perplexity_spaces_adapter,
    local_cathedral_adapter,
)


# ---------------------------------------------------------------------------
# Condition registry
# ---------------------------------------------------------------------------
CONDITIONS_PHASE_B: list[dict] = [
    {"id": "cold_haiku",             "phase": "B", "vendor": "anthropic", "model": "claude-haiku-4-5-20251001", "adapter": "claude_projects", "mode": "cold"},
    {"id": "cold_gpt4o_mini",        "phase": "B", "vendor": "openai",    "model": "gpt-4o-mini",               "adapter": "chatgpt_memory",  "mode": "cold"},
    {"id": "cold_gemini_flash",      "phase": "B", "vendor": "google",    "model": "gemini-2.5-flash",           "adapter": "gemini_gems",     "mode": "cold"},
    {"id": "cold_sonnet",            "phase": "B", "vendor": "anthropic", "model": "claude-sonnet-4-6",          "adapter": "claude_projects", "mode": "cold"},
    {"id": "claude_projects_sonnet", "phase": "B", "vendor": "anthropic", "model": "claude-sonnet-4-6",          "adapter": "claude_projects", "mode": "project"},
    {"id": "claude_projects_opus",   "phase": "B", "vendor": "anthropic", "model": "claude-opus-4-7",            "adapter": "claude_projects", "mode": "project"},
    {"id": "gemini_gems",            "phase": "B", "vendor": "google",    "model": "gemini-2.5-pro",             "adapter": "gemini_gems",     "mode": "gem"},
    {"id": "perplexity_spaces",      "phase": "B", "vendor": "perplexity","model": "sonar-pro",                  "adapter": "perplexity_spaces","mode": "space"},
    {"id": "chatgpt_memory",         "phase": "B", "vendor": "openai",    "model": "gpt-4o",                     "adapter": "chatgpt_memory",  "mode": "memory",  "inter_query_sleep_s": 220.0,
     "note": "Requires high OpenAI tier; 106K corpus tokens hit TPM ceiling at standard tiers"},
    {"id": "chatgpt_memory_gpt5",    "phase": "B", "vendor": "openai",    "model": "gpt-4.1",                    "adapter": "chatgpt_memory",  "mode": "memory",  "inter_query_sleep_s": 220.0,
     "note": "gpt-4.1 proxy; swap model=gpt-5 if API access confirmed"},
]

CONDUCTOR_ROUTING: dict[str, str] = {
    "canonical_statistics":   "claude-haiku-4-5-20251001",
    "architecture_mechanics": "claude-haiku-4-5-20251001",
    "economic_governance":    "claude-sonnet-4-6",
    "member_journey":         "claude-haiku-4-5-20251001",
    "regulatory_compliance":  "claude-sonnet-4-6",
    "historical_precedent":   "claude-haiku-4-5-20251001",
}

CONDITIONS_PHASE_C: list[dict] = [
    {"id": "lb_cathedral_haiku",          "phase": "C", "vendor": "anthropic", "model": "claude-haiku-4-5-20251001", "adapter": "lb_cathedral",          "mode": "lb_cathedral"},
    {"id": "lb_cathedral_sonnet",         "phase": "C", "vendor": "anthropic", "model": "claude-sonnet-4-6",          "adapter": "lb_cathedral",          "mode": "lb_cathedral"},
    {"id": "lb_cathedral_gpt4o_mini",     "phase": "C", "vendor": "openai",    "model": "gpt-4o-mini",               "adapter": "lb_cathedral",          "mode": "lb_cathedral"},
    {"id": "lb_cathedral_gemini_flash",   "phase": "C", "vendor": "google",    "model": "gemini-2.5-flash",           "adapter": "lb_cathedral",          "mode": "lb_cathedral"},
    {"id": "lb_cathedral_conductor_auto", "phase": "C", "vendor": "anthropic", "model": "conductor_auto",             "adapter": "lb_cathedral_conductor", "mode": "lb_cathedral"},
]

ALL_CONDITIONS = CONDITIONS_PHASE_B + CONDITIONS_PHASE_C
CONDITION_MAP = {c["id"]: c for c in ALL_CONDITIONS}


def grade_response(response_text: str, required_elements: list[str]) -> str:
    """R10 three-tier HOT/HIT/MISS rubric."""
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
    return {
        "anthropic": bool(os.environ.get("ANTHROPIC_API_KEY")),
        "openai": bool(os.environ.get("OPENAI_API_KEY")),
        "google": bool(os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")),
        "perplexity": bool(os.environ.get("PERPLEXITY_API_KEY")),
    }.get(vendor, False)


def run_condition(
    condition: dict,
    questions: list[dict],
    corpus_text: str,
    out_dir: Path,
    vendor_spend: dict[str, float],
    cathedral_client: "local_cathedral_adapter.LocalCathedralClient | None",
    force: bool = False,
) -> list[dict]:
    """Run all questions for one condition. Returns records list."""
    cid = condition["id"]
    model = condition["model"]
    adapter_name = condition["adapter"]
    mode = condition["mode"]
    inter_query_sleep: float = condition.get("inter_query_sleep_s", 0.20)
    per_file = out_dir / f"{cid}.jsonl"

    # Checkpoint: skip if already complete
    if per_file.exists() and not force:
        existing = [json.loads(ln) for ln in per_file.read_text(encoding="utf-8").splitlines() if ln.strip()]
        completed = [r for r in existing if "error" not in r]
        if len(completed) >= len(questions):
            print(f"  [{cid}] CHECKPOINT — {len(completed)} records found, skipping (--force to re-run)")
            return completed
        print(f"  [{cid}] CHECKPOINT — partial ({len(completed)}/{len(questions)}), resuming")
        completed_ids = {r["qid"] for r in completed}
        questions = [q for q in questions if q["id"] not in completed_ids]
        records = completed
        out_f = per_file.open("a", encoding="utf-8")
    else:
        records = []
        out_f = per_file.open("w", encoding="utf-8")

    with out_f:
        for q in questions:
            qid = q["id"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])
            category = q.get("category", "unknown")
            scribe_context = ""

            try:
                if adapter_name == "chatgpt_memory":
                    resp = chatgpt_memory_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "claude_projects":
                    resp = claude_projects_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "gemini_gems":
                    resp = gemini_gems_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name == "perplexity_spaces":
                    resp = perplexity_spaces_adapter.answer(question_text, corpus_text, model=model, mode=mode)
                elif adapter_name in ("lb_cathedral", "lb_cathedral_conductor"):
                    if adapter_name == "lb_cathedral_conductor":
                        model = CONDUCTOR_ROUTING.get(category, "claude-haiku-4-5-20251001")
                    resp, scribe_context = local_cathedral_adapter.answer(
                        question_text, corpus_text, model=model, client=cathedral_client
                    )
                else:
                    raise ValueError(f"Unknown adapter: {adapter_name}")

                grade = grade_response(resp.text, required)
                cost = resp.cost_usd
                vendor_spend[condition["vendor"]] = vendor_spend.get(condition["vendor"], 0.0) + cost

                record = {
                    "qid": qid,
                    "condition": cid,
                    "phase": condition["phase"],
                    "vendor": condition["vendor"],
                    "model": model,
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
                    "scribe_context_chars": len(scribe_context),
                    "ts": datetime.now(timezone.utc).isoformat(),
                }

                out_f.write(json.dumps(record) + "\n")
                out_f.flush()
                records.append(record)

                print(
                    f"  [{cid:<32}] {qid:<16} {grade:<5} "
                    f"${cost:.5f} (cond:${sum(r.get('cost_usd',0) for r in records):.3f})"
                )

            except KeyboardInterrupt:
                print(f"\n  [{cid}] Interrupted. Checkpoint saved to {per_file}")
                break
            except Exception as exc:  # noqa: BLE001
                print(f"  [{cid}] ERROR on {qid}: {exc}")
                error_record = {"qid": qid, "condition": cid, "error": str(exc), "ts": datetime.now(timezone.utc).isoformat()}
                out_f.write(json.dumps(error_record) + "\n")
                out_f.flush()

            time.sleep(inter_query_sleep)

    return records


def write_summary(all_records: list[dict], out_dir: Path, tier: str, corpus_path: Path) -> None:
    """Write results_summary.json after all conditions complete."""
    by_condition: dict[str, list[dict]] = defaultdict(list)
    for r in all_records:
        if "error" not in r:
            by_condition[r["condition"]].append(r)

    summary = {
        "tier": tier,
        "corpus_path": str(corpus_path),
        "ts": datetime.now(timezone.utc).isoformat(),
        "conditions": {},
    }

    total_cost = 0.0
    for cid, records in by_condition.items():
        n = len(records)
        hot = sum(1 for r in records if r.get("grade") == "HOT")
        hit = sum(1 for r in records if r.get("grade") == "HIT")
        miss = sum(1 for r in records if r.get("grade") == "MISS")
        cost = sum(r.get("cost_usd", 0.0) for r in records)
        total_cost += cost
        hot_pct = (hot / n * 100) if n else 0
        summary["conditions"][cid] = {
            "n": n, "hot": hot, "hit": hit, "miss": miss,
            "hot_pct": round(hot_pct, 1),
            "cost_usd": round(cost, 4),
            "dollar_per_hot": round(cost / hot, 4) if hot else None,
        }

    summary["total_cost_usd"] = round(total_cost, 4)

    out_path = out_dir / "results_summary.json"
    out_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\n=== Results Summary ===")
    for cid, s in summary["conditions"].items():
        print(f"  {cid:<34} HOT={s['hot_pct']:5.1f}%  cost=${s['cost_usd']:.4f}  $/HOT={s['dollar_per_hot'] or 'N/A'}")
    print(f"  Total spend: ${total_cost:.4f}")
    print(f"  Written to: {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="lb-reproducibility-pack benchmark runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 5-minute smoke test (~$0.50):
  python run_benchmark.py --tier smoke --out results/smoke/

  # Reasonable replication (~$10-30):
  python run_benchmark.py --tier reasonable --out results/reasonable/

  # Substitute your own corpus (your data stays local):
  python run_benchmark.py --tier reasonable \\
      --corpus mycompany_docs.md --questions mycompany_questions.json \\
      --out results/mycompany/

  # Full K528 replication (~$200-300, 4-8 hr):
  python run_benchmark.py --tier full --out results/full/

  # Custom conditions:
  python run_benchmark.py --tier smoke --conditions cold_haiku lb_cathedral_haiku --out results/custom/

Sovereignty: your corpus and results NEVER leave your machine. Only AI vendor API
calls (Anthropic/OpenAI/Google/Perplexity) go out — using YOUR keys.
""",
    )
    parser.add_argument("--tier", choices=["smoke", "reasonable", "full"], default="smoke",
                        help="Dataset tier (default: smoke)")
    parser.add_argument("--conditions", nargs="*",
                        help="Specific conditions to run (default: tier-appropriate set)")
    parser.add_argument("--corpus", type=Path,
                        help="Path to corpus file (default: tier default corpus)")
    parser.add_argument("--questions", type=Path,
                        help="Path to question bank JSON (default: tier default questions)")
    parser.add_argument("--out", type=Path, required=True,
                        help="Output directory for results")
    parser.add_argument("--force", action="store_true",
                        help="Re-run even if checkpoint exists")
    parser.add_argument("--list-conditions", action="store_true",
                        help="List all available conditions and exit")
    args = parser.parse_args()

    if args.list_conditions:
        print("Available conditions:")
        for c in ALL_CONDITIONS:
            key_ok = "✓" if _vendor_key_present(c["vendor"]) else "✗ (key missing)"
            note = c.get("note", "")
            print(f"  {c['id']:<34} vendor={c['vendor']:<12} {key_ok}  {note}")
        return

    tier_cfg = TIER_DEFAULTS[args.tier]
    corpus_path = args.corpus or tier_cfg["corpus"]
    questions_path = args.questions or tier_cfg["questions"]

    # Validate
    if not corpus_path.exists():
        print(f"ERROR: corpus not found: {corpus_path}")
        if args.tier == "reasonable" and not args.corpus:
            print("  Run `python setup_datasets.py` first to generate the reasonable tier corpus.")
        sys.exit(1)
    if not questions_path.exists():
        print(f"ERROR: questions not found: {questions_path}")
        if args.tier == "reasonable" and not args.questions:
            print("  Run `python setup_datasets.py` first to generate the reasonable tier question bank.")
        sys.exit(1)

    # Load corpus and questions
    corpus_text = corpus_path.read_text(encoding="utf-8")
    bank = json.loads(questions_path.read_text(encoding="utf-8"))
    questions = bank["questions"]

    print(f"\n=== lb-reproducibility-pack benchmark runner ===")
    print(f"  Tier:      {args.tier} — {tier_cfg['description']}")
    print(f"  Corpus:    {corpus_path} ({len(corpus_text):,} chars)")
    print(f"  Questions: {questions_path} ({len(questions)} questions)")

    # Sovereignty notice if substituting corpus
    if args.corpus or args.questions:
        print(f"\n  SOVEREIGNTY NOTICE: You are using a substitute corpus/questions.")
        print(f"  Your data stays on this machine. No upload. No telemetry.")
        print(f"  API calls go to AI vendors using your keys in .env")

    # Resolve conditions
    if args.conditions:
        selected_conditions = []
        for cid in args.conditions:
            if cid not in CONDITION_MAP:
                print(f"  WARNING: unknown condition '{cid}' — skipping. Use --list-conditions to see valid IDs.")
            else:
                selected_conditions.append(CONDITION_MAP[cid])
    elif args.tier == "smoke":
        selected_conditions = [CONDITION_MAP[c] for c in DEFAULT_SMOKE_CONDITIONS]
    elif args.tier == "reasonable":
        selected_conditions = [CONDITION_MAP[c] for c in DEFAULT_REASONABLE_CONDITIONS]
    else:
        selected_conditions = ALL_CONDITIONS

    # Filter to conditions with API keys
    runnable = []
    skipped = []
    for c in selected_conditions:
        if _vendor_key_present(c["vendor"]):
            runnable.append(c)
        else:
            skipped.append(c["id"])

    if skipped:
        print(f"\n  Skipping (no API key): {', '.join(skipped)}")
        print(f"  Add keys to .env — see .env.example")

    if not runnable:
        print("\nERROR: No runnable conditions (all API keys missing).")
        print("Copy .env.example → .env and fill in your API keys.")
        sys.exit(1)

    print(f"\n  Running {len(runnable)} conditions: {', '.join(c['id'] for c in runnable)}")

    # Create output directory
    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    # Initialize Cathedral client (shared across lb_cathedral conditions)
    cathedral_conditions = [c for c in runnable if c["adapter"] in ("lb_cathedral", "lb_cathedral_conductor")]
    cathedral_client = None
    if cathedral_conditions:
        print(f"\n  Initializing local Cathedral client with corpus ({len(corpus_text):,} chars)...")
        cathedral_client = local_cathedral_adapter.LocalCathedralClient(corpus_text)
        print(f"  Local Cathedral ready — {cathedral_client.index_size} indexed segments.")

    # Run
    vendor_spend: dict[str, float] = defaultdict(float)
    all_records: list[dict] = []

    for condition in runnable:
        print(f"\n--- {condition['id']} ({condition['model']}) ---")
        records = run_condition(
            condition=condition,
            questions=questions,
            corpus_text=corpus_text,
            out_dir=out_dir,
            vendor_spend=vendor_spend,
            cathedral_client=cathedral_client,
            force=args.force,
        )
        all_records.extend(records)

    write_summary(all_records, out_dir, args.tier, corpus_path)


if __name__ == "__main__":
    main()
