"""
Shadow E-Giant Near-Completion Watcher — KN-R1 / BP018
========================================================
Phase B (Prep) capability extension. Watches Knight session for near-completion
signals. When detected, triggers pre-staging of next K-prompt.

Detection signals:
  1. context_pct > 70% (approaching compaction) — from Stats-Capture substrate
  2. Phase E COMMIT detected in transcript
  3. Test-pass signal (TAP report file or CI poll)
  4. Git commit detected (git log poll since session-start)

Gate: only Phase-B (Prep) Shadows fire NearCompletionWatcher.
Phase-A Shadows are mid-build and do NOT pre-stage.

Supports 5 concurrent Knight sessions per Founder directive.

Composes with:
  - KN-R2 PreStagingWorkflow — consumer of NearCompletionSignal
  - KN-R3 HandoffAutoFire   — fires after pre-staging completes
  - Pod-G alternating cylinder fire — gate: Phase B only
  - Pod-S StatsCaptureHarness — telemetry source for context_pct
  - Pod-Q OnDeckScribe        — canonical state file (queue)
"""

from __future__ import annotations

import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Callable

from .overlap_signal import NearCompletionSignal
from .knight_session_telemetry import (
    read_context_pct_from_telemetry,
    scan_agent_transcripts_for_phase_e,
    detect_new_git_commits,
    check_test_pass_signal,
)

# ─── Constants ─────────────────────────────────────────────────────────────────

NEAR_COMPLETION_THRESHOLD_CONTEXT_PCT = 70.0
NEAR_COMPLETION_DETECTION_INTERVAL_SEC = 15.0


# ─── ShadowPhase gate ─────────────────────────────────────────────────────────

class ShadowPhase:
    """Pod-G phase tracking — only Phase-B Shadows fire the watcher."""
    A = "A"  # Build/compile phase — does NOT run NearCompletionWatcher
    B = "B"  # Prep phase — DOES run NearCompletionWatcher


# ─── NearCompletionWatcher ─────────────────────────────────────────────────────

class NearCompletionWatcher:
    """
    Phase B (Prep) capability extension. Watches Knight session for near-completion
    signals. When detected, calls the provided signal_callback.

    Thread-safe: runs detection loop in a daemon thread.
    Supports 5 concurrent instances (one per Knight session).
    """

    def __init__(
        self,
        shadow_id: str,
        shadow_phase: str = ShadowPhase.B,
        detection_interval_sec: float = NEAR_COMPLETION_DETECTION_INTERVAL_SEC,
        signal_callback: Optional[Callable[[NearCompletionSignal], None]] = None,
        test_report_path: Optional[str] = None,
    ) -> None:
        self.shadow_id = shadow_id
        self.shadow_phase = shadow_phase
        self.detection_interval_sec = detection_interval_sec
        self.signal_callback = signal_callback
        self.test_report_path = test_report_path

        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._signal_emitted: Optional[NearCompletionSignal] = None
        self._last_git_sha: Optional[str] = None

    @property
    def is_phase_b(self) -> bool:
        return self.shadow_phase == ShadowPhase.B

    def watch(
        self,
        knight_session_id: str,
        knight_session_index: int = 1,
        knight_session_total: int = 1,
        blocking: bool = False,
    ) -> Optional[NearCompletionSignal]:
        """
        Start watching Knight session. Returns:
          - If blocking=True: returns NearCompletionSignal when detected (blocks until detected or stopped)
          - If blocking=False: starts daemon thread, returns None immediately

        Phase-A Shadows: raises AssertionError (gated).
        """
        if not self.is_phase_b:
            # Phase-A Shadows must not run the watcher
            raise ValueError(f"Shadow {self.shadow_id} is Phase-A: NearCompletionWatcher is gated to Phase-B only.")

        self._stop_event.clear()
        self._signal_emitted = None
        self._last_git_sha = detect_new_git_commits()

        if blocking:
            return self._run_detection_loop(knight_session_id, knight_session_index, knight_session_total)
        else:
            self._thread = threading.Thread(
                target=self._run_detection_loop,
                args=(knight_session_id, knight_session_index, knight_session_total),
                daemon=True,
            )
            self._thread.start()
            return None

    def stop(self) -> None:
        """Stop the watcher thread."""
        self._stop_event.set()

    def get_signal(self) -> Optional[NearCompletionSignal]:
        """Returns emitted signal (or None if not yet detected)."""
        return self._signal_emitted

    def _run_detection_loop(
        self,
        knight_session_id: str,
        knight_session_index: int,
        knight_session_total: int,
    ) -> Optional[NearCompletionSignal]:
        """Core detection loop — polls all 4 signals until one fires or stop() called."""
        while not self._stop_event.is_set():
            signal = self._check_signals(knight_session_id, knight_session_index, knight_session_total)
            if signal:
                self._signal_emitted = signal
                if self.signal_callback:
                    try:
                        self.signal_callback(signal)
                    except Exception:
                        pass
                return signal
            time.sleep(self.detection_interval_sec)
        return None

    def _check_signals(
        self,
        knight_session_id: str,
        knight_session_index: int,
        knight_session_total: int,
    ) -> Optional[NearCompletionSignal]:
        """Check all 4 detection signals. Return first match."""

        # Signal 1: context_pct > 70
        ctx = read_context_pct_from_telemetry(knight_session_id)
        if ctx is not None and ctx >= NEAR_COMPLETION_THRESHOLD_CONTEXT_PCT:
            return NearCompletionSignal.from_context_pct(
                knight_session_id=knight_session_id,
                shadow_id=self.shadow_id,
                context_pct=ctx,
                knight_session_index=knight_session_index,
                knight_session_total=knight_session_total,
            )

        # Signal 2: Phase E COMMIT detected in transcript
        phase_e_match = scan_agent_transcripts_for_phase_e(knight_session_id)
        if phase_e_match:
            new_sha = detect_new_git_commits(self._last_git_sha)
            return NearCompletionSignal.from_phase_e(
                knight_session_id=knight_session_id,
                shadow_id=self.shadow_id,
                commit_hash=new_sha,
                knight_session_index=knight_session_index,
                knight_session_total=knight_session_total,
            )

        # Signal 3: test-pass signal
        if check_test_pass_signal(self.test_report_path):
            return NearCompletionSignal.from_phase_e(
                knight_session_id=knight_session_id,
                shadow_id=self.shadow_id,
                knight_session_index=knight_session_index,
                knight_session_total=knight_session_total,
            )

        # Signal 4: new git commit since session start
        new_sha = detect_new_git_commits(self._last_git_sha)
        if new_sha and new_sha != self._last_git_sha:
            sig = NearCompletionSignal.from_git_commit(
                knight_session_id=knight_session_id,
                shadow_id=self.shadow_id,
                commit_hash=new_sha,
                knight_session_index=knight_session_index,
                knight_session_total=knight_session_total,
            )
            self._last_git_sha = new_sha
            return sig

        return None
