#!/usr/bin/env python3
"""
R11 Summarizer
===============
Reads results_r11_<session>/graded_r11.jsonl (or all_graded.jsonl if grader
hasn't run) and produces:
  - results_r11_<session>/aggregate_r11.json  (machine-readable)
  - results_r11_<session>/summary_r11.md      (human-readable markdown table)

The summary table includes:
  Condition | HOT% | HIT% | MISS% | Retrieval-correct% | Cost/query | Cost/correct | Latency-p50

Retrieval-correct% = among this condition's HOTs, % that were MISS in ALL
three cold baselines. A HOT that was already HOT in cold = prior knowledge;
a HOT that was MISS in cold = retrieval genuinely found it.

Usage:
  python summarize_r11.py --results results_r11_K444
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

COLD_CONDITIONS = {"cold_haiku", "cold_gpt4o_mini", "cold_gemini_flash"}

CONDITION_DISPLAY_ORDER = [
    "lb_cathedral_opus",
    "lb_cathedral_haiku",
    "claude_projects_opus",
    "claude_projects_sonnet",
    "chatgpt_memory_gpt5",
    "chatgpt_memory",
    "perplexity_spaces",
    "gemini_gems",
    "lb_r9_only_opus",
    "lb_r9_only_haiku",
    "cold_gemini_flash",
    "cold_gpt4o_mini",
    "cold_haiku",
]


def load_records(results_dir: Path) -> list[dict]:
    for fname in ("graded_r11.jsonl", "all_graded.jsonl"):
        fpath = results_dir / fname
        if fpath.exists():
            print(f"  Loading from: {fpath.name}")
            return [json.loads(line) for line in fpath.read_text(encoding="utf-8").splitlines() if line.strip()]
    raise FileNotFoundError(f"No graded records found in {results_dir}")


def summarize(results_dir: Path) -> dict:
    records = load_records(results_dir)
    valid = [r for r in records if "error" not in r and "grade" in r]
    print(f"  Valid records: {len(valid)}")

    # Use grade_confirmed if available (post-grader), else grade (from runner)
    def get_grade(r: dict) -> str:
        return r.get("grade_confirmed", r.get("grade", "MISS"))

    # Build cold HOT sets per question
    cold_hot_qids: dict[str, set[str]] = {}  # qid -> set of cold conditions that scored HOT
    for r in valid:
        if r.get("condition") in COLD_CONDITIONS and get_grade(r) == "HOT":
            cold_hot_qids.setdefault(r["qid"], set()).add(r["condition"])

    # Per-condition stats
    by_cond: dict[str, dict] = {}
    latencies: dict[str, list[float]] = {}

    for r in valid:
        cid = r.get("condition", "unknown")
        grade = get_grade(r)
        qid = r["qid"]

        b = by_cond.setdefault(cid, {
            "n": 0, "HOT": 0, "HIT": 0, "MISS": 0,
            "cost_usd": 0.0, "retrieval_correct": 0,
            "model": r.get("model", ""), "vendor": r.get("vendor", ""),
            "mode": r.get("mode", ""),
        })
        b["n"] += 1
        b[grade] = b.get(grade, 0) + 1
        b["cost_usd"] = round(b["cost_usd"] + r.get("cost_usd", 0.0), 6)
        latencies.setdefault(cid, []).append(r.get("latency_s", 0.0))

        if grade == "HOT" and cid not in COLD_CONDITIONS:
            if qid not in cold_hot_qids:
                b["retrieval_correct"] += 1

    # Compute derived metrics
    for cid, b in by_cond.items():
        n = b["n"] or 1
        hot = b.get("HOT", 0)
        b["hot_pct"] = round(100.0 * hot / n, 1)
        b["hit_pct"] = round(100.0 * b.get("HIT", 0) / n, 1)
        b["miss_pct"] = round(100.0 * b.get("MISS", 0) / n, 1)
        b["hot_or_hit_pct"] = round(100.0 * (hot + b.get("HIT", 0)) / n, 1)
        b["retrieval_correct_pct"] = round(100.0 * b["retrieval_correct"] / max(1, hot), 1) if hot > 0 else None
        b["cost_per_q"] = round(b["cost_usd"] / n, 5)
        b["cost_per_correct"] = round(b["cost_usd"] / hot, 5) if hot > 0 else None
        lats = sorted(latencies.get(cid, []))
        if lats:
            mid = len(lats) // 2
            b["p50_latency_s"] = round(lats[mid], 2)

    # Sanity check: cold baseline HOT% <= 15%
    sanity_passed = True
    sanity_notes = []
    for cold_cid in COLD_CONDITIONS:
        if cold_cid in by_cond:
            hot_pct = by_cond[cold_cid]["hot_pct"]
            if hot_pct > 15:
                sanity_notes.append(
                    f"WARN: {cold_cid} HOT%={hot_pct} > 15% threshold — "
                    f"possible corpus contamination. Review before publishing."
                )
                sanity_passed = False
    if sanity_passed:
        sanity_notes.append("Cold baseline sanity check PASSED (all cold HOT% <= 15%).")

    agg = {
        "session": "K444",
        "corpus_id": "R11-CANONICAL-K444",
        "total_records": len(valid),
        "by_condition": by_cond,
        "sanity_check": {"passed": sanity_passed, "notes": sanity_notes},
    }

    agg_path = results_dir / "aggregate_r11.json"
    agg_path.write_text(json.dumps(agg, indent=2), encoding="utf-8")

    # Generate markdown summary
    md = _render_markdown(by_cond, sanity_notes, valid)
    md_path = results_dir / "summary_r11.md"
    md_path.write_text(md, encoding="utf-8")

    print(f"\n  Written: {agg_path.name}, {md_path.name}")
    print(f"\n{md}")
    return agg


def _render_markdown(by_cond: dict, sanity_notes: list[str], records: list[dict]) -> str:
    total_cost = sum(r.get("cost_usd", 0.0) for r in records if "error" not in r)

    header = "# R11 Cross-Vendor Memory Benchmark Results\n\n"
    header += f"**Session:** K444 (B119, 2026-04-23)  \n"
    header += f"**Corpus:** R11-CANONICAL-K444 (50 facts, 4,150 words)  \n"
    header += f"**Total spend:** ${total_cost:.4f}  \n\n"

    table_header = (
        "| Condition | Model | HOT% | HIT% | MISS% | Ret-correct% | $/query | $/correct | p50-lat |\n"
        "|---|---|---|---|---|---|---|---|---|\n"
    )

    rows = []
    display_order = CONDITION_DISPLAY_ORDER + [
        c for c in by_cond if c not in CONDITION_DISPLAY_ORDER
    ]

    for cid in display_order:
        b = by_cond.get(cid)
        if not b:
            continue
        ret_pct = f"{b['retrieval_correct_pct']}%" if b.get("retrieval_correct_pct") is not None else "—"
        cost_correct = f"${b['cost_per_correct']:.4f}" if b.get("cost_per_correct") is not None else "—"
        p50 = f"{b.get('p50_latency_s', '?')}s"
        model_short = b["model"].replace("claude-", "").replace("-20251001", "").replace("-20260301", "")
        rows.append(
            f"| **{cid}** | {model_short} | {b['hot_pct']}% | {b['hit_pct']}% | "
            f"{b['miss_pct']}% | {ret_pct} | ${b['cost_per_q']:.5f} | {cost_correct} | {p50} |"
        )

    sanity_block = "\n## Sanity Check\n\n" + "\n".join(f"- {n}" for n in sanity_notes)

    footer = "\n\n---\n*Publication hold: internal only until Bishop Prov 14 green-light.*\n"

    return header + table_header + "\n".join(rows) + sanity_block + footer


def main() -> None:
    p = argparse.ArgumentParser(description="R11 summarizer")
    p.add_argument("--results", required=True, help="Results directory path")
    args = p.parse_args()

    results_dir = Path(args.results)
    if not results_dir.is_absolute():
        results_dir = SCRIPT_DIR / results_dir

    summarize(results_dir)


if __name__ == "__main__":
    main()
