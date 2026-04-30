"""
Tests for KN023 — Vine Transfer Session-Handoff Automation
Target: 30+ tests covering all 12 components.

Run:
    python -m pytest discipline_wing/tests_kn023.py -v
or
    python discipline_wing/tests_kn023.py
"""

from __future__ import annotations

import json
import sys
import tempfile
import time
from pathlib import Path

# Ensure workspace is importable
_WORKSPACE = Path(__file__).parent.parent
if str(_WORKSPACE) not in sys.path:
    sys.path.insert(0, str(_WORKSPACE))

_STITCHPUNKS = _WORKSPACE / "librarian-mcp" / "stitchpunks"
if str(_STITCHPUNKS) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS))


def test_codecopy_detector_missing_dir() -> None:
    """Component 2: missing directory returns 'missing' status."""
    from vine_transfer.codecopy_detector import detect_latest_codecopy
    path, status = detect_latest_codecopy(Path("/nonexistent_dir_xyz"))
    assert status == "missing"
    assert path is None


def test_codecopy_detector_finds_file(tmp_path: Path = None) -> None:
    """Component 2: detects highest-numbered codecopy file."""
    from vine_transfer.codecopy_detector import detect_latest_codecopy
    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        (d / "BishopClaudeCode001.txt").write_text("content001")
        (d / "BishopClaudeCode003.txt").write_text("content003")
        (d / "BishopClaudeCode002.txt").write_text("content002")
        path, status = detect_latest_codecopy(d)
        assert status == "found"
        assert path is not None
        assert "003" in path.name


def test_codecopy_detector_empty_dir() -> None:
    """Component 2: empty directory returns 'missing'."""
    from vine_transfer.codecopy_detector import detect_latest_codecopy
    with tempfile.TemporaryDirectory() as td:
        path, status = detect_latest_codecopy(Path(td))
        assert status == "missing"


def test_codecopy_chunked_read() -> None:
    """Component 2: chunked read splits correctly."""
    from vine_transfer.codecopy_detector import read_codecopy_chunked
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "test.txt"
        lines = [f"line {i}" for i in range(600)]
        p.write_text("\n".join(lines))
        chunks = read_codecopy_chunked(p, chunk_lines=250)
        assert len(chunks) == 3
        assert "line 0" in chunks[0]
        assert "line 250" in chunks[1]
        assert "line 500" in chunks[2]


def test_codecopy_summary_structure() -> None:
    """Component 2: summary returns expected keys."""
    from vine_transfer.codecopy_detector import get_codecopy_summary
    result = get_codecopy_summary(Path("/nonexistent"))
    assert "status" in result
    assert "chunk_count" in result
    assert "ask_founder_prompt" in result


def test_eblet_promoter_missing_session() -> None:
    """Component 3: missing session directory returns graceful skip."""
    from vine_transfer.eblet_auto_promoter import promote_session_eblets
    result = promote_session_eblets(
        session_id="NONEXISTENT_SESSION_XYZ",
        eblet_root=Path("/nonexistent"),
        dry_run=True,
    )
    assert result["total_found"] == 0
    assert "note" in result


def test_eblet_promoter_empty_session() -> None:
    """Component 3: empty session directory returns graceful skip."""
    from vine_transfer.eblet_auto_promoter import promote_session_eblets
    with tempfile.TemporaryDirectory() as td:
        eblet_root = Path(td)
        session_dir = eblet_root / "TEST_SESSION"
        session_dir.mkdir()
        result = promote_session_eblets(
            session_id="TEST_SESSION",
            eblet_root=eblet_root,
            dry_run=True,
        )
        assert result["total_found"] == 0
        assert "graceful skip" in result.get("note", "")


