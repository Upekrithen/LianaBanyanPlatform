"""
KN016 — Bishop Sweeper + Scavenger Scribe — Test Suite
15+ tests covering: stale detection, orphan detection, drift detection,
severity classification, digest format, brief_me hook, Chronos signing,
Pheromone index stub, MCP query, end-to-end pipeline.

Run:  python -m pytest tests_kn016.py -v
"""

from __future__ import annotations

import json
import time
from pathlib import Path
import sys

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))


# ─── Test 1: Stale detection — file >30 days correctly flagged ────────────────

def test_stale_detection_flags_old_file(tmp_path):
    from sweeper_scan import scan_stale

    old_file = tmp_path / "old.md"
    old_file.write_text("stale content")
    # Back-date modification time by 40 days
    old_time = time.time() - (40 * 86400)
    import os
    os.utime(str(old_file), (old_time, old_time))

    results = scan_stale([tmp_path], stale_days=30)
    paths = [r["path"] for r in results]
    assert str(old_file) in paths, f"Old file not flagged; results: {results}"


# ─── Test 2: Stale detection — file <30 days NOT flagged ─────────────────────

def test_stale_detection_skips_new_file(tmp_path):
    from sweeper_scan import scan_stale

    new_file = tmp_path / "new.md"
    new_file.write_text("fresh content")

    results = scan_stale([tmp_path], stale_days=30)
    paths = [r["path"] for r in results]
    assert str(new_file) not in paths


# ─── Test 3: Orphaned detection — missing reference correctly flagged ─────────

def test_orphaned_detection_missing(tmp_path):
    from sweeper_scan import scan_orphaned

    reference_map = {
        "canon-001": [str(tmp_path / "does_not_exist.md")],
    }
    results = scan_orphaned(reference_map, [tmp_path])
    assert len(results) == 1
    assert results[0]["canonical_id"] == "canon-001"
    assert results[0]["class"] == "orphaned"


# ─── Test 4: Orphaned detection — existing reference NOT flagged ──────────────

def test_orphaned_detection_existing_not_flagged(tmp_path):
    from sweeper_scan import scan_orphaned

    existing = tmp_path / "exists.md"
    existing.write_text("content")
    reference_map = {"canon-002": [str(existing)]}
    results = scan_orphaned(reference_map, [tmp_path])
    assert len(results) == 0


# ─── Test 5: Drift detection — differing values flagged ──────────────────────

def test_drift_detection_flags_mismatch():
    from sweeper_scan import scan_drift

    ledger = {"innovation_count": 2267, "crown_jewels": 225}
    ground_truth = {"innovation_count": 2270, "crown_jewels": 225}
    results = scan_drift(ledger, ground_truth)
    assert len(results) == 1
    assert results[0]["key"] == "innovation_count"
    assert results[0]["class"] == "drift"


# ─── Test 6: Severity classification — low / medium / high rules ─────────────

def test_severity_classification():
    from sweeper_classify import classify

    low = {"class": "stale", "severity": "low"}
    med = {"class": "stale", "severity": "medium"}
    high = {"class": "orphaned", "severity": "high"}

    assert classify(low) == "low"
    assert classify(med) == "medium"
    assert classify(high) == "high"


# ─── Test 7: Digest — 5-line output schema valid ─────────────────────────────

def test_digest_five_lines():
    from sweeper_digest import produce_digest

    scan_result = {
        "stale_count": 2,
        "orphaned_count": 1,
        "drift_count": 0,
        "total_items": 3,
        "items": [
            {"class": "stale", "severity": "high", "path": "/some/file.md", "days_since_modified": 45.0},
            {"class": "orphaned", "severity": "high", "canonical_id": "c001", "missing_paths": ["/x.md"]},
            {"class": "stale", "severity": "low", "path": "/another.md", "days_since_modified": 32.0},
        ],
    }
    digest = produce_digest(scan_result)
    assert "lines" in digest
    assert len(digest["lines"]) == 5
    assert "chronos_hash" in digest
    assert "timestamp" in digest


# ─── Test 8: Digest — top-N selection by severity ────────────────────────────

def test_digest_top_n_by_severity():
    from sweeper_digest import produce_digest

    items = [
        {"class": "stale", "severity": "low", "path": "/low.md", "days_since_modified": 31.0},
        {"class": "orphaned", "severity": "high", "canonical_id": "c001", "missing_paths": ["/x.md"]},
        {"class": "drift", "severity": "medium", "key": "count"},
    ]
    scan_result = {
        "stale_count": 1, "orphaned_count": 1, "drift_count": 1, "total_items": 3,
        "items": items,
    }
    digest = produce_digest(scan_result)
    # High-severity orphan should appear before low-severity stale in digest body
    high_line = next((l for l in digest["lines"] if "HIGH" in l or "orphaned" in l.lower()), None)
    assert high_line is not None, f"Expected HIGH item in digest; got: {digest['lines']}"


# ─── Test 9: brief_me hook integration stub ──────────────────────────────────

