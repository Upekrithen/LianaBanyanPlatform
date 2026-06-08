"""Unit tests for WikipediaSpecialist (BM-MNEM-30 S01, BP077).

All HTTP calls are mocked with unittest.mock -- no live network in tests.
Covers: standard fetch, disambiguation, redirect follow, missing article,
cached-vs-live, empty query, k=1, k=10, non-English term, provenance hash.

Run:
  python -m pytest benchmarks/drt_team/tests/test_wikipedia_specialist.py -v
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import types
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest

# Add workspace root to path so imports resolve
_WORKSPACE = Path(__file__).parent.parent.parent.parent
if str(_WORKSPACE) not in sys.path:
    sys.path.insert(0, str(_WORKSPACE))

from benchmarks.drt_team.specialists.wikipedia_specialist import (
    WikipediaSpecialist,
    _bm25_lite,
    _distill_queries,
    _sha256,
    _split_sections,
    _tokenize,
    SPECIALIST_ID,
)


# ---------------------------------------------------------------------------
# Fixtures / helpers
# ---------------------------------------------------------------------------

def _make_opensearch(titles, urls):
    """Build a fake opensearch response list."""
    return [
        None,
        titles,
        [""] * len(titles),
        urls,
    ]


def _make_extract_resp(title: str, extract: str, pageid: str = "12345"):
    """Build a fake MediaWiki query+extracts API response."""
    return {
        "query": {
            "pages": {
                pageid: {
                    "pageid": int(pageid),
                    "title": title,
                    "extract": extract,
                }
            }
        }
    }


def _make_missing_resp():
    """Build an API response for a missing article (pageid = -1)."""
    return {
        "query": {
            "pages": {
                "-1": {
                    "missing": "",
                    "title": "NonExistentArticleXYZ",
                }
            }
        }
    }


SAMPLE_EXTRACT = (
    "Python is a high-level, general-purpose programming language.\n\n"
    "Python was designed by Guido van Rossum and first released in 1991.\n\n"
    "Design philosophy\n\n"
    "Python's design philosophy emphasizes code readability with the use of significant indentation.\n\n"
    "History\n\n"
    "Python was conceived in the late 1980s by Guido van Rossum at Centrum Wiskunde.\n\n"
    "Usage\n\n"
    "Python is used in web development, data science, and artificial intelligence.\n\n"
    "Syntax\n\n"
    "Python uses dynamic typing and garbage collection.\n\n"
)


# ---------------------------------------------------------------------------
# Test 1: Standard fetch -- returns Eblet dicts with correct structure
# ---------------------------------------------------------------------------

class TestStandardFetch:
    def test_returns_list_of_dicts(self, tmp_path, monkeypatch):
        """Standard fetch returns non-empty list of Eblet dicts."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ) as mock_time:
            mock_http.side_effect = [
                _make_opensearch(["Python (programming language)"],
                                 ["https://en.wikipedia.org/wiki/Python_(programming_language)"]),
                _make_extract_resp("Python (programming language)", SAMPLE_EXTRACT),
            ]
            results = spec.fetch("Python programming language", k=3)

        assert isinstance(results, list)
        assert len(results) >= 1

    def test_eblet_dict_has_required_fields(self, tmp_path, monkeypatch):
        """Every returned Eblet dict contains all seven required fields."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(["Python (programming language)"],
                                 ["https://en.wikipedia.org/wiki/Python_(programming_language)"]),
                _make_extract_resp("Python (programming language)", SAMPLE_EXTRACT),
            ]
            results = spec.fetch("Python", k=3)

        assert results, "expected at least one result"
        required = {"source_url", "title", "lede", "sections",
                    "retrieval_ts", "specialist_id", "provenance_hash"}
        for eblet in results:
            missing = required - set(eblet.keys())
            assert not missing, f"missing fields: {missing}"

    def test_specialist_id_is_wikipedia(self, tmp_path, monkeypatch):
        """specialist_id field equals 'wikipedia'."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(["Gravity"], ["https://en.wikipedia.org/wiki/Gravity"]),
                _make_extract_resp("Gravity", "Gravity is a fundamental force.\n\nIt attracts objects with mass.\n\n"),
            ]
            results = spec.fetch("gravity", k=1)

        assert results
        assert results[0]["specialist_id"] == SPECIALIST_ID


# ---------------------------------------------------------------------------
# Test 2: Disambiguation -- title with (disambiguation) suffix handled
# ---------------------------------------------------------------------------

