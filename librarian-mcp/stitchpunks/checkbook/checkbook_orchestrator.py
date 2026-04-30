"""
CheckBook Orchestrator — KN031 / A&A #2304 / BP003

Session-scoped coordinator that arms and fires all three Scribes:
  - Stenographer Scribe (KN027) — Liner Notes + Brainscan
  - Shutterbug Scribe (KN028) — Screenshots at context thresholds
  - Accountant Scribe (KN029) — Reconciliation → CheckBook ledger

Integrates with KN023 Vine Transfer SessionStart hook:
  vine_transfer_hook.py calls checkbook_arm_session() at session open.

Emits a CheckBook Receipt (Chronos-signed) at session close.

Usage:
    from checkbook.checkbook_orchestrator import CheckBookSession

    # At session start (called automatically from vine_transfer_hook):
    session = CheckBookSession(
        session_id="BP003-K",
        pod_id="Pod-K",
        bean_sequence=["KN027", "KN028", "KN029", "KN030", "KN031"],
    )
    session.arm()

    # Before each bean:
    session.start_bean("KN027", context_pct=5.0, bean_class="medium", predicted_pp=12.0)

    # During bean (optional):
    session.scribe.record_liner_note("Thinking...")
    session.scribe.record_brainscan("key-decision", "Full reasoning...")

    # After each bean:
    session.end_bean("KN027", context_pct=17.3, outcome="landed", files_changed=5)

    # At session close:
    receipt = session.close(context_pct_final=45.0)

Stone Tablet: receipt written to checkbook/receipts/<session_id>_receipt.json (fsync)

Toolsmith log: TS-CHECKBOOK-ORCHESTRATOR-KN031-BP003
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_RECEIPTS_DIR = _HERE / "receipts"
_STITCHPUNKS_DIR = _HERE.parent

# Add stitchpunks to path for scribe imports
if str(_STITCHPUNKS_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS_DIR))


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(body: Dict[str, Any]) -> Dict[str, Any]:
    """Compute Chronos signature for a receipt body."""
    canonical = json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    chronicle_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {
        "chronicler_hash": chronicle_hash,
        "temporal_anchor": _iso_now(),
        "verify_method": "sha256(json.dumps(receipt_body_no_sig, sort_keys=True))",
    }


class CheckBookSession:
    """
    Session-scoped CheckBook Orchestrator.

    Arms Stenographer + Shutterbug on session open.
    Tracks bean lifecycle via start_bean/end_bean.
    Fires Accountant reconciliation on session close.
    Emits Chronos-signed CheckBook Receipt.

    All methods are guaranteed non-raising.
    """

    def __init__(
        self,
        session_id: str,
        pod_id: str = "",
        bean_sequence: Optional[List[str]] = None,
        agent: str = "Knight",
        shutterbug_poll_interval_s: float = 5.0,
        enable_shutterbug: bool = True,
    ) -> None:
        self.session_id = session_id
        self.pod_id = pod_id
        self.bean_sequence = bean_sequence or []
        self.agent = agent
        self.shutterbug_poll_interval_s = shutterbug_poll_interval_s
        self.enable_shutterbug = enable_shutterbug
        self._armed = False
        self._beans_started: List[str] = []
        self._beans_completed: List[str] = []
        self._beans_deferred: List[str] = []
        self._context_pct_open: Optional[float] = None
        self._context_pct_close: Optional[float] = None

        # Scribe references (populated on arm())
        self._stenographer: Optional[Any] = None
        self._shutterbug_observer: Optional[Any] = None

    @property
    def scribe(self) -> Any:
        """Access to Stenographer Scribe for agent to record liner notes."""
        if self._stenographer is None:
            self._arm_stenographer()
        return self._stenographer

    # ── Session lifecycle ──────────────────────────────────────────────────────

    def arm(self, context_pct: Optional[float] = None) -> Dict[str, Any]:
        """
        Arm all three Scribes for this session. Called at session open.
        Integrates with vine_transfer_hook.py (Action 13 extension).
        """
        if self._armed:
            return {"status": "already_armed", "session_id": self.session_id}

        self._context_pct_open = context_pct or self._safe_context_pct()
        arm_results: Dict[str, Any] = {}

        # Arm Stenographer
        steno_result = self._arm_stenographer()
        arm_results["stenographer"] = steno_result

        # Open Stenographer session
        try:
            self._stenographer.open_session(
                session_id=self.session_id,
                pod_id=self.pod_id,
                agent=self.agent,
                bean_sequence=self.bean_sequence,
                context_pct=self._context_pct_open,
            )
            arm_results["stenographer_open"] = "ok"
        except Exception as exc:
            arm_results["stenographer_open"] = f"error: {exc}"

        # Arm Shutterbug (if enabled)
        if self.enable_shutterbug:
            shutterbugs_result = self._arm_shutterbug()
            arm_results["shutterbug"] = shutterbugs_result

        self._armed = True
        print(
            f"[CheckBook] Session armed: {self.session_id} pod={self.pod_id} "
            f"beans={self.bean_sequence} ctx={self._context_pct_open}%",
            flush=True,
        )
        return {"status": "armed", "session_id": self.session_id, **arm_results}

    def start_bean(
        self,
        bean_id: str,
        context_pct: Optional[float] = None,
        bean_class: str = "medium",
        session_position_class: str = "",
        predicted_pp: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Mark the start of a bean. Records bean_start in Stenographer.
        Updates Shutterbug's current bean context.
        """
        self._beans_started.append(bean_id)

        # Determine session position class if not provided
        if not session_position_class and self.bean_sequence:
            try:
                idx = self.bean_sequence.index(bean_id)
                n = len(self.bean_sequence)
                if idx == 0:
                    session_position_class = "pod_first"
                elif idx == n - 1:
                    session_position_class = "pod_last"
                else:
                    session_position_class = "pod_middle"
            except ValueError:
                session_position_class = "pod_middle"

        result: Dict[str, Any] = {"bean_id": bean_id}

        # Stenographer bean_start
        try:
            rec = self.scribe.start_bean(
                bean_id=bean_id,
                context_pct=context_pct,
                bean_class=bean_class,
                session_position_class=session_position_class,
                predicted_pp=predicted_pp,
            )
            result["stenographer"] = "ok"
        except Exception as exc:
            result["stenographer"] = f"error: {exc}"

        # Shutterbug: update current bean
        try:
            if self._shutterbug_observer:
                self._shutterbug_observer.set_bean(bean_id)
                # Manual capture at bean boundary
                self._shutterbug_observer.capture_now(
                    context_pct=context_pct or 0.0,
                    label=f"bean-start:{bean_id}",
                )
            result["shutterbug"] = "ok"
        except Exception as exc:
            result["shutterbug"] = f"error: {exc}"

        return result

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
        Mark the end of a bean. Records bean_end in Stenographer.
        Captures bean-boundary screenshot in Shutterbug.
        """
        if outcome == "landed":
            self._beans_completed.append(bean_id)
        else:
            self._beans_deferred.append(bean_id)

        result: Dict[str, Any] = {"bean_id": bean_id, "outcome": outcome}

        # Stenographer bean_end
        try:
            self.scribe.end_bean(
                bean_id=bean_id,
                context_pct=context_pct,
                outcome=outcome,
                files_changed=files_changed,
                insertions=insertions,
                tests_passed=tests_passed,
                tests_total=tests_total,
            )
            result["stenographer"] = "ok"
        except Exception as exc:
            result["stenographer"] = f"error: {exc}"

        # Shutterbug: capture at bean-end boundary
        try:
            if self._shutterbug_observer:
                self._shutterbug_observer.capture_now(
                    context_pct=context_pct or 0.0,
                    label=f"bean-end:{bean_id}:{outcome}",
                )
            result["shutterbug"] = "ok"
        except Exception as exc:
            result["shutterbug"] = f"error: {exc}"

        return result

    def record_liner_note(self, content: str, context_pct: Optional[float] = None) -> None:
        """Convenience: record a Liner Note via the Stenographer."""
        try:
            self.scribe.record_liner_note(content, context_pct=context_pct)
        except Exception as exc:
            print(f"[CheckBook] Liner note error: {exc}", file=sys.stderr)

    def record_brainscan(
        self, slug: str, content: str, context_pct: Optional[float] = None
    ) -> None:
        """Convenience: record a Brainscan via the Stenographer."""
        try:
            self.scribe.record_brainscan(slug, content, context_pct=context_pct)
        except Exception as exc:
            print(f"[CheckBook] Brainscan error: {exc}", file=sys.stderr)

    def close(self, context_pct_final: Optional[float] = None) -> Dict[str, Any]:
        """
        Close the session: stop Shutterbug, close Stenographer,
        run Accountant reconciliation, emit CheckBook Receipt.

        Returns the full CheckBook receipt dict.
        """
        self._context_pct_close = context_pct_final or self._safe_context_pct()
        result: Dict[str, Any] = {"session_id": self.session_id}

        # Stop Shutterbug
        shutterbug_manifest: List[Dict[str, Any]] = []
        try:
            if self._shutterbug_observer:
                shutterbug_manifest = self._shutterbug_observer.stop()
                self._shutterbug_observer = None
            result["shutterbug_captures"] = len(shutterbug_manifest)
        except Exception as exc:
            result["shutterbug_stop"] = f"error: {exc}"

        # Close Stenographer
        try:
            self.scribe.close_session(
                beans_completed=self._beans_completed,
                context_pct_final=self._context_pct_close,
            )
            result["stenographer_close"] = "ok"
        except Exception as exc:
            result["stenographer_close"] = f"error: {exc}"

        # Run Accountant reconciliation
        accountant_result: Dict[str, Any] = {}
        try:
            from accountant.accountant_scribe import AccountantScribe
            acct = AccountantScribe.from_disk(
                session_id=self.session_id, pod_id=self.pod_id
            )
            accountant_result = acct.reconcile_and_write()
            acct.print_receipt()
            result["accountant"] = "ok"
            result["ledger_paths"] = accountant_result.get("paths", {})
        except Exception as exc:
            result["accountant"] = f"error: {exc}"
            print(f"[CheckBook] Accountant error: {exc}", file=sys.stderr)

        # Emit CheckBook Receipt
        try:
            receipt = self._emit_receipt(accountant_result)
            result["checkbook_receipt"] = receipt
            result["receipt_path"] = receipt.get("receipt_path", "")
        except Exception as exc:
            result["receipt_error"] = str(exc)
            print(f"[CheckBook] Receipt emit error: {exc}", file=sys.stderr)

        self._armed = False
        print(
            f"[CheckBook] Session closed: {self.session_id} "
            f"landed={len(self._beans_completed)} deferred={len(self._beans_deferred)} "
            f"ctx_open={self._context_pct_open}% ctx_close={self._context_pct_close}%",
            flush=True,
        )
        return result

    # ── Private helpers ────────────────────────────────────────────────────────

    def _arm_stenographer(self) -> str:
        try:
            from stenographer.stenographer_scribe import get_session_scribe
            self._stenographer = get_session_scribe(self.session_id, agent=self.agent)
            return "ok"
        except Exception as exc:
            print(f"[CheckBook] Stenographer arm error: {exc}", file=sys.stderr)
            return f"error: {exc}"

    def _arm_shutterbug(self) -> str:
        try:
            from shutterbug.shutterbug_scribe import get_session_observer
            self._shutterbug_observer = get_session_observer(
                session_id=self.session_id,
                bean_id=self.bean_sequence[0] if self.bean_sequence else "",
                poll_interval_s=self.shutterbug_poll_interval_s,
            )
            self._shutterbug_observer.start()
            return "ok"
        except Exception as exc:
            print(f"[CheckBook] Shutterbug arm error: {exc}", file=sys.stderr)
            return f"error: {exc}"

    def _safe_context_pct(self) -> Optional[float]:
        try:
            from snapshot.cursor_state import extract_cursor_state
            return extract_cursor_state().get("context_budget_percent")
        except Exception:
            return None

    def _emit_receipt(self, accountant_result: Dict[str, Any]) -> Dict[str, Any]:
        """Build, sign, and persist CheckBook Receipt to Stone Tablet."""
        _RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)

        pod_summary = accountant_result.get("pod_summary", {})
        bean_rows = accountant_result.get("rows", [])

        receipt_body: Dict[str, Any] = {
            "receipt_type": "checkbook_receipt",
            "receipt_schema_version": "1.0",
            "session_id": self.session_id,
            "pod_id": self.pod_id,
            "agent": self.agent,
            "bean_sequence": self.bean_sequence,
            "beans_completed": self._beans_completed,
            "beans_deferred": self._beans_deferred,
            "context_pct_open": self._context_pct_open,
            "context_pct_close": self._context_pct_close,
            "pod_summary": pod_summary,
            "bean_rows": bean_rows,
            "generated_at": _iso_now(),
        }

        signature = _chronos_sign(receipt_body)
        full_receipt: Dict[str, Any] = {
            **receipt_body,
            "chronos_signature": signature,
        }

        # Stone Tablet fsync
        safe_id = self.session_id.replace("/", "_").replace("\\", "_").replace(":", "-")
        receipt_path = _RECEIPTS_DIR / f"{safe_id}_receipt.json"
        tmp_path = receipt_path.with_suffix(".json.tmp")
        with tmp_path.open("w", encoding="utf-8") as fh:
            json.dump(full_receipt, fh, indent=2, ensure_ascii=False)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(str(tmp_path), str(receipt_path))

        full_receipt["receipt_path"] = str(receipt_path)
        print(
            f"[CheckBook] Receipt emitted: {receipt_path} "
            f"scenario={pod_summary.get('scenario_verdict', '?')}",
            flush=True,
        )
        return full_receipt


# ── Module-level session registry ─────────────────────────────────────────────

_active_sessions: Dict[str, CheckBookSession] = {}


def arm_session(
    session_id: str,
    pod_id: str = "",
    bean_sequence: Optional[List[str]] = None,
    agent: str = "Knight",
    context_pct: Optional[float] = None,
    enable_shutterbug: bool = True,
) -> CheckBookSession:
    """
    Arm a CheckBook session. Called from vine_transfer_hook.py at session start.
    Returns the CheckBookSession for further use.
    """
    if session_id in _active_sessions:
        return _active_sessions[session_id]

    session = CheckBookSession(
        session_id=session_id,
        pod_id=pod_id,
        bean_sequence=bean_sequence,
        agent=agent,
        enable_shutterbug=enable_shutterbug,
    )
    session.arm(context_pct=context_pct)
    _active_sessions[session_id] = session
    return session


def get_active_session(session_id: str) -> Optional[CheckBookSession]:
    """Retrieve an active CheckBook session by ID."""
    return _active_sessions.get(session_id)


def close_session(
    session_id: str, context_pct_final: Optional[float] = None
) -> Optional[Dict[str, Any]]:
    """Close a CheckBook session and emit receipt. Returns receipt dict."""
    session = _active_sessions.pop(session_id, None)
    if session is None:
        return None
    return session.close(context_pct_final=context_pct_final)