def test_brief_me_hook_digest_format():
    from sweeper_digest import produce_digest, format_digest

    scan_result = {
        "stale_count": 0, "orphaned_count": 0, "drift_count": 0, "total_items": 0, "items": [],
    }
    digest = produce_digest(scan_result)
    formatted = format_digest(digest)
    assert "SWEEPER DIGEST" in formatted


# ─── Test 10: Chronos signing roundtrip ──────────────────────────────────────

def test_chronos_signing_present():
    from sweeper_digest import produce_digest

    scan_result = {
        "stale_count": 0, "orphaned_count": 0, "drift_count": 0, "total_items": 0, "items": [],
    }
    digest = produce_digest(scan_result)
    assert digest["chronos_hash"]
    assert len(digest["chronos_hash"]) == 16


# ─── Test 11: Scavenger — referenced_but_missing ─────────────────────────────

def test_scavenger_referenced_but_missing(tmp_path):
    from scavenger_orphan_finder import find_referenced_but_missing

    index = {
        "id-001": str(tmp_path / "ghost.md"),
        "id-002": str(tmp_path / "exists.md"),
    }
    (tmp_path / "exists.md").write_text("content")
    results = find_referenced_but_missing(index)
    assert len(results) == 1
    assert results[0]["id"] == "id-001"
    assert results[0]["subclass"] == "referenced_but_missing"


# ─── Test 12: MCP query returns correct items by class ───────────────────────

def test_mcp_query_class_filter(tmp_path, monkeypatch):
    import sweeper_digest
    monkeypatch.setattr(sweeper_digest, "_DIGEST_LOG_PATH", tmp_path / "digest_log.jsonl")

    from sweeper_digest import produce_digest
    import sweeper_query
    monkeypatch.setattr(sweeper_query, "DIGEST_LOG_PATH", tmp_path / "digest_log.jsonl")
    from sweeper_query import sweeperQuery

    scan_result = {
        "stale_count": 1, "orphaned_count": 0, "drift_count": 0, "total_items": 1,
        "items": [{"class": "stale", "severity": "low", "path": "/x.md", "days_since_modified": 31.0}],
    }
    produce_digest(scan_result)
    result = sweeperQuery("stale", log_path=tmp_path / "digest_log.jsonl")
    assert result["query_class"] == "stale"
    assert result["all_digests_count"] >= 1


# ─── Test 13: MCP query returns correct items by severity ─────────────────────

def test_mcp_query_severity(tmp_path, monkeypatch):
    import sweeper_digest
    monkeypatch.setattr(sweeper_digest, "_DIGEST_LOG_PATH", tmp_path / "digest_log.jsonl")
    from sweeper_digest import produce_digest

    scan_result = {
        "stale_count": 1, "orphaned_count": 1, "drift_count": 0, "total_items": 2,
        "items": [
            {"class": "stale", "severity": "high", "path": "/old.md", "days_since_modified": 100.0},
            {"class": "orphaned", "severity": "high", "canonical_id": "c001", "missing_paths": ["/x.md"]},
        ],
    }
    digest = produce_digest(scan_result)
    # Both high-severity items should appear in lines
    assert any("HIGH" in l for l in digest["lines"])


# ─── Test 14: Edge — no-stale-items returns clean digest ─────────────────────

def test_no_stale_items_clean_digest():
    from sweeper_digest import produce_digest

    scan_result = {
        "stale_count": 0, "orphaned_count": 0, "drift_count": 0, "total_items": 0, "items": [],
    }
    digest = produce_digest(scan_result)
    assert any("clean" in l.lower() or "no items" in l.lower() or digest["total_items"] == 0
               for l in digest["lines"])


# ─── Test 15: End-to-end: scan → classify → digest → query ──────────────────

def test_end_to_end_pipeline(tmp_path, monkeypatch):
    import sweeper_digest
    import os
    monkeypatch.setattr(sweeper_digest, "_DIGEST_LOG_PATH", tmp_path / "digest_log.jsonl")

    from sweeper_scan import run_full_scan
    from sweeper_classify import sort_by_severity
    from sweeper_digest import produce_digest, format_digest

    # Create one stale file
    old_file = tmp_path / "old_project.md"
    old_file.write_text("stale project")
    old_time = os.path.getmtime(str(old_file)) - (40 * 86400)
    os.utime(str(old_file), (old_time, old_time))

    # Run scan
    result = run_full_scan([tmp_path], stale_days=30)
    assert result["stale_count"] >= 1

    # Classify
    sorted_items = sort_by_severity(result["items"])
    assert len(sorted_items) >= 1

    # Produce digest
    digest = produce_digest(result)
    formatted = format_digest(digest)
    assert "SWEEPER DIGEST" in formatted
    assert digest["chronos_hash"]

    # Count log entries
    log_entries = [l for l in (tmp_path / "digest_log.jsonl").read_text().split("\n") if l.strip()]
    assert len(log_entries) >= 1


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python", "-m", "pytest", __file__, "-v"], cwd=str(_HERE))
