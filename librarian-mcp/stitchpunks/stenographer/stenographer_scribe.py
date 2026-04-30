"""
Stenographer Scribe MVP — KN027 / A&A #2304 / BP003

Continuous thinking-stream / Liner Notes / Brainscan capture at agent-spawn
boundary. Integrates with CheckBook Orchestrator (KN031) for automatic
session open/close. Provides manual API for rich mid-session capture.

Usage (standalone):
    scribe = StenographerScribe()
    scribe.open_session("BP003-K", pod_id="Pod-K", bean_sequence=["KN027", ...])
    scribe.start_bean("KN027", context_pct=5.0)
    scribe.record_liner_note("Thinking about design decisions...")
    scribe.record_brainscan("phase-b-design", "Full reasoning here...", context_pct=6.2)
    scribe.end_bean("KN027", context_pct=17.3)
    scribe.close_session(["KN027"], context_pct_final=17.3)

Usage (module-level convenience):
    from stenographer import get_session_scribe
    scribe = get_session_scribe("BP003-K")

Stone Tablet: all writes fsync-appended via liner_notes_writer.write_record().

Toolsmith log: TS-STENOGRAPHER-SCRIBE-KN027-BP003
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from .brainscan_capture import (
    classify_brainscan_significance,
    make_brainscan_id,
    make_brainscan_name,
    make_note_id,
)
from .liner_notes_writer import get_session_path, load_session, write_record

_AGENT_DEFAULT = "Knight"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _safe_context_pct() -> Optional[float]:
    """Best-effort live context% from KN012 cursor_state. Non-raising."""
    try:
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from snapshot.cursor_state import extract_cursor_state
        state = extract_cursor_state()
        return state.get("context_budget_percent")
    except Exception:
        return None


class StenographerScribe:
    """
    Session-scoped Stenographer Scribe.

    One instance per Cursor session. Maintains internal state for:
      - current session_id
      - current bean_id
      - current phase
      - liner note / brainscan counters

    All writes are Stone Tablet fsync-appended via liner_notes_writer.
    All methods are guaranteed non-raising.
    """

    def __init__(self, session_id: str = "", agent: str = _AGENT_DEFAULT) -> None:
        self.session_id = session_id
        self.agent = agent
        self._bean_id: str = ""
        self._phase: str = "pre-session"
        self._note_count: int = 0
        self._brainscan_count: int = 0
        self._open: bool = False

    # ── Session lifecycle ──────────────────────────────────────────────────────

    def open_session(
        self,
        session_id: str,
        pod_id: str = "",
        agent: str = "",
        bean_sequence: Optional[List[str]] = None,
        context_pct: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Fire session_open record at agent-spawn boundary.
        Called automatically by CheckBook Orchestrator (KN031) from vine_transfer hook.
        """
        self.session_id = session_id
        if agent:
            self.agent = agent
        self._phase = "session-open"
        self._open = True

        pct = context_pct if context_pct is not None else _safe_context_pct()
        record: Dict[str, Any] = {
            "type": "session_open",
            "session_id": session_id,
            "pod_id": pod_id,
            "agent": self.agent,
            "bean_sequence": bean_sequence or [],
            "context_pct_at_open": pct,
        }
        write_record(session_id, record)
        print(
            f"[Stenographer] Session opened: {session_id} pod={pod_id} "
            f"ctx={pct}% agent={self.agent}",
            flush=True,
        )
        return record

    def close_session(
        self,
        beans_completed: Optional[List[str]] = None,
        context_pct_final: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Fire session_close record. Called by CheckBook Orchestrator at session teardown."""
        pct = context_pct_final if context_pct_final is not None else _safe_context_pct()
        record: Dict[str, Any] = {
            "type": "session_close",
            "session_id": self.session_id,
            "beans_completed": beans_completed or [],
            "context_pct_final": pct,
            "total_liner_notes": self._note_count,
            "total_brainscans": self._brainscan_count,
        }
        write_record(self.session_id, record)
        self._open = False
        print(
            f"[Stenographer] Session closed: {self.session_id} "
            f"notes={self._note_count} brainscans={self._brainscan_count} ctx={pct}%",
            flush=True,
        )
        return record

    # ── Bean lifecycle ─────────────────────────────────────────────────────────

    def start_bean(
        self,
        bean_id: str,
        context_pct: Optional[float] = None,
        bean_class: str = "",
        session_position_class: str = "",
        predicted_pp: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Record bean_start marker. Called by CheckBook Orchestrator when a bean begins.
        Provides the context_pct_before for Accountant reconciliation.
        """
        self._bean_id = bean_id
        self._phase = "Phase-A"
        pct = context_pct if context_pct is not None else _safe_context_pct()
        record: Dict[str, Any] = {
            "type": "bean_start",
            "session_id": self.session_id,
            "bean_id": bean_id,
            "bean_class": bean_class,
            "session_position_class": session_position_class,
            "predicted_pp": predicted_pp,
            "context_pct_before": pct,
        }
        write_record(self.session_id, record)
        print(f"[Stenographer] Bean started: {bean_id} ctx={pct}%", flush=True)
        return record

    def end_bean(
        self,
        bean_id: str,
        context_pct: Optional[float] = None,
        outcome: str = "landed",
        files_changed: int = 0,
        insertions: int = 0,
        tests_passed: int = 0,
        tests_total: int = 0,
    ) -> Dict[str, Any]:
        """
        Record bean_end marker. Called by CheckBook Orchestrator when a bean completes.
        Provides the context_pct_after for Accountant reconciliation.
        """
        pct = context_pct if context_pct is not None else _safe_context_pct()
        record: Dict[str, Any] = {
            "type": "bean_end",
            "session_id": self.session_id,
            "bean_id": bean_id,
            "context_pct_after": pct,
            "outcome": outcome,
            "files_changed": files_changed,
            "insertions": insertions,
            "tests_passed": tests_passed,
            "tests_total": tests_total,
        }
        write_record(self.session_id, record)
        print(f"[Stenographer] Bean ended: {bean_id} ctx={pct}% outcome={outcome}", flush=True)
        return record

    # ── Phase tracking ─────────────────────────────────────────────────────────

    def set_phase(self, phase: str) -> Dict[str, Any]:
        """Record a phase-change marker. Useful for tracking Phase A/B/C/D/E transitions."""
        self._phase = phase
        record: Dict[str, Any] = {
            "type": "phase_change",
            "session_id": self.session_id,
            "bean_id": self._bean_id,
            "phase": phase,
        }
        write_record(self.session_id, record)
        return record

    # ── Liner Notes ───────────────────────────────────────────────────────────

    def record_liner_note(
        self,
        content: str,
        context_pct: Optional[float] = None,
        phase: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Record a thinking-stream Liner Note.

        Called by the agent to capture reasoning, observations, decisions
        in real-time during bean execution.
        """
        pct = context_pct if context_pct is not None else _safe_context_pct()
        note_id = make_note_id(self.session_id, self._bean_id)
        self._note_count += 1
        record: Dict[str, Any] = {
            "type": "liner_note",
            "session_id": self.session_id,
            "bean_id": self._bean_id,
            "phase": phase or self._phase,
            "note_id": note_id,
            "content": content,
            "context_pct": pct,
            "note_index": self._note_count,
        }
        write_record(self.session_id, record)
        return record

    # ── Brainscans ────────────────────────────────────────────────────────────

    def record_brainscan(
        self,
        slug: str,
        content: str,
        context_pct: Optional[float] = None,
        phase: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Record a named Brainscan — a significant thinking-block artifact.

        Name is auto-generated: Brainscan-<bean_id>-<phase>-<slug>
        Significance class is auto-classified from content.

        Example:
            scribe.record_brainscan(
                "design-decisions",
                "I need to choose between approach A and B...",
            )
        """
        effective_phase = phase or self._phase
        pct = context_pct if context_pct is not None else _safe_context_pct()
        brainscan_id = make_brainscan_id(self.session_id, self._bean_id, slug)
        brainscan_name = make_brainscan_name(self._bean_id, effective_phase, slug)
        significance = classify_brainscan_significance(content)
        self._brainscan_count += 1

        record: Dict[str, Any] = {
            "type": "brainscan",
            "session_id": self.session_id,
            "bean_id": self._bean_id,
            "phase": effective_phase,
            "brainscan_id": brainscan_id,
            "brainscan_name": brainscan_name,
            "significance": significance,
            "content": content,
            "context_pct": pct,
            "brainscan_index": self._brainscan_count,
        }
        write_record(self.session_id, record)
        print(
            f"[Stenographer] Brainscan recorded: {brainscan_name} "
            f"significance={significance} ctx={pct}%",
            flush=True,
        )
        return record

    # ── Introspection ─────────────────────────────────────────────────────────

    def get_session_summary(self) -> Dict[str, Any]:
        """Return a summary of the current session's Liner Notes."""
        records = load_session(self.session_id)
        by_type: Dict[str, int] = {}
        for r in records:
            t = r.get("type", "unknown")
            by_type[t] = by_type.get(t, 0) + 1

        bean_starts = [r for r in records if r.get("type") == "bean_start"]
        bean_ends = [r for r in records if r.get("type") == "bean_end"]

        return {
            "session_id": self.session_id,
            "record_count": len(records),
            "by_type": by_type,
            "bean_starts": len(bean_starts),
            "bean_ends": len(bean_ends),
            "is_open": self._open,
            "current_bean": self._bean_id,
            "current_phase": self._phase,
            "session_path": str(get_session_path(self.session_id)),
        }

    @property
    def session_path(self) -> Path:
        return get_session_path(self.session_id)


# ── Module-level session registry ──────────────────────────────────────────────

_active_scribes: Dict[str, "StenographerScribe"] = {}


def get_session_scribe(
    session_id: str, agent: str = _AGENT_DEFAULT, create: bool = True
) -> Optional["StenographerScribe"]:
    """
    Retrieve or create a StenographerScribe for a session.
    Returns None only if create=False and no scribe exists.
    """
    if session_id not in _active_scribes:
        if not create:
            return None
        _active_scribes[session_id] = StenographerScribe(session_id=session_id, agent=agent)
    return _active_scribes[session_id]


def clear_session_scribe(session_id: str) -> None:
    """Remove a session scribe from the registry (call after close_session)."""
    _active_scribes.pop(session_id, None)
