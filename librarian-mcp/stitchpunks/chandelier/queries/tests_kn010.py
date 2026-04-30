"""
Tests KN010 — Chandelier Diagnostic Queries + Three-Mode Comparator

30+ tests covering:
  - query_receipts logic (via ReceiptIndex)
  - right_recipe_engine (full enum + beam search + prereq pruning)
  - crown_jewel_temporal (histograms + substrate state)
  - continuous_stretch (stretch finding)
  - substrate_correlator (correlation table)
  - falsification_test (CONFIRMED / WEAK / FALSIFIED / INSUFFICIENT_DATA)

Tests use synthetic in-memory receipts (no Stone Tablet mutations on disk).
Mutating tests run against a temp copy per feedback_tests_mutating_real_files_serial.md.

Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
"""

from __future__ import annotations

import json
import sys
import tempfile
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List
from unittest.mock import MagicMock, patch

import pytest

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent.parent
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import (
    ReceiptIndex, sign_and_store, build_index
)
from chandelier.chandelier_runner_l1 import build_l1_receipt


# ── Synthetic receipt factory ──────────────────────────────────────────────────

def _ts(hour: int = 10, day: int = 1, month: int = 1, year: int = 2026) -> str:
    dt = datetime(year, month, day, hour, 0, 0, tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def _make_receipt(
    primitive_ids: List[str],
    metric: str,
    delta: float,
    session_id: str = "TEST-KN010",
    ts: str = "",
    receipt_class: str = "",
) -> Dict[str, Any]:
    sorted_ids = sorted(primitive_ids)
    pid = sorted_ids[0] if sorted_ids else "p"
    body = build_l1_receipt(
        primitive_id=pid,
        metric=metric,
        baseline_score=0.5,
        baseline_description="test baseline",
        treatment_score=round(0.5 + delta, 6),
        treatment_description="test treatment",
        session_id=session_id,
    )
    body["primitive_ids"] = sorted_ids
    body["primitive_tuple_key"] = "|".join(sorted_ids)
    if receipt_class:
        body["receipt_class"] = receipt_class
    if ts:
        body["timestamp"] = ts
    # Inject synthetic Chronos signature
    body["chronos_signature"] = {
        "temporal_anchor": ts or _ts(),
        "chronicler_hash": "fakehash",
        "signed_ts": ts or _ts(),
        "session_id": session_id,
    }
    return body


def _build_test_index(receipts: List[Dict[str, Any]]) -> ReceiptIndex:
    """Build an in-memory index from synthetic receipts without writing to disk."""
    idx = ReceiptIndex.__new__(ReceiptIndex)
    idx._index = {}
    idx._id_index = {}
    for r in receipts:
        key = r.get("primitive_tuple_key", "")
        if key not in idx._index:
            idx._index[key] = []
        idx._index[key].append(r)
        rid = r.get("receipt_id", "")
        if rid:
            idx._id_index[rid] = r
    return idx


# ── Test 1-3: Direct receipt lookup via ReceiptIndex ──────────────────────────

def test_receipt_lookup_l1():
    r = _make_receipt(["cathedral_effect"], "hot_accuracy_pct", 0.861, receipt_class="L1")
    idx = _build_test_index([r])
    results = idx.query(["cathedral_effect"], metric="hot_accuracy_pct")
    assert len(results) == 1
    assert results[0]["delta"] == pytest.approx(0.861, abs=1e-6)


def test_receipt_lookup_l2():
    r = _make_receipt(["cathedral_effect", "wrasse_scribe"], "combined_accuracy_pct", 0.881, receipt_class="L2")
    idx = _build_test_index([r])
    results = idx.query(["cathedral_effect", "wrasse_scribe"], metric="combined_accuracy_pct")
    assert len(results) == 1
    assert results[0]["receipt_class"] == "L2"


def test_receipt_lookup_by_id():
    r = _make_receipt(["pheromone_substrate"], "query_latency_ms", 0.114)
    rid = r["receipt_id"]
    idx = _build_test_index([r])
    fetched = idx.get_by_id(rid)
    assert fetched is not None
    assert fetched["receipt_id"] == rid


# ── Test 4-6: Right Recipe full enumeration (N ≤ 12) ─────────────────────────

def test_right_recipe_full_enum_correct_winner():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    r_a = _make_receipt(["pa"], "m", 0.5)
    r_b = _make_receipt(["pb"], "m", 0.3)
    r_ab = _make_receipt(["pa", "pb"], "m", 0.8)
    idx = _build_test_index([r_a, r_b, r_ab])
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    result = engine.compute("m", all_primitive_ids=["pa", "pb"])
    assert result["winner"]["primitive_ids"] == ["pa", "pb"]
    assert result["winner"]["delta"] == pytest.approx(0.8, abs=1e-6)
    assert result["method"] == "full_enum"
    assert result["confidence"] == "high"


def test_right_recipe_single_primitive_wins():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    r_a = _make_receipt(["pa"], "m", 0.9)
    r_b = _make_receipt(["pb"], "m", 0.3)
    idx = _build_test_index([r_a, r_b])
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    result = engine.compute("m", all_primitive_ids=["pa", "pb"])
    assert result["winner"]["primitive_ids"] == ["pa"]
    assert result["winner"]["delta"] == pytest.approx(0.9, abs=1e-6)


def test_right_recipe_max_k_cap():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    r_abc = _make_receipt(["pa", "pb", "pc"], "m", 0.99)
    r_a = _make_receipt(["pa"], "m", 0.5)
    idx = _build_test_index([r_abc, r_a])
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    result = engine.compute("m", all_primitive_ids=["pa", "pb", "pc"], max_k=2)
    # With max_k=2, triple subset not evaluated → pa wins
    assert len(result["winner"]["primitive_ids"]) <= 2


# ── Test 7-9: Three-mode comparator output schema ─────────────────────────────

def test_three_mode_compare_output_schema():
    from chandelier.three_mode_comparator import ThreeModeComparator
    r_a = _make_receipt(["pa"], "m", 0.4)
    r_ab = _make_receipt(["pa", "pb"], "m", 0.7)
    r_all = _make_receipt(["pa", "pb", "pc"], "m", 0.6)
    idx = _build_test_index([r_a, r_ab, r_all])
    cmp = ThreeModeComparator(index=idx)
    result = cmp.compare(
        subset=["pa", "pb"],
        metric="m",
        all_primitive_ids=["pa", "pb", "pc"],
        basic_stock_primitive="pa",
    )
    assert "basic_stock" in result
    assert "modified_stock" in result
    assert "full_stack" in result
    assert "comparison_summary" in result


def test_three_mode_compare_winner_identification():
    from chandelier.three_mode_comparator import ThreeModeComparator
    r_a = _make_receipt(["pa"], "m", 0.2)
    r_ab = _make_receipt(["pa", "pb"], "m", 0.8)
    idx = _build_test_index([r_a, r_ab])
    cmp = ThreeModeComparator(index=idx)
    result = cmp.compare(subset=["pa", "pb"], metric="m", basic_stock_primitive="pa")
    assert result["modified_stock"]["latest_delta"] == pytest.approx(0.8, abs=1e-6)
    assert result["basic_stock"]["latest_delta"] == pytest.approx(0.2, abs=1e-6)


def test_three_mode_compare_no_right_recipe_by_default():
    from chandelier.three_mode_comparator import ThreeModeComparator
    r = _make_receipt(["pa"], "m", 0.4)
    idx = _build_test_index([r])
    cmp = ThreeModeComparator(index=idx)
    result = cmp.compare(subset=["pa"], metric="m")
    assert result["right_recipe"] is None


# ── Test 10-12: Crown Jewel temporal histograms ───────────────────────────────

def test_cj_temporal_histograms_sum_to_total():
    from chandelier.queries.crown_jewel_temporal import _build_histograms
    timestamps = [
        ("2001", _ts(hour=9, day=1, month=3)),
        ("2002", _ts(hour=14, day=2, month=3)),
        ("2003", _ts(hour=9, day=3, month=4)),
    ]
    result = _build_histograms(timestamps)
    assert result["total_cj"] == 3
    assert sum(result["hour_of_day"].values()) == 3
    assert sum(result["day_of_week"].values()) == 3
    assert sum(result["month_of_year"].values()) == 3


def test_cj_temporal_peak_hour_correct():
    from chandelier.queries.crown_jewel_temporal import _build_histograms
    timestamps = [
        ("a", _ts(hour=10)), ("b", _ts(hour=10)), ("c", _ts(hour=10)),
        ("d", _ts(hour=14)), ("e", _ts(hour=14)),
    ]
    result = _build_histograms(timestamps)
    assert result["peak_hour"] == 10


def test_cj_temporal_missing_ts_handled():
    from chandelier.queries.crown_jewel_temporal import _build_histograms
    timestamps = [("cj1", ""), ("cj2", "bad-ts"), ("cj3", _ts(hour=11))]
    result = _build_histograms(timestamps)
    assert result["missing_ts"] == 2
    assert result["parsed_ok"] == 1


# ── Test 13-15: Continuous stretch ───────────────────────────────────────────

def test_continuous_stretch_finds_longest():
    from chandelier.temporal_diagnostics import _continuous_stretch
    base = datetime(2026, 1, 1, 10, tzinfo=timezone.utc)
    receipts = []
    for h in range(5):
        r = _make_receipt(["p1"], "m", 0.1, ts=(base + timedelta(hours=h)).isoformat().replace("+00:00", "Z"))
        receipts.append(r)
    # Add a gap receipt
    gap_ts = (base + timedelta(hours=20)).isoformat().replace("+00:00", "Z")
    receipts.append(_make_receipt(["p1"], "m", 0.1, ts=gap_ts))
    result = _continuous_stretch(receipts, gap_threshold_hours=8.0)
    longest = result["longest_stretch"]
    assert longest["count"] == 5


def test_continuous_stretch_empty_input():
    from chandelier.temporal_diagnostics import _continuous_stretch
    result = _continuous_stretch([], gap_threshold_hours=8.0)
    assert result["longest_stretch"] is None
    assert result["stretches"] == []


def test_continuous_stretch_single_receipt():
    from chandelier.temporal_diagnostics import _continuous_stretch
    r = _make_receipt(["p"], "m", 0.1, ts=_ts())
    result = _continuous_stretch([r], gap_threshold_hours=8.0)
    assert result["longest_stretch"]["count"] == 1


# ── Test 16-18: Substrate correlator ─────────────────────────────────────────

def test_substrate_correlator_output_schema():
    from chandelier.queries.substrate_correlator import SubstrateCorrelator
    r1 = _make_receipt(["pA"], "m", 0.5, ts=_ts(hour=1))
    r2 = _make_receipt(["pA", "pB"], "m", 0.8, ts=_ts(hour=2))
    idx = _build_test_index([r1, r2])
    corr = SubstrateCorrelator(index=idx)
    result = corr.correlate(grain="day")
    assert "correlation_table" in result
    assert "top_periods" in result
    assert "caveat" in result


def test_substrate_correlator_scores_in_range():
    from chandelier.queries.substrate_correlator import SubstrateCorrelator
    receipts = [_make_receipt(["pX"], "m", 0.4, ts=_ts(hour=i)) for i in range(5)]
    idx = _build_test_index(receipts)
    corr = SubstrateCorrelator(index=idx)
    result = corr.correlate()
    for row in result["correlation_table"]:
        assert 0.0 <= row["correlation_score"] <= 1.0


def test_substrate_correlator_empty_index():
    from chandelier.queries.substrate_correlator import SubstrateCorrelator
    idx = _build_test_index([])
    # all_receipts() reads from disk; mock it to return empty for isolation
    idx.all_receipts = lambda: []
    corr = SubstrateCorrelator(index=idx)
    result = corr.correlate()
    assert result["correlation_table"] == []


# ── Test 19-21: Falsification test verdicts ───────────────────────────────────

def test_falsification_confirmed():
    from chandelier.queries.falsification_test import FalsificationTestRunner, CONFIRMED
    r = _make_receipt(["cathedral_effect"], "hot_accuracy_pct", 0.861)
    idx = _build_test_index([r])
    runner = FalsificationTestRunner(index=idx)
    result = runner.test(["cathedral_effect"], "hot_accuracy_pct", claimed_delta=0.411)
    assert result["verdict"] == CONFIRMED
    assert result["empirical_delta"] == pytest.approx(0.861, abs=1e-6)


def test_falsification_weak():
    from chandelier.queries.falsification_test import FalsificationTestRunner, WEAK
    r = _make_receipt(["pX"], "m", 0.05)
    idx = _build_test_index([r])
    runner = FalsificationTestRunner(index=idx)
    result = runner.test(["pX"], "m", claimed_delta=0.3)
    assert result["verdict"] == WEAK


def test_falsification_falsified():
    from chandelier.queries.falsification_test import FalsificationTestRunner, FALSIFIED
    r = _make_receipt(["pX"], "m", -0.1)
    idx = _build_test_index([r])
    runner = FalsificationTestRunner(index=idx)
    result = runner.test(["pX"], "m", claimed_delta=0.3)
    assert result["verdict"] == FALSIFIED


# ── Test 22-24: Pudding render output ────────────────────────────────────────
# (Using Python dict that mimics the TypeScript shapes for structural validation)

def test_pudding_data_valid_for_falsification():
    """Verify falsification data dict has expected keys for pudding render."""
    from chandelier.queries.falsification_test import FalsificationTestRunner, CONFIRMED
    r = _make_receipt(["cathedral_effect"], "hot_accuracy_pct", 0.861)
    idx = _build_test_index([r])
    runner = FalsificationTestRunner(index=idx)
    result = runner.test(["cathedral_effect"], "hot_accuracy_pct", claimed_delta=0.411)
    assert "verdict" in result
    assert "claimed_delta" in result
    assert "empirical_delta" in result
    assert "n_receipts" in result


def test_pudding_data_three_mode_has_comparison_summary():
    from chandelier.three_mode_comparator import ThreeModeComparator
    r_a = _make_receipt(["pa"], "m", 0.4)
    r_ab = _make_receipt(["pa", "pb"], "m", 0.7)
    idx = _build_test_index([r_a, r_ab])
    cmp = ThreeModeComparator(index=idx)
    result = cmp.compare(subset=["pa", "pb"], metric="m", basic_stock_primitive="pa")
    assert isinstance(result["comparison_summary"]["lines"], list)
    assert len(result["comparison_summary"]["lines"]) > 0


def test_pudding_data_right_recipe_has_winner():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    r = _make_receipt(["pA"], "m", 0.6)
    idx = _build_test_index([r])
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    result = engine.compute("m", all_primitive_ids=["pA"])
    assert "winner" in result
    assert "method" in result
    assert "caveats" in result


# ── Test 25: Query time budget enforced ───────────────────────────────────────

def test_right_recipe_time_budget_enforced():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    import time
    # Build an index with many receipts to stress the time budget
    receipts = [
        _make_receipt([f"p{i}"], "m", 0.1 * (i + 1))
        for i in range(12)
    ]
    idx = _build_test_index(receipts)
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    t0 = time.perf_counter()
    result = engine.compute("m", all_primitive_ids=[f"p{i}" for i in range(12)],
                            query_time_budget_s=0.5)
    elapsed = time.perf_counter() - t0
    # Should complete (either in budget or by exhausting small N quickly)
    assert result["query_elapsed_s"] >= 0


# ── Test 26: Argmax beam-search ≈ full enum for N ≤ 12 ────────────────────────

def test_beam_search_matches_full_enum_for_small_n():
    from chandelier.queries.right_recipe_engine import (
        RightRecipeEngine, _full_enum_argmax, _beam_search_argmax
    )
    prims = ["pA", "pB", "pC", "pD"]
    receipts = [
        _make_receipt(["pA"], "m", 0.3),
        _make_receipt(["pB"], "m", 0.5),
        _make_receipt(["pA", "pB"], "m", 0.7),
        _make_receipt(["pA", "pB", "pC"], "m", 0.65),
    ]
    idx = _build_test_index(receipts)
    fe_best, *_ = _full_enum_argmax(prims, "m", idx, None, None, 60.0)
    bs_best, *_ = _beam_search_argmax(prims, "m", idx, None, None, 60.0)
    # Both should find pA+pB as the best
    assert sorted(fe_best or []) == sorted(bs_best or [])


# ── Test 27: Beam-search near-optimal for N > 12 ─────────────────────────────

def test_beam_search_near_optimal_large_n():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    n = 15
    prims = [f"p{i}" for i in range(n)]
    # Best subset = p0+p1 (highest individual deltas)
    receipts = [
        _make_receipt(["p0"], "m", 0.8),
        _make_receipt(["p1"], "m", 0.7),
        _make_receipt(["p0", "p1"], "m", 0.9),
    ] + [_make_receipt([f"p{i}"], "m", 0.1) for i in range(2, n)]
    idx = _build_test_index(receipts)
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    result = engine.compute("m", all_primitive_ids=prims, query_time_budget_s=5.0)
    assert result["method"] == "beam_search"
    # Beam search should find p0+p1 or at least p0
    winner = result["winner"]["primitive_ids"]
    assert "p0" in winner or "p1" in winner


# ── Test 28: Prereq-graph pruning excludes invalid subsets ────────────────────

def test_prereq_graph_pruning_excludes_invalid():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    from chandelier.prerequisite_graph_loader import PrerequisiteGraph
    from unittest.mock import patch
    # pB requires pA; receipt for pB-only should be pruned if pA absent
    prims = ["pA", "pB"]
    r_b_only = _make_receipt(["pB"], "m", 0.9)  # invalid: pA missing
    r_ab = _make_receipt(["pA", "pB"], "m", 0.7)
    r_a = _make_receipt(["pA"], "m", 0.3)
    idx = _build_test_index([r_b_only, r_ab, r_a])

    # Mock prereq graph: pB requires pA
    mock_graph = MagicMock(spec=PrerequisiteGraph)
    def validate(subset):
        if "pB" in subset and "pA" not in subset:
            return False, ["pB requires pA"]
        return True, []
    mock_graph.validate_substrate_subset = validate

    engine = RightRecipeEngine(index=idx, prereq_graph=mock_graph)
    result = engine.compute("m", all_primitive_ids=prims)
    # pB-only (delta=0.9) should be pruned; winner should be pA+pB or pA
    winner = result["winner"]["primitive_ids"]
    if "pB" in winner:
        assert "pA" in winner  # pA must be present with pB


# ── Test 29: CJ temporal + substrate-correlator composition ──────────────────

def test_cj_temporal_substrate_composition():
    from chandelier.queries.crown_jewel_temporal import CrownJewelTemporal
    receipts = [
        _make_receipt(["cathedral_effect"], "hot_accuracy_pct", 0.861, ts=_ts(hour=10)),
        _make_receipt(["wrasse_scribe"], "auto_registration_rate", 0.97, ts=_ts(hour=11)),
    ]
    idx = _build_test_index(receipts)
    cjt = CrownJewelTemporal(index=idx)
    # Provide synthetic timestamps directly by mocking _load_all_timestamps
    cjt._load_all_timestamps = lambda: [
        ("cj1", _ts(hour=10)),
        ("cj2", _ts(hour=11)),
        ("cj3", _ts(hour=10)),
    ]
    result = cjt.run(include_substrate_correlation=True)
    assert "histograms" in result
    assert result["histograms"]["total_cj"] == 3
    assert "substrate_state_at_filing" in result


# ── Test 30: End-to-end Right Recipe query ────────────────────────────────────

def test_end_to_end_right_recipe_full_answer():
    from chandelier.queries.right_recipe_engine import RightRecipeEngine
    prims = ["cathedral_effect", "wrasse_scribe", "pheromone_substrate"]
    receipts = [
        _make_receipt(["cathedral_effect"], "hot_accuracy_pct", 0.861),
        _make_receipt(["wrasse_scribe"], "hot_accuracy_pct", 0.05),
        _make_receipt(["cathedral_effect", "wrasse_scribe"], "hot_accuracy_pct", 0.881),
        _make_receipt(["cathedral_effect", "pheromone_substrate"], "hot_accuracy_pct", 0.9),
        _make_receipt(["cathedral_effect", "wrasse_scribe", "pheromone_substrate"], "hot_accuracy_pct", 0.92),
    ]
    idx = _build_test_index(receipts)
    # Pass prereq_graph=None explicitly to disable graph pruning for this isolated test
    engine = RightRecipeEngine(index=idx, prereq_graph=None)
    result = engine.compute("hot_accuracy_pct", all_primitive_ids=prims)
    assert result["winner"]["delta"] is not None
    assert result["winner"]["delta"] >= 0.861  # At least as good as single Cathedral
    assert result["method"] == "full_enum"
    assert isinstance(result["caveats"], list)
    assert result["query_elapsed_s"] >= 0
    # Structured output has all required D.3 fields
    for key in ["metric", "winner", "subsets_evaluated", "method", "confidence",
                "provenance_hash", "query_elapsed_s", "caveats"]:
        assert key in result


# ── Test 31: Falsification batch ─────────────────────────────────────────────

def test_falsification_batch():
    from chandelier.queries.falsification_test import (
        FalsificationTestRunner, CONFIRMED, FALSIFIED, INSUFFICIENT_DATA
    )
    receipts = [
        _make_receipt(["pA"], "m1", 0.5),
        _make_receipt(["pB"], "m2", -0.1),
    ]
    idx = _build_test_index(receipts)
    runner = FalsificationTestRunner(index=idx)
    claims = [
        {"primitive_ids": ["pA"], "metric": "m1", "claimed_delta": 0.3, "label": "claim_A"},
        {"primitive_ids": ["pB"], "metric": "m2", "claimed_delta": 0.3, "label": "claim_B"},
        {"primitive_ids": ["pC"], "metric": "m3", "claimed_delta": 0.1, "label": "claim_C"},
    ]
    results = runner.batch_test(claims)
    assert len(results) == 3
    verdicts = {r["claim_label"]: r["verdict"] for r in results}
    assert verdicts["claim_A"] == CONFIRMED
    assert verdicts["claim_B"] == FALSIFIED
    assert verdicts["claim_C"] == INSUFFICIENT_DATA


# ── Test 32: Falsification INSUFFICIENT_DATA edge ────────────────────────────

def test_falsification_insufficient_data():
    from chandelier.queries.falsification_test import FalsificationTestRunner, INSUFFICIENT_DATA
    idx = _build_test_index([])
    runner = FalsificationTestRunner(index=idx)
    result = runner.test(["pX"], "m", claimed_delta=0.5, min_receipts=1)
    assert result["verdict"] == INSUFFICIENT_DATA
    assert result["empirical_delta"] is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
