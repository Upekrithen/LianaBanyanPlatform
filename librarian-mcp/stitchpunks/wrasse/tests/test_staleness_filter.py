"""
Unit tests for the Wrasse Lookup staleness filter.
K-Wrasse-Wiring-Hardening / B133 — Phase E condition 1.

Four cases:
  1. fresh + verified   → KEPT  (fresh regardless of count)
  2. fresh + unverified → KEPT  (fresh overrides low count)
  3. stale + verified   → KEPT  (count >= 3 overrides age)
  4. stale + unverified → DROPPED (stale AND count < 3)
"""

import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Ensure the wrasse package is importable when running from any cwd
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from wrasse_lookup import _load_registry, STALENESS_DAYS, MIN_VERIFICATION_COUNT


def _ts(days_ago: int) -> str:
    """Return an ISO-8601 UTC timestamp for N days ago."""
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _make_registry(entries: list, path: Path) -> None:
    """Write a minimal JSONL registry file."""
    with open(path, "w", encoding="utf-8") as fh:
        header = {
            "type": "header",
            "scribe_id": "WrasseRegistry",
            "version": "2.0.0",
        }
        fh.write(json.dumps(header) + "\n")
        for entry in entries:
            fh.write(json.dumps(entry) + "\n")


class TestStalenessFilter(unittest.TestCase):
    """Validate _load_registry() staleness filter behaviour."""

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.registry_path = Path(self.tmp_dir.name) / "wrasse_registry.jsonl"

    def tearDown(self):
        self.tmp_dir.cleanup()
        # Reset module cache so each test gets a clean load
        import wrasse_lookup
        wrasse_lookup._CACHE = []
        wrasse_lookup._CACHE_MTIME = 0.0

    def _load(self):
        return _load_registry(self.registry_path)

    # ------------------------------------------------------------------ #
    # Case 1: fresh + verified → KEPT                                      #
    # ------------------------------------------------------------------ #
    def test_fresh_and_verified_is_kept(self):
        """Entry that is fresh (< 30 days) AND verified (count >= 3) must be kept."""
        entries = [
            {
                "trigger_id": "W-TEST-1",
                "trigger_class": "vocabulary",
                "trigger_pattern": "test_fresh_verified",
                "trigger_regex": "test_fresh_verified",
                "canonical_resolution": "Fresh and verified entry.",
                "last_verified_ts": _ts(days_ago=1),
                "verification_count": MIN_VERIFICATION_COUNT,
            }
        ]
        _make_registry(entries, self.registry_path)
        loaded = self._load()
        ids = [e["trigger_id"] for e in loaded]
        self.assertIn("W-TEST-1", ids, "Fresh+verified entry should be kept")

    # ------------------------------------------------------------------ #
    # Case 2: fresh + unverified → KEPT (fresh wins)                       #
    # ------------------------------------------------------------------ #
    def test_fresh_and_unverified_is_kept(self):
        """Entry that is fresh (< 30 days) but low verification count must still be kept."""
        entries = [
            {
                "trigger_id": "W-TEST-2",
                "trigger_class": "vocabulary",
                "trigger_pattern": "test_fresh_unverified",
                "trigger_regex": "test_fresh_unverified",
                "canonical_resolution": "Fresh but not yet re-verified.",
                "last_verified_ts": _ts(days_ago=5),
                "verification_count": 1,
            }
        ]
        _make_registry(entries, self.registry_path)
        loaded = self._load()
        ids = [e["trigger_id"] for e in loaded]
        self.assertIn("W-TEST-2", ids, "Fresh+unverified entry should be kept (fresh overrides)")

    # ------------------------------------------------------------------ #
    # Case 3: stale + verified → KEPT (count wins)                         #
    # ------------------------------------------------------------------ #
    def test_stale_and_verified_is_kept(self):
        """Entry that is old (> 30 days) but has high verification count must be kept."""
        entries = [
            {
                "trigger_id": "W-TEST-3",
                "trigger_class": "vocabulary",
                "trigger_pattern": "test_stale_verified",
                "trigger_regex": "test_stale_verified",
                "canonical_resolution": "Old but well-verified entry.",
                "last_verified_ts": _ts(days_ago=STALENESS_DAYS + 10),
                "verification_count": MIN_VERIFICATION_COUNT,
            }
        ]
        _make_registry(entries, self.registry_path)
        loaded = self._load()
        ids = [e["trigger_id"] for e in loaded]
        self.assertIn("W-TEST-3", ids, "Stale+verified entry should be kept")

    # ------------------------------------------------------------------ #
    # Case 4: stale + unverified → DROPPED                                 #
    # ------------------------------------------------------------------ #
    def test_stale_and_unverified_is_dropped(self):
        """Entry that is old (> 30 days) AND low count must be filtered out."""
        entries = [
            {
                "trigger_id": "W-TEST-4",
                "trigger_class": "vocabulary",
                "trigger_pattern": "test_stale_unverified",
                "trigger_regex": "test_stale_unverified",
                "canonical_resolution": "Old and under-verified entry.",
                "last_verified_ts": _ts(days_ago=STALENESS_DAYS + 1),
                "verification_count": 1,
            }
        ]
        _make_registry(entries, self.registry_path)
        loaded = self._load()
        ids = [e["trigger_id"] for e in loaded]
        self.assertNotIn("W-TEST-4", ids, "Stale+unverified entry should be DROPPED")

    # ------------------------------------------------------------------ #
    # Boundary: exactly STALENESS_DAYS old → fresh (not stale)             #
    # ------------------------------------------------------------------ #
    def test_exactly_staleness_days_is_not_stale(self):
        """Entry that is exactly STALENESS_DAYS old (not strictly older) must be kept."""
        entries = [
            {
                "trigger_id": "W-TEST-5",
                "trigger_class": "vocabulary",
                "trigger_pattern": "test_boundary",
                "trigger_regex": "test_boundary",
                "canonical_resolution": "Exactly on the boundary.",
                "last_verified_ts": _ts(days_ago=STALENESS_DAYS),
                "verification_count": 1,
            }
        ]
        _make_registry(entries, self.registry_path)
        loaded = self._load()
        ids = [e["trigger_id"] for e in loaded]
        self.assertIn("W-TEST-5", ids, "Entry exactly at STALENESS_DAYS boundary should be kept")

    # ------------------------------------------------------------------ #
    # Mixed: all 4 canonical cases together                                #
    # ------------------------------------------------------------------ #
    def test_mixed_registry_filters_correctly(self):
        """All 4 canonical cases in one registry — verify counts."""
        entries = [
            {
                "trigger_id": "W-MIX-1",
                "trigger_class": "vocabulary",
                "trigger_pattern": "mix1",
                "trigger_regex": "mix1",
                "canonical_resolution": "Fresh verified.",
                "last_verified_ts": _ts(days_ago=2),
                "verification_count": MIN_VERIFICATION_COUNT,
            },
            {
                "trigger_id": "W-MIX-2",
                "trigger_class": "vocabulary",
                "trigger_pattern": "mix2",
                "trigger_regex": "mix2",
                "canonical_resolution": "Fresh unverified.",
                "last_verified_ts": _ts(days_ago=10),
                "verification_count": 1,
            },
            {
                "trigger_id": "W-MIX-3",
                "trigger_class": "vocabulary",
                "trigger_pattern": "mix3",
                "trigger_regex": "mix3",
                "canonical_resolution": "Stale verified.",
                "last_verified_ts": _ts(days_ago=STALENESS_DAYS + 20),
                "verification_count": MIN_VERIFICATION_COUNT,
            },
            {
                "trigger_id": "W-MIX-4",
                "trigger_class": "vocabulary",
                "trigger_pattern": "mix4",
                "trigger_regex": "mix4",
                "canonical_resolution": "Stale unverified — should drop.",
                "last_verified_ts": _ts(days_ago=STALENESS_DAYS + 5),
                "verification_count": 2,
            },
        ]
        _make_registry(entries, self.registry_path)
        loaded = self._load()
        ids = [e["trigger_id"] for e in loaded]
        self.assertEqual(len(loaded), 3, "Three entries should survive the filter")
        self.assertIn("W-MIX-1", ids)
        self.assertIn("W-MIX-2", ids)
        self.assertIn("W-MIX-3", ids)
        self.assertNotIn("W-MIX-4", ids)


if __name__ == "__main__":
    unittest.main()
