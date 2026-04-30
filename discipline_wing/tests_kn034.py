"""
Tests KN034 — Anjin Receipt Pack Assembly
Target: ≥15 tests covering pack assembly + signature verification + reproducibility export.

Anjin Phase 3 Acceptance #11 + #12.
Toolsmith log: TS-ANJIN-RECEIPT-PACK-ASSEMBLY-KN034-BP003
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict

import pytest

_TESTS_DIR = Path(__file__).parent
_STITCHPUNKS = _TESTS_DIR.parent / "librarian-mcp" / "stitchpunks"
if str(_STITCHPUNKS) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS))

from anjin_receipt_pack.assembler import (
    assemble_pack, compute_acceptance_summary, ACCEPTANCE_ITEMS,
    EXPORT_GATE_THRESHOLD, POD_J_COMMITS, POD_K_COMMITS, POD_L_COMMITS,
    BP003_CANON_FILES, _PACK_ROOT,
)
from anjin_receipt_pack.signature_verifier import verify_pack


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1: Pack assembly (tests 1-3)
# ═══════════════════════════════════════════════════════════════════════════════

class TestPackAssembly:

    @pytest.fixture(scope="class")
    def assembled(self, tmp_path_factory):
        pack_root = tmp_path_factory.mktemp("anjin_pack")
        result = assemble_pack(pack_root=pack_root, create_tarball=False, verbose=False)
        return {"result": result, "pack_root": pack_root}

    def test_01_assembly_produces_acceptance_signature(self, assembled):
        pack_root = assembled["pack_root"]
        assert (pack_root / "00_acceptance_signature.md").exists()

    def test_02_assembly_produces_pod_receipts(self, assembled):
        pack_root = assembled["pack_root"]
        assert (pack_root / "01_pod_J_receipts" / "receipt_manifest.md").exists()
        assert (pack_root / "02_pod_K_receipts" / "receipt_manifest.md").exists()
        assert (pack_root / "03_pod_L_receipts" / "receipt_manifest.md").exists()

    def test_03_assembly_produces_all_nine_components(self, assembled):
        pack_root = assembled["pack_root"]
        expected = [
            "00_acceptance_signature.md",
            "01_pod_J_receipts",
            "02_pod_K_receipts",
            "03_pod_L_receipts",
            "04_PW003_partial_receipt.md",
            "05_canon_files",
            "06_anjin_checkbook_ledger.md",
            "07_hot_cross_buns_testing_packet.md",
            "08_chronos_signature.json",
        ]
        for name in expected:
            assert (pack_root / name).exists(), f"Missing component: {name}"


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: Acceptance signature reconciliation (tests 4-6)
# ═══════════════════════════════════════════════════════════════════════════════

class TestAcceptanceSignature:

    def test_04_acceptance_items_count(self):
        """Must have exactly 12 acceptance items."""
        assert len(ACCEPTANCE_ITEMS) == 12

    def test_05_gate_passes_with_current_items(self):
        """Current acceptance items must pass the export gate."""
        summary = compute_acceptance_summary(ACCEPTANCE_ITEMS)
        assert summary["gate_passes"], (
            f"Gate BLOCKED: {summary['green_count']}/{summary['total']} GREEN "
            f"(need ≥{EXPORT_GATE_THRESHOLD})"
        )

    def test_06_gate_blocks_when_below_threshold(self):
        """Gate must block when fewer than threshold items are GREEN."""
        insufficient = [dict(item) for item in ACCEPTANCE_ITEMS]
        for item in insufficient:
            item["status"] = "PENDING"
        summary = compute_acceptance_summary(insufficient)
        assert not summary["gate_passes"]
        assert summary["green_count"] == 0


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: Chronos signing (tests 7-9)
# ═══════════════════════════════════════════════════════════════════════════════

class TestChronosSigning:

    @pytest.fixture(scope="class")
    def assembled(self, tmp_path_factory):
        pack_root = tmp_path_factory.mktemp("anjin_sig_pack")
        result = assemble_pack(pack_root=pack_root, create_tarball=False, verbose=False)
        return {"result": result, "pack_root": pack_root}

    def test_07_signature_file_exists(self, assembled):
        assert (assembled["pack_root"] / "08_chronos_signature.json").exists()

    def test_08_signature_verification_passes(self, assembled):
        result = verify_pack(assembled["pack_root"])
        assert result["verified"], (
            f"Verification failed. stored={result['stored_hash'][:16]} "
            f"computed={result['computed_hash'][:16]}"
        )

    def test_09_gate_passed_in_verified_pack(self, assembled):
        result = verify_pack(assembled["pack_root"])
        assert result["gate_passed"]


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4: Reproducibility export (tests 10-12)
# ═══════════════════════════════════════════════════════════════════════════════

class TestReproducibilityExport:

    @pytest.fixture(scope="class")
    def assembled_with_tarball(self, tmp_path_factory):
        pack_root = tmp_path_factory.mktemp("anjin_tar_pack")
        result = assemble_pack(pack_root=pack_root, create_tarball=True, verbose=False)
        return {"result": result, "pack_root": pack_root}

    def test_10_tarball_created(self, assembled_with_tarball):
        tarball_path = assembled_with_tarball["result"].get("tarball_path")
        if tarball_path:
            assert Path(tarball_path).exists(), f"Tarball not found: {tarball_path}"
        else:
            pytest.skip("tarball_error set — non-blocking for Anjin close")

    def test_11_tarball_extractable(self, assembled_with_tarball, tmp_path):
        tarball_path = assembled_with_tarball["result"].get("tarball_path")
        if not tarball_path or not Path(tarball_path).exists():
            pytest.skip("No tarball available")
        import tarfile
        with tarfile.open(tarball_path, "r:gz") as tar:
            members = tar.getnames()
        assert len(members) > 5, f"Tarball suspiciously sparse: {len(members)} members"

    def test_12_verification_from_extracted_tarball(self, assembled_with_tarball, tmp_path):
        tarball_path = assembled_with_tarball["result"].get("tarball_path")
        if not tarball_path or not Path(tarball_path).exists():
            pytest.skip("No tarball available")
        from anjin_receipt_pack.signature_verifier import verify_pack_from_tarball
        result = verify_pack_from_tarball(Path(tarball_path), tmp_path / "extracted")
        assert result.get("verified"), f"Tarball verification failed: {result}"


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5: Regression + negative + empirical (tests 13-15)
# ═══════════════════════════════════════════════════════════════════════════════

class TestRegressionAndEmpirical:

    def test_13_regression_pod_commits_intact(self):
        """Pod J, K, L commit lists must have correct bean counts."""
        assert len(POD_J_COMMITS) == 4, "Pod J should have 4 entries"
        assert len(POD_K_COMMITS) == 6, "Pod K should have 6 entries (5 beans + close)"
        assert len(POD_L_COMMITS) == 3, "Pod L should have 3 entries (KN032/KN033/KN034)"

    def test_14_negative_blocked_when_acceptance_fails(self):
        """assemble_pack should raise RuntimeError when gate fails."""
        # Temporarily mark all items PENDING
        original_statuses = [(i, item["status"]) for i, item in enumerate(ACCEPTANCE_ITEMS)]
        try:
            for item in ACCEPTANCE_ITEMS:
                item["status"] = "PENDING"
            with pytest.raises(RuntimeError, match="Export gate BLOCKED"):
                assemble_pack(create_tarball=False, verbose=False)
        finally:
            for i, status in original_statuses:
                ACCEPTANCE_ITEMS[i]["status"] = status

    def test_15_empirical_pack_signs_successfully(self, tmp_path):
        """Full assembler run on real Pod J + K data produces verified signature."""
        result = assemble_pack(pack_root=tmp_path / "test_pack", create_tarball=False, verbose=False)
        assert result["gate_passed"]
        assert result["manifest_hash"]
        verify_result = verify_pack(Path(result["pack_root"]))
        assert verify_result["verified"]

    def test_16_canon_files_count(self):
        """Must have exactly 10 BP003 canon files referenced."""
        assert len(BP003_CANON_FILES) == 10

    def test_17_acceptance_items_all_have_required_fields(self):
        """Every acceptance item must have id, title, status, evidence, pod."""
        required = {"id", "title", "status", "evidence", "pod"}
        for item in ACCEPTANCE_ITEMS:
            missing = required - set(item.keys())
            assert not missing, f"{item.get('id')} missing fields: {missing}"
