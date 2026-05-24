"""
merge_results_summary_5cond_b131.py

Merges 4-condition backup (results_summary_4cond_backup.json) with current
1-condition (results_summary.json — gemini_flash only after second run)
to produce a clean 5-condition canonical results_summary.json.

Filed B131 by Bishop because the runner overwrites the summary file on
every invocation; running gemini_flash separately produced a 1-condition
summary. The 4-condition backup + current 1-condition gemini = full 5-condition
canonical for "Index Beats Model" measured-vs-projected reporting.
"""

import json
from pathlib import Path

OUTPUT_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/r10_cross_vendor/results_r11v2_K528_v2_post_ingest"
)
BACKUP_4COND = OUTPUT_DIR / "results_summary_4cond_backup.json"
CURRENT_GEMINI = OUTPUT_DIR / "results_summary.json"
MERGED_OUT = OUTPUT_DIR / "results_summary.json"  # Overwrite with merged 5-condition


def main():
    backup = json.loads(BACKUP_4COND.read_text(encoding="utf-8"))
    current = json.loads(CURRENT_GEMINI.read_text(encoding="utf-8"))

    if not (
        backup.get("bank") == current.get("bank")
        and backup.get("corpus") == current.get("corpus")
    ):
        raise SystemExit("FATAL: bank/corpus mismatch between backup and current — aborting merge")

    # Use the most-recent run_ts as the merged ts (gemini_flash was the latest)
    merged = {
        "run_ts": current["run_ts"],
        "bank": current["bank"],
        "corpus": current["corpus"],
        "total_records": backup["total_records"] + current["total_records"],
        "total_graded": backup["total_graded"] + current["total_graded"],
        "vendor_spend_usd": dict(backup["vendor_spend_usd"]),
        "total_spend_usd": backup["total_spend_usd"] + current["total_spend_usd"],
        "conditions": list(backup["conditions"]) + list(current["conditions"]),
    }

    # Merge vendor spend
    for vendor, spend in current["vendor_spend_usd"].items():
        merged["vendor_spend_usd"][vendor] = (
            merged["vendor_spend_usd"].get(vendor, 0.0) + spend
        )

    # Sort conditions by $/HOT ascending (cheapest first) for clean reading
    merged["conditions"].sort(key=lambda c: c.get("cost_per_hot_usd", float("inf")))

    MERGED_OUT.write_text(json.dumps(merged, indent=2), encoding="utf-8")

    print(f"Merged 5-condition summary written to {MERGED_OUT}")
    print(f"  Total records: {merged['total_records']}")
    print(f"  Total spend: ${merged['total_spend_usd']:.4f}")
    print(f"  Vendor spend: {merged['vendor_spend_usd']}")
    print()
    print("Conditions sorted by $/HOT (ascending):")
    for c in merged["conditions"]:
        print(
            f"  {c['condition']:<35s}  HOT={c['hot_pct']:5.1f}%  "
            f"$/HOT=${c['cost_per_hot_usd']:.4f}  n={c['n']}"
        )


if __name__ == "__main__":
    main()
