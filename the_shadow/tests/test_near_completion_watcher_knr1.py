"""
KN-R1 Near-Completion Watcher — T1-T6 test suite
===================================================
Tests: context_pct signal, Phase E detection, test-pass signal,
git-commit detection, Phase-A gate enforcement, concurrent 5-Knight watch.
"""

import json
import os
import sys
import tempfile
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

import pytest

# Resolve the_shadow package (workspace root-relative)
WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(WORKSPACE_ROOT))

from the_shadow.overlap_signal import NearCompletionSignal
from the_shadow.overlap_watcher import NearCompletionWatcher, ShadowPhase
from the_shadow.knight_session_telemetry import (
    detect_phase_e_in_text,
    detect_new_git_commits,
    check_test_pass_signal,
)


# ─── T1: NearCompletionWatcher fires signal when context_pct > 70 ─────────────

def test_t1_context_pct_signal(tmp_path):
    """context_pct > 70 triggers NearCompletionSignal via telemetry substrate."""
    # Seed a fake interval file with high context_pct
    live_dir = tmp_path / "live"
    live_dir.mkdir()

    snap = {
        "test_id": "T1-session",
        "snapshot_type": "interval",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "outcome": "in_flight",
        "anomaly_flag": False,
        "retention_class": "interval_pass",
        "fork_doctrine_compliant": True,
        "knight_session_id": "KS-T1",
        "context_pct": 75.0,
    }
    (live_dir / "T1-session__interval__ts.json").write_text(json.dumps(snap))

    # Patch telemetry root
    import the_shadow.overlap_watcher as ow

    def mock_read_ctx(knight_session_id):
        return 75.0 if knight_session_id == "KS-T1" else None

    original_fn = ow.read_context_pct_from_telemetry
    ow.read_context_pct_from_telemetry = mock_read_ctx

    try:
        watcher = NearCompletionWatcher(
            shadow_id="alpha",
            shadow_phase=ShadowPhase.B,
            detection_interval_sec=0.01,
        )
        signal = watcher._check_signals("KS-T1", 1, 1)
        assert signal is not None, "signal should be emitted for context_pct=75"
        assert signal.detection_method == "context_pct"
        assert signal.context_pct == 75.0
        assert signal.shadow_id == "alpha"
    finally:
        ow.read_context_pct_from_telemetry = original_fn


# ─── T2: Phase E COMMIT detection works (regex match) ─────────────────────────

def test_t2_phase_e_commit_detection():
    """Phase E COMMIT pattern detected via regex in transcript text."""
    texts = [
        "### PHASE E — COMMIT\n```git commit ...```",
        "KN-S1 LANDED -- some description",
        "Phase E - COMMIT: landed artifact",
        "phase_e compliance confirmed",
    ]
    for text in texts:
        match = detect_phase_e_in_text(text)
        assert match is not None, f"Should detect Phase E in: {text[:40]}"

    no_match_texts = ["still in Phase A", "Phase D verify complete", "testing in progress"]
    for text in no_match_texts:
        match = detect_phase_e_in_text(text)
        assert match is None, f"Should NOT detect Phase E in: {text}"


# ─── T3: Test-pass signal works (TAP file poll) ───────────────────────────────

def test_t3_test_pass_signal(tmp_path):
    """check_test_pass_signal reads TAP format and returns True when all pass."""
    # Valid passing TAP
    tap_pass = "TAP version 13\nok 1 - T1\nok 2 - T2\n# tests 2\n# pass 2\n# fail 0\n"
    report = tmp_path / "test_report.tap"
    report.write_text(tap_pass)
    assert check_test_pass_signal(str(report)) is True, "should detect passing TAP"

    # Failing TAP
    tap_fail = "TAP version 13\nnot ok 1 - T1\n# pass 0\n# fail 1\n"
    report.write_text(tap_fail)
    assert check_test_pass_signal(str(report)) is False, "should detect failing TAP"

    # Missing file
    assert check_test_pass_signal("/nonexistent/path.tap") is False, "missing file = False"


# ─── T4: Git commit detection works ───────────────────────────────────────────

def test_t4_git_commit_detection():
    """detect_new_git_commits returns latest SHA from repo."""
    sha = detect_new_git_commits(repo_root=WORKSPACE_ROOT)
    # Either returns a 40-char SHA or None (if no git)
    if sha is not None:
        assert len(sha) >= 7, "git SHA should be at least 7 chars"
        assert sha.isalnum(), "git SHA should be alphanumeric"


# ─── T5: Phase-A Shadows are gated — NearCompletionWatcher raises ─────────────

def test_t5_phase_a_gated():
    """Phase-A Shadows must not run NearCompletionWatcher."""
    watcher = NearCompletionWatcher(
        shadow_id="gamma",
        shadow_phase=ShadowPhase.A,
        detection_interval_sec=9999,
    )
    with pytest.raises(ValueError, match="Phase-A"):
        watcher.watch("KS-FAKE", blocking=False)


# ─── T6: Concurrent 5 Knights — each watched by different Phase-B Shadow ──────

def test_t6_concurrent_5_knight_watch(monkeypatch):
    """5 concurrent NearCompletionWatchers, one per Knight session, no race conditions."""
    import the_shadow.overlap_watcher as ow

    # Mock: each session gets a unique context_pct that crosses the threshold
    signals_received = []
    lock = threading.Lock()

    def mock_ctx(knight_session_id):
        return 75.0  # all sessions at 75%

    monkeypatch.setattr(ow, "read_context_pct_from_telemetry", mock_ctx)
    # Mock git and transcript to avoid side effects
    monkeypatch.setattr(ow, "scan_agent_transcripts_for_phase_e", lambda sid: None)
    monkeypatch.setattr(ow, "detect_new_git_commits", lambda since=None, repo_root=None: None)
    monkeypatch.setattr(ow, "check_test_pass_signal", lambda path: False)

    shadow_ids = ["alpha", "beta", "gamma", "delta", "epsilon"]
    session_ids = [f"KS-T6-{i}" for i in range(5)]

    watchers = []
    for i, (sid, sess) in enumerate(zip(shadow_ids, session_ids)):
        def make_callback(session_id):
            def cb(signal):
                with lock:
                    signals_received.append((session_id, signal))
            return cb

        w = NearCompletionWatcher(
            shadow_id=sid,
            shadow_phase=ShadowPhase.B,
            detection_interval_sec=0.01,
            signal_callback=make_callback(sess),
        )
        watchers.append((w, sess, i + 1))

    # Start all watchers concurrently
    for w, sess, idx in watchers:
        w.watch(sess, knight_session_index=idx, knight_session_total=5, blocking=False)

    # Wait for all to detect
    deadline = time.time() + 2.0  # 2s timeout
    while len(signals_received) < 5 and time.time() < deadline:
        time.sleep(0.05)

    for w, _, _ in watchers:
        w.stop()

    assert len(signals_received) >= 5, f"All 5 sessions should emit signals, got {len(signals_received)}"

    # Each session should be independently represented
    session_ids_seen = {rec[0] for rec in signals_received}
    assert len(session_ids_seen) >= 5, "Should have signals from 5 distinct sessions"
