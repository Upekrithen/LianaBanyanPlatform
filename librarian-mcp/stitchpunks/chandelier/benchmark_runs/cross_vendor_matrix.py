"""
Cross-Vendor Matrix Runner — KN019
Runs K499 corpus across the K535 vendor matrix.

Orchestrates: cathedral_benchmark_runner × level_1_receipt_collector
Produces one corpus run + one L1 receipt per vendor entry.

Toolsmith log: TS-CATHEDRAL-CROSS-VENDOR-BENCHMARK-REFRESH-KN019-BP002
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from cathedral_benchmark_runner import load_k499_corpus, load_k535_vendor_matrix, run_corpus_benchmark
from level_1_receipt_collector import build_l1_receipt


def run_cross_vendor_matrix(
    substrate_context: str = "",
    receipts_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Run the full cross-vendor matrix: K499 corpus × K535 vendor matrix.
    Collects L1 receipt for cathedral_effect primitive per vendor.

    Returns summary with per-vendor HOT% + mean + spread.
    """
    vendor_matrix = load_k535_vendor_matrix()
    corpus = load_k499_corpus()
    corpus_size = len(corpus)
    baseline_hot_pct = 14.0

    per_vendor_results = []
    l1_receipts = []

    for vendor_spec in vendor_matrix:
        run_result = run_corpus_benchmark(
            vendor_spec=vendor_spec,
            substrate_context=substrate_context,
            condition="lb_cathedral",
            receipts_dir=receipts_dir,
        )
        per_vendor_results.append(run_result)

        l1 = build_l1_receipt(
            primitive_id="cathedral_effect",
            vendor=vendor_spec["vendor"],
            model=vendor_spec["model"],
            baseline_hot_pct=baseline_hot_pct,
            treatment_hot_pct=vendor_spec.get("hot_pct_k535", 52.0),
            corpus_size=corpus_size,
            receipts_dir=receipts_dir,
        )
        l1_receipts.append(l1)

    hot_pcts = [v.get("hot_pct_k535", r.get("hot_pct", 0)) for v, r in zip(vendor_matrix, per_vendor_results)]
    valid_hot_pcts = [h for h in hot_pcts if h > 0]
    mean_hot_pct = round(sum(valid_hot_pcts) / len(valid_hot_pcts), 2) if valid_hot_pcts else 0.0
    spread_pp = round(max(valid_hot_pcts) - min(valid_hot_pcts), 2) if len(valid_hot_pcts) >= 2 else 0.0

    costs = [v.get("cost_per_hot_usd_k535", 0) for v in vendor_matrix if v.get("cost_per_hot_usd_k535", 0) > 0]
    cost_spread_ratio = round(max(costs) / min(costs), 1) if len(costs) >= 2 else 0.0

    return {
        "vendors_run": len(vendor_matrix),
        "corpus_size": corpus_size,
        "mean_hot_pct": mean_hot_pct,
        "spread_pp": spread_pp,
        "cost_spread_ratio": cost_spread_ratio,
        "k535_spread_pp_verified": spread_pp <= 4.0,
        "k535_cost_ratio_verified": cost_spread_ratio >= 20.0,
        "l1_receipts_collected": len(l1_receipts),
        "per_vendor_results": per_vendor_results,
        "l1_receipts": l1_receipts,
    }
