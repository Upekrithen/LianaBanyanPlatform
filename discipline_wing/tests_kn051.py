"""
Tests KN051 — Wrasse Engine EBLET_PATH-Class Trigger Extension
6 tests covering all Phase D requirements + regression for existing trigger classes.
Pod R / BP005 Federation Tooling.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

_WORKSPACE = Path(__file__).parent.parent
sys.path.insert(0, str(_WORKSPACE))

# Wrasse lookup is in librarian-mcp/stitchpunks/wrasse/
_WRASSE_DIR = _WORKSPACE / "librarian-mcp" / "stitchpunks" / "wrasse"
sys.path.insert(0, str(_WORKSPACE / "librarian-mcp" / "stitchpunks" / "wrasse"))
sys.path.insert(0, str(_WORKSPACE / "librarian-mcp" / "stitchpunks"))

from wrasse_lookup import (
    lookup,
    MAX_INJECTION_TOKENS,
    MAX_INJECTION_CHARS,
    _CHARS_PER_TOKEN,
    _resolve_eblet_path_content,
    _summarize_on_load,
    _find_eblet_file,
    clear_eblet_cache,
    _EBLET_PATH_CACHE,
    REGISTRY_PATH,
)


def _make_registry_entry(
    trigger_id: str,
    trigger_class: str,
    trigger_pattern: str,
    canonical_resolution: str,
    trigger_regex: str,
) -> dict:
    return {
        "trigger_id": trigger_id,
        "trigger_class": trigger_class,
        "trigger_pattern": trigger_pattern,
        "trigger_regex": trigger_regex,
        "canonical_resolution": canonical_resolution,
        "last_verified_ts": "2026-04-30T00:00:00+00:00",
        "verification_count": 3,
        "source_session": "KN051",
    }


def _write_registry(entries: list[dict], path: Path) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        for e in entries:
            fh.write(json.dumps(e) + "\n")


def _write_small_eblet(path: Path, lines: int = 30) -> str:
    """Write a small eblet file under MAX_INJECTION_CHARS."""
    content = "---\neblet_class: Canon\nlayer: 3\n---\n\n# Test Canon Eblet\n\n"
    content += "\n".join(f"Line {i}: some content here." for i in range(lines))
    path.write_text(content, encoding="utf-8")
    return content


def _write_large_eblet(path: Path) -> str:
    """Write a large eblet file exceeding MAX_INJECTION_CHARS."""
    content = "---\neblet_class: Lore\nlayer: 5\n---\n\n# Large Lore Eblet\n\n"
    # Each line ~50 chars; need > MAX_INJECTION_CHARS chars total
    line = "A" * 50 + "\n"
    needed_lines = (MAX_INJECTION_CHARS // 50) + 10
    content += line * needed_lines
    path.write_text(content, encoding="utf-8")
    return content


class TestT01EbletPathTriggerFires(unittest.TestCase):
    """T01: When registered eblet_path pattern matches, lookup returns auto-loaded content."""

    def test_eblet_path_trigger_fires_on_match(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)
            eblet_file = tmpdir_path / "test.eblet.md"
            expected_content = _write_small_eblet(eblet_file)

            registry_path = tmpdir_path / "registry.jsonl"
            entries = [_make_registry_entry(
                trigger_id="W-500",
                trigger_class="eblet_path",
                trigger_pattern=str(eblet_file),
                canonical_resolution=str(eblet_file),
                trigger_regex=r"test\.eblet",
            )]
            _write_registry(entries, registry_path)

            clear_eblet_cache()
            results = lookup(["test.eblet"], path=registry_path)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "eblet_path")
            self.assertEqual(results[0]["canonical_resolution"], expected_content)

    def test_non_matching_query_returns_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            registry_path = Path(tmpdir) / "registry.jsonl"
            _write_registry([], registry_path)
            results = lookup(["totally_unrelated_term_xyz"], path=registry_path)
            self.assertEqual(results, [])


class TestT02SmallEbletFullLoad(unittest.TestCase):
    """T02: Under 2000 tokens — full content returned."""

    def test_small_eblet_returns_full_content(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "small.eblet.md"
            content = _write_small_eblet(eblet_file)
            self.assertLessEqual(len(content), MAX_INJECTION_CHARS)

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            self.assertEqual(result, content)

    def test_size_at_boundary(self):
        """A file exactly at the size cap returns full content."""
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "boundary.eblet.md"
            boundary_content = "x" * MAX_INJECTION_CHARS
            eblet_file.write_text(boundary_content, encoding="utf-8")

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            self.assertEqual(result, boundary_content)


class TestT03LargeEbletSummaryFallback(unittest.TestCase):
    """T03: Over 2000 tokens — summary returned with pointer to full path."""

    def test_large_eblet_returns_summary(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "large.eblet.md"
            _write_large_eblet(eblet_file)

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            self.assertIn("exceeds size cap", result)
            self.assertIn(str(eblet_file), result)
            self.assertIn("Read full at:", result)

    def test_summary_includes_path_pointer(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "large2.eblet.md"
            _write_large_eblet(eblet_file)

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            self.assertIn(str(eblet_file), result)

    def test_summary_includes_title(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "large3.eblet.md"
            _write_large_eblet(eblet_file)

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            self.assertIn("Large Lore Eblet", result)


class TestT04SizeCapEnforcement(unittest.TestCase):
    """T04: No token overage — content never exceeds MAX_INJECTION_CHARS in resolution."""

    def test_small_content_no_overage(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "small_cap.eblet.md"
            _write_small_eblet(eblet_file)

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            self.assertLessEqual(len(result), MAX_INJECTION_CHARS)

    def test_large_content_summary_is_short(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "large_cap.eblet.md"
            _write_large_eblet(eblet_file)

            clear_eblet_cache()
            result = _resolve_eblet_path_content(str(eblet_file), "fallback")
            # Summary should be much shorter than the original large content
            original_size = eblet_file.stat().st_size
            self.assertLess(len(result), original_size)

    def test_max_injection_tokens_value(self):
        self.assertEqual(MAX_INJECTION_TOKENS, 2000)


class TestT05CacheHitWithinSession(unittest.TestCase):
    """T05: Repeated trigger same path = cache hit, no re-read."""

    def test_cache_populated_on_first_load(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "cached.eblet.md"
            content = _write_small_eblet(eblet_file)
            path_key = str(eblet_file)

            clear_eblet_cache()
            self.assertNotIn(path_key, _EBLET_PATH_CACHE)

            _resolve_eblet_path_content(path_key, "fallback")
            self.assertIn(path_key, _EBLET_PATH_CACHE)

    def test_cache_returns_same_content_on_second_call(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "cached2.eblet.md"
            content = _write_small_eblet(eblet_file)
            path_key = str(eblet_file)

            clear_eblet_cache()
            first_result = _resolve_eblet_path_content(path_key, "fallback")
            second_result = _resolve_eblet_path_content(path_key, "fallback")
            self.assertEqual(first_result, second_result)

    def test_clear_cache_removes_entries(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            eblet_file = Path(tmpdir) / "cached3.eblet.md"
            _write_small_eblet(eblet_file)
            path_key = str(eblet_file)

            _resolve_eblet_path_content(path_key, "fallback")
            self.assertIn(path_key, _EBLET_PATH_CACHE)

            clear_eblet_cache()
            self.assertNotIn(path_key, _EBLET_PATH_CACHE)


class TestT06RegressionExistingTriggerClasses(unittest.TestCase):
    """T06: vocabulary, file_path, canonical_number, k_prefix, ts_prefix, call_sign still work."""

    def _make_test_registry(self, tmpdir: Path) -> Path:
        registry_path = tmpdir / "registry.jsonl"
        entries = [
            _make_registry_entry("W-100", "vocabulary", "Pheromone Substrate",
                                 "A&A #2317 — substrate for social authority decisions",
                                 r"\bPheromone\s+Substrate\b"),
            _make_registry_entry("W-101", "k_prefix", "K461",
                                 "K461 = Knight Cathedral Instantiation session",
                                 r"\bK461\b"),
            _make_registry_entry("W-102", "ts_prefix", "TS-011",
                                 "TS-011 = Test scenario 11",
                                 r"\bTS-011\b"),
            _make_registry_entry("W-103", "call_sign", "v-wrasse-engine-eblet-path-class-KN051",
                                 "KN051 tag = Wrasse eblet_path trigger extension",
                                 r"v-wrasse-engine-eblet-path-class-KN051"),
            _make_registry_entry("W-104", "file_path", "stitchpunks/wrasse/wrasse_lookup.py",
                                 "Wrasse lookup engine — path resolution",
                                 r"wrasse_lookup\.py"),
            _make_registry_entry("W-105", "canonical_number", "2317",
                                 "Innovation #2317 — Pheromone Substrate",
                                 r"\b2317\b"),
        ]
        _write_registry(entries, registry_path)
        return registry_path

    def test_vocabulary_trigger_resolves(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["Pheromone Substrate"], path=reg)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "vocabulary")
            self.assertNotIn("exceeds size cap", results[0]["canonical_resolution"])

    def test_k_prefix_trigger_resolves(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["K461"], path=reg)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "k_prefix")

    def test_ts_prefix_trigger_resolves(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["TS-011"], path=reg)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "ts_prefix")

    def test_call_sign_trigger_resolves(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["v-wrasse-engine-eblet-path-class-KN051"], path=reg)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "call_sign")

    def test_file_path_trigger_resolves(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["wrasse_lookup.py"], path=reg)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "file_path")

    def test_canonical_number_trigger_resolves(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["#2317"], path=reg)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["trigger_class"], "canonical_number")

    def test_non_eblet_classes_return_canonical_resolution_unchanged(self):
        """Verify non-eblet_path classes don't attempt file loading."""
        with tempfile.TemporaryDirectory() as tmpdir:
            reg = self._make_test_registry(Path(tmpdir))
            results = lookup(["K461"], path=reg)
            self.assertEqual(results[0]["canonical_resolution"],
                             "K461 = Knight Cathedral Instantiation session")


if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
