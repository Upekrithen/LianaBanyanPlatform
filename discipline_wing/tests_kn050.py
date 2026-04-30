"""
Tests KN050 — Pheromone-Anchored Decision Schema
10 tests covering all Phase D requirements.
Pod R / BP005 Federation Tooling.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

_WORKSPACE = Path(__file__).parent.parent
sys.path.insert(0, str(_WORKSPACE))

from discipline_wing.federation.pheromone_decision import (
    DecisionRecord,
    ValidationResult,
    FurnaceVerificationResult,
    create_decision_record,
    validate_decision_record,
    verify_with_furnace,
    append_decision,
    load_decisions,
    decisions_anchored_to,
    tablet_for,
    decisions_by_class,
    no_in_place_edit_guard,
    DECISION_CLASSES,
)


# ── Fixtures ─────────────────────────────────────────────────────────────────────

TABLET_URI = "golden_tablet://Layer_3/Entity_guild-001/Project_Rules"
TABLET_URI_2 = "golden_tablet://Layer_4/Entity_tribe-001/Project_Rules"

LEDGER_WITH_TABLET = {
    TABLET_URI: {
        "tablet_id": TABLET_URI,
        "layer": 3,
        "furnace_stamp": "a" * 64,
        "part_b_methods": ["weighted_majority_vote", "elder_consensus_three_of_five"],
    }
}


def _make_record(
    decision_class: str = "guild_master_election",
    anchor: str = TABLET_URI,
    verification_method: str = "weighted_majority_vote",
    supersedes: str | None = None,
) -> DecisionRecord:
    return create_decision_record(
        decision_class=decision_class,
        anchor=anchor,
        outcome={"winner": "Alice", "vote_count": 12},
        decided_by="guild-001",
        verification_method=verification_method,
        supersedes=supersedes,
    )


class TestT01DecisionRecordSchemaValidates(unittest.TestCase):
    """T01: Decision record schema validates correctly."""

    def test_valid_record_passes(self):
        record = _make_record()
        result = validate_decision_record(record)
        self.assertTrue(result.valid, result.reason)

    def test_missing_anchor_fails(self):
        record = _make_record()
        record.anchor = ""
        result = validate_decision_record(record)
        self.assertFalse(result.valid)
        self.assertEqual(result.rejection_class, "schema")

    def test_invalid_anchor_uri_fails(self):
        record = _make_record()
        record.anchor = "not-a-valid-uri"
        result = validate_decision_record(record)
        self.assertFalse(result.valid)
        self.assertEqual(result.rejection_class, "invalid_uri")

    def test_missing_verification_method_fails(self):
        record = _make_record()
        record.verification_method = ""
        result = validate_decision_record(record)
        self.assertFalse(result.valid)

    def test_wrong_record_type_fails(self):
        record = _make_record()
        record.record_type = "something_else"
        result = validate_decision_record(record)
        self.assertFalse(result.valid)


class TestT02AnchorResolvesViaKN045(unittest.TestCase):
    """T02: Anchor resolves via KN045 golden_tablet:// URI."""

    def test_anchor_resolution_success(self):
        record = _make_record()
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertTrue(result.verified, result.rejection_detail)

    def test_anchor_not_found_fails(self):
        record = _make_record()
        record.anchor = "golden_tablet://Layer_3/Entity_unknown-999/Canon"
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertFalse(result.verified)
        self.assertEqual(result.rejection_class, "anchor_not_found")

    def test_anchor_uri_contains_layer(self):
        from discipline_wing.federation.layer_addressing import extract_layer
        layer = extract_layer(TABLET_URI)
        self.assertEqual(layer, 3)


class TestT03FurnaceVerifiesMethodMatchesPartB(unittest.TestCase):
    """T03: Furnace verifies verification_method matches Part B declaration."""

    def test_valid_method_passes(self):
        record = _make_record(verification_method="weighted_majority_vote")
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertTrue(result.verified)

    def test_second_valid_method_passes(self):
        record = _make_record(verification_method="elder_consensus_three_of_five")
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertTrue(result.verified)


class TestT04FurnaceRejectsMethodMismatch(unittest.TestCase):
    """T04: Furnace rejects verification_method not in Part B."""

    def test_undeclared_method_rejected(self):
        record = _make_record(verification_method="random_lottery")
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertFalse(result.verified)
        self.assertEqual(result.rejection_class, "method_mismatch")

    def test_empty_method_rejected_by_schema(self):
        record = _make_record()
        record.verification_method = ""
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertFalse(result.verified)


