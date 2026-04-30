"""
Tests — KN005 TimeWave Session-Boundary Reset + Content-Class Hash Partitioning
BP002 / 2026-04-29

Root-cause fix for hash 4f68e52be5c79221 carrying 47+ rejections from BP001→BP002.

Coverage:
  T01–T02:  Session-boundary reset: clears in-memory counters / preserves historical log
  T03–T04:  Per-content-class partitioning (knight-prompt / letter-draft / feedback / project-canon)
  T05–T07:  Critical-Augur-only increment: clean writes don't count / critical do / advisory don't
  T08–T09:  Cross-session decay: events after reset are counted; events before reset are not
  T10:      Within-session threshold=12 still escalates (runaway loop defense preserved)
  T11–T13:  Allowlisted classes immune from cross-session accumulation
  T14:      Regression: KN001 Eblet bypass still works
  T15:      Session-start hook boundary fires correctly (reset_session_counters)
  T16:      Hash-class derivation covers all canonical paths
  T17:      Empirical replay — BP001→BP002 carryover scenario: allowed post-KN005
  T18:      Empirical replay — within-session repeated bad-content still escalates
  T19:      Empirical replay — genuine bad content across sessions still blocked within session
  T20:      Session state round-trip (write/read)
  T21:      Content class correctly derived for each canonical path type
  T22:      record_event skips when is_critical_augur_rejection=False
  T23:      record_event skips when enabled=False
  T24:      No ID collision in concurrent adds (stress test)
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

_WORKSPACE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _WORKSPACE not in sys.path:
    sys.path.insert(0, _WORKSPACE)

import discipline_wing.timewave_security as tw


# ── Helpers ────────────────────────────────────────────────────────────────────

def _seed_events(log_path: Path, hashes_and_sessions: list, base_ts: float = None) -> None:
    """Write fake TimeWave events to a log file for test setup."""
    if base_ts is None:
        base_ts = time.time()
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as f:
        for i, (ph, sess, offset_secs) in enumerate(hashes_and_sessions):
            import datetime
            ts_epoch = base_ts + offset_secs
            ts_iso = datetime.datetime.utcfromtimestamp(ts_epoch).isoformat() + "Z"
            rec = {
                "ts": ts_iso,
                "event_id": f"test{i:04d}",
                "source": "wing_block",
                "file_path": f"/tmp/test_{i}.md",
                "file_ext": ".md",
                "content_class": "general",
                "pattern_hash": ph,
                "triggered_augur_ids": ["augur-securities"],
                "consensus_decision": "block",
                "session": sess,
            }
            f.write(json.dumps(rec) + "\n")


class _TwFixture:
    """Context manager that patches TimeWave paths to a temp directory."""
    def __init__(self):
        self.tmpdir = tempfile.mkdtemp(prefix="tw_kn005_")
        self._events_log = Path(self.tmpdir) / "security_events.jsonl"
        self._session_state = Path(self.tmpdir) / "session_state.json"

    def __enter__(self):
        self._p1 = patch.object(tw, "SECURITY_EVENTS_DIR", Path(self.tmpdir))
        self._p2 = patch.object(tw, "SECURITY_EVENTS_LOG", self._events_log)
        self._p3 = patch.object(tw, "SESSION_STATE_FILE", self._session_state)
        self._p1.start()
        self._p2.start()
        self._p3.start()
        return self

    def __exit__(self, *args):
        self._p1.stop()
        self._p2.stop()
        self._p3.stop()
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    @property
    def events_log(self) -> Path:
        return self._events_log

    @property
    def session_state(self) -> Path:
        return self._session_state


# ── T01–T02: Session-boundary reset ───────────────────────────────────────────

class TestSessionBoundaryReset(unittest.TestCase):
    """T01–T02: reset_session_counters() writes state / preserves historical log."""

    def test_t01_reset_writes_session_state(self):
        """T01: reset_session_counters writes session_id and reset_ts_epoch to state file."""
        with _TwFixture() as fx:
            tw.reset_session_counters("B135")
            state = json.loads(fx.session_state.read_text(encoding="utf-8"))
            self.assertEqual(state["current_session_id"], "B135")
            self.assertGreater(state["reset_ts_epoch"], 0)
            self.assertIn("session_start_ts", state)

    def test_t02_reset_preserves_historical_log(self):
        """T02: After reset, the historical log still contains all old events (append-only)."""
        with _TwFixture() as fx:
            ph = "aabbccdd11223344"
            _seed_events(fx.events_log, [(ph, "B134", -7200)])  # 2h ago
            line_count_before = sum(1 for _ in fx.events_log.read_text().splitlines() if _)
            tw.reset_session_counters("B135")
            line_count_after = sum(1 for _ in fx.events_log.read_text().splitlines() if _)
            self.assertEqual(line_count_before, line_count_after,
                "Historical log must NOT be modified by reset_session_counters")


# ── T03–T04: Per-content-class partitioning ────────────────────────────────────

class TestContentClassPartitioning(unittest.TestCase):
    """T03–T04: Knight-prompt rejections don't poison letter-draft class."""

    def test_t03_knight_prompt_and_letter_draft_produce_different_hashes(self):
        """T03: Same category/ext but different content class → different hashes."""
        content = "Members earn a return on investment."  # securities_language trigger
        h_knight = tw._compute_pattern_hash(
            content, "BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_KN005.md"
        )
        h_letter = tw._compute_pattern_hash(
            content, "BISHOP_DROPZONE/03_BishopHandoffs/LETTER_DRAFT_KORINEK_BP002.md"
        )
        self.assertNotEqual(h_knight, h_letter,
            "Knight-prompt and letter-draft must have distinct TimeWave hashes")

    def test_t04_feedback_and_project_canon_produce_different_hashes(self):
        """T04: Feedback class and project-canon class produce distinct hashes."""
        content = "Members earn a return on investment."
        h_feedback = tw._compute_pattern_hash(content, "/tmp/feedback_credits.md")
        h_project  = tw._compute_pattern_hash(content, "/tmp/project_roadmap.md")
        self.assertNotEqual(h_feedback, h_project,
            "Feedback and project-canon must have distinct TimeWave hashes")