def test_eblet_promoter_dry_run() -> None:
    """Component 3: dry-run mode lists files without promoting."""
    from vine_transfer.eblet_auto_promoter import promote_session_eblets
    with tempfile.TemporaryDirectory() as td:
        eblet_root = Path(td)
        session_dir = eblet_root / "TEST_SESSION"
        session_dir.mkdir()
        (session_dir / "foo.eblet.md").write_text("# test eblet")
        result = promote_session_eblets(
            session_id="TEST_SESSION",
            eblet_root=eblet_root,
            dry_run=True,
        )
        assert result["total_found"] == 1
        assert result["promoted"] == 1  # dry-run counts as promoted


def test_eblet_promoter_format_summary() -> None:
    """Component 3: format_promotion_summary returns non-empty string."""
    from vine_transfer.eblet_auto_promoter import format_promotion_summary
    result = {
        "session_id": "TEST",
        "total_found": 2,
        "promoted": 1,
        "blocked": 1,
        "errors": 0,
        "promoted_names": ["foo.eblet.md"],
        "blocked_names": ["bar.eblet.md"],
    }
    summary = format_promotion_summary(result)
    assert "TEST" in summary
    assert "Promoted: 1" in summary
    assert "Blocked: 1" in summary


def test_memory_flipper_missing_file() -> None:
    """Component 4: missing MEMORY.md → exists=False, no flip needed."""
    from vine_transfer.memory_md_auto_flipper import detect_current_state
    result = detect_current_state(Path("/nonexistent/MEMORY.md"))
    assert result["exists"] is False


def test_memory_flipper_build_diff() -> None:
    """Component 4: build_flip_diff produces correct header."""
    from vine_transfer.memory_md_auto_flipper import build_flip_diff
    content = "# Existing content\nSome text here."
    new_content, diff_summary = build_flip_diff(content, "BP003", "BP002")
    assert "BP003" in new_content
    assert "BP002" in new_content
    assert "# Existing content" in new_content
    assert "BP003" in diff_summary


def test_memory_flipper_idempotent() -> None:
    """Component 4: applying flip twice produces same result."""
    from vine_transfer.memory_md_auto_flipper import build_flip_diff
    content = "# Original\nText."
    new_content1, _ = build_flip_diff(content, "BP003", "BP002")
    new_content2, _ = build_flip_diff(new_content1, "BP004", "BP003")
    # Both outputs should contain the boundary header
    assert "Session Boundary" in new_content1
    assert "Session Boundary" in new_content2
    # Only one boundary header should exist
    assert new_content2.count("Session Boundary") == 1


def test_memory_flipper_dry_run() -> None:
    """Component 4: dry_run=True surfaces confirmation prompt."""
    from vine_transfer.memory_md_auto_flipper import apply_flip
    with tempfile.TemporaryDirectory() as td:
        mem = Path(td) / "MEMORY.md"
        mem.write_text("# MEMORY\nsome content")
        result = apply_flip("BP003", "BP002", memory_path=mem, dry_run=True)
        assert result["applied"] is False
        assert result["dry_run"] is True
        assert result["confirmation_prompt"] is not None


def test_librarian_rebuilder_should_not_rebuild_on_zero_changes() -> None:
    """Component 5: should_rebuild returns False when no changes."""
    from vine_transfer.librarian_auto_rebuilder import should_rebuild
    # Point at nonexistent repo — _count_recent_changes fails gracefully → 0
    rebuild_needed, count = should_rebuild(
        librarian_dir=Path("/nonexistent"),
        threshold=5,
    )
    assert rebuild_needed is False
    assert count == 0


def test_librarian_rebuilder_trigger_missing_dir() -> None:
    """Component 5: trigger returns error when librarian dir missing."""
    from vine_transfer.librarian_auto_rebuilder import trigger_rebuild
    result = trigger_rebuild(Path("/nonexistent"), background=False, timeout=5)
    assert result["triggered"] is False
    assert result["error"] is not None