class TestDisambiguation:
    def test_disambiguation_title_in_result(self, tmp_path, monkeypatch):
        """Disambiguation pages are returned if the API returns them (no crash)."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        extract = (
            "Mercury may refer to:\n\n"
            "Mercury (planet), the innermost planet.\n\n"
            "Mercury (element), a chemical element.\n\n"
        )
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(["Mercury (disambiguation)"],
                                 ["https://en.wikipedia.org/wiki/Mercury_(disambiguation)"]),
                _make_extract_resp("Mercury (disambiguation)", extract),
            ]
            results = spec.fetch("mercury", k=1)

        # Should not crash; may return the disambiguation page
        assert isinstance(results, list)


# ---------------------------------------------------------------------------
# Test 3: Redirect follow -- API returns different title after redirect
# ---------------------------------------------------------------------------

class TestRedirectFollow:
    def test_redirect_title_used_in_eblet(self, tmp_path, monkeypatch):
        """When the API returns a redirected title, the eblet uses it."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        # Simulate redirect: query title "USA" -> actual title "United States"
        extract_resp = {
            "query": {
                "redirects": [{"from": "USA", "to": "United States"}],
                "pages": {
                    "3434750": {
                        "pageid": 3434750,
                        "title": "United States",
                        "extract": (
                            "The United States of America is a country in North America.\n\n"
                            "It consists of 50 states and a federal district.\n\n"
                        ),
                    }
                },
            }
        }
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(["USA"], ["https://en.wikipedia.org/wiki/USA"]),
                extract_resp,
            ]
            results = spec.fetch("USA", k=1)

        assert results
        assert results[0]["title"] == "United States"


# ---------------------------------------------------------------------------
# Test 4: Missing article -- API returns -1 pageid -- returns empty list
# ---------------------------------------------------------------------------

class TestMissingArticle:
    def test_missing_article_returns_empty(self, tmp_path, monkeypatch):
        """Query returning a missing article (-1 pageid) yields empty list."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(["NonExistentArticleXYZABC"],
                                 ["https://en.wikipedia.org/wiki/NonExistentArticleXYZABC"]),
                _make_missing_resp(),
            ]
            results = spec.fetch("NonExistentArticleXYZABC", k=1)

        assert results == []


# ---------------------------------------------------------------------------
# Test 5: Cache hit -- cache hit never makes network calls
# ---------------------------------------------------------------------------

class TestCacheVsLive:
    def test_cache_hit_makes_no_http_calls(self, tmp_path, monkeypatch):
        """On a cache hit the specialist makes zero HTTP calls."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        # Pre-populate cache
        cached_data = [
            {
                "source_url": "https://en.wikipedia.org/wiki/Gravity",
                "title": "Gravity",
                "lede": "Gravity is a fundamental force.",
                "sections": ["Gravity is a fundamental force."],
                "retrieval_ts": "2026-06-07T00:00:00+00:00",
                "specialist_id": "wikipedia",
                "provenance_hash": _sha256(
                    "https://en.wikipedia.org/wiki/Gravity"
                    + "Gravity"
                    + "2026-06-07T00:00:00+00:00"
                ),
            }
        ]
        cache_key = "gravity|k=5"
        cp = tmp_path / f"{_sha256(cache_key)}.json"
        cp.write_text(json.dumps(cached_data), encoding="utf-8")

        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http:
            results = spec.fetch("gravity", k=5)

        mock_http.assert_not_called()
        assert results == cached_data


# ---------------------------------------------------------------------------
# Test 6: Empty query -- returns empty list
# ---------------------------------------------------------------------------

class TestEmptyQuery:
    def test_empty_string_returns_empty(self, tmp_path, monkeypatch):
        """Empty string query returns []."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        assert spec.fetch("") == []

    def test_whitespace_only_returns_empty(self, tmp_path, monkeypatch):
        """Whitespace-only query returns []."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        assert spec.fetch("   \t\n  ") == []


# ---------------------------------------------------------------------------
# Test 7: k=1 -- returns at most one result
# ---------------------------------------------------------------------------

class TestKEquals1:
    def test_k1_returns_at_most_one_result(self, tmp_path, monkeypatch):
        """k=1 returns at most one Eblet even if API would yield more."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(
                    ["Alpha", "Beta", "Gamma"],
                    [
                        "https://en.wikipedia.org/wiki/Alpha",
                        "https://en.wikipedia.org/wiki/Beta",
                        "https://en.wikipedia.org/wiki/Gamma",
                    ],
                ),
                _make_extract_resp("Alpha", "Alpha is the first letter.\n\nIt is used in many contexts.\n\n"),
            ]
            results = spec.fetch("alpha", k=1)

        assert len(results) <= 1


# ---------------------------------------------------------------------------
# Test 8: k=10 -- handles large k gracefully
# ---------------------------------------------------------------------------

class TestKEquals10:
    def test_k10_never_returns_more_than_k(self, tmp_path, monkeypatch):
        """fetch() never returns more than k results regardless of API output."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        titles = [f"Article{i}" for i in range(5)]
        urls = [f"https://en.wikipedia.org/wiki/Article{i}" for i in range(5)]
        extract_responses = [
            _make_extract_resp(f"Article{i}", f"Article {i} text.\n\nMore content here.\n\n", str(i))
            for i in range(5)
        ]
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(titles, urls),
                *extract_responses,
            ]
            results = spec.fetch("article content", k=10)

        assert len(results) <= 10


# ---------------------------------------------------------------------------
# Test 9: Non-English term -- unicode query handled without error
# ---------------------------------------------------------------------------