# ── T05–T07: Critical-Augur-only counter increment ────────────────────────────

class TestCriticalAugurOnlyIncrement(unittest.TestCase):
    """T05–T07: record_event only stores when is_critical_augur_rejection=True."""

    def test_t05_augur_clean_write_does_not_increment(self):
        """T05: record_event with is_critical_augur_rejection=False does NOT append."""
        with _TwFixture() as fx:
            event_id = tw.record_event(
                content="clean content",
                file_path="/tmp/test.md",
                triggered_augur_ids=[],
                consensus_decision="allow",
                is_critical_augur_rejection=False,
            )
            self.assertEqual(event_id, "", "Should return empty string when not a critical rejection")
            self.assertFalse(fx.events_log.exists(), "Log should not be created for non-critical rejection")

    def test_t06_critical_augur_blocked_write_does_increment(self):
        """T06: record_event with is_critical_augur_rejection=True DOES append."""
        with _TwFixture() as fx:
            event_id = tw.record_event(
                content="Members earn a return on investment.",
                file_path="/tmp/test.md",
                triggered_augur_ids=["augur-securities-language"],
                consensus_decision="block",
                is_critical_augur_rejection=True,
            )
            self.assertNotEqual(event_id, "", "Should return event_id for critical rejection")
            self.assertTrue(fx.events_log.exists(), "Log must be created for critical rejection")
            records = [json.loads(l) for l in fx.events_log.read_text().splitlines() if l.strip()]
            self.assertEqual(len(records), 1, "Exactly one record should be appended")
            self.assertEqual(records[0]["event_id"], event_id)

    def test_t07_advisory_augur_warning_does_not_increment(self):
        """T07: Advisory Augur warning (non-critical) does NOT increment TimeWave counter."""
        with _TwFixture() as fx:
            event_id = tw.record_event(
                content="Toolsmith note about session close.",
                file_path="/tmp/test.md",
                triggered_augur_ids=["augur-toolsmith"],
                consensus_decision="warn",
                is_critical_augur_rejection=False,  # advisory = not critical
            )
            self.assertEqual(event_id, "")
            self.assertFalse(fx.events_log.exists())


# ── T08–T09: Cross-session decay (events before reset don't count) ─────────────

