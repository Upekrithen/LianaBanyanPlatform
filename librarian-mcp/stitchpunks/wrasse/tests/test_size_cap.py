"""
Unit tests for the Wrasse injection size cap.
K-Wrasse-Wiring-Hardening / B133 — Phase E condition 2.

Tests:
  1. Cap fires when synthetic registry produces over-cap output
  2. Final output stays under MAX_INJECTION_TOKENS
  3. Truncation note appears in output when cap fires
  4. Dropped entries are oldest-verified-first (oldest last_verified_ts dropped first)
  5. Cap does NOT fire when block is small enough
"""

import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from wrasse_inject import (
    generate_knight_prelude,
    generate_pawn_prelude,
    MAX_INJECTION_TOKENS,
    _estimate_tokens,
)
from wrasse_lookup import _load_registry, REGISTRY_PATH


def _ts(days_ago: int) -> str:
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


SHARED_TRIGGER_REGEX = "WRASSE_CAP_TEST"
SHARED_QUERY = "WRASSE_CAP_TEST"


def _make_large_registry(path: Path, n_entries: int = 30, resolution_chars: int = 500) -> list:
    """
    Write a synthetic registry with n_entries, each with a large resolution string.
    All entries share SHARED_TRIGGER_REGEX so a single query term matches all of them.
    Returns the list of trigger_ids in insertion order (oldest timestamp at index 0).
    """
    entries = []
    ids = []
    with open(path, "w", encoding="utf-8") as fh:
        header = {"type": "header", "scribe_id": "WrasseRegistry", "version": "2.0.0"}
        fh.write(json.dumps(header) + "\n")
        for i in range(n_entries):
            tid = f"W-CAP-{i:03d}"
            ids.append(tid)
            # Spread timestamps: entry 0 = oldest (n days ago), entry n-1 = newest (1 day ago)
            days = n_entries - i  # entry 0 → 30 days ago (oldest), entry 29 → 1 day ago
            resolution = (f"Resolution for {tid} {SHARED_TRIGGER_REGEX}. " + "X" * resolution_chars)[:resolution_chars]
            entry = {
                "trigger_id": tid,
                "trigger_class": "vocabulary",
                "trigger_pattern": f"wrasse_cap_test_{i}",
                "trigger_regex": SHARED_TRIGGER_REGEX,
                "canonical_resolution": resolution,
                "last_verified_ts": _ts(days_ago=days),
                "verification_count": 5,
            }
            entries.append(entry)
            fh.write(json.dumps(entry) + "\n")
    return ids


