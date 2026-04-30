"""
Tests — KN029 Accountant Scribe MVP
Phase D trust-but-verify gate.

Run: python -m pytest librarian-mcp/stitchpunks/accountant/tests_kn029.py -v

Tests cover:
  1. BeanLedgerRow: fields / compute_derived / CSV / JSONL / Markdown
  2. ReconciliationEngine: from pre-loaded records / bean attribution
  3. ReconciliationEngine: session position classification
  4. ReconciliationEngine: pod summary computation / scenario verdicts
  5. LedgerWriter: write CSV / JSONL / Markdown / write_all round-trip
  6. LedgerWriter: load_ledger_jsonl
  7. AccountantScribe: from_records / reconcile / reconcile_and_write
  8. Graceful degradation: missing sources

Toolsmith log: TS-ACCOUNTANT-SCRIBE-KN029-BP003
"""

from __future__ import annotations

import csv
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE.parent.parent))
sys.path.insert(0, str(_HERE.parent))


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ts(offset_s: float = 0.0) -> str:
    """ISO timestamp with optional offset from epoch."""
    from datetime import datetime, timezone, timedelta
    dt = datetime(2026, 4, 30, 12, 0, 0, tzinfo=timezone.utc) + timedelta(seconds=offset_s)
    return dt.isoformat().replace("+00:00", "Z")


def _make_liner_notes(beans: List[str]) -> List[Dict[str, Any]]:
    """Build minimal Liner Notes for a bean sequence."""
    records = [{
        "type": "session_open",
        "session_id": "TEST",
        "pod_id": "Pod-TEST",
        "bean_sequence": beans,
        "wall_time_iso": _ts(0),
    }]
    t = 10.0
    ctx = 5.0
    for bean in beans:
        records.append({
            "type": "bean_start",
            "session_id": "TEST",
            "bean_id": bean,
            "bean_class": "medium",
            "predicted_pp": 12.0,
            "context_pct_before": ctx,
            "wall_time_iso": _ts(t),
        })
        t += 5
        records.append({
            "type": "liner_note",
            "session_id": "TEST",
            "bean_id": bean,
            "content": f"Thinking for {bean}",
            "wall_time_iso": _ts(t),
        })
        t += 2
        records.append({
            "type": "brainscan",
            "session_id": "TEST",
            "bean_id": bean,
            "brainscan_name": f"Brainscan-{bean}-Phase-C-design",
            "content": "Design decision reasoning...",
            "wall_time_iso": _ts(t),
        })
        t += 3
        ctx += 11.5
        records.append({
            "type": "bean_end",
            "session_id": "TEST",
            "bean_id": bean,
            "context_pct_after": ctx,
            "outcome": "landed",
            "files_changed": 5,
            "insertions": 80,
            "tests_passed": 10,
            "tests_total": 10,
            "wall_time_iso": _ts(t),
        })
        t += 5
    return records


@pytest.fixture()
def session_id():
    return "TEST-KN029-ACCT-001"


@pytest.fixture()
def tmp_sessions(tmp_path, monkeypatch):
    import accountant.ledger_writer as lw
    monkeypatch.setattr(lw, "_SESSIONS_DIR", tmp_path)
    return tmp_path


# ── BeanLedgerRow tests ───────────────────────────────────────────────────────