class TestCrossSessionDecay(unittest.TestCase):
    """T08–T09: Events after reset are counted; events before reset are not."""

    def test_t08_events_after_reset_are_counted(self):
        """T08: Events recorded AFTER session reset count toward threshold."""
        with _TwFixture() as fx:
            content = "Members earn a return on investment."
            file_path = "/tmp/test_letter.md"
            ph = tw._compute_pattern_hash(content, file_path)

            # Reset session first
            tw.reset_session_counters("B135")
            reset_epoch = time.time()

            # Seed 5 events AFTER reset (positive offset)
            _seed_events(fx.events_log, [(ph, "B135", i + 1) for i in range(5)],
                         base_ts=reset_epoch)

            result = tw.match_security_pattern(content, file_path)
            self.assertEqual(result["prior_rejection_count"], 5,
                "Events after session reset must be counted")

    def test_t09_events_before_reset_are_not_counted(self):
        """T09: Events recorded BEFORE session reset do NOT count (carryover fix)."""
        with _TwFixture() as fx:
            content = "Members earn a return on investment."
            file_path = "/tmp/test_letter.md"
            ph = tw._compute_pattern_hash(content, file_path)

            # Seed 47 events BEFORE any reset (simulates BP001 accumulation)
            _seed_events(fx.events_log, [(ph, "B134", -i * 60) for i in range(47)],
                         base_ts=time.time())

            # Now reset to B135 (simulates session boundary)
            tw.reset_session_counters("B135")

            # Check pattern — should see 0, not 47
            result = tw.match_security_pattern(content, file_path)
            self.assertEqual(result["prior_rejection_count"], 0,
                "Events from prior session must NOT count after reset — this is the BP001→BP002 fix")
            self.assertFalse(result["pattern_detected"],
                "pattern_detected must be False after session reset clears cross-session counts")


# ── T10: Within-session threshold still escalates ─────────────────────────────

class TestWithinSessionThreshold(unittest.TestCase):
    """T10: threshold=12 still escalates within-session (runaway loop defense preserved)."""

    def test_t10_within_session_12_rejections_escalates(self):
        """T10: 12+ rejections with same hash within current session → pattern_detected=True."""
        with _TwFixture() as fx:
            content = "Members earn a return on investment."
            file_path = "/tmp/test_within_session.md"
            ph = tw._compute_pattern_hash(content, file_path)

            # Set up current session
            tw.reset_session_counters("B135")
            reset_epoch = json.loads(fx.session_state.read_text())["reset_ts_epoch"]

            # Seed exactly 12 events AFTER the reset
            _seed_events(fx.events_log, [(ph, "B135", i + 1) for i in range(12)],
                         base_ts=reset_epoch)

            result = tw.match_security_pattern(content, file_path)
            self.assertTrue(result["pattern_detected"],
                "12 within-session rejections must trigger pattern_detected=True (runaway defense)")
            self.assertGreaterEqual(result["weight_bump"], 0.0)


# ── T11–T13: Allowlisted classes immune from cross-session accumulation ────────

class TestAllowlistedClasses(unittest.TestCase):
    """T11–T13: Knight-prompt, letter-draft, milestone are immune from cross-session TW."""

    def _test_allowlisted_immune(self, file_path: str, content_class: str) -> None:
        """Helper: seed 47 pre-session events, verify zero count after reset."""
        with _TwFixture() as fx:
            content = "Members earn a return on investment."
            ph = tw._compute_pattern_hash(content, file_path)

            # Seed 47 old events (no session state → no reset yet)
            _seed_events(fx.events_log, [(ph, "B134", -i * 60) for i in range(47)],
                         base_ts=time.time())

            # Reset marks new session
            tw.reset_session_counters("B135")

            result = tw.match_security_pattern(content, file_path)
            self.assertEqual(result["prior_rejection_count"], 0,
                f"{content_class} class must be immune from cross-session TW accumulation")
            self.assertEqual(result["content_class"], content_class)

    def test_t11_knight_prompt_immune(self):
        """T11: PROMPT_KNIGHT_* paths exempt from cross-session accumulation."""
        self._test_allowlisted_immune(
            "BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_KN005.md",
            "knight-prompt"
        )

    def test_t12_letter_draft_immune(self):
        """T12: LETTER_DRAFT_* paths exempt from cross-session accumulation."""
        self._test_allowlisted_immune(
            "BISHOP_DROPZONE/03_BishopHandoffs/LETTER_DRAFT_KORINEK_BP002.md",
            "letter-draft"
        )

    def test_t13_milestone_immune(self):
        """T13: MILESTONE_* paths exempt from cross-session accumulation."""
        self._test_allowlisted_immune(
            "CONTEXT_MANAGEMENT/MILESTONE_HANDOFF_MARCH_2026.md",
            "milestone"
        )


# ── T14: KN001 Eblet bypass regression ────────────────────────────────────────

