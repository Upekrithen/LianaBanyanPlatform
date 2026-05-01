"""
KN091 In-Concert Protocol — Conflict Audit
===========================================
Periodic content-hash audit across all canonical Eblets.

Detects divergence between an organism's local Eblet view and the canonical
Iron Tablet (KN089).  Stone Tablet ledger is always authoritative.

Divergence resolution:
  1. Stone Tablet ledger is the canonical trump (Stone Tablet Imperative).
  2. ConflictReport is emitted and flagged surface_at_session_open=True.
  3. Reconciliation: caller reads canonical hash from ledger and re-syncs.

Deadlock-impossible: Stone Tablet is append-only (no mutex required for reads).

KN091 / BP011 Pod W Bean 3.
"""

from __future__ import annotations

import hashlib
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from lb_frame_handshake.concert.types import ConflictReport
from lb_frame_handshake.concert.furnace_cross_org import (
    emit_conflict_report,
    load_conflict_reports,
)


_CONFLICT_LOG_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/concert_conflict_reports.jsonl"
))


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# ── Iron Tablet canonical hash query ─────────────────────────────────────────

def _get_canonical_hash_from_iron_tablet(
    eblet_path: str,
) -> Optional[tuple[str, int]]:
    """
    Read the canonical hash + sequence from the Iron Tablet Stone ledger for an Eblet.
    Returns (hash, sequence) or None if no ledger entry exists.

    Reads iron_tablet_ledger.jsonl written by KN089 TS layer (co-located with Eblet).
    """
    eblet = Path(os.path.expanduser(eblet_path))
    ledger_path = eblet.parent / "iron_tablet_ledger.jsonl"

    if not ledger_path.exists():
        return None

    latest_hash: Optional[str] = None
    latest_seq = -1

    with open(ledger_path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                if entry.get("ebletPath") == str(eblet):
                    seq = entry.get("sequence", -1)
                    if seq > latest_seq:
                        latest_seq = seq
                        latest_hash = entry.get("hash")
            except (json.JSONDecodeError, TypeError):
                pass

    if latest_hash is not None:
        return latest_hash, latest_seq
    return None


# ── Audit primitives ──────────────────────────────────────────────────────────

def audit_eblet(
    eblet_path: str,
    local_hash: str,
    scribe_id: str,
    conflict_log_path: Optional[Path] = None,
) -> Optional[ConflictReport]:
    """
    Audit a single Eblet: compare local_hash against canonical Iron Tablet hash.

    Returns ConflictReport if divergence detected, None if clean or no canonical record.
    On divergence: emits ConflictReport (append-only) and returns it.
    Stone Tablet ledger is always the trump — the report instructs the caller to
    re-sync from the canonical sequence.
    """
    result = _get_canonical_hash_from_iron_tablet(eblet_path)
    if result is None:
        return None

    canonical_hash, stone_seq = result

    if local_hash == canonical_hash:
        return None  # Clean

    report = ConflictReport(
        audit_id=str(uuid.uuid4()),
        scribe_id=scribe_id,
        eblet_path=eblet_path,
        local_hash=local_hash,
        canonical_hash=canonical_hash,
        stone_sequence=stone_seq,
        resolution="stone_canonical",
        detected_at=_iso_now(),
        surface_at_session_open=True,
    )
    emit_conflict_report(report, log_path=conflict_log_path)
    return report


def audit_directory(
    directory: str,
    scribe_id: str,
    conflict_log_path: Optional[Path] = None,
) -> list[ConflictReport]:
    """
    Audit all .eblet.md files in a directory against canonical Iron Tablet hashes.
    Returns list of ConflictReports (empty if all clean).
    """
    reports: list[ConflictReport] = []
    d = Path(os.path.expanduser(directory))
    if not d.is_dir():
        return reports

    for eblet_file in d.rglob("*.eblet.md"):
        try:
            local_content = eblet_file.read_text(encoding="utf-8")
            local_hash = _content_hash(local_content)
            report = audit_eblet(
                eblet_path=str(eblet_file),
                local_hash=local_hash,
                scribe_id=scribe_id,
                conflict_log_path=conflict_log_path,
            )
            if report:
                reports.append(report)
        except OSError:
            pass

    return reports


# ── Report surface ────────────────────────────────────────────────────────────

def load_open_conflict_reports(
    conflict_log_path: Optional[Path] = None,
) -> list[ConflictReport]:
    """
    Load ConflictReports that are flagged for surface at session-open.
    Returns all reports in chronological order.
    """
    all_reports = load_conflict_reports(conflict_log_path)
    return [r for r in all_reports if r.surface_at_session_open]


def reconcile_eblet(eblet_path: str) -> bool:
    """
    Check whether a canonical Iron Tablet record exists for this Eblet path,
    confirming reconciliation is possible.

    Returns True if a canonical record exists (caller should use ironTabletRead
    from KN089 TS layer to actually re-sync the Eblet content).
    Returns False if no canonical record exists.

    Note: Actual content repair requires the KN089 TS ironTabletRead API.
    This function is the Python-side pre-flight check.
    """
    return _get_canonical_hash_from_iron_tablet(eblet_path) is not None
