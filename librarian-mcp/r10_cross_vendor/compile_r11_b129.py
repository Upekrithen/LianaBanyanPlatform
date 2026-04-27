#!/usr/bin/env python3
"""
R11 K444/B129 Definitive Comparison Compiler
=============================================
Assembles the complete R11 cross-vendor comparison table from:

  ① results_r11_K444_B129/      — vendor-native memory products (K471 bank)
      cold_gpt4o_mini.jsonl, cold_gemini_flash.jsonl
      chatgpt_memory.jsonl, chatgpt_memory_gpt5.jsonl
      claude_projects_sonnet.jsonl, claude_projects_opus.jsonl
      gemini_gems.jsonl, perplexity_spaces.jsonl

  ② results_r11_k471_realignment/ — LB cold baseline + Knight Cathedral Haiku
      cold_haiku.jsonl (K471 bank, 0% HOT baseline sanity check)
      lb_cathedral_haiku.jsonl (K471 bank, 18% HOT Knight Cathedral)

  ③ results_r11_k472_phaseB/    — LB conditions on K471 bank (Bishop + Knight)
      anthropic_haiku_knight.jsonl → lb_cathedral_haiku_knight   (88% HOT)
      anthropic_haiku_bishop.jsonl → lb_cathedral_haiku_bishop   (84% HOT)
      anthropic_opus_knight.jsonl  → lb_cathedral_opus_knight    (80% HOT)
      anthropic_opus_bishop.jsonl  → lb_cathedral_opus_bishop    (80% HOT)

  ④ results_r11_k474_union/     — Best LB result: Bishop Cathedral + Haiku
      anthropic_haiku_bishop.jsonl → lb_best_bishop_haiku        (94% HOT)

Usage:
  python compile_r11_b129.py [--out results_r11_K444_B129/definitive_comparison.json]

Outputs:
  - JSON: machine-readable aggregate
  - Markdown: human-readable comparison table (printed to stdout)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Source files — each entry: (condition_id, display_label, jsonl_path, bank)
# ---------------------------------------------------------------------------
SOURCES: list[tuple[str, str, Path]] = [
    # Vendor-native memory products — K471 bank (B129 run)
    ("cold_haiku",              "Cold — Haiku 4.5 (no corpus)",
     SCRIPT_DIR / "results_r11_k471_realignment" / "cold_haiku.jsonl"),
    ("cold_gpt4o_mini",         "Cold — GPT-4o-mini (no corpus)",
     SCRIPT_DIR / "results_r11_K444_B129" / "cold_gpt4o_mini.jsonl"),
    ("cold_gemini_flash",       "Cold — Gemini 2.5 Flash (no corpus)",
     SCRIPT_DIR / "results_r11_K444_B129" / "cold_gemini_flash.jsonl"),
    ("chatgpt_memory",          "ChatGPT Memory — GPT-4o",
     SCRIPT_DIR / "results_r11_K444_B129" / "chatgpt_memory.jsonl"),
    ("chatgpt_memory_gpt5",     "ChatGPT Memory — GPT-4.1",
     SCRIPT_DIR / "results_r11_K444_B129" / "chatgpt_memory_gpt5.jsonl"),
    ("claude_projects_sonnet",  "Claude Projects — Sonnet 4.6",
     SCRIPT_DIR / "results_r11_K444_B129" / "claude_projects_sonnet.jsonl"),
    ("claude_projects_opus",    "Claude Projects — Opus 4.7",
     SCRIPT_DIR / "results_r11_K444_B129" / "claude_projects_opus.jsonl"),
    ("gemini_gems",             "Gemini Gems — 2.5 Pro",
     SCRIPT_DIR / "results_r11_K444_B129" / "gemini_gems.jsonl"),
    ("perplexity_spaces",       "Perplexity Spaces — Sonar-Pro",
     SCRIPT_DIR / "results_r11_K444_B129" / "perplexity_spaces.jsonl"),
    # LB Cathedral conditions — K471 bank (K471 + K472 + K474 runs)
    ("lb_cathedral_haiku_k471", "LB Cathedral — Knight + Haiku (K471)",
     SCRIPT_DIR / "results_r11_k471_realignment" / "lb_cathedral_haiku.jsonl"),
    ("lb_cathedral_haiku_knight","LB Cathedral — Knight + Haiku (K472)",
     SCRIPT_DIR / "results_r11_k472_phaseB" / "anthropic_haiku_knight.jsonl"),
    ("lb_cathedral_haiku_bishop","LB Cathedral — Bishop + Haiku (K472)",
     SCRIPT_DIR / "results_r11_k472_phaseB" / "anthropic_haiku_bishop.jsonl"),
    ("lb_cathedral_opus_knight", "LB Cathedral — Knight + Opus (K472)",
     SCRIPT_DIR / "results_r11_k472_phaseB" / "anthropic_opus_knight.jsonl"),
    ("lb_cathedral_opus_bishop", "LB Cathedral — Bishop + Opus (K472)",
     SCRIPT_DIR / "results_r11_k472_phaseB" / "anthropic_opus_bishop.jsonl"),
    ("lb_cathedral_best_bishop", "LB Cathedral — Bishop + Haiku BEST (K474)",
     SCRIPT_DIR / "results_r11_k474_union" / "anthropic_haiku_bishop.jsonl"),
]


def _load(path: Path) -> list[dict]:
    if not path.exists():
        return []
    records = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            pass  # partial trailing line — skip
    return records


def _stats(records: list[dict]) -> dict:
    valid = [r for r in records if "grade" in r and "error" not in r]
    errs  = [r for r in records if "error" in r]
    n     = len(valid)
    hot   = sum(1 for r in valid if r["grade"] == "HOT")
    hit   = sum(1 for r in valid if r["grade"] == "HIT")
    miss  = sum(1 for r in valid if r["grade"] == "MISS")
    cost  = sum(r.get("cost_usd", 0) for r in valid)
    lats  = sorted(r["latency_s"] for r in valid if r.get("latency_s") is not None)
    p50   = lats[len(lats) // 2] if lats else None
    return {
        "n": n,
        "errors": len(errs),
        "HOT": hot,
        "HIT": hit,
        "MISS": miss,
        "hot_pct": round(100.0 * hot / n, 1) if n else None,
        "hit_pct": round(100.0 * hit / n, 1) if n else None,
        "miss_pct": round(100.0 * miss / n, 1) if n else None,
        "cost_usd": round(cost, 4),
        "cost_per_q": round(cost / n, 5) if n else None,
        "cost_per_hot": round(cost / hot, 4) if hot else None,
        "p50_latency_s": round(p50, 2) if p50 else None,
    }


def compile_table() -> tuple[list[dict], dict]:
    rows = []
    missing = []
    for cid, label, path in SOURCES:
        records = _load(path)
        if not records:
            missing.append(cid)
        st = _stats(records)
        rows.append({"condition_id": cid, "label": label, "path": str(path), **st})

    aggregate = {
        "bank_version": "2.0.0-sealed (K471)",
        "corpus_id": "R11-CANONICAL-K471",
        "sources_loaded": len(rows) - len(missing),
        "sources_missing": missing,
        "conditions": rows,
    }
    return rows, aggregate


def _fmt_pct(v) -> str:
    return f"{v:.1f}%" if v is not None else "—"


def _fmt_cost(v) -> str:
    return f"${v:.4f}" if v is not None else "—"


def print_table(rows: list[dict]) -> None:
    header = f"{'Condition':<42} {'HOT%':>6} {'HIT%':>6} {'MISS%':>6} {'$/q':>8} {'$/HOT':>8} {'p50':>6} {'n':>4}"
    print(header)
    print("-" * len(header))
    for r in rows:
        label = r["label"][:42]
        print(
            f"{label:<42} {_fmt_pct(r['hot_pct']):>6} {_fmt_pct(r['hit_pct']):>6} "
            f"{_fmt_pct(r['miss_pct']):>6} {_fmt_cost(r['cost_per_q']):>8} "
            f"{_fmt_cost(r['cost_per_hot']):>8} "
            f"{(str(r['p50_latency_s'])+'s') if r['p50_latency_s'] else '—':>6} "
            f"{r['n']:>4}"
        )


def main() -> None:
    import argparse
    p = argparse.ArgumentParser(description="Compile definitive R11/K444/B129 comparison table")
    p.add_argument("--out", default=str(SCRIPT_DIR / "results_r11_K444_B129" / "definitive_comparison.json"))
    args = p.parse_args()

    rows, aggregate = compile_table()

    print("\n=== R11 DEFINITIVE COMPARISON TABLE (K444/B129, K471 bank) ===\n")
    print_table(rows)

    if aggregate["sources_missing"]:
        print(f"\nWARNING: Missing sources (run not yet complete): {aggregate['sources_missing']}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(aggregate, indent=2), encoding="utf-8")
    print(f"\nAggregate written to: {out_path}")


if __name__ == "__main__":
    main()