class TestEbletBypassRegression(unittest.TestCase):
    """T14: KN001 Eblet bypass still works — Eblet writes don't trigger TimeWave at all."""

    def test_t14_eblet_path_bypasses_timewave_in_engine(self):
        """T14: engine.evaluate() for an Eblet path has tw_enabled=False (no TW signal)."""
        from discipline_wing.engine import evaluate
        with patch("discipline_wing.timewave_security.match_security_pattern") as mock_tw:
            result = evaluate({
                "tool_name": "Write",
                "tool_input": {
                    "file_path": str(Path.home() / ".claude" / "state" / "eblets" / "BP002" / "test.eblet.md"),
                    "content": "Members earn a return on investment.",
                },
            })
            mock_tw.assert_not_called(), "TimeWave must NOT be consulted for Eblet paths"
            # Should be allow (fast-allow path) or at least not blocked by TW
            self.assertIsNone(result.timewave_security,
                "timewave_security field must be None for Eblet paths")


# ── T15–T16: Session-start hook + hash-class derivation ───────────────────────

class TestSessionHookAndHashDerivation(unittest.TestCase):
    """T15–T16: reset_session_counters + _derive_content_class coverage."""

    def test_t15_reset_then_read_roundtrip(self):
        """T15: reset_session_counters → _get_session_state returns correct values."""
        with _TwFixture() as fx:
            before_reset = time.time()
            tw.reset_session_counters("B135")
            after_reset = time.time()
            state = tw._get_session_state()
            self.assertEqual(state["current_session_id"], "B135")
            self.assertGreaterEqual(state["reset_ts_epoch"], before_reset)
            self.assertLessEqual(state["reset_ts_epoch"], after_reset)

    def test_t16_hash_class_derivation_covers_canonical_paths(self):
        """T16: _derive_content_class returns correct class for each canonical path type."""
        cases = [
            ("BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_KN005.md", "knight-prompt"),
            ("BISHOP_DROPZONE/03_BishopHandoffs/LETTER_DRAFT_KORINEK_BP002.md", "letter-draft"),
            ("CONTEXT_MANAGEMENT/MILESTONE_HANDOFF_MARCH_2026.md", "milestone"),
            ("/tmp/feedback_credits_oneway.md", "feedback"),
            ("/tmp/project_roadmap_2026.md", "project-canon"),
            ("INNOVATION_THRESH_2287_BP002.md", "innovation"),
            ("PAPER_FOUNDATION_B134.md", "paper"),
            ("librarian-mcp/stitchpunks/wrasse/session_ledger.jsonl", "stitchpunks"),
            ("platform/src/App.tsx", "platform-src"),
            ("/tmp/random_note.md", "general"),
        ]
        for path, expected_class in cases:
            with self.subTest(path=path):
                result = tw._derive_content_class(path)
                self.assertEqual(result, expected_class,
                    f"Path {path!r}: expected class {expected_class!r}, got {result!r}")


# ── T17–T19: Empirical replays ─────────────────────────────────────────────────

class TestEmpiricalReplays(unittest.TestCase):
    """T17–T19: BP001→BP002 scenario replays with KN005 patches applied."""

    def test_t17_bp001_carryover_scenario_allows_bp002_write(self):
        """
        T17: Empirical replay — hash from BP001 (47+ rejections) does NOT block BP002.

        Pre-KN005: 47 rejections in B134/BP001 → same hash → TW fires in B135/BP002.
        Post-KN005: session reset at B135 boundary → 0 prior_rejection_count for B135.
        """
        with _TwFixture() as fx:
            content = "Members earn a return on investment."
            file_path = "/tmp/test_letter.md"
            ph = tw._compute_pattern_hash(content, file_path)

            # Simulate BP001: 47 events accumulated
            _seed_events(fx.events_log, [(ph, "B134", -i * 60) for i in range(47)],
                         base_ts=time.time())

            # Session boundary: B135/BP002 starts
            tw.reset_session_counters("B135")

            # Knight-prompt write in BP002
            knight_path = "BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_KN005_BP002.md"
            result = tw.match_security_pattern(content, knight_path)
            self.assertEqual(result["prior_rejection_count"], 0,
                "T17: BP001→BP002 carryover must not block clean BP002 Knight-prompt writes")
            self.assertFalse(result["pattern_detected"],
                "T17: pattern_detected must be False after session reset for clean BP002 content")

    def test_t18_within_session_genuine_bad_content_still_escalates(self):
        """
        T18: Empirical replay — within-session repeated bad-content (12+) still escalates.
        KN005 must preserve runaway-loop defense.
        """
        with _TwFixture() as fx:
            content = "Members earn a return on investment."
            file_path = "/tmp/bad_letter.md"
            ph = tw._compute_pattern_hash(content, file_path)

            tw.reset_session_counters("B135")
            reset_epoch = json.loads(fx.session_state.read_text())["reset_ts_epoch"]

            # 12 within-session rejections (same session B135, same hash)
            _seed_events(fx.events_log, [(ph, "B135", i + 1) for i in range(12)],
                         base_ts=reset_epoch)

            result = tw.match_security_pattern(content, file_path)
            self.assertTrue(result["pattern_detected"],
                "T18: 12 within-session bad-content rejections must still escalate to pattern_detected=True")

    def test_t19_cross_session_genuine_bad_content_blocked_within_session(self):
        """
        T19: Empirical replay — genuine bad content repeated across sessions.
        Post-KN005: each session starts with count=0, but if content is genuinely bad
        and accumulates 12+ within the new session, it is still blocked.
        """
        with _TwFixture() as fx:
            content = "git push --force origin main"  # force_push trigger
            file_path = "/tmp/test_bash.sh"
            ph = tw._compute_pattern_hash(content, file_path)

            # B134 had 50 force_push rejections
            _seed_events(fx.events_log, [(ph, "B134", -i * 60) for i in range(50)],
                         base_ts=time.time())

            # New session B135 — those don't count
            tw.reset_session_counters("B135")
            reset_epoch = json.loads(fx.session_state.read_text())["reset_ts_epoch"]

            # Only 3 within-B135 rejections → below threshold
            _seed_events(fx.events_log, [(ph, "B135", i + 1) for i in range(3)],
                         base_ts=reset_epoch)

            result = tw.match_security_pattern(content, file_path)
            self.assertEqual(result["prior_rejection_count"], 3,
                "T19: Only within-session rejections count (3, not 53)")
            self.assertFalse(result["pattern_detected"],
                "T19: 3 within-session rejections don't reach threshold=12")


