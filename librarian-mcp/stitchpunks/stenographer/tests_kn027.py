"""
Tests — KN027 Stenographer Scribe MVP
Phase D trust-but-verify gate.

Run: python -m pytest librarian-mcp/stitchpunks/stenographer/tests_kn027.py -v

Tests cover:
  1. liner_notes_writer: write_record / load_session / get_session_path
  2. brainscan_capture: name generation / ID generation / significance classification
  3. StenographerScribe: full session lifecycle
  4. Record schema validation (required fields)
  5. Stone Tablet: fsync write → load round-trip
  6. Graceful degradation: no crash on error conditions

Toolsmith log: TS-STENOGRAPHER-SCRIBE-KN027-BP003
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict
from unittest.mock import patch

import pytest

# ── Add parent to path ────────────────────────────────────────────────────────
_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE.parent.parent))  # librarian-mcp root
sys.path.insert(0, str(_HERE.parent))         # stitchpunks root


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def tmp_sessions(tmp_path, monkeypatch):
    """Redirect sessions directory to temp path."""
    import stenographer.liner_notes_writer as writer
    monkeypatch.setattr(writer, "_SESSIONS_DIR", tmp_path)
    return tmp_path


@pytest.fixture()
def session_id():
    return "TEST-KN027-STENO-001"


# ── liner_notes_writer tests ───────────────────────────────────────────────────

class TestLinerNotesWriter:
    def test_write_and_load_roundtrip(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import write_record, load_session
        record = {"type": "liner_note", "content": "hello", "bean_id": "KN027"}
        write_record(session_id, record)
        records = load_session(session_id)
        assert len(records) == 1
        assert records[0]["type"] == "liner_note"
        assert records[0]["content"] == "hello"
        assert records[0]["session_id"] == session_id

    def test_write_adds_wall_time_iso(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import write_record, load_session
        record = {"type": "test_record"}
        write_record(session_id, record)
        records = load_session(session_id)
        assert "wall_time_iso" in records[0]
        assert records[0]["wall_time_iso"].endswith("Z")

    def test_multiple_writes_append(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import write_record, load_session
        for i in range(5):
            write_record(session_id, {"type": "test", "index": i})
        records = load_session(session_id)
        assert len(records) == 5
        for i, r in enumerate(records):
            assert r["index"] == i

    def test_load_missing_session_returns_empty(self, tmp_sessions):
        from stenographer.liner_notes_writer import load_session
        records = load_session("NONEXISTENT-SESSION-999")
        assert records == []

    def test_get_session_path_deterministic(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import get_session_path
        p1 = get_session_path(session_id)
        p2 = get_session_path(session_id)
        assert p1 == p2

    def test_session_path_is_jsonl(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import get_session_path
        path = get_session_path(session_id)
        assert path.suffix == ".jsonl"
        assert "_liner_notes" in path.stem

    def test_write_non_raising_on_bad_path(self, tmp_sessions, session_id, monkeypatch):
        """Writer must not raise even if write fails."""
        import stenographer.liner_notes_writer as writer
        monkeypatch.setattr(writer, "_SESSIONS_DIR", Path("/nonexistent/path/xyz"))
        # Should not raise
        path = writer.write_record(session_id, {"type": "test"})
        assert path is not None

    def test_list_sessions(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import write_record, list_sessions
        write_record(session_id, {"type": "test"})
        sessions = list_sessions()
        assert session_id in sessions


# ── brainscan_capture tests ────────────────────────────────────────────────────

class TestBrainscapCapture:
    def test_make_brainscan_name_format(self):
        from stenographer.brainscan_capture import make_brainscan_name
        name = make_brainscan_name("KN027", "Phase-C", "design-decisions")
        assert name == "Brainscan-KN027-Phase-C-design-decisions"

    def test_make_brainscan_name_spaces_normalized(self):
        from stenographer.brainscan_capture import make_brainscan_name
        name = make_brainscan_name("KN027", "Phase C", "Design Decisions")
        assert " " not in name
        assert name.startswith("Brainscan-KN027-")

    def test_make_brainscan_id_format(self):
        from stenographer.brainscan_capture import make_brainscan_id
        bid = make_brainscan_id("BP003-K", "KN027", "test-slug")
        assert bid.startswith("BS-KN027-")
        assert len(bid) == len("BS-KN027-") + 8

    def test_make_note_id_format(self):
        from stenographer.brainscan_capture import make_note_id
        nid = make_note_id("BP003-K", "KN027")
        assert nid.startswith("LN-KN027-")

    def test_significance_major_long(self):
        from stenographer.brainscan_capture import classify_brainscan_significance
        long_content = "x" * 900
        assert classify_brainscan_significance(long_content) == "major"

    def test_significance_major_keyword(self):
        from stenographer.brainscan_capture import classify_brainscan_significance
        assert classify_brainscan_significance("This test case falsifies the hypothesis") == "major"

    def test_significance_minor_keyword(self):
        from stenographer.brainscan_capture import classify_brainscan_significance
        assert classify_brainscan_significance("My decision rationale is...") == "minor"

    def test_significance_routine_short(self):
        from stenographer.brainscan_capture import classify_brainscan_significance
        assert classify_brainscan_significance("Small note.") == "routine"


# ── StenographerScribe lifecycle tests ────────────────────────────────────────

class TestStenographerScribe:
    def test_full_session_lifecycle(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import load_session
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)

        scribe.open_session(session_id, pod_id="Pod-K", bean_sequence=["KN027", "KN028"])
        scribe.start_bean("KN027", context_pct=5.0, bean_class="medium")
        scribe.set_phase("Phase-C")
        scribe.record_liner_note("Design decisions for Stenographer...", context_pct=6.0)
        scribe.record_brainscan("design", "Full reasoning block...", context_pct=6.5)
        scribe.end_bean("KN027", context_pct=17.3, outcome="landed", files_changed=5)
        scribe.close_session(beans_completed=["KN027"], context_pct_final=17.3)

        records = load_session(session_id)
        types = [r["type"] for r in records]

        assert "session_open" in types
        assert "bean_start" in types
        assert "phase_change" in types
        assert "liner_note" in types
        assert "brainscan" in types
        assert "bean_end" in types
        assert "session_close" in types

    def test_session_open_record_schema(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import load_records_by_type
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id, pod_id="Pod-K", bean_sequence=["KN027"])

        records = load_records_by_type(session_id, "session_open")
        assert len(records) == 1
        r = records[0]
        assert r["pod_id"] == "Pod-K"
        assert "bean_sequence" in r
        assert "wall_time_iso" in r

    def test_bean_start_has_context_pct(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import load_records_by_type
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id, pod_id="Pod-K")
        scribe.start_bean("KN027", context_pct=7.5)

        records = load_records_by_type(session_id, "bean_start")
        assert len(records) == 1
        assert records[0]["context_pct_before"] == 7.5

    def test_liner_note_counter(self, tmp_sessions, session_id):
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id, pod_id="Pod-K")
        scribe.start_bean("KN027", context_pct=5.0)
        for i in range(3):
            scribe.record_liner_note(f"Note {i}")
        assert scribe._note_count == 3

    def test_brainscan_counter(self, tmp_sessions, session_id):
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id, pod_id="Pod-K")
        scribe.start_bean("KN027", context_pct=5.0)
        scribe.record_brainscan("slug-1", "content 1")
        scribe.record_brainscan("slug-2", "content 2")
        assert scribe._brainscan_count == 2

    def test_get_session_summary(self, tmp_sessions, session_id):
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id, pod_id="Pod-K")
        scribe.start_bean("KN027", context_pct=5.0)
        scribe.record_liner_note("Test note")

        summary = scribe.get_session_summary()
        assert summary["session_id"] == session_id
        assert summary["is_open"] is True
        assert summary["current_bean"] == "KN027"
        assert summary["record_count"] >= 2

    def test_get_session_scribe_module_level(self, tmp_sessions, session_id):
        from stenographer.stenographer_scribe import get_session_scribe, clear_session_scribe
        clear_session_scribe(session_id)

        scribe1 = get_session_scribe(session_id)
        scribe2 = get_session_scribe(session_id)
        assert scribe1 is scribe2
        clear_session_scribe(session_id)

    def test_get_session_scribe_no_create_returns_none(self, session_id):
        from stenographer.stenographer_scribe import get_session_scribe, clear_session_scribe
        clear_session_scribe("NONEXISTENT-999")
        result = get_session_scribe("NONEXISTENT-999", create=False)
        assert result is None

    def test_brainscan_record_schema(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import load_records_by_type
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id, pod_id="Pod-K")
        scribe.start_bean("KN027", context_pct=5.0)
        scribe.record_brainscan("test-slug", "This is a major decision about architecture", context_pct=6.0)

        brainscans = load_records_by_type(session_id, "brainscan")
        assert len(brainscans) == 1
        bs = brainscans[0]
        required_fields = ["brainscan_id", "brainscan_name", "significance", "content", "context_pct"]
        for field in required_fields:
            assert field in bs, f"Missing field: {field}"
        assert bs["brainscan_name"].startswith("Brainscan-KN027-")

    def test_multi_bean_ordering(self, tmp_sessions, session_id):
        from stenographer.liner_notes_writer import load_records_by_type
        from stenographer.stenographer_scribe import StenographerScribe

        scribe = StenographerScribe(session_id=session_id)
        scribe.open_session(session_id)
        for bean in ["KN027", "KN028", "KN029"]:
            scribe.start_bean(bean, context_pct=10.0)
            scribe.end_bean(bean, context_pct=20.0)

        starts = load_records_by_type(session_id, "bean_start")
        ends = load_records_by_type(session_id, "bean_end")
        assert [r["bean_id"] for r in starts] == ["KN027", "KN028", "KN029"]
        assert [r["bean_id"] for r in ends] == ["KN027", "KN028", "KN029"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
