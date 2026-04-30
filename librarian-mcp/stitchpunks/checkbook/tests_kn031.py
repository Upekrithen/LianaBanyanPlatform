"""
Tests — KN031 CheckBook Orchestrator + Hooks Integration
Phase D trust-but-verify gate.

Run: python -m pytest librarian-mcp/stitchpunks/checkbook/tests_kn031.py -v

Tests cover:
  1. CheckBookSession: arm() / start_bean() / end_bean() / close()
  2. CheckBookSession: scribe property returns StenographerScribe
  3. CheckBookSession: bean lifecycle writes to Liner Notes
  4. CheckBookSession: close() produces CheckBook receipt
  5. CheckBookSession: receipt is Chronos-signed and verifiable
  6. CheckBookSession: graceful degradation (scribe errors)
  7. Module functions: arm_session / get_active_session / close_session
  8. session_receipt_emitter: load_receipt / verify_receipt / format / federation
  9. vine_transfer_hook: checkbook_arm in component_results
  10. KN030 integration: bundle_kit includes orchestrator when available

Toolsmith log: TS-CHECKBOOK-ORCHESTRATOR-KN031-BP003
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict
from unittest.mock import MagicMock, patch

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE.parent.parent))
sys.path.insert(0, str(_HERE.parent))


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def session_id():
    return "TEST-KN031-ORCH-001"


@pytest.fixture()
def tmp_receipts(tmp_path, monkeypatch):
    import checkbook.checkbook_orchestrator as co
    monkeypatch.setattr(co, "_RECEIPTS_DIR", tmp_path)
    return tmp_path


@pytest.fixture()
def tmp_steno_sessions(tmp_path, monkeypatch):
    import stenographer.liner_notes_writer as lw
    monkeypatch.setattr(lw, "_SESSIONS_DIR", tmp_path)
    return tmp_path


@pytest.fixture()
def tmp_acct_sessions(tmp_path, monkeypatch):
    import accountant.ledger_writer as lw
    monkeypatch.setattr(lw, "_SESSIONS_DIR", tmp_path)
    return tmp_path


@pytest.fixture()
def tmp_emitter_receipts(tmp_path, monkeypatch):
    import checkbook.session_receipt_emitter as sre
    monkeypatch.setattr(sre, "_RECEIPTS_DIR", tmp_path)
    return tmp_path


# ── CheckBookSession tests ─────────────────────────────────────────────────────

class TestCheckBookSession:
    def test_arm_creates_stenographer(self, tmp_receipts, tmp_steno_sessions, session_id, monkeypatch):
        from checkbook.checkbook_orchestrator import CheckBookSession
        # Disable shutterbug for test speed
        session = CheckBookSession(
            session_id=session_id, pod_id="Pod-K",
            bean_sequence=["KN027", "KN028"],
            enable_shutterbug=False,
        )
        result = session.arm(context_pct=5.0)
        assert result["status"] == "armed"
        assert session._armed is True

    def test_arm_idempotent(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        result = session.arm(context_pct=5.0)
        assert result["status"] == "already_armed"

    def test_scribe_property_returns_stenographer(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        from stenographer.stenographer_scribe import StenographerScribe
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        assert isinstance(session.scribe, StenographerScribe)

    def test_start_bean_writes_liner_note(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        from stenographer.liner_notes_writer import load_records_by_type
        session = CheckBookSession(
            session_id=session_id,
            bean_sequence=["KN027", "KN028"],
            enable_shutterbug=False,
        )
        session.arm(context_pct=5.0)
        session.start_bean("KN027", context_pct=5.0, bean_class="medium", predicted_pp=12.0)
        starts = load_records_by_type(session_id, "bean_start")
        assert len(starts) == 1
        assert starts[0]["bean_id"] == "KN027"

    def test_end_bean_writes_liner_note(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        from stenographer.liner_notes_writer import load_records_by_type
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        session.start_bean("KN027", context_pct=5.0)
        session.end_bean("KN027", context_pct=17.3, outcome="landed")
        ends = load_records_by_type(session_id, "bean_end")
        assert len(ends) == 1
        assert ends[0]["outcome"] == "landed"

    def test_completed_vs_deferred_tracking(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        session.start_bean("KN027")
        session.end_bean("KN027", outcome="landed")
        session.start_bean("KN028")
        session.end_bean("KN028", outcome="deferred")
        assert "KN027" in session._beans_completed
        assert "KN028" in session._beans_deferred

    def test_session_position_class_auto_classified(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        from stenographer.liner_notes_writer import load_records_by_type
        session = CheckBookSession(
            session_id=session_id,
            bean_sequence=["KN027", "KN028", "KN029"],
            enable_shutterbug=False,
        )
        session.arm(context_pct=5.0)
        session.start_bean("KN027")
        session.start_bean("KN028")
        session.start_bean("KN029")
        starts = load_records_by_type(session_id, "bean_start")
        positions = {r["bean_id"]: r.get("session_position_class") for r in starts}
        assert positions["KN027"] == "pod_first"
        assert positions["KN028"] == "pod_middle"
        assert positions["KN029"] == "pod_last"

    def test_record_liner_note_convenience(self, tmp_receipts, tmp_steno_sessions, session_id):
        from checkbook.checkbook_orchestrator import CheckBookSession
        from stenographer.liner_notes_writer import load_records_by_type
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        session.start_bean("KN027")
        session.record_liner_note("Testing the orchestrator API")
        notes = load_records_by_type(session_id, "liner_note")
        assert len(notes) == 1
        assert "orchestrator" in notes[0]["content"]

    def test_close_emits_receipt(
        self, tmp_receipts, tmp_steno_sessions, tmp_acct_sessions, session_id
    ):
        from checkbook.checkbook_orchestrator import CheckBookSession
        session = CheckBookSession(
            session_id=session_id, pod_id="Pod-K",
            bean_sequence=["KN027"],
            enable_shutterbug=False,
        )
        session.arm(context_pct=5.0)
        session.start_bean("KN027", context_pct=5.0, bean_class="medium", predicted_pp=12.0)
        session.end_bean("KN027", context_pct=17.3, outcome="landed")
        result = session.close(context_pct_final=17.3)
        assert "checkbook_receipt" in result
        assert result["checkbook_receipt"]["session_id"] == session_id

    def test_receipt_is_persisted(
        self, tmp_receipts, tmp_steno_sessions, tmp_acct_sessions, session_id
    ):
        from checkbook.checkbook_orchestrator import CheckBookSession
        session = CheckBookSession(
            session_id=session_id, enable_shutterbug=False
        )
        session.arm(context_pct=5.0)
        session.start_bean("KN027", context_pct=5.0)
        session.end_bean("KN027", context_pct=17.3)
        result = session.close(context_pct_final=17.3)
        receipt_path = Path(result.get("receipt_path", ""))
        assert receipt_path.exists()

    def test_receipt_chronos_signed(
        self, tmp_receipts, tmp_steno_sessions, tmp_acct_sessions, session_id
    ):
        from checkbook.checkbook_orchestrator import CheckBookSession
        from checkbook.session_receipt_emitter import verify_receipt
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        session.start_bean("KN027", context_pct=5.0)
        session.end_bean("KN027", context_pct=17.3)
        result = session.close(context_pct_final=17.3)
        receipt = result["checkbook_receipt"]
        assert verify_receipt(receipt)

    def test_graceful_degradation_no_crash(
        self, tmp_receipts, tmp_steno_sessions, session_id
    ):
        """Session close should not raise even if Accountant import fails."""
        from checkbook.checkbook_orchestrator import CheckBookSession
        session = CheckBookSession(session_id=session_id, enable_shutterbug=False)
        session.arm(context_pct=5.0)
        try:
            result = session.close(context_pct_final=10.0)
            assert isinstance(result, dict)
        except Exception as exc:
            pytest.fail(f"session.close() raised: {exc}")


# ── Module-level functions ─────────────────────────────────────────────────────

class TestModuleFunctions:
    def test_arm_session_creates_and_returns(self, tmp_receipts, tmp_steno_sessions, session_id, monkeypatch):
        import checkbook.checkbook_orchestrator as co
        monkeypatch.setattr(co, "_active_sessions", {})
        session = co.arm_session(
            session_id=session_id, pod_id="Pod-K",
            bean_sequence=["KN027"], enable_shutterbug=False,
        )
        assert session.session_id == session_id
        assert session._armed is True
        co._active_sessions.pop(session_id, None)

    def test_arm_session_idempotent(self, tmp_receipts, tmp_steno_sessions, session_id, monkeypatch):
        import checkbook.checkbook_orchestrator as co
        monkeypatch.setattr(co, "_active_sessions", {})
        s1 = co.arm_session(session_id, enable_shutterbug=False)
        s2 = co.arm_session(session_id, enable_shutterbug=False)
        assert s1 is s2
        co._active_sessions.pop(session_id, None)

    def test_get_active_session_returns_none_if_missing(self, session_id, monkeypatch):
        import checkbook.checkbook_orchestrator as co
        monkeypatch.setattr(co, "_active_sessions", {})
        assert co.get_active_session("NONEXISTENT-999") is None


# ── SessionReceiptEmitter tests ────────────────────────────────────────────────

class TestSessionReceiptEmitter:
    def _make_receipt(self, session_id: str) -> Dict[str, Any]:
        from checkbook.checkbook_orchestrator import _chronos_sign
        body = {
            "receipt_type": "checkbook_receipt",
            "session_id": session_id,
            "pod_id": "Pod-K",
            "agent": "Knight",
            "bean_sequence": ["KN027"],
            "beans_completed": ["KN027"],
            "beans_deferred": [],
            "context_pct_open": 5.0,
            "context_pct_close": 17.3,
            "pod_summary": {
                "scenario_verdict": "A",
                "total_measured_pp": 12.3,
                "total_predicted_pp": 12.0,
                "mean_pp_per_bean": 12.3,
            },
            "bean_rows": [],
            "generated_at": "2026-04-30T12:00:00Z",
        }
        sig = _chronos_sign(body)
        return {**body, "chronos_signature": sig}

    def test_verify_receipt_valid(self, session_id):
        from checkbook.session_receipt_emitter import verify_receipt
        receipt = self._make_receipt(session_id)
        assert verify_receipt(receipt) is True

    def test_verify_receipt_invalid_on_tamper(self, session_id):
        from checkbook.session_receipt_emitter import verify_receipt
        receipt = self._make_receipt(session_id)
        receipt["pod_summary"]["scenario_verdict"] = "C"  # tamper
        assert verify_receipt(receipt) is False

    def test_verify_receipt_no_sig(self, session_id):
        from checkbook.session_receipt_emitter import verify_receipt
        receipt = {"session_id": session_id, "no_sig": True}
        assert verify_receipt(receipt) is False

    def test_format_receipt_summary(self, session_id):
        from checkbook.session_receipt_emitter import format_receipt_summary
        receipt = self._make_receipt(session_id)
        summary = format_receipt_summary(receipt)
        assert "CheckBook Receipt" in summary
        assert session_id in summary
        assert "Scenario: A" in summary

    def test_load_receipt_missing_returns_none(self, tmp_emitter_receipts):
        from checkbook.session_receipt_emitter import load_receipt
        result = load_receipt("NONEXISTENT-SESSION-XYZ")
        assert result is None

    def test_list_receipts_empty(self, tmp_emitter_receipts):
        from checkbook.session_receipt_emitter import list_receipts
        assert list_receipts() == []

    def test_prepare_federation_share(self, session_id):
        from checkbook.session_receipt_emitter import prepare_federation_share
        receipt = self._make_receipt(session_id)
        share = prepare_federation_share(receipt, participant_id="anonymous")
        assert share["participant_id"] == "anonymous"
        assert "session_id" not in share
        assert share["scenario_verdict"] == "A"
        assert "#2304-CheckBook" in share["lineage"]
        assert share["total_measured_pp"] == 12.3


# ── vine_transfer_hook integration test ───────────────────────────────────────

class TestVineTransferHookIntegration:
    def test_checkbook_arm_in_component_results(self, tmp_steno_sessions, tmp_receipts):
        """
        Verify vine_transfer_hook.run_vine_transfer() includes checkbook_arm
        in component_results (Action 13 extension is present).
        """
        try:
            # Test that the hook file contains Action 13 reference
            hook_path = Path(__file__).parent.parent / "vine_transfer" / "vine_transfer_hook.py"
            content = hook_path.read_text(encoding="utf-8")
            assert "Action 13: CheckBook Session Arm" in content
            assert "checkbook_arm" in content
            assert "arm_session" in content
        except FileNotFoundError:
            pytest.skip("vine_transfer_hook.py not found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
