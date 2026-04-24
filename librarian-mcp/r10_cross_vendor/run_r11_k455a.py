#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
R11 K455a Full Vendor Matrix + Multi-Cathedral Replication Benchmark
====================================================================
9 conditions x 50 questions = 450 calls.
Hard budget cap: $30.00 (expected ~$15-25 per K455a spec).

Cathedral Effect classification bands (pre-registered K455a):
  Strong  >= 20pp HOT lift over matched bare/control
  Weak     5–19pp
  Null     0–4pp (or no matched bare)
  Negative <0pp

BISHOP Cathedral conditions (5):
  anthropic_haiku_bishop   Haiku 4.5  + Bishop Cathedral (R11 corpus)
  anthropic_opus_bishop    Opus 4.7   + Bishop Cathedral
  perplexity_sonar_bishop  Sonar      + Bishop Cathedral (via consult_scribes)
  google_flash_bishop      Flash 2.5  + Bishop Cathedral (via consult_scribes)
  openai_4omini_bishop     4o-mini    + Bishop Cathedral (via consult_scribes)

KNIGHT Cathedral conditions (2) [R11 corpus ingested K455a]:
  anthropic_haiku_knight   Haiku 4.5  + Knight Cathedral (R11 corpus parity)
  anthropic_opus_knight    Opus 4.7   + Knight Cathedral

BARE control conditions (2):
  anthropic_haiku_bare     Haiku 4.5  no Cathedral (cold)
  openai_4omini_bare       4o-mini    no Cathedral (cold)

Usage:
  python run_r11_k455a.py --out results_r11_k455a [--budget 30.00]

Env vars: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY (or GEMINI_API_KEY),
          PERPLEXITY_API_KEY
Load from SDS.env upstream (see AGENTS.md).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Force UTF-8 stdout/stderr on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from r11_adapters import cross_cathedral_adapter  # noqa: E402
from r11_adapters.cross_cathedral_adapter import CrossCathedralConsultClient  # noqa: E402
from r11_adapters import multi_cathedral_adapter  # noqa: E402
from r11_adapters.multi_cathedral_adapter import MultiCathedralConsultClient  # noqa: E402
from r11_adapters import claude_projects_adapter  # noqa: E402
from r11_adapters import chatgpt_memory_adapter  # noqa: E402

BANK_PATH = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED.json"

BUDGET_HARD_CAP = 30.00
HALF_WARN_FRACTION = 0.50