class TestBeanLedgerRow:
    def test_columns_defined(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        assert "bean_id" in BeanLedgerRow.COLUMNS
        assert "measured_pp" in BeanLedgerRow.COLUMNS
        assert "scenario_verdict" not in BeanLedgerRow.COLUMNS  # pod-level, not row

    def test_compute_derived_pp(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        row = BeanLedgerRow(
            bean_id="KN027", context_pct_before=5.0, context_pct_after=17.3,
            predicted_pp=12.0
        )
        row.compute_derived()
        assert row.measured_pp == pytest.approx(12.3, abs=0.01)
        assert row.residual_pp == pytest.approx(0.3, abs=0.01)

    def test_compute_derived_no_after(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        row = BeanLedgerRow(bean_id="KN027", context_pct_before=5.0, predicted_pp=12.0)
        row.compute_derived()
        assert row.measured_pp == 0.0

    def test_to_dict_has_all_columns(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        row = BeanLedgerRow(bean_id="KN027", session_id="TEST")
        d = row.to_dict()
        for col in BeanLedgerRow.COLUMNS:
            assert col in d

    def test_csv_header_row_consistent(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        row = BeanLedgerRow(bean_id="KN027", session_id="TEST", context_pct_before=5.0, context_pct_after=17.3)
        row.compute_derived()
        header = BeanLedgerRow.csv_header()
        data_row = row.to_csv_row()
        header_cols = header.split(",")
        data_cols = list(csv.reader([data_row]))[0]
        assert len(header_cols) == len(data_cols)

    def test_md_row_pipe_delimited(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        row = BeanLedgerRow(bean_id="KN027", measured_pp=12.3, predicted_pp=12.0, residual_pp=0.3)
        md = row.to_md_row()
        assert md.startswith("| ")
        assert md.endswith(" |")

    def test_md_header_has_separator(self):
        from accountant.reconciliation_engine import BeanLedgerRow
        header = BeanLedgerRow.md_header()
        lines = header.split("\n")
        assert len(lines) == 2
        assert "---" in lines[1]


# ── ReconciliationEngine tests ────────────────────────────────────────────────

class TestReconciliationEngine:
    def test_reconcile_single_bean(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        liner = _make_liner_notes(["KN027"])
        engine = ReconciliationEngine(
            session_id="TEST", pod_id="Pod-K", liner_notes_records=liner
        )
        rows = engine.reconcile()
        assert len(rows) == 1
        assert rows[0].bean_id == "KN027"
        assert rows[0].measured_pp == pytest.approx(11.5, abs=0.01)

    def test_reconcile_multi_bean_ordering(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        liner = _make_liner_notes(["KN027", "KN028", "KN029"])
        engine = ReconciliationEngine(session_id="TEST", liner_notes_records=liner)
        rows = engine.reconcile()
        assert [r.bean_id for r in rows] == ["KN027", "KN028", "KN029"]

    def test_reconcile_counts_liner_notes(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        liner = _make_liner_notes(["KN027"])
        engine = ReconciliationEngine(session_id="TEST", liner_notes_records=liner)
        rows = engine.reconcile()
        assert rows[0].liner_notes_count == 1
        assert rows[0].brainscans_count == 1

    def test_session_position_classification(self):
        from accountant.reconciliation_engine import _classify_session_position
        assert _classify_session_position(0, 3) == "pod_first"
        assert _classify_session_position(1, 3) == "pod_middle"
        assert _classify_session_position(2, 3) == "pod_last"
        assert _classify_session_position(0, 1) == "pod_first"

    def test_pod_summary_scenario_a(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        liner = _make_liner_notes(["KN027", "KN028"])
        engine = ReconciliationEngine(session_id="TEST", pod_id="Pod-K", liner_notes_records=liner)
        rows = engine.reconcile()
        summary = engine.compute_pod_summary(rows)
        assert summary["total_beans"] == 2
        assert summary["beans_landed"] == 2
        assert summary["scenario_verdict"] in ("A", "B", "C")

    def test_pod_summary_aggregates(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        liner = _make_liner_notes(["KN027", "KN028", "KN029"])
        engine = ReconciliationEngine(session_id="TEST", liner_notes_records=liner)
        rows = engine.reconcile()
        summary = engine.compute_pod_summary(rows)
        assert summary["total_liner_notes"] == 3
        assert summary["total_brainscans"] == 3

    def test_reconcile_empty_liner_notes(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        engine = ReconciliationEngine(session_id="TEST", liner_notes_records=[])
        rows = engine.reconcile()
        assert rows == []

    def test_reconcile_counts_screenshots_by_bean_id(self):
        from accountant.reconciliation_engine import ReconciliationEngine
        liner = _make_liner_notes(["KN027"])
        shutterbug = [
            {"bean_id": "KN027", "threshold": 10.0, "captured_at": _ts(15)},
            {"bean_id": "KN027", "threshold": 20.0, "captured_at": _ts(20)},
            {"bean_id": "KN028", "threshold": 30.0, "captured_at": _ts(25)},
        ]
        engine = ReconciliationEngine(
            session_id="TEST", liner_notes_records=liner, shutterbug_records=shutterbug
        )
        rows = engine.reconcile()
        assert rows[0].screenshots_count == 2  # KN027's only


# ── LedgerWriter tests ────────────────────────────────────────────────────────

class TestLedgerWriter:
    def test_write_csv_creates_file(self, tmp_sessions, session_id):
        from accountant.reconciliation_engine import BeanLedgerRow
        from accountant.ledger_writer import write_csv, load_ledger_jsonl
        rows = [
            BeanLedgerRow(
                bean_id="KN027", session_id=session_id, context_pct_before=5.0,
                context_pct_after=17.3, predicted_pp=12.0, outcome="landed"
            )
        ]
        rows[0].compute_derived()
        path = write_csv(session_id, rows)
        assert path.exists()
        content = path.read_text()
        assert "bean_id" in content  # header
        assert "KN027" in content

    def test_write_jsonl_round_trip(self, tmp_sessions, session_id):
        from accountant.reconciliation_engine import BeanLedgerRow
        from accountant.ledger_writer import write_jsonl, load_ledger_jsonl
        rows = [BeanLedgerRow(bean_id="KN027", session_id=session_id, outcome="landed")]
        write_jsonl(session_id, rows, pod_summary={"scenario_verdict": "A", "total_beans": 1})
        records = load_ledger_jsonl(session_id)
        assert len(records) == 2  # 1 row + 1 summary
        assert records[0]["type"] == "checkbook_row"
        assert records[0]["bean_id"] == "KN027"
        assert records[1]["type"] == "pod_summary"
        assert records[1]["scenario_verdict"] == "A"

    def test_write_markdown_contains_table(self, tmp_sessions, session_id):
        from accountant.reconciliation_engine import BeanLedgerRow
        from accountant.ledger_writer import write_markdown
        rows = [BeanLedgerRow(bean_id="KN027", session_id=session_id, measured_pp=12.3)]
        path = write_markdown(session_id, rows, pod_summary={"scenario_verdict": "A", "total_beans": 1})
        content = path.read_text()
        assert "# CheckBook Ledger" in content
        assert "bean_id" in content
        assert "KN027" in content
        assert "Scenario verdict" in content

    def test_write_all_returns_three_paths(self, tmp_sessions, session_id):
        from accountant.reconciliation_engine import BeanLedgerRow
        from accountant.ledger_writer import write_all
        rows = [BeanLedgerRow(bean_id="KN027", session_id=session_id)]
        paths = write_all(session_id, rows)
        assert set(paths.keys()) == {"csv", "jsonl", "markdown"}
        for p in paths.values():
            assert p.exists()

    def test_load_missing_ledger_returns_empty(self, tmp_sessions):
        from accountant.ledger_writer import load_ledger_jsonl
        assert load_ledger_jsonl("MISSING-999") == []

    def test_list_ledger_sessions(self, tmp_sessions, session_id):
        from accountant.reconciliation_engine import BeanLedgerRow
        from accountant.ledger_writer import write_jsonl, list_ledger_sessions
        write_jsonl(session_id, [BeanLedgerRow(bean_id="KN027", session_id=session_id)])
        sessions = list_ledger_sessions()
        assert session_id in sessions


# ── AccountantScribe tests ────────────────────────────────────────────────────

class TestAccountantScribe:
    def test_from_records_reconcile(self, tmp_sessions, session_id):
        from accountant.accountant_scribe import AccountantScribe
        liner = _make_liner_notes(["KN027", "KN028"])
        scribe = AccountantScribe.from_records(session_id, pod_id="Pod-K", liner_notes=liner)
        rows, summary = scribe.reconcile()
        assert len(rows) == 2
        assert summary["total_beans"] == 2

    def test_reconcile_and_write(self, tmp_sessions, session_id):
        from accountant.accountant_scribe import AccountantScribe
        liner = _make_liner_notes(["KN027"])
        scribe = AccountantScribe.from_records(session_id, pod_id="Pod-K", liner_notes=liner)
        result = scribe.reconcile_and_write()
        assert result["row_count"] == 1
        assert "paths" in result
        assert len(result["paths"]) == 3

    def test_reconcile_caches(self, tmp_sessions, session_id):
        from accountant.accountant_scribe import AccountantScribe
        liner = _make_liner_notes(["KN027"])
        scribe = AccountantScribe.from_records(session_id, liner_notes=liner)
        rows1, _ = scribe.reconcile()
        rows2, _ = scribe.reconcile()
        assert rows1 is rows2  # same object (cached)

    def test_graceful_degradation_empty(self, tmp_sessions, session_id):
        from accountant.accountant_scribe import AccountantScribe
        scribe = AccountantScribe.from_records(session_id, liner_notes=[])
        rows, summary = scribe.reconcile()
        assert rows == []
        assert summary["total_beans"] == 0

    def test_print_receipt_non_raising(self, tmp_sessions, session_id, capsys):
        from accountant.accountant_scribe import AccountantScribe
        liner = _make_liner_notes(["KN027"])
        scribe = AccountantScribe.from_records(session_id, pod_id="Pod-K", liner_notes=liner)
        receipt = scribe.print_receipt()
        assert isinstance(receipt, str)
        assert "CheckBook Receipt" in receipt


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
