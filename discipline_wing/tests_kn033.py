"""
Tests KN033 — Retroactive LORE Harvest via SP-8 Herald
Target: ≥25 entries generated + ≥15 unit tests.

Anjin Phase 3 Acceptance #8.
Toolsmith log: TS-RETROACTIVE-LORE-HARVEST-SP8-HERALD-KN033-BP003
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest

_TESTS_DIR = Path(__file__).parent
_WORKSPACE = _TESTS_DIR.parent
_STITCHPUNKS = _WORKSPACE / "librarian-mcp" / "stitchpunks"
if str(_STITCHPUNKS) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS))

from discipline_wing.lore_harvest import (
    RECEIPT_CLASS_MOMENTS, CANONICAL, generate_fotw_entry, generate_uth_entry,
    run_harvest, load_harvest_store, _HARVEST_STORE, _FOTW_DIR, _UTH_DIR,
)

sys.path.insert(0, str(_TESTS_DIR))


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1: Moment manifest integrity (tests 1-9)
# ═══════════════════════════════════════════════════════════════════════════════

class TestMomentManifest:

    def test_01_moment_count_meets_target(self):
        """Must have ≥25 receipt-class moments defined."""
        assert len(RECEIPT_CLASS_MOMENTS) >= 25, (
            f"Only {len(RECEIPT_CLASS_MOMENTS)} moments defined; need ≥25"
        )

    def test_02_bp001_count(self):
        bp001 = [m for m in RECEIPT_CLASS_MOMENTS if m["corpus"] == "BP001"]
        assert len(bp001) >= 8, f"BP001 has {len(bp001)}; need ≥8"

    def test_03_bp002_count(self):
        bp002 = [m for m in RECEIPT_CLASS_MOMENTS if m["corpus"] == "BP002"]
        assert len(bp002) >= 12, f"BP002 has {len(bp002)}; need ≥12"

    def test_04_bp003_count(self):
        bp003 = [m for m in RECEIPT_CLASS_MOMENTS if m["corpus"] == "BP003"]
        assert len(bp003) >= 8, f"BP003 has {len(bp003)}; need ≥8"

    def test_05_required_fields_present(self):
        required = {
            "corpus", "session", "commit_hash", "date", "milestone",
            "moment_class", "fotw_narrative", "uth_mechanism",
            "cross_ref_commit", "dynamic_class",
        }
        for m in RECEIPT_CLASS_MOMENTS:
            missing = required - set(m.keys())
            assert not missing, f"{m.get('session')} missing {missing}"

    def test_06_corpus_values_valid(self):
        valid = {"BP001", "BP002", "BP003"}
        for m in RECEIPT_CLASS_MOMENTS:
            assert m["corpus"] in valid, f"{m['session']} has invalid corpus: {m['corpus']}"

    def test_07_dynamic_class_values_valid(self):
        valid = {
            "canon_ratification", "built_tested_proven",
            "monolith_milestone", "cross_pod_stay_warm",
        }
        for m in RECEIPT_CLASS_MOMENTS:
            assert m["dynamic_class"] in valid, (
                f"{m['session']} has invalid dynamic_class: {m['dynamic_class']}"
            )

    def test_08_fotw_narratives_non_empty(self):
        for m in RECEIPT_CLASS_MOMENTS:
            assert m["fotw_narrative"].strip(), f"{m['session']} has empty fotw_narrative"

    def test_09_uth_mechanisms_non_empty(self):
        for m in RECEIPT_CLASS_MOMENTS:
            assert m["uth_mechanism"].strip(), f"{m['session']} has empty uth_mechanism"


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: Entry generation (tests 10-17)
# ═══════════════════════════════════════════════════════════════════════════════

class TestEntryGeneration:

    @pytest.fixture(scope="class")
    def sample_moment(self):
        return RECEIPT_CLASS_MOMENTS[0]

    def test_10_generate_fotw_entry_type(self, sample_moment):
        entry = generate_fotw_entry(sample_moment)
        assert entry["type"] == "FotW"

    def test_11_generate_uth_entry_type(self, sample_moment):
        entry = generate_uth_entry(sample_moment)
        assert entry["type"] == "UtH"

    def test_12_entry_id_format(self, sample_moment):
        entry = generate_fotw_entry(sample_moment)
        assert entry["entry_id"].startswith("H-"), f"Bad entry_id format: {entry['entry_id']}"
        # e.g., H-001
        parts = entry["entry_id"].split("-")
        assert len(parts) == 2
        assert parts[1].isdigit()

    def test_13_draft_flag_set(self, sample_moment):
        fotw = generate_fotw_entry(sample_moment)
        uth = generate_uth_entry(sample_moment)
        assert fotw["draft_flag"] is True
        assert uth["draft_flag"] is True

    def test_14_draft_status_correct(self, sample_moment):
        entry = generate_fotw_entry(sample_moment)
        assert "DRAFT" in entry["draft_status"]
        assert "FOUNDER" in entry["draft_status"]

    def test_15_canonical_snapshot_included(self, sample_moment):
        entry = generate_fotw_entry(sample_moment)
        snap = entry.get("canonical_snapshot", {})
        assert "innovations" in snap
        assert "crown_jewels" in snap
        assert "creator_keeps" in snap
        assert snap["innovations"] == str(CANONICAL["innovations"])

    def test_16_cross_ref_commit_present(self, sample_moment):
        entry = generate_fotw_entry(sample_moment)
        assert entry["cross_ref_commit_hash"], "cross_ref_commit_hash must be non-empty"

    def test_17_toolsmith_log_correct(self, sample_moment):
        entry = generate_uth_entry(sample_moment)
        assert "KN033" in entry["toolsmith_log"]
        assert "BP003" in entry["toolsmith_log"]


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: Full harvest run (tests 18-25)
# ═══════════════════════════════════════════════════════════════════════════════

class TestHarvestRun:

    @pytest.fixture(scope="class")
    def harvest_summary(self):
        # Run harvest (idempotent: each run generates new H-ids + appends)
        return run_harvest(verbose=False)

    def test_18_total_entries_meets_target(self, harvest_summary):
        """Total entries = 2x moments (FotW + UtH each). Must be ≥50 (≥25 pairs)."""
        assert harvest_summary["total_entries"] >= 50, (
            f"Total entries: {harvest_summary['total_entries']}; need ≥50"
        )

    def test_19_bp001_meets_target(self, harvest_summary):
        assert harvest_summary["bp001_moments"] >= 8

    def test_20_bp002_meets_target(self, harvest_summary):
        assert harvest_summary["bp002_moments"] >= 12

    def test_21_bp003_meets_target(self, harvest_summary):
        assert harvest_summary["bp003_moments"] >= 8

    def test_22_harvest_store_created(self, harvest_summary):
        assert Path(harvest_summary["harvest_store"]).exists()

    def test_23_fotw_files_created(self, harvest_summary):
        """FotW directory should have new DRAFT files."""
        drafts = list(_FOTW_DIR.glob("FOTW_DRAFT_*.md"))
        assert len(drafts) >= 25, f"Only {len(drafts)} FotW DRAFT files"

    def test_24_uth_files_created(self, harvest_summary):
        """UtH directory should have new DRAFT files."""
        drafts = list(_UTH_DIR.glob("UTH_DRAFT_*.md"))
        assert len(drafts) >= 25, f"Only {len(drafts)} UtH DRAFT files"

    def test_25_all_entries_draft_flagged(self, harvest_summary):
        """All entries in harvest store must have draft_flag=True."""
        entries = load_harvest_store()
        kn033_entries = [
            e for e in entries
            if "KN033" in e.get("toolsmith_log", "")
        ]
        assert kn033_entries, "No KN033 entries found in harvest store"
        for e in kn033_entries:
            assert e.get("draft_flag") is True, (
                f"Entry {e.get('entry_id')} has draft_flag={e.get('draft_flag')}"
            )


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4: Harvest store integrity (tests 26-30)
# ═══════════════════════════════════════════════════════════════════════════════

class TestHarvestStoreIntegrity:

    @pytest.fixture(scope="class")
    def store_entries(self):
        run_harvest(verbose=False)
        return load_harvest_store()

    def test_26_store_entries_are_valid_json(self, store_entries):
        """All entries must be valid JSON dicts."""
        assert all(isinstance(e, dict) for e in store_entries)

    def test_27_each_entry_has_entry_id(self, store_entries):
        kn033 = [e for e in store_entries if "KN033" in e.get("toolsmith_log", "")]
        for e in kn033:
            assert e.get("entry_id"), f"Entry missing entry_id: {e}"

    def test_28_fotw_uth_both_types_present(self, store_entries):
        kn033 = [e for e in store_entries if "KN033" in e.get("toolsmith_log", "")]
        types = {e["type"] for e in kn033}
        assert "FotW" in types
        assert "UtH" in types

    def test_29_corpus_distribution_in_store(self, store_entries):
        kn033 = [e for e in store_entries if "KN033" in e.get("toolsmith_log", "")]
        corpora = {e.get("corpus") for e in kn033}
        assert "BP001" in corpora
        assert "BP002" in corpora
        assert "BP003" in corpora

    def test_30_regression_sp8_herald_import(self):
        """SP-8 Herald (sp8_herald.py) should still import cleanly."""
        import importlib.util
        herald_path = (
            Path(__file__).parent.parent
            / "librarian-mcp" / "stitchpunks" / "sp8_herald.py"
        )
        spec = importlib.util.spec_from_file_location("sp8_herald", herald_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert hasattr(module, "generate_fly_on_the_wall")
        assert hasattr(module, "generate_under_the_hood")
        assert hasattr(module, "run")
