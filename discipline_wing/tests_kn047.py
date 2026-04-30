"""
Tests KN047 — Layer Instantiation Tooling (Ring of Three at L3)
10 tests covering all Phase D requirements.
Pod R / BP005 Federation Tooling.
"""

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure discipline_wing is importable
_WORKSPACE = Path(__file__).parent.parent
sys.path.insert(0, str(_WORKSPACE))

from discipline_wing.federation.layer_instantiation import (
    ProjectOwnerIdentity,
    RingSlots,
    InstantiationReceipt,
    InstantiationError,
    instantiate_ring_of_three,
    verify_lb_membership,
    verify_steward_level,
    generate_l3_entity_uuid,
    build_l3_uris,
    clone_ring_template,
    apply_owner_customization,
    enforce_marked_exception,
    issue_furnace_stamps,
    RING_EBLET_CLASSES,
    LB_MEMBERSHIP_PRICE_USD,
    STEWARD_RING_LEVEL_REQUIRED,
)
from discipline_wing.federation.layer_addressing import is_valid_uri, extract_layer


def _make_owner(steward_level: int = 2, verified: bool = True) -> ProjectOwnerIdentity:
    return ProjectOwnerIdentity(
        lb_member_id="test-member-001",
        lb_member_verified=verified,
        steward_level=steward_level,
        project_name="TestProject",
    )


def _make_slots() -> RingSlots:
    return RingSlots(
        project_owner_brand="TestBrand",
        project_ip_ledger_url="https://example.com/ledger",
        project_canon_emblem="tb-emblem",
        project_part_b_rules="Members must submit work by Friday.",
        lore_qr_target="https://example.com/lore",
        rules_qr_target="https://example.com/rules",
    )


