#!/usr/bin/env python3
"""Compute K521 final results: cold vs cathedral lift, §5.4 cross-vendor JSONL."""
import json
import math
from pathlib import Path
from datetime import datetime, timezone

RESULTS_DIR = Path(__file__).parent / "results_local_llm_k521"

def read_jsonl(path):
    return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]

def grade_stats(records):
    graded = [r for r in records if r.get("grade") in ("HOT", "HIT", "MISS")]
    n = len(graded)
    hot  = sum(1 for r in graded if r["grade"] == "HOT")
    hit  = sum(1 for r in graded if r["grade"] == "HIT")
    miss = sum(1 for r in graded if r["grade"] == "MISS")
    cost = sum(r.get("cost_usd", 0) for r in records)
    lats = [r["latency_s"] for r in records if r.get("latency_s", 0) > 0]
    in_tok  = sum(r.get("input_tokens", 0) for r in records)
    out_tok = sum(r.get("output_tokens", 0) for r in records)
    return {
        "n": n,
        "hot": hot, "hit": hit, "miss": miss,
        "hot_pct": round(100 * hot / n, 1) if n else 0,
        "hit_pct": round(100 * hit / n, 1) if n else 0,
        "miss_pct": round(100 * miss / n, 1) if n else 0,
        "avg_latency_s": round(sum(lats) / len(lats), 2) if lats else 0,
        "total_cost_usd": round(cost, 4),
        "cost_per_call_usd": round(cost / n, 5) if n else 0,
        "total_input_tokens": in_tok,
        "total_output_tokens": out_tok,
    }

cold_path = RESULTS_DIR / "local_llama-3.3-70b-versatile_cold.jsonl"
cath_path = RESULTS_DIR / "local_meta-llama_Llama-3.3-70B-Instruct-Turbo_cathedral.jsonl"

cold_recs = read_jsonl(cold_path)
cath_recs = read_jsonl(cath_path)

cold = grade_stats(cold_recs)
cath = grade_stats(cath_recs)

lift = round(cath["hot_pct"] - cold["hot_pct"], 1)

print("=" * 68)
print("K521 FINAL RESULTS — Llama 3.3 70B — Cranewell R12 bank (n=50)")
print("=" * 68)
print(f"\nCOLD baseline  (Groq llama-3.3-70b-versatile, cloud):")
print(f"  n={cold['n']}  HOT={cold['hot_pct']}%  HIT={cold['hit_pct']}%  MISS={cold['miss_pct']}%")
print(f"  avg_lat={cold['avg_latency_s']}s  cost/call=${cold['cost_per_call_usd']}  total=${cold['total_cost_usd']}")
print(f"  tokens: in={cold['total_input_tokens']:,}  out={cold['total_output_tokens']:,}")

print(f"\nCATHEDRAL  (Together AI meta-llama/Llama-3.3-70B-Instruct-Turbo, cloud):")
print(f"  n={cath['n']}  HOT={cath['hot_pct']}%  HIT={cath['hit_pct']}%  MISS={cath['miss_pct']}%")
print(f"  avg_lat={cath['avg_latency_s']}s  cost/call=${cath['cost_per_call_usd']}  total=${cath['total_cost_usd']}")
print(f"  tokens: in={cath['total_input_tokens']:,}  out={cath['total_output_tokens']:,}")

print(f"\nCathedral lift:  +{lift}pp HOT")
print(f"  K511 ref (Llama 3.1 8B local, +80.0pp):   70B {'EXCEEDS' if lift >= 80 else 'TRAILS by ' + str(round(80 - lift, 1)) + 'pp'}")
print(f"  R13 ref (8 cloud models, +86.2pp):         70B {'EXCEEDS' if lift >= 86.2 else 'TRAILS by ' + str(round(86.2 - lift, 1)) + 'pp'}")
print(f"  R10 ref (8 cross-vendor, +86.1pp):         70B {'EXCEEDS' if lift >= 86.1 else 'TRAILS by ' + str(round(86.1 - lift, 1)) + 'pp'}")

print("\n" + "=" * 68)
print("§5.4 CROSS-VENDOR TABLE ROW — K521")
print("=" * 68)

# Build the §5.4 JSONL entries
cross_vendor_rows = [
    {
        "benchmark": "K521",
        "date": "2026-04-27",
        "model_family": "Llama 3.3 70B",
        "model_name": "llama-3.3-70b-versatile",
        "vendor": "Groq",
        "tier": "paid",
        "condition": "cold",
        "n": cold["n"],
        "hot_pct": cold["hot_pct"],
        "hit_pct": cold["hit_pct"],
        "miss_pct": cold["miss_pct"],
        "avg_latency_s": cold["avg_latency_s"],
        "cost_per_call_usd": cold["cost_per_call_usd"],
        "total_cost_usd": cold["total_cost_usd"],
        "total_input_tokens": cold["total_input_tokens"],
        "total_output_tokens": cold["total_output_tokens"],
        "notes": "cold_baseline_no_cathedral_substrate",
    },
    {
        "benchmark": "K521",
        "date": "2026-04-27",
        "model_family": "Llama 3.3 70B",
        "model_name": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        "vendor": "Together AI",
        "tier": "paid",
        "condition": "cathedral",
        "n": cath["n"],
        "hot_pct": cath["hot_pct"],
        "hit_pct": cath["hit_pct"],
        "miss_pct": cath["miss_pct"],
        "avg_latency_s": cath["avg_latency_s"],
        "cost_per_call_usd": cath["cost_per_call_usd"],
        "total_cost_usd": cath["total_cost_usd"],
        "total_input_tokens": cath["total_input_tokens"],
        "total_output_tokens": cath["total_output_tokens"],
        "cathedral_lift_pp": lift,
        "notes": "cross_vendor_cold_groq_cath_together_same_model_weights",
    },
]

out_path = RESULTS_DIR / "k521_cross_vendor_s54.jsonl"
with open(out_path, "w", encoding="utf-8") as f:
    for row in cross_vendor_rows:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")
print(f"\nWrote §5.4 JSONL: {out_path}")
for row in cross_vendor_rows:
    print(f"  {json.dumps(row)}")