class TestSizeCap(unittest.TestCase):
    """Validate MAX_INJECTION_TOKENS enforcement in generate_knight_prelude."""

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.registry_path = Path(self.tmp_dir.name) / "wrasse_registry.jsonl"

    def tearDown(self):
        self.tmp_dir.cleanup()
        import wrasse_lookup
        wrasse_lookup._CACHE = []
        wrasse_lookup._CACHE_MTIME = 0.0
        import wrasse_inject
        # Reset any module-level state if needed

    def _generate(self, query: str = "test_cap", **kwargs) -> str:
        """Generate knight prelude using our synthetic registry."""
        import wrasse_lookup
        wrasse_lookup.REGISTRY_PATH = self.registry_path
        wrasse_lookup._CACHE = []
        wrasse_lookup._CACHE_MTIME = 0.0

        import wrasse_inject
        original_lookup = wrasse_inject.lookup
        original_lookup_for_session = wrasse_inject.lookup_for_session

        # Patch lookup to use our synthetic path
        import functools
        from wrasse_lookup import lookup as real_lookup, lookup_for_session as real_lfs

        patched_lookup = functools.partial(real_lookup, path=self.registry_path)
        patched_lfs = functools.partial(real_lfs, path=self.registry_path)

        wrasse_inject.lookup = patched_lookup
        wrasse_inject.lookup_for_session = patched_lfs

        try:
            result = generate_knight_prelude([query], max_matches=30, session_id="K-TEST")
        finally:
            wrasse_inject.lookup = original_lookup
            wrasse_inject.lookup_for_session = original_lookup_for_session

        return result

    # ------------------------------------------------------------------ #
    # Test 1: cap fires with 30 entries × 500 chars each                   #
    # ------------------------------------------------------------------ #
    def test_cap_fires(self):
        """30 entries × 500 chars each must exceed cap and trigger truncation."""
        ids = _make_large_registry(self.registry_path, n_entries=30, resolution_chars=500)
        output = self._generate(query=SHARED_QUERY)
        entry_count = output.count("[W-CAP-")
        self.assertLess(entry_count, 30, "Cap should have dropped some entries")

    # ------------------------------------------------------------------ #
    # Test 2: output under MAX_INJECTION_TOKENS                            #
    # ------------------------------------------------------------------ #
    def test_output_under_cap(self):
        """Output token estimate must not exceed MAX_INJECTION_TOKENS."""
        _make_large_registry(self.registry_path, n_entries=30, resolution_chars=500)
        output = self._generate(query=SHARED_QUERY)
        estimated = _estimate_tokens(output)
        self.assertLessEqual(
            estimated,
            MAX_INJECTION_TOKENS,
            f"Output {estimated} tokens exceeds cap {MAX_INJECTION_TOKENS}",
        )

    # ------------------------------------------------------------------ #
    # Test 3: truncation note appears                                      #
    # ------------------------------------------------------------------ #
    def test_truncation_note_appears(self):
        """Truncation note must appear when cap fires."""
        _make_large_registry(self.registry_path, n_entries=30, resolution_chars=500)
        output = self._generate(query=SHARED_QUERY)
        self.assertIn(
            f"[Wrasse: dropped",
            output,
            "Truncation note must appear in output when cap fires",
        )
        self.assertIn(
            f"MAX_INJECTION_TOKENS={MAX_INJECTION_TOKENS}",
            output,
            "Truncation note must include cap value",
        )

    # ------------------------------------------------------------------ #
    # Test 4: dropped entries are oldest-verified-first                    #
    # ------------------------------------------------------------------ #
    def test_dropped_entries_are_oldest_first(self):
        """When cap fires, the oldest-verified entries (smallest ts) are dropped first."""
        ids = _make_large_registry(self.registry_path, n_entries=30, resolution_chars=500)
        output = self._generate(query=SHARED_QUERY)

        # Determine which IDs survived (appear in output)
        surviving = [tid for tid in ids if tid in output]
        dropped = [tid for tid in ids if tid not in output]

        self.assertGreater(len(dropped), 0, "At least one entry should be dropped")

        # Entries are created with oldest timestamp at W-CAP-000
        # Surviving entries should all have higher indices than dropped entries
        # (i.e., dropped entries have lower indices = older timestamps)
        if surviving and dropped:
            max_dropped_idx = max(int(tid.split("-")[-1]) for tid in dropped)
            min_surviving_idx = min(int(tid.split("-")[-1]) for tid in surviving)
            self.assertLessEqual(
                max_dropped_idx,
                min_surviving_idx,
                "Dropped entries should have lower indices (older timestamps) than surviving entries",
            )

    # ------------------------------------------------------------------ #
    # Test 5: cap does NOT fire for small input                            #
    # ------------------------------------------------------------------ #
    def test_no_cap_for_small_input(self):
        """Small registry must pass through unchanged (no truncation note)."""
        # 5 entries × 50 chars — well under cap
        _make_large_registry(self.registry_path, n_entries=5, resolution_chars=50)
        output = self._generate(query=SHARED_QUERY)
        self.assertNotIn(
            "[Wrasse: dropped",
            output,
            "No truncation note should appear for small input",
        )
        # All 5 entries should be present
        surviving = [f"W-CAP-{i:03d}" for i in range(5) if f"W-CAP-{i:03d}" in output]
        self.assertEqual(len(surviving), 5, "All 5 entries should survive")


if __name__ == "__main__":
    unittest.main()
