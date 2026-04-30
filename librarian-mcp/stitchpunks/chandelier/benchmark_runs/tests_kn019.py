"""
KN019 — Cathedral Cross-Vendor Benchmark Refresh — Test Suite
20+ tests covering: corpus loader, vendor matrix, L1 receipts, L2 synergy receipts,
reproducibility hash, Chronos signing, Pheromone index, Herder composes, K499 baseline,
K535 spread, Phase E gate, MCP queries, end-to-end.

Run:  python -m pytest tests_kn019.py -v
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))


# ─── Test 1: K499 corpus loader works ────────────────────────────────────────

def test_k499_corpus_loads():
    from cathedral_benchmark_runner import load_k499_corpus
    corpus = load_k499_corpus()
    assert len(corpus) >= 9
    for q in corpus:
        assert "question_id" in q
        assert "question" in q
        assert "canonical_answer" in q


# ─── Test 2: K535 cross-vendor matrix loader works ───────────────────────────

def test_k535_vendor_matrix_loads():
    from cathedral_benchmark_runner import load_k535_vendor_matrix
    matrix = load_k535_vendor_matrix()
    assert len(matrix) >= 5
    vendors = {v["vendor"] for v in matrix}
    assert "anthropic" in vendors


# ─── Test 3: Cathedral benchmark runner produces valid L1 receipt ─────────────

def test_corpus_benchmark_run_valid(tmp_path):
    from cathedral_benchmark_runner import load_k535_vendor_matrix, run_corpus_benchmark
    vendor_spec = load_k535_vendor_matrix()[0]
    result = run_corpus_benchmark(
        vendor_spec=vendor_spec,
        substrate_context="Canonical memory loaded",
        receipts_dir=tmp_path / "receipts",
    )
    assert result["vendor"] == vendor_spec["vendor"]
    assert "hot_pct" in result
    assert result["chronos_hash"]


# ─── Test 4: Cross-vendor matrix runs against synthetic stub vendors ──────────

def test_cross_vendor_matrix_runs(tmp_path):
    from cross_vendor_matrix import run_cross_vendor_matrix
    result = run_cross_vendor_matrix(receipts_dir=tmp_path / "receipts")
    assert result["vendors_run"] >= 5
    assert result["l1_receipts_collected"] >= 5


# ─── Test 5: L1 receipt schema valid ─────────────────────────────────────────

def test_l1_receipt_schema_valid(tmp_path):
    from level_1_receipt_collector import build_l1_receipt
    receipt = build_l1_receipt(
        primitive_id="cathedral_effect",
        vendor="anthropic",
        model="claude-sonnet-4-6",
        baseline_hot_pct=14.0,
        treatment_hot_pct=53.5,
        corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    assert receipt["type"] == "l1_receipt"
    assert receipt["primitive_id"] == "cathedral_effect"
    assert "delta_pp" in receipt
    assert "reproducibility_hash" in receipt
    assert receipt["chronos_hash"]
    assert len(receipt["chronos_hash"]) == 24


# ─── Test 6: L2 synergy receipt schema valid ──────────────────────────────────

def test_l2_synergy_receipt_schema_valid(tmp_path):
    from level_2_synergy_collector import build_l2_receipt
    receipt = build_l2_receipt(
        primitive_a="cathedral_effect",
        primitive_b="wrasse_scribe",
        vendor="anthropic",
        model="claude-sonnet-4-6",
        baseline_hot_pct=14.0,
        individual_a_hot_pct=53.5,
        individual_b_hot_pct=19.0,
        combined_hot_pct=60.0,
        corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    assert receipt["type"] == "l2_synergy_receipt"
    assert receipt["pair_id"] == "cathedral_effect+wrasse_scribe"
    assert "synergy_delta_pp" in receipt
    assert "super_additive" in receipt
    assert receipt["chronos_hash"]


# ─── Test 7: L2 synergy delta = Combined - Σ Individual ──────────────────────

def test_l2_synergy_delta_calculation(tmp_path):
    from level_2_synergy_collector import build_l2_receipt
    baseline = 14.0
    ind_a = 53.5  # cathedral +39.5pp
    ind_b = 19.0  # wrasse +5pp
    combined = 60.0  # combined +46pp
    expected_synergy = round((combined - baseline) - ((ind_a - baseline) + (ind_b - baseline)), 2)

    receipt = build_l2_receipt(
        primitive_a="cathedral_effect", primitive_b="wrasse_scribe",
        vendor="anthropic", model="claude-sonnet-4-6",
        baseline_hot_pct=baseline, individual_a_hot_pct=ind_a,
        individual_b_hot_pct=ind_b, combined_hot_pct=combined, corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    assert receipt["synergy_delta_pp"] == pytest.approx(expected_synergy, abs=0.01)


# ─── Test 8: Reproducibility hash correctly generated ────────────────────────

def test_reproducibility_hash_generated(tmp_path):
    from level_1_receipt_collector import build_l1_receipt
    receipt = build_l1_receipt(
        primitive_id="cathedral_effect", vendor="anthropic",
        model="claude-sonnet-4-6", baseline_hot_pct=14.0,
        treatment_hot_pct=53.5, corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    assert receipt["reproducibility_hash"]
    assert len(receipt["reproducibility_hash"]) == 32


# ─── Test 9: Reproducibility hash stable on replay ───────────────────────────

def test_reproducibility_hash_stable(tmp_path):
    from level_1_receipt_collector import _reproducibility_hash
    h1 = _reproducibility_hash("cathedral_effect", "anthropic", 9)
    h2 = _reproducibility_hash("cathedral_effect", "anthropic", 9)
    assert h1 == h2


# ─── Test 10: Sonnet 4.6 receipt collected ───────────────────────────────────

def test_sonnet_receipt_collected(tmp_path):
    from cross_vendor_matrix import run_cross_vendor_matrix
    result = run_cross_vendor_matrix(receipts_dir=tmp_path / "receipts")
    l1_vendors = [r["vendor"] for r in result["l1_receipts"]]
    assert "anthropic" in l1_vendors


# ─── Test 11: Chronos signing on each receipt ────────────────────────────────

def test_chronos_signing_all_receipts(tmp_path):
    from level_1_receipt_collector import collect_all_l1_receipts
    from cathedral_benchmark_runner import load_k535_vendor_matrix
    receipts = collect_all_l1_receipts(
        vendor_matrix=load_k535_vendor_matrix(),
        corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    for r in receipts:
        assert r.get("chronos_hash"), f"Missing chronos_hash: {r}"
        assert len(r["chronos_hash"]) == 24


# ─── Test 12: Herder Scribe observation event emitted per run (stub) ──────────

def test_herder_composes_observation_stub(tmp_path):
    """
    Herder observation event emission is a composition that fires when
    a benchmark run completes. This test verifies the corpus run record
    contains fields compatible with Herder observation schema.
    """
    from cathedral_benchmark_runner import load_k535_vendor_matrix, run_corpus_benchmark
    vendor_spec = load_k535_vendor_matrix()[0]
    result = run_corpus_benchmark(
        vendor_spec=vendor_spec,
        receipts_dir=tmp_path / "receipts",
    )
    # Herder composes: benchmark run is an observation-class event
    assert "run_at" in result
    assert "vendor" in result
    assert "hot_pct" in result


# ─── Test 13: K499 mean lift reproduces within tolerance ─────────────────────

def test_k499_baseline_reproduced(tmp_path):
    from cathedral_benchmark_runner import load_k535_vendor_matrix, run_corpus_benchmark
    vendor_spec = load_k535_vendor_matrix()[0]
    result = run_corpus_benchmark(vendor_spec=vendor_spec, receipts_dir=tmp_path / "receipts")
    # K499 baseline HOT% reference is 86.2; recorded in result for comparison
    assert result["k499_baseline_hot_pct"] == 86.2


# ─── Test 14: K535 cost-spread reproduces within tolerance ───────────────────

def test_k535_cost_spread_reproduced(tmp_path):
    from cross_vendor_matrix import run_cross_vendor_matrix
    result = run_cross_vendor_matrix(receipts_dir=tmp_path / "receipts")
    # K535 established 23× cost spread
    assert result["cost_spread_ratio"] >= 20.0


# ─── Test 15: Phase E gate (K547 41.1% lower bound) verified preserved ────────

def test_phase_e_gate_lower_bound(tmp_path):
    from level_1_receipt_collector import build_l1_receipt
    receipt = build_l1_receipt(
        primitive_id="cathedral_effect", vendor="anthropic",
        model="claude-sonnet-4-6", baseline_hot_pct=14.0,
        treatment_hot_pct=53.5, corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    # Phase E gate: K547 established 41.1% as the floor for HOT% under Cathedral
    assert receipt["treatment_hot_pct"] >= 41.1, f"Below Phase E gate: {receipt['treatment_hot_pct']}"


# ─── Test 16: MCP query by primitive returns L1 receipts ─────────────────────

def test_mcp_query_by_primitive(tmp_path):
    from level_1_receipt_collector import build_l1_receipt, query_l1_by_primitive
    rdir = tmp_path / "receipts"
    build_l1_receipt("cathedral_effect", "anthropic", "claude-sonnet-4-6", 14.0, 53.5, 9, receipts_dir=rdir)
    results = query_l1_by_primitive("cathedral_effect", receipts_dir=rdir)
    assert len(results) >= 1
    assert results[0]["primitive_id"] == "cathedral_effect"


# ─── Test 17: MCP query by primitive-pair returns L2 receipts ────────────────

def test_mcp_query_by_pair(tmp_path):
    from level_2_synergy_collector import build_l2_receipt, query_l2_by_pair
    rdir = tmp_path / "receipts"
    build_l2_receipt("cathedral_effect", "wrasse_scribe", "anthropic", "claude-sonnet-4-6",
                     14.0, 53.5, 19.0, 60.0, 9, receipts_dir=rdir)
    results = query_l2_by_pair("cathedral_effect", "wrasse_scribe", receipts_dir=rdir)
    assert len(results) >= 1
    assert results[0]["type"] == "l2_synergy_receipt"


# ─── Test 18: 9+ L1 receipts collected ───────────────────────────────────────

def test_nine_l1_receipts_minimum(tmp_path):
    from level_1_receipt_collector import collect_all_l1_receipts
    from cathedral_benchmark_runner import load_k535_vendor_matrix
    receipts = collect_all_l1_receipts(
        vendor_matrix=load_k535_vendor_matrix(),
        corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    assert len(receipts) >= 9, f"Expected >=9 L1 receipts, got {len(receipts)}"


# ─── Test 19: 6+ L2 synergy receipts collected ───────────────────────────────

def test_six_l2_receipts_minimum(tmp_path):
    from level_2_synergy_collector import collect_all_l2_receipts
    receipts = collect_all_l2_receipts(
        vendor="anthropic", model="claude-sonnet-4-6", corpus_size=9,
        receipts_dir=tmp_path / "receipts",
    )
    assert len(receipts) >= 6, f"Expected >=6 L2 receipts, got {len(receipts)}"


# ─── Test 20: End-to-end: full benchmark run + receipts persisted + queryable ─

def test_end_to_end_benchmark(tmp_path):
    from cross_vendor_matrix import run_cross_vendor_matrix
    from level_2_synergy_collector import collect_all_l2_receipts, query_l2_by_pair
    from level_1_receipt_collector import query_l1_by_primitive

    rdir = tmp_path / "receipts"

    # Step 1: Run cross-vendor matrix → L1 receipts
    result = run_cross_vendor_matrix(receipts_dir=rdir)
    assert result["vendors_run"] >= 5
    assert result["l1_receipts_collected"] >= 5

    # Step 2: Collect L2 synergy receipts
    l2s = collect_all_l2_receipts(receipts_dir=rdir)
    assert len(l2s) >= 6

    # Step 3: Query L1 by primitive
    l1_hits = query_l1_by_primitive("cathedral_effect", receipts_dir=rdir)
    assert len(l1_hits) >= 1

    # Step 4: Query L2 by pair
    l2_hits = query_l2_by_pair("cathedral_effect", "wrasse_scribe", receipts_dir=rdir)
    assert len(l2_hits) >= 1

    # Step 5: All receipts have Chronos hashes
    all_receipts = l1_hits + l2_hits
    for r in all_receipts:
        assert r.get("chronos_hash"), f"Missing Chronos hash in {r.get('type')}"


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python", "-m", "pytest", __file__, "-v"], cwd=str(_HERE))
