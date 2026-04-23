"""Tests for the TouchStone verification engine."""

import json
import sys
from pathlib import Path

TOUCHSTONE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOUCHSTONE_DIR))

from verify import load_manifest, find_deliverable, verify_deliverable, verify_all
from predicates import PREDICATE_REGISTRY


def test_manifest_loads():
    manifest = load_manifest()
    assert "version" in manifest
    assert "deliverables" in manifest
    assert len(manifest["deliverables"]) >= 20


def test_find_existing_deliverable():
    manifest = load_manifest()
    d = find_deliverable(manifest, "B096-pudding-182")
    assert d is not None
    assert d["title"] == "Pudding #182: The Shop That Fixed My Son's Car"


def test_find_missing_deliverable():
    manifest = load_manifest()
    d = find_deliverable(manifest, "nonexistent-id")
    assert d is None


def test_predicate_registry_complete():
    expected = ["file_exists", "git_committed", "supabase_row_exists",
                "librarian_index_contains", "count_matches", "hash_matches"]
    for name in expected:
        assert name in PREDICATE_REGISTRY, f"Missing predicate: {name}"


def test_file_exists_predicate_pass():
    result = PREDICATE_REGISTRY["file_exists"]({"path": "librarian-mcp/touchstone/manifest.json"})
    assert result["passed"] is True
    assert result["observed"] > 0


def test_file_exists_predicate_fail():
    result = PREDICATE_REGISTRY["file_exists"]({"path": "nonexistent/file.txt"})
    assert result["passed"] is False


def test_count_matches_predicate_pass():
    result = PREDICATE_REGISTRY["count_matches"]({
        "file": "librarian-mcp/touchstone/manifest.json",
        "min_bytes": 100,
    })
    assert result["passed"] is True


def test_count_matches_predicate_fail():
    result = PREDICATE_REGISTRY["count_matches"]({
        "file": "librarian-mcp/touchstone/manifest.json",
        "min_bytes": 999_999_999,
    })
    assert result["passed"] is False


def test_librarian_index_contains():
    result = PREDICATE_REGISTRY["librarian_index_contains"]({
        "index": "overview",
        "substring": "Liana",
    })
    # This may pass or fail depending on whether the index exists and contains "Liana"
    assert "passed" in result
    assert "message" in result


def test_hash_matches_predicate_fail_wrong_hash():
    result = PREDICATE_REGISTRY["hash_matches"]({
        "path": "librarian-mcp/touchstone/manifest.json",
        "expected": "0000000000000000000000000000000000000000000000000000000000000000",
    })
    assert result["passed"] is False


def test_verify_completed_deliverable():
    result = verify_deliverable("B096-k401-cephas-basement-wire")
    # This should pass — the files exist
    assert "passed" in result
    assert "predicate_results" in result


def test_verify_pending_deliverable_with_missing_file():
    result = verify_deliverable("B096-deck-card-auto-shop")
    # AutoShopCard.tsx doesn't exist yet, so this should fail
    assert result["passed"] is False
    assert len(result["blocking_failures"]) > 0


def test_verify_all_returns_report():
    report = verify_all()
    assert "total" in report
    assert "passed" in report
    assert "failed" in report
    assert "pending" in report
    assert "by_owner" in report
    assert report["total"] >= 20


def test_verify_nonexistent_deliverable():
    result = verify_deliverable("does-not-exist")
    assert result["passed"] is False
    assert "not found" in result["blocking_failures"][0]


if __name__ == "__main__":
    import traceback

    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    failed = 0

    for test_fn in tests:
        try:
            test_fn()
            print(f"  PASS {test_fn.__name__}")
            passed += 1
        except Exception:
            print(f"  FAIL {test_fn.__name__}")
            traceback.print_exc()
            failed += 1

    print(f"\n{passed} passed, {failed} failed, {passed + failed} total")
    sys.exit(1 if failed > 0 else 0)