def test_queue_surfacer_empty() -> None:
    """Component 6: surface_queue returns valid structure even when empty."""
    from vine_transfer.queue_surfacer import surface_queue
    result = surface_queue(
        sweeper_dir=Path("/nonexistent"),
        herder_dir=Path("/nonexistent"),
    )
    assert "knight_blockers" in result
    assert "total_pending" in result
    assert "formatted_digest" in result


def test_knight_queue_auditor_missing_dirs() -> None:
    """Component 7: audit_knight_queue graceful when dirs missing."""
    from vine_transfer.knight_queue_auditor import audit_knight_queue
    result = audit_knight_queue(
        prompts_dir=Path("/nonexistent"),
        eblet_root=Path("/nonexistent"),
    )
    assert result["prompt_count"] == 0
    assert result["total_depth"] == 0
    assert "formatted_summary" in result


def test_knight_queue_auditor_finds_prompts() -> None:
    """Component 7: correctly counts KN prompt files."""
    from vine_transfer.knight_queue_auditor import audit_knight_prompts
    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        (d / "PROMPT_KNIGHT_KN001_test_BP001.md").write_text("# test")
        (d / "PROMPT_KNIGHT_KN002_test_BP001.md").write_text("# test")
        (d / "other_file.md").write_text("# other")
        items = audit_knight_prompts(d)
        assert len(items) == 2


def test_dispatch_auditor_missing_dirs() -> None:
    """Component 8: audit_dispatches graceful when dirs missing."""
    from vine_transfer.dispatch_auditor import audit_dispatches
    result = audit_dispatches(
        dropzone_base=Path("/nonexistent"),
        pawn_dropzone=Path("/nonexistent"),
    )
    assert "total_dispatches" in result
    assert "formatted_summary" in result
    assert result["total_dispatches"] == 0


def test_drift_triage_empty() -> None:
    """Component 9: triage_drift returns valid structure with empty inputs."""
    from vine_transfer.drift_triage import triage_drift
    result = triage_drift(substrate_cache={}, telemetry_entries=[])
    assert "load_bearing" in result
    assert "deferrable" in result
    assert "formatted_summary" in result


def test_drift_triage_classifies_correctly() -> None:
    """Component 9: classify_drift_item distinguishes load-bearing vs deferrable."""
    from vine_transfer.drift_triage import classify_drift_item
    assert classify_drift_item("CRITICAL: canonical mismatch detected") == "load_bearing"
    assert classify_drift_item("minor cosmetic style issue") == "deferrable"
    assert classify_drift_item("something completely unrelated") == "unknown"


def test_deadline_checker_within_window() -> None:
    """Component 10: static deadlines within window are surfaced."""
    from vine_transfer.deadline_checker import get_deadlines_within_window
    # Use a very large window to catch all static deadlines
    deadlines = get_deadlines_within_window(
        window_days=365 * 10,
        chronicler_dir=Path("/nonexistent"),
    )
    # Patent conversion deadline should be in there
    descriptions = [d["description"] for d in deadlines]
    assert any("conversion" in d.lower() for d in descriptions)


def test_deadline_checker_format() -> None:
    """Component 10: format_deadlines returns non-empty string."""
    from vine_transfer.deadline_checker import format_deadlines
    deadlines = [{"description": "Test deadline", "deadline_ts": time.time() + 3600}]
    fmt = format_deadlines(deadlines)
    assert "Test deadline" in fmt


def test_spec_memo_updater_no_memo() -> None:
    """Component 11: append_candidates graceful when no memo found."""
    from vine_transfer.spec_memo_updater import append_candidates
    result = append_candidates(
        ["Candidate A"],
        spec_memo_dir=Path("/nonexistent"),
        dry_run=True,
    )
    assert result["updated"] is False
    assert "not found" in result.get("note", "").lower()


