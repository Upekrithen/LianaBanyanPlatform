"""
Tests — KN028 Shutterbug Scribe MVP
Phase D trust-but-verify gate.

Run: python -m pytest librarian-mcp/stitchpunks/shutterbug/tests_kn028.py -v

Tests cover:
  1. screenshot_engine: file naming / directory creation / stub fallback
  2. screenshot_engine: list_session_captures
  3. shutterbug_scribe: manifest write/load round-trip
  4. ShutterbugObserver: start/stop lifecycle
  5. ShutterbugObserver: observer fires capture on new tablet entry
  6. ShutterbugObserver: manual capture_now
  7. Graceful degradation: no crash on bad PIL/mss

Toolsmith log: TS-SHUTTERBUG-SCRIBE-KN028-BP003
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import threading
import time
from pathlib import Path
from typing import Any, Dict
from unittest.mock import patch, MagicMock

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE.parent.parent))
sys.path.insert(0, str(_HERE.parent))


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def session_id():
    return "TEST-KN028-SHUTTER-001"


@pytest.fixture()
def tmp_session_dir(tmp_path, monkeypatch, session_id):
    """Redirect BeanSprouts to temp path."""
    import shutterbug.screenshot_engine as se
    monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_path / "BeanSprouts")
    return tmp_path / "BeanSprouts"


@pytest.fixture()
def tmp_sessions(tmp_path, monkeypatch):
    """Redirect manifest sessions dir to temp path."""
    import shutterbug.shutterbug_scribe as ss
    monkeypatch.setattr(ss, "_SESSIONS_DIR", tmp_path)
    return tmp_path


@pytest.fixture()
def tmp_tablet(tmp_path):
    """Provide a writable fake snapshot tablet."""
    return tmp_path / "snapshot_receipts.jsonl"


def _write_snapshot(tablet_path: Path, snapshot: Dict[str, Any]) -> None:
    with tablet_path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(snapshot) + "\n")
        fh.flush()


# ── screenshot_engine tests ───────────────────────────────────────────────────

class TestScreenshotEngine:
    def test_get_session_dir_creates_directory(self, tmp_session_dir, session_id, monkeypatch):
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        d = se.get_session_dir(session_id)
        assert d.exists()
        assert d.is_dir()

    def test_build_filename_format(self):
        from shutterbug.screenshot_engine import _build_filename
        name = _build_filename(20.0, 19.7, ".png")
        assert name.startswith("screenshot_020pct_ctx19.7_")
        assert name.endswith(".png")

    def test_take_screenshot_stub_fallback(self, tmp_session_dir, session_id, monkeypatch):
        """When PIL and mss are unavailable, stub file is written."""
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(se, "_try_pil_screenshot", lambda p: False)
        monkeypatch.setattr(se, "_try_mss_screenshot", lambda p: False)

        result = se.take_screenshot(
            session_id=session_id,
            threshold=20.0,
            context_pct=19.7,
            bean_id="KN027",
        )
        assert result["captured"] is False
        assert result["file_type"] == "stub"
        assert Path(result["path"]).exists()
        assert result["session_id"] == session_id
        assert result["threshold"] == 20.0

    def test_take_screenshot_png_success(self, tmp_session_dir, session_id, monkeypatch):
        """When PIL succeeds, PNG path reported."""
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)

        def fake_pil(path):
            path.write_bytes(b"FAKE_PNG_DATA")
            return True

        monkeypatch.setattr(se, "_try_pil_screenshot", fake_pil)

        result = se.take_screenshot(
            session_id=session_id,
            threshold=30.0,
            context_pct=29.5,
            bean_id="KN028",
        )
        assert result["captured"] is True
        assert result["file_type"] == "png"
        assert Path(result["path"]).exists()
        assert result["method"] == "PIL.ImageGrab"

    def test_stub_contains_metadata(self, tmp_session_dir, session_id, monkeypatch):
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(se, "_try_pil_screenshot", lambda p: False)
        monkeypatch.setattr(se, "_try_mss_screenshot", lambda p: False)

        result = se.take_screenshot(session_id, 40.0, 39.3, bean_id="KN029")
        stub_data = json.loads(Path(result["path"]).read_text())
        assert stub_data["session_id"] == session_id
        assert stub_data["bean_id"] == "KN029"
        assert stub_data["type"] == "screenshot_stub"

    def test_list_session_captures_empty(self, tmp_session_dir, session_id, monkeypatch):
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        captures = se.list_session_captures("NONEXISTENT-SESSION")
        assert captures == []

    def test_list_session_captures_finds_stubs(self, tmp_session_dir, session_id, monkeypatch):
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(se, "_try_pil_screenshot", lambda p: False)
        monkeypatch.setattr(se, "_try_mss_screenshot", lambda p: False)

        se.take_screenshot(session_id, 20.0, 19.0)
        se.take_screenshot(session_id, 30.0, 29.0)

        captures = se.list_session_captures(session_id)
        assert len(captures) == 2

    def test_take_screenshot_non_raising(self, session_id, monkeypatch, tmp_path):
        """Should not raise even on errors."""
        import shutterbug.screenshot_engine as se
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: Path("/nonexistent/path/xyz"))
        # Should not raise even on bad path
        try:
            se.take_screenshot(session_id, 20.0, 19.0)
        except Exception as exc:
            pytest.fail(f"take_screenshot raised: {exc}")


# ── shutterbug_scribe manifest tests ──────────────────────────────────────────

class TestManifest:
    def test_manifest_write_and_load(self, tmp_sessions, session_id):
        from shutterbug.shutterbug_scribe import _append_manifest, load_manifest
        record = {"captured": True, "path": "/fake/path.png", "threshold": 20.0}
        _append_manifest(session_id, record)
        records = load_manifest(session_id)
        assert len(records) == 1
        assert records[0]["threshold"] == 20.0
        assert "wall_time_iso" in records[0]

    def test_manifest_multiple_append(self, tmp_sessions, session_id):
        from shutterbug.shutterbug_scribe import _append_manifest, load_manifest
        for i in range(4):
            _append_manifest(session_id, {"threshold": float(i * 10)})
        records = load_manifest(session_id)
        assert len(records) == 4

    def test_load_missing_manifest_returns_empty(self, tmp_sessions):
        from shutterbug.shutterbug_scribe import load_manifest
        assert load_manifest("MISSING-SESSION-999") == []


# ── ShutterbugObserver tests ───────────────────────────────────────────────────

class TestShutterbugObserver:
    def test_start_stop_lifecycle(self, tmp_sessions, tmp_session_dir, session_id, monkeypatch, tmp_tablet):
        import shutterbug.screenshot_engine as se
        import shutterbug.shutterbug_scribe as ss
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(ss, "_SESSIONS_DIR", tmp_sessions)

        obs = ss.ShutterbugObserver(
            session_id=session_id,
            poll_interval_s=0.05,
            tablet_path=tmp_tablet,
        )
        obs.start()
        assert obs._thread is not None
        assert obs._thread.is_alive()
        manifest = obs.stop()
        assert isinstance(manifest, list)

    def test_observer_fires_on_new_snapshot(
        self, tmp_sessions, tmp_session_dir, session_id, monkeypatch, tmp_tablet
    ):
        """Observer captures screenshot when new snapshot appears in tablet."""
        import shutterbug.screenshot_engine as se
        import shutterbug.shutterbug_scribe as ss
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(se, "_try_pil_screenshot", lambda p: False)
        monkeypatch.setattr(se, "_try_mss_screenshot", lambda p: False)
        monkeypatch.setattr(ss, "_SESSIONS_DIR", tmp_sessions)

        obs = ss.ShutterbugObserver(
            session_id=session_id,
            bean_id="KN027",
            poll_interval_s=0.05,
            tablet_path=tmp_tablet,
        )
        obs.start()

        # Write a new snapshot to tablet
        _write_snapshot(tmp_tablet, {
            "snapshot_id": "SNAP-TEST-020-abcd1234",
            "threshold_triggered": 20.0,
            "context_budget_percent": 19.5,
            "session_id": "KN028-TEST",
        })

        time.sleep(0.3)  # wait for observer to poll
        manifest = obs.stop()
        assert len(manifest) >= 1
        assert manifest[0]["threshold"] == 20.0

    def test_observer_does_not_refire_old_snapshots(
        self, tmp_sessions, tmp_session_dir, session_id, monkeypatch, tmp_tablet
    ):
        """Observer seeds seen_ids from existing tablet; doesn't re-capture old snaps."""
        import shutterbug.screenshot_engine as se
        import shutterbug.shutterbug_scribe as ss
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(se, "_try_pil_screenshot", lambda p: False)
        monkeypatch.setattr(se, "_try_mss_screenshot", lambda p: False)
        monkeypatch.setattr(ss, "_SESSIONS_DIR", tmp_sessions)

        # Pre-populate tablet with an existing snapshot
        _write_snapshot(tmp_tablet, {
            "snapshot_id": "SNAP-OLD-010-aaaaaaaa",
            "threshold_triggered": 10.0,
            "context_budget_percent": 9.5,
        })

        obs = ss.ShutterbugObserver(
            session_id=session_id,
            poll_interval_s=0.05,
            tablet_path=tmp_tablet,
        )
        obs.start()
        time.sleep(0.2)
        manifest = obs.stop()
        # Old snapshot should NOT have triggered a new capture
        assert len(manifest) == 0

    def test_manual_capture_now(self, tmp_sessions, tmp_session_dir, session_id, monkeypatch, tmp_tablet):
        import shutterbug.screenshot_engine as se
        import shutterbug.shutterbug_scribe as ss
        monkeypatch.setattr(se, "get_beansrpouts_dir", lambda: tmp_session_dir)
        monkeypatch.setattr(se, "_try_pil_screenshot", lambda p: False)
        monkeypatch.setattr(se, "_try_mss_screenshot", lambda p: False)
        monkeypatch.setattr(ss, "_SESSIONS_DIR", tmp_sessions)

        obs = ss.ShutterbugObserver(session_id=session_id, tablet_path=tmp_tablet)
        result = obs.capture_now(threshold=0.0, context_pct=12.5, label="bean-boundary")
        assert result["captured"] is False  # headless
        assert result["session_id"] == session_id

        manifest = load_manifest_helper(ss, session_id)
        assert len(manifest) == 1
        assert manifest[0]["trigger"] == "bean-boundary"

    def test_set_bean_thread_safe(self, tmp_tablet, session_id):
        import shutterbug.shutterbug_scribe as ss
        obs = ss.ShutterbugObserver(session_id=session_id, bean_id="KN027", tablet_path=tmp_tablet)
        obs.set_bean("KN028")
        assert obs.bean_id == "KN028"

    def test_module_level_get_session_observer(self, tmp_sessions, session_id, tmp_tablet, monkeypatch):
        import shutterbug.shutterbug_scribe as ss
        monkeypatch.setattr(ss, "_SESSIONS_DIR", tmp_sessions)
        ss._active_observers.pop(session_id, None)
        obs1 = ss.get_session_observer(session_id)
        obs2 = ss.get_session_observer(session_id)
        assert obs1 is obs2
        ss._active_observers.pop(session_id, None)

    def test_get_session_observer_no_create(self, session_id):
        import shutterbug.shutterbug_scribe as ss
        ss._active_observers.pop("NONEXISTENT-999", None)
        result = ss.get_session_observer("NONEXISTENT-999", create=False)
        assert result is None


def load_manifest_helper(ss_module, session_id):
    return ss_module.load_manifest(session_id)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
