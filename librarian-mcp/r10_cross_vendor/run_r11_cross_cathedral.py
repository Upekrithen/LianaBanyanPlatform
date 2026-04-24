#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
R11 Cross-Cathedral Benchmark Runner (K455c / B121)
====================================================
Runs the two-arm cooperative-corpus flywheel test:

  Arm 1 (control):  lb_knight_cathedral_only_haiku
    Haiku 4.5 + consult_scribes(cathedral="knight") — NO R11 corpus
    Expected: LOW accuracy (~cold baseline)

  Arm 2 (treatment): lb_knight_cross_bishop_haiku
    Haiku 4.5 + consult_scribes(cathedral="bishop") — R11 corpus loaded
    Expected: HIGH accuracy (cross-Cathedral lift demonstrated)

Cross-Cathedral lift = Arm2_HOT% - Arm1_HOT%

Escalation triggers (hard stops per K455c spec):
  - Arm 1 HOT > 30%: Knight's Cathedral accidentally has R11 corpus; STOP
  - Arm 2 HOT < 5% after 10 calls: cross-Cathedral consultation not working; STOP
  - Total spend > $15: STOP before any Opus stretch

Usage:
  python run_r11_cross_cathedral.py [--out results_r11_v3_cross_cathedral_K455c] [--budget 20.00]

Env vars: ANTHROPIC_API_KEY (required). Load from SDS.env upstream.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

# Force UTF-8 stdout/stderr on Windows (prevents UnicodeEncodeError on emoji/em-dash in model responses)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from r11_adapters import cross_cathedral_adapter  # noqa: E402
from r11_adapters.cross_cathedral_adapter import CrossCathedralConsultClient  # noqa: E402

BANK_PATH = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED.json"
BUDGET_HARD_CAP = 20.00
ARM1_HOT_ESCALATION = 30.0   # % — unexpected; signals corpus leak into Knight
ARM2_HOT_FLOOR = 5.0          # % after 20 calls — signals MCP plumbing failure
ARM2_CHECK_AFTER = 20         # questions before checking the floor (with full corpus retrieval)

CONDITIONS: list[dict] = [
    {
        "id": "lb_knight_cathedral_only_haiku",
        "vendor": "anthropic",
        "model": "claude-haiku-4-5-20251001",
        "adapter": "cross_cathedral",
        "mode": "lb_knight_only",
        "arm": 1,
        "description": "Arm 1 control: Haiku + Knight Cathedral (no R11 corpus)",
    },
    {
        "id": "lb_knight_cross_bishop_haiku",
        "vendor": "anthropic",
        "model": "claude-haiku-4-5-20251001",
        "adapter": "cross_cathedral",
        "mode": "lb_cross_bishop",
        "arm": 2,
        "description": "Arm 2 treatment: Haiku + Bishop Cathedral (R11 corpus loaded)",
    },
]