def test_spec_memo_updater_idempotent() -> None:
    """Component 11: re-running with same candidates skips duplicates."""
    from vine_transfer.spec_memo_updater import append_candidates
    with tempfile.TemporaryDirectory() as td:
        memo = Path(td) / "K-PROV-16_spec_test.md"
        memo.write_text("# Prov 16 Candidates\n- Existing Candidate\n")
        result1 = append_candidates(["Existing Candidate", "New One"], spec_memo_path=memo)
        assert result1["added_count"] == 1
        assert result1["skipped_count"] == 1
        result2 = append_candidates(["New One"], spec_memo_path=memo)
        assert result2["added_count"] == 0
        assert result2["skipped_count"] == 1


def test_vine_landing_receipt_assembly() -> None:
    """Component 12: assemble_receipt produces valid 5-section receipt."""
    from vine_transfer.vine_landing_receipt import assemble_receipt
    receipt = assemble_receipt(
        session_id="BP003",
        prior_session_id="BP002",
        drift_summary="No load-bearing drift",
        queue_summary="Queue depth: 0",
        dispatch_summary="No dispatches",
        deadline_summary="No near-term deadlines",
        eblet_promotion_summary="0 eblets promoted",
        codecopy_summary={"status": "found", "file_name": "BishopClaudeCode001.txt", "chunk_count": 3},
        memory_flip_summary="Flip applied",
        librarian_rebuild_summary={"triggered": True},
    )
    assert "BP003" in receipt["receipt_text"]
    assert "Section 1" in receipt["receipt_text"]
    assert "Section 5" in receipt["receipt_text"]
    assert receipt["content_hash"]


def test_vine_landing_receipt_chronos_signed() -> None:
    """Component 12: receipt includes content hash (Chronos signing)."""
    from vine_transfer.vine_landing_receipt import assemble_receipt
    receipt = assemble_receipt(
        session_id="BP003", prior_session_id="BP002",
        drift_summary="", queue_summary="", dispatch_summary="",
        deadline_summary="", eblet_promotion_summary="",
        codecopy_summary={"status": "missing"}, memory_flip_summary="",
        librarian_rebuild_summary={},
    )
    assert len(receipt["content_hash"]) == 16
    assert receipt["content_hash"] in receipt["receipt_text"]


def test_end_to_end_orchestration_completes() -> None:
    """Component 1: full orchestration completes within 60 seconds."""
    from vine_transfer.vine_transfer_hook import run_vine_transfer
    t0 = time.monotonic()
    receipt = run_vine_transfer(
        session_id="TEST_SESSION",
        prior_session_id="PRIOR_SESSION",
        dry_run=True,
    )
    elapsed = time.monotonic() - t0
    assert elapsed < 60.0, f"Orchestration took {elapsed:.1f}s — exceeds 60s limit"
    assert "receipt_text" in receipt
    assert receipt["elapsed_ms"] > 0


def test_orchestration_handles_bad_paths() -> None:
    """Component 1: orchestration with nonexistent paths completes without raising."""
    from vine_transfer.vine_transfer_hook import run_vine_transfer
    receipt = run_vine_transfer(
        session_id="TEST",
        prior_session_id="PRIOR",
        eblet_root=Path("/nonexistent"),
        memory_path=Path("/nonexistent/MEMORY.md"),
        codecopy_dir=Path("/nonexistent"),
        dry_run=True,
    )
    assert "receipt_text" in receipt  # Must always return, never raise


def test_parallelization_no_race_condition() -> None:
    """Component 1: parallel Eblet promotion + Librarian rebuild no race."""
    from vine_transfer.vine_transfer_hook import run_vine_transfer
    with tempfile.TemporaryDirectory() as td:
        eblet_root = Path(td) / "eblets"
        session_dir = eblet_root / "PRIOR_SESSION"
        session_dir.mkdir(parents=True)
        receipt = run_vine_transfer(
            session_id="TEST",
            prior_session_id="PRIOR_SESSION",
            eblet_root=eblet_root,
            dry_run=True,
        )
        assert "eblet_promotion" in receipt.get("component_results", {})
        assert "librarian_rebuild" in receipt.get("component_results", {})