class TestT05BidirectionalQueryDecisionsForTablet(unittest.TestCase):
    """T05: decisions_anchored_to(tablet_uri) returns all decisions for a Tablet."""

    def test_query_finds_decision(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            record = _make_record()
            verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
            append_decision(record, store_path)

            results = decisions_anchored_to(TABLET_URI, store_path)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0].record_id, record.record_id)

    def test_query_filters_by_anchor(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            rec1 = _make_record(anchor=TABLET_URI)
            rec2 = _make_record(anchor=TABLET_URI_2)
            for r in [rec1, rec2]:
                append_decision(r, store_path)

            results = decisions_anchored_to(TABLET_URI, store_path)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0].record_id, rec1.record_id)

    def test_query_excludes_superseded(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            original = _make_record()
            correction = _make_record(supersedes=original.record_id)
            for r in [original, correction]:
                append_decision(r, store_path)

            results = decisions_anchored_to(TABLET_URI, store_path)
            # Original superseded; correction kept
            record_ids = {r.record_id for r in results}
            self.assertNotIn(original.record_id, record_ids)
            self.assertIn(correction.record_id, record_ids)


class TestT06BidirectionalQueryTabletForDecision(unittest.TestCase):
    """T06: tablet_for(decision_id) returns the Tablet authority URI."""

    def test_tablet_for_known_decision(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            record = _make_record()
            append_decision(record, store_path)

            result = tablet_for(record.record_id, store_path)
            self.assertEqual(result, TABLET_URI)

    def test_tablet_for_unknown_decision_returns_none(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            result = tablet_for("non-existent-id", store_path)
            self.assertIsNone(result)


class TestT07AppendOnlyNoInPlaceEdit(unittest.TestCase):
    """T07: Stone Tablet Imperative — no in-place edits to decision records."""

    def test_in_place_edit_guard_detects_existing(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            record = _make_record()
            append_decision(record, store_path)

            already_exists = no_in_place_edit_guard(record.record_id, store_path)
            self.assertTrue(already_exists)

    def test_new_record_not_blocked(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            already_exists = no_in_place_edit_guard("new-id-not-in-store", store_path)
            self.assertFalse(already_exists)


class TestT08SupersedePointerForCorrection(unittest.TestCase):
    """T08: Corrections use supersede pointer — old record remains, new record points back."""

    def test_correction_via_supersede(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            original = _make_record()
            correction = _make_record(supersedes=original.record_id)

            for r in [original, correction]:
                append_decision(r, store_path)

            all_records = load_decisions(store_path)
            self.assertEqual(len(all_records), 2)

            correction_record = next(r for r in all_records if r.supersedes)
            self.assertEqual(correction_record.supersedes, original.record_id)

    def test_both_records_persisted_appended(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            original = _make_record()
            correction = _make_record(supersedes=original.record_id)
            append_decision(original, store_path)
            append_decision(correction, store_path)

            lines = store_path.read_text().strip().splitlines()
            self.assertEqual(len(lines), 2)


class TestT09BatteryDispatchRegisterEntryCreated(unittest.TestCase):
    """T09: Every verified decision creates a Battery-dispatch register entry."""

    def test_furnace_assigns_dispatch_id(self):
        record = _make_record()
        result = verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertTrue(result.verified)
        self.assertNotEqual(result.battery_dispatch_id, "")
        self.assertEqual(record.battery_dispatch_id, result.battery_dispatch_id)

    def test_furnace_assigns_furnace_stamp(self):
        record = _make_record()
        verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertEqual(len(record.furnace_stamp), 64)

    def test_furnace_stamp_is_sha256(self):
        import re
        record = _make_record()
        verify_with_furnace(record, ledger_lookup=LEDGER_WITH_TABLET)
        self.assertRegex(record.furnace_stamp, r"^[0-9a-f]{64}$")


class TestT10DetectiveQueryExtension(unittest.TestCase):
    """T10: Detective finds decisions by decision_class."""

    def test_query_by_decision_class(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            rec_election = _make_record(decision_class="guild_master_election")
            rec_vote = _make_record(
                decision_class="membership_vote",
                anchor="golden_tablet://Layer_3/Entity_guild-002/Project_Rules",
            )
            for r in [rec_election, rec_vote]:
                append_decision(r, store_path)

            election_results = decisions_by_class("guild_master_election", store_path)
            self.assertEqual(len(election_results), 1)
            self.assertEqual(election_results[0].decision_class, "guild_master_election")

    def test_query_empty_class_returns_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            store_path = Path(tmpdir) / "decisions.jsonl"
            results = decisions_by_class("nonexistent_class", store_path)
            self.assertEqual(results, [])

    def test_decision_classes_enum_contains_core_types(self):
        self.assertIn("guild_master_election", DECISION_CLASSES)
        self.assertIn("tribal_steward_consensus", DECISION_CLASSES)
        self.assertIn("family_trustee_decree", DECISION_CLASSES)
        self.assertIn("helm_recipe_choice", DECISION_CLASSES)
        self.assertIn("part_a_reacknowledgment", DECISION_CLASSES)


if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