class TestT01RingTemplateCloneToL3(unittest.TestCase):
    """T01: Ring template clones three Eblets into L3 project dir."""

    def test_clone_creates_all_three_eblets(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            paths = clone_ring_template("test-uuid-01", build_l3_uris("test-uuid-01"), output_dir)
            self.assertEqual(len(paths), 3)
            filenames = {Path(p).name for p in paths}
            self.assertIn("Canon.eblet.md", filenames)
            self.assertIn("Lore.eblet.md", filenames)
            self.assertIn("Project_Rules.eblet.md", filenames)

    def test_clone_files_exist_on_disk(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            paths = clone_ring_template("test-uuid-01b", build_l3_uris("test-uuid-01b"), output_dir)
            for p in paths:
                self.assertTrue(Path(p).exists(), f"Expected {p} to exist")


class TestT02BrandCustomizationApplied(unittest.TestCase):
    """T02: Brand customization is applied to cloned Eblets."""

    def test_brand_in_eblet_content(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            entity_uuid = "brand-uuid-02"
            l3_uris = build_l3_uris(entity_uuid)
            paths = clone_ring_template(entity_uuid, l3_uris, output_dir)
            slots = _make_slots()
            apply_owner_customization(entity_uuid, slots, paths)

            canon_path = next(p for p in paths if "Canon" in Path(p).stem)
            content = Path(canon_path).read_text()
            self.assertIn("TestBrand", content)
            self.assertIn("Members must submit work by Friday", content)

    def test_lore_qr_target_applied(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            entity_uuid = "lore-uuid-02"
            l3_uris = build_l3_uris(entity_uuid)
            paths = clone_ring_template(entity_uuid, l3_uris, output_dir)
            slots = _make_slots()
            apply_owner_customization(entity_uuid, slots, paths)

            lore_path = next(p for p in paths if "Lore" in Path(p).stem)
            content = Path(lore_path).read_text()
            self.assertIn("https://example.com/lore", content)


class TestT03IPLedgerL3EntryCreated(unittest.TestCase):
    """T03: IP Ledger entry for new L3 entity is created."""

    def _seed_l2_parent(self, ledger_path: Path) -> None:
        """Pre-seed the ledger with the L2 parent entry (simulates production state)."""
        ledger_path.parent.mkdir(parents=True, exist_ok=True)
        parent_entry = {
            "golden_tablet_uri": "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
            "tablet_id": "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
            "layer": 2,
            "current_hash": "a" * 64,
            "parent_uri": "golden_tablet://Layer_1/Entity_LBCorp/Canon",
        }
        with open(ledger_path, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(parent_entry) + "\n")

    def test_ledger_entry_created(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ledger_path = Path(tmpdir) / "layer_3" / "ip_ledger.jsonl"
            self._seed_l2_parent(ledger_path)
            entity_uuid = "ledger-uuid-03"
            l3_uris = build_l3_uris(entity_uuid)
            from discipline_wing.federation.layer_instantiation import create_ip_ledger_entry
            entry_id = create_ip_ledger_entry(entity_uuid, l3_uris, ledger_path)

            entries = [json.loads(line) for line in ledger_path.read_text().strip().splitlines()]
            l3_entries = [e for e in entries if e.get("layer") == 3]
            self.assertEqual(len(l3_entries), 1)
            self.assertEqual(l3_entries[0]["entity_uuid"], entity_uuid)
            self.assertEqual(l3_entries[0]["layer"], 3)
            self.assertEqual(entry_id, l3_uris["Canon"])


class TestT04FurnaceStampIssuedPerEblet(unittest.TestCase):
    """T04: A Furnace stamp (SHA-256 hash) is issued for each Eblet."""

    def test_stamps_issued_for_all_eblets(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            entity_uuid = "stamp-uuid-04"
            l3_uris = build_l3_uris(entity_uuid)
            paths = clone_ring_template(entity_uuid, l3_uris, output_dir)
            stamps = issue_furnace_stamps(paths)

            self.assertEqual(len(stamps), 3)
            for cls in ["Canon", "Lore", "Project_Rules"]:
                self.assertIn(cls, stamps)
                self.assertEqual(len(stamps[cls]), 64)  # SHA-256 hex = 64 chars

    def test_stamps_are_sha256(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            entity_uuid = "stamp-uuid-04b"
            l3_uris = build_l3_uris(entity_uuid)
            paths = clone_ring_template(entity_uuid, l3_uris, output_dir)
            stamps = issue_furnace_stamps(paths)
            import re
            for stamp in stamps.values():
                self.assertRegex(stamp, r"^[0-9a-f]{64}$")


class TestT05MarkedExceptionEnforcedAtWriteTime(unittest.TestCase):
    """T05: Marked Exception enforcement — source Eblet QR is locked."""

    def test_canon_eblet_has_marked_exception(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            entity_uuid = "mexc-uuid-05"
            l3_uris = build_l3_uris(entity_uuid)
            paths = clone_ring_template(entity_uuid, l3_uris, output_dir)
            # Should pass without error
            result = enforce_marked_exception(paths, l3_uris)
            self.assertTrue(result)

    def test_tampering_canon_raises(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "CANON"
            entity_uuid = "mexc-uuid-05b"
            l3_uris = build_l3_uris(entity_uuid)
            paths = clone_ring_template(entity_uuid, l3_uris, output_dir)

            # Tamper: remove marked_exception from Canon Eblet
            canon_path = next(p for p in paths if "Canon" in Path(p).stem)
            content = Path(canon_path).read_text()
            tampered = content.replace("marked_exception: true", "marked_exception: false")
            Path(canon_path).write_text(tampered)

            with self.assertRaises(ValueError):
                enforce_marked_exception(paths, l3_uris)


class TestT06PartBOwnerSovereign(unittest.TestCase):
    """T06: Part B of Project Rules is project-owner-sovereign."""

    def test_part_b_contains_custom_rules(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            owner = _make_owner()
            slots = _make_slots()
            slots.project_part_b_rules = "Custom rule: Quorum of 5 for major votes."

            with patch("discipline_wing.federation.layer_instantiation._write_battery_dispatch",
                       return_value="mock-dispatch-id"), \
                 patch("discipline_wing.federation.layer_instantiation.create_ip_ledger_entry",
                       return_value="golden_tablet://Layer_3/Entity_test/Canon"):
                owner.project_uuid = "partb-uuid-06"
                result = instantiate_ring_of_three(
                    owner, slots,
                    output_dir=Path(tmpdir) / "CANON",
                    layer_ledger_path=Path(tmpdir) / "ledger.jsonl",
                )

            if isinstance(result, InstantiationError):
                self.fail(f"Unexpected error: {result}")
            canon_path = next(p for p in result.cloned_eblet_paths if "Canon" in Path(p).stem)
            content = Path(canon_path).read_text()
            self.assertIn("Quorum of 5", content)


class TestT07CyclePreventionComposition(unittest.TestCase):
    """T07: KN049 cycle prevention catches cycles before instantiation."""

    def test_cycle_detected_returns_error(self):
        owner = _make_owner()
        slots = _make_slots()
        owner.project_uuid = "cycle-uuid-07"

        # Patch validate_dag_write to simulate cycle detected
        from discipline_wing.federation.dag_validation import DAGValidationResult
        rejected_result = DAGValidationResult(
            accepted=False,
            reason="Cycle detected in layer chain",
            rejection_class="cycle",
            cycle_path=["golden_tablet://Layer_3/Entity_cycle-uuid-07/Canon"],
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("discipline_wing.federation.layer_instantiation.validate_dag_write",
                       return_value=rejected_result):
                result = instantiate_ring_of_three(
                    owner, slots,
                    output_dir=Path(tmpdir) / "CANON",
                    layer_ledger_path=Path(tmpdir) / "ledger.jsonl",
                )

        self.assertIsInstance(result, InstantiationError)
        self.assertEqual(result.rejection_class, "cycle_detected")


class TestT08MultiTenancyIsolation(unittest.TestCase):
    """T08: KN046 — new L3 doesn't pollute other L3s (isolation via separate ledger files)."""

    def _seed_l2_parent(self, ledger_path: Path) -> None:
        ledger_path.parent.mkdir(parents=True, exist_ok=True)
        parent_entry = {
            "golden_tablet_uri": "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
            "tablet_id": "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
            "layer": 2,
            "current_hash": "b" * 64,
            "parent_uri": "golden_tablet://Layer_1/Entity_LBCorp/Canon",
        }
        with open(ledger_path, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(parent_entry) + "\n")

    def test_separate_entities_use_separate_uris(self):
        uuid_a = "entity-uuid-08a"
        uuid_b = "entity-uuid-08b"
        uris_a = build_l3_uris(uuid_a)
        uris_b = build_l3_uris(uuid_b)

        self.assertNotEqual(uris_a["Canon"], uris_b["Canon"])
        self.assertIn(uuid_a, uris_a["Canon"])
        self.assertIn(uuid_b, uris_b["Canon"])

    def test_separate_ledger_entries(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ledger_path = Path(tmpdir) / "layer_3" / "ip_ledger.jsonl"
            self._seed_l2_parent(ledger_path)
            from discipline_wing.federation.layer_instantiation import create_ip_ledger_entry

            for i in range(3):
                entity_uuid = f"iso-uuid-08-{i}"
                l3_uris = build_l3_uris(entity_uuid)
                create_ip_ledger_entry(entity_uuid, l3_uris, ledger_path)

            entries = [json.loads(line) for line in ledger_path.read_text().strip().splitlines()]
            l3_entries = [e for e in entries if e.get("layer") == 3]
            self.assertEqual(len(l3_entries), 3)
            uuids = {e["entity_uuid"] for e in l3_entries}
            self.assertEqual(len(uuids), 3)


class TestT09OnboardingRejectsUnauthenticatedOwner(unittest.TestCase):
    """T09: Unauthenticated or non-member project owners are rejected."""

    def test_rejects_unverified_member(self):
        owner = _make_owner(verified=False)
        slots = _make_slots()
        with tempfile.TemporaryDirectory() as tmpdir:
            result = instantiate_ring_of_three(owner, slots, Path(tmpdir))
        self.assertIsInstance(result, InstantiationError)
        self.assertEqual(result.rejection_class, "unauthenticated")
        self.assertIn("lianabanyan.com", result.reason)

    def test_rejects_missing_member_id(self):
        owner = ProjectOwnerIdentity(
            lb_member_id="",
            lb_member_verified=True,
            steward_level=2,
            project_name="Ghost",
        )
        slots = _make_slots()
        with tempfile.TemporaryDirectory() as tmpdir:
            result = instantiate_ring_of_three(owner, slots, Path(tmpdir))
        self.assertIsInstance(result, InstantiationError)
        self.assertEqual(result.rejection_class, "unauthenticated")

    def test_rejects_insufficient_steward_level(self):
        owner = _make_owner(steward_level=1)
        slots = _make_slots()
        with tempfile.TemporaryDirectory() as tmpdir:
            result = instantiate_ring_of_three(owner, slots, Path(tmpdir))
        self.assertIsInstance(result, InstantiationError)
        self.assertEqual(result.rejection_class, "insufficient_steward_level")
        self.assertIn(str(STEWARD_RING_LEVEL_REQUIRED), result.reason)


class TestT10LayerAddressingFormatValid(unittest.TestCase):
    """T10: Generated L3 URIs conform to KN045 golden_tablet:// scheme."""

    def test_l3_uris_are_valid(self):
        entity_uuid = "addr-uuid-10"
        uris = build_l3_uris(entity_uuid)
        for cls, uri in uris.items():
            self.assertTrue(is_valid_uri(uri), f"Invalid URI for {cls}: {uri}")

    def test_l3_uris_extract_layer_3(self):
        entity_uuid = "addr-uuid-10b"
        uris = build_l3_uris(entity_uuid)
        for cls, uri in uris.items():
            layer = extract_layer(uri)
            self.assertEqual(layer, 3, f"Expected Layer 3 for {cls}, got {layer}")

    def test_l3_uris_contain_entity_uuid(self):
        entity_uuid = "addr-uuid-10c"
        uris = build_l3_uris(entity_uuid)
        for cls, uri in uris.items():
            self.assertIn(entity_uuid, uri)

    def test_all_ring_classes_covered(self):
        entity_uuid = "addr-uuid-10d"
        uris = build_l3_uris(entity_uuid)
        for cls in RING_EBLET_CLASSES:
            self.assertIn(cls, uris)


if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
