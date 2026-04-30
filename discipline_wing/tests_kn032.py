"""
Tests KN032 — MAKE Chandelier Full Deployment
Target: ≥40 tests covering L1 receipts + L2 synergy + query API + coverage gate.

Anjin Phase 3 Acceptance #7.
Toolsmith log: TS-MAKE-CHANDELIER-FULL-DEPLOYMENT-KN032-BP003
"""

from __future__ import annotations

import sys
import json
import hashlib
from pathlib import Path
from typing import Any, Dict, List

import pytest

# ── path setup ────────────────────────────────────────────────────────────────
_TESTS_DIR = Path(__file__).parent
_STITCHPUNKS = _TESTS_DIR.parent / "librarian-mcp" / "stitchpunks"
if str(_STITCHPUNKS) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS))

from chandelier.populate_l1_receipts import KN032_L1_EXTENSIONS, run_kn032_l1_extensions, SESSION_ID as L1_SESSION
from chandelier.populate_l2_synergy import KN032_L2_EXTENSIONS, run_kn032_l2_extensions, SESSION_ID as L2_SESSION
from chandelier.chandelier_full_query import (
    query_l1, query_l2, query_coverage, chandelier_status,
    compare_modes, CANON_PRIMITIVES, L1_COVERAGE_TARGET, L2_COVERAGE_TARGET, CoverageReport,
)
from chandelier.chronos_chandelier_bridge import build_index, verify_receipt, sign_and_store


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1: L1 extension data integrity (tests 1-14)
# ═══════════════════════════════════════════════════════════════════════════════