def grade_response(response_text: str, required_elements: list[str]) -> str:
    """R10 three-tier substring rubric: HOT=all, HIT>=ceil(n/2), MISS=rest."""
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
    out_dir: Path,
    total_cost: list[float],
    budget: float,
    consult_client: CrossCathedralConsultClient,
) -> tuple[list[dict], str | None]:
    """Run all questions for one condition. Returns (records, halt_reason | None)."""
    cid = condition["id"]
    model = condition["model"]
    mode = condition["mode"]
    arm = condition["arm"]

    per_file = out_dir / f"{cid}.jsonl"
    records: list[dict] = []
    halt_reason: str | None = None

    arm1_hot_count = 0
    arm2_hot_count_10 = 0

    with per_file.open("w", encoding="utf-8") as out:
        for qi, q in enumerate(questions):
            # Budget hard stop
            if total_cost[0] >= budget:
                halt_reason = f"BUDGET_CAP: ${total_cost[0]:.4f} >= ${budget:.2f}"
                print(f"\n!! BUDGET CAP ${budget:.2f} HIT — halting {cid}.")
                break

            qid = q["id"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])

            try:
                resp, scribe_ids = cross_cathedral_adapter.answer(
                    question_text,
                    corpus_text="",  # Not used for cross-Cathedral (R9 preload + consult)
                    model=model,
                    mode=mode,
                    consult_client=consult_client,
                )

                grade = grade_response(resp.text, required)
                total_cost[0] += resp.cost_usd

                record = {
                    "qid": qid,
                    "condition": cid,
                    "arm": arm,
                    "vendor": condition["vendor"],
                    "model": model,
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
                out.write(json.dumps(record) + "\n")
                records.append(record)

                scribes_tag = (",".join(scribe_ids[:3]) or "-") if scribe_ids else "-"
                print(
                    f"  [Arm{arm} {cid:<38}] {qid:<12} {grade:<5} "
                    f"${resp.cost_usd:.5f} (${total_cost[0]:.4f}) {scribes_tag}"
                )

                # Escalation checks
                if arm == 1 and grade == "HOT":
                    arm1_hot_count += 1
                    hot_pct = 100.0 * arm1_hot_count / (qi + 1)
                    if hot_pct > ARM1_HOT_ESCALATION and qi >= ARM2_CHECK_AFTER - 1:
                        halt_reason = (
                            f"ARM1_HOT_ESCALATION: {hot_pct:.1f}% HOT after {qi+1} questions "
                            f"(threshold {ARM1_HOT_ESCALATION}%). "
                            "SIGNALS: Knight Cathedral may have R11 corpus — CHECK IMMEDIATELY."
                        )
                        print(f"\n!! ESCALATION STOP: {halt_reason}")
                        break

                if arm == 2 and qi == ARM2_CHECK_AFTER - 1:
                    arm2_hot_count_10 = sum(1 for r in records if r.get("grade") == "HOT")
                    floor_pct = 100.0 * arm2_hot_count_10 / ARM2_CHECK_AFTER
                    if floor_pct < ARM2_HOT_FLOOR:
                        halt_reason = (
                            f"ARM2_HOT_FLOOR: only {floor_pct:.1f}% HOT after {ARM2_CHECK_AFTER} questions "
                            f"(floor {ARM2_HOT_FLOOR}%). "
                            "SIGNALS: cross-Cathedral MCP consultation not returning R11 data — CHECK PLUMBING."
                        )
                        print(f"\n!! ESCALATION STOP: {halt_reason}")
                        break

            except Exception as e:
                err_record = {
                    "qid": qid, "condition": cid, "arm": arm, "model": model,
                    "error": str(e), "ts": datetime.now(timezone.utc).isoformat(),
                }
                out.write(json.dumps(err_record) + "\n")
                print(f"  [Arm{arm} {cid:<38}] {qid:<12} ERROR: {e}")

            time.sleep(0.20)

    return records, halt_reason


def _aggregate(records: list[dict], total_cost: float) -> dict:
    by_condition: dict[str, dict] = {}
    latencies: dict[str, list[float]] = {}

    for r in records:
        if "error" in r or "grade" not in r:
            continue
        cid = r["condition"]
        grade = r["grade"]

        b = by_condition.setdefault(cid, {
            "arm": r.get("arm", 0),
            "n": 0, "HOT": 0, "HIT": 0, "MISS": 0, "cost_usd": 0.0,
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

    # Compute cross-Cathedral lift
    arm1 = next((b for b in by_condition.values() if b.get("arm") == 1), None)
    arm2 = next((b for b in by_condition.values() if b.get("arm") == 2), None)
    lift_pp: float | None = None
    classification: str = "N/A"
    if arm1 and arm2:
        lift_pp = round(arm2["hot_pct"] - arm1["hot_pct"], 2)
        if lift_pp >= 20:
            classification = "Strong Cross-Cathedral Effect"
        elif lift_pp >= 5:
            classification = "Weak Cross-Cathedral Effect"
        elif lift_pp >= -5:
            classification = "Null Effect"
        else:
            classification = "Negative Effect"

    return {
        "session": "K455c",
        "corpus_id": "R11-CANONICAL-K444-v2",
        "total_cost_usd": round(total_cost, 4),
        "total_records": len(records),
        "cross_cathedral_lift_pp": lift_pp,
        "classification": classification,
        "by_condition": by_condition,
    }


def run(out_dir: Path, budget: float) -> dict:
    if not BANK_PATH.exists():
        raise FileNotFoundError(f"Question bank not found: {BANK_PATH}")

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]

    out_dir.mkdir(parents=True, exist_ok=True)
    cost_log = out_dir / "cost_log.csv"
    cost_log.write_text("ts,condition,arm,model,qid,grade,cost_usd,latency_s,running_total_usd\n", encoding="utf-8")

    print("R11 Cross-Cathedral Benchmark")
    print("=" * 60)
    print(f"  Bank:      {BANK_PATH.name}  ({len(questions)} questions)")
    print(f"  Conditions: {len(CONDITIONS)}")
    print(f"  Budget:    ${budget:.2f}")
    print(f"  Output:    {out_dir}")
    print()
    print("  Escalation stops:")
    print(f"    Arm 1 HOT > {ARM1_HOT_ESCALATION}% => Knight has R11 (corpus leak check)")
    print(f"    Arm 2 HOT < {ARM2_HOT_FLOOR}% after {ARM2_CHECK_AFTER} calls => MCP plumbing failure")
    print(f"    Total spend > $15 => STOP before Opus stretch")
    print()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("FATAL: ANTHROPIC_API_KEY not set. Load SDS.env upstream.", file=sys.stderr)
        sys.exit(2)

    if not cross_cathedral_adapter.CONSULT_CLI_PATH.exists():
        print(f"FATAL: consult_scribes_cli.mjs not found at {cross_cathedral_adapter.CONSULT_CLI_PATH}", file=sys.stderr)
        sys.exit(3)

    consult_client = CrossCathedralConsultClient(cross_cathedral_adapter.CONSULT_CLI_PATH)
    print("  consult_scribes subprocess started OK.")
    print()

    total_cost: list[float] = [0.0]
    all_records: list[dict] = []
    halt_reasons: dict[str, str] = {}

    try:
        for condition in CONDITIONS:
            cid = condition["id"]
            print(f"\n{'=' * 60}")
            print(f"  {condition['description']}")
            print(f"  Model: {condition['model']}  Mode: {condition['mode']}")
            print(f"{'=' * 60}")

            records, halt_reason = run_condition(
                condition, questions, out_dir, total_cost, budget, consult_client,
            )
            all_records.extend(records)
            if halt_reason:
                halt_reasons[cid] = halt_reason

            with cost_log.open("a", encoding="utf-8") as cl:
                for r in records:
                    if "error" not in r:
                        cl.write(
                            f"{r['ts']},{r['condition']},{r.get('arm','')},{r['model']},"
                            f"{r['qid']},{r['grade']},{r['cost_usd']:.6f},"
                            f"{r['latency_s']:.3f},{total_cost[0]:.6f}\n"
                        )

            if total_cost[0] >= 15.0:
                print(f"\n  [STOP] Spend ${total_cost[0]:.4f} >= $15 cap — skipping Opus stretch (if any).")
                break

    finally:
        consult_client.close()

    all_jsonl = out_dir / "all_graded.jsonl"
    with all_jsonl.open("w", encoding="utf-8") as f:
        for r in all_records:
            f.write(json.dumps(r) + "\n")

    summary = _aggregate(all_records, total_cost[0])
    if halt_reasons:
        summary["halt_reasons"] = halt_reasons

    summary_path = out_dir / "results_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\n{'=' * 60}")
    print("R11 CROSS-CATHEDRAL RUN COMPLETE")
    print(f"{'=' * 60}")
    print(f"  Total spend:     ${total_cost[0]:.4f}  (cap ${budget:.2f})")
    print(f"  Total records:   {len(all_records)}")

    arm1_id = "lb_knight_cathedral_only_haiku"
    arm2_id = "lb_knight_cross_bishop_haiku"
    bc = summary.get("by_condition", {})
    if arm1_id in bc:
        a1 = bc[arm1_id]
        print(f"\n  Arm 1 (control — Knight Cathedral):")
        print(f"    n={a1['n']}  HOT={a1['hot_pct']}%  HIT={a1['hit_pct']}%  MISS={a1['miss_pct']}%")
        print(f"    $/q={a1.get('cost_per_q','?')}  $/HOT={a1.get('cost_per_hot','?')}")
    if arm2_id in bc:
        a2 = bc[arm2_id]
        print(f"\n  Arm 2 (treatment — Bishop Cathedral cross-consult):")
        print(f"    n={a2['n']}  HOT={a2['hot_pct']}%  HIT={a2['hit_pct']}%  MISS={a2['miss_pct']}%")
        print(f"    $/q={a2.get('cost_per_q','?')}  $/HOT={a2.get('cost_per_hot','?')}")

    print(f"\n  Cross-Cathedral lift:  {summary.get('cross_cathedral_lift_pp', 'N/A')} pp")
    print(f"  Classification:        {summary.get('classification', 'N/A')}")
    if halt_reasons:
        print(f"\n  !! Halt reasons:")
        for cid, reason in halt_reasons.items():
            print(f"     {cid}: {reason}")
    print(f"\n  Output: {out_dir}")
    return summary


def main() -> None:
    p = argparse.ArgumentParser(description="R11 cross-Cathedral cooperative-corpus flywheel benchmark")
    p.add_argument(
        "--out",
        default="results_r11_v3_cross_cathedral_K455c",
        help="Output directory (relative to script dir)",
    )
    p.add_argument(
        "--budget",
        type=float,
        default=BUDGET_HARD_CAP,
        help=f"Hard cost cap USD (default {BUDGET_HARD_CAP})",
    )
    args = p.parse_args()

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = SCRIPT_DIR / out_dir

    run(out_dir, args.budget)


if __name__ == "__main__":
    main()