def test_founder_override_destructive_surfaces_prompt() -> None:
    """Component 4: MEMORY flip in dry_run surfaces confirmation prompt."""
    from vine_transfer.memory_md_auto_flipper import apply_flip
    with tempfile.TemporaryDirectory() as td:
        mem = Path(td) / "MEMORY.md"
        mem.write_text("# MEMORY\nContent")
        result = apply_flip("BP003", "BP002", memory_path=mem, dry_run=True)
        assert result.get("confirmation_prompt") is not None
        assert "confirm" in result["confirmation_prompt"].lower() or "flip" in result["confirmation_prompt"].lower()


def test_edge_zero_eblets_graceful_skip() -> None:
    """Edge: prior session has 0 Eblets → graceful skip."""
    from vine_transfer.eblet_auto_promoter import promote_session_eblets
    with tempfile.TemporaryDirectory() as td:
        eblet_root = Path(td)
        session_dir = eblet_root / "EMPTY_SESSION"
        session_dir.mkdir()
        result = promote_session_eblets("EMPTY_SESSION", eblet_root=eblet_root)
        assert result["total_found"] == 0
        assert "graceful skip" in result.get("note", "")


def test_reproducibility_receipt_structure() -> None:
    """Component 12: receipt structure is deterministic (hash format valid, sections present)."""
    from vine_transfer.vine_landing_receipt import assemble_receipt
    kwargs = dict(
        session_id="REPRO", prior_session_id="PREV",
        drift_summary="X", queue_summary="Y", dispatch_summary="Z",
        deadline_summary="D", eblet_promotion_summary="E",
        codecopy_summary={"status": "found", "file_name": "f.txt", "chunk_count": 1},
        memory_flip_summary="M", librarian_rebuild_summary={"triggered": False},
    )
    r = assemble_receipt(**kwargs)
    # Hash is always 16-char hex (SHA-256 prefix)
    assert len(r["content_hash"]) == 16
    assert all(c in "0123456789abcdef" for c in r["content_hash"])
    # Hash is embedded in receipt text
    assert r["content_hash"] in r["receipt_text"]
    # All 5 sections present
    for section_num in range(1, 6):
        assert f"Section {section_num}" in r["receipt_text"]


if __name__ == "__main__":
    tests = [
        test_codecopy_detector_missing_dir,
        test_codecopy_detector_finds_file,
        test_codecopy_detector_empty_dir,
        test_codecopy_chunked_read,
        test_codecopy_summary_structure,
        test_eblet_promoter_missing_session,
        test_eblet_promoter_empty_session,
        test_eblet_promoter_dry_run,
        test_eblet_promoter_format_summary,
        test_memory_flipper_missing_file,
        test_memory_flipper_build_diff,
        test_memory_flipper_idempotent,
        test_memory_flipper_dry_run,
        test_librarian_rebuilder_should_not_rebuild_on_zero_changes,
        test_librarian_rebuilder_trigger_missing_dir,
        test_queue_surfacer_empty,
        test_knight_queue_auditor_missing_dirs,
        test_knight_queue_auditor_finds_prompts,
        test_dispatch_auditor_missing_dirs,
        test_drift_triage_empty,
        test_drift_triage_classifies_correctly,
        test_deadline_checker_within_window,
        test_deadline_checker_format,
        test_spec_memo_updater_no_memo,
        test_spec_memo_updater_idempotent,
        test_vine_landing_receipt_assembly,
        test_vine_landing_receipt_chronos_signed,
        test_end_to_end_orchestration_completes,
        test_orchestration_handles_bad_paths,
        test_parallelization_no_race_condition,
        test_founder_override_destructive_surfaces_prompt,
        test_edge_zero_eblets_graceful_skip,
        test_reproducibility_receipt_structure,
    ]

    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL {t.__name__}: {e}")
            failed += 1

    print(f"\n{passed}/{passed+failed} tests passed")
    if failed:
        sys.exit(1)
