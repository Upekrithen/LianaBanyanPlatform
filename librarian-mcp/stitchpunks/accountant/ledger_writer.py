"""
Ledger Writer — KN029 Component 2

Writes the CheckBook ledger in three formats:
  - CSV:      accountant/sessions/<session_id>_checkbook.csv
  - JSONL:    accountant/sessions/<session_id>_checkbook.jsonl
  - Markdown: accountant/sessions/<session_id>_checkbook.md

Stone Tablet: all writes are fsync'd.

Toolsmith log: TS-ACCOUNTANT-SCRIBE-KN029-BP003
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .reconciliation_engine import BeanLedgerRow

_SESSIONS_DIR = Path(__file__).parent / "sessions"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _get_session_stem(session_id: str) -> Path:
    """Get stem path for all ledger formats for a session."""
    _SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    safe = session_id.replace("/", "_").replace("\\", "_").replace(":", "-")
    return _SESSIONS_DIR / f"{safe}_checkbook"


def _fsync_write(path: Path, content: str) -> None:
    """Atomic write with fsync. Writes to .tmp then replaces."""
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8", newline="\n") as fh:
        fh.write(content)
        fh.flush()
        os.fsync(fh.fileno())
    os.replace(str(tmp), str(path))


def write_csv(session_id: str, rows: List[BeanLedgerRow]) -> Path:
    """Write CheckBook ledger as CSV. Returns path."""
    path = _get_session_stem(session_id).with_suffix(".csv")
    lines = [BeanLedgerRow.csv_header()]
    lines.extend(row.to_csv_row() for row in rows)
    _fsync_write(path, "\n".join(lines) + "\n")
    return path


def write_jsonl(
    session_id: str,
    rows: List[BeanLedgerRow],
    pod_summary: Optional[Dict[str, Any]] = None,
) -> Path:
    """Write CheckBook ledger as JSONL. Returns path."""
    path = _get_session_stem(session_id).with_suffix(".jsonl")
    lines = []
    for row in rows:
        record = {"type": "checkbook_row", **row.to_dict()}
        lines.append(json.dumps(record, ensure_ascii=False))
    if pod_summary:
        lines.append(json.dumps({"type": "pod_summary", **pod_summary}, ensure_ascii=False))
    _fsync_write(path, "\n".join(lines) + "\n")
    return path


def write_markdown(
    session_id: str,
    rows: List[BeanLedgerRow],
    pod_summary: Optional[Dict[str, Any]] = None,
) -> Path:
    """Write CheckBook ledger as Markdown table. Returns path."""
    path = _get_session_stem(session_id).with_suffix(".md")

    lines = [
        f"# CheckBook Ledger — {session_id}",
        f"_Generated: {_iso_now()}_",
        "",
        "## Per-Bean Table",
        "",
        BeanLedgerRow.md_header(),
    ]
    for row in rows:
        lines.append(row.to_md_row())

    if pod_summary:
        lines.extend([
            "",
            "## Pod Summary",
            "",
            f"| Metric | Value |",
            f"|--------|-------|",
        ])
        for k, v in pod_summary.items():
            if k in ("session_id", "pod_id"):
                continue
            formatted_v = f"{v:.2f}pp" if isinstance(v, float) and "pp" in k else str(v)
            lines.append(f"| {k} | {formatted_v} |")

        scenario = pod_summary.get("scenario_verdict", "unknown")
        lines.extend([
            "",
            f"**Scenario verdict: {scenario}**",
            "",
            "| Scenario | Meaning |",
            "|----------|---------|",
            "| A | Confirmed — all beans landed, within prediction |",
            "| B | Partial — some deviation from prediction |",
            "| C | Falsified — deferral or significant over-prediction |",
        ])

    _fsync_write(path, "\n".join(lines) + "\n")
    return path


def write_all(
    session_id: str,
    rows: List[BeanLedgerRow],
    pod_summary: Optional[Dict[str, Any]] = None,
) -> Dict[str, Path]:
    """Write CSV + JSONL + Markdown. Returns dict of {format: path}."""
    return {
        "csv": write_csv(session_id, rows),
        "jsonl": write_jsonl(session_id, rows, pod_summary),
        "markdown": write_markdown(session_id, rows, pod_summary),
    }


def load_ledger_jsonl(session_id: str) -> List[Dict[str, Any]]:
    """Load the JSONL ledger for a session."""
    path = _get_session_stem(session_id).with_suffix(".jsonl")
    if not path.exists():
        return []
    records = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return records


def list_ledger_sessions() -> List[str]:
    """List session IDs with existing ledgers."""
    if not _SESSIONS_DIR.exists():
        return []
    sessions = []
    for p in sorted(_SESSIONS_DIR.iterdir()):
        if p.suffix == ".jsonl" and "_checkbook" in p.stem:
            sid = p.stem.replace("_checkbook", "")
            sessions.append(sid)
    return sessions