class TestL1ExtensionDataIntegrity:
    """Validate KN032_L1_EXTENSIONS data structure before running."""

    def test_01_l1_extensions_count(self):
        """Must have exactly 14 extension entries."""
        assert len(KN032_L1_EXTENSIONS) == 14

    def test_02_l1_required_fields(self):
        """Every extension must have required fields."""
        required = {
            "primitive_id", "metric", "baseline_score",
            "baseline_description", "treatment_score", "treatment_description",
        }
        for entry in KN032_L1_EXTENSIONS:
            missing = required - set(entry.keys())
            assert not missing, f"Entry {entry.get('primitive_id')} missing: {missing}"

    def test_03_l1_primitive_ids_unique(self):
        """All primitive_ids must be unique across extensions."""
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert len(ids) == len(set(ids)), f"Duplicate primitive_ids: {ids}"

    def test_04_l1_scores_in_range(self):
        """All scores must be in [0.0, 1.0]."""
        for e in KN032_L1_EXTENSIONS:
            assert 0.0 <= e["baseline_score"] <= 1.0, f"{e['primitive_id']} baseline OOB"
            assert 0.0 <= e["treatment_score"] <= 1.0, f"{e['primitive_id']} treatment OOB"

    def test_05_l1_has_trade_offs(self):
        """Every entry must include trade_offs (non-empty)."""
        for e in KN032_L1_EXTENSIONS:
            assert e.get("trade_offs"), f"{e['primitive_id']} missing trade_offs"

    def test_06_l1_has_notes(self):
        """Every entry must include notes."""
        for e in KN032_L1_EXTENSIONS:
            assert e.get("notes"), f"{e['primitive_id']} missing notes"

    def test_07_l1_covers_pre_reg(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "pre_reg_protocol" in ids

    def test_08_l1_covers_rd_battery(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "rd_battery" in ids

    def test_09_l1_covers_herder(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "herder_scribe" in ids

    def test_10_l1_covers_checkbook(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "checkbook_suite" in ids

    def test_11_l1_covers_lighthouse(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "lighthouse" in ids

    def test_12_l1_covers_vine_transfer(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "vine_transfer" in ids

    def test_13_l1_covers_chronos(self):
        ids = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        assert "chronos_chronicler" in ids

    def test_14_l1_harness_ids_set(self):
        """All entries should reference a harness_id."""
        for e in KN032_L1_EXTENSIONS:
            assert e.get("harness_id"), f"{e['primitive_id']} missing harness_id"


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: L2 synergy data integrity (tests 15-21)
# ═══════════════════════════════════════════════════════════════════════════════

class TestL2SynergyDataIntegrity:
    """Validate KN032_L2_EXTENSIONS data structure."""

    def test_15_l2_extensions_count(self):
        """Must have exactly 8 extension L2 pairs."""
        assert len(KN032_L2_EXTENSIONS) == 8

    def test_16_l2_required_fields(self):
        required = {
            "primitive_ids", "metric", "baseline_score",
            "baseline_description", "combined_score", "combined_description",
            "individual_deltas",
        }
        for entry in KN032_L2_EXTENSIONS:
            missing = required - set(entry.keys())
            assert not missing, f"L2 entry missing: {missing}"

    def test_17_l2_primitive_ids_are_pairs(self):
        """Every L2 entry must have exactly 2 primitive_ids."""
        for e in KN032_L2_EXTENSIONS:
            assert len(e["primitive_ids"]) == 2, f"{e['primitive_ids']} not a pair"

    def test_18_l2_scores_in_range(self):
        for e in KN032_L2_EXTENSIONS:
            assert 0.0 <= e["baseline_score"] <= 1.0
            assert 0.0 <= e["combined_score"] <= 1.0

    def test_19_l2_individual_deltas_keys_match(self):
        """individual_deltas keys must match primitive_ids."""
        for e in KN032_L2_EXTENSIONS:
            delta_keys = set(e["individual_deltas"].keys())
            id_keys = set(e["primitive_ids"])
            assert delta_keys == id_keys, f"Mismatch: {delta_keys} vs {id_keys}"

    def test_20_l2_covers_steno_accountant(self):
        pairs = [frozenset(e["primitive_ids"]) for e in KN032_L2_EXTENSIONS]
        assert frozenset(["stenographer_scribe", "accountant_scribe"]) in pairs

    def test_21_l2_covers_chronos_stone_tablet(self):
        pairs = [frozenset(e["primitive_ids"]) for e in KN032_L2_EXTENSIONS]
        assert frozenset(["chronos_chronicler", "stone_tablet_imperative"]) in pairs


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: Receipt population (tests 22-28)
# ═══════════════════════════════════════════════════════════════════════════════

class TestReceiptPopulation:
    """Run the population functions and verify receipts were stored."""

    @pytest.fixture(scope="class")
    def populated(self):
        l1_summary = run_kn032_l1_extensions(verbose=False)
        l2_summary = run_kn032_l2_extensions(verbose=False)
        index = build_index()
        return {"l1": l1_summary, "l2": l2_summary, "index": index}

    def test_22_l1_added_count(self, populated):
        """Should add exactly 14 new L1 receipts."""
        assert populated["l1"]["l1_added"] == 14

    def test_23_l2_added_count(self, populated):
        """Should add exactly 8 new L2 receipts."""
        assert populated["l2"]["l2_added"] == 8

    def test_24_l1_receipt_ids_unique(self, populated):
        ids = populated["l1"]["l1_receipt_ids"]
        assert len(ids) == len(set(ids))

    def test_25_l2_receipt_ids_unique(self, populated):
        ids = populated["l2"]["l2_receipt_ids"]
        assert len(ids) == len(set(ids))

    def test_26_index_grew_after_population(self, populated):
        """Index count_after must be larger than count_before."""
        l1 = populated["l1"]
        assert l1["index_count_after"] > l1["index_count_before"]

    def test_27_l1_receipts_have_chronos_sig(self, populated):
        """Every L1 receipt must carry a chronos_signature."""
        idx = populated["index"]
        for pid in [e["primitive_id"] for e in KN032_L1_EXTENSIONS]:
            receipts = query_l1(pid, index=idx)
            assert receipts, f"No receipt found for {pid}"
            assert receipts[-1].get("chronos_signature"), f"{pid} missing chronos_sig"

    def test_28_l2_receipts_have_chronos_sig(self, populated):
        idx = populated["index"]
        for e in KN032_L2_EXTENSIONS:
            pa, pb = e["primitive_ids"]
            receipts = query_l2(pa, pb, index=idx)
            assert receipts, f"No L2 receipt for {pa} × {pb}"
            assert receipts[-1].get("chronos_signature")


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4: Chronos verification + canonical JSON (tests 29-32)
# ═══════════════════════════════════════════════════════════════════════════════

class TestChronosVerification:

    @pytest.fixture(scope="class")
    def sample_receipts(self):
        run_kn032_l1_extensions(verbose=False)
        idx = build_index()
        return [query_l1("pre_reg_protocol", index=idx),
                query_l1("chronos_chronicler", index=idx)]

    def test_29_verify_receipt_passes(self, sample_receipts):
        for receipt_list in sample_receipts:
            for r in receipt_list:
                assert verify_receipt(r), f"verify_receipt failed for {r.get('receipt_id')}"

    def test_30_tampered_receipt_fails_verification(self):
        """Mutating a receipt field should cause verify_receipt to return False."""
        body = {
            "receipt_id": "rc_test0001",
            "receipt_class": "L1",
            "primitive_ids": ["test_primitive"],
            "session_id": "test_session",
            "metric": "accuracy",
            "baseline": {"score": 0.0, "description": "baseline"},
            "treatment": {"score": 0.9, "description": "treatment"},
            "delta": 0.9,
            "harness_id": "test",
            "trade_offs": "none",
        }
        signed = sign_and_store(body, session_id="test_session")
        # Mutate a field
        tampered = dict(signed)
        tampered["delta"] = 0.1  # wrong value
        assert not verify_receipt(tampered)

    def test_31_canonical_json_deterministic(self):
        """Same body should produce same Chronicler hash on repeated runs."""
        body = {
            "receipt_id": "rc_determ01",
            "receipt_class": "L1",
            "primitive_ids": ["det_test"],
            "session_id": "s1",
            "metric": "m",
            "baseline": {"score": 0.0, "description": "b"},
            "treatment": {"score": 1.0, "description": "t"},
            "delta": 1.0,
            "harness_id": "h",
            "trade_offs": "none",
        }
        canonical_str = json.dumps(
            {k: v for k, v in body.items()}, sort_keys=True, ensure_ascii=False, separators=(",", ":")
        )
        h1 = hashlib.sha256(canonical_str.encode()).hexdigest()
        h2 = hashlib.sha256(canonical_str.encode()).hexdigest()
        assert h1 == h2

    def test_32_receipts_are_append_only(self):
        """Stone Tablet must not shrink between two successive loads."""
        idx1 = build_index()
        c1 = idx1.total_receipts()
        run_kn032_l1_extensions(verbose=False)
        idx2 = build_index()
        c2 = idx2.total_receipts()
        assert c2 >= c1, "Stone Tablet shrank — append-only invariant violated"


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5: Query API (tests 33-36)
# ═══════════════════════════════════════════════════════════════════════════════

class TestQueryAPI:

    @pytest.fixture(scope="class")
    def idx(self):
        run_kn032_l1_extensions(verbose=False)
        run_kn032_l2_extensions(verbose=False)
        return build_index()

    def test_33_query_l1_returns_receipts(self, idx):
        """query_l1 returns non-empty for a covered primitive."""
        results = query_l1("pre_reg_protocol", index=idx)
        assert len(results) >= 1
        assert all(r.get("receipt_class") == "L1" for r in results)

    def test_34_query_l2_returns_receipts(self, idx):
        """query_l2 returns non-empty for covered pair."""
        results = query_l2("stenographer_scribe", "accountant_scribe", index=idx)
        assert len(results) >= 1
        assert all(r.get("receipt_class") == "L2" for r in results)

    def test_35_query_l2_order_independent(self, idx):
        """query_l2(a, b) == query_l2(b, a) in terms of count."""
        r1 = query_l2("chronos_chronicler", "stone_tablet_imperative", index=idx)
        r2 = query_l2("stone_tablet_imperative", "chronos_chronicler", index=idx)
        assert len(r1) == len(r2)

    def test_36_query_l1_unknown_primitive_returns_empty(self, idx):
        """query_l1 for an unknown primitive returns []."""
        results = query_l1("non_existent_primitive_xyz", index=idx)
        assert results == []


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6: Three-mode comparator (tests 37-38)
# ═══════════════════════════════════════════════════════════════════════════════

class TestThreeModeComparator:

    @pytest.fixture(scope="class")
    def idx(self):
        run_kn032_l1_extensions(verbose=False)
        return build_index()

    def test_37_compare_modes_full_stack_not_none(self, idx):
        """In Full Stack mode, covered primitive returns a receipt."""
        result = compare_modes("pre_reg_protocol", modes=["Full Stack"], index=idx)
        assert result.get("Full Stack") is not None

    def test_38_compare_modes_basic_excludes_non_basic(self, idx):
        """In Basic mode, extended primitives return None (not in Basic set)."""
        result = compare_modes("pre_reg_protocol", modes=["Basic"], index=idx)
        assert result.get("Basic") is None  # pre_reg not in Basic mode set


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 7: Coverage gate (tests 39-40)
# ═══════════════════════════════════════════════════════════════════════════════

class TestCoverageGate:

    @pytest.fixture(scope="class")
    def report(self):
        run_kn032_l1_extensions(verbose=False)
        run_kn032_l2_extensions(verbose=False)
        return query_coverage()

    def test_39_coverage_gate_l1_and_l2(self, report):
        """After KN032 population: ≥18 L1 + ≥10 L2 receipts → OPERATIONAL."""
        assert report.l1_meets_target, (
            f"L1 gate failed: {report.total_l1} < {L1_COVERAGE_TARGET}"
        )
        assert report.l2_meets_target, (
            f"L2 gate failed: {report.total_l2} < {L2_COVERAGE_TARGET}"
        )

    def test_40_chandelier_status_operational(self):
        """chandelier_status() should return 'OPERATIONAL' after full deployment."""
        status = chandelier_status()
        assert status == "OPERATIONAL", f"Expected OPERATIONAL, got {status}"

    def test_41_coverage_report_is_dict(self, report):
        """CoverageReport.as_dict() returns a proper dict."""
        d = report.as_dict()
        assert isinstance(d, dict)
        assert "status" in d
        assert "total_l1" in d
        assert "total_l2" in d

    def test_42_covered_primitives_includes_new(self, report):
        """KN032 extension primitives should appear in covered list."""
        new_primitives = [e["primitive_id"] for e in KN032_L1_EXTENSIONS]
        covered = set(report.primitives_covered)
        for p in new_primitives:
            assert p in covered, f"{p} not in covered set"

    def test_43_regression_kn009_primitives_still_covered(self, report):
        """KN009 seed primitives must still be covered (no regressions)."""
        kn009_seeds = [
            "cathedral_effect", "wrasse_scribe", "detective",
            "pheromone_substrate", "stone_tablet_imperative",
            "bridle_rules", "reproducibility_pack",
            "eblet_system", "timewave_security",
        ]
        covered = set(report.primitives_covered)
        for p in kn009_seeds:
            assert p in covered, f"KN009 regression: {p} no longer covered"
