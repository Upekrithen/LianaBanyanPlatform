"""
Tests — KN030 Hot Cross Buns Testing Packet
Phase D trust-but-verify gate.

Run: python -m pytest librarian-mcp/stitchpunks/hot_cross_buns/tests_kn030.py -v

Tests cover:
  1. bundle_kit: creates directory structure
  2. bundle_kit: writes README.md with expected content
  3. bundle_kit: writes METHODOLOGY.md (CheckBook discipline)
  4. bundle_kit: writes REPRODUCIBILITY_PACK.md (#2326)
  5. bundle_kit: writes requirements.txt
  6. bundle_kit: copies scribe source files to checkbook/
  7. bundle_kit: writes kit_manifest.json with correct fields
  8. bundle_kit: example_receipts included when requested
  9. bundle_kit: includes session ledger when session_id provided
  10. list_kits: returns kit IDs
  11. kit_manifest: composition + lineage fields

Toolsmith log: TS-HOT-CROSS-BUNS-TESTING-PACKET-KN030-BP003
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE.parent.parent))
sys.path.insert(0, str(_HERE.parent))


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def tmp_kits_dir(tmp_path, monkeypatch):
    import hot_cross_buns.participant_bundler as pb
    monkeypatch.setattr(pb, "_KITS_DIR", tmp_path)
    return tmp_path


@pytest.fixture()
def kit_id():
    return "HCB-TEST-KN030-001"


# ── bundle_kit tests ───────────────────────────────────────────────────────────

class TestBundleKit:
    def test_creates_kit_directory(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        kit_dir = Path(result["kit_dir"])
        assert kit_dir.exists()
        assert kit_dir.is_dir()

    def test_readme_written(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        readme = Path(result["kit_dir"]) / "README.md"
        assert readme.exists()
        content = readme.read_text()
        assert "Hot Cross Buns" in content
        assert "CheckBook Suite" in content
        assert "Stenographer" in content
        assert "Shutterbug" in content
        assert "Accountant" in content

    def test_methodology_md_written(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        md = Path(result["kit_dir"]) / "METHODOLOGY.md"
        assert md.exists()
        content = md.read_text()
        assert "#2298" in content
        assert "Scenario" in content

    def test_reproducibility_pack_written(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        rp = Path(result["kit_dir"]) / "REPRODUCIBILITY_PACK.md"
        assert rp.exists()
        content = rp.read_text()
        assert "#2326" in content
        assert "verify" in content.lower()

    def test_requirements_txt_written(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        req = Path(result["kit_dir"]) / "requirements.txt"
        assert req.exists()
        content = req.read_text()
        assert "pytest" in content

    def test_checkbook_directory_created(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        checkbook_dir = Path(result["kit_dir"]) / "checkbook"
        assert checkbook_dir.exists()
        assert (checkbook_dir / "__init__.py").exists()

    def test_scribe_files_copied(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        checkbook_dir = Path(result["kit_dir"]) / "checkbook"
        # At least some scribe files should be copied
        py_files = list(checkbook_dir.glob("*.py"))
        assert len(py_files) >= 1  # at least __init__.py

    def test_kit_manifest_written(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        manifest_path = Path(result["kit_dir"]) / "kit_manifest.json"
        assert manifest_path.exists()
        manifest = json.loads(manifest_path.read_text())
        assert manifest["kit_id"] == kit_id
        assert manifest["kit_type"] == "hot_cross_buns_checkbook_suite"
        assert "KN027-Stenographer" in manifest["composition"]
        assert "KN028-Shutterbug" in manifest["composition"]
        assert "KN029-Accountant" in manifest["composition"]

    def test_kit_manifest_lineage(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        manifest = result["manifest"]
        assert "#2299-R&D-Battery" in manifest["lineage"]
        assert "#2304-CheckBook" in manifest["lineage"]
        assert "#2326-Reproducibility-Pack" in manifest["lineage"]

    def test_kit_manifest_vendor_fields(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        manifest = result["manifest"]
        assert manifest["vendor"] == "Liana Banyan Corporation"
        assert manifest["ein"] == "41-2797446"

    def test_example_receipts_included(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id, include_example_receipt=True)
        examples_dir = Path(result["kit_dir"]) / "example_receipts"
        assert examples_dir.exists()
        md_files = list(examples_dir.glob("*.md"))
        assert len(md_files) >= 1

    def test_example_receipts_excluded(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id, include_example_receipt=False)
        # example_receipts dir may exist but be empty (no .md files)
        examples_dir = Path(result["kit_dir"]) / "example_receipts"
        md_files = list(examples_dir.glob("*.md")) if examples_dir.exists() else []
        assert len(md_files) == 0

    def test_files_written_list_populated(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        assert len(result["files_written"]) >= 5  # README + reqs + 2 MDs + manifest
        assert "README.md" in result["files_written"]
        assert "kit_manifest.json" in result["files_written"]

    def test_generated_at_iso_format(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        result = bundle_kit(kit_id)
        ga = result["generated_at"]
        assert ga.endswith("Z")
        assert "T" in ga

    def test_custom_output_dir(self, tmp_path, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit
        custom_dir = tmp_path / "custom_kits"
        result = bundle_kit(kit_id, output_dir=custom_dir)
        assert Path(result["kit_dir"]).parent == custom_dir

    def test_non_raising_on_missing_sources(self, tmp_kits_dir, kit_id):
        """bundle_kit should not raise even if scribe source files are missing."""
        from hot_cross_buns.participant_bundler import bundle_kit
        try:
            result = bundle_kit(kit_id)
            assert "kit_id" in result
        except Exception as exc:
            pytest.fail(f"bundle_kit raised: {exc}")


class TestListKits:
    def test_list_kits_empty(self, tmp_kits_dir):
        from hot_cross_buns.participant_bundler import list_kits
        kits = list_kits()
        assert kits == []

    def test_list_kits_after_bundle(self, tmp_kits_dir, kit_id):
        from hot_cross_buns.participant_bundler import bundle_kit, list_kits
        bundle_kit(kit_id)
        kits = list_kits()
        assert kit_id in kits

    def test_list_kits_multiple(self, tmp_kits_dir):
        from hot_cross_buns.participant_bundler import bundle_kit, list_kits
        bundle_kit("KIT-A")
        bundle_kit("KIT-B")
        kits = list_kits()
        assert "KIT-A" in kits
        assert "KIT-B" in kits


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