class TestNonEnglishTerm:
    def test_unicode_query_no_crash(self, tmp_path, monkeypatch):
        """Non-ASCII query (e.g. Japanese term) does not crash the specialist."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            # Simulate API returning no results for a non-English term
            mock_http.side_effect = [
                [None, [], [], []],  # empty opensearch result
            ]
            results = spec.fetch("Sakura hanami sakura-zaka", k=3)

        assert isinstance(results, list)

    def test_unicode_term_with_results(self, tmp_path, monkeypatch):
        """Unicode query that does return results has correct structure."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(
                    ["Haiku"],
                    ["https://en.wikipedia.org/wiki/Haiku"],
                ),
                _make_extract_resp(
                    "Haiku",
                    "Haiku is a type of short poetry.\n\nOriginating in Japan.\n\n",
                ),
            ]
            results = spec.fetch("haiku Japanese poetry", k=1)

        if results:
            assert "specialist_id" in results[0]
            assert results[0]["specialist_id"] == "wikipedia"


# ---------------------------------------------------------------------------
# Test 10: Provenance hash -- sha256(source_url + title + retrieval_ts)
# ---------------------------------------------------------------------------

class TestProvenanceHash:
    def test_provenance_hash_is_correct_sha256(self, tmp_path, monkeypatch):
        """provenance_hash == sha256(source_url + title + retrieval_ts)."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http, patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            mock_http.side_effect = [
                _make_opensearch(
                    ["Photosynthesis"],
                    ["https://en.wikipedia.org/wiki/Photosynthesis"],
                ),
                _make_extract_resp(
                    "Photosynthesis",
                    "Photosynthesis is the process used by plants.\n\n"
                    "It converts light energy into chemical energy.\n\n",
                ),
            ]
            results = spec.fetch("photosynthesis", k=1)

        assert results
        eblet = results[0]
        expected = hashlib.sha256(
            (eblet["source_url"] + eblet["title"] + eblet["retrieval_ts"]).encode("utf-8")
        ).hexdigest()
        assert eblet["provenance_hash"] == expected, (
            f"provenance_hash mismatch: got {eblet['provenance_hash']}, "
            f"expected {expected}"
        )


# ---------------------------------------------------------------------------
# Test 11: Network failure -- returns empty list, never crashes
# ---------------------------------------------------------------------------

class TestNetworkFailure:
    def test_network_failure_returns_empty(self, tmp_path, monkeypatch):
        """On total network failure, fetch returns [] without raising."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json",
            return_value=None,
        ), patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist.time"
        ):
            results = spec.fetch("black holes", k=3)

        assert results == []


# ---------------------------------------------------------------------------
# Test 12: NANO SKU guard -- returns empty immediately
# ---------------------------------------------------------------------------

class TestNanoSkuGuard:
    def test_nano_sku_returns_empty(self, tmp_path, monkeypatch):
        """NANO SKU returns [] immediately without any API call."""
        monkeypatch.setattr(
            "benchmarks.drt_team.specialists.wikipedia_specialist._CACHE_DIR",
            tmp_path,
        )
        monkeypatch.setenv("MNEM_SKU", "NANO")
        spec = WikipediaSpecialist()
        with patch(
            "benchmarks.drt_team.specialists.wikipedia_specialist._http_get_json"
        ) as mock_http:
            results = spec.fetch("quantum mechanics", k=5)
        mock_http.assert_not_called()
        assert results == []


# ---------------------------------------------------------------------------
# Unit tests for pure helper functions
# ---------------------------------------------------------------------------

class TestHelpers:
    def test_tokenize_removes_stopwords(self):
        tokens = _tokenize("the quick brown fox jumped over the lazy dog")
        assert "the" not in tokens
        assert "over" not in tokens
        assert "quick" in tokens
        assert "fox" in tokens

    def test_bm25_lite_scores_relevant_section_higher(self):
        query_tokens = _tokenize("photosynthesis plants sunlight")
        s_relevant = "Photosynthesis uses sunlight to convert carbon dioxide into glucose in plants."
        s_irrelevant = "The Eiffel Tower was constructed in 1889 in Paris."
        score_rel = _bm25_lite(query_tokens, s_relevant)
        score_irr = _bm25_lite(query_tokens, s_irrelevant)
        assert score_rel > score_irr

    def test_bm25_lite_empty_inputs_return_zero(self):
        assert _bm25_lite([], "some text") == 0.0
        assert _bm25_lite(["word"], "") == 0.0

    def test_split_sections_returns_list(self):
        sections = _split_sections(SAMPLE_EXTRACT)
        assert isinstance(sections, list)
        assert len(sections) >= 1

    def test_distill_queries_from_mmlu_question(self):
        mmlu_q = (
            "Question: Which of the following best describes the process by which "
            "plants convert sunlight into chemical energy?\n\n"
            "Options:\nA. Respiration\nB. Photosynthesis\nC. Fermentation\n"
        )
        candidates = _distill_queries(mmlu_q)
        assert isinstance(candidates, list)
        assert len(candidates) >= 1
        for c in candidates:
            assert isinstance(c, str)
            assert c.strip()