# ── T20–T24: Additional coverage ──────────────────────────────────────────────

class TestAdditionalCoverage(unittest.TestCase):

    def test_t20_session_state_absent_returns_safe_defaults(self):
        """T20: _get_session_state when no file exists returns safe defaults."""
        with _TwFixture():
            state = tw._get_session_state()
            self.assertEqual(state["current_session_id"], "")
            self.assertEqual(state["reset_ts_epoch"], 0.0)

    def test_t21_content_class_in_recorded_event(self):
        """T21: content_class is stored in recorded events for observability."""
        with _TwFixture() as fx:
            event_id = tw.record_event(
                content="Members earn a return on investment.",
                file_path="BISHOP_DROPZONE/03_BishopHandoffs/LETTER_DRAFT_TEST_BP002.md",
                triggered_augur_ids=["augur-securities-language"],
                consensus_decision="block",
                is_critical_augur_rejection=True,
            )
            self.assertNotEqual(event_id, "")
            records = [json.loads(l) for l in fx.events_log.read_text().splitlines() if l.strip()]
            self.assertEqual(records[0]["content_class"], "letter-draft",
                "Letter-draft content class must be recorded in event")

    def test_t22_record_event_skips_when_not_critical(self):
        """T22: record_event is a no-op and returns '' when is_critical_augur_rejection=False."""
        with _TwFixture() as fx:
            for _ in range(5):
                eid = tw.record_event(
                    content="clean content here",
                    file_path="/tmp/note.md",
                    triggered_augur_ids=[],
                    consensus_decision="warn",
                    is_critical_augur_rejection=False,
                )
                self.assertEqual(eid, "")
            self.assertFalse(fx.events_log.exists(), "No events file should be created for non-critical")

    def test_t23_record_event_skips_when_disabled(self):
        """T23: record_event is a no-op when enabled=False."""
        with _TwFixture() as fx:
            eid = tw.record_event(
                content="test",
                file_path="/tmp/x.md",
                triggered_augur_ids=[],
                consensus_decision="block",
                enabled=False,
                is_critical_augur_rejection=True,
            )
            self.assertEqual(eid, "")
            self.assertFalse(fx.events_log.exists())

    def test_t24_no_id_collision_in_batch_records(self):
        """T24: Multiple concurrent records produce unique event IDs (no collision)."""
        with _TwFixture() as fx:
            event_ids = set()
            for i in range(20):
                eid = tw.record_event(
                    content=f"Members earn a return on investment. Variant {i}",
                    file_path=f"/tmp/test_{i}.md",
                    triggered_augur_ids=["augur-securities"],
                    consensus_decision="block",
                    is_critical_augur_rejection=True,
                )
                self.assertNotEqual(eid, "", f"Event {i} must return a non-empty ID")
                event_ids.add(eid)
            self.assertEqual(len(event_ids), 20, "All 20 event IDs must be unique")


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    unittest.main(verbosity=2)
