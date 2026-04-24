#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Run only Arm 2 of the K455c cross-Cathedral benchmark.
Appends results to the existing results_r11_v3_cross_cathedral_K455c directory.
Arm 1 results are preserved.
"""
from __future__ import annotations

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from r11_adapters import cross_cathedral_adapter
from r11_adapters.cross_cathedral_adapter import CrossCathedralConsultClient

BANK_PATH = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED.json"
OUT_DIR = SCRIPT_DIR / "results_r11_v3_cross_cathedral_K455c"

def grade_response(response_text: str, required_elements: list[str]) -> str:
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

def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("FATAL: ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(2)

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    per_file = OUT_DIR / "lb_knight_cross_bishop_haiku.jsonl"

    consult_client = CrossCathedralConsultClient(cross_cathedral_adapter.CONSULT_CLI_PATH)
    print("consult_scribes subprocess started OK.")

    total_cost = 0.0
    records = []

    print("\nArm 2 (treatment): Haiku + Bishop Cathedral (R11 corpus, max_entries=55)")
    print("=" * 70)

    with per_file.open("w", encoding="utf-8") as out:
        for q in questions:
            qid = q["id"]
            question_text = q["question"]
            required = q.get("hot_required_elements", [])

            try:
                resp, scribe_ids = cross_cathedral_adapter.answer(
                    question_text,
                    corpus_text="",
                    model="claude-haiku-4-5-20251001",
                    mode="lb_cross_bishop",
                    consult_client=consult_client,
                )

                grade = grade_response(resp.text, required)
                total_cost += resp.cost_usd

                record = {
                    "qid": qid,
                    "condition": "lb_knight_cross_bishop_haiku",
                    "arm": 2,
                    "vendor": "anthropic",
                    "model": "claude-haiku-4-5-20251001",
                    "mode": "lb_cross_bishop",
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
                    f"  [Arm2 lb_knight_cross_bishop_haiku] {qid:<12} {grade:<5} "
                    f"${resp.cost_usd:.5f} (${total_cost:.4f}) {scribes_tag}"
                )

            except Exception as e:
                err_record = {
                    "qid": qid, "condition": "lb_knight_cross_bishop_haiku",
                    "arm": 2, "model": "claude-haiku-4-5-20251001",
                    "error": str(e), "ts": datetime.now(timezone.utc).isoformat(),
                }
                out.write(json.dumps(err_record) + "\n")
                print(f"  [Arm2] {qid} ERROR: {e}")

            time.sleep(0.20)

    consult_client.close()

    # Grade summary
    n = len([r for r in records if "grade" in r])
    hot = sum(1 for r in records if r.get("grade") == "HOT")
    hit = sum(1 for r in records if r.get("grade") == "HIT")
    miss = sum(1 for r in records if r.get("grade") == "MISS")

    print(f"\nArm 2 COMPLETE: n={n}  HOT={100*hot/max(1,n):.1f}%  HIT={100*hit/max(1,n):.1f}%  MISS={100*miss/max(1,n):.1f}%")
    print(f"Total spend: ${total_cost:.4f}")

    # Merge with Arm 1 for full summary
    arm1_file = OUT_DIR / "lb_knight_cathedral_only_haiku.jsonl"
    arm1_records = []
    if arm1_file.exists():
        for line in arm1_file.read_text(encoding="utf-8").splitlines():
            if line.strip():
                try:
                    arm1_records.append(json.loads(line))
                except Exception:
                    pass

    all_records = arm1_records + records

    all_jsonl = OUT_DIR / "all_graded.jsonl"
    with all_jsonl.open("w", encoding="utf-8") as f:
        for r in all_records:
            f.write(json.dumps(r) + "\n")

    # Compute cross-Cathedral lift
    arm1_valid = [r for r in arm1_records if "grade" in r and "error" not in r]
    arm2_valid = [r for r in records if "grade" in r and "error" not in r]

    arm1_hot_pct = 100.0 * sum(1 for r in arm1_valid if r["grade"] == "HOT") / max(1, len(arm1_valid))
    arm2_hot_pct = 100.0 * hot / max(1, n)
    lift_pp = round(arm2_hot_pct - arm1_hot_pct, 2)

    if lift_pp >= 20:
        classification = "Strong Cross-Cathedral Effect"
    elif lift_pp >= 5:
        classification = "Weak Cross-Cathedral Effect"
    elif lift_pp >= -5:
        classification = "Null Effect"
    else:
        classification = "Negative Effect"

    summary = {
        "session": "K455c",
        "corpus_id": "R11-CANONICAL-K444-v2",
        "total_cost_usd": round(total_cost + sum(r.get("cost_usd", 0) for r in arm1_valid), 4),
        "total_records": len(all_records),
        "cross_cathedral_lift_pp": lift_pp,
        "classification": classification,
        "by_condition": {
            "lb_knight_cathedral_only_haiku": {
                "arm": 1,
                "n": len(arm1_valid),
                "HOT": sum(1 for r in arm1_valid if r["grade"] == "HOT"),
                "HIT": sum(1 for r in arm1_valid if r["grade"] == "HIT"),
                "MISS": sum(1 for r in arm1_valid if r["grade"] == "MISS"),
                "hot_pct": round(arm1_hot_pct, 2),
            },
            "lb_knight_cross_bishop_haiku": {
                "arm": 2,
                "n": n,
                "HOT": hot,
                "HIT": hit,
                "MISS": miss,
                "hot_pct": round(arm2_hot_pct, 2),
            },
        },
    }

    (OUT_DIR / "results_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\nCross-Cathedral lift: {lift_pp:.1f} pp")
    print(f"Classification: {classification}")
    print(f"Summary: {OUT_DIR / 'results_summary.json'}")

if __name__ == "__main__":
    main()
