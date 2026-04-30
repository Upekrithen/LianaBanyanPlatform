"""
Accountant Scribe MVP — KN029 / A&A #2304 / BP003

Reconciliation engine that matches Liner Notes (KN027) + Shutterbug captures
(KN028) + KN012 context snapshots to produce the CheckBook ledger.

The "balance the checkbook" metaphor:
  Step 1: Gather receipts (liner notes, screenshots, context snapshots)
  Step 2: Match receipts to categories (beans, phases)
  Step 3: Compute the balance (measured_pp per bean)
  Step 4: Spot patterns (residual_pp, scenario verdict)

Usage:
    scribe = AccountantScribe(session_id="BP003-K", pod_id="Pod-K")
    paths = scribe.reconcile_and_write()
    # → CSV + JSONL + Markdown at accountant/sessions/BP003-K_checkbook.*

Or from pre-loaded data:
    from accountant import AccountantScribe
    scribe = AccountantScribe.from_records(session_id, liner_notes, shutterbug, kn012)
    rows, summary = scribe.reconcile()

Toolsmith log: TS-ACCOUNTANT-SCRIBE-KN029-BP003
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .reconciliation_engine import ReconciliationEngine, BeanLedgerRow
from .ledger_writer import write_all, load_ledger_jsonl


class AccountantScribe:
    """
    Session-scoped Accountant Scribe.

    Orchestrates ReconciliationEngine + LedgerWriter to produce the
    CheckBook ledger artifact. Guaranteed non-raising.
    """

    def __init__(
        self,
        session_id: str,
        pod_id: str = "",
        liner_notes_records: Optional[List[Dict[str, Any]]] = None,
        shutterbug_records: Optional[List[Dict[str, Any]]] = None,
        kn012_snapshot_records: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        self.session_id = session_id
        self.pod_id = pod_id
        self._liner_notes = liner_notes_records
        self._shutterbug = shutterbug_records
        self._kn012 = kn012_snapshot_records
        self._rows: Optional[List[BeanLedgerRow]] = None
        self._summary: Optional[Dict[str, Any]] = None

    @classmethod
    def from_disk(cls, session_id: str, pod_id: str = "") -> "AccountantScribe":
        """Load all sources from Stone Tablets on disk. Non-raising."""
        return cls(session_id=session_id, pod_id=pod_id)

    @classmethod
    def from_records(
        cls,
        session_id: str,
        pod_id: str = "",
        liner_notes: Optional[List[Dict[str, Any]]] = None,
        shutterbug: Optional[List[Dict[str, Any]]] = None,
        kn012: Optional[List[Dict[str, Any]]] = None,
    ) -> "AccountantScribe":
        """Construct from pre-loaded records (useful for tests)."""
        return cls(
            session_id=session_id,
            pod_id=pod_id,
            liner_notes_records=liner_notes,
            shutterbug_records=shutterbug,
            kn012_snapshot_records=kn012,
        )

    def reconcile(self) -> Tuple[List[BeanLedgerRow], Dict[str, Any]]:
        """
        Run reconciliation. Returns (rows, pod_summary).
        Caches result — subsequent calls return the same data.
        """
        if self._rows is not None and self._summary is not None:
            return self._rows, self._summary

        try:
            if self._liner_notes is not None:
                engine = ReconciliationEngine(
                    session_id=self.session_id,
                    pod_id=self.pod_id,
                    liner_notes_records=self._liner_notes,
                    shutterbug_records=self._shutterbug or [],
                    kn012_snapshot_records=self._kn012 or [],
                )
            else:
                engine = ReconciliationEngine.from_session(
                    session_id=self.session_id, pod_id=self.pod_id
                )

            self._rows = engine.reconcile()
            self._summary = engine.compute_pod_summary(self._rows)

        except Exception as exc:
            print(f"[Accountant] Reconciliation error: {exc}", file=sys.stderr)
            self._rows = []
            self._summary = {
                "session_id": self.session_id,
                "pod_id": self.pod_id,
                "error": str(exc),
                "total_beans": 0,
                "scenario_verdict": "error",
            }

        return self._rows, self._summary

    def reconcile_and_write(self) -> Dict[str, Any]:
        """
        Reconcile + write all three ledger formats to Stone Tablet.

        Returns dict with:
          - rows: list of row dicts
          - pod_summary: aggregate dict
          - paths: {csv, jsonl, markdown} paths
          - row_count: int
        """
        rows, summary = self.reconcile()

        try:
            paths = write_all(
                session_id=self.session_id,
                rows=rows,
                pod_summary=summary,
            )
            paths_str = {fmt: str(p) for fmt, p in paths.items()}
        except Exception as exc:
            print(f"[Accountant] Ledger write error: {exc}", file=sys.stderr)
            paths_str = {}

        print(
            f"[Accountant] Ledger written: session={self.session_id} "
            f"rows={len(rows)} scenario={summary.get('scenario_verdict', '?')} "
            f"measured_pp={summary.get('total_measured_pp', '?')}",
            flush=True,
        )

        return {
            "session_id": self.session_id,
            "rows": [r.to_dict() for r in rows],
            "pod_summary": summary,
            "paths": paths_str,
            "row_count": len(rows),
        }

    def get_ledger(self) -> List[Dict[str, Any]]:
        """Load existing ledger JSONL from disk. Returns empty list if not found."""
        return load_ledger_jsonl(self.session_id)

    def print_receipt(self) -> str:
        """Format a compact human-readable receipt for terminal display."""
        rows, summary = self.reconcile()
        lines = [
            f"+== CheckBook Receipt -- {self.session_id} {'=' * 20}",
            f"|  Pod: {self.pod_id}  Beans: {summary.get('total_beans', 0)}  "
            f"Landed: {summary.get('beans_landed', 0)}",
            f"|  Scenario: {summary.get('scenario_verdict', '?')}  "
            f"Predicted: {summary.get('total_predicted_pp', 0):.1f}pp  "
            f"Measured: {summary.get('total_measured_pp') or '?'}pp",
            f"|  Mean/bean: {summary.get('mean_pp_per_bean') or '?'}pp",
            f"|  Notes: {summary.get('total_liner_notes', 0)}  "
            f"Brainscans: {summary.get('total_brainscans', 0)}  "
            f"Screenshots: {summary.get('total_screenshots', 0)}",
            "+== Per-Bean ======================================================",
        ]
        for row in rows:
            mp = f"{row.measured_pp:.2f}pp" if isinstance(row.measured_pp, float) and row.measured_pp else "?"
            pp = f"{row.predicted_pp:.1f}pp" if row.predicted_pp else "-"
            lines.append(
                f"|  {row.bean_id:15s} {row.bean_class:12s} ctx: "
                f"{row.context_pct_before or '?':>5}->{row.context_pct_after or '?':<5} "
                f"measured={mp} predicted={pp} outcome={row.outcome}"
            )
        lines.append("+" + "=" * 54)
        receipt = "\n".join(lines)
        try:
            print(receipt, flush=True)
        except UnicodeEncodeError:
            # Windows cp1252: replace box-drawing chars with ASCII equivalents
            ascii_receipt = receipt.replace("╔", "+").replace("║", "|").replace("╠", "+").replace("╚", "+").replace("═", "=")
            print(ascii_receipt, flush=True)
        return receipt