# ─── Condition definitions ────────────────────────────────────────────────
# adapter_type: "anthropic_cross_cathedral" | "multi_cathedral" | "anthropic_cold" | "openai_cold"
CONDITIONS: list[dict] = [
    # Bishop Cathedral — Anthropic
    {
        "id": "anthropic_haiku_bishop",
        "vendor": "anthropic",
        "model": "claude-haiku-4-5-20251001",
        "adapter_type": "anthropic_cross_cathedral",
        "cathedral": "bishop",
        "description": "Haiku 4.5 + Bishop Cathedral (R11 corpus)",
    },
    {
        "id": "anthropic_opus_bishop",
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "adapter_type": "anthropic_cross_cathedral",
        "cathedral": "bishop",
        "description": "Opus 4.7 + Bishop Cathedral (R11 corpus)",
    },
    # Bishop Cathedral — Cross-vendor
    {
        "id": "perplexity_sonar_bishop",
        "vendor": "perplexity",
        "model": "sonar",
        "adapter_type": "multi_cathedral",
        "cathedral": "bishop",
        "description": "Perplexity Sonar + Bishop Cathedral (consult_scribes)",
    },
    {
        "id": "google_flash_bishop",
        "vendor": "google",
        "model": "gemini-2.5-flash",
        "adapter_type": "multi_cathedral",
        "cathedral": "bishop",
        "description": "Gemini 2.5 Flash + Bishop Cathedral (consult_scribes)",
    },
    {
        "id": "openai_4omini_bishop",
        "vendor": "openai",
        "model": "gpt-4o-mini",
        "adapter_type": "multi_cathedral",
        "cathedral": "bishop",
        "description": "GPT-4o-mini + Bishop Cathedral (consult_scribes)",
    },
    # Knight Cathedral — Anthropic [R11 corpus ingested K455a]
    {
        "id": "anthropic_haiku_knight",
        "vendor": "anthropic",
        "model": "claude-haiku-4-5-20251001",
        "adapter_type": "anthropic_cross_cathedral",
        "cathedral": "knight",
        "description": "Haiku 4.5 + Knight Cathedral (R11 corpus ingested K455a)",
    },
    {
        "id": "anthropic_opus_knight",
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "adapter_type": "anthropic_cross_cathedral",
        "cathedral": "knight",
        "description": "Opus 4.7 + Knight Cathedral (R11 corpus ingested K455a)",
    },
    # Bare controls — no Cathedral
    {
        "id": "anthropic_haiku_bare",
        "vendor": "anthropic",
        "model": "claude-haiku-4-5-20251001",
        "adapter_type": "anthropic_cold",
        "cathedral": None,
        "description": "Haiku 4.5 bare (no Cathedral, no corpus)",
    },
    {
        "id": "openai_4omini_bare",
        "vendor": "openai",
        "model": "gpt-4o-mini",
        "adapter_type": "openai_cold",
        "cathedral": None,
        "description": "GPT-4o-mini bare (no Cathedral, no corpus)",
    },
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


def _check_env(condition: dict) -> str | None:
    """Returns error message if required env var is missing, else None."""
    vendor = condition["vendor"]
    if vendor == "anthropic" and not os.environ.get("ANTHROPIC_API_KEY"):
        return "ANTHROPIC_API_KEY not set"
    if vendor == "openai" and not os.environ.get("OPENAI_API_KEY"):
        return "OPENAI_API_KEY not set"
    if vendor == "google" and not (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")):
        return "GOOGLE_API_KEY / GEMINI_API_KEY not set"
    if vendor == "perplexity" and not os.environ.get("PERPLEXITY_API_KEY"):
        return "PERPLEXITY_API_KEY not set"
    return None


def run_condition(
    condition: dict,
    questions: list[dict],
    corpus_text: str,
    out_dir: Path,
    total_cost: list[float],
    budget: float,
    cross_client: CrossCathedralConsultClient | None,
    multi_client: MultiCathedralConsultClient | None,
) -> tuple[list[dict], bool]:
    """Run all questions for one condition. Returns (records, halted)."""
    cid = condition["id"]
    model = condition["model"]
    adapter_type = condition["adapter_type"]
    cathedral = condition["cathedral"]

    per_file = out_dir / f"{cid}.jsonl"
    records: list[dict] = []
    halted = False

    with per_file.open("w", encoding="utf-8") as out:
        for q in questions:
            if total_cost[0] >= budget:
                print(f"\n!! BUDGET CAP ${budget:.2f} HIT — halting {cid} mid-run.")
                halted = True
                break

            if (total_cost[0] >= budget * HALF_WARN_FRACTION
                    and not getattr(run_condition, "_warned", False)):
                print(f"\n** HALF-BUDGET WARNING: ${total_cost[0]:.2f} of ${budget:.2f} spent. Continuing.")
                run_condition._warned = True  # type: ignore[attr-defined]

            qid = q["id"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])
            scribe_ids: list[str] = []

            try:
                if adapter_type == "anthropic_cross_cathedral":
                    assert cross_client is not None
                    resp, scribe_ids = cross_cathedral_adapter.answer(
                        question_text,
                        corpus_text="",
                        model=model,
                        mode=("lb_cross_bishop" if cathedral == "bishop" else "lb_knight_only"),
                        consult_client=cross_client,
                    )
                    # Override: for knight cathedral conditions we need actual knight cathedral retrieval
                    # cross_cathedral_adapter.lb_knight_only maps to cathedral="knight" already
                    # lb_cross_bishop maps to cathedral="bishop" — both correct per adapter logic
                    # But we need to verify: cross_cathedral_adapter consults the RIGHT cathedral
                    # lb_knight_only => cathedral="knight", lb_cross_bishop => cathedral="bishop" ✓

                elif adapter_type == "multi_cathedral":
                    assert multi_client is not None
                    resp, scribe_ids = multi_cathedral_adapter.answer(
                        question_text,
                        vendor=condition["vendor"],
                        model=model,
                        cathedral=cathedral,
                        consult_client=multi_client,
                    )

                elif adapter_type == "anthropic_cold":
                    # Cold Anthropic — no corpus, no Cathedral
                    resp = claude_projects_adapter.answer(
                        question_text,
                        corpus_text="",
                        model=model,
                        mode="cold",
                    )

                elif adapter_type == "openai_cold":
                    resp = chatgpt_memory_adapter.answer(
                        question_text,
                        corpus_text="",
                        model=model,
                        mode="cold",
                    )

                else:
                    raise ValueError(f"Unknown adapter_type: {adapter_type}")

                grade = grade_response(resp.text, required)
                total_cost[0] += resp.cost_usd

                record = {
                    "qid": qid,
                    "condition": cid,
                    "vendor": condition["vendor"],
                    "model": model,
                    "adapter_type": adapter_type,
                    "cathedral": cathedral,
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

                out.write(json.dumps(record) + "\n")
                records.append(record)

                scribes_tag = (",".join(scribe_ids[:3]) or "-") if scribe_ids else "-"
                print(
                    f"  [{cid:<32}] {qid:<12} {grade:<5} "
                    f"${resp.cost_usd:.5f} (${total_cost[0]:.4f}) {scribes_tag}"
                )

            except Exception as e:
                err_record = {
                    "qid": qid, "condition": cid, "model": model,
                    "error": str(e), "ts": datetime.now(timezone.utc).isoformat(),
                }
                out.write(json.dumps(err_record) + "\n")
                print(f"  [{cid:<32}] {qid:<12} ERROR: {e}")

            time.sleep(0.25)

    return records, halted


def _aggregate(records: list[dict], total_cost: float, halted: bool) -> dict:
    by_condition: dict[str, dict] = {}
    latencies: dict[str, list[float]] = {}

    bare_hots: dict[str, set[str]] = {}  # vendor -> set of qids HOT on bare

    bare_condition_ids = {"anthropic_haiku_bare", "openai_4omini_bare"}

    for r in records:
        if "error" in r or "grade" not in r:
            continue
        cid = r["condition"]
        qid = r["qid"]
        grade = r["grade"]

        if cid in bare_condition_ids and grade == "HOT":
            bare_hots.setdefault(cid, set()).add(qid)

        b = by_condition.setdefault(cid, {
            "n": 0, "HOT": 0, "HIT": 0, "MISS": 0, "cost_usd": 0.0,
            "vendor": r.get("vendor", ""),
            "model": r.get("model", ""),
            "cathedral": r.get("cathedral"),
        })
        b["n"] += 1
        if grade in ("HOT", "HIT", "MISS"):
            b[grade] += 1
        b["cost_usd"] = round(b["cost_usd"] + r.get("cost_usd", 0.0), 6)
        latencies.setdefault(cid, []).append(r.get("latency_s", 0.0))

    for cid, b in by_condition.items():
        n = b["n"] or 1
        b["hot_pct"] = round(100.0 * b["HOT"] / n, 2)
        b["hit_pct"] = round(100.0 * b["HIT"] / n, 2)
        b["miss_pct"] = round(100.0 * b["MISS"] / n, 2)
        b["hot_or_hit_pct"] = round(100.0 * (b["HOT"] + b["HIT"]) / n, 2)
        b["cost_per_q"] = round(b["cost_usd"] / n, 6)
        b["cost_per_hot"] = round(b["cost_usd"] / b["HOT"], 6) if b["HOT"] > 0 else None
        lats = sorted(latencies.get(cid, []))
        if lats:
            mid = len(lats) // 2
            b["p50_latency_s"] = round(lats[mid], 3)
            b["p95_latency_s"] = round(lats[max(0, int(0.95 * len(lats)) - 1)], 3)

    # Cathedral Effect classification per condition
    # Primary baseline: anthropic_haiku_bare (same-vendor control for Anthropic)
    # For OpenAI: openai_4omini_bare (exact match)
    # For Google/Perplexity: use anthropic_haiku_bare as proxy (no vendor-specific bare)
    bare_pcts = {
        cid: by_condition[cid]["hot_pct"]
        for cid in bare_condition_ids
        if cid in by_condition
    }

    anthropic_bare_pct = bare_pcts.get("anthropic_haiku_bare")
    openai_bare_pct = bare_pcts.get("openai_4omini_bare")

    for cid, b in by_condition.items():
        if cid in bare_condition_ids:
            b["cathedral_effect_classification"] = "BASELINE"
            b["cathedral_effect_lift_pp"] = None
            b["baseline_used"] = None
            continue

        # Choose baseline
        vendor = b["vendor"]
        if vendor == "openai":
            baseline_pct = openai_bare_pct
            baseline_name = "openai_4omini_bare"
        else:
            baseline_pct = anthropic_bare_pct
            baseline_name = "anthropic_haiku_bare"

        if baseline_pct is None:
            b["cathedral_effect_classification"] = "NO_BASELINE"
            b["cathedral_effect_lift_pp"] = None
            b["baseline_used"] = None
        else:
            lift = round(b["hot_pct"] - baseline_pct, 2)
            b["cathedral_effect_lift_pp"] = lift
            b["baseline_used"] = baseline_name
            if lift >= 20:
                b["cathedral_effect_classification"] = "Strong"
            elif lift >= 5:
                b["cathedral_effect_classification"] = "Weak"
            elif lift >= 0:
                b["cathedral_effect_classification"] = "Null"
            else:
                b["cathedral_effect_classification"] = "Negative"

    # Multi-Cathedral replication: compare Bishop vs Knight for matched models
    multi_cathedral_replication = {}
    for model_tier in ["haiku", "opus"]:
        model_name = "claude-haiku-4-5-20251001" if model_tier == "haiku" else "claude-opus-4-7"
        bishop_cid = f"anthropic_{model_tier}_bishop"
        knight_cid = f"anthropic_{model_tier}_knight"
        if bishop_cid in by_condition and knight_cid in by_condition:
            bp = by_condition[bishop_cid]["hot_pct"]
            kp = by_condition[knight_cid]["hot_pct"]
            delta = round(kp - bp, 2)
            multi_cathedral_replication[model_tier] = {
                "bishop_hot_pct": bp,
                "knight_hot_pct": kp,
                "delta_pp": delta,
                "replication": "YES" if abs(delta) <= 10 else "DIVERGED",
                "note": (
                    "Knight Cathedral reproduces Bishop Cathedral lift (|delta| ≤ 10pp)"
                    if abs(delta) <= 10
                    else f"Knight diverges from Bishop by {delta:+.1f}pp — investigate"
                ),
            }

    # Vendor-Agnostic vs Vendor-Specific classification
    # Definition: Vendor-Agnostic if at least 3 of 4 non-Anthropic-bare conditions
    # show Weak or Strong Cathedral Effect
    vendor_agnostic_conditions = [
        "perplexity_sonar_bishop",
        "google_flash_bishop",
        "openai_4omini_bishop",
        "anthropic_haiku_bishop",
    ]
    weak_or_strong_count = sum(
        1 for cid in vendor_agnostic_conditions
        if cid in by_condition
        and by_condition[cid].get("cathedral_effect_classification") in ("Weak", "Strong")
    )
    vendor_agnostic_classification = "Vendor-Agnostic" if weak_or_strong_count >= 3 else "Vendor-Specific"

    return {
        "session": "K455a",
        "corpus_id": "R11-CANONICAL-K444-v2",
        "total_cost_usd": round(total_cost, 4),
        "total_records": len(records),
        "halted_on_budget": halted,
        "vendor_agnostic_classification": vendor_agnostic_classification,
        "vendor_agnostic_evidence": {
            "weak_or_strong_count": weak_or_strong_count,
            "out_of": len(vendor_agnostic_conditions),
            "conditions_checked": vendor_agnostic_conditions,
        },
        "multi_cathedral_replication": multi_cathedral_replication,
        "by_condition": by_condition,
    }


def run(out_dir: Path, budget: float, condition_filter: list[str] | None = None) -> dict:
    if not BANK_PATH.exists():
        raise FileNotFoundError(f"Question bank not found: {BANK_PATH}")

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]

    conditions = CONDITIONS
    if condition_filter:
        conditions = [c for c in CONDITIONS if c["id"] in condition_filter]
        if not conditions:
            raise ValueError(f"No conditions matched filter: {condition_filter}")

    out_dir.mkdir(parents=True, exist_ok=True)
    cost_log = out_dir / "cost_log.csv"
    cost_log.write_text(
        "ts,condition,vendor,model,cathedral,qid,grade,cost_usd,latency_s,running_total_usd\n",
        encoding="utf-8",
    )

    print("=" * 70)
    print("K455a — Cathedral Effect: Full Vendor Matrix + Multi-Cathedral Replication")
    print("=" * 70)
    print(f"  Bank:       {BANK_PATH.name}  ({len(questions)} questions)")
    print(f"  Conditions: {len(conditions)}")
    print(f"  Budget:     ${budget:.2f}")
    print(f"  Output:     {out_dir}")
    print()

    if not cross_cathedral_adapter.CONSULT_CLI_PATH.exists():
        print(f"FATAL: {cross_cathedral_adapter.CONSULT_CLI_PATH} not found", file=sys.stderr)
        sys.exit(3)

    cross_client = CrossCathedralConsultClient(cross_cathedral_adapter.CONSULT_CLI_PATH)
    multi_client = MultiCathedralConsultClient(multi_cathedral_adapter.CONSULT_CLI_PATH)
    print("  consult_scribes subprocesses started OK.")
    print()

    total_cost: list[float] = [0.0]
    all_records: list[dict] = []
    global_halted = False

    try:
        for condition in conditions:
            if global_halted:
                break

            cid = condition["id"]
            env_err = _check_env(condition)
            if env_err:
                print(f"\n  SKIP {cid}: {env_err}")
                continue

            print(f"\n{'─' * 70}")
            print(f"  [{cid}]  {condition['description']}")
            print(f"  Model: {condition['model']}  Cathedral: {condition.get('cathedral', 'none')}")
            print(f"{'─' * 70}")

            records, halted = run_condition(
                condition, questions, "", out_dir,
                total_cost, budget, cross_client, multi_client,
            )
            all_records.extend(records)

            with cost_log.open("a", encoding="utf-8") as cl:
                for r in records:
                    if "error" not in r:
                        cl.write(
                            f"{r['ts']},{r['condition']},{r['vendor']},{r['model']},"
                            f"{r.get('cathedral', '')},"
                            f"{r['qid']},{r['grade']},{r['cost_usd']:.6f},"
                            f"{r['latency_s']:.3f},{total_cost[0]:.6f}\n"
                        )

            if halted:
                global_halted = True

    finally:
        cross_client.close()
        multi_client.close()

    all_jsonl = out_dir / "all_graded.jsonl"
    with all_jsonl.open("w", encoding="utf-8") as f:
        for r in all_records:
            f.write(json.dumps(r) + "\n")

    summary = _aggregate(all_records, total_cost[0], global_halted)
    summary_path = out_dir / "results_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    _print_summary(summary, total_cost[0], budget, out_dir)
    return summary


def _print_summary(summary: dict, total_cost: float, budget: float, out_dir: Path) -> None:
    print(f"\n{'=' * 70}")
    print("K455a RUN COMPLETE")
    print(f"{'=' * 70}")
    print(f"  Total spend:    ${total_cost:.4f}  (cap ${budget:.2f})")
    print(f"  Total records:  {summary['total_records']}")
    print(f"  Budget halted:  {summary['halted_on_budget']}")
    print()

    bc = summary.get("by_condition", {})
    print("  Condition Results (HOT% | HIT% | MISS% | Effect):")
    print(f"  {'Condition':<36} {'HOT%':>6} {'HIT%':>6} {'MISS%':>6} {'Lift':>7}  {'Effect'}")
    print(f"  {'-'*36} {'-'*6} {'-'*6} {'-'*6} {'-'*7}  {'-'*20}")
    for cid, b in bc.items():
        lift_str = f"{b.get('cathedral_effect_lift_pp', 0):+.1f}pp" if b.get("cathedral_effect_lift_pp") is not None else "   n/a"
        cls = b.get("cathedral_effect_classification", "")
        print(
            f"  {cid:<36} {b['hot_pct']:>6.1f} {b['hit_pct']:>6.1f} {b['miss_pct']:>6.1f} "
            f"{lift_str:>7}  {cls}"
        )

    print()
    print(f"  Vendor-Agnostic Classification: {summary.get('vendor_agnostic_classification')}")

    mcr = summary.get("multi_cathedral_replication", {})
    if mcr:
        print("\n  Multi-Cathedral Replication:")
        for tier, res in mcr.items():
            print(
                f"    {tier}: Bishop={res['bishop_hot_pct']}% "
                f"Knight={res['knight_hot_pct']}% "
                f"delta={res['delta_pp']:+.1f}pp  [{res['replication']}]"
            )

    print(f"\n  Output: {out_dir}")


def main() -> None:
    p = argparse.ArgumentParser(description="K455a R11 Full Vendor Matrix + Multi-Cathedral benchmark")
    p.add_argument("--out", default="results_r11_k455a", help="Output directory")
    p.add_argument("--budget", type=float, default=BUDGET_HARD_CAP)
    p.add_argument("--conditions", nargs="*", help="Run only these condition IDs")
    args = p.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("FATAL: ANTHROPIC_API_KEY not set. Load SDS.env upstream.", file=sys.stderr)
        sys.exit(2)

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = SCRIPT_DIR / out_dir

    run(out_dir, args.budget, args.conditions)


if __name__ == "__main__":
    main()
